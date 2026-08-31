import fs from "node:fs";
import vm from "node:vm";

const EXPECTED_SCHEMA_VERSION = "1.0.0";
const EXPECTED_OVERLAY_ID = "eu-fi";
const EXPECTED_OVERLAY_VERSION = "0.1.0-pilot";
const EXPECTED_REVIEW_DATE = "2026-08-29";
const EXPECTED_ANNOTATION_IDS = new Set([
  "eu-fi-cyber-nis2-directive",
  "eu-fi-cyber-finland-act",
  "eu-fi-cyber-implementing-regulation",
  "eu-fi-cyber-enisa-guidance",
  "eu-fi-cyber-traficom-reporting",
  "eu-fi-osh-framework-directive",
  "eu-fi-osh-finland-act",
  "eu-fi-osh-occupational-health-care",
  "eu-fi-osh-risk-assessment-guidance",
  "eu-fi-environment-seveso",
  "eu-fi-environment-finland-chemical-safety",
  "eu-fi-environment-tukes-safety-report",
  "eu-fi-environment-industrial-emissions",
  "eu-fi-environment-finland-protection-act"
]);
const CANONICAL_PHASE_IDS = ["identify", "protect", "detect", "respond", "recover"];
const PHASE_CODES = new Map([
  ["identify", "I"],
  ["protect", "P"],
  ["detect", "D"],
  ["respond", "R"],
  ["recover", "RC"]
]);
const PILOT_DOMAIN_IDS = new Set([
  "information-and-cyber-security",
  "industrial-safety",
  "environmental-safety"
]);
const ALLOWED_KINDS = new Set(["eu-law", "fi-law", "authority-guidance", "voluntary-standard"]);
const ALLOWED_STATUSES = new Set(["in-force", "current-guidance"]);
const ALLOWED_JURISDICTIONS = new Set(["EU", "FI"]);
const ALLOWED_SOURCE_HOSTS = new Set([
  "eur-lex.europa.eu",
  "finlex.fi",
  "www.finlex.fi",
  "data.finlex.fi",
  "enisa.europa.eu",
  "www.enisa.europa.eu",
  "kyberturvallisuuskeskus.fi",
  "www.kyberturvallisuuskeskus.fi",
  "traficom.fi",
  "www.traficom.fi",
  "osha.europa.eu",
  "oira.osha.europa.eu",
  "tukes.fi",
  "www.tukes.fi"
]);

const TOP_LEVEL_KEYS = new Set(["schemaVersion", "overlays"]);
const OVERLAY_KEYS = new Set([
  "id",
  "version",
  "label",
  "jurisdictions",
  "scope",
  "applicability",
  "status",
  "reviewedAt",
  "nextReview",
  "authority",
  "disclaimer",
  "annotations"
]);
const SCOPE_KEYS = new Set(["domainIds", "phaseIds", "entryLevelMappings"]);
const ANNOTATION_KEYS = new Set([
  "id",
  "version",
  "kind",
  "relationship",
  "domainId",
  "phaseIds",
  "entryIds",
  "jurisdictions",
  "title",
  "summary",
  "applicability",
  "effective",
  "status",
  "reviewedOn",
  "authority",
  "sources"
]);
const SOURCE_KEYS = new Set([
  "id",
  "title",
  "authority",
  "type",
  "jurisdiction",
  "status",
  "reviewedOn",
  "url"
]);

const coreSource = fs.readFileSync(new URL("../matrix-domains.js", import.meta.url), "utf8");
const overlaySource = fs.readFileSync(new URL("../matrix-overlays.js", import.meta.url), "utf8");
const sourceMapping = fs.readFileSync(new URL("../OVERLAY-EU-FI.md", import.meta.url), "utf8");
const sourceLibrary = fs.readFileSync(new URL("../SOURCE-LIBRARY.md", import.meta.url), "utf8");
const sourceMappingLines = sourceMapping.split(/\r?\n/);
const sourceMappingRowsByAnnotationId = new Map();
for (const line of sourceMappingLines) {
  const match = /^\| `(eu-fi-(?:cyber|osh|environment)-[a-z0-9-]+)` \|/.exec(line);
  if (!match) continue;
  const rows = sourceMappingRowsByAnnotationId.get(match[1]) ?? [];
  rows.push(line);
  sourceMappingRowsByAnnotationId.set(match[1], rows);
}
const documentedAnnotationIds = new Set(sourceMappingRowsByAnnotationId.keys());
const sourceLibraryParseErrors = [];
const sourceLibraryRowsBySourceId = new Map();
const overlaySourceHeadingMatches = [
  ...sourceLibrary.matchAll(/^## EU–Finland overlay pilot sources\s*$/gm)
];
if (overlaySourceHeadingMatches.length !== 1) {
  sourceLibraryParseErrors.push(
    "SOURCE-LIBRARY.md must contain exactly one EU–Finland overlay pilot sources section."
  );
} else {
  const sectionStart = overlaySourceHeadingMatches[0].index + overlaySourceHeadingMatches[0][0].length;
  const remainingLibrary = sourceLibrary.slice(sectionStart);
  const nextHeadingIndex = remainingLibrary.search(/^## /m);
  const overlaySourceSection =
    nextHeadingIndex < 0 ? remainingLibrary : remainingLibrary.slice(0, nextHeadingIndex);
  let sawTableHeader = false;
  let sawTableSeparator = false;

  for (const rawLine of overlaySourceSection.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (line === "| Stable source ID | Official record | URL |") {
      if (sawTableHeader) sourceLibraryParseErrors.push("Overlay source-library table header is duplicated.");
      sawTableHeader = true;
      continue;
    }
    if (line === "| --- | --- | --- |") {
      if (!sawTableHeader || sawTableSeparator) {
        sourceLibraryParseErrors.push("Overlay source-library table separator is missing or duplicated.");
      }
      sawTableSeparator = true;
      continue;
    }
    if (!line.startsWith("|")) continue;
    if (!sawTableHeader || !sawTableSeparator) {
      sourceLibraryParseErrors.push("Overlay source-library data rows must follow the canonical table header.");
    }

    const cells = line.endsWith("|")
      ? line.slice(1, -1).split("|").map((cell) => cell.trim())
      : [];
    const sourceIdMatch = /^`([^`]+)`$/.exec(cells[0] ?? "");
    if (!sourceIdMatch || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(sourceIdMatch[1])) {
      sourceLibraryParseErrors.push(`Overlay source-library row has an invalid stable source ID: ${line}`);
      continue;
    }

    const sourceId = sourceIdMatch[1];
    const officialRecordTitle = cells[1] ?? "";
    const urlMatch = /^<(https:\/\/[^>\s]+)>$/.exec(cells[2] ?? "");
    if (cells.length !== 3) {
      sourceLibraryParseErrors.push(`${sourceId} source-library row must contain exactly three columns.`);
    }
    if (
      !isNonEmptyString(officialRecordTitle) ||
      /\[[^\]]*\](?:\([^)]*\)|\[[^\]]*\])|<[^>]*>|(?:https?:\/\/|www\.)|`/i.test(officialRecordTitle)
    ) {
      sourceLibraryParseErrors.push(
        `${sourceId} source-library official record cell must be plain text without links.`
      );
    }
    if (!urlMatch) {
      sourceLibraryParseErrors.push(`${sourceId} source-library URL must use a bare HTTPS autolink.`);
    }

    const rows = sourceLibraryRowsBySourceId.get(sourceId) ?? [];
    rows.push({ line, url: urlMatch?.[1] ?? "" });
    sourceLibraryRowsBySourceId.set(sourceId, rows);
  }
  if (!sawTableHeader || !sawTableSeparator) {
    sourceLibraryParseErrors.push("Overlay source-library table must use the canonical three-column header.");
  }
}
const context = vm.createContext({});
vm.runInContext(
  `${coreSource}\n${overlaySource}\n;globalThis.__overlayData = { phases, domains, matrixOverlays };`,
  context,
  { filename: "matrix-overlays.bundle.js", timeout: 5_000 }
);

const { phases, domains, matrixOverlays } = context.__overlayData;
const errors = [];
errors.push(...sourceLibraryParseErrors);

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function validateExactKeys(value, expectedKeys, location) {
  if (!isRecord(value)) return;
  for (const key of Object.keys(value)) {
    if (!expectedKeys.has(key)) errors.push(`${location} has unknown field: ${key}.`);
  }
}

function validateText(value, location, maximumLength = 600) {
  if (!isNonEmptyString(value)) {
    errors.push(`${location} must be a non-empty string.`);
    return;
  }
  if (value !== value.trim()) errors.push(`${location} has leading or trailing whitespace.`);
  if (Array.from(value).length > maximumLength) {
    errors.push(`${location} exceeds ${maximumLength} characters.`);
  }
  if (/[<>]/.test(value)) errors.push(`${location} must be plain text without angle brackets.`);
}

function isIsoDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function validateJurisdictions(value, location) {
  if (!Array.isArray(value) || value.length === 0) {
    errors.push(`${location} must be a non-empty array.`);
    return;
  }
  const unique = new Set(value);
  if (unique.size !== value.length) errors.push(`${location} must not contain duplicates.`);
  for (const jurisdiction of value) {
    if (!ALLOWED_JURISDICTIONS.has(jurisdiction)) {
      errors.push(`${location} contains unsupported jurisdiction: ${jurisdiction}.`);
    }
  }
}

function validateSourceUrl(value, location) {
  if (!isNonEmptyString(value)) {
    errors.push(`${location} must be a non-empty URL string.`);
    return;
  }
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") errors.push(`${location} must use HTTPS: ${value}`);
    if (!ALLOWED_SOURCE_HOSTS.has(url.hostname)) {
      errors.push(`${location} must use an approved official source host: ${url.hostname}.`);
    }
    if (url.username || url.password) errors.push(`${location} must not contain credentials.`);
  } catch {
    errors.push(`${location} is not a valid absolute URL: ${value}`);
  }
}

function extractMarkdownLinkUrls(line) {
  return [...line.matchAll(/\[[^\]]*\]\(([^)\s]+)\)/g)].map((match) => match[1]);
}

function setsAreEqual(left, right) {
  return left.size === right.size && [...left].every((value) => right.has(value));
}

const phaseIds = Array.isArray(phases) ? phases.map((phase) => phase.id) : [];
const domainIds = Array.isArray(domains) ? domains.map((domain) => domain.id) : [];
const domainCodeById = new Map(domainIds.map((domainId, index) => [domainId, `D${String(index + 1).padStart(2, "0")}`]));

if (JSON.stringify(phaseIds) !== JSON.stringify(CANONICAL_PHASE_IDS)) {
  errors.push(`Core phase contract must remain ${CANONICAL_PHASE_IDS.join(", ")}.`);
}
for (const domainId of PILOT_DOMAIN_IDS) {
  if (!domainIds.includes(domainId)) errors.push(`Pilot domain is missing from the core matrix: ${domainId}.`);
}

if (!isRecord(matrixOverlays)) {
  errors.push("matrixOverlays must be an object.");
} else {
  validateExactKeys(matrixOverlays, TOP_LEVEL_KEYS, "matrixOverlays");
  if (matrixOverlays.schemaVersion !== EXPECTED_SCHEMA_VERSION) {
    errors.push(`matrixOverlays.schemaVersion must be ${EXPECTED_SCHEMA_VERSION}.`);
  }
  if (!Array.isArray(matrixOverlays.overlays) || matrixOverlays.overlays.length !== 1) {
    errors.push("matrixOverlays.overlays must contain exactly the EU–Finland pilot overlay.");
  }
}

const overlays = Array.isArray(matrixOverlays?.overlays) ? matrixOverlays.overlays : [];
const overlayIds = new Set();
const annotationIds = new Set();
const allSourceIds = new Set();
const allSourceUrls = new Set();
const domainCoverage = new Map(
  [...PILOT_DOMAIN_IDS].map((domainId) => [domainId, new Set()])
);

for (const [overlayIndex, overlay] of overlays.entries()) {
  const location = `matrixOverlays.overlays[${overlayIndex}]`;
  if (!isRecord(overlay)) {
    errors.push(`${location} must be an object.`);
    continue;
  }
  validateExactKeys(overlay, OVERLAY_KEYS, location);
  for (const field of [
    "id",
    "version",
    "label",
    "applicability",
    "status",
    "reviewedAt",
    "nextReview",
    "authority",
    "disclaimer"
  ]) {
    validateText(overlay[field], `${location}.${field}`);
  }
  if (overlay.id !== EXPECTED_OVERLAY_ID) errors.push(`${location}.id must be ${EXPECTED_OVERLAY_ID}.`);
  if (overlay.version !== EXPECTED_OVERLAY_VERSION) {
    errors.push(`${location}.version must be ${EXPECTED_OVERLAY_VERSION}.`);
  }
  if (overlay.status !== "pilot") errors.push(`${location}.status must be pilot.`);
  if (overlay.reviewedAt !== EXPECTED_REVIEW_DATE) {
    errors.push(`${location}.reviewedAt must be ${EXPECTED_REVIEW_DATE}.`);
  }
  if (!isIsoDate(overlay.nextReview) || overlay.nextReview <= EXPECTED_REVIEW_DATE) {
    errors.push(`${location}.nextReview must be an ISO date after ${EXPECTED_REVIEW_DATE}.`);
  }
  if (overlayIds.has(overlay.id)) errors.push(`Duplicate overlay ID: ${overlay.id}.`);
  overlayIds.add(overlay.id);
  validateJurisdictions(overlay.jurisdictions, `${location}.jurisdictions`);
  if (!overlay.jurisdictions?.includes("EU") || !overlay.jurisdictions?.includes("FI")) {
    errors.push(`${location}.jurisdictions must include EU and FI.`);
  }
  if (!isRecord(overlay.scope)) {
    errors.push(`${location}.scope must be an object.`);
  } else {
    validateExactKeys(overlay.scope, SCOPE_KEYS, `${location}.scope`);
    if (JSON.stringify(overlay.scope.domainIds) !== JSON.stringify([...PILOT_DOMAIN_IDS])) {
      errors.push(`${location}.scope.domainIds must contain the three canonical pilot domains in contract order.`);
    }
    if (JSON.stringify(overlay.scope.phaseIds) !== JSON.stringify(CANONICAL_PHASE_IDS)) {
      errors.push(`${location}.scope.phaseIds must contain the five canonical phases in order.`);
    }
    if (overlay.scope.entryLevelMappings !== false) {
      errors.push(`${location}.scope.entryLevelMappings must remain false until exact entry relationships are verified.`);
    }
  }
  if (!Array.isArray(overlay.annotations) || overlay.annotations.length === 0) {
    errors.push(`${location}.annotations must be a non-empty array.`);
    continue;
  }

  for (const [annotationIndex, annotation] of overlay.annotations.entries()) {
    const annotationLocation = `${location}.annotations[${annotationIndex}]`;
    if (!isRecord(annotation)) {
      errors.push(`${annotationLocation} must be an object.`);
      continue;
    }
    validateExactKeys(annotation, ANNOTATION_KEYS, annotationLocation);
    for (const field of [
      "id",
      "version",
      "kind",
      "relationship",
      "domainId",
      "title",
      "summary",
      "applicability",
      "effective",
      "status",
      "reviewedOn",
      "authority"
    ]) {
      validateText(annotation[field], `${annotationLocation}.${field}`);
    }

    if (!/^eu-fi-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(annotation.id ?? "")) {
      errors.push(`${annotationLocation}.id must be a stable eu-fi-* identifier.`);
    }
    if (annotationIds.has(annotation.id)) errors.push(`Duplicate annotation ID: ${annotation.id}.`);
    annotationIds.add(annotation.id);
    const sourceMappingRows = sourceMappingRowsByAnnotationId.get(annotation.id) ?? [];
    if (sourceMappingRows.length !== 1) {
      errors.push(
        `${annotationLocation} must have exactly one source-mapping row in OVERLAY-EU-FI.md; ` +
          `found ${sourceMappingRows.length}.`
      );
    }
    const sourceMappingRow = sourceMappingRows.length === 1 ? sourceMappingRows[0] : "";
    if (annotation.version !== "1.0.0") errors.push(`${annotationLocation}.version must be 1.0.0.`);
    if (!ALLOWED_KINDS.has(annotation.kind)) {
      errors.push(`${annotationLocation}.kind is unsupported: ${annotation.kind}.`);
    }
    if (annotation.relationship !== "context") {
      errors.push(`${annotationLocation}.relationship must be context.`);
    }
    if (!PILOT_DOMAIN_IDS.has(annotation.domainId)) {
      errors.push(`${annotationLocation}.domainId is outside the pilot: ${annotation.domainId}.`);
    } else {
      domainCoverage.get(annotation.domainId).add(annotation.kind);
    }
    if (!Array.isArray(annotation.phaseIds) || annotation.phaseIds.length === 0) {
      errors.push(`${annotationLocation}.phaseIds must be a non-empty array.`);
    } else {
      const uniquePhaseIds = new Set(annotation.phaseIds);
      if (uniquePhaseIds.size !== annotation.phaseIds.length) {
        errors.push(`${annotationLocation}.phaseIds must not contain duplicates.`);
      }
      for (const phaseId of annotation.phaseIds) {
        if (!CANONICAL_PHASE_IDS.includes(phaseId)) {
          errors.push(`${annotationLocation}.phaseIds contains unknown phase: ${phaseId}.`);
        }
      }
    }

    if (annotation.entryIds !== undefined) {
      if (overlay.scope?.entryLevelMappings === false) {
        errors.push(`${annotationLocation}.entryIds is not allowed while scope.entryLevelMappings is false.`);
      }
      if (!Array.isArray(annotation.entryIds) || annotation.entryIds.length === 0) {
        errors.push(`${annotationLocation}.entryIds must be omitted or contain at least one verified entry ID.`);
      } else {
        const uniqueEntryIds = new Set(annotation.entryIds);
        if (uniqueEntryIds.size !== annotation.entryIds.length) {
          errors.push(`${annotationLocation}.entryIds must not contain duplicates.`);
        }
        const expectedDomainCode = domainCodeById.get(annotation.domainId);
        const allowedPhaseCodes = new Set((annotation.phaseIds ?? []).map((phaseId) => PHASE_CODES.get(phaseId)));
        for (const entryId of annotation.entryIds) {
          const match = /^CSM-(D\d{2})-(I|P|D|R|RC)-(A|R|M)\d{2}$/.exec(entryId);
          if (!match) {
            errors.push(`${annotationLocation}.entryIds contains an invalid entry ID: ${entryId}.`);
          } else if (match[1] !== expectedDomainCode || !allowedPhaseCodes.has(match[2])) {
            errors.push(`${annotationLocation}.entryIds contains an entry outside its domain or phases: ${entryId}.`);
          }
        }
      }
    }

    validateJurisdictions(annotation.jurisdictions, `${annotationLocation}.jurisdictions`);
    if (annotation.kind === "eu-law" && !annotation.jurisdictions?.includes("EU")) {
      errors.push(`${annotationLocation} EU law must include EU jurisdiction.`);
    }
    if (annotation.kind === "fi-law" && !annotation.jurisdictions?.includes("FI")) {
      errors.push(`${annotationLocation} Finnish law must include FI jurisdiction.`);
    }
    if (!isIsoDate(annotation.effective)) {
      errors.push(`${annotationLocation}.effective must be an ISO date.`);
    }
    if (annotation.reviewedOn !== EXPECTED_REVIEW_DATE) {
      errors.push(`${annotationLocation}.reviewedOn must be ${EXPECTED_REVIEW_DATE}.`);
    }
    if (isIsoDate(annotation.effective) && annotation.effective > annotation.reviewedOn) {
      errors.push(`${annotationLocation}.effective must not be later than reviewedOn.`);
    }
    if (!ALLOWED_STATUSES.has(annotation.status)) {
      errors.push(`${annotationLocation}.status is unsupported: ${annotation.status}.`);
    }
    if (!Array.isArray(annotation.sources) || annotation.sources.length === 0) {
      errors.push(`${annotationLocation}.sources must be a non-empty array.`);
    } else {
      const sourceIds = new Set();
      const sourceUrls = new Set();
      annotation.sources.forEach((source, sourceIndex) => {
        const sourceLocation = `${annotationLocation}.sources[${sourceIndex}]`;
        if (!isRecord(source)) {
          errors.push(`${sourceLocation} must be an object.`);
          return;
        }
        validateExactKeys(source, SOURCE_KEYS, sourceLocation);
        for (const field of [
          "id",
          "title",
          "authority",
          "type",
          "jurisdiction",
          "status",
          "reviewedOn"
        ]) {
          validateText(source[field], `${sourceLocation}.${field}`);
        }
        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(source.id ?? "")) {
          errors.push(`${sourceLocation}.id must be a lowercase stable identifier.`);
        }
        if (sourceIds.has(source.id)) errors.push(`${annotationLocation}.sources repeats source ID: ${source.id}.`);
        sourceIds.add(source.id);
        if (allSourceIds.has(source.id)) errors.push(`Overlay repeats source ID: ${source.id}.`);
        allSourceIds.add(source.id);
        const canonicalSourceRows = sourceLibraryRowsBySourceId.get(source.id) ?? [];
        if (canonicalSourceRows.length !== 1) {
          errors.push(
            `${sourceLocation} must have exactly one canonical source-library row in SOURCE-LIBRARY.md; ` +
              `found ${canonicalSourceRows.length}.`
          );
        } else if (canonicalSourceRows[0].url !== source.url) {
          errors.push(`${sourceLocation}.url does not match its canonical SOURCE-LIBRARY.md row.`);
        }
        if (!ALLOWED_JURISDICTIONS.has(source.jurisdiction)) {
          errors.push(`${sourceLocation}.jurisdiction is unsupported: ${source.jurisdiction}.`);
        }
        if (source.reviewedOn !== EXPECTED_REVIEW_DATE) {
          errors.push(`${sourceLocation}.reviewedOn must be ${EXPECTED_REVIEW_DATE}.`);
        }
        validateSourceUrl(source.url, `${sourceLocation}.url`);
        if (sourceUrls.has(source.url)) errors.push(`${annotationLocation}.sources repeats URL: ${source.url}.`);
        sourceUrls.add(source.url);
        if (allSourceUrls.has(source.url)) errors.push(`Overlay repeats source URL: ${source.url}.`);
        allSourceUrls.add(source.url);
      });
      const documentedSourceUrls = extractMarkdownLinkUrls(sourceMappingRow);
      const documentedSourceUrlSet = new Set(documentedSourceUrls);
      if (
        documentedSourceUrls.length !== documentedSourceUrlSet.size ||
        !setsAreEqual(sourceUrls, documentedSourceUrlSet)
      ) {
        errors.push(`${annotationLocation} source URL set does not match its OVERLAY-EU-FI.md row exactly.`);
      }
    }
  }
}

for (const expectedId of EXPECTED_ANNOTATION_IDS) {
  if (!annotationIds.has(expectedId)) errors.push(`Pilot annotation is missing: ${expectedId}.`);
}
for (const annotationId of annotationIds) {
  if (!EXPECTED_ANNOTATION_IDS.has(annotationId)) {
    errors.push(`Pilot annotation is not part of the ${EXPECTED_OVERLAY_VERSION} contract: ${annotationId}.`);
  }
}
for (const documentedId of documentedAnnotationIds) {
  if (!annotationIds.has(documentedId)) {
    errors.push(`OVERLAY-EU-FI.md contains an annotation ID that is missing from data: ${documentedId}.`);
  }
}
for (const sourceId of sourceLibraryRowsBySourceId.keys()) {
  if (!allSourceIds.has(sourceId)) {
    errors.push(`SOURCE-LIBRARY.md contains an overlay source ID that is missing from data: ${sourceId}.`);
  }
}

for (const [domainId, kinds] of domainCoverage) {
  if (!kinds.has("eu-law")) errors.push(`${domainId} must include at least one EU-law annotation.`);
  if (!kinds.has("fi-law")) errors.push(`${domainId} must include at least one Finnish-law annotation.`);
  if (!kinds.has("authority-guidance")) {
    errors.push(`${domainId} must include at least one authority-guidance annotation.`);
  }
}

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}

console.log(
  `OVERLAY VALIDATION PASSED — ${overlays.length} overlay, ${annotationIds.size} annotations, ` +
    `${PILOT_DOMAIN_IDS.size} pilot domains and ${EXPECTED_REVIEW_DATE} source review.`
);
