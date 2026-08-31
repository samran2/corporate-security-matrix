import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const ROOT = new URL("../", import.meta.url);
const SCHEMA_VERSION = "1.0.0";
const FRAMEWORK_VERSION = "1.1.0-candidate";
const DISCLAIMER =
  "Tool suggestions are illustrative, vendor-neutral implementation aids. Select, configure and validate them for the organisation's context; they do not guarantee risk elimination.";
const DOMAIN_IDS = [
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
const PHASE_IDS = ["identify", "protect", "detect", "respond", "recover"];
const PARTITIONS = [DOMAIN_IDS.slice(0, 3), DOMAIN_IDS.slice(3, 6), DOMAIN_IDS.slice(6, 9)];
const FRAGMENT_FILES = [
  "matrix-tools-d01-d03.js",
  "matrix-tools-d04-d06.js",
  "matrix-tools-d07-d09.js"
];
const AGGREGATOR_FILE = "matrix-tools.js";
const SET_KEYS = ["domainIds", "entries", "schemaVersion"];
const TOOL_KEYS = ["name", "use"];
const AGGREGATE_KEYS = ["disclaimer", "entries", "frameworkVersion", "schemaVersion"];
const TOOL_ID_PATTERN = /^CSM-D0[1-9]-(?:I|P|D|R|RC)-M0[1-4]$/;
const URL_PATTERN =
  /(?:[a-z][a-z0-9+.-]*:\/\/|www\.|\b(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+(?:[a-z]{2,63}|xn--[a-z0-9-]{2,59})(?::\d{2,5})?(?:[/?#]\S*)?|\b(?:\d{1,3}\.){3}\d{1,3}(?::\d{2,5})?(?:[/?#]\S*)?|\[[0-9a-f:]+\](?::\d{2,5})?(?:[/?#]\S*)?)/i;
const EMAIL_PATTERN = /\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b/i;
const VENDOR_PATTERN =
  /\b(?:abb|amazon|atlassian|aws|azure|bosch|cisco|crowdstrike|datadog|fortinet|genetec|github|gitlab|google|hikvision|honeywell|ibm|jira|johnson controls|lenel|microsoft|milestone systems|okta|oracle|palo alto|proofpoint|rockwell|salesforce|sap|schneider electric|servicenow|siemens|slack|splunk|symantec|tenable|vmware|workday|zscaler)\b/i;
const ENDORSEMENT_PATTERN =
  /\b(?:best(?:-in-class)?|industry-leading|market-leading|preferred vendor|recommended vendor|world-class)\b/i;
const ABSOLUTE_CLAIM_PATTERN =
  /\b(?:zero risk|no risk|risk-free|completely safe|fully prevents?\b|(?:prevents?|stops?|blocks?) (?:all|every) (?:breaches?|failures?|harm|incidents?|risks?|threats?)|(?:eliminates?|eradicates?) (?:all |the )?(?:breaches?|failures?|harm|incidents?|risks?|threats?)|(?:certifies?|guarantees?|ensures?)(?: complete| full| total)? (?:compliance(?: with (?:all|every) requirements?)?|safety|security|protection)|(?:guarantees?|ensures?) that (?:all |every )?(?:breaches?|failures?|incidents?|risks?|threats?) never (?:happen|occur)|makes? (?:all |any |every )?(?:breaches?|failures?|harm|incidents?|risks?|threats?) impossible|cannot fail|never fails?|infallible|always (?:blocks?|detects?|ensures?|prevents?|protects?|stops?))\b/i;

function isRecord(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function exactKeys(value, expectedKeys) {
  if (!isRecord(value)) return false;
  const actual = Object.keys(value).sort();
  const expected = [...expectedKeys].sort();
  return actual.length === expected.length && actual.every((key, index) => key === expected[index]);
}

function sameArray(left, right) {
  return Array.isArray(left) && left.length === right.length && left.every((value, index) => value === right[index]);
}

function normalize(value) {
  return value.normalize("NFKC").trim().replace(/\s+/g, " ").toLocaleLowerCase("en-US");
}

function validatePlainText(value, location, maximumLength, errors) {
  if (typeof value !== "string" || value.trim().length === 0) {
    errors.push(`${location} must be a non-empty string.`);
    return;
  }
  if (value !== value.trim()) errors.push(`${location} must not have leading or trailing whitespace.`);
  if (/[\r\n\u0000-\u001f\u007f]/.test(value)) errors.push(`${location} must be single-line plain text.`);
  if (/[<>]/.test(value)) errors.push(`${location} must not contain markup delimiters.`);
  if (Array.from(value).length > maximumLength) {
    errors.push(`${location} must not exceed ${maximumLength} characters.`);
  }
  if (URL_PATTERN.test(value) || EMAIL_PATTERN.test(value)) errors.push(`${location} must not contain a URL or email address.`);
  if (VENDOR_PATTERN.test(value) || /[®™©]/u.test(value)) errors.push(`${location} must remain vendor-neutral.`);
  if (ENDORSEMENT_PATTERN.test(value)) errors.push(`${location} must not endorse or promote a vendor.`);
  if (ABSOLUTE_CLAIM_PATTERN.test(value)) errors.push(`${location} must not claim absolute risk removal.`);
}

function collectExpectedMitigations(domains, errors) {
  const byDomain = new Map(DOMAIN_IDS.map((domainId) => [domainId, []]));
  const actualDomainIds = Array.isArray(domains) ? domains.map((domain) => domain?.id) : [];
  if (!sameArray(actualDomainIds, DOMAIN_IDS)) {
    errors.push(`Core domains must remain in canonical order: ${DOMAIN_IDS.join(", ")}.`);
    return byDomain;
  }

  for (const [domainIndex, domain] of domains.entries()) {
    const domainCode = `D${String(domainIndex + 1).padStart(2, "0")}`;
    for (const phaseId of PHASE_IDS) {
      const controls = domain?.cells?.[phaseId]?.controls;
      if (!Array.isArray(controls) || controls.length !== 4) {
        errors.push(`${domain.id}/${phaseId} must expose exactly four mitigation records.`);
        continue;
      }
      for (const control of controls) {
        if (!isRecord(control) || typeof control.id !== "string" || !TOOL_ID_PATTERN.test(control.id)) {
          errors.push(`${domain.id}/${phaseId} contains an invalid mitigation ID.`);
          continue;
        }
        if (!control.id.startsWith(`CSM-${domainCode}-`)) {
          errors.push(`${control.id} does not match canonical domain ${domainCode}.`);
          continue;
        }
        byDomain.get(domain.id).push(control.id);
      }
    }
  }
  return byDomain;
}

function validateToolPair(tools, location, errors) {
  if (!Array.isArray(tools) || tools.length !== 2) {
    errors.push(`${location} must contain exactly two tool records.`);
    return;
  }

  const names = new Set();
  for (const [toolIndex, tool] of tools.entries()) {
    const toolLocation = `${location}[${toolIndex}]`;
    if (!exactKeys(tool, TOOL_KEYS)) {
      errors.push(`${toolLocation} must contain exactly name and use.`);
      continue;
    }
    validatePlainText(tool.name, `${toolLocation}.name`, 72, errors);
    validatePlainText(tool.use, `${toolLocation}.use`, 180, errors);
    if (typeof tool.name === "string" && tool.name.trim()) {
      const normalizedName = normalize(tool.name);
      if (names.has(normalizedName)) errors.push(`${location} must contain two distinct tool names.`);
      names.add(normalizedName);
    }
  }
}

function validateEntries(entries, expectedIds, location, errors, globalIds = null) {
  if (!isRecord(entries)) {
    errors.push(`${location} must be an object keyed by mitigation ID.`);
    return;
  }

  const actualIds = Object.keys(entries);
  const actualSet = new Set(actualIds);
  const expectedSet = new Set(expectedIds);
  for (const id of actualIds) {
    if (!TOOL_ID_PATTERN.test(id)) errors.push(`${location} contains an invalid mitigation ID: ${id}.`);
    if (!expectedSet.has(id)) errors.push(`${location} contains an unexpected mitigation ID: ${id}.`);
    if (globalIds) {
      if (globalIds.has(id)) errors.push(`Mitigation ID appears in more than one fragment: ${id}.`);
      globalIds.add(id);
    }
    validateToolPair(entries[id], `${location}.${id}`, errors);
  }
  for (const id of expectedIds) {
    if (!actualSet.has(id)) errors.push(`${location} is missing mitigation ID: ${id}.`);
  }
  if (actualIds.length !== expectedIds.length) {
    errors.push(`${location} must contain exactly ${expectedIds.length} mitigation IDs; found ${actualIds.length}.`);
  }
}

export function validateMitigationToolsContract({ domains, fragmentSets, mitigationTools }) {
  const errors = [];
  const expectedByDomain = collectExpectedMitigations(domains, errors);
  const expectedAll = DOMAIN_IDS.flatMap((domainId) => expectedByDomain.get(domainId));
  if (expectedAll.length !== 180 || new Set(expectedAll).size !== 180) {
    errors.push(`Core matrix must expose exactly 180 unique mitigation IDs; found ${new Set(expectedAll).size}.`);
  }

  if (!Array.isArray(fragmentSets) || fragmentSets.length !== 3) {
    errors.push(`CSM_MITIGATION_TOOL_SETS must contain exactly three fragments; found ${Array.isArray(fragmentSets) ? fragmentSets.length : 0}.`);
  }

  const safeSets = Array.isArray(fragmentSets) ? fragmentSets : [];
  const globalFragmentIds = new Set();
  for (const [setIndex, set] of safeSets.entries()) {
    const location = `CSM_MITIGATION_TOOL_SETS[${setIndex}]`;
    if (!exactKeys(set, SET_KEYS)) {
      errors.push(`${location} must contain exactly schemaVersion, domainIds and entries.`);
      continue;
    }
    if (set.schemaVersion !== SCHEMA_VERSION) errors.push(`${location}.schemaVersion must be ${SCHEMA_VERSION}.`);
    const expectedPartition = PARTITIONS[setIndex];
    if (!expectedPartition || !sameArray(set.domainIds, expectedPartition)) {
      errors.push(`${location}.domainIds must match its canonical three-domain partition.`);
    }
    const partitionIds = expectedPartition
      ? expectedPartition.flatMap((domainId) => expectedByDomain.get(domainId))
      : [];
    validateEntries(set.entries, partitionIds, `${location}.entries`, errors, globalFragmentIds);
  }

  if (!exactKeys(mitigationTools, AGGREGATE_KEYS)) {
    errors.push("mitigationTools must contain exactly schemaVersion, frameworkVersion, disclaimer and entries.");
  } else {
    if (mitigationTools.schemaVersion !== SCHEMA_VERSION) {
      errors.push(`mitigationTools.schemaVersion must be ${SCHEMA_VERSION}.`);
    }
    if (mitigationTools.frameworkVersion !== FRAMEWORK_VERSION) {
      errors.push(`mitigationTools.frameworkVersion must be ${FRAMEWORK_VERSION}.`);
    }
    if (mitigationTools.disclaimer !== DISCLAIMER) {
      errors.push("mitigationTools.disclaimer must match the canonical tooling disclaimer.");
    }
    validateEntries(mitigationTools.entries, expectedAll, "mitigationTools.entries", errors);

    if (isRecord(mitigationTools.entries)) {
      for (const set of safeSets) {
        if (!isRecord(set?.entries)) continue;
        for (const [id, tools] of Object.entries(set.entries)) {
          if (JSON.stringify(mitigationTools.entries[id]) !== JSON.stringify(tools)) {
            errors.push(`mitigationTools.entries.${id} must exactly preserve its fragment tool records.`);
          }
        }
      }
    }
  }

  const aggregateCount = isRecord(mitigationTools?.entries)
    ? Object.values(mitigationTools.entries).reduce(
        (total, tools) => total + (Array.isArray(tools) ? tools.length : 0),
        0
      )
    : 0;
  if (aggregateCount !== 360) {
    errors.push(`mitigationTools must contain exactly 360 tool records; found ${aggregateCount}.`);
  }

  return errors;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function makeValidFixture(domains) {
  const errors = [];
  const expectedByDomain = collectExpectedMitigations(domains, errors);
  assert.deepEqual(errors, [], `Core fixture cannot support mitigation-tool tests:\n${errors.join("\n")}`);
  const fragmentSets = PARTITIONS.map((domainIds) => {
    const entries = {};
    for (const id of domainIds.flatMap((domainId) => expectedByDomain.get(domainId))) {
      entries[id] = [
        {
          name: "Implementation checklist",
          use: `Sequence owners, prerequisites and completion criteria for ${id}.`
        },
        {
          name: "Control evidence register",
          use: `Record operation, review and corrective-action evidence for ${id}.`
        }
      ];
    }
    return { schemaVersion: SCHEMA_VERSION, domainIds: [...domainIds], entries };
  });
  return {
    fragmentSets,
    mitigationTools: {
      schemaVersion: SCHEMA_VERSION,
      frameworkVersion: FRAMEWORK_VERSION,
      disclaimer: DISCLAIMER,
      entries: Object.assign({}, ...fragmentSets.map((set) => set.entries))
    }
  };
}

function runMutationSelfTests(domains) {
  const baseline = makeValidFixture(domains);
  assert.deepEqual(
    validateMitigationToolsContract({ domains, ...baseline }),
    [],
    "Generated valid fixture must pass the mitigation-tool contract."
  );

  const cases = [
    {
      name: "missing fragment",
      expected: "exactly three fragments",
      mutate: (fixture) => fixture.fragmentSets.pop()
    },
    {
      name: "extra fragment",
      expected: "exactly three fragments",
      mutate: (fixture) => fixture.fragmentSets.push(clone(fixture.fragmentSets[2]))
    },
    {
      name: "fragment schema drift",
      expected: "schemaVersion must be 1.0.0",
      mutate: (fixture) => { fixture.fragmentSets[0].schemaVersion = "2.0.0"; }
    },
    {
      name: "unknown fragment field",
      expected: "must contain exactly schemaVersion, domainIds and entries",
      mutate: (fixture) => { fixture.fragmentSets[0].unexpected = true; }
    },
    {
      name: "wrong domain partition",
      expected: "canonical three-domain partition",
      mutate: (fixture) => { fixture.fragmentSets[0].domainIds[2] = DOMAIN_IDS[3]; }
    },
    {
      name: "missing mitigation entry",
      expected: "is missing mitigation ID",
      mutate: (fixture) => { delete fixture.fragmentSets[0].entries[Object.keys(fixture.fragmentSets[0].entries)[0]]; }
    },
    {
      name: "extra mitigation entry",
      expected: "unexpected mitigation ID",
      mutate: (fixture) => { fixture.fragmentSets[0].entries["CSM-D10-I-M01"] = clone(Object.values(fixture.fragmentSets[0].entries)[0]); }
    },
    {
      name: "duplicate mitigation across fragments",
      expected: "appears in more than one fragment",
      mutate: (fixture) => {
        const id = Object.keys(fixture.fragmentSets[0].entries)[0];
        fixture.fragmentSets[1].entries[id] = clone(fixture.fragmentSets[0].entries[id]);
      }
    },
    {
      name: "one tool instead of two",
      expected: "exactly two tool records",
      mutate: (fixture) => { Object.values(fixture.fragmentSets[0].entries)[0].pop(); }
    },
    {
      name: "unknown tool field",
      expected: "must contain exactly name and use",
      mutate: (fixture) => { Object.values(fixture.fragmentSets[0].entries)[0][0].url = "unused"; }
    },
    {
      name: "empty tool name",
      expected: "must be a non-empty string",
      mutate: (fixture) => { Object.values(fixture.fragmentSets[0].entries)[0][0].name = ""; }
    },
    {
      name: "untrimmed use text",
      expected: "leading or trailing whitespace",
      mutate: (fixture) => { Object.values(fixture.fragmentSets[0].entries)[0][0].use += " "; }
    },
    {
      name: "multiline use text",
      expected: "single-line plain text",
      mutate: (fixture) => { Object.values(fixture.fragmentSets[0].entries)[0][0].use += "\nSecond line"; }
    },
    {
      name: "duplicate normalized tool name",
      expected: "two distinct tool names",
      mutate: (fixture) => {
        const pair = Object.values(fixture.fragmentSets[0].entries)[0];
        pair[1].name = pair[0].name.toUpperCase();
      }
    },
    {
      name: "URL in tool use",
      expected: "must not contain a URL or email address",
      mutate: (fixture) => { Object.values(fixture.fragmentSets[0].entries)[0][0].use = "Configure from https://example.com/tool."; }
    },
    {
      name: "bare URL in tool use",
      expected: "must not contain a URL or email address",
      mutate: (fixture) => { Object.values(fixture.fragmentSets[0].entries)[0][0].use = "Configure from example.com."; }
    },
    {
      name: "uncommon-TLD URL in tool use",
      expected: "must not contain a URL or email address",
      mutate: (fixture) => { Object.values(fixture.fragmentSets[0].entries)[0][0].use = "Open vendor.example.xyz before use."; }
    },
    {
      name: "bare IP URL in tool use",
      expected: "must not contain a URL or email address",
      mutate: (fixture) => { Object.values(fixture.fragmentSets[0].entries)[0][0].use = "Open 192.0.2.1/tool before use."; }
    },
    {
      name: "named vendor",
      expected: "must remain vendor-neutral",
      mutate: (fixture) => { Object.values(fixture.fragmentSets[0].entries)[0][0].name = "Microsoft risk console"; }
    },
    {
      name: "named enterprise vendor",
      expected: "must remain vendor-neutral",
      mutate: (fixture) => { Object.values(fixture.fragmentSets[0].entries)[0][0].name = "SAP case-management platform"; }
    },
    {
      name: "named workforce vendor",
      expected: "must remain vendor-neutral",
      mutate: (fixture) => { Object.values(fixture.fragmentSets[0].entries)[0][0].name = "Workday case-management platform"; }
    },
    {
      name: "vendor endorsement",
      expected: "must not endorse or promote a vendor",
      mutate: (fixture) => { Object.values(fixture.fragmentSets[0].entries)[0][0].use = "Choose the market-leading platform."; }
    },
    {
      name: "absolute risk-removal claim",
      expected: "must not claim absolute risk removal",
      mutate: (fixture) => { Object.values(fixture.fragmentSets[0].entries)[0][0].use = "This eliminates all risk."; }
    },
    {
      name: "absolute incident-prevention claim",
      expected: "must not claim absolute risk removal",
      mutate: (fixture) => { Object.values(fixture.fragmentSets[0].entries)[0][0].use = "This prevents every incident."; }
    },
    {
      name: "absolute compliance claim",
      expected: "must not claim absolute risk removal",
      mutate: (fixture) => { Object.values(fixture.fragmentSets[0].entries)[0][0].use = "This tool guarantees compliance with every requirement."; }
    },
    {
      name: "compliance certification claim",
      expected: "must not claim absolute risk removal",
      mutate: (fixture) => { Object.values(fixture.fragmentSets[0].entries)[0][0].use = "This tool certifies compliance with every requirement."; }
    },
    {
      name: "infallibility claim",
      expected: "must not claim absolute risk removal",
      mutate: (fixture) => { Object.values(fixture.fragmentSets[0].entries)[0][0].use = "This control cannot fail."; }
    },
    {
      name: "infallible-control claim",
      expected: "must not claim absolute risk removal",
      mutate: (fixture) => { Object.values(fixture.fragmentSets[0].entries)[0][0].use = "This control is infallible."; }
    },
    {
      name: "never-occurs guarantee",
      expected: "must not claim absolute risk removal",
      mutate: (fixture) => { Object.values(fixture.fragmentSets[0].entries)[0][0].use = "This tool guarantees that incidents never occur."; }
    },
    {
      name: "always-protects claim",
      expected: "must not claim absolute risk removal",
      mutate: (fixture) => { Object.values(fixture.fragmentSets[0].entries)[0][0].use = "This always protects personnel."; }
    },
    {
      name: "non-plain entries object",
      expected: "must be an object keyed by mitigation ID",
      mutate: (fixture) => { Object.setPrototypeOf(fixture.fragmentSets[0].entries, { injected: true }); }
    },
    {
      name: "tool name too long",
      expected: "must not exceed 72 characters",
      mutate: (fixture) => { Object.values(fixture.fragmentSets[0].entries)[0][0].name = "N".repeat(73); }
    },
    {
      name: "aggregate version drift",
      expected: "frameworkVersion must be 1.1.0-candidate",
      mutate: (fixture) => { fixture.mitigationTools.frameworkVersion = "1.1.0"; }
    },
    {
      name: "aggregate content divergence",
      expected: "must exactly preserve its fragment tool records",
      mutate: (fixture) => {
        const id = Object.keys(fixture.mitigationTools.entries)[0];
        fixture.mitigationTools.entries[id][0].use = "Record a deliberately divergent aggregate value.";
      }
    },
    {
      name: "aggregate missing entry",
      expected: "is missing mitigation ID",
      mutate: (fixture) => { delete fixture.mitigationTools.entries[Object.keys(fixture.mitigationTools.entries)[0]]; }
    }
  ];

  for (const testCase of cases) {
    const fixture = clone(baseline);
    testCase.mutate(fixture);
    const errors = validateMitigationToolsContract({ domains, ...fixture });
    assert(errors.length > 0, `${testCase.name} must fail closed.`);
    assert(
      errors.some((error) => error.includes(testCase.expected)),
      `${testCase.name} did not report "${testCase.expected}".\n${errors.join("\n")}`
    );
  }
  return cases.length;
}

function executeAggregatorFixture(fragmentSets, aggregatorSource) {
  const contextObject = {};
  contextObject.window = contextObject;
  const context = vm.createContext(contextObject);
  vm.runInContext(
    `window.CSM_MITIGATION_TOOL_SETS = ${JSON.stringify(fragmentSets)};`,
    context,
    { filename: "mitigation-tool-fixture.js", timeout: 5_000 }
  );
  try {
    vm.runInContext(aggregatorSource, context, { filename: AGGREGATOR_FILE, timeout: 5_000 });
    vm.runInContext(
      "globalThis.__runtimeTooling = { mitigationTools, isFrozen: Object.isFrozen(mitigationTools) && Object.isFrozen(mitigationTools.entries), entryArraysFrozen: Object.values(mitigationTools.entries).every(Object.isFrozen), toolRecordsFrozen: Object.values(mitigationTools.entries).flat().every(Object.isFrozen) };",
      context,
      { filename: "mitigation-tool-consumer.js", timeout: 5_000 }
    );
    return {
      error: null,
      exposedAsObjectProperty: Object.prototype.hasOwnProperty.call(context, "mitigationTools"),
      output: JSON.parse(JSON.stringify(context.__runtimeTooling))
    };
  } catch (error) {
    return {
      error,
      exposedAsObjectProperty: Object.prototype.hasOwnProperty.call(context, "mitigationTools"),
      output: context.__runtimeTooling
    };
  }
}

function runAggregatorAtomicSelfTests(domains, aggregatorSource) {
  const baseline = makeValidFixture(domains);
  const validResult = executeAggregatorFixture(baseline.fragmentSets, aggregatorSource);
  assert.equal(validResult.error, null, `Valid fragments must aggregate:\n${validResult.error?.message ?? ""}`);
  assert.equal(validResult.exposedAsObjectProperty, false, "mitigationTools must be a classic-script global lexical, not a window property.");
  assert.equal(validResult.output?.isFrozen, true, "Published mitigationTools and entries must be frozen.");
  assert.equal(validResult.output?.entryArraysFrozen, true, "Every published mitigation tool pair must be frozen.");
  assert.equal(validResult.output?.toolRecordsFrozen, true, "Every published mitigation tool record must be frozen.");
  assert.equal(Object.keys(validResult.output?.mitigationTools?.entries ?? {}).length, 180);

  const cases = [
    {
      name: "missing runtime fragment",
      mutate: (sets) => sets.pop()
    },
    {
      name: "runtime fragment schema drift",
      mutate: (sets) => { sets[0].schemaVersion = "2.0.0"; }
    },
    {
      name: "runtime missing mitigation",
      mutate: (sets) => { delete sets[0].entries[Object.keys(sets[0].entries)[0]]; }
    },
    {
      name: "runtime unsafe tool claim",
      mutate: (sets) => { Object.values(sets[0].entries)[0][0].use = "This prevents every incident."; }
    },
    {
      name: "runtime uncommon-TLD URL",
      mutate: (sets) => { Object.values(sets[0].entries)[0][0].use = "Open vendor.example.xyz before use."; }
    },
    {
      name: "runtime named enterprise vendor",
      mutate: (sets) => { Object.values(sets[0].entries)[0][0].name = "SAP case-management platform"; }
    },
    {
      name: "runtime absolute compliance claim",
      mutate: (sets) => { Object.values(sets[0].entries)[0][0].use = "This tool guarantees compliance with every requirement."; }
    },
    {
      name: "runtime infallibility claim",
      mutate: (sets) => { Object.values(sets[0].entries)[0][0].use = "This control cannot fail."; }
    },
    {
      name: "runtime bare IP URL",
      mutate: (sets) => { Object.values(sets[0].entries)[0][0].use = "Open 192.0.2.1/tool before use."; }
    },
    {
      name: "runtime named workforce vendor",
      mutate: (sets) => { Object.values(sets[0].entries)[0][0].name = "Workday case-management platform"; }
    },
    {
      name: "runtime compliance certification claim",
      mutate: (sets) => { Object.values(sets[0].entries)[0][0].use = "This tool certifies compliance with every requirement."; }
    },
    {
      name: "runtime never-occurs guarantee",
      mutate: (sets) => { Object.values(sets[0].entries)[0][0].use = "This tool guarantees that incidents never occur."; }
    },
    {
      name: "runtime infallible-control claim",
      mutate: (sets) => { Object.values(sets[0].entries)[0][0].use = "This control is infallible."; }
    }
  ];

  for (const testCase of cases) {
    const fragmentSets = clone(baseline.fragmentSets);
    testCase.mutate(fragmentSets);
    const result = executeAggregatorFixture(fragmentSets, aggregatorSource);
    assert(result.error, `${testCase.name} must be rejected by the runtime aggregator.`);
    assert.equal(result.output, undefined, `${testCase.name} must not expose a partial aggregate.`);
    assert.equal(result.exposedAsObjectProperty, false, `${testCase.name} must not leak mitigationTools onto window.`);
  }
  return cases.length;
}

function loadCoreDomains() {
  const context = vm.createContext({});
  const source = fs.readFileSync(new URL("matrix-domains.js", ROOT), "utf8");
  vm.runInContext(`${source}\n;globalThis.__toolDomains = domains;`, context, {
    filename: "matrix-domains.js",
    timeout: 5_000
  });
  return JSON.parse(JSON.stringify(context.__toolDomains));
}

function loadPublishedContract(loadErrors) {
  const requiredFiles = [...FRAGMENT_FILES, AGGREGATOR_FILE];
  const missingFiles = requiredFiles.filter((file) => !fs.existsSync(new URL(file, ROOT)));
  for (const file of missingFiles) loadErrors.push(`Missing required mitigation-tool file: ${file}.`);
  if (missingFiles.length) return null;

  const contextObject = {};
  contextObject.window = contextObject;
  const context = vm.createContext(contextObject);
  const coreSource = fs.readFileSync(new URL("matrix-domains.js", ROOT), "utf8");
  vm.runInContext(coreSource, context, { filename: "matrix-domains.js", timeout: 5_000 });

  for (const fragmentFile of FRAGMENT_FILES) {
    const before = context.CSM_MITIGATION_TOOL_SETS;
    const beforeLength = Array.isArray(before) ? before.length : 0;
    try {
      vm.runInContext(fs.readFileSync(new URL(fragmentFile, ROOT), "utf8"), context, {
        filename: fragmentFile,
        timeout: 5_000
      });
    } catch (error) {
      loadErrors.push(`${fragmentFile} failed to load: ${error.message}`);
      continue;
    }
    const after = context.CSM_MITIGATION_TOOL_SETS;
    if (!Array.isArray(after) || after.length !== beforeLength + 1) {
      loadErrors.push(`${fragmentFile} must append exactly one fragment set.`);
    }
    if (before && after !== before) {
      loadErrors.push(`${fragmentFile} must append to, not replace, the shared fragment array.`);
    }
  }

  const aggregatorSource = fs.readFileSync(new URL(AGGREGATOR_FILE, ROOT), "utf8");
  try {
    vm.runInContext(aggregatorSource, context, { filename: AGGREGATOR_FILE, timeout: 5_000 });
    vm.runInContext(
      ";globalThis.__publishedMitigationTools = mitigationTools;",
      context,
      { filename: "mitigation-tools-consumer.js", timeout: 5_000 }
    );
  } catch (error) {
    loadErrors.push(`${AGGREGATOR_FILE} rejected the fragment bundle: ${error.message}`);
    return null;
  }

  return JSON.parse(JSON.stringify({
    fragmentSets: context.CSM_MITIGATION_TOOL_SETS,
    mitigationTools: context.__publishedMitigationTools
  }));
}

const domains = loadCoreDomains();
let mutationCount = 0;
let runtimeMutationCount = 0;
const errors = [];
try {
  mutationCount = runMutationSelfTests(domains);
} catch (error) {
  errors.push(`Mitigation-tool mutation self-tests failed: ${error.message}`);
}

if (fs.existsSync(new URL(AGGREGATOR_FILE, ROOT))) {
  try {
    runtimeMutationCount = runAggregatorAtomicSelfTests(
      domains,
      fs.readFileSync(new URL(AGGREGATOR_FILE, ROOT), "utf8")
    );
  } catch (error) {
    errors.push(`Mitigation-tool runtime self-tests failed: ${error.message}`);
  }
}

const published = loadPublishedContract(errors);
if (published) errors.push(...validateMitigationToolsContract({ domains, ...published }));

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}

console.log(
  `MITIGATION TOOL VALIDATION PASSED — 180 mitigations, 360 vendor-neutral tool records, ` +
    `${mutationCount} contract mutations and ${runtimeMutationCount} atomic runtime mutations.`
);
