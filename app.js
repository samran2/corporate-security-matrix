document.documentElement.classList.remove("no-js");

const CANONICAL_PHASE_CONTRACT = [
  { id: "identify", code: "I" },
  { id: "protect", code: "P" },
  { id: "detect", code: "D" },
  { id: "respond", code: "R" },
  { id: "recover", code: "RC" }
];
const CANONICAL_DOMAIN_IDS = [
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
const ENTRY_LAYER_CONTRACT = [
  { key: "actors", code: "A", count: 3 },
  { key: "threats", code: "R", count: 4 },
  { key: "controls", code: "M", count: 4 }
];
const CONTENT_REVIEW_DATE = "2026-08-29";
/* csm-release-scope:v1.3.0:begin */
const ALLOWED_OVERLAY_IDS = new Set(["eu-fi"]);
const ALLOWED_OVERLAY_SOURCE_HOSTS = new Set([
  "eur-lex.europa.eu",
  "data.finlex.fi",
  "finlex.fi",
  "www.finlex.fi",
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
const PILOT_OVERLAY_DOMAIN_IDS = [
  "information-and-cyber-security",
  "industrial-safety",
  "environmental-safety"
];
const EXPECTED_OVERLAY_ANNOTATION_IDS = [
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
];
const ALLOWED_OVERLAY_KINDS = new Set([
  "eu-law",
  "fi-law",
  "authority-guidance",
  "voluntary-standard"
]);
const ALLOWED_OVERLAY_STATUSES = new Set(["in-force", "current-guidance"]);
const ALLOWED_OVERLAY_JURISDICTIONS = new Set(["EU", "FI"]);
const OVERLAY_TOP_LEVEL_KEYS = new Set(["schemaVersion", "overlays"]);
const OVERLAY_RECORD_KEYS = new Set([
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
const OVERLAY_SCOPE_KEYS = new Set(["domainIds", "phaseIds", "entryLevelMappings"]);
const OVERLAY_ANNOTATION_KEYS = new Set([
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
const OVERLAY_SOURCE_KEYS = new Set([
  "id",
  "title",
  "authority",
  "type",
  "jurisdiction",
  "status",
  "reviewedOn",
  "url"
]);
/* csm-release-scope:v1.3.0:end */
const CORE_SOURCE_TEXT_FIELDS = [
  "shortTitle",
  "org",
  "type",
  "title",
  "note",
  "jurisdiction",
  "authority",
  "access",
  "applicability",
  "verifiedOn",
  "status",
  "editionNote"
];
const MITIGATION_TOOL_SCHEMA_VERSION = "1.0.0";
const MITIGATION_TOOL_FRAMEWORK_VERSION = "1.1.0-candidate";
const MITIGATION_TOOL_DISCLAIMER =
  "Tool suggestions are illustrative, vendor-neutral implementation aids. Select, configure and validate them for the organisation's context; they do not guarantee risk elimination.";
const MITIGATION_TOOL_TOP_LEVEL_KEYS = new Set([
  "schemaVersion",
  "frameworkVersion",
  "disclaimer",
  "entries"
]);
const MITIGATION_TOOL_RECORD_KEYS = new Set(["name", "use"]);
const MITIGATION_TOOL_ID_PATTERN = /^CSM-D0[1-9]-(?:I|P|D|R|RC)-M0[1-4]$/;
const MITIGATION_TOOL_URL_PATTERN =
  /(?:[a-z][a-z0-9+.-]*:\/\/|www\.|\b(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+(?:[a-z]{2,63}|xn--[a-z0-9-]{2,59})(?::\d{2,5})?(?:[/?#]\S*)?|\b(?:\d{1,3}\.){3}\d{1,3}(?::\d{2,5})?(?:[/?#]\S*)?|\[[0-9a-f:]+\](?::\d{2,5})?(?:[/?#]\S*)?)/i;
const MITIGATION_TOOL_EMAIL_PATTERN = /\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b/i;
const MITIGATION_TOOL_VENDOR_PATTERN =
  /\b(?:abb|amazon|atlassian|aws|azure|bosch|cisco|crowdstrike|datadog|fortinet|genetec|github|gitlab|google|hikvision|honeywell|ibm|jira|johnson controls|lenel|microsoft|milestone systems|okta|oracle|palo alto|proofpoint|rockwell|salesforce|sap|schneider electric|servicenow|siemens|slack|splunk|symantec|tenable|vmware|workday|zscaler)\b/i;
const MITIGATION_TOOL_ENDORSEMENT_PATTERN =
  /\b(?:best(?:-in-class)?|industry-leading|market-leading|preferred vendor|recommended vendor|world-class)\b/i;
const MITIGATION_TOOL_ABSOLUTE_CLAIM_PATTERN =
  /\b(?:zero risk|no risk|risk-free|completely safe|fully prevents?\b|(?:prevents?|stops?|blocks?) (?:all|every) (?:breaches?|failures?|harm|incidents?|risks?|threats?)|(?:eliminates?|eradicates?) (?:all |the )?(?:breaches?|failures?|harm|incidents?|risks?|threats?)|(?:certifies?|guarantees?|ensures?)(?: complete| full| total)? (?:compliance(?: with (?:all|every) requirements?)?|safety|security|protection)|(?:guarantees?|ensures?) that (?:all |every )?(?:breaches?|failures?|incidents?|risks?|threats?) never (?:happen|occur)|makes? (?:all |any |every )?(?:breaches?|failures?|harm|incidents?|risks?|threats?) impossible|cannot fail|never fails?|infallible|always (?:blocks?|detects?|ensures?|prevents?|protects?|stops?))\b/i;
const HISTORY_FOCUS_SELECTOR_PATTERN =
  /^#(?:tab-[a-z0-9-]+|view-(?:all|actors|risks|mitigations)|phase-(?:all|identify|protect|detect|respond|recover)|previousDomain|nextDomain|matrixSearch)$/;
/* csm-release-scope:v1.3.0:begin */
const OVERLAY_HISTORY_FOCUS_SELECTOR_PATTERN = /^#overlaySelect$/;
/* csm-release-scope:v1.3.0:end */

function normalizeHistoryFocusSelector(value) {
  return typeof value === "string" && (
    HISTORY_FOCUS_SELECTOR_PATTERN.test(value)
    /* csm-release-scope:v1.3.0:begin */
    || OVERLAY_HISTORY_FOCUS_SELECTOR_PATTERN.test(value)
    /* csm-release-scope:v1.3.0:end */
  ) ? value : null;
}

function isHistoryFragmentFocusTarget(value) {
  return (
    value === "matrix-explorer" ||
    value === "source-pack" ||
    (typeof value === "string" && value.startsWith("source-"))
  );
}

function writeCanonicalHistory(
  historyApi,
  { currentUrl, nextUrl, push = false, focusSelector = null, returnFocusSelector = null }
) {
  const destinationFocus = normalizeHistoryFocusSelector(focusSelector);
  const currentFocus = normalizeHistoryFocusSelector(historyApi.state?.focusSelector);
  const destinationState = { focusSelector: destinationFocus };

  if (nextUrl === currentUrl) {
    if (currentFocus !== destinationFocus) {
      historyApi.replaceState(destinationState, "", currentUrl);
    }
    return;
  }

  if (push) {
    const returnFocus = normalizeHistoryFocusSelector(returnFocusSelector) ?? currentFocus;
    if (returnFocus !== currentFocus) {
      historyApi.replaceState({ focusSelector: returnFocus }, "", currentUrl);
    }
    historyApi.pushState(destinationState, "", nextUrl);
    return;
  }

  historyApi.replaceState(destinationState, "", nextUrl);
}

function sameSequence(actual, expected) {
  return actual.length === expected.length && actual.every((value, index) => value === expected[index]);
}

function isDataRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isTrimmedNonEmptyString(value) {
  return typeof value === "string" && value.length > 0 && value === value.trim();
}

function isStrictPlainText(value, maximumLength = 600) {
  return (
    isTrimmedNonEmptyString(value) &&
    Array.from(value).length <= maximumLength &&
    !/[<>]/.test(value)
  );
}

function hasOnlyKnownKeys(value, allowedKeys) {
  return isDataRecord(value) && Object.keys(value).every((key) => allowedKeys.has(key));
}

function hasExactKeys(value, expectedKeys) {
  if (!isDataRecord(value)) return false;
  const actualKeys = Object.keys(value).sort();
  return sameSequence(actualKeys, [...expectedKeys].sort());
}

function isIsoCalendarDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function hasUniqueAllowedValues(value, allowedValues) {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    new Set(value).size === value.length &&
    value.every((item) => allowedValues.has(item))
  );
}

function normalizeEntryText(value) {
  return value.normalize("NFKC").trim().replace(/\s+/g, " ").toLocaleLowerCase("en-US");
}

function getSafeExternalHttpsUrl(value) {
  if (typeof value !== "string") return "";
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password) {
      return "";
    }
    return url.href;
  } catch {
    return "";
  }
}

/* csm-release-scope:v1.3.0:begin */
function getSafeOfficialOverlayUrl(value) {
  const safeUrl = getSafeExternalHttpsUrl(value);
  if (!safeUrl) return "";
  return ALLOWED_OVERLAY_SOURCE_HOSTS.has(new URL(safeUrl).hostname) ? safeUrl : "";
}

function validateOverlayBootstrapData() {
  if (
    !hasOnlyKnownKeys(matrixOverlays, OVERLAY_TOP_LEVEL_KEYS) ||
    matrixOverlays.schemaVersion !== "1.0.0" ||
    !Array.isArray(matrixOverlays.overlays) ||
    matrixOverlays.overlays.length !== 1
  ) {
    return false;
  }

  const overlay = matrixOverlays.overlays[0];
  if (
    !hasOnlyKnownKeys(overlay, OVERLAY_RECORD_KEYS) ||
    overlay.id !== "eu-fi" ||
    overlay.version !== "0.1.0-pilot" ||
    !isStrictPlainText(overlay.label) ||
    overlay.status !== "pilot" ||
    !hasUniqueAllowedValues(overlay.jurisdictions, ALLOWED_OVERLAY_JURISDICTIONS) ||
    !overlay.jurisdictions.includes("EU") ||
    !overlay.jurisdictions.includes("FI") ||
    !hasExactKeys(overlay.scope, OVERLAY_SCOPE_KEYS) ||
    !sameSequence(overlay.scope?.domainIds ?? [], PILOT_OVERLAY_DOMAIN_IDS) ||
    !sameSequence(overlay.scope?.phaseIds ?? [], CANONICAL_PHASE_CONTRACT.map((phase) => phase.id)) ||
    overlay.scope?.entryLevelMappings !== false ||
    !isStrictPlainText(overlay.applicability) ||
    !isStrictPlainText(overlay.authority) ||
    !isStrictPlainText(overlay.disclaimer) ||
    overlay.reviewedAt !== CONTENT_REVIEW_DATE ||
    !isIsoCalendarDate(overlay.reviewedAt) ||
    !isIsoCalendarDate(overlay.nextReview) ||
    overlay.nextReview <= CONTENT_REVIEW_DATE ||
    !Array.isArray(overlay.annotations) ||
    overlay.annotations.length !== EXPECTED_OVERLAY_ANNOTATION_IDS.length
  ) {
    return false;
  }

  const annotationIds = new Set();
  const sourceIds = new Set();
  const sourceUrls = new Set();
  const domainCoverage = new Map(PILOT_OVERLAY_DOMAIN_IDS.map((domainId) => [domainId, new Set()]));
  let sourceCount = 0;
  for (const annotation of overlay.annotations) {
    if (
      !hasOnlyKnownKeys(annotation, OVERLAY_ANNOTATION_KEYS) ||
      !/^eu-fi-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(annotation.id ?? "") ||
      annotationIds.has(annotation.id) ||
      !EXPECTED_OVERLAY_ANNOTATION_IDS.includes(annotation.id) ||
      annotation.version !== "1.0.0" ||
      annotation.relationship !== "context" ||
      !ALLOWED_OVERLAY_KINDS.has(annotation.kind) ||
      !PILOT_OVERLAY_DOMAIN_IDS.includes(annotation.domainId) ||
      !Array.isArray(annotation.phaseIds) ||
      annotation.phaseIds.length === 0 ||
      new Set(annotation.phaseIds).size !== annotation.phaseIds.length ||
      annotation.phaseIds.some((phaseId) => !CANONICAL_PHASE_CONTRACT.some((phase) => phase.id === phaseId)) ||
      annotation.entryIds !== undefined ||
      !hasUniqueAllowedValues(annotation.jurisdictions, ALLOWED_OVERLAY_JURISDICTIONS) ||
      !isStrictPlainText(annotation.title) ||
      !isStrictPlainText(annotation.summary) ||
      !isStrictPlainText(annotation.applicability) ||
      !isStrictPlainText(annotation.authority) ||
      !isIsoCalendarDate(annotation.effective) ||
      annotation.reviewedOn !== CONTENT_REVIEW_DATE ||
      !isIsoCalendarDate(annotation.reviewedOn) ||
      annotation.effective > annotation.reviewedOn ||
      !ALLOWED_OVERLAY_STATUSES.has(annotation.status) ||
      (annotation.kind === "eu-law" && !annotation.jurisdictions.includes("EU")) ||
      (annotation.kind === "fi-law" && !annotation.jurisdictions.includes("FI")) ||
      !Array.isArray(annotation.sources) ||
      annotation.sources.length === 0
    ) {
      return false;
    }
    annotationIds.add(annotation.id);
    domainCoverage.get(annotation.domainId).add(annotation.kind);

    for (const source of annotation.sources) {
      const safeUrl = getSafeOfficialOverlayUrl(source?.url);
      if (
        !hasOnlyKnownKeys(source, OVERLAY_SOURCE_KEYS) ||
        !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(source.id ?? "") ||
        sourceIds.has(source.id) ||
        !safeUrl ||
        sourceUrls.has(safeUrl) ||
        !isStrictPlainText(source.title) ||
        !isStrictPlainText(source.authority) ||
        !isStrictPlainText(source.type) ||
        !ALLOWED_OVERLAY_JURISDICTIONS.has(source.jurisdiction) ||
        !isStrictPlainText(source.status) ||
        source.reviewedOn !== CONTENT_REVIEW_DATE ||
        !isIsoCalendarDate(source.reviewedOn)
      ) {
        return false;
      }
      sourceIds.add(source.id);
      sourceUrls.add(safeUrl);
      sourceCount += 1;
    }
  }

  if (
    annotationIds.size !== EXPECTED_OVERLAY_ANNOTATION_IDS.length ||
    EXPECTED_OVERLAY_ANNOTATION_IDS.some((annotationId) => !annotationIds.has(annotationId)) ||
    sourceCount !== 15
  ) {
    return false;
  }
  return [...domainCoverage.values()].every(
    (kinds) => kinds.has("eu-law") && kinds.has("fi-law") && kinds.has("authority-guidance")
  );
}
/* csm-release-scope:v1.3.0:end */

function isRenderableEntry(entry) {
  return Boolean(
    hasExactKeys(entry, ["id", "reviewState", "text"]) &&
    isTrimmedNonEmptyString(entry.id) &&
    isTrimmedNonEmptyString(entry.text) &&
    entry.reviewState === "reviewed"
  );
}

function isSafeMitigationToolText(value, maximumLength) {
  return Boolean(
    isStrictPlainText(value, maximumLength) &&
    !/[\r\n\u0000-\u001f\u007f]/.test(value) &&
    !MITIGATION_TOOL_URL_PATTERN.test(value) &&
    !MITIGATION_TOOL_EMAIL_PATTERN.test(value) &&
    !MITIGATION_TOOL_VENDOR_PATTERN.test(value) &&
    !MITIGATION_TOOL_ENDORSEMENT_PATTERN.test(value) &&
    !MITIGATION_TOOL_ABSOLUTE_CLAIM_PATTERN.test(value) &&
    !/[®™©]/u.test(value)
  );
}

function validateMitigationToolsBootstrapData(mitigationIds) {
  if (
    !hasExactKeys(mitigationTools, MITIGATION_TOOL_TOP_LEVEL_KEYS) ||
    mitigationTools.schemaVersion !== MITIGATION_TOOL_SCHEMA_VERSION ||
    mitigationTools.frameworkVersion !== MITIGATION_TOOL_FRAMEWORK_VERSION ||
    mitigationTools.disclaimer !== MITIGATION_TOOL_DISCLAIMER ||
    !isDataRecord(mitigationTools.entries) ||
    !(mitigationIds instanceof Set) ||
    mitigationIds.size !== 180 ||
    !hasExactKeys(mitigationTools.entries, mitigationIds)
  ) {
    return false;
  }

  for (const mitigationId of mitigationIds) {
    const tools = mitigationTools.entries[mitigationId];
    if (
      !MITIGATION_TOOL_ID_PATTERN.test(mitigationId) ||
      !Array.isArray(tools) ||
      tools.length !== 2
    ) {
      return false;
    }

    const normalizedNames = new Set();
    for (const tool of tools) {
      if (
        !hasExactKeys(tool, MITIGATION_TOOL_RECORD_KEYS) ||
        !isSafeMitigationToolText(tool.name, 72) ||
        !isSafeMitigationToolText(tool.use, 180)
      ) {
        return false;
      }
      normalizedNames.add(normalizeEntryText(tool.name));
    }
    if (normalizedNames.size !== 2) return false;
  }

  return true;
}

function validateBootstrapData() {
  if (
    typeof phases === "undefined" ||
    typeof domains === "undefined" ||
    typeof referencesByDomain === "undefined" ||
    typeof phaseEvidenceByDomain === "undefined" ||
    /* csm-release-scope:v1.3.0:begin */
    typeof matrixOverlays === "undefined" ||
    /* csm-release-scope:v1.3.0:end */
    typeof mitigationTools === "undefined"
  ) {
    return "A required data file is unavailable.";
  }

  if (!Array.isArray(phases) || phases.length !== 5 || !Array.isArray(domains) || domains.length !== 9) {
    return "The matrix dimensions are invalid.";
  }

  const phaseIds = phases.map((phase) => phase?.id);
  if (!sameSequence(phaseIds, CANONICAL_PHASE_CONTRACT.map((phase) => phase.id))) {
    return "The lifecycle phases are not in canonical order.";
  }
  if (phases.some((phase) => !isDataRecord(phase) || !isTrimmedNonEmptyString(phase.title) || !isTrimmedNonEmptyString(phase.summary))) {
    return "The lifecycle phase metadata is incomplete.";
  }

  const domainIds = domains.map((domain) => domain?.id);
  if (!sameSequence(domainIds, CANONICAL_DOMAIN_IDS)) {
    return "The security domains are not in canonical order.";
  }
  if (
    !hasExactKeys(referencesByDomain, CANONICAL_DOMAIN_IDS) ||
    !hasExactKeys(phaseEvidenceByDomain, CANONICAL_DOMAIN_IDS)
  ) {
    return "The source data contract is invalid.";
  }

  let referenceCount = 0;
  let entryCount = 0;
  const entryIds = new Set();
  const entryTexts = new Set();
  const mitigationIds = new Set();
  for (const [domainIndex, domain] of domains.entries()) {
    const profile = domain?.profile;
    const profileLists = [profile?.protects, profile?.owners, profile?.failureModes, profile?.assuranceQuestions];
    if (
      !isDataRecord(domain) ||
      !isTrimmedNonEmptyString(domain.name) ||
      !isTrimmedNonEmptyString(domain.focus) ||
      !isTrimmedNonEmptyString(domain.sourceContext) ||
      !hasExactKeys(domain.phaseFraming, phaseIds) ||
      phaseIds.some((phaseId) => !isTrimmedNonEmptyString(domain.phaseFraming[phaseId])) ||
      !hasExactKeys(domain.cells, phaseIds) ||
      !hasExactKeys(domain.actors, phaseIds) ||
      !isDataRecord(profile) ||
      !isTrimmedNonEmptyString(profile.mission) ||
      profileLists.some(
        (items) => !Array.isArray(items) || items.length === 0 || items.some((item) => !isTrimmedNonEmptyString(item))
      )
    ) {
      return `The ${domain?.id ?? "unknown"} domain is incomplete.`;
    }
    if (!hasExactKeys(phaseEvidenceByDomain[domain.id], phaseIds)) {
      return `The ${domain.id} phase evidence contract is incomplete.`;
    }

    const references = referencesByDomain[domain.id];
    const sourceIds = new Set();
    if (
      !Array.isArray(references) ||
      references.some((reference) => {
        if (
          !isDataRecord(reference) ||
          typeof reference?.id !== "string" ||
          !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(reference.id) ||
          sourceIds.has(reference.id) ||
          CORE_SOURCE_TEXT_FIELDS.some((field) => !isTrimmedNonEmptyString(reference[field])) ||
          reference.verifiedOn !== CONTENT_REVIEW_DATE ||
          !getSafeExternalHttpsUrl(reference?.url)
        ) {
          return true;
        }
        sourceIds.add(reference.id);
        return false;
      })
    ) {
      return `The ${domain.id} source pack is incomplete.`;
    }
    const usedSourceIds = new Set();
    referenceCount += references.length;

    for (const [phaseIndex, phaseId] of phaseIds.entries()) {
      const cell = domain.cells[phaseId];
      const actors = domain.actors[phaseId];
      const mapping = phaseEvidenceByDomain[domain.id]?.[phaseId];
      if (
        !hasExactKeys(cell, ["threats", "controls"]) ||
        !Array.isArray(cell.threats) ||
        cell.threats.length !== 4 ||
        !Array.isArray(cell.controls) ||
        cell.controls.length !== 4 ||
        !Array.isArray(actors) ||
        actors.length !== 3 ||
        ![...actors, ...cell.threats, ...cell.controls].every(isRenderableEntry) ||
        !mapping ||
        mapping.relationship !== "context" ||
        !Array.isArray(mapping.sourceIds) ||
        mapping.sourceIds.length < 1 ||
        mapping.sourceIds.length > 3 ||
        new Set(mapping.sourceIds).size !== mapping.sourceIds.length ||
        mapping.sourceIds.some((sourceId) => !sourceIds.has(sourceId))
      ) {
        return `The ${domain.id}/${phaseId} matrix cell is incomplete.`;
      }
      mapping.sourceIds.forEach((sourceId) => usedSourceIds.add(sourceId));

      const layers = { actors, threats: cell.threats, controls: cell.controls };
      for (const layer of ENTRY_LAYER_CONTRACT) {
        const expectedPrefix = `CSM-D${String(domainIndex + 1).padStart(2, "0")}-${CANONICAL_PHASE_CONTRACT[phaseIndex].code}-${layer.code}`;
        const suffixes = new Set();
        for (const entry of layers[layer.key]) {
          const match = new RegExp(`^${expectedPrefix}(\\d{2})$`).exec(entry.id);
          if (!match) return `The ${domain.id}/${phaseId}/${layer.key} entry ID contract is invalid.`;
          suffixes.add(match[1]);
          if (entryIds.has(entry.id)) return `Duplicate matrix entry ID: ${entry.id}.`;
          entryIds.add(entry.id);
          if (layer.key === "controls") mitigationIds.add(entry.id);
          const normalizedText = normalizeEntryText(entry.text);
          if (entryTexts.has(normalizedText)) return `Duplicate matrix entry text: ${entry.text}.`;
          entryTexts.add(normalizedText);
          entryCount += 1;
        }
        const expectedSuffixes = Array.from({ length: layer.count }, (_, index) => String(index + 1).padStart(2, "0"));
        if (!sameSequence([...suffixes].sort(), expectedSuffixes)) {
          return `The ${domain.id}/${phaseId}/${layer.key} entry ID contract is invalid.`;
        }
      }
    }
    if ([...sourceIds].some((sourceId) => !usedSourceIds.has(sourceId))) {
      return `The ${domain.id} source pack is incomplete.`;
    }
  }

  if (entryCount !== 495 || entryIds.size !== 495 || entryTexts.size !== 495) {
    return "The matrix entry total is invalid.";
  }
  if (mitigationIds.size !== 180) return "The mitigation entry total is invalid.";
  if (referenceCount !== 59) return "The source mapping total is invalid.";
  /* csm-release-scope:v1.3.0:begin */
  if (!validateOverlayBootstrapData()) return "The EU–Finland overlay data is invalid.";
  /* csm-release-scope:v1.3.0:end */
  return validateMitigationToolsBootstrapData(mitigationIds)
    ? ""
    : "The mitigation-tool data is invalid.";
}

function normalizeSearchValue(value) {
  return typeof value === "string" ? value.toLocaleLowerCase("en").normalize("NFKD") : "";
}

function getMatrixEntrySearchMatch(query, coreValues, toolValues) {
  const normalizedQuery = normalizeSearchValue(query).trim();
  if (!normalizedQuery) return { matches: true, revealTools: false };

  const includesQuery = (values) =>
    (Array.isArray(values) ? values : []).some((value) =>
      normalizeSearchValue(value).includes(normalizedQuery)
    );
  const matchesCore = includesQuery(coreValues);
  const matchesTools = includesQuery(toolValues);

  return {
    matches: matchesCore || matchesTools,
    revealTools: !matchesCore && matchesTools
  };
}

function showDataError() {
  document.body.dataset.appState = "error";
  const dataError = document.getElementById("matrixDataError");
  if (dataError) dataError.hidden = false;
}

const ACTION_BRIEF_LIMIT = 12;
const ACTION_BRIEF_HORIZONS = {
  now: "Now · next 30 days",
  next: "Next · 31–60 days",
  later: "Later · 61–90 days"
};

function createActionCatalog() {
  const catalog = new Map();
  domains.forEach((domain) => phases.forEach((phase) => {
    const mapping = phaseEvidenceByDomain[domain.id][phase.id];
    const sources = mapping.relationship === "context"
      ? mapping.sourceIds.map((id) => referencesByDomain[domain.id].find((source) => source.id === id)).filter(Boolean)
      : [];
    domain.cells[phase.id].controls.forEach((entry) => {
      if (entry.reviewState !== "reviewed") return;
      catalog.set(entry.id, {
        id: entry.id, text: entry.text, domainId: domain.id, domainName: domain.name,
        phaseId: phase.id, phaseTitle: phase.title, owners: [...domain.profile.owners],
        tools: mitigationTools.entries[entry.id], sources
      });
    });
  }));
  return catalog;
}

// Selections are intentionally independent of public navigation and page filters.
function createActionBriefModel(catalog) {
  const selected = new Map();
  return {
    has: (id) => selected.has(id),
    add(id) {
      if (!catalog.has(id)) return "unknown";
      if (selected.has(id)) return "duplicate";
      if (selected.size >= ACTION_BRIEF_LIMIT) return "limit";
      selected.set(id, { owner: "", horizon: "next" });
      return "added";
    },
    remove: (id) => selected.delete(id),
    clear: () => selected.clear(),
    update(id, fields) {
      if (!selected.has(id) || !fields || typeof fields !== "object") return false;
      if (Object.keys(fields).some((key) => !["owner", "horizon"].includes(key))) return false;
      if (Object.hasOwn(fields, "owner") && fields.owner !== "" && !catalog.get(id).owners.includes(fields.owner)) return false;
      if (Object.hasOwn(fields, "horizon") && !Object.hasOwn(ACTION_BRIEF_HORIZONS, fields.horizon)) return false;
      selected.set(id, { ...selected.get(id), ...fields });
      return true;
    },
    getItems() {
      return [...selected].map(([id, choice]) => {
        const entry = catalog.get(id);
        return {
          ...entry, ...choice, owners: [...entry.owners],
          tools: entry.tools.map((tool) => ({ ...tool })),
          sources: entry.sources.map((source) => ({ ...source }))
        };
      });
    }
  };
}

function escapeBriefMarkdown(value) {
  return String(value).replace(/[\r\n]+/g, " ").replace(/([\\`*_{}\[\]()#+.!|>])/g, "\\$1");
}

function buildActionBriefMarkdown(items) {
  const lines = [
    "# Corporate Security Matrix — Action brief", "",
    `Framework: ${MITIGATION_TOOL_FRAMEWORK_VERSION}`, "Overlay: not included", "",
    "User-selected controls in selection order, not a risk ranking. Planning horizons are choices, not risk severity or prescribed deadlines.",
    "Context sources, not entry-level proof. No compliance or risk-elimination claim is made.",
    "This export is unencrypted and may contain sensitive priorities. Handle it within your organisation's policy.", ""
  ];
  items.forEach((item, index) => {
    lines.push(`## ${index + 1}. ${item.id}`, "", `${escapeBriefMarkdown(item.domainName)} · ${escapeBriefMarkdown(item.phaseTitle)}`, "", escapeBriefMarkdown(item.text), "",
      `Owner role: ${escapeBriefMarkdown(item.owner || "Unassigned")}`,
      `Planning horizon: ${escapeBriefMarkdown(ACTION_BRIEF_HORIZONS[item.horizon])}`, "", "Implementation aids:");
    item.tools.forEach((tool) => lines.push(`- ${escapeBriefMarkdown(tool.name)}: ${escapeBriefMarkdown(tool.use)}`));
    lines.push("", "Context sources, not entry-level proof:");
    item.sources.forEach((source) => lines.push(`- ${escapeBriefMarkdown(source.org)} — ${escapeBriefMarkdown(source.title || source.shortTitle)} (${escapeBriefMarkdown(source.id)}; verified ${escapeBriefMarkdown(source.verifiedOn)}): <${getSafeExternalHttpsUrl(source.url)}>`));
    lines.push("");
  });
  return lines.join("\n");
}

function initializeApp() {
const validViews = new Set(["all", "actors", "risks", "mitigations"]);
const validPhases = new Set(["all", ...phases.map((phase) => phase.id)]);
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const urlState = new URLSearchParams(window.location.search);
const requestedDomain = urlState.get("domain");
const requestedView = urlState.get("view");
/* csm-release-scope:v1.3.0:begin */
const requestedOverlay = urlState.get("overlay");
const overlayCatalog = matrixOverlays.overlays.filter((overlay) => ALLOWED_OVERLAY_IDS.has(overlay.id));
const availableOverlayIds = new Set(overlayCatalog.map((overlay) => overlay.id));
/* csm-release-scope:v1.3.0:end */

const state = {
  activeDomain: domains.some((domain) => domain.id === requestedDomain) ? requestedDomain : domains[0].id,
  view: validViews.has(requestedView) ? requestedView : "all",
  query: (urlState.get("q") ?? "").trim(),
  phase: validPhases.has(urlState.get("phase")) ? urlState.get("phase") : "all",
  /* csm-release-scope:v1.3.0:begin */
  overlay: availableOverlayIds.has(requestedOverlay) ? requestedOverlay : ""
  /* csm-release-scope:v1.3.0:end */
};

const page = document.body;
const matrixGrid = document.getElementById("matrixGrid");
const referenceGrid = document.getElementById("referenceGrid");
const resultCount = document.getElementById("resultCount");
const domainFilters = document.getElementById("domainFilters");
const domainRail = document.querySelector(".domain-rail");
const domainNavStatus = document.getElementById("domainNavStatus");
const previousDomainButton = document.getElementById("previousDomain");
const nextDomainButton = document.getElementById("nextDomain");
const activeDomainPanel = document.getElementById("activeDomain");
const viewButtons = [...document.querySelectorAll("[data-view-mode]")];
const searchInput = document.getElementById("matrixSearch");
const clearSearchButton = document.getElementById("clearSearch");
/* csm-release-scope:v1.3.0:begin */
const overlaySelect = document.getElementById("overlaySelect");
const overlayStatus = document.getElementById("overlayStatus");
const overlayContext = document.getElementById("overlayContext");
/* csm-release-scope:v1.3.0:end */
const emptyState = document.getElementById("emptyState");
const copyLinkButton = document.getElementById("copyLink");
const copyStatus = document.getElementById("copyStatus");
const sourceMappingCount = document.getElementById("sourceMappingCount");
const mobileNav = document.querySelector(".mobile-nav");
const phaseButtons = [...document.querySelectorAll("button[data-phase-mode]")];
const briefPanel = document.getElementById("actionBrief");
const briefList = document.getElementById("actionBriefList");
const briefEmpty = document.getElementById("actionBriefEmpty");
const briefStatus = document.getElementById("actionBriefStatus");
const briefCount = document.getElementById("actionBriefCount");
const openBriefButton = document.getElementById("openActionBrief");
const exportBriefButton = document.getElementById("exportActionBrief");
const printBriefButton = document.getElementById("printActionBrief");
const clearBriefButton = document.getElementById("clearActionBrief");
const briefModel = createActionBriefModel(createActionCatalog());
const selectionStatus = createElement("span", "sr-only");
selectionStatus.setAttribute("role", "status");
selectionStatus.setAttribute("aria-live", "polite");
openBriefButton.after(selectionStatus);

function createElement(tag, className = "", text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined && text !== null) element.textContent = text;
  return element;
}

function updateSelectionButtons() {
  document.querySelectorAll(".matrix-tile__select").forEach((button) => {
    const selected = briefModel.has(button.dataset.actionId);
    button.setAttribute("aria-pressed", String(selected));
    button.textContent = selected ? "Remove from brief" : "Add to brief";
    button.setAttribute("aria-label", `${selected ? "Remove" : "Add"} ${button.dataset.actionId} ${selected ? "from" : "to"} action brief`);
  });
}

function announceBrief(message) {
  selectionStatus.textContent = briefPanel.hidden ? message : "";
  briefStatus.textContent = briefPanel.hidden ? "" : message;
}

function createBriefField(item, key, labelText, options) {
  const field = createElement("div", "action-brief__field");
  const label = createElement("label", "", `${labelText}: ${options[item[key]]}`);
  const select = createElement("select");
  select.id = `brief-${item.id.toLowerCase()}-${key}`;
  label.htmlFor = select.id;
  Object.entries(options).forEach(([value, text]) => {
    const option = createElement("option", "", text);
    option.value = value;
    select.append(option);
  });
  select.value = item[key];
  select.addEventListener("change", () => {
    if (!briefModel.update(item.id, { [key]: select.value })) return;
    label.textContent = `${labelText}: ${options[select.value]}`;
    announceBrief(`${labelText} updated for ${item.id}.`);
  });
  field.append(label, select);
  return field;
}

function renderActionBrief() {
  const items = briefModel.getItems();
  briefCount.textContent = String(items.length);
  briefEmpty.hidden = items.length > 0;
  [exportBriefButton, printBriefButton, clearBriefButton].forEach((button) => { button.disabled = items.length === 0; });
  briefList.replaceChildren();
  items.forEach((item, index) => {
    const row = createElement("li", "action-brief__item");
    const meta = createElement("p", "action-brief__meta", `${item.id} · ${item.domainName} · ${item.phaseTitle}`);
    const title = createElement("h4", "action-brief__title", item.text);
    const fields = createElement("div", "action-brief__fields");
    fields.append(
      createBriefField(item, "owner", "Owner role", Object.fromEntries([["", "Unassigned"], ...item.owners.map((owner) => [owner, owner])])),
      createBriefField(item, "horizon", "Planning horizon", ACTION_BRIEF_HORIZONS)
    );
    const tools = createElement("ul", "action-brief__tools");
    item.tools.forEach((tool) => {
      const toolItem = createElement("li");
      toolItem.append(createElement("strong", "", `${tool.name}: `), createElement("span", "", tool.use));
      tools.append(toolItem);
    });
    const sourceLabel = createElement("p", "action-brief__meta", "Context sources, not entry-level proof:");
    const sources = createElement("ul", "action-brief__sources");
    item.sources.forEach((source) => {
      const sourceItem = createElement("li");
      const link = createElement("a", "", `${source.org} · ${source.title || source.shortTitle}`);
      link.href = getSafeExternalHttpsUrl(source.url);
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.append(createElement("span", "sr-only", "; opens in a new tab"));
      sourceItem.append(link, createElement("span", "", ` · ${source.id} · verified ${source.verifiedOn}`));
      sources.append(sourceItem);
    });
    const remove = createElement("button", "action-brief__remove", "Remove control");
    remove.type = "button";
    remove.setAttribute("aria-label", `Remove ${item.id} from action brief`);
    remove.addEventListener("click", () => {
      briefModel.remove(item.id);
      renderActionBrief();
      updateSelectionButtons();
      announceBrief(`Removed ${item.id}. ${briefModel.getItems().length} of ${ACTION_BRIEF_LIMIT} controls selected.`);
      const remainingButtons = briefList.querySelectorAll(".action-brief__remove");
      const target = remainingButtons[Math.min(index, remainingButtons.length - 1)] || briefEmpty;
      if (target === briefEmpty) briefEmpty.tabIndex = -1;
      target.focus();
    });
    row.append(meta, title, fields, tools, sourceLabel, sources, remove);
    briefList.append(row);
  });
}

function toggleBriefSelection(id, button) {
  const wasSelected = briefModel.has(id);
  let result = "removed";
  if (wasSelected) briefModel.remove(id);
  else result = briefModel.add(id);
  if (result === "limit") {
    button.textContent = "Brief full · 12 controls";
    announceBrief("The action brief is full. Remove a control before adding another; the limit is 12.");
    return;
  }
  renderActionBrief();
  updateSelectionButtons();
  announceBrief(`${wasSelected ? "Removed" : "Added"} ${id}. ${briefModel.getItems().length} of ${ACTION_BRIEF_LIMIT} controls selected.`);
}

function getActiveDomain() {
  return domains.find((domain) => domain.id === state.activeDomain) ?? domains[0];
}

function getVisibleKinds() {
  return state.view === "all" ? new Set(["actors", "risks", "mitigations"]) : new Set([state.view]);
}

/* csm-release-scope:v1.3.0:begin */
function getSelectedOverlay() {
  return overlayCatalog.find((overlay) => overlay.id === state.overlay) ?? null;
}
/* csm-release-scope:v1.3.0:end */

function getEntryText(entry) {
  return entry?.text ?? "";
}

function getMitigationTools(mitigationId) {
  return mitigationTools.entries[mitigationId];
}

function getReferenceById(domainId, sourceId) {
  return (referencesByDomain[domainId] ?? []).find((reference) => reference.id === sourceId);
}

function getPhaseEvidence(domainId, phaseId) {
  const mappings = typeof phaseEvidenceByDomain === "undefined" ? undefined : phaseEvidenceByDomain;
  const mapping = mappings?.[domainId]?.[phaseId];
  if (!mapping || mapping.relationship !== "context" || !Array.isArray(mapping.sourceIds)) return [];
  return mapping.sourceIds
    .map((sourceId) => getReferenceById(domainId, sourceId))
    .filter(Boolean);
}

function getSourceRowId(domainId, sourceId) {
  return `source-${domainId}-${sourceId}`;
}

function formatSourceLabel(reference) {
  const shortTitle = reference.shortTitle ?? reference.title ?? "Source record";
  const organizationPrefix = `${reference.org} `;
  const editorialTitle = shortTitle.startsWith(organizationPrefix)
    ? shortTitle.slice(organizationPrefix.length)
    : shortTitle;
  return `${reference.org} · ${editorialTitle}`;
}

function focusFragmentTarget(targetId) {
  const target = document.getElementById(targetId);
  if (!target) return;
  target.focus({ preventScroll: true });
}

function connectFragmentFocus(link, targetId) {
  link.addEventListener("click", () => {
    window.requestAnimationFrame(() => focusFragmentTarget(targetId));
  });
}

function safeDecodeFragment() {
  try {
    return decodeURIComponent(window.location.hash.slice(1));
  } catch {
    return null;
  }
}

function canonicalizeFragment(fragment) {
  if (!fragment) return "";
  if (fragment === "matrix-explorer" || fragment === "source-pack") return `#${fragment}`;
  if (fragment.startsWith("source-")) {
    return document.getElementById(fragment) ? `#${fragment}` : "#source-pack";
  }
  return "";
}

function restoreDynamicFragment({ focus = true } = {}) {
  const targetId = safeDecodeFragment();
  if (!targetId?.startsWith("source-")) return;
  const target = document.getElementById(targetId);
  if (!target) return;
  target.scrollIntoView({ block: "start" });
  if (focus) focusFragmentTarget(targetId);
}

function focusHistoryTarget(focusSelector) {
  const safeSelector = normalizeHistoryFocusSelector(focusSelector);
  if (safeSelector) document.querySelector(safeSelector)?.focus({ preventScroll: true });
}

function getDefaultHistoryFocusSelector() {
  return `#tab-${state.activeDomain}`;
}

function syncUrl({ push = false, focusSelector = getDefaultHistoryFocusSelector(), returnFocusSelector = null } = {}) {
  const params = new URLSearchParams();
  if (state.activeDomain !== domains[0].id) params.set("domain", state.activeDomain);
  if (state.view !== "all") params.set("view", state.view);
  if (state.query) params.set("q", state.query);
  if (state.phase !== "all") params.set("phase", state.phase);
  /* csm-release-scope:v1.3.0:begin */
  if (state.overlay) params.set("overlay", state.overlay);
  /* csm-release-scope:v1.3.0:end */
  const queryString = params.toString();
  const currentFragment = safeDecodeFragment();
  const nextHash = currentFragment === null ? "" : canonicalizeFragment(currentFragment);
  const nextUrl = `${window.location.pathname}${queryString ? `?${queryString}` : ""}${nextHash}`;
  const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  writeCanonicalHistory(window.history, {
    currentUrl,
    nextUrl,
    push,
    focusSelector,
    returnFocusSelector
  });
}

function revealActiveDomainTab(behavior = "auto") {
  const activeTab = domainFilters.querySelector(`[data-domain-id="${state.activeDomain}"]`);
  if (activeTab && domainFilters.scrollWidth > domainFilters.clientWidth) {
    const left = activeTab.offsetLeft - (domainFilters.clientWidth - activeTab.offsetWidth) / 2;
    domainFilters.scrollTo({ left: Math.max(0, left), behavior });
  }
  updateDomainRailEdges();
}

function updateDomainRailEdges() {
  if (!domainRail) return;
  const maxScroll = Math.max(0, domainFilters.scrollWidth - domainFilters.clientWidth);
  domainRail.classList.toggle("is-at-start", domainFilters.scrollLeft <= 2);
  domainRail.classList.toggle("is-at-end", domainFilters.scrollLeft >= maxScroll - 2);
}

function updateDomainNavigator() {
  const activeIndex = domains.findIndex((domain) => domain.id === state.activeDomain);
  const activeDomain = domains[activeIndex];
  const previousDomain = domains[activeIndex - 1];
  const nextDomain = domains[activeIndex + 1];

  if (domainNavStatus) {
    domainNavStatus.textContent = `${String(activeIndex + 1).padStart(2, "0")} / ${String(domains.length).padStart(2, "0")} · ${activeDomain.name}`;
  }
  if (previousDomainButton) {
    previousDomainButton.disabled = !previousDomain;
    previousDomainButton.setAttribute(
      "aria-label",
      previousDomain ? `Previous security domain: ${previousDomain.name}` : "No previous security domain"
    );
  }
  if (nextDomainButton) {
    nextDomainButton.disabled = !nextDomain;
    nextDomainButton.setAttribute(
      "aria-label",
      nextDomain ? `Next security domain: ${nextDomain.name}` : "No next security domain"
    );
  }
}

function setActiveDomain(
  domainId,
  { focus = false, sync = true, historyFocusSelector = null, historyReturnFocusSelector = null } = {}
) {
  if (!domains.some((domain) => domain.id === domainId)) return;

  const previousDomainId = state.activeDomain;
  state.activeDomain = domainId;
  renderFilters();
  renderActiveDomain();
  /* csm-release-scope:v1.3.0:begin */
  renderOverlayContext();
  /* csm-release-scope:v1.3.0:end */
  renderMatrix();
  renderReferences();
  if (sync) {
    syncUrl({
      push: true,
      focusSelector: historyFocusSelector ?? `#tab-${domainId}`,
      returnFocusSelector: historyReturnFocusSelector ?? `#tab-${previousDomainId}`
    });
  }

  const activeTab = domainFilters.querySelector(`[data-domain-id="${domainId}"]`);
  revealActiveDomainTab(prefersReducedMotion.matches ? "auto" : "smooth");
  if (focus) activeTab?.focus();
}

function renderFilters() {
  domainFilters.replaceChildren();

  domains.forEach((domain, index) => {
    const button = createElement("button", "chip");
    const number = createElement("span", "chip__number", String(index + 1).padStart(2, "0"));
    const label = createElement("span", "chip__label", domain.name);
    const isActive = domain.id === state.activeDomain;

    button.type = "button";
    button.dataset.domainId = domain.id;
    button.id = `tab-${domain.id}`;
    button.setAttribute("role", "tab");
    button.setAttribute("aria-controls", "matrixGrid");
    button.setAttribute("aria-selected", String(isActive));
    button.tabIndex = isActive ? 0 : -1;
    button.classList.toggle("is-active", isActive);
    button.append(number, label);

    button.addEventListener("click", () => setActiveDomain(domain.id, { focus: document.activeElement === button }));
    button.addEventListener("keydown", (event) => {
      let nextIndex = index;
      if (event.key === "ArrowRight") nextIndex = (index + 1) % domains.length;
      else if (event.key === "ArrowLeft") nextIndex = (index - 1 + domains.length) % domains.length;
      else if (event.key === "Home") nextIndex = 0;
      else if (event.key === "End") nextIndex = domains.length - 1;
      else return;

      event.preventDefault();
      setActiveDomain(domains[nextIndex].id, { focus: true });
    });

    domainFilters.append(button);
  });

  updateDomainNavigator();
  window.requestAnimationFrame(updateDomainRailEdges);
}

function createDetailCard(title, items) {
  const card = createElement("section", "domain-brief");
  const heading = createElement("h4", "domain-brief__title", title);
  const list = createElement("ul", "domain-brief__list");
  items.forEach((item) => list.append(createElement("li", "", item)));
  card.append(heading, list);
  return card;
}

function renderActiveDomain() {
  const domain = getActiveDomain();
  const profile = domain.profile ?? {};
  const references = referencesByDomain[domain.id] ?? [];
  const header = createElement("div", "active-domain__header");
  const headingGroup = createElement("div");
  const label = createElement("p", "section-label", "Active domain");
  const title = createElement("h3", "domain-name", domain.name);
  const mission = createElement("p", "active-domain__lead", profile.mission ?? domain.focus);
  const sourceContext = createElement("p", "active-domain__context", domain.sourceContext);
  const meta = createElement("div", "active-domain__meta");
  const sourceLink = createElement(
    "a",
    "active-domain__source-link",
    `Open ${references.length} domain ${references.length === 1 ? "source" : "sources"}`
  );
  sourceLink.href = "#source-pack";
  connectFragmentFocus(sourceLink, "source-pack");
  sourceLink.append(createElement("span", "", "↓"));
  sourceLink.lastElementChild.setAttribute("aria-hidden", "true");

  meta.append(
    createElement("span", "", `${phases.length} lifecycle phases`),
    createElement("span", "", `${references.length} official source records`),
    createElement("span", "", "3 decision layers")
  );
  headingGroup.append(label, title, mission, sourceContext, meta);
  header.append(headingGroup, sourceLink);

  const details = createElement("details", "domain-details");
  const summary = createElement("summary", "", "Domain briefing and leadership questions");
  const briefGrid = createElement("div", "domain-brief-grid");

  if (profile.protects) {
    briefGrid.append(
      createDetailCard("What this protects", profile.protects),
      createDetailCard("Accountable owners", profile.owners),
      createDetailCard("Failure starts when", profile.failureModes),
      createDetailCard("Leadership questions", profile.assuranceQuestions)
    );
  }

  details.append(summary, briefGrid);
  activeDomainPanel.replaceChildren(header, details);
}

/* csm-release-scope:v1.3.0:begin */
function formatOverlayKind(kind) {
  return {
    "eu-law": "EU law",
    "fi-law": "Finnish law",
    "authority-guidance": "Authority guidance",
    "voluntary-standard": "Voluntary standard"
  }[kind] ?? "Context source";
}

function formatOverlayStatus(status) {
  return {
    "in-force": "In force",
    "current-guidance": "Current guidance",
    pilot: "Pilot"
  }[status] ?? status;
}

function createOverlayBadge(text) {
  return createElement("span", "overlay-badge", text);
}

function createOverlayAnnotation(annotation) {
  const article = createElement("article", "overlay-annotation");
  const header = createElement("header", "overlay-annotation__header");
  const headingGroup = createElement("div");
  const badges = createElement("div", "overlay-annotation__badges");
  const title = createElement("h4", "overlay-annotation__title", annotation.title);
  const summary = createElement("p", "overlay-annotation__summary", annotation.summary);
  const facts = createElement("dl", "overlay-annotation__facts");
  const phaseNames = annotation.phaseIds
    .map((phaseId) => phases.find((phase) => phase.id === phaseId)?.title)
    .filter(Boolean)
    .join(", ");

  badges.append(
    createOverlayBadge(formatOverlayKind(annotation.kind)),
    createOverlayBadge(annotation.jurisdictions.join(" + ")),
    createOverlayBadge(formatOverlayStatus(annotation.status))
  );
  headingGroup.append(badges, title);
  header.append(headingGroup);
  [
    createSourceFact("Authority", annotation.authority),
    createSourceFact("Lifecycle context", phaseNames),
    createSourceFact("Source reviewed", annotation.reviewedOn)
  ].filter(Boolean).forEach((fact) => facts.append(fact));

  const applicability = createElement("p", "overlay-annotation__applicability", annotation.applicability);
  applicability.prepend(createElement("strong", "", "Applicability boundary: "));
  const sourcesLabel = createElement("p", "overlay-annotation__sources-label", "Official sources");
  const sourceList = createElement("ul", "overlay-source-list");
  sourceList.setAttribute("role", "list");

  annotation.sources.forEach((source) => {
    const safeUrl = getSafeOfficialOverlayUrl(source.url);
    if (!safeUrl) return;
    const item = createElement("li");
    const sourceLink = createElement("a", "overlay-source-link", source.title);
    const sourceMeta = createElement(
      "span",
      "overlay-source-meta",
      `${source.authority} · ${source.status} · reviewed ${source.reviewedOn}`
    );
    sourceLink.href = safeUrl;
    sourceLink.target = "_blank";
    sourceLink.rel = "noopener noreferrer";
    sourceLink.append(createElement("span", "", " ↗"));
    sourceLink.lastElementChild.setAttribute("aria-hidden", "true");
    sourceLink.append(createElement("span", "sr-only", "; opens in a new tab"));
    item.append(sourceLink, sourceMeta);
    sourceList.append(item);
  });

  article.append(header, summary, facts, applicability, sourcesLabel, sourceList);
  return article;
}

function renderOverlayContext() {
  const overlay = getSelectedOverlay();
  overlayContext.replaceChildren();
  overlayContext.hidden = !overlay;
  if (!overlay) return;

  const domain = getActiveDomain();
  const header = createElement("header", "overlay-context__header");
  const copy = createElement("div");
  const label = createElement("p", "section-label", "Jurisdiction context · optional pilot");
  const title = createElement("h3", "overlay-context__title", `${overlay.label} · ${domain.name}`);
  title.id = "overlayContextTitle";
  const lead = createElement(
    "p",
    "overlay-context__lead",
    `Overlay ${overlay.id} · version ${overlay.version}. Context only; inclusion does not determine whether a requirement applies.`
  );
  const meta = createElement("div", "overlay-context__meta");
  meta.append(
    createOverlayBadge(`Status: ${formatOverlayStatus(overlay.status)}`),
    createOverlayBadge(`Jurisdictions: ${overlay.jurisdictions.join(" + ")}`),
    createOverlayBadge(`Reviewed: ${overlay.reviewedAt}`),
    createOverlayBadge(`Next review: ${overlay.nextReview}`)
  );
  copy.append(label, title, lead, meta);
  header.append(copy);

  const limitation = createElement("p", "overlay-context__limitation", overlay.disclaimer);
  const annotations = overlay.annotations.filter((annotation) => annotation.domainId === domain.id);
  const content = createElement("div", "overlay-context__content");
  if (annotations.length) {
    annotations.forEach((annotation) => content.append(createOverlayAnnotation(annotation)));
  } else {
    const empty = createElement("div", "overlay-context__empty");
    empty.append(
      createElement("h4", "", "This domain is outside the pilot mapping"),
      createElement(
        "p",
        "",
        "The current pilot records context only for Information and Cybersecurity, Occupational Health and Safety, and Environmental and Hazardous Materials Safety. Core matrix content is unchanged."
      )
    );
    content.append(empty);
  }

  overlayContext.append(header, limitation, content);
}

function setOverlay(overlayId, { sync = true, announce = true } = {}) {
  state.overlay = availableOverlayIds.has(overlayId) ? overlayId : "";
  overlaySelect.value = state.overlay;
  renderOverlayContext();
  if (announce) {
    const selectedOverlay = getSelectedOverlay();
    overlayStatus.textContent = !selectedOverlay
      ? "Jurisdiction context removed. Core matrix content is unchanged."
      : selectedOverlay?.scope.domainIds.includes(state.activeDomain)
        ? "EU and Finland pilot context shown for the active domain."
        : "EU and Finland pilot enabled. No pilot annotations are mapped to the active domain.";
  }
  if (sync) {
    syncUrl({
      push: true,
      focusSelector: "#overlaySelect",
      returnFocusSelector: "#overlaySelect"
    });
  }
}
/* csm-release-scope:v1.3.0:end */

function createSourceFact(label, value) {
  if (!value) return null;
  const fact = createElement("div");
  fact.append(createElement("dt", "", label), createElement("dd", "", value));
  return fact;
}

function createReferenceCard(domain) {
  const references = referencesByDomain[domain.id] ?? [];
  const card = createElement("article", "reference-card");
  const header = createElement("div", "reference-card__header");
  const copy = createElement("div");
  const label = createElement("p", "section-label", "Domain guidance and further reading");
  const title = createElement("h3", "domain-name", domain.name);
  const context = createElement("p", "reference-context", domain.sourceContext);
  const limitation = createElement(
    "p",
    "reference-limitation",
    "These sources inform the domain as a whole; they do not establish compliance or prove every individual matrix entry."
  );
  const count = createElement("span", "reference-count", `${references.length} sources`);
  const list = createElement("ol", "source-list");
  list.setAttribute("role", "list");

  copy.append(label, title, context, limitation);
  header.append(copy, count);

  references.forEach((reference, index) => {
    const sourceTitle = reference.title ?? reference.shortTitle ?? `${reference.org} source record`;
    const item = createElement("li", "source-row");
    const number = createElement("span", "source-number", String(index + 1).padStart(2, "0"));
    const content = createElement("div", "source-content");
    const topline = createElement("div", "source-topline");
    const heading = createElement("h4", "source-title", sourceTitle);
    const metadata = createElement("dl", "source-metadata");
    const note = reference.note ? createElement("p", "source-note", reference.note) : null;
    const applicability = reference.applicability
      ? createElement("p", "source-applicability", reference.applicability)
      : null;
    const link = createElement("a", "source-link", "Open original");

    item.id = `source-${domain.id}-${reference.id}`;
    item.tabIndex = -1;
    [
      ["source-org", reference.org],
      ["source-type", reference.type],
      ["source-scope", reference.jurisdiction],
      ["source-status", reference.status]
    ].forEach(([className, value]) => {
      if (value) topline.append(createElement("span", className, value));
    });

    [
      createSourceFact("Authority", reference.authority),
      createSourceFact("Access", reference.access),
      createSourceFact("Edition", reference.editionNote),
      createSourceFact("Verified", reference.verifiedOn)
    ].filter(Boolean).forEach((fact) => metadata.append(fact));

    link.href = getSafeExternalHttpsUrl(reference.url);
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    const arrow = createElement("span", "source-arrow", "↗");
    arrow.setAttribute("aria-hidden", "true");
    link.append(arrow, createElement("span", "sr-only", ` — ${sourceTitle}; opens in a new tab`));

    content.append(topline, heading);
    if (metadata.children.length) content.append(metadata);
    if (note) content.append(note);
    if (applicability) {
      applicability.prepend(createElement("strong", "", "Applicability: "));
      content.append(applicability);
    }
    content.append(link);
    item.append(number, content);
    list.append(item);
  });

  card.append(header, list);
  return card;
}

function createMitigationToolsDetails(tools, mitigationId, revealTools = false) {
  const details = createElement("details", "mitigation-tools");
  details.open = revealTools;
  const summary = createElement(
    "summary",
    "mitigation-tools__summary",
    "Implementation tools · 2"
  );
  summary.setAttribute("aria-label", `Implementation tools for ${mitigationId} · 2`);
  const list = createElement("ul", "mitigation-tools__list");
  list.setAttribute("role", "list");

  tools.forEach((tool) => {
    const item = createElement("li", "mitigation-tools__item");
    const name = createElement("strong", "mitigation-tools__name", tool.name);
    const use = createElement("p", "mitigation-tools__use", tool.use);
    item.append(name, use);
    list.append(item);
  });

  details.append(summary, list);
  return details;
}

function createMatrixTile(kind, label, text, code, tools = [], revealTools = false) {
  const tile = createElement("li", `matrix-tile matrix-tile--${kind}`);
  const topline = createElement("div", "matrix-tile__topline");
  const tileLabel = createElement("p", "matrix-tile__label", label);
  const tileCode = createElement("span", "matrix-tile__code", code);

  topline.append(tileLabel, tileCode);
  tile.id = code.toLocaleLowerCase("en");
  tile.dataset.kind = kind;
  tile.append(topline, createElement("p", "matrix-tile__text", text));
  if (kind === "mitigations") {
    const select = createElement("button", "matrix-tile__select", briefModel.has(code) ? "Remove from brief" : "Add to brief");
    select.type = "button";
    select.dataset.actionId = code;
    select.setAttribute("aria-pressed", String(briefModel.has(code)));
    select.setAttribute("aria-label", `${briefModel.has(code) ? "Remove" : "Add"} ${code} ${briefModel.has(code) ? "from" : "to"} action brief`);
    select.addEventListener("click", () => toggleBriefSelection(code, select));
    tile.append(createMitigationToolsDetails(tools, code, revealTools), select);
  }
  return tile;
}

function createPhaseEvidence(domain, phase) {
  const references = getPhaseEvidence(domain.id, phase.id);
  const details = createElement("details", "phase-evidence");
  const sourceLabel = references.length === 1 ? "context source" : "context sources";
  const summary = createElement(
    "summary",
    "phase-evidence__summary",
    `Evidence for this phase · ${references.length} ${sourceLabel}`
  );
  const content = createElement("div", "phase-evidence__content");
  const limitation = createElement(
    "p",
    "phase-evidence__limitation",
    "Context sources, not entry-level proof. These records inform the phase and do not establish compliance."
  );
  const list = createElement("ul", "phase-evidence__list");
  list.setAttribute("role", "list");

  references.forEach((reference) => {
    const item = createElement("li");
    const targetId = getSourceRowId(domain.id, reference.id);
    const link = createElement("a", "phase-evidence__link", formatSourceLabel(reference));
    link.href = `#${targetId}`;
    connectFragmentFocus(link, targetId);
    item.append(link);
    list.append(item);
  });

  content.append(limitation);
  if (references.length) {
    content.append(list);
  } else {
    content.append(createElement("p", "phase-evidence__empty", "No phase-level context source mapping is recorded."));
  }
  details.append(summary, content);
  return details;
}

function createPhaseDetailCard(domain, phase) {
  const cellData = domain.cells[phase.id];
  const actors = domain.actors?.[phase.id] ?? [];
  const card = createElement("article", "phase-detail");
  const header = createElement("header", "phase-detail__header");
  const phaseNumber = String(phases.findIndex((item) => item.id === phase.id) + 1).padStart(2, "0");
  const kicker = createElement("p", "phase-kicker", `${phaseNumber} / ${String(phases.length).padStart(2, "0")}`);
  const title = createElement("h3", "phase-title", phase.title);
  const summary = createElement("p", "phase-summary", domain.phaseFraming?.[phase.id] ?? phase.summary);
  const stack = createElement("ul", "phase-stack");
  stack.setAttribute("role", "list");
  const visibleKinds = getVisibleKinds();

  const entries = [
    ...actors.map((record) => ({
      kind: "actors",
      label: "Threat source or initiating condition",
      text: getEntryText(record),
      id: record.id,
      tools: []
    })),
    ...cellData.threats.map((record) => ({
      kind: "risks",
      label: "Risk or failure mode",
      text: getEntryText(record),
      id: record.id,
      tools: []
    })),
    ...cellData.controls.map((record) => ({
      kind: "mitigations",
      label: "Control or response action",
      text: getEntryText(record),
      id: record.id,
      tools: getMitigationTools(record.id)
    }))
  ].map((entry) => {
    const coreSearchValues = [entry.id, entry.label, entry.text, phase.title, domain.name];
    const toolSearchValues = entry.tools.flatMap((tool) => [tool.name, tool.use]);
    const searchMatch = getMatrixEntrySearchMatch(state.query, coreSearchValues, toolSearchValues);
    return { ...entry, matchesSearch: searchMatch.matches, revealTools: searchMatch.revealTools };
  }).filter((entry) => visibleKinds.has(entry.kind) && entry.matchesSearch);

  entries.forEach((entry) => {
    stack.append(
      createMatrixTile(entry.kind, entry.label, entry.text, entry.id, entry.tools, entry.revealTools)
    );
  });
  if (!entries.length) stack.append(createElement("li", "phase-empty", "No matching entries in this phase."));

  const counts = createElement("p", "phase-detail__meta", `${entries.length} ${entries.length === 1 ? "entry" : "entries"}`);
  header.append(kicker, title, summary, counts);
  card.append(header, createPhaseEvidence(domain, phase), stack);
  card.dataset.entryCount = String(entries.length);
  return card;
}

function renderMatrix() {
  const domain = getActiveDomain();
  const visiblePhases = phases.filter((phase) => state.phase === "all" || state.phase === phase.id);
  const cards = visiblePhases.map((phase) => createPhaseDetailCard(domain, phase));
  const entryCount = cards.reduce((total, card) => total + Number(card.dataset.entryCount), 0);

  matrixGrid.replaceChildren(...cards);
  matrixGrid.dataset.phaseMode = state.phase;
  matrixGrid.classList.toggle("is-phase-focused", state.phase !== "all");
  matrixGrid.setAttribute("aria-labelledby", `tab-${domain.id}`);
  emptyState.hidden = entryCount !== 0;
  matrixGrid.hidden = entryCount === 0;

  const layerLabels = {
    all: "all decision layers",
    actors: "threat sources",
    risks: "risks and failure modes",
    mitigations: "controls and actions"
  };
  const searchLabel = state.query ? ` matching “${state.query}”` : "";
  const phaseLabel = state.phase === "all" ? "All phases" : phases.find((phase) => phase.id === state.phase).title;
  resultCount.textContent = `${entryCount} ${entryCount === 1 ? "entry" : "entries"}${searchLabel} · ${layerLabels[state.view]} · ${phaseLabel} · ${domain.name}`;
}

function renderReferences() {
  referenceGrid.replaceChildren(createReferenceCard(getActiveDomain()));
  if (sourceMappingCount) {
    sourceMappingCount.textContent = String(
      Object.values(referencesByDomain).reduce((total, references) => total + references.length, 0)
    );
  }
  window.requestAnimationFrame(restoreDynamicFragment);
}

function setView(view, { focus = false, sync = true } = {}) {
  if (!validViews.has(view)) return;
  const previousView = state.view;
  state.view = view;
  page.dataset.view = view;

  viewButtons.forEach((button) => {
    const isActive = button.dataset.viewMode === view;
    button.setAttribute("aria-checked", String(isActive));
    button.tabIndex = isActive ? 0 : -1;
    button.classList.toggle("is-active", isActive);
    if (focus && isActive) button.focus();
  });

  renderMatrix();
  if (sync) {
    syncUrl({
      push: true,
      focusSelector: `#view-${view}`,
      returnFocusSelector: `#view-${previousView}`
    });
  }
}

function renderPhaseControls() {
  phaseButtons.forEach((button) => {
    const active = button.dataset.phaseMode === state.phase;
    button.setAttribute("aria-checked", String(active));
    button.tabIndex = active ? 0 : -1;
    button.classList.toggle("is-active", active);
  });
}

function setPhase(phase, { focus = false, sync = true } = {}) {
  if (!validPhases.has(phase)) return;
  const previousPhase = state.phase;
  state.phase = phase;
  renderPhaseControls();
  renderMatrix();
  if (focus) phaseButtons.find((button) => button.dataset.phaseMode === phase)?.focus();
  if (sync) syncUrl({ push: true, focusSelector: `#phase-${phase}`, returnFocusSelector: `#phase-${previousPhase}` });
}

function updateSearch(value) {
  state.query = value.trim();
  clearSearchButton.hidden = !state.query;
  renderMatrix();
  syncUrl({ focusSelector: "#matrixSearch" });
}

async function copyCurrentView() {
  const url = window.location.href;
  try {
    await navigator.clipboard.writeText(url);
    copyStatus.textContent = "Link copied to clipboard.";
    copyLinkButton.textContent = "Copied";
  } catch {
    copyStatus.textContent = "Copy failed. Select the address from your browser.";
    copyLinkButton.textContent = "Copy unavailable";
  }

  window.setTimeout(() => {
    copyLinkButton.textContent = "Copy this view";
  }, 1800);
}

viewButtons.forEach((button, index) => {
  button.addEventListener("click", () => setView(button.dataset.viewMode));
  button.addEventListener("keydown", (event) => {
    let nextIndex = index;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") nextIndex = (index + 1) % viewButtons.length;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") nextIndex = (index - 1 + viewButtons.length) % viewButtons.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = viewButtons.length - 1;
    else return;

    event.preventDefault();
    setView(viewButtons[nextIndex].dataset.viewMode, { focus: true });
  });
});

phaseButtons.forEach((button, index) => {
  button.addEventListener("click", () => setPhase(button.dataset.phaseMode));
  button.addEventListener("keydown", (event) => {
    let nextIndex = index;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") nextIndex = (index + 1) % phaseButtons.length;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") nextIndex = (index - 1 + phaseButtons.length) % phaseButtons.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = phaseButtons.length - 1;
    else return;
    event.preventDefault();
    setPhase(phaseButtons[nextIndex].dataset.phaseMode, { focus: true });
  });
});

const briefContext = createElement("p", "action-brief__meta", `Framework: ${MITIGATION_TOOL_FRAMEWORK_VERSION} · Overlay: not included. User-selected controls in selection order, not a risk ranking. Planning horizons are choices, not prescribed deadlines. Context sources, not entry-level proof; no compliance or risk-elimination claim. Downloads are unencrypted.`);
briefEmpty.before(briefContext);
openBriefButton.addEventListener("click", () => {
  briefPanel.hidden = !briefPanel.hidden;
  openBriefButton.setAttribute("aria-expanded", String(!briefPanel.hidden));
  if (!briefPanel.hidden) briefPanel.focus();
});
document.getElementById("closeActionBrief").addEventListener("click", () => {
  briefPanel.hidden = true;
  openBriefButton.setAttribute("aria-expanded", "false");
  openBriefButton.focus();
});
clearBriefButton.addEventListener("click", () => {
  briefModel.clear();
  renderActionBrief();
  updateSelectionButtons();
  announceBrief("All action brief selections cleared.");
  briefEmpty.tabIndex = -1;
  briefEmpty.focus();
});
exportBriefButton.addEventListener("click", () => {
  const items = briefModel.getItems();
  if (!items.length) return;
  try {
    const blob = new Blob([buildActionBriefMarkdown(items)], { type: "text/markdown;charset=utf-8" });
    const downloadUrl = URL.createObjectURL(blob);
    const link = createElement("a");
    link.href = downloadUrl;
    link.download = "csm-action-brief.md";
    link.hidden = true;
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
    announceBrief("Unencrypted brief download requested. Handle the file within your organisation's policy.");
  } catch {
    announceBrief("Download unavailable. You can print the brief instead.");
  }
});
function resetBriefPrintMode() {
  page.classList.remove("printing-action-brief");
}
printBriefButton.addEventListener("click", () => {
  if (!briefModel.getItems().length) return;
  page.classList.add("printing-action-brief");
  try {
    window.print();
  } catch {
    resetBriefPrintMode();
    announceBrief("Printing unavailable. You can download the brief instead.");
  }
});
window.addEventListener("afterprint", resetBriefPrintMode);
window.matchMedia("print").addEventListener("change", (event) => {
  if (!event.matches) resetBriefPrintMode();
});
window.addEventListener("pagehide", () => {
  briefModel.clear();
  renderActionBrief();
  updateSelectionButtons();
  announceBrief("");
  briefPanel.hidden = true;
  openBriefButton.setAttribute("aria-expanded", "false");
  resetBriefPrintMode();
});

function focusAfterMobileDomainChange(activeButton, fallbackButton) {
  const focusTarget = activeButton?.disabled ? fallbackButton : activeButton;
  focusTarget?.focus();
}

previousDomainButton?.addEventListener("click", () => {
  const activeIndex = domains.findIndex((domain) => domain.id === state.activeDomain);
  if (activeIndex <= 0) return;
  const nextIndex = activeIndex - 1;
  const historyFocusSelector = nextIndex === 0 ? "#nextDomain" : "#previousDomain";
  setActiveDomain(domains[nextIndex].id, {
    historyFocusSelector,
    historyReturnFocusSelector: "#previousDomain"
  });
  focusAfterMobileDomainChange(previousDomainButton, nextDomainButton);
});

nextDomainButton?.addEventListener("click", () => {
  const activeIndex = domains.findIndex((domain) => domain.id === state.activeDomain);
  if (activeIndex >= domains.length - 1) return;
  const nextIndex = activeIndex + 1;
  const historyFocusSelector = nextIndex === domains.length - 1 ? "#previousDomain" : "#nextDomain";
  setActiveDomain(domains[nextIndex].id, {
    historyFocusSelector,
    historyReturnFocusSelector: "#nextDomain"
  });
  focusAfterMobileDomainChange(nextDomainButton, previousDomainButton);
});

domainFilters.addEventListener("scroll", updateDomainRailEdges, { passive: true });
window.addEventListener("resize", updateDomainRailEdges);

mobileNav?.addEventListener("click", (event) => {
  const link = event.target.closest("a");
  if (!link) return;
  mobileNav.open = false;
  const href = link.getAttribute("href");
  if (!href?.startsWith("#")) return;
  window.requestAnimationFrame(() => focusFragmentTarget(href.slice(1)));
});

searchInput.value = state.query;
clearSearchButton.hidden = !state.query;
searchInput.addEventListener("input", (event) => updateSearch(event.target.value));
clearSearchButton.addEventListener("click", () => {
  searchInput.value = "";
  updateSearch("");
  searchInput.focus();
});
copyLinkButton.addEventListener("click", copyCurrentView);
/* csm-release-scope:v1.3.0:begin */
overlaySelect.value = state.overlay;
overlaySelect.addEventListener("change", (event) => setOverlay(event.target.value));
/* csm-release-scope:v1.3.0:end */

window.addEventListener("popstate", (event) => {
  const params = new URLSearchParams(window.location.search);
  const domain = params.get("domain");
  const view = params.get("view");
  /* csm-release-scope:v1.3.0:begin */
  const overlay = params.get("overlay");
  /* csm-release-scope:v1.3.0:end */

  state.activeDomain = domains.some((item) => item.id === domain) ? domain : domains[0].id;
  state.view = validViews.has(view) ? view : "all";
  state.phase = validPhases.has(params.get("phase")) ? params.get("phase") : "all";
  state.query = (params.get("q") ?? "").trim();
  /* csm-release-scope:v1.3.0:begin */
  state.overlay = availableOverlayIds.has(overlay) ? overlay : "";
  /* csm-release-scope:v1.3.0:end */
  searchInput.value = state.query;
  clearSearchButton.hidden = !state.query;
  /* csm-release-scope:v1.3.0:begin */
  overlaySelect.value = state.overlay;
  /* csm-release-scope:v1.3.0:end */

  renderFilters();
  window.requestAnimationFrame(() => revealActiveDomainTab());
  renderActiveDomain();
  /* csm-release-scope:v1.3.0:begin */
  renderOverlayContext();
  /* csm-release-scope:v1.3.0:end */
  renderReferences();
  renderPhaseControls();
  setView(state.view, { sync: false });
  const historyFocusSelector =
    normalizeHistoryFocusSelector(event.state?.focusSelector) ?? getDefaultHistoryFocusSelector();
  syncUrl({ focusSelector: historyFocusSelector });
  const restoredFragment = safeDecodeFragment();
  if (restoredFragment === "matrix-explorer" || restoredFragment === "source-pack") {
    window.requestAnimationFrame(() => focusFragmentTarget(restoredFragment));
  } else if (!isHistoryFragmentFocusTarget(restoredFragment)) {
    window.requestAnimationFrame(() => focusHistoryTarget(historyFocusSelector));
  }
});

renderFilters();
window.requestAnimationFrame(() => revealActiveDomainTab());
renderActiveDomain();
/* csm-release-scope:v1.3.0:begin */
renderOverlayContext();
/* csm-release-scope:v1.3.0:end */
renderReferences();
renderPhaseControls();
renderActionBrief();
setView(state.view, { sync: false });
syncUrl();
}

try {
  const bootstrapError = validateBootstrapData();
  if (bootstrapError) {
    showDataError();
  } else {
    initializeApp();
    document.body.dataset.appState = "ready";
  }
} catch {
  showDataError();
}
