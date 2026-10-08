"use strict";

((root) => {
  const PHASES = ["identify", "protect", "detect", "respond", "recover"];
  const CODES = ["I", "P", "D", "R", "RC"];
  const DOMAIN_IDS = ["personnel-security", "premises-security", "rescue-safety", "security-of-production-and-operations", "environmental-safety", "information-and-cyber-security", "compliance-control", "contingency-and-crisis-management", "industrial-safety"];
  const TOPIC_IDS = ["governance", "employment-lifecycle", "supplier-lifecycle", "travel-program", "confidential-meetings", "risk-transfer", "process-technical-safety", "product-service-safety", "event-safety", "transport-dangerous-goods", "cross-domain-resilience", "ot-iot", "secure-product-lifecycle", "ai-security", "data-protection", "trade-compliance", "strategic-information", "verified-crisis-communications"];
  const PROFILE_IDS = ["office", "industrial", "digital-provider", "public-facing", "logistics", "critical-service"];
  const SCENARIO_IDS = ["ransomware-production", "flood-power-comms", "supplier-restriction", "insider-ip-loss", "impersonated-payment"];
  const OFFICIAL_HOSTS = new Set(["ek.fi", "npsa.gov.uk", "csrc.nist.gov", "nvlpubs.nist.gov", "nist.gov", "tukes.fi", "traficom.fi", "huoltovarmuuskeskus.fi", "um.fi", "supo.fi", "eur-lex.europa.eu", "digital-strategy.ec.europa.eu", "iso.org", "cisa.gov", "ncsc.gov.uk", "asisonline.org", "osha.europa.eu", "tyosuojelu.fi", "finlex.fi", "owasp.org", "content.naic.org"]);
  const APPLICABILITY = ["undetermined", "applicable", "not-applicable"];
  const CHECK_STATES = ["not-assessed", "gap", "partial", "evidence-available"];
  const CATALOGUE_KEYS = ["schemaVersion", "version", "frameworkVersion", "reviewState", "sources", "topics", "profiles", "scenarios"];
  const SOURCE_KEYS = ["id", "title", "authority", "url", "reviewedOn"];
  const TOPIC_KEYS = ["id", "title", "gapIds", "domainIds", "applicability", "ownerRoles", "reviewState", "sourceIds", "checks"];
  const CHECK_KEYS = ["id", "phaseId", "prompt", "evidence", "action", "tools", "entryIds"];
  const DOCUMENT_KEYS = ["format", "schemaVersion", "catalogueVersion", "frameworkVersion", "createdAt", "updatedAt", "topics"];
  const SESSION_KEYS = ["applicability", "rationale", "ownerRole", "criticalGap", "nextAction", "checks"];
  const TEXT_LIMITS = { rationale: 300, criticalGap: 500, nextAction: 500 };

  const isObject = (value) => {
    if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
  };
  const exactKeys = (value, keys) => isObject(value) && Object.keys(value).length === keys.length && keys.every((key) => Object.hasOwn(value, key));
  const text = (value, maximum, optional = false) => typeof value === "string" && value.length <= maximum * 2 && Array.from(value).length <= maximum && (optional || value.trim().length > 0) && !/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u.test(value);
  const isoDate = (value) => {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const parsed = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
  };
  const isoTimestamp = (value) => {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)) return false;
    const parsed = new Date(value);
    return !Number.isNaN(parsed.getTime()) && parsed.toISOString() === value;
  };
  const list = (value, minimum, maximum) => Array.isArray(value) && value.length >= minimum && value.length <= maximum;
  const references = (value, allowed, maximum = allowed.size) => list(value, 1, maximum) && new Set(value).size === value.length && value.every((item) => typeof item === "string" && allowed.has(item));
  const sameSet = (values, expected) => values.length === expected.length && new Set(values).size === values.length && expected.every((value) => values.includes(value));
  const officialUrl = (value) => {
    if (typeof value !== "string" || value.length > 2000 || /\s|[\u0000-\u001f\u007f]/u.test(value)) return false;
    try {
      const url = new URL(value);
      return url.protocol === "https:" && !url.username && !url.password && !url.port && OFFICIAL_HOSTS.has(url.hostname.replace(/^www\./, ""));
    } catch { return false; }
  };
  const coreId = (id) => typeof id === "string" && /^CSM-D0[1-9]-(?:I|P|D|R|RC)-(?:A0[1-3]|[RM]0[1-4])$/.test(id);
  const matchingCoreLink = (id, topic) => {
    if (!coreId(id)) return false;
    const parts = id.split("-");
    return topic.domainIds.includes(DOMAIN_IDS[Number(parts[1].slice(1)) - 1]);
  };
  const result = (errors) => ({ valid: errors.length === 0, errors });
  const addError = (errors, message) => { if (errors.length < 80) errors.push(message); };

  function inspectCore(domains, errors) {
    const ids = new Set();
    if (!list(domains, 9, 9) || !sameSet(domains.map((domain) => domain?.id), DOMAIN_IDS)) {
      addError(errors, "Core definitions must contain the nine canonical domains.");
      return ids;
    }
    domains.forEach((domain) => {
      const prefix = `CSM-D${String(DOMAIN_IDS.indexOf(domain.id) + 1).padStart(2, "0")}`;
      if (!isObject(domain) || !text(domain.name, 180) || !exactKeys(domain.cells, PHASES)) {
        addError(errors, "Malformed core domain definition.");
        return;
      }
      if (Object.hasOwn(domain, "actors") && !exactKeys(domain.actors, PHASES)) {
        addError(errors, "An explicitly supplied core actor pack must contain all five canonical phases.");
      }
      PHASES.forEach((phase, phaseIndex) => {
        const cell = domain.cells[phase];
        for (const [key, code, count] of [["threats", "R", 4], ["controls", "M", 4], ["actors", "A", 3]]) {
          const entries = key === "actors" ? domain.actors?.[phase] : cell?.[key];
          if (key === "actors" && !Object.hasOwn(domain, "actors")) continue;
          if (!list(entries, count, count)) { addError(errors, "Malformed core entry list."); continue; }
          entries.forEach((entry) => {
            if (!exactKeys(entry, ["id", "text", "reviewState"]) || !coreId(entry.id) || !entry.id.startsWith(`${prefix}-${CODES[phaseIndex]}-${code}`) || entry.reviewState !== "reviewed" || !text(entry.text, 1000) || ids.has(entry.id)) {
              addError(errors, "Malformed, duplicate or unreviewed core entry.");
            } else ids.add(entry.id);
          });
        }
      });
    });
    return ids;
  }

  function inspectCatalogue(catalogue, errors, coreIds) {
    if (!exactKeys(catalogue, CATALOGUE_KEYS) || catalogue.schemaVersion !== 1 || catalogue.version !== "0.1.0-draft" || catalogue.frameworkVersion !== "1.1.0-candidate" || catalogue.reviewState !== "draft") {
      addError(errors, "Unknown or malformed coverage catalogue contract.");
      return;
    }
    if (!list(catalogue.sources, 1, 100) || !list(catalogue.topics, 18, 18) || !list(catalogue.profiles, 6, 6) || !list(catalogue.scenarios, 5, 5)) {
      addError(errors, "Coverage catalogue exceeds its fixed collection bounds.");
      return;
    }
    const sourceIds = new Set();
    catalogue.sources.forEach((source) => {
      if (!exactKeys(source, SOURCE_KEYS) || !/^COV-S-[A-Za-z0-9-]{1,70}$/.test(source?.id) || !text(source.title, 300) || !text(source.authority, 180) || !officialUrl(source.url) || !isoDate(source.reviewedOn) || sourceIds.has(source.id)) {
        addError(errors, "Malformed, duplicate or unofficial coverage source.");
      } else sourceIds.add(source.id);
    });
    if (!sameSet(catalogue.topics.map((topic) => topic?.id), TOPIC_IDS)) addError(errors, "The eighteen canonical coverage topic IDs are required.");
    const gapIds = new Set(Array.from({ length: 15 }, (_, index) => `G${String(index + 1).padStart(2, "0")}`));
    const usedGapIds = new Set();
    const usedSourceIds = new Set();
    const domainIds = new Set(DOMAIN_IDS);
    const topicIds = new Set(TOPIC_IDS);
    catalogue.topics.forEach((topic) => {
      if (!exactKeys(topic, TOPIC_KEYS) || !TOPIC_IDS.includes(topic.id) || !text(topic.title, 180) || !references(topic.gapIds, gapIds) || !references(topic.domainIds, domainIds) || !text(topic.applicability, 1200) || topic.reviewState !== "draft" || !references(topic.sourceIds, sourceIds, 20) || !list(topic.ownerRoles, 1, 8) || new Set(topic.ownerRoles).size !== topic.ownerRoles.length || !topic.ownerRoles.every((role) => text(role, 120)) || !list(topic.checks, 5, 5)) {
        addError(errors, "Malformed coverage topic, ownership or scope context.");
        return;
      }
      topic.gapIds.forEach((id) => usedGapIds.add(id));
      topic.sourceIds.forEach((id) => usedSourceIds.add(id));
      topic.checks.forEach((check, index) => {
        if (!exactKeys(check, CHECK_KEYS) || check.phaseId !== PHASES[index] || check.id !== `COV-${topic.id}-${PHASES[index]}` || !text(check.prompt, 1200) || !text(check.evidence, 1500) || !text(check.action, 1500) || !list(check.tools, 2, 2) || !check.tools.every((tool) => exactKeys(tool, ["name", "use"]) && text(tool.name, 120) && text(tool.use, 1200)) || check.tools[0].name === check.tools[1].name || !list(check.entryIds, 1, 30) || new Set(check.entryIds).size !== check.entryIds.length || !check.entryIds.every((id) => matchingCoreLink(id, topic) && (!coreIds || coreIds.has(id)))) {
          addError(errors, "Malformed coverage check, phase order, tools or canonical core link.");
        }
      });
    });
    if (!sameSet([...usedGapIds], [...gapIds])) addError(errors, "All fifteen identified coverage gaps must have topic context.");
    if (!sameSet([...usedSourceIds], [...sourceIds])) addError(errors, "Every coverage source must be used by a topic context association.");
    if (!sameSet(catalogue.profiles.map((profile) => profile?.id), PROFILE_IDS)) addError(errors, "The six canonical recommendation profiles are required.");
    catalogue.profiles.forEach((profile) => {
      if (!exactKeys(profile, ["id", "title", "description", "topicIds"]) || !text(profile.title, 180) || !text(profile.description, 1200) || !references(profile.topicIds, topicIds)) addError(errors, "Malformed recommendation profile or topic link.");
    });
    if (!sameSet(catalogue.scenarios.map((scenario) => scenario?.id), SCENARIO_IDS)) addError(errors, "The five canonical discussion scenarios are required.");
    catalogue.scenarios.forEach((scenario) => {
      if (!exactKeys(scenario, ["id", "title", "domainIds", "topicIds", "prompt", "expectedEvidence"]) || !text(scenario.title, 180) || !references(scenario.domainIds, domainIds) || !references(scenario.topicIds, topicIds) || !text(scenario.prompt, 1500) || !text(scenario.expectedEvidence, 1500)) addError(errors, "Malformed discussion scenario or context link.");
    });
  }

  function validateCatalogue(catalogue, domains) {
    const errors = [];
    try { inspectCatalogue(catalogue, errors, inspectCore(domains, errors)); }
    catch { addError(errors, "Coverage catalogue could not be safely inspected."); }
    return result(errors);
  }

  function assertCatalogue(catalogue) {
    const errors = [];
    try { inspectCatalogue(catalogue, errors); }
    catch { addError(errors, "Coverage catalogue could not be safely inspected."); }
    if (errors.length) throw new TypeError(errors.join(" "));
  }

  function timestamp(now) {
    const value = now === undefined ? new Date().toISOString() : now;
    if (!isoTimestamp(value)) throw new TypeError("Coverage timestamps must be canonical ISO UTC values.");
    return value;
  }

  function createDocument(catalogue, now) {
    assertCatalogue(catalogue);
    const value = timestamp(now);
    return {
      format: "csm-coverage", schemaVersion: 1, catalogueVersion: catalogue.version, frameworkVersion: catalogue.frameworkVersion,
      createdAt: value, updatedAt: value,
      topics: Object.fromEntries(catalogue.topics.map((topic) => [topic.id, {
        applicability: "undetermined", rationale: "", ownerRole: "", criticalGap: "", nextAction: "",
        checks: Object.fromEntries(topic.checks.map((check) => [check.id, "not-assessed"]))
      }]))
    };
  }

  function validateDocument(document, catalogue) {
    const errors = [];
    try {
      inspectCatalogue(catalogue, errors);
      if (errors.length) return result(errors);
      if (!exactKeys(document, DOCUMENT_KEYS) || document.format !== "csm-coverage" || document.schemaVersion !== 1 || document.catalogueVersion !== catalogue.version || document.frameworkVersion !== catalogue.frameworkVersion || !isoTimestamp(document.createdAt) || !isoTimestamp(document.updatedAt) || document.updatedAt < document.createdAt || !exactKeys(document.topics, TOPIC_IDS)) {
        addError(errors, "Unknown or malformed coverage document contract.");
        return result(errors);
      }
      catalogue.topics.forEach((topic) => {
        const record = document.topics[topic.id];
        if (!exactKeys(record, SESSION_KEYS) || !APPLICABILITY.includes(record.applicability) || !Object.entries(TEXT_LIMITS).every(([key, limit]) => text(record[key], limit, true)) || (record.applicability === "not-applicable" && !record.rationale.trim()) || !(record.ownerRole === "" || topic.ownerRoles.includes(record.ownerRole)) || !exactKeys(record.checks, topic.checks.map((check) => check.id)) || !Object.values(record.checks).every((state) => CHECK_STATES.includes(state))) addError(errors, `Coverage topic ${topic.id} contains invalid scope, text, ownership or judgments.`);
      });
    } catch { addError(errors, "Coverage document could not be safely inspected."); }
    return result(errors);
  }

  function assertDocument(document, catalogue) {
    const validation = validateDocument(document, catalogue);
    if (!validation.valid) throw new TypeError(validation.errors.join(" "));
  }

  function updateTopic(document, topicId, patch, catalogue, now) {
    assertDocument(document, catalogue);
    if (!TOPIC_IDS.includes(topicId) || !isObject(patch) || Object.keys(patch).some((key) => !SESSION_KEYS.includes(key))) throw new TypeError("Unknown topic or coverage patch field.");
    const current = document.topics[topicId];
    if (Object.hasOwn(patch, "checks") && (!isObject(patch.checks) || Object.keys(patch.checks).some((key) => !Object.hasOwn(current.checks, key)))) throw new TypeError("Unknown check or malformed judgment patch.");
    const updatedAt = timestamp(now);
    if (updatedAt < document.updatedAt) throw new TypeError("Coverage timestamps cannot move backwards.");
    const updated = {
      ...document, updatedAt,
      topics: Object.fromEntries(Object.entries(document.topics).map(([id, record]) => [id, {
        ...record, ...(id === topicId ? patch : {}), checks: { ...record.checks, ...(id === topicId && Object.hasOwn(patch, "checks") ? patch.checks : {}) }
      }]))
    };
    assertDocument(updated, catalogue);
    return updated;
  }

  function summarize(document, catalogue) {
    assertDocument(document, catalogue);
    const summary = { totalTopics: 18, applicableTopics: 0, notApplicableTopics: 0, undeterminedTopics: 0, totalChecks: 90, applicableChecks: 0, assessedChecks: 0, notAssessedChecks: 0, gaps: 0, partial: 0, evidenceAvailable: 0, criticalGaps: [], actions: [] };
    catalogue.topics.forEach((topic) => {
      const record = document.topics[topic.id];
      if (record.applicability === "not-applicable") { summary.notApplicableTopics += 1; return; }
      const item = { topicId: topic.id, title: topic.title, ownerRole: record.ownerRole };
      if (record.criticalGap.trim()) summary.criticalGaps.push({ ...item, text: record.criticalGap });
      if (record.nextAction.trim()) summary.actions.push({ ...item, text: record.nextAction });
      if (record.applicability === "undetermined") { summary.undeterminedTopics += 1; return; }
      summary.applicableTopics += 1;
      summary.applicableChecks += topic.checks.length;
      Object.values(record.checks).forEach((state) => {
        if (state === "not-assessed") summary.notAssessedChecks += 1;
        else {
          summary.assessedChecks += 1;
          if (state === "gap") summary.gaps += 1;
          else if (state === "partial") summary.partial += 1;
          else summary.evidenceAvailable += 1;
        }
      });
    });
    return summary;
  }

  function buildReport(document, catalogue) {
    const summary = summarize(document, catalogue);
    const lines = [
      "Corporate Security Matrix — Coverage discussion report", `Catalogue: ${catalogue.version} (draft)`, `Framework: ${catalogue.frameworkVersion}`, `Created: ${document.createdAt}`, `Updated: ${document.updatedAt}`, "",
      "DRAFT: named competent human content review and release approval remain pending.", "Context sources are not entry-level proof. Evidence-available is a user's assertion, not verification.", "This report does not establish compliance, complete coverage or an overall security score.", "Printed or saved output is unencrypted and may disclose organisational priorities. Handle it under your organisation's policy.", "",
      `Topics: ${summary.totalTopics}; applicable: ${summary.applicableTopics}; not applicable: ${summary.notApplicableTopics}; unresolved: ${summary.undeterminedTopics}.`,
      `All checks: ${summary.totalChecks}; applicable checks: ${summary.applicableChecks}; assessed: ${summary.assessedChecks}; not assessed: ${summary.notAssessedChecks}.`,
      `Applicable judgments — gaps: ${summary.gaps}; partial: ${summary.partial}; evidence available (not verified): ${summary.evidenceAvailable}.`, ""
    ];
    const appendText = (label, value) => {
      lines.push(`${label}:`);
      String(value || "None recorded").split(/\r\n?|\n/).forEach((line) => lines.push(`  ${line}`));
    };
    const appendPortfolio = (heading, items) => {
      lines.push(heading, "Catalogue order, not a risk ranking; non-applicable topics are excluded.");
      if (!items.length) lines.push("  None recorded.");
      items.forEach((item) => {
        const scope = document.topics[item.topicId].applicability === "undetermined" ? "unresolved scope" : "applicable";
        lines.push(`  ${item.title} [${item.topicId}] — ${scope}`);
        appendText("  Owner role", item.ownerRole || "Unassigned");
        appendText("  Recorded item", item.text);
      });
      lines.push("");
    };
    appendPortfolio("Critical-gap portfolio", summary.criticalGaps);
    appendPortfolio("Next-action portfolio", summary.actions);
    lines.push("Topic register", "");
    catalogue.topics.forEach((topic) => {
      const record = document.topics[topic.id];
      lines.push(`${topic.title} [${topic.id}]`, `Applicability: ${record.applicability}${record.applicability === "not-applicable" ? " — excluded from summary counts and action portfolios" : record.applicability === "undetermined" ? " — unresolved scope; judgments excluded from applicable counts" : ""}`);
      appendText("Rationale", record.rationale);
      appendText("Owner role", record.ownerRole || "Unassigned");
      topic.checks.forEach((check) => {
        lines.push(`  ${check.id}: ${record.checks[check.id]}${record.applicability !== "applicable" ? " (retained, excluded from applicable counts)" : ""}`);
        appendText("  Management question", check.prompt);
        lines.push(`    Canonical core links: ${check.entryIds.join(", ")}`);
      });
      lines.push("  Topic context sources, not entry-level proof:");
      topic.sourceIds.forEach((id) => {
        const source = catalogue.sources.find((record) => record.id === id);
        lines.push(`    ${source.title} [${source.id}] — ${source.authority}; reviewed ${source.reviewedOn}`, `    ${source.url}`);
      });
      appendText(record.applicability === "not-applicable" ? "Retained critical gap (excluded)" : "Critical gap", record.criticalGap);
      appendText(record.applicability === "not-applicable" ? "Retained next action (excluded)" : "Next action", record.nextAction);
      lines.push("");
    });
    return lines.join("\n");
  }

  root.CSMCoverage = Object.freeze({ validateCatalogue, createDocument, validateDocument, updateTopic, summarize, buildReport });
})(globalThis);
