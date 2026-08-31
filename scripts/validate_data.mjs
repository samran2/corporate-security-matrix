import fs from "node:fs";
import vm from "node:vm";

const EXPECTED_PHASES = [
  { id: "identify", code: "I" },
  { id: "protect", code: "P" },
  { id: "detect", code: "D" },
  { id: "respond", code: "R" },
  { id: "recover", code: "RC" }
];
const EXPECTED_DOMAIN_IDS = [
  "personnel-security",
  "premises-security",
  "rescue-safety",
  "security-of-production-and-operations",
  "environmental-safety",
  "information-and-cyber-security",
  "compliance-control",
  "contingency-and-crisis-management",
  "industrial-safety"
];
const EXPECTED_ENTRY_COUNT = 495;
const EXPECTED_LAYER_COUNTS = { actors: 135, threats: 180, controls: 180 };
const EXPECTED_CELL_LAYERS = {
  actors: { count: 3, code: "A", label: "threat sources" },
  threats: { count: 4, code: "R", label: "risks or failure modes" },
  controls: { count: 4, code: "M", label: "controls or response actions" }
};
const EXPECTED_REFERENCE_COUNT = 59;
const ENTRY_FIELDS = ["id", "reviewState", "text"];
const VERIFIED_ON = "2026-08-29";

const REQUIRED_SOURCE_FIELDS = [
  "id",
  "shortTitle",
  "org",
  "type",
  "title",
  "note",
  "url",
  "jurisdiction",
  "authority",
  "access",
  "applicability",
  "verifiedOn",
  "status",
  "editionNote"
];

const BANNED_LANGUAGE = [
  { pattern: /\bunsafe worker\b/i, label: "unsafe worker" },
  { pattern: /\bunstable person\b/i, label: "unstable person" },
  { pattern: /\bnatural disaster\b/i, label: "natural disaster" },
  { pattern: /\bbefore facts disappear\b/i, label: "before facts disappear" },
  { pattern: /\bin real time\b/i, label: "in real time" }
];

const sourceFiles = [
  "matrix-domains.js",
  "matrix-actors.js",
  "matrix-briefs.js",
  "matrix-references.js"
];

const source = sourceFiles
  .map((file) => fs.readFileSync(new URL(`../${file}`, import.meta.url), "utf8"))
  .join("\n") + `
;globalThis.__matrix = {
  phases,
  domains,
  referencesByDomain,
  phaseEvidenceByDomain: typeof phaseEvidenceByDomain === "undefined" ? undefined : phaseEvidenceByDomain
};`;

const context = vm.createContext({});
vm.runInContext(source, context, { filename: "matrix-data.bundle.js", timeout: 5_000 });

const { phases, domains, referencesByDomain, phaseEvidenceByDomain } = context.__matrix;
const errors = [];

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function validateText(value, location) {
  if (!isNonEmptyString(value)) {
    errors.push(`${location} must be a non-empty string.`);
    return;
  }

  const trimmed = value.trim();
  if (value !== trimmed) errors.push(`${location} has leading or trailing whitespace.`);
  if (trimmed.endsWith(".")) errors.push(`${location} must not end with a period.`);
}

function normalizeEntryText(value) {
  return value.normalize("NFKC").trim().replace(/\s+/g, " ").toLocaleLowerCase("en-US");
}

function sameValues(actual, expected) {
  return actual.length === expected.length && actual.every((value, index) => value === expected[index]);
}

function validateExactKeys(value, expectedKeys, location) {
  if (!isRecord(value)) {
    errors.push(`${location} must be an object.`);
    return;
  }
  const actualKeys = Object.keys(value).sort();
  const sortedExpectedKeys = [...expectedKeys].sort();
  if (!sameValues(actualKeys, sortedExpectedKeys)) {
    errors.push(`${location} must contain exactly these keys: ${expectedKeys.join(", ")}.`);
  }
}

function validateEntry(entry, { location, idPrefix, entryIds, entryTexts, suffixes }) {
  if (!isRecord(entry) || !sameValues(Object.keys(entry).sort(), ENTRY_FIELDS)) {
    errors.push(`${location} must be an object with exactly id, text and reviewState.`);
    return;
  }

  validateText(entry.text, `${location}.text`);
  if (entry.reviewState !== "reviewed") {
    errors.push(`${location}.reviewState must be "reviewed".`);
  }

  if (!isNonEmptyString(entry.id)) {
    errors.push(`${location}.id must be a non-empty string.`);
  } else {
    const match = entry.id.match(new RegExp(`^${idPrefix}(\\d{2})$`));
    if (!match) {
      errors.push(`${location}.id must match ${idPrefix}xx; found ${entry.id}.`);
    } else {
      suffixes.push(match[1]);
    }
    if (entryIds.has(entry.id)) {
      errors.push(`${location} has duplicate entry ID: ${entry.id}.`);
    } else {
      entryIds.set(entry.id, location);
    }
  }

  if (isNonEmptyString(entry.text)) {
    const normalizedText = normalizeEntryText(entry.text);
    if (entryTexts.has(normalizedText)) {
      errors.push(`${location}.text duplicates normalized entry text at ${entryTexts.get(normalizedText)}.`);
    } else {
      entryTexts.set(normalizedText, `${location}.text`);
    }
  }
}

function visitStrings(value, location, callback) {
  if (typeof value === "string") {
    callback(value, location);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => visitStrings(item, `${location}[${index}]`, callback));
    return;
  }
  if (isRecord(value)) {
    for (const [key, item] of Object.entries(value)) {
      visitStrings(item, `${location}.${key}`, callback);
    }
  }
}

function validateLanguage(value, location) {
  for (const { pattern, label } of BANNED_LANGUAGE) {
    if (pattern.test(value)) errors.push(`${location} contains legacy or ambiguous language: "${label}".`);
  }
}

function validateHttpsUrl(value, location) {
  if (!isNonEmptyString(value)) return;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || !value.startsWith("https://") || !url.hostname) {
      errors.push(`${location} must be an absolute HTTPS URL: ${value}`);
    }
  } catch {
    errors.push(`${location} is not a valid URL: ${value}`);
  }
}

if (!Array.isArray(phases)) {
  errors.push("Lifecycle phases must be an array.");
} else if (phases.length !== EXPECTED_PHASES.length) {
  errors.push(`Expected ${EXPECTED_PHASES.length} lifecycle phases, found ${phases.length}.`);
}

if (!Array.isArray(domains)) {
  errors.push("Security domains must be an array.");
} else if (domains.length !== EXPECTED_DOMAIN_IDS.length) {
  errors.push(`Expected ${EXPECTED_DOMAIN_IDS.length} security domains, found ${domains.length}.`);
}

const safePhases = Array.isArray(phases) ? phases : [];
const safeDomains = Array.isArray(domains) ? domains : [];
const actualPhaseIds = safePhases.map((phase) => phase?.id);
const actualDomainIds = safeDomains.map((domain) => domain?.id);
const phaseIds = new Set(actualPhaseIds.filter(isNonEmptyString));
const domainIds = new Set(actualDomainIds.filter(isNonEmptyString));
if (!sameValues(actualPhaseIds, EXPECTED_PHASES.map((phase) => phase.id))) {
  errors.push(`Lifecycle phase IDs must appear in canonical order: ${EXPECTED_PHASES.map((phase) => phase.id).join(", ")}.`);
}
if (!sameValues(actualDomainIds, EXPECTED_DOMAIN_IDS)) {
  errors.push(`Security domain IDs must appear in canonical order: ${EXPECTED_DOMAIN_IDS.join(", ")}.`);
}
if (phaseIds.size !== safePhases.length) errors.push("Lifecycle phase IDs must be unique.");
if (domainIds.size !== safeDomains.length) errors.push("Security domain IDs must be unique.");

safePhases.forEach((phase, index) => {
  if (!isRecord(phase) || !isNonEmptyString(phase.id) || !isNonEmptyString(phase.title) || !isNonEmptyString(phase.summary)) {
    errors.push(`Lifecycle phase ${index + 1} is missing required id, title or summary metadata.`);
  }
});

let totalEntries = 0;
const layerCounts = { actors: 0, threats: 0, controls: 0 };
const entryIds = new Map();
const entryTexts = new Map();

for (const [domainIndex, domain] of safeDomains.entries()) {
  if (!isRecord(domain)) {
    errors.push(`Security domain ${domainIndex + 1} must be an object.`);
    continue;
  }
  if (!isNonEmptyString(domain.id)) errors.push("A security domain is missing its ID.");
  if (!isNonEmptyString(domain.name) || !isNonEmptyString(domain.focus) || !isNonEmptyString(domain.sourceContext)) {
    errors.push(`${domain.id ?? "unknown domain"} is missing required metadata.`);
  }

  const canonicalPhaseIds = EXPECTED_PHASES.map((phase) => phase.id);
  validateExactKeys(domain.cells, canonicalPhaseIds, `${domain.id}/cells`);
  validateExactKeys(domain.actors, canonicalPhaseIds, `${domain.id}/actors`);
  validateExactKeys(domain.phaseFraming, canonicalPhaseIds, `${domain.id}/phaseFraming`);

  for (const [phaseIndex, phase] of safePhases.entries()) {
    if (!isRecord(phase)) continue;
    const phaseId = phase.id;
    const cell = domain.cells?.[phaseId];
    if (!isRecord(cell)) {
      errors.push(`${domain.id} is missing ${phaseId} cell data.`);
    } else {
      validateExactKeys(cell, ["threats", "controls"], `${domain.id}/${phaseId}/cell`);
    }

    const layers = [
      { key: "actors", entries: domain.actors?.[phaseId] },
      { key: "threats", entries: cell?.threats },
      { key: "controls", entries: cell?.controls }
    ];

    for (const layer of layers) {
      const contract = EXPECTED_CELL_LAYERS[layer.key];
      if (!Array.isArray(layer.entries)) {
        errors.push(`${domain.id}/${phaseId} ${contract.label} must be an array.`);
        continue;
      }

      if (layer.entries.length !== contract.count) {
        errors.push(
          `${domain.id}/${phaseId} must contain exactly ${contract.count} ${contract.label}; found ${layer.entries.length}.`
        );
      }

      const domainCode = String(domainIndex + 1).padStart(2, "0");
      const phaseCode = EXPECTED_PHASES[phaseIndex]?.code ?? "?";
      const idPrefix = `CSM-D${domainCode}-${phaseCode}-${contract.code}`;
      const expectedSuffixes = Array.from({ length: contract.count }, (_, index) => String(index + 1).padStart(2, "0"));
      const suffixes = [];
      layer.entries.forEach((entry, index) => {
        totalEntries += 1;
        layerCounts[layer.key] += 1;
        validateEntry(entry, {
          location: `${domain.id}/${phaseId}/${layer.key}[${index}]`,
          idPrefix,
          entryIds,
          entryTexts,
          suffixes
        });
      });
      if (!sameValues([...suffixes].sort(), expectedSuffixes)) {
        errors.push(
          `${domain.id}/${phaseId}/${layer.key} IDs must use suffixes ${expectedSuffixes.join(", ")} exactly once.`
        );
      }
    }

    if (!isNonEmptyString(domain.phaseFraming?.[phaseId])) {
      errors.push(`${domain.id}/${phaseId} is missing phase framing.`);
    }
  }

  const profile = domain.profile;
  for (const key of ["mission", "protects", "owners", "failureModes", "assuranceQuestions"]) {
    if (!profile?.[key] || (Array.isArray(profile[key]) && profile[key].length === 0)) {
      errors.push(`${domain.id} profile is missing ${key}.`);
    }
  }
}

if (totalEntries !== EXPECTED_ENTRY_COUNT) {
  errors.push(
    `Expected ${EXPECTED_ENTRY_COUNT} matrix entries, found ${totalEntries} ` +
      `(${layerCounts.actors} threat sources, ${layerCounts.threats} risks, ${layerCounts.controls} controls).`
  );
}
for (const [layer, expectedCount] of Object.entries(EXPECTED_LAYER_COUNTS)) {
  if (layerCounts[layer] !== expectedCount) {
    errors.push(`Expected ${expectedCount} ${layer} entries, found ${layerCounts[layer]}.`);
  }
}

visitStrings({ phases: safePhases, domains: safeDomains }, "matrix", validateLanguage);

const safeReferences = isRecord(referencesByDomain) ? referencesByDomain : {};
const safeEvidence = isRecord(phaseEvidenceByDomain) ? phaseEvidenceByDomain : {};
if (!isRecord(referencesByDomain)) errors.push("referencesByDomain must be an object.");
if (!isRecord(phaseEvidenceByDomain)) errors.push("phaseEvidenceByDomain must be an object.");
validateExactKeys(safeReferences, EXPECTED_DOMAIN_IDS, "referencesByDomain");
validateExactKeys(safeEvidence, EXPECTED_DOMAIN_IDS, "phaseEvidenceByDomain");

for (const domainId of Object.keys(safeReferences)) {
  if (!domainIds.has(domainId)) errors.push(`Source mappings contain unknown domain: ${domainId}.`);
}
for (const domainId of Object.keys(safeEvidence)) {
  if (!domainIds.has(domainId)) errors.push(`Phase evidence contains unknown domain: ${domainId}.`);
}

let totalReferences = 0;
for (const domain of safeDomains) {
  if (!isRecord(domain)) continue;
  const references = safeReferences[domain.id];
  const sourceIds = new Set();

  if (!Array.isArray(references) || references.length === 0) {
    errors.push(`${domain.id} has no source mappings.`);
  } else {
    totalReferences += references.length;
    references.forEach((reference, index) => {
      const location = `${domain.id}/sources[${index}]`;
      if (!isRecord(reference)) {
        errors.push(`${location} must be an object.`);
        return;
      }

      for (const field of REQUIRED_SOURCE_FIELDS) {
        if (!isNonEmptyString(reference[field])) {
          errors.push(`${location} is missing ${field}.`);
        } else if (reference[field] !== reference[field].trim()) {
          errors.push(`${location}.${field} has leading or trailing whitespace.`);
        }
      }

      if (isNonEmptyString(reference.id)) {
        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(reference.id)) {
          errors.push(`${location} has an invalid source ID: ${reference.id}.`);
        }
        if (sourceIds.has(reference.id)) errors.push(`${domain.id} has duplicate source ID: ${reference.id}.`);
        sourceIds.add(reference.id);
      }

      if (reference.verifiedOn !== VERIFIED_ON) {
        errors.push(`${location} verifiedOn must be ${VERIFIED_ON}, found ${reference.verifiedOn ?? "missing"}.`);
      }
      validateHttpsUrl(reference.url, `${location}.url`);
    });
  }

  const evidenceForDomain = safeEvidence[domain.id];
  const usedSourceIds = new Set();
  if (!isRecord(evidenceForDomain)) {
    errors.push(`${domain.id} has no phase evidence mappings.`);
  } else {
    validateExactKeys(evidenceForDomain, EXPECTED_PHASES.map((phase) => phase.id), `${domain.id}/phaseEvidence`);
    for (const phaseId of Object.keys(evidenceForDomain)) {
      if (!phaseIds.has(phaseId)) errors.push(`${domain.id} phase evidence contains unknown phase: ${phaseId}.`);
    }

    for (const phase of safePhases) {
      const mapping = evidenceForDomain[phase.id];
      const location = `${domain.id}/${phase.id}/evidence`;
      if (!isRecord(mapping)) {
        errors.push(`${location} mapping is missing.`);
        continue;
      }
      if (mapping.relationship !== "context") {
        errors.push(`${location}.relationship must be "context".`);
      }
      if (!Array.isArray(mapping.sourceIds) || mapping.sourceIds.length < 1 || mapping.sourceIds.length > 3) {
        errors.push(`${location}.sourceIds must contain 1–3 source IDs.`);
        continue;
      }

      const mappingIds = new Set();
      mapping.sourceIds.forEach((sourceId, index) => {
        if (!isNonEmptyString(sourceId)) {
          errors.push(`${location}.sourceIds[${index}] must be a non-empty string.`);
          return;
        }
        if (mappingIds.has(sourceId)) errors.push(`${location} repeats source ID: ${sourceId}.`);
        mappingIds.add(sourceId);
        usedSourceIds.add(sourceId);
        if (!sourceIds.has(sourceId)) errors.push(`${location} references unknown domain source ID: ${sourceId}.`);
      });
    }
  }

  for (const sourceId of sourceIds) {
    if (!usedSourceIds.has(sourceId)) errors.push(`${domain.id} source is orphaned from phase evidence: ${sourceId}.`);
  }
}

if (totalReferences !== EXPECTED_REFERENCE_COUNT) {
  errors.push(`Expected exactly ${EXPECTED_REFERENCE_COUNT} source records, found ${totalReferences}.`);
}

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}

console.log(
  `DATA VALIDATION PASSED — ${safeDomains.length} domains, ${safePhases.length} phases, ` +
    `${totalEntries} entries and ${totalReferences} source mappings.`
);
