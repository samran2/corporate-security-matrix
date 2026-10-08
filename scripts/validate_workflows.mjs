#!/usr/bin/env node

import { readFileSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(SCRIPT_DIR, "..");
const MANIFEST = JSON.parse(readFileSync(resolve(SCRIPT_DIR, "site-manifest.json"), "utf8"));
const WORKFLOW_DIR = resolve(ROOT, ".github", "workflows");

function loadWorkflows() {
  return Object.fromEntries(
    readdirSync(WORKFLOW_DIR)
      .filter((file) => /\.ya?ml$/i.test(file))
      .sort()
      .map((file) => [file, readFileSync(resolve(WORKFLOW_DIR, file), "utf8")]),
  );
}

function requireMatch(errors, file, text, pattern, contract) {
  if (!pattern.test(text)) errors.push(`${file} does not enforce ${contract}.`);
}

function isActionMappingLine(line) {
  const key = String.raw`(?:uses|"uses"|'uses')`;
  return new RegExp(String.raw`^(?: {4}${key}\s*:| {6,8}-\s*${key}\s*:| {8}${key}\s*:)`).test(line);
}

function actionReferences(line) {
  if (!isActionMappingLine(line)) return [];
  const key = String.raw`(?:uses|"uses"|'uses')`;
  const value = String.raw`(?:"([^"\r\n]+)"|'([^'\r\n]+)'|([^\s#,{}]+))`;
  const block = line.match(new RegExp(String.raw`^\s*(?:-\s*)?${key}\s*:\s*${value}\s*(?:#.*)?$`));
  if (block) return [block[1] || block[2] || block[3]];

  const trimmed = line.trim();
  if (!/^-\s*\{.*\}\s*(?:#.*)?$/.test(trimmed)) return [];
  const content = trimmed.replace(/^-\s*\{/, "").replace(/\}\s*(?:#.*)?$/, "");
  const pattern = new RegExp(String.raw`(?:^|,)\s*${key}\s*:\s*${value}`, "g");
  return [...content.matchAll(pattern)].map((match) => match[1] || match[2] || match[3]);
}

function stripYamlComment(line) {
  let quote = null;
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (quote === "double") {
      if (character === "\\") index += 1;
      else if (character === '"') quote = null;
      continue;
    }
    if (quote === "single") {
      if (character === "'" && line[index + 1] === "'") index += 1;
      else if (character === "'") quote = null;
      continue;
    }
    if (character === '"') quote = "double";
    else if (character === "'") quote = "single";
    else if (character === "#" && (index === 0 || /\s/.test(line[index - 1]))) return line.slice(0, index);
  }
  return line;
}

function hasUnterminatedQuotedScalar(line) {
  const withoutComment = stripYamlComment(line);
  let quote = null;
  for (let index = 0; index < withoutComment.length; index += 1) {
    const character = withoutComment[index];
    if (quote === "double") {
      if (character === "\\") index += 1;
      else if (character === '"') quote = null;
      continue;
    }
    if (quote === "single") {
      if (character === "'" && withoutComment[index + 1] === "'") index += 1;
      else if (character === "'") quote = null;
      continue;
    }
    if (character === '"') quote = "double";
    else if (character === "'") quote = "single";
  }
  return quote !== null;
}

function structuralWorkflowLines(text) {
  const lines = [];
  let blockScalarKeyColumn = null;
  for (const line of text.split(/\r?\n/)) {
    const indent = line.match(/^ */)[0].length;
    if (blockScalarKeyColumn !== null) {
      if (line.trim() === "" || indent > blockScalarKeyColumn) continue;
      blockScalarKeyColumn = null;
    }
    lines.push(line);
    if (
      /^\s*(?:-\s+)?[A-Za-z_][A-Za-z0-9_-]*\s*:\s*[|>](?:[1-9][+-]?|[+-][1-9]?)?\s*(?:#.*)?$/.test(line)
    ) {
      let keyColumn = line.search(/\S/);
      if (line[keyColumn] === "-") {
        keyColumn += 1;
        while (line[keyColumn] === " ") keyColumn += 1;
      }
      blockScalarKeyColumn = keyColumn;
    }
  }
  return lines;
}

function structuralWorkflowText(text) {
  return structuralWorkflowLines(text)
    .filter((line) => !/^\s*#/.test(line))
    .map((line) => stripYamlComment(line).trimEnd())
    .filter((line) => line.trim() !== "")
    .join("\n");
}

function workflowJobBlocks(text, jobName) {
  const lines = structuralWorkflowText(text).split("\n");
  const blocks = [];
  let insideJobs = false;
  let currentJob = null;
  let currentLines = [];

  const finishCurrentJob = () => {
    if (currentJob === jobName) blocks.push(currentLines.join("\n"));
    currentJob = null;
    currentLines = [];
  };

  for (const line of lines) {
    const indent = line.match(/^ */)[0].length;
    if (!insideJobs) {
      if (indent === 0 && line === "jobs:") insideJobs = true;
      continue;
    }
    if (indent === 0) {
      finishCurrentJob();
      insideJobs = false;
      continue;
    }
    const job = line.match(/^  ([A-Za-z_][A-Za-z0-9_-]*):$/);
    if (job) {
      finishCurrentJob();
      currentJob = job[1];
      currentLines = [line];
      continue;
    }
    if (currentJob !== null) currentLines.push(line);
  }
  finishCurrentJob();
  return blocks;
}

function requireJobStructure(errors, file, text, jobName) {
  const blocks = workflowJobBlocks(text, jobName);
  if (blocks.length !== 1) {
    errors.push(`${file} must define exactly one canonical jobs.${jobName} mapping.`);
    return "";
  }
  return blocks[0];
}

function rawWorkflowJobBlocks(text, jobName) {
  const lines = text.split(/\r?\n/);
  const blocks = [];
  let insideJobs = false;
  let currentJob = null;
  let currentLines = [];

  const finishCurrentJob = () => {
    if (currentJob === jobName) blocks.push(currentLines.join("\n"));
    currentJob = null;
    currentLines = [];
  };

  for (const rawLine of lines) {
    const line = stripYamlComment(rawLine).trimEnd();
    const indent = line.match(/^ */)[0].length;
    if (!insideJobs) {
      if (line === "jobs:") insideJobs = true;
      continue;
    }
    if (line.trim() !== "" && indent === 0) {
      finishCurrentJob();
      insideJobs = false;
      continue;
    }
    const job = line.match(/^  ([A-Za-z_][A-Za-z0-9_-]*):$/);
    if (job) {
      finishCurrentJob();
      currentJob = job[1];
      currentLines = [rawLine];
      continue;
    }
    if (currentJob !== null) currentLines.push(rawLine);
  }
  finishCurrentJob();
  return blocks;
}

function requireRawJobStructure(errors, file, text, jobName) {
  const blocks = rawWorkflowJobBlocks(text, jobName);
  if (blocks.length !== 1) {
    errors.push(`${file} must define exactly one executable jobs.${jobName} mapping.`);
    return "";
  }
  return blocks[0];
}

function rawWorkflowStepBlocks(jobBlock) {
  const lines = jobBlock.split("\n");
  const blocks = [];
  let insideSteps = false;
  let stepsDeclarations = 0;
  let currentLines = [];

  const finishCurrentStep = () => {
    if (currentLines.length > 0) blocks.push(currentLines.join("\n"));
    currentLines = [];
  };

  for (const rawLine of lines) {
    const line = stripYamlComment(rawLine).trimEnd();
    const indent = line.match(/^ */)[0].length;
    if (line === "    steps:") {
      stepsDeclarations += 1;
      if (!insideSteps) insideSteps = true;
      continue;
    }
    if (!insideSteps) continue;
    if (line.trim() !== "" && indent <= 4) {
      finishCurrentStep();
      insideSteps = false;
      continue;
    }
    if (/^      -\s+\S/.test(line)) {
      finishCurrentStep();
      currentLines = [rawLine];
      continue;
    }
    if (currentLines.length > 0) currentLines.push(rawLine);
  }
  finishCurrentStep();
  return stepsDeclarations === 1 ? blocks : [];
}

function stepFields(stepBlock) {
  const lines = stepBlock.split("\n");
  const fields = [];
  for (let index = 0; index < lines.length; index += 1) {
    const rawLine = lines[index];
    const line = stripYamlComment(rawLine).trimEnd();
    const match = line.match(/^      -\s+([A-Za-z_][A-Za-z0-9_-]*)\s*:\s*(.*)$/)
      || line.match(/^        ([A-Za-z_][A-Za-z0-9_-]*)\s*:\s*(.*)$/);
    if (!match) continue;
    const [, key, value] = match;
    const body = [];
    if (/^[|>](?:[1-9][+-]?|[+-][1-9]?)?$/.test(value)) {
      for (let bodyIndex = index + 1; bodyIndex < lines.length; bodyIndex += 1) {
        const bodyLine = lines[bodyIndex];
        const indent = bodyLine.match(/^ */)[0].length;
        if (bodyLine.trim() !== "" && indent <= 8) break;
        body.push(bodyLine);
      }
    }
    fields.push({ key, value, body });
  }
  return fields;
}

function stepFieldValues(stepBlock, key) {
  return stepFields(stepBlock).filter((field) => field.key === key);
}

function stepName(stepBlock) {
  const names = stepFieldValues(stepBlock, "name");
  return names.length === 1 && names[0].body.length === 0 ? names[0].value : null;
}

function deindentBlockLines(lines) {
  const nonEmpty = lines.filter((line) => line.trim() !== "");
  if (nonEmpty.length === 0) return [];
  const indent = Math.min(...nonEmpty.map((line) => line.match(/^ */)[0].length));
  return lines.map((line) => line.slice(Math.min(indent, line.length)));
}

function executableShellLines(stepBlock) {
  const runFields = stepFieldValues(stepBlock, "run");
  if (runFields.length !== 1) return null;
  const run = runFields[0];
  let lines;
  if (run.body.length > 0) {
    if (!/^\|(?:[1-9][+-]?|[+-][1-9]?)?$/.test(run.value)) return null;
    lines = deindentBlockLines(run.body);
  } else {
    if (run.value === "") return null;
    lines = [run.value];
  }

  const executable = [];
  let hereDocumentEnd = null;
  for (const rawLine of lines) {
    if (hereDocumentEnd !== null) {
      if (rawLine.trim() === hereDocumentEnd) hereDocumentEnd = null;
      continue;
    }
    const line = stripYamlComment(rawLine).trimEnd();
    if (line.trim() === "") continue;
    const hereDocument = line.match(/<<-?\s*(['"]?)([A-Za-z_][A-Za-z0-9_]*)\1/);
    if (hereDocument) hereDocumentEnd = hereDocument[2];
    executable.push(line);
  }
  return hereDocumentEnd === null ? executable : null;
}

function requireNamedStep(errors, file, jobBlock, name, contract) {
  const matches = rawWorkflowStepBlocks(jobBlock).filter((step) => stepName(step) === name);
  if (matches.length !== 1) {
    errors.push(`${file} does not enforce ${contract} in exactly one named executable step.`);
    return "";
  }
  return matches[0];
}

function requireCriticalStepSafety(errors, file, stepBlock, contract, allowed = {}) {
  for (const key of ["if", "continue-on-error", "working-directory"]) {
    const fields = stepFieldValues(stepBlock, key);
    const expected = allowed[key];
    if (expected === undefined && fields.length !== 0) {
      errors.push(`${file} ${contract} must not declare ${key}.`);
    } else if (expected !== undefined && (fields.length !== 1 || fields[0].value !== expected || fields[0].body.length !== 0)) {
      errors.push(`${file} ${contract} must use the canonical ${key} value.`);
    }
  }
}

function requireExactRunStep(errors, file, jobBlock, name, expectedLines, contract, options = {}) {
  const step = requireNamedStep(errors, file, jobBlock, name, contract);
  if (!step) return "";
  requireCriticalStepSafety(errors, file, step, contract, options.allowedFields || {});
  const allowedKeys = new Set(["name", "run", ...(options.allowedTopLevelFields || [])]);
  if (options.shell !== undefined) allowedKeys.add("shell");
  for (const key of Object.keys(options.allowedFields || {})) allowedKeys.add(key);
  const fields = stepFields(step);
  for (const field of fields) {
    if (!allowedKeys.has(field.key)) errors.push(`${file} ${contract} declares unsupported step key ${field.key}.`);
  }
  for (const key of allowedKeys) {
    if (fields.filter((field) => field.key === key).length > 1) {
      errors.push(`${file} ${contract} must not duplicate the ${key} step key.`);
    }
  }
  if (options.shell === undefined) {
    if (stepFieldValues(step, "shell").length !== 0) errors.push(`${file} ${contract} must not declare a custom shell.`);
  } else {
    const shells = stepFieldValues(step, "shell");
    if (shells.length !== 1 || shells[0].value !== options.shell || shells[0].body.length !== 0) {
      errors.push(`${file} ${contract} must use shell: ${options.shell}.`);
    }
  }
  const actualLines = executableShellLines(step);
  if (actualLines === null || JSON.stringify(actualLines) !== JSON.stringify(expectedLines)) {
    errors.push(`${file} ${contract} must execute only its canonical fail-closed command block.`);
  }
  if (options.exactStructurePattern && !options.exactStructurePattern.test(structuralWorkflowText(step))) {
    errors.push(`${file} ${contract} must use only its canonical step mapping.`);
  }
  return step;
}

function requireExactActionStep(errors, file, jobBlock, name, actionPattern, contract, options = {}) {
  const step = requireNamedStep(errors, file, jobBlock, name, contract);
  if (!step) return "";
  requireCriticalStepSafety(errors, file, step, contract);
  const allowedKeys = new Set(["name", "uses", ...Object.keys(options.fields || {})]);
  if ((options.structurePatterns || []).length > 0) allowedKeys.add("with");
  const stepFieldList = stepFields(step);
  for (const field of stepFieldList) {
    if (!allowedKeys.has(field.key)) errors.push(`${file} ${contract} declares unsupported step key ${field.key}.`);
  }
  for (const key of allowedKeys) {
    if (stepFieldList.filter((field) => field.key === key).length > 1) {
      errors.push(`${file} ${contract} must not duplicate the ${key} step key.`);
    }
  }
  if (stepFieldValues(step, "shell").length !== 0) errors.push(`${file} ${contract} must not declare a custom shell.`);
  const uses = stepFieldValues(step, "uses");
  if (uses.length !== 1 || uses[0].body.length !== 0 || !actionPattern.test(uses[0].value)) {
    errors.push(`${file} ${contract} must invoke exactly one canonical pinned action.`);
  }
  for (const [key, expected] of Object.entries(options.fields || {})) {
    const values = stepFieldValues(step, key);
    if (values.length !== 1 || values[0].value !== expected || values[0].body.length !== 0) {
      errors.push(`${file} ${contract} must define ${key}: ${expected}.`);
    }
  }
  for (const pattern of options.structurePatterns || []) {
    if (!pattern.test(structuralWorkflowText(step))) errors.push(`${file} ${contract} does not use its canonical action inputs.`);
  }
  if (options.exactStructurePattern && !options.exactStructurePattern.test(structuralWorkflowText(step))) {
    errors.push(`${file} ${contract} must use only its canonical action-step mapping.`);
  }
  return step;
}

function jobFieldValues(jobBlock, key) {
  return structuralWorkflowText(jobBlock)
    .split("\n")
    .map((line) => line.match(new RegExp(`^    ${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*:\\s*(.*)$`)))
    .filter(Boolean)
    .map((match) => match[1]);
}

function requireNoJobExecutionOverride(errors, file, jobBlock, jobName) {
  for (const key of ["if", "continue-on-error", "defaults", "env"]) {
    if (jobFieldValues(jobBlock, key).length !== 0) errors.push(`${file} jobs.${jobName} must not declare ${key}.`);
  }
}

function requireExactJobCondition(errors, file, jobBlock, jobName, expected) {
  const conditions = jobFieldValues(jobBlock, "if");
  if (conditions.length !== 1 || conditions[0] !== expected) {
    errors.push(`${file} jobs.${jobName} must use its canonical fail-closed condition.`);
  }
  for (const key of ["continue-on-error", "defaults", "env"]) {
    if (jobFieldValues(jobBlock, key).length !== 0) {
      errors.push(`${file} jobs.${jobName} must not declare ${key}.`);
    }
  }
}

function requireExactTopLevelBlock(errors, file, text, key, expected) {
  const lines = structuralWorkflowText(text).split("\n");
  const blocks = [];
  let current = [];
  for (const line of lines) {
    const indent = line.match(/^ */)[0].length;
    if (line === `${key}:`) {
      if (current.length > 0) blocks.push(current.join("\n"));
      current = [line];
      continue;
    }
    if (current.length > 0) {
      if (indent === 0) {
        blocks.push(current.join("\n"));
        current = [];
      } else {
        current.push(line);
      }
    }
  }
  if (current.length > 0) blocks.push(current.join("\n"));
  if (blocks.length !== 1 || blocks[0] !== expected) errors.push(`${file} must define only the canonical ${key} mapping.`);
}

function mappingKeysAtIndent(text, indent) {
  const prefix = " ".repeat(indent);
  return structuralWorkflowLines(text)
    .map((line) => stripYamlComment(line).trimEnd())
    .map((line) => line.match(new RegExp(`^${prefix}([A-Za-z_][A-Za-z0-9_-]*)\\s*:`)))
    .filter(Boolean)
    .map((match) => match[1]);
}

function requireExactMappingKeys(errors, file, text, indent, expected, contract) {
  const actual = mappingKeysAtIndent(text, indent);
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    errors.push(`${file} must define exactly the canonical ${contract} keys without duplicates.`);
  }
}

function mappingBlocksAtIndent(text, indent, key) {
  const lines = structuralWorkflowText(text).split("\n");
  const prefix = " ".repeat(indent);
  const childPrefix = " ".repeat(indent + 2);
  const blocks = [];
  for (let index = 0; index < lines.length; index += 1) {
    const match = lines[index].match(new RegExp(`^${prefix}${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*:\\s*(.*)$`));
    if (!match) continue;
    const children = [];
    for (let childIndex = index + 1; childIndex < lines.length; childIndex += 1) {
      const childLine = lines[childIndex];
      const childIndent = childLine.match(/^ */)[0].length;
      if (childIndent <= indent) break;
      if (childIndent === indent + 2 && childLine.startsWith(childPrefix)) {
        children.push(childLine.slice(indent + 2));
      }
    }
    blocks.push({ value: match[1], children });
  }
  return blocks;
}

function requireExactMappingBlock(errors, file, text, indent, key, value, children, contract) {
  const blocks = mappingBlocksAtIndent(text, indent, key);
  if (
    blocks.length !== 1 ||
    blocks[0].value !== value ||
    JSON.stringify(blocks[0].children) !== JSON.stringify(children)
  ) {
    errors.push(`${file} must define exactly the canonical ${contract} mapping.`);
  }
}

function requireConsecutiveSteps(errors, file, jobBlock, names, contract) {
  const steps = rawWorkflowStepBlocks(jobBlock);
  const actualNames = steps.map((step) => stepName(step));
  const start = actualNames.indexOf(names[0]);
  if (start < 0 || JSON.stringify(actualNames.slice(start, start + names.length)) !== JSON.stringify(names)) {
    errors.push(`${file} must preserve ${contract} as one consecutive canonical step chain.`);
  }
}

function actionReferenceLocations(workflows, actionName) {
  const locations = [];
  for (const [file, text] of Object.entries(workflows)) {
    if (!/\.ya?ml$/i.test(file)) continue;
    for (const line of structuralWorkflowLines(text)) {
      const structuralLine = stripYamlComment(line).trimEnd();
      for (const reference of actionReferences(structuralLine)) {
        if (reference.toLowerCase().startsWith(`${actionName.toLowerCase()}@`)) locations.push({ file, reference });
      }
    }
  }
  return locations;
}

function validateActionPins(errors, file, text) {
  for (const line of structuralWorkflowLines(text)) {
    const structuralLine = stripYamlComment(line).trimEnd();
    if (structuralLine.trim() === "") continue;
    if (hasUnterminatedQuotedScalar(structuralLine)) {
      errors.push(`${file} uses an unsupported multiline quoted scalar; keep structural values on one line.`);
      continue;
    }
    if (/^\s*steps\s*:/.test(structuralLine) && !/^\s*steps:\s*$/.test(structuralLine)) {
      errors.push(`${file} uses a noncanonical steps declaration; steps must use an indented block sequence.`);
      continue;
    }
    if (/^\s*-\s*$/.test(structuralLine)) {
      errors.push(`${file} uses an unsupported dash-only sequence item; steps must begin on one canonical block line.`);
      continue;
    }
    if (/^\s*(?:-\s*)?(?:\{|\[)/.test(structuralLine)) {
      errors.push(`${file} uses an unsupported flow collection; action steps must use canonical block YAML.`);
      continue;
    }
    if (/^\s*(?:-\s*)?\?\s+/.test(structuralLine)) {
      errors.push(`${file} uses an unsupported explicit YAML key; action steps must use canonical block YAML.`);
      continue;
    }
    if (/^\s*(?:-\s*)?(?:"[^"\r\n]+"|'[^'\r\n]+')\s*:/.test(structuralLine)) {
      errors.push(`${file} uses an unsupported quoted YAML key; action steps must use canonical block YAML.`);
      continue;
    }
    if (/(?:^|[\s:[{,])(?:!![^\s]+|!<[^>]+>|<<\s*:|[&*][A-Za-z0-9_-]+)/.test(structuralLine)) {
      errors.push(`${file} uses an unsupported YAML tag, anchor, alias or merge key.`);
      continue;
    }
    if (/\\(?:x[0-9A-Fa-f]{2}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/.test(structuralLine)) {
      errors.push(`${file} uses an unsupported escaped YAML scalar outside a run block.`);
      continue;
    }
    if (isActionMappingLine(structuralLine) && /^\s*(?:-\s*)?(?:uses|"uses"|'uses')\s*:\s*$/.test(structuralLine)) {
      errors.push(`${file} action uses an unsupported multiline reference; pin it inline to a full commit SHA.`);
      continue;
    }
    const references = actionReferences(structuralLine);
    if (
      references.length === 0 &&
      isActionMappingLine(structuralLine) &&
      /^\s*(?:-\s*)?(?:uses|"uses"|'uses')(?=\s|:|$)/.test(structuralLine)
    ) {
      errors.push(`${file} action uses an unsupported reference syntax; pin it on one canonical block line.`);
      continue;
    }
    for (const reference of references) {
      if (reference.startsWith("./")) continue;
      if (!/^[^@\s]+@[a-f0-9]{40}$/.test(reference)) {
        errors.push(`${file} action is not pinned to a full commit SHA: ${reference}`);
      }
    }
  }
}

const JAVASCRIPT_SYNTAX_COMMANDS = [
  "node --check matrix-domains.js",
  "node --check matrix-actors.js",
  "node --check matrix-briefs.js",
  "node --check matrix-references.js",
  "node --check matrix-overlays.js",
  "node --check matrix-tools-d01-d03.js",
  "node --check matrix-tools-d04-d06.js",
  "node --check matrix-tools-d07-d09.js",
  "node --check matrix-tools.js",
  "node --check assessment-model.js",
  "node --check assessment-crypto.js",
  "node --check assessment-compare.js",
  "node --check assessment.js",
  "node --check assessment-comparison.js",
  "node --check matrix-coverage-governance.js",
  "node --check matrix-coverage-safety.js",
  "node --check matrix-coverage-digital.js",
  "node --check matrix-coverage.js",
  "node --check coverage-model.js",
  "node --check coverage.js",
  "node --check app.js",
  "node --check scripts/site.mjs",
  "node --check scripts/test_site.mjs",
  "node --check scripts/validate_data.mjs",
  "node --check scripts/validate_data_contract.mjs",
  "node --check scripts/validate_assessment.mjs",
  "node --check scripts/validate_assessment_compare.mjs",
  "node --check scripts/validate_source_register.mjs",
  "node --check scripts/validate_overlays.mjs",
  "node --check scripts/validate_html.mjs",
  "node --check scripts/test_validate_html.mjs",
  "node --check scripts/test_action_brief.mjs",
  "node --check scripts/test_coverage_catalogue.mjs",
  "node --check scripts/test_coverage_model.mjs",
  "node --check scripts/test_coverage_ui.mjs",
  "node --check scripts/test_validate_overlays.mjs",
  "node --check scripts/test_runtime_bootstrap.mjs",
  "node --check scripts/validate_overlay_ui.mjs",
  "node --check scripts/validate_mitigation_tools.mjs",
  "node --check scripts/validate_mitigation_tools_ui.mjs",
  "node --check scripts/validate_ui.mjs",
  "node --check scripts/validate_workflows.mjs",
  "node --check scripts/verify_workflow_runs.mjs",
];

const DATA_AND_UI_GATE_COMMANDS = [
  "node scripts/validate_data.mjs",
  "node scripts/validate_data_contract.mjs",
  "node scripts/validate_assessment.mjs",
  "node scripts/validate_assessment_compare.mjs",
  "node scripts/validate_source_register.mjs",
  "node scripts/validate_source_register.mjs --test-mutations",
  "node scripts/validate_overlays.mjs",
  "node scripts/test_validate_overlays.mjs",
  "node scripts/test_runtime_bootstrap.mjs",
  "node scripts/validate_overlay_ui.mjs",
  "node scripts/validate_mitigation_tools.mjs",
  "node scripts/validate_mitigation_tools_ui.mjs",
  "node scripts/validate_ui.mjs",
  "node scripts/validate_workflows.mjs --self-test",
  "node scripts/verify_workflow_runs.mjs --self-test",
  "node scripts/test_site.mjs",
  "node --test scripts/test_validate_html.mjs",
  "node scripts/test_action_brief.mjs",
  "node scripts/test_coverage_catalogue.mjs",
  "node scripts/test_coverage_model.mjs",
  "node scripts/test_coverage_ui.mjs",
];

const RELEASE_SURFACE_COMMANDS = [
  "python3 -m py_compile scripts/validate_project.py",
  "python3 scripts/test_validate_project_links.py",
  "python3 scripts/validate_project.py",
];

const SOURCE_HISTORY_GATE_COMMANDS = [
  "case \"$CSM_EVENT_NAME\" in",
  "  pull_request)",
  "    base_sha=\"$CSM_PR_BASE_SHA\"",
  "    ;;",
  "  push)",
  "    base_sha=\"$CSM_PUSH_BEFORE_SHA\"",
  "    if [ \"$base_sha\" = \"0000000000000000000000000000000000000000\" ]; then",
  "      base_sha=\"$(git --no-replace-objects rev-parse --verify HEAD^)\"",
  "    fi",
  "    ;;",
  "  workflow_dispatch)",
  "    base_sha=\"$(git rev-parse --verify HEAD^)\"",
  "    ;;",
  "  *)",
  "    echo \"Unsupported workflow event: $CSM_EVENT_NAME\" >&2",
  "    exit 1",
  "    ;;",
  "esac",
  "if [[ ! \"$base_sha\" =~ ^[0-9a-f]{40}$ ]]; then",
  "  echo \"Trusted base SHA is missing or malformed.\" >&2",
  "  exit 1",
  "fi",
  "BASE_SHA=\"$base_sha\"",
  "node scripts/validate_source_register.mjs --against-git-ref \"$BASE_SHA\"",
];

const SOURCE_HISTORY_STEP_STRUCTURE = /^      - name: Enforce append-only source history\n        env:\n          CSM_EVENT_NAME: \$\{\{ github\.event_name \}\}\n          CSM_PR_BASE_SHA: \$\{\{ github\.event\.pull_request\.base\.sha \}\}\n          CSM_PUSH_BEFORE_SHA: \$\{\{ github\.event\.before \}\}\n        shell: bash\n        run: \|$/;

const LOCAL_ARTIFACT_SMOKE_COMMANDS = [
  "python3 -m http.server 8010 --bind 127.0.0.1 --directory _site >/tmp/corporate-security-matrix-http.log 2>&1 &",
  "server_pid=$!",
  "trap 'kill \"$server_pid\"' EXIT",
  "for attempt in {1..20}; do",
  "  if curl --fail --silent --show-error http://127.0.0.1:8010/ >/dev/null; then",
  "    break",
  "  fi",
  "  if [ \"$attempt\" -eq 20 ]; then",
  "    cat /tmp/corporate-security-matrix-http.log",
  "    exit 1",
  "  fi",
  "  sleep 0.25",
  "done",
  "node scripts/site.mjs smoke http://127.0.0.1:8010/",
];

function shaSummaryCommands(heading) {
  return [
    "{",
    `  echo "## ${heading}"`,
    "  echo",
    "  echo \"Commit: \\`$GITHUB_SHA\\`\"",
    "} >>\"$GITHUB_STEP_SUMMARY\"",
  ];
}

const EXTERNAL_LINK_REPORT_COMMANDS = [
  "set +e",
  "csm_link_report=\"$RUNNER_TEMP/external-source-link-report.txt\"",
  "python3 scripts/validate_project.py --check-links >\"$csm_link_report\" 2>&1",
  "validator_status=$?",
  "cat \"$csm_link_report\"",
  "{",
  "  echo \"## External source-link report\"",
  "  echo",
  "  echo \"Commit: \\`$GITHUB_SHA\\`\"",
  "  echo",
  "  echo '```text'",
  "  cat \"$csm_link_report\"",
  "  echo '```'",
  "} >>\"$GITHUB_STEP_SUMMARY\"",
  "exit \"$validator_status\"",
];

function validate(workflows) {
  const errors = [];
  const quality = workflows["validate.yml"] || "";
  const links = workflows["links.yml"] || "";
  const pages = workflows["pages.yml"] || "";
  const qualityStructure = structuralWorkflowText(quality);
  const linksStructure = structuralWorkflowText(links);
  const pagesStructure = structuralWorkflowText(pages);
  const qualityJob = requireJobStructure(errors, "validate.yml", quality, "quality");
  const qualityJobRaw = requireRawJobStructure(errors, "validate.yml", quality, "quality");
  const linksJob = requireJobStructure(errors, "links.yml", links, "links");
  const linksJobRaw = requireRawJobStructure(errors, "links.yml", links, "links");
  const pagesBuild = requireJobStructure(errors, "pages.yml", pages, "build");
  const pagesBuildRaw = requireRawJobStructure(errors, "pages.yml", pages, "build");
  const pagesReleaseGate = requireJobStructure(errors, "pages.yml", pages, "release-gate");
  const pagesReleaseGateRaw = requireRawJobStructure(errors, "pages.yml", pages, "release-gate");
  const pagesDeploy = requireJobStructure(errors, "pages.yml", pages, "deploy");
  const pagesDeployRaw = requireRawJobStructure(errors, "pages.yml", pages, "deploy");
  const pagesProductionSmoke = requireJobStructure(errors, "pages.yml", pages, "production-smoke");
  const pagesProductionSmokeRaw = requireRawJobStructure(errors, "pages.yml", pages, "production-smoke");

  for (const workflow of MANIFEST.requiredPredeployWorkflows) {
    const text = workflows[workflow.file] || "";
    requireMatch(errors, workflow.file, text, new RegExp(`^name: ${workflow.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "m"), `workflow name ${workflow.name}`);
  }
  for (const [file, text] of Object.entries(workflows)) validateActionPins(errors, file, text);

  for (const [file, text] of [["validate.yml", quality], ["links.yml", links], ["pages.yml", pages]]) {
    requireExactMappingKeys(errors, file, text, 0, ["name", "on", "permissions", "concurrency", "jobs"], "workflow-level");
  }
  requireExactMappingKeys(
    errors,
    "pages.yml",
    pagesStructure.split("\njobs:\n")[1] || "",
    2,
    ["build", "release-gate", "deploy", "production-smoke"],
    "Pages job",
  );
  requireExactMappingKeys(errors, "validate.yml", qualityJob, 4, ["runs-on", "timeout-minutes", "steps"], "jobs.quality");
  requireExactMappingKeys(errors, "links.yml", linksJob, 4, ["runs-on", "timeout-minutes", "steps"], "jobs.links");
  requireExactMappingKeys(
    errors,
    "pages.yml",
    pagesBuild,
    4,
    ["if", "runs-on", "timeout-minutes", "permissions", "steps"],
    "jobs.build",
  );
  requireExactMappingKeys(
    errors,
    "pages.yml",
    pagesReleaseGate,
    4,
    ["needs", "if", "runs-on", "timeout-minutes", "permissions", "steps"],
    "jobs.release-gate",
  );
  requireExactMappingKeys(
    errors,
    "pages.yml",
    pagesDeploy,
    4,
    ["needs", "runs-on", "timeout-minutes", "permissions", "outputs", "environment", "steps"],
    "jobs.deploy",
  );
  requireExactMappingKeys(
    errors,
    "pages.yml",
    pagesProductionSmoke,
    4,
    ["needs", "runs-on", "timeout-minutes", "permissions", "steps"],
    "jobs.production-smoke",
  );
  requireExactMappingBlock(errors, "validate.yml", quality, 0, "permissions", "", ["contents: read"], "workflow permissions");
  requireExactMappingBlock(errors, "links.yml", links, 0, "permissions", "", ["contents: read"], "workflow permissions");
  requireExactMappingBlock(errors, "pages.yml", pages, 0, "permissions", "{}", [], "workflow permissions");
  requireExactMappingBlock(
    errors,
    "pages.yml",
    pagesBuild,
    4,
    "permissions",
    "",
    ["contents: read", "pages: read"],
    "jobs.build permissions",
  );
  requireExactMappingBlock(
    errors,
    "pages.yml",
    pagesReleaseGate,
    4,
    "permissions",
    "",
    ["actions: read", "contents: read"],
    "jobs.release-gate permissions",
  );
  requireExactMappingBlock(
    errors,
    "pages.yml",
    pagesDeploy,
    4,
    "permissions",
    "",
    ["pages: write", "id-token: write"],
    "jobs.deploy permissions",
  );
  requireExactMappingBlock(
    errors,
    "pages.yml",
    pagesDeploy,
    4,
    "outputs",
    "",
    ["page_url: ${{ steps.deployment.outputs.page_url }}"],
    "jobs.deploy public URL output",
  );
  requireExactMappingBlock(
    errors,
    "pages.yml",
    pagesProductionSmoke,
    4,
    "permissions",
    "",
    ["contents: read"],
    "jobs.production-smoke permissions",
  );
  requireExactMappingBlock(
    errors,
    "pages.yml",
    pagesDeploy,
    4,
    "environment",
    "",
    ["name: github-pages", "url: ${{ steps.deployment.outputs.page_url }}"],
    "jobs.deploy protected environment",
  );

  requireMatch(errors, "pages.yml", pagesStructure, /^name: Publish GitHub Pages$/m, "the canonical Pages workflow name");
  requireExactTopLevelBlock(
    errors,
    "validate.yml",
    quality,
    "on",
    "on:\n  push:\n  pull_request:\n  workflow_dispatch:",
  );
  requireExactTopLevelBlock(
    errors,
    "links.yml",
    links,
    "on",
    "on:\n  push:\n    branches: [main]\n  schedule:\n    - cron: \"17 3 * * 1\"\n  workflow_dispatch:",
  );
  requireExactTopLevelBlock(
    errors,
    "pages.yml",
    pages,
    "on",
    "on:\n  push:\n    branches: [main]\n  workflow_dispatch:",
  );

  requireNoJobExecutionOverride(errors, "validate.yml", qualityJob, "quality");
  requireExactActionStep(
    errors,
    "validate.yml",
    qualityJobRaw,
    "Check out repository",
    /^actions\/checkout@[a-f0-9]{40}$/,
    "trusted-history checkout",
    {
      structurePatterns: [/^        with:\n          persist-credentials: false\n          fetch-depth: 0$/m],
      exactStructurePattern: /^      - name: Check out repository\n        uses: actions\/checkout@[a-f0-9]{40}\n        with:\n          persist-credentials: false\n          fetch-depth: 0$/,
    },
  );
  requireExactRunStep(
    errors,
    "validate.yml",
    qualityJobRaw,
    "Enforce append-only source history",
    SOURCE_HISTORY_GATE_COMMANDS,
    "trusted-base append-only source-history gate",
    {
      allowedTopLevelFields: ["env"],
      shell: "bash",
      exactStructurePattern: SOURCE_HISTORY_STEP_STRUCTURE,
    },
  );
  requireExactRunStep(
    errors,
    "validate.yml",
    qualityJobRaw,
    "Validate JavaScript syntax",
    JAVASCRIPT_SYNTAX_COMMANDS,
    "JavaScript syntax gate",
  );
  requireExactRunStep(
    errors,
    "validate.yml",
    qualityJobRaw,
    "Validate data and UI contracts",
    DATA_AND_UI_GATE_COMMANDS,
    "data and UI contract gates",
  );
  requireExactRunStep(
    errors,
    "validate.yml",
    qualityJobRaw,
    "Validate release surface",
    RELEASE_SURFACE_COMMANDS,
    "release-surface gate",
  );
  requireExactRunStep(
    errors,
    "validate.yml",
    qualityJobRaw,
    "Build and validate Pages artifact",
    ["node scripts/site.mjs build _site"],
    "manifest-backed artifact build",
  );
  requireExactRunStep(
    errors,
    "validate.yml",
    qualityJobRaw,
    "Validate artifact HTML with pinned Nu Checker",
    ["node scripts/validate_html.mjs _site"],
    "artifact-only Nu gate",
  );
  requireExactRunStep(
    errors,
    "validate.yml",
    qualityJobRaw,
    "Smoke-test assembled Pages artifact",
    LOCAL_ARTIFACT_SMOKE_COMMANDS,
    "assembled-artifact smoke gate",
    { shell: "bash" },
  );
  requireExactRunStep(
    errors,
    "validate.yml",
    qualityJobRaw,
    "Record exact quality SHA",
    shaSummaryCommands("Quality workflow SHA"),
    "quality SHA summary",
    { allowedFields: { if: "always()" }, shell: "bash" },
  );

  requireNoJobExecutionOverride(errors, "links.yml", linksJob, "links");
  requireMatch(errors, "links.yml", linksStructure, /^  group: external-source-links-\$\{\{ github\.event_name \}\}-\$\{\{ github\.sha \}\}$/m, "per-event, per-SHA link concurrency");
  requireExactRunStep(
    errors,
    "links.yml",
    linksJobRaw,
    "Validate external link checker security boundaries",
    ["python3 scripts/test_validate_project_links.py"],
    "offline external-link network-boundary regression gate",
  );
  requireConsecutiveSteps(
    errors,
    "links.yml",
    linksJobRaw,
    [
      "Validate external link checker security boundaries",
      "Verify authoritative sources and publish restricted-access report",
    ],
    "offline security regressions before external network checks",
  );
  requireExactRunStep(
    errors,
    "links.yml",
    linksJobRaw,
    "Verify authoritative sources and publish restricted-access report",
    EXTERNAL_LINK_REPORT_COMMANDS,
    "external source-link gate and restricted-access report",
    { shell: "bash" },
  );
  requireExactRunStep(
    errors,
    "links.yml",
    linksJobRaw,
    "Record exact external-link SHA",
    shaSummaryCommands("External source-link workflow SHA"),
    "external-link SHA summary",
    { allowedFields: { if: "always()" }, shell: "bash" },
  );

  requireExactJobCondition(
    errors,
    "pages.yml",
    pagesBuild,
    "build",
    "github.event_name != 'workflow_dispatch' || github.ref == 'refs/heads/main'",
  );
  requireExactActionStep(
    errors,
    "pages.yml",
    pagesBuildRaw,
    "Check out repository",
    /^actions\/checkout@[a-f0-9]{40}$/,
    "Pages trusted-history checkout",
    {
      structurePatterns: [/^        with:\n          persist-credentials: false\n          fetch-depth: 0$/m],
      exactStructurePattern: /^      - name: Check out repository\n        uses: actions\/checkout@[a-f0-9]{40}\n        with:\n          persist-credentials: false\n          fetch-depth: 0$/,
    },
  );
  requireExactRunStep(
    errors,
    "pages.yml",
    pagesBuildRaw,
    "Enforce append-only source history",
    SOURCE_HISTORY_GATE_COMMANDS,
    "Pages trusted-base append-only source-history gate",
    {
      allowedTopLevelFields: ["env"],
      shell: "bash",
      exactStructurePattern: SOURCE_HISTORY_STEP_STRUCTURE,
    },
  );
  requireExactRunStep(
    errors,
    "pages.yml",
    pagesBuildRaw,
    "Validate release source",
    [...JAVASCRIPT_SYNTAX_COMMANDS, ...DATA_AND_UI_GATE_COMMANDS, ...RELEASE_SURFACE_COMMANDS],
    "release-source gates",
  );
  requireExactRunStep(
    errors,
    "pages.yml",
    pagesBuildRaw,
    "Build and validate Pages artifact",
    ["node scripts/site.mjs build _site"],
    "manifest-backed Pages artifact build",
  );
  requireExactRunStep(
    errors,
    "pages.yml",
    pagesBuildRaw,
    "Validate artifact HTML with pinned Nu Checker",
    ["node scripts/validate_html.mjs _site"],
    "artifact-only Pages Nu gate",
  );
  requireExactRunStep(
    errors,
    "pages.yml",
    pagesBuildRaw,
    "Smoke-test assembled Pages artifact",
    LOCAL_ARTIFACT_SMOKE_COMMANDS,
    "Pages assembled-artifact smoke gate",
    { shell: "bash" },
  );
  requireExactRunStep(
    errors,
    "pages.yml",
    pagesBuildRaw,
    "Record exact Pages build SHA",
    shaSummaryCommands("Pages build SHA"),
    "Pages build SHA summary",
    { allowedFields: { if: "always()" }, shell: "bash" },
  );
  requireExactActionStep(
    errors,
    "pages.yml",
    pagesBuildRaw,
    "Upload Pages artifact",
    /^actions\/upload-pages-artifact@[a-f0-9]{40}$/,
    "validated Pages artifact upload",
    {
      structurePatterns: [/^        with:\n          path: _site$/m],
      exactStructurePattern: /^      - name: Upload Pages artifact\n        uses: actions\/upload-pages-artifact@[a-f0-9]{40}\n        with:\n          path: _site$/,
    },
  );
  requireConsecutiveSteps(
    errors,
    "pages.yml",
    pagesBuildRaw,
    [
      "Build and validate Pages artifact",
      "Validate artifact HTML with pinned Nu Checker",
      "Smoke-test assembled Pages artifact",
      "Record exact Pages build SHA",
      "Upload Pages artifact",
    ],
    "build, validation, smoke, immutable summary and upload",
  );

  requireExactJobCondition(
    errors,
    "pages.yml",
    pagesReleaseGate,
    "release-gate",
    "github.event_name != 'workflow_dispatch' || github.ref == 'refs/heads/main'",
  );
  requireMatch(errors, "pages.yml", pagesReleaseGate, /^    permissions:\n      actions: read$/m, "read-only actions permission on the exact-SHA workflow gate");
  requireMatch(errors, "pages.yml", pagesReleaseGate, /^    needs: build$/m, "release-gate dependency on the validated build");
  requireExactActionStep(
    errors,
    "pages.yml",
    pagesReleaseGateRaw,
    "Check out workflow gate",
    /^actions\/checkout@[a-f0-9]{40}$/,
    "read-only exact-SHA workflow-gate checkout",
    {
      exactStructurePattern: /^      - name: Check out workflow gate\n        uses: actions\/checkout@[a-f0-9]{40}\n        with:\n          persist-credentials: false\n          ref: \$\{\{ github\.sha \}\}$/,
      structurePatterns: [/^        with:\n          persist-credentials: false\n          ref: \$\{\{ github\.sha \}\}$/m],
    },
  );
  const verifierStep = requireExactRunStep(
    errors,
    "pages.yml",
    pagesReleaseGateRaw,
    "Require successful exact-SHA workflows",
    ["node scripts/verify_workflow_runs.mjs"],
    "exact-SHA workflow gate",
    { allowedTopLevelFields: ["env"] },
  );
  if (verifierStep) {
    requireMatch(
      errors,
      "pages.yml",
      structuralWorkflowText(verifierStep),
      /^      - name: Require successful exact-SHA workflows\n        env:\n          GITHUB_TOKEN: \$\{\{ github\.token \}\}\n        run: node scripts\/verify_workflow_runs\.mjs$/,
      "the canonical GitHub token binding on the exact-SHA workflow gate",
    );
  }

  requireExactRunStep(
    errors,
    "pages.yml",
    pagesReleaseGateRaw,
    "Require current main tip",
    ["node scripts/verify_workflow_runs.mjs --verify-current-main"],
    "current-main-tip freshness gate",
    {
      allowedTopLevelFields: ["env"],
      exactStructurePattern: /^      - name: Require current main tip\n        env:\n          GITHUB_TOKEN: \$\{\{ github\.token \}\}\n        run: node scripts\/verify_workflow_runs\.mjs --verify-current-main$/,
    },
  );
  requireConsecutiveSteps(
    errors,
    "pages.yml",
    pagesReleaseGateRaw,
    ["Require successful exact-SHA workflows", "Require current main tip"],
    "read-only exact-SHA and current-main gates",
  );
  const releaseGateSteps = rawWorkflowStepBlocks(pagesReleaseGateRaw).map(stepName);
  if (releaseGateSteps.at(-1) !== "Require current main tip") {
    errors.push("pages.yml jobs.release-gate must check current main as its final step.");
  }

  requireNoJobExecutionOverride(errors, "pages.yml", pagesDeploy, "deploy");
  requireMatch(errors, "pages.yml", pagesDeploy, /^    needs: \[build, release-gate\]$/m, "deployment dependency on build and exact-SHA gate");
  requireMatch(errors, "pages.yml", pagesDeploy, /^    runs-on: ubuntu-24\.04$/m, "the isolated hosted Pages runner");
  requireMatch(errors, "pages.yml", pagesDeploy, /^    environment:\n      name: github-pages$/m, "the protected github-pages environment");
  const deployEnvironments = jobFieldValues(pagesDeploy, "environment");
  if (deployEnvironments.length !== 1 || deployEnvironments[0] !== "") {
    errors.push("pages.yml jobs.deploy must define exactly one canonical protected environment mapping.");
  }
  requireExactActionStep(
    errors,
    "pages.yml",
    pagesDeployRaw,
    "Deploy to GitHub Pages",
    /^actions\/deploy-pages@cd2ce8fcbc39b97be8ca5fce6e763baed58fa128$/,
    "canonical Pages deployment",
    {
      fields: { id: "deployment" },
      exactStructurePattern: /^      - name: Deploy to GitHub Pages\n        id: deployment\n        uses: actions\/deploy-pages@[a-f0-9]{40}$/,
    },
  );
  const deploymentSteps = rawWorkflowStepBlocks(pagesDeployRaw);
  if (deploymentSteps.length !== 1 || stepName(deploymentSteps[0]) !== "Deploy to GitHub Pages") {
    errors.push("pages.yml jobs.deploy must execute only the canonical pinned deployment action, without checkout or repository code.");
  }

  requireNoJobExecutionOverride(errors, "pages.yml", pagesProductionSmoke, "production-smoke");
  requireMatch(errors, "pages.yml", pagesProductionSmoke, /^    needs: deploy$/m, "production smoke dependency on successful deployment");
  requireExactActionStep(
    errors,
    "pages.yml",
    pagesProductionSmokeRaw,
    "Check out route manifest",
    /^actions\/checkout@[a-f0-9]{40}$/,
    "read-only exact-SHA production-smoke checkout",
    {
      exactStructurePattern: /^      - name: Check out route manifest\n        uses: actions\/checkout@[a-f0-9]{40}\n        with:\n          persist-credentials: false\n          ref: \$\{\{ github\.sha \}\}$/,
      structurePatterns: [/^        with:\n          persist-credentials: false\n          ref: \$\{\{ github\.sha \}\}$/m],
    },
  );
  requireExactRunStep(
    errors,
    "pages.yml",
    pagesProductionSmokeRaw,
    "Verify deployed manifest routes and exact content",
    ['node scripts/site.mjs smoke "$CSM_PAGE_URL" --retries 10'],
    "two-sweep manifest-backed production smoke gate",
    {
      allowedTopLevelFields: ["env"],
      exactStructurePattern: /^      - name: Verify deployed manifest routes and exact content\n        env:\n          CSM_PAGE_URL: \$\{\{ needs\.deploy\.outputs\.page_url \}\}\n        run: node scripts\/site\.mjs smoke "\$CSM_PAGE_URL" --retries 10$/,
    },
  );
  requireExactRunStep(
    errors,
    "pages.yml",
    pagesProductionSmokeRaw,
    "Record exact deployed SHA",
    shaSummaryCommands("Pages deployment SHA"),
    "Pages deployment SHA summary",
    { allowedFields: { if: "always()" }, shell: "bash" },
  );

  const deployReferences = actionReferenceLocations(workflows, "actions/deploy-pages");
  if (deployReferences.length !== 1 || deployReferences[0].file !== "pages.yml") {
    errors.push("all workflow files together must contain exactly one actions/deploy-pages action in pages.yml.");
  }

  return errors;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function selfTest(workflows) {
  assert(validate(workflows).length === 0, `canonical workflows must pass: ${validate(workflows).join("; ")}`);
  const mutations = [
    ["unprotected Pages deployment", "pages.yml", /name: github-pages/, "name: public-pages"],
    ["missing exact-SHA gate", "pages.yml", /node scripts\/verify_workflow_runs\.mjs/g, "node scripts/verify_runs.mjs"],
    ["source-directory upload", "pages.yml", /path: _site/, "path: ."],
    ["single-sweep production smoke", "pages.yml", /--retries 10/, "--retries 1"],
    ["non-main link workflow", "links.yml", /branches: \[main\]/, "branches: [release]"],
    ["mutable action reference", "validate.yml", /actions\/checkout@[a-f0-9]{40}/, "actions/checkout@main"],
    [
      "missing HTML-validator test syntax gate",
      "validate.yml",
      /node --check scripts\/test_validate_html\.mjs/,
      "true # node --check scripts/test_validate_html.mjs",
    ],
    [
      "missing HTML-validator security regressions in Quality",
      "validate.yml",
      /node --test scripts\/test_validate_html\.mjs/,
      "true # node --test scripts/test_validate_html.mjs",
    ],
    [
      "failure-masked HTML-validator security regressions in Pages",
      "pages.yml",
      /node --test scripts\/test_validate_html\.mjs/,
      "node --test scripts/test_validate_html.mjs || true",
    ],
    [
      "missing action-brief regressions in Quality",
      "validate.yml",
      /node scripts\/test_action_brief\.mjs/,
      "true # node scripts/test_action_brief.mjs",
    ],
    [
      "failure-masked action-brief regressions in Pages",
      "pages.yml",
      /node scripts\/test_action_brief\.mjs/,
      "node scripts/test_action_brief.mjs || true",
    ],
    [
      "missing link-checker security regressions in Quality",
      "validate.yml",
      /python3 scripts\/test_validate_project_links\.py/,
      "true # python3 scripts/test_validate_project_links.py",
    ],
    [
      "missing coverage catalogue regression gate in Quality",
      "validate.yml",
      /node scripts\/test_coverage_catalogue\.mjs/,
      "true # node scripts/test_coverage_catalogue.mjs",
    ],
    [
      "failure-masked coverage model regressions in Pages",
      "pages.yml",
      /node scripts\/test_coverage_model\.mjs/,
      "node scripts/test_coverage_model.mjs || true",
    ],
    [
      "missing coverage UI privacy regressions in Quality",
      "validate.yml",
      /node scripts\/test_coverage_ui\.mjs/,
      "true # node scripts/test_coverage_ui.mjs",
    ],
    [
      "failure-masked link-checker security regressions in Pages",
      "pages.yml",
      /python3 scripts\/test_validate_project_links\.py/,
      "python3 scripts/test_validate_project_links.py || true",
    ],
    [
      "disabled offline link-checker regression prerequisite",
      "links.yml",
      /(      - name: Validate external link checker security boundaries\n)/,
      "$1        if: ${{ false }}\n",
    ],
    [
      "failure-masked offline link-checker regression prerequisite",
      "links.yml",
      /run: python3 scripts\/test_validate_project_links\.py/,
      "run: python3 scripts/test_validate_project_links.py || true",
    ],
    [
      "offline link regressions moved after network checking",
      "links.yml",
      /(      - name: Validate external link checker security boundaries\n        run: python3 scripts\/test_validate_project_links\.py\n)\n(      - name: Verify authoritative sources[\s\S]*?          exit "\$validator_status"\n)/,
      "$2\n$1",
    ],
    ["unnamed mutable action", "validate.yml", /steps:\n/, "steps:\n      - uses: example/unsafe-action@main\n"],
    ["flow-map mutable action", "validate.yml", /steps:\n/, "steps:\n      - { name: Unsafe, \"uses\": \"example/unsafe-action@main\" }\n"],
    ["multiline mutable action", "validate.yml", /steps:\n/, "steps:\n      - uses:\n          example/unsafe-action@main\n"],
    ["multiline flow-map action", "validate.yml", /steps:\n/, "steps:\n      - { name: Unsafe,\n          uses: example/unsafe-action@main }\n"],
    ["explicit-key mutable action", "validate.yml", /steps:\n/, "steps:\n      - ? uses\n        : example/unsafe-action@main\n"],
    ["escaped quoted-key action", "validate.yml", /steps:\n/, "steps:\n      - \"us\\u0065s\": example/unsafe-action@main\n"],
    ["split flow-map action", "validate.yml", /steps:\n/, "steps:\n      -\n        { \"u\\u0073es\": example/unsafe-action@main }\n"],
    ["block-scalar sibling action", "validate.yml", /steps:\n/, "steps:\n      - name: |\n          Unsafe action\n        uses: example/unsafe-action@main\n"],
    ["comment scalar-lookalike action", "validate.yml", /steps:\n/, "steps:\n      # hide: |\n        - uses: example/unsafe-action@main\n"],
    [
      "run-block decoy for deploy dependencies",
      "pages.yml",
      /  deploy:\n    needs: \[build, release-gate\]([\s\S]*?    steps:\n)/,
      "  deploy:\n    needs: build$1      - name: Structural contract decoy\n        run: |\n          deploy:\n            needs: [build, release-gate]\n",
    ],
    [
      "run-block decoy for protected environment",
      "pages.yml",
      /    environment:\n      name: github-pages([\s\S]*?    steps:\n)/,
      "    environment:\n      name: public-pages$1      - name: Structural contract decoy\n        run: |\n          environment:\n            name: github-pages\n",
    ],
    [
      "comment decoy for deploy job",
      "pages.yml",
      /  deploy:\n    needs: \[build, release-gate\]/,
      "  publish:\n    # deploy:\n    needs: [build, release-gate]",
    ],
    [
      "quoted-scalar decoy for deploy dependencies",
      "pages.yml",
      /  deploy:\n    needs: \[build, release-gate\]/,
      "  deploy:\n    env:\n      CONTRACT_DECOY: \"deploy:\n        needs: [build, release-gate]\"\n    needs: build",
    ],
    [
      "quoted-scalar decoy for protected environment",
      "pages.yml",
      /    environment:\n      name: github-pages/,
      "    environment:\n      name: public-pages\n    env:\n      CONTRACT_DECOY: \"environment:\n        name: github-pages\"",
    ],
    [
      "unrelated-step decoy for uploaded artifact path",
      "pages.yml",
      /(uses: actions\/upload-pages-artifact@[a-f0-9]{40}[^\n]*\n        with:\n)          path: _site/,
      "$1          path: .\n\n      - name: Structural contract decoy\n        uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1\n        with:\n          path: _site",
    ],
    [
      "shell-comment decoy for the quality data-contract gate",
      "validate.yml",
      /node scripts\/validate_data_contract\.mjs/,
      "true\n          # node scripts/validate_data_contract.mjs",
    ],
    [
      "non-run block-scalar decoy for the quality assessment-comparison gate",
      "validate.yml",
      /    steps:\n([\s\S]*?)          node scripts\/validate_assessment_compare\.mjs/,
      "    env:\n      CSM_COMMAND_DECOY: |\n        node scripts/validate_assessment_compare.mjs\n    steps:\n$1          true",
    ],
    [
      "unrelated-job decoy for quality source-register mutation tests",
      "validate.yml",
      /          node scripts\/validate_source_register\.mjs --test-mutations([\s\S]*)$/,
      "          true$1\n  command-decoy:\n    runs-on: ubuntu-24.04\n    steps:\n      - name: Non-gating command decoy\n        run: node scripts/validate_source_register.mjs --test-mutations\n",
    ],
    [
      "shell-comment decoy for the quality runtime-bootstrap gate",
      "validate.yml",
      /node scripts\/test_runtime_bootstrap\.mjs/,
      "true\n          # node scripts/test_runtime_bootstrap.mjs",
    ],
    [
      "shell-comment decoy for the quality overlay UI gate",
      "validate.yml",
      /node scripts\/validate_overlay_ui\.mjs/,
      "true\n          # node scripts/validate_overlay_ui.mjs",
    ],
    [
      "shell-comment decoy for the quality mitigation-tool data gate",
      "validate.yml",
      /node scripts\/validate_mitigation_tools\.mjs/,
      "true\n          # node scripts/validate_mitigation_tools.mjs",
    ],
    [
      "shell-comment decoy for the quality mitigation-tool UI gate",
      "validate.yml",
      /node scripts\/validate_mitigation_tools_ui\.mjs/,
      "true\n          # node scripts/validate_mitigation_tools_ui.mjs",
    ],
    [
      "shell-comment decoy for quality artifact mutation tests",
      "validate.yml",
      /node scripts\/test_site\.mjs/,
      "true\n          # node scripts/test_site.mjs",
    ],
    [
      "shell-comment decoy for quality workflow mutation tests",
      "validate.yml",
      /node scripts\/validate_workflows\.mjs --self-test/,
      "true\n          # node scripts/validate_workflows.mjs --self-test",
    ],
    [
      "inline-comment decoy for the quality artifact build",
      "validate.yml",
      /run: node scripts\/site\.mjs build _site/,
      "run: true # node scripts/site.mjs build _site",
    ],
    [
      "inline-comment decoy for quality Nu validation",
      "validate.yml",
      /run: node scripts\/validate_html\.mjs _site/,
      "run: true # node scripts/validate_html.mjs _site",
    ],
    [
      "shell-comment decoy for the Pages source-register mutation gate",
      "pages.yml",
      /node scripts\/validate_source_register\.mjs --test-mutations/,
      "true\n          # node scripts/validate_source_register.mjs --test-mutations",
    ],
    [
      "shell-comment decoy for the Pages runtime-bootstrap gate",
      "pages.yml",
      /node scripts\/test_runtime_bootstrap\.mjs/,
      "true\n          # node scripts/test_runtime_bootstrap.mjs",
    ],
    [
      "shell-comment decoy for the Pages overlay UI gate",
      "pages.yml",
      /node scripts\/validate_overlay_ui\.mjs/,
      "true\n          # node scripts/validate_overlay_ui.mjs",
    ],
    [
      "shell-comment decoy for the Pages mitigation-tool data gate",
      "pages.yml",
      /node scripts\/validate_mitigation_tools\.mjs/,
      "true\n          # node scripts/validate_mitigation_tools.mjs",
    ],
    [
      "shell-comment decoy for the Pages mitigation-tool UI gate",
      "pages.yml",
      /node scripts\/validate_mitigation_tools_ui\.mjs/,
      "true\n          # node scripts/validate_mitigation_tools_ui.mjs",
    ],
    [
      "shell-comment decoy for Pages workflow mutation tests",
      "pages.yml",
      /node scripts\/validate_workflows\.mjs --self-test/,
      "true\n          # node scripts/validate_workflows.mjs --self-test",
    ],
    [
      "inline-comment decoy for the Pages artifact build",
      "pages.yml",
      /run: node scripts\/site\.mjs build _site/,
      "run: true # node scripts/site.mjs build _site",
    ],
    [
      "inline-comment decoy for Pages Nu validation",
      "pages.yml",
      /run: node scripts\/validate_html\.mjs _site/,
      "run: true # node scripts/validate_html.mjs _site",
    ],
    [
      "shell-comment decoy for external source checking",
      "links.yml",
      /python3 scripts\/validate_project\.py --check-links >"\$csm_link_report" 2>&1/,
      "true # python3 scripts/validate_project.py --check-links >\"$csm_link_report\" 2>&1",
    ],
    [
      "missing trusted-base append-only gate",
      "validate.yml",
      /\n      - name: Enforce append-only source history\n[\s\S]*?(?=\n      - name: Set up Python)/,
      "",
    ],
    [
      "shell-comment decoy for trusted-base append-only validation",
      "validate.yml",
      /node scripts\/validate_source_register\.mjs --against-git-ref "\$BASE_SHA"/,
      "true # node scripts/validate_source_register.mjs --against-git-ref \"$BASE_SHA\"",
    ],
    [
      "failure-masked trusted-base append-only validation",
      "pages.yml",
      /node scripts\/validate_source_register\.mjs --against-git-ref "\$BASE_SHA"/,
      "node scripts/validate_source_register.mjs --against-git-ref \"$BASE_SHA\" || true",
    ],
    [
      "untrusted pull-request head SHA for append-only validation",
      "validate.yml",
      /base_sha="\$CSM_PR_BASE_SHA"/,
      "base_sha=\"${{ github.event.pull_request.head.sha }}\"",
    ],
    [
      "shallow checkout for trusted-base derivation",
      "pages.yml",
      /          fetch-depth: 0/,
      "          fetch-depth: 1",
    ],
    [
      "missing zero-before parent fallback",
      "validate.yml",
      /              if \[ "\$base_sha" = "0000000000000000000000000000000000000000" \]; then\n                base_sha="\$\(git --no-replace-objects rev-parse --verify HEAD\^\)"\n              fi\n/,
      "",
    ],
    [
      "continue-on-error on the exact-SHA verifier",
      "pages.yml",
      /        run: node scripts\/verify_workflow_runs\.mjs/,
      "        continue-on-error: true\n        run: node scripts/verify_workflow_runs.mjs",
    ],
    [
      "disabled exact-SHA verifier step",
      "pages.yml",
      /        run: node scripts\/verify_workflow_runs\.mjs/,
      "        if: ${{ false }}\n        run: node scripts/verify_workflow_runs.mjs",
    ],
    [
      "custom working directory on the exact-SHA verifier",
      "pages.yml",
      /        run: node scripts\/verify_workflow_runs\.mjs/,
      "        working-directory: /tmp\n        run: node scripts/verify_workflow_runs.mjs",
    ],
    [
      "failure-masked exact-SHA verifier",
      "pages.yml",
      /run: node scripts\/verify_workflow_runs\.mjs/,
      "run: node scripts/verify_workflow_runs.mjs || true",
    ],
    [
      "missing current-main-tip gate",
      "pages.yml",
      /\n      - name: Require current main tip\n        env:\n          GITHUB_TOKEN: \$\{\{ github\.token \}\}\n        run: node scripts\/verify_workflow_runs\.mjs --verify-current-main\n/,
      "",
    ],
    [
      "wrong current-main-tip verifier mode",
      "pages.yml",
      /node scripts\/verify_workflow_runs\.mjs --verify-current-main/,
      "node scripts/verify_workflow_runs.mjs",
    ],
    [
      "untrusted current-main-tip token binding",
      "pages.yml",
      /(      - name: Require current main tip\n        env:\n)          GITHUB_TOKEN: \$\{\{ github\.token \}\}/,
      "$1          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}",
    ],
    [
      "disabled current-main-tip verifier step",
      "pages.yml",
      /(      - name: Require current main tip\n)/,
      "$1        if: ${{ false }}\n",
    ],
    [
      "failure-tolerant current-main-tip verifier step",
      "pages.yml",
      /(      - name: Require current main tip\n)/,
      "$1        continue-on-error: true\n",
    ],
    [
      "custom working directory on current-main-tip verifier",
      "pages.yml",
      /(      - name: Require current main tip\n)/,
      "$1        working-directory: /tmp\n",
    ],
    [
      "failure-masked current-main-tip verifier",
      "pages.yml",
      /node scripts\/verify_workflow_runs\.mjs --verify-current-main/,
      "node scripts/verify_workflow_runs.mjs --verify-current-main || true",
    ],
    [
      "interposed step after current-main-tip verification",
      "pages.yml",
      /(        run: node scripts\/verify_workflow_runs\.mjs --verify-current-main\n)(\n  deploy:)/,
      "$1\n      - name: Interposed release-gate step\n        run: true\n$2",
    ],
    [
      "checkout in the privileged Pages job",
      "pages.yml",
      /(      - name: Deploy to GitHub Pages\n)/,
      "      - name: Privileged checkout\n        uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1\n\n$1",
    ],
    [
      "repository script in the privileged Pages job",
      "pages.yml",
      /(      - name: Deploy to GitHub Pages\n)/,
      "      - name: Privileged repository code\n        run: node scripts/verify_workflow_runs.mjs --verify-current-main\n\n$1",
    ],
    [
      "post-deployment command in the privileged Pages job",
      "pages.yml",
      /(        uses: actions\/deploy-pages@[a-f0-9]{40}[^\n]*\n)/,
      "$1\n      - name: Privileged summary\n        run: echo completed\n",
    ],
    [
      "additional pinned action in the privileged Pages job",
      "pages.yml",
      /(      - name: Deploy to GitHub Pages\n)/,
      "      - name: Privileged setup action\n        uses: actions/setup-node@2028fbc5c25fe9cf00d9f06a71cc4710d4507903\n\n$1",
    ],
    [
      "unreviewed deployment action commit",
      "pages.yml",
      /actions\/deploy-pages@cd2ce8fcbc39b97be8ca5fce6e763baed58fa128/,
      `actions/deploy-pages@${"a".repeat(40)}`,
    ],
    [
      "privileged deployment action environment override",
      "pages.yml",
      /(        id: deployment\n)/,
      "$1        env:\n          NODE_OPTIONS: --require ./repository-hook.cjs\n",
    ],
    [
      "privileged deployment action input override",
      "pages.yml",
      /(        uses: actions\/deploy-pages@[a-f0-9]{40}[^\n]*\n)/,
      "$1        with:\n          artifact_name: alternate-artifact\n",
    ],
    [
      "unnecessary contents authority in privileged Pages job",
      "pages.yml",
      /(      pages: write\n)/,
      "      contents: read\n$1",
    ],
    [
      "elevated production smoke authority",
      "pages.yml",
      /(  production-smoke:[\s\S]*?      contents: read\n)/,
      "$1      id-token: write\n",
    ],
    [
      "production smoke bypassing deployment success",
      "pages.yml",
      /(  production-smoke:\n)    needs: deploy\n/,
      "$1    needs: build\n",
    ],
    [
      "production smoke checks mutable main",
      "pages.yml",
      /(      - name: Check out route manifest[\s\S]*?          ref:) \$\{\{ github\.sha \}\}/,
      "$1 refs/heads/main",
    ],
    [
      "release gate checks mutable main",
      "pages.yml",
      /(      - name: Check out workflow gate[\s\S]*?          ref:) \$\{\{ github\.sha \}\}/,
      "$1 refs/heads/main",
    ],
    [
      "production smoke uses unrelated URL",
      "pages.yml",
      /CSM_PAGE_URL: \$\{\{ needs\.deploy\.outputs\.page_url \}\}/,
      "CSM_PAGE_URL: https://example.com/",
    ],
    [
      "always-running deploy job",
      "pages.yml",
      /  deploy:\n/,
      "  deploy:\n    if: always()\n",
    ],
    [
      "failure-tolerant deploy job",
      "pages.yml",
      /  deploy:\n/,
      "  deploy:\n    continue-on-error: true\n",
    ],
    [
      "failure-masking deploy job default shell",
      "pages.yml",
      /  deploy:\n/,
      "  deploy:\n    defaults:\n      run:\n        shell: bash {0} || true\n",
    ],
    [
      "duplicate unprotected deploy environment",
      "pages.yml",
      /(    environment:\n      name: github-pages\n      url: \$\{\{ steps\.deployment\.outputs\.page_url \}\}\n)/,
      "$1    environment: public-pages\n",
    ],
    [
      "conditional Pages upload step",
      "pages.yml",
      /(      - name: Upload Pages artifact\n)/,
      "$1        if: always()\n",
    ],
    [
      "failure-tolerant Pages upload step",
      "pages.yml",
      /(      - name: Upload Pages artifact\n)/,
      "$1        continue-on-error: true\n",
    ],
    [
      "custom working directory on Pages upload step",
      "pages.yml",
      /(      - name: Upload Pages artifact\n)/,
      "$1        working-directory: /tmp\n",
    ],
    [
      "conditional production smoke step",
      "pages.yml",
      /(      - name: Verify deployed manifest routes and exact content\n)/,
      "$1        if: always()\n",
    ],
    [
      "failure-tolerant production smoke step",
      "pages.yml",
      /(      - name: Verify deployed manifest routes and exact content\n)/,
      "$1        continue-on-error: true\n",
    ],
    [
      "custom working directory on production smoke step",
      "pages.yml",
      /(      - name: Verify deployed manifest routes and exact content\n)/,
      "$1        working-directory: /tmp\n",
    ],
    [
      "failure-masked production smoke step",
      "pages.yml",
      /--retries 10/,
      "--retries 10 || true",
    ],
    [
      "post-validation artifact mutation step",
      "pages.yml",
      /(      - name: Upload Pages artifact\n)/,
      "      - name: Mutate validated artifact\n        run: printf 'tampered' >>_site/index.html\n\n$1",
    ],
    [
      "artifact mutation hidden in the build SHA summary step",
      "pages.yml",
      /(          } >>"\$GITHUB_STEP_SUMMARY"\n\n      - name: Upload Pages artifact)/,
      "          } >>\"$GITHUB_STEP_SUMMARY\"\n          printf 'tampered' >>_site/index.html\n\n      - name: Upload Pages artifact",
    ],
    [
      "pull-request sibling Pages trigger",
      "pages.yml",
      /(  workflow_dispatch:\n)/,
      "$1  pull_request:\n",
    ],
    [
      "tag sibling on the Pages push trigger",
      "pages.yml",
      /(    branches: \[main\]\n)/,
      "$1    tags: ['*']\n",
    ],
    [
      "workflow-level BASH_ENV masking",
      "pages.yml",
      /(permissions: \{\}\n)/,
      "$1\nenv:\n  BASH_ENV: /tmp/mask-gates.sh\n",
    ],
    [
      "workflow-level default-shell failure masking",
      "pages.yml",
      /(permissions: \{\}\n)/,
      "$1\ndefaults:\n  run:\n    shell: bash {0} || true\n",
    ],
    [
      "duplicate scalar Pages trigger",
      "pages.yml",
      /(  workflow_dispatch:\n)/,
      "$1\non: pull_request\n",
    ],
    [
      "duplicate deploy dependency",
      "pages.yml",
      /(  deploy:\n    needs: \[build, release-gate\]\n)/,
      "$1    needs: build\n",
    ],
    [
      "duplicate release-gate permissions mapping",
      "pages.yml",
      /(  release-gate:\n    needs: build\n)/,
      "$1    permissions: write-all\n",
    ],
    [
      "trailing duplicate jobs mapping",
      "pages.yml",
      /$/,
      "\njobs: {}\n",
    ],
    [
      "matrix-expanded deploy job",
      "pages.yml",
      /(  deploy:\n)/,
      "$1    strategy:\n      matrix:\n        replica: [one, two]\n",
    ],
    [
      "second Pages deploy job",
      "pages.yml",
      /\n  deploy:\n/,
      "\n  shadow-deploy:\n    runs-on: ubuntu-24.04\n    steps:\n      - name: Shadow Pages deployment\n        uses: actions/deploy-pages@cd2ce8fcbc39b97be8ca5fce6e763baed58fa128\n\n  deploy:\n",
    ],
  ];
  for (const [label, file, pattern, replacement] of mutations) {
    const mutated = { ...workflows, [file]: workflows[file].replace(pattern, replacement) };
    assert(mutated[file] !== workflows[file], `${label} mutation must change its canonical fixture`);
    assert(validate(mutated).length > 0, `${label} mutation must fail closed`);
    console.log(`PASS rejects ${label}`);
  }
  const rogueWorkflow = {
    ...workflows,
    "rogue-pages.yaml": `name: Rogue Pages deployment
on: workflow_dispatch
permissions: {}
jobs:
  deploy:
    runs-on: ubuntu-24.04
    steps:
      - name: Deploy outside the canonical workflow
        uses: actions/deploy-pages@cd2ce8fcbc39b97be8ca5fce6e763baed58fa128
`,
  };
  assert(validate(rogueWorkflow).length > 0, "separate rogue Pages workflow mutation must fail closed");
  console.log("PASS rejects separate rogue Pages workflow");
  const uppercaseRogueWorkflow = {
    ...workflows,
    "rogue-pages.yaml": rogueWorkflow["rogue-pages.yaml"].replace("actions/deploy-pages@", "Actions/Deploy-Pages@"),
  };
  assert(validate(uppercaseRogueWorkflow).length > 0, "case-variant rogue Pages workflow mutation must fail closed");
  console.log("PASS rejects case-variant rogue Pages workflow");
  const proseUses = {
    ...workflows,
    "validate.yml": workflows["validate.yml"].replace(
      "      - name: Set up Python",
      "      # Documentation uses: the pinned setup action below\n      - name: Set up Python uses: a pinned action",
    ),
  };
  assert(validate(proseUses).length === 0, "ordinary uses tokens in comments and step names must not be parsed as action keys");
  console.log("PASS accepts ordinary uses tokens outside mapping keys");
  const nestedUses = {
    ...workflows,
    "validate.yml": workflows["validate.yml"].replace(
      "permissions:\n  contents: read",
      "permissions:\n  contents: read\n\nenv:\n  uses: documentation-value",
    ),
  };
  const nestedUsesErrors = validate(nestedUses).filter((error) => error.includes("action"));
  assert(nestedUsesErrors.length === 0, "ordinary nested uses mappings must not be parsed as action references");
  console.log("PASS accepts ordinary nested uses mappings outside action contexts");
  console.log(`WORKFLOW CONTRACT MUTATION TESTS PASSED — baseline + ${mutations.length + 4} cases`);
}

try {
  const workflows = loadWorkflows();
  const errors = validate(workflows);
  if (errors.length) throw new Error(errors.join("\n- "));
  console.log("WORKFLOW CONTRACT VALIDATION PASSED");
  if (process.argv.includes("--self-test")) selfTest(workflows);
  if (process.argv.some((argument) => argument !== "--self-test" && argument !== process.argv[0] && argument !== process.argv[1])) {
    throw new Error("Usage: node scripts/validate_workflows.mjs [--self-test]");
  }
} catch (error) {
  console.error(`WORKFLOW CONTRACT VALIDATION FAILED — ${error.message}`);
  process.exitCode = 1;
}
