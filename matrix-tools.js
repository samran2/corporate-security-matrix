const mitigationTools = (() => {
  "use strict";

  const schemaVersion = "1.0.0";
  const frameworkVersion = "1.1.0-candidate";
  const disclaimer =
    "Tool suggestions are illustrative, vendor-neutral implementation aids. Select, configure and validate them for the organisation's context; they do not guarantee risk elimination.";
  const domainIds = [
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
  const partitions = [domainIds.slice(0, 3), domainIds.slice(3, 6), domainIds.slice(6, 9)];
  const phaseCodes = ["I", "P", "D", "R", "RC"];
  const setKeys = ["domainIds", "entries", "schemaVersion"];
  const toolKeys = ["name", "use"];
  const toolIdPattern = /^CSM-D0[1-9]-(?:I|P|D|R|RC)-M0[1-4]$/;
  const urlPattern =
    /(?:[a-z][a-z0-9+.-]*:\/\/|www\.|\b(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+(?:[a-z]{2,63}|xn--[a-z0-9-]{2,59})(?::\d{2,5})?(?:[/?#]\S*)?|\b(?:\d{1,3}\.){3}\d{1,3}(?::\d{2,5})?(?:[/?#]\S*)?|\[[0-9a-f:]+\](?::\d{2,5})?(?:[/?#]\S*)?)/i;
  const emailPattern = /\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b/i;
  const vendorPattern =
    /\b(?:abb|amazon|atlassian|aws|azure|bosch|cisco|crowdstrike|datadog|fortinet|genetec|github|gitlab|google|hikvision|honeywell|ibm|jira|johnson controls|lenel|microsoft|milestone systems|okta|oracle|palo alto|proofpoint|rockwell|salesforce|sap|schneider electric|servicenow|siemens|slack|splunk|symantec|tenable|vmware|workday|zscaler)\b/i;
  const endorsementPattern =
    /\b(?:best(?:-in-class)?|industry-leading|market-leading|preferred vendor|recommended vendor|world-class)\b/i;
  const absoluteClaimPattern =
    /\b(?:zero risk|no risk|risk-free|completely safe|fully prevents?\b|(?:prevents?|stops?|blocks?) (?:all|every) (?:breaches?|failures?|harm|incidents?|risks?|threats?)|(?:eliminates?|eradicates?) (?:all |the )?(?:breaches?|failures?|harm|incidents?|risks?|threats?)|(?:certifies?|guarantees?|ensures?)(?: complete| full| total)? (?:compliance(?: with (?:all|every) requirements?)?|safety|security|protection)|(?:guarantees?|ensures?) that (?:all |every )?(?:breaches?|failures?|incidents?|risks?|threats?) never (?:happen|occur)|makes? (?:all |any |every )?(?:breaches?|failures?|harm|incidents?|risks?|threats?) impossible|cannot fail|never fails?|infallible|always (?:blocks?|detects?|ensures?|prevents?|protects?|stops?))\b/i;

  function isRecord(value) {
    if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
  }

  function hasExactKeys(value, expectedKeys) {
    if (!isRecord(value)) return false;
    const actual = Object.keys(value).sort();
    const expected = [...expectedKeys].sort();
    return actual.length === expected.length && actual.every((key, index) => key === expected[index]);
  }

  function sameArray(left, right) {
    return Array.isArray(left) && left.length === right.length && left.every((value, index) => value === right[index]);
  }

  function normalized(value) {
    return value.normalize("NFKC").trim().replace(/\s+/g, " ").toLocaleLowerCase("en-US");
  }

  function expectedIdsForPartition(partitionIndex) {
    const ids = [];
    const firstDomainNumber = partitionIndex * 3 + 1;
    for (let offset = 0; offset < 3; offset += 1) {
      const domainCode = `D${String(firstDomainNumber + offset).padStart(2, "0")}`;
      for (const phaseCode of phaseCodes) {
        for (let mitigationNumber = 1; mitigationNumber <= 4; mitigationNumber += 1) {
          ids.push(`CSM-${domainCode}-${phaseCode}-M${String(mitigationNumber).padStart(2, "0")}`);
        }
      }
    }
    return ids;
  }

  function validateText(value, location, maximumLength, errors) {
    if (typeof value !== "string" || value.trim().length === 0) {
      errors.push(`${location} must be a non-empty string.`);
      return;
    }
    if (value !== value.trim()) errors.push(`${location} must be trimmed.`);
    if (/[\r\n\u0000-\u001f\u007f]/.test(value)) errors.push(`${location} must be single-line plain text.`);
    if (/[<>]/.test(value)) errors.push(`${location} must not contain markup delimiters.`);
    if (Array.from(value).length > maximumLength) errors.push(`${location} exceeds ${maximumLength} characters.`);
    if (urlPattern.test(value) || emailPattern.test(value)) errors.push(`${location} must not contain a URL or email address.`);
    if (vendorPattern.test(value) || /[®™©]/u.test(value)) errors.push(`${location} must remain vendor-neutral.`);
    if (endorsementPattern.test(value)) errors.push(`${location} must not contain promotional endorsement language.`);
    if (absoluteClaimPattern.test(value)) errors.push(`${location} must not claim absolute risk removal.`);
  }

  const sets = globalThis.CSM_MITIGATION_TOOL_SETS;
  const errors = [];
  if (!Array.isArray(sets) || sets.length !== 3) {
    throw new TypeError("Invalid mitigation-tool data: exactly three fragment sets are required.");
  }

  const mergedEntries = Object.create(null);
  for (const [setIndex, set] of sets.entries()) {
    const location = `CSM_MITIGATION_TOOL_SETS[${setIndex}]`;
    if (!hasExactKeys(set, setKeys)) {
      errors.push(`${location} must contain exactly schemaVersion, domainIds and entries.`);
      continue;
    }
    if (set.schemaVersion !== schemaVersion) errors.push(`${location}.schemaVersion must be ${schemaVersion}.`);
    if (!sameArray(set.domainIds, partitions[setIndex])) {
      errors.push(`${location}.domainIds does not match its canonical partition.`);
    }
    if (!isRecord(set.entries)) {
      errors.push(`${location}.entries must be an object.`);
      continue;
    }

    const expectedIds = expectedIdsForPartition(setIndex);
    const expectedSet = new Set(expectedIds);
    const actualIds = Object.keys(set.entries);
    if (actualIds.length !== expectedIds.length) {
      errors.push(`${location}.entries must contain exactly ${expectedIds.length} mitigation IDs.`);
    }
    for (const id of expectedIds) {
      if (!Object.prototype.hasOwnProperty.call(set.entries, id)) {
        errors.push(`${location}.entries is missing ${id}.`);
      }
    }
    for (const id of actualIds) {
      const entryLocation = `${location}.entries.${id}`;
      if (!toolIdPattern.test(id) || !expectedSet.has(id)) {
        errors.push(`${location}.entries contains unexpected mitigation ID ${id}.`);
      }
      if (Object.prototype.hasOwnProperty.call(mergedEntries, id)) {
        errors.push(`Mitigation ID appears in more than one fragment: ${id}.`);
      }

      const tools = set.entries[id];
      if (!Array.isArray(tools) || tools.length !== 2) {
        errors.push(`${entryLocation} must contain exactly two tool records.`);
        continue;
      }

      const names = new Set();
      const copiedTools = [];
      for (const [toolIndex, tool] of tools.entries()) {
        const toolLocation = `${entryLocation}[${toolIndex}]`;
        if (!hasExactKeys(tool, toolKeys)) {
          errors.push(`${toolLocation} must contain exactly name and use.`);
          continue;
        }
        validateText(tool.name, `${toolLocation}.name`, 72, errors);
        validateText(tool.use, `${toolLocation}.use`, 180, errors);
        if (typeof tool.name === "string" && tool.name.trim()) {
          const normalizedName = normalized(tool.name);
          if (names.has(normalizedName)) errors.push(`${entryLocation} must contain two distinct tool names.`);
          names.add(normalizedName);
        }
        copiedTools.push(Object.freeze({ name: tool.name, use: tool.use }));
      }
      if (copiedTools.length === 2) mergedEntries[id] = Object.freeze(copiedTools);
    }
  }

  if (Object.keys(mergedEntries).length !== 180) {
    errors.push(`Merged mitigation-tool data must contain exactly 180 unique mitigation IDs.`);
  }
  const toolRecordCount = Object.values(mergedEntries).reduce((total, tools) => total + tools.length, 0);
  if (toolRecordCount !== 360) {
    errors.push(`Merged mitigation-tool data must contain exactly 360 tool records.`);
  }
  if (errors.length) {
    throw new TypeError(`Invalid mitigation-tool data:\n${errors.map((error) => `- ${error}`).join("\n")}`);
  }

  return Object.freeze({
    schemaVersion,
    frameworkVersion,
    disclaimer,
    entries: Object.freeze(mergedEntries)
  });
})();
