import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataFiles = [
  "matrix-domains.js",
  "matrix-actors.js",
  "matrix-briefs.js",
  "matrix-references.js"
];

const cases = [
  {
    name: "accepts the canonical dataset",
    mutation: "",
    expectedStatus: 0
  },
  {
    name: "keeps stable IDs valid when entries are reordered",
    mutation: "domains[0].cells.identify.threats.reverse();",
    expectedStatus: 0
  },
  {
    name: "rejects the wrong lifecycle phase order",
    mutation: "phases.reverse();",
    expectedError: "Lifecycle phase IDs must appear in canonical order"
  },
  {
    name: "rejects a renamed lifecycle phase even when all dependent keys are renamed",
    mutation: `
      phases[0].id = "discover";
      for (const domain of domains) {
        domain.cells.discover = domain.cells.identify;
        delete domain.cells.identify;
        domain.actors.discover = domain.actors.identify;
        delete domain.actors.identify;
        domain.phaseFraming.discover = domain.phaseFraming.identify;
        delete domain.phaseFraming.identify;
        phaseEvidenceByDomain[domain.id].discover = phaseEvidenceByDomain[domain.id].identify;
        delete phaseEvidenceByDomain[domain.id].identify;
      }
    `,
    expectedError: "Lifecycle phase IDs must appear in canonical order"
  },
  {
    name: "rejects the wrong security domain order",
    mutation: "domains.reverse();",
    expectedError: "Security domain IDs must appear in canonical order"
  },
  {
    name: "rejects a legacy string entry",
    mutation: "domains[0].cells.identify.threats[0] = domains[0].cells.identify.threats[0].text;",
    expectedError: "must be an object with exactly id, text and reviewState"
  },
  {
    name: "rejects a non-reviewed production entry",
    mutation: "domains[0].cells.identify.threats[0].reviewState = 'draft';",
    expectedError: "reviewState must be \"reviewed\""
  },
  {
    name: "rejects duplicate entry IDs",
    mutation: "domains[0].cells.identify.threats[1].id = domains[0].cells.identify.threats[0].id;",
    expectedError: "duplicate entry ID"
  },
  {
    name: "rejects an entry ID outside its domain, phase and layer",
    mutation: "domains[0].cells.identify.threats[0].id = 'CSM-D09-I-R01';",
    expectedError: "must match CSM-D01-I-Rxx"
  },
  {
    name: "rejects a missing canonical layer suffix",
    mutation: "domains[0].cells.identify.threats[0].id = 'CSM-D01-I-R99';",
    expectedError: "must use suffixes 01, 02, 03, 04 exactly once"
  },
  {
    name: "rejects normalized duplicate entry text",
    mutation: "domains[0].cells.identify.threats[1].text = domains[0].cells.identify.threats[0].text.toUpperCase();",
    expectedError: "duplicates normalized entry text"
  },
  {
    name: "rejects a moved entry even when global layer totals stay unchanged",
    mutation: "domains[0].cells.protect.threats.push(domains[0].cells.identify.threats.pop());",
    expectedError: "must contain exactly 4 risks or failure modes"
  },
  {
    name: "rejects 58 sources even when mappings remain internally consistent",
    mutation: `
      const domainId = domains[0].id;
      const removedSourceId = referencesByDomain[domainId].pop().id;
      for (const mapping of Object.values(phaseEvidenceByDomain[domainId])) {
        mapping.sourceIds = mapping.sourceIds.filter((sourceId) => sourceId !== removedSourceId);
      }
    `,
    expectedError: "Expected exactly 59 source records"
  }
];

function prepareFixture(mutation) {
  const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), "csm-data-contract-"));
  const scriptsRoot = path.join(fixtureRoot, "scripts");
  fs.mkdirSync(scriptsRoot);

  for (const dataFile of dataFiles) {
    fs.copyFileSync(path.join(projectRoot, dataFile), path.join(fixtureRoot, dataFile));
  }
  fs.copyFileSync(
    path.join(projectRoot, "scripts", "validate_data.mjs"),
    path.join(scriptsRoot, "validate_data.mjs")
  );

  if (mutation) {
    fs.appendFileSync(path.join(fixtureRoot, "matrix-references.js"), `\n${mutation}\n`);
  }
  return fixtureRoot;
}

let failures = 0;
for (const testCase of cases) {
  const fixtureRoot = prepareFixture(testCase.mutation);
  try {
    const result = spawnSync(process.execPath, [path.join(fixtureRoot, "scripts", "validate_data.mjs")], {
      cwd: fixtureRoot,
      encoding: "utf8"
    });
    const output = `${result.stdout}${result.stderr}`;

    if (testCase.expectedStatus === 0) {
      assert.equal(result.status, 0, output);
    } else {
      assert.notEqual(result.status, 0, `Validator accepted invalid data.\n${output}`);
      assert.match(output, new RegExp(testCase.expectedError.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    }
    console.log(`PASS — ${testCase.name}`);
  } catch (error) {
    failures += 1;
    console.error(`FAIL — ${testCase.name}\n${error.message}`);
  } finally {
    fs.rmSync(fixtureRoot, { recursive: true, force: true });
  }
}

if (failures) process.exit(1);
console.log(`DATA CONTRACT TESTS PASSED — ${cases.length} cases.`);
