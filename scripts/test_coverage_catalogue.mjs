#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const ROOT = new URL("../", import.meta.url);
const read = (file) => readFileSync(new URL(file, ROOT), "utf8");
const SHARDS = {
  governance: ["governance", "employment-lifecycle", "supplier-lifecycle", "travel-program", "confidential-meetings", "risk-transfer"],
  safety: ["process-technical-safety", "product-service-safety", "event-safety", "transport-dangerous-goods", "cross-domain-resilience"],
  digital: ["ot-iot", "secure-product-lifecycle", "ai-security", "data-protection", "trade-compliance", "strategic-information", "verified-crisis-communications"],
};
const PHASES = ["identify", "protect", "detect", "respond", "recover"];
const SOURCE_HOSTS = new Set([
  "ek.fi", "npsa.gov.uk", "csrc.nist.gov", "nvlpubs.nist.gov", "nist.gov",
  "tukes.fi", "traficom.fi", "huoltovarmuuskeskus.fi", "um.fi", "supo.fi",
  "eur-lex.europa.eu", "digital-strategy.ec.europa.eu", "iso.org", "cisa.gov",
  "ncsc.gov.uk", "asisonline.org", "osha.europa.eu", "tyosuojelu.fi", "finlex.fi",
  "owasp.org", "content.naic.org",
]);
const plain = (value) => JSON.parse(JSON.stringify(value));
let passed = 0;

function check(name, callback) {
  callback();
  passed += 1;
  console.log(`PASS ${name}`);
}

function exactKeys(record, keys, label) {
  assert(record && typeof record === "object" && !Array.isArray(record), `${label} must be a record`);
  assert.deepEqual(Object.keys(record).sort(), [...keys].sort(), `${label} exact schema`);
}

function text(value, label) {
  assert.equal(typeof value, "string", `${label} must be text`);
  assert(value.trim(), `${label} must not be blank`);
}

function uniqueReferences(values, available, label) {
  assert(Array.isArray(values) && values.length > 0, `${label} must be a nonempty array`);
  assert.equal(new Set(values).size, values.length, `${label} must not repeat IDs`);
  for (const id of values) assert(available.has(id), `${label} has unknown ID ${id}`);
}

function fixture(mutate = () => {}) {
  const context = vm.createContext({ URL });
  vm.runInContext(`${read("matrix-domains.js")}\n${read("matrix-actors.js")}\n;globalThis.__core = { phases, domains, actorProfiles };`, context);
  const before = JSON.stringify(context.__core);
  for (const name of Object.keys(SHARDS)) {
    vm.runInContext(read(`matrix-coverage-${name}.js`), context, { filename: `matrix-coverage-${name}.js`, timeout: 5_000 });
  }
  mutate(context);
  vm.runInContext(read("matrix-coverage.js"), context, { filename: "matrix-coverage.js", timeout: 5_000 });
  assert.equal(JSON.stringify(context.__core), before, "Coverage content must not rewrite canonical domains, phases or entry records");
  return context;
}

const baseline = fixture();
const catalogue = plain(baseline.CSMCoverageCatalogue);
const core = plain(baseline.__core);
const domainIds = new Set(core.domains.map(({ id }) => id));
const entryMap = new Map();
for (const domain of core.domains) {
  for (const phaseId of PHASES) {
    const cell = domain.cells[phaseId];
    for (const entry of [...cell.threats, ...cell.controls, ...core.actorProfiles[domain.id][phaseId]]) {
      entryMap.set(entry.id, { domainId: domain.id, phaseId, entry });
    }
  }
}

check("preserves the nine domains, five canonical phases and 495 core IDs", () => {
  assert.equal(domainIds.size, 9);
  assert.deepEqual(core.phases.map(({ id }) => id), PHASES);
  assert.equal(entryMap.size, 495);
});

check("publishes exactly the draft 18-topic, 90-check and 180-aid catalogue", () => {
  exactKeys(catalogue, ["schemaVersion", "version", "frameworkVersion", "reviewState", "sources", "topics", "profiles", "scenarios"], "catalogue");
  assert.equal(catalogue.schemaVersion, 1);
  assert.equal(catalogue.version, "0.1.0-draft");
  assert.equal(catalogue.frameworkVersion, "1.1.0-candidate");
  assert.equal(catalogue.reviewState, "draft");
  assert.deepEqual(catalogue.topics.map(({ id }) => id), Object.values(SHARDS).flat());
  assert.equal(catalogue.topics.length, 18);
  assert.equal(catalogue.topics.flatMap(({ checks }) => checks).length, 90);
  assert.equal(catalogue.topics.flatMap(({ checks }) => checks.flatMap(({ tools }) => tools)).length, 180);
});

check("preserves shard ownership and exact source/topic aggregation parity", () => {
  const sources = new Map();
  for (const [name, topicIds] of Object.entries(SHARDS)) {
    const shard = plain(baseline.CSMCoverageShards[name]);
    exactKeys(shard, ["sources", "topics"], `${name} shard`);
    assert.deepEqual(shard.topics.map(({ id }) => id), topicIds);
    for (const topic of shard.topics) {
      assert.deepEqual(catalogue.topics.find(({ id }) => id === topic.id), topic, `Aggregate topic ${topic.id}`);
    }
    for (const source of shard.sources) {
      if (sources.has(source.id)) assert.deepEqual(source, sources.get(source.id), `Repeated source ${source.id}`);
      sources.set(source.id, source);
    }
  }
  assert.equal(catalogue.sources.length, sources.size);
  for (const source of catalogue.sources) assert.deepEqual(source, sources.get(source.id));
});

check("covers all fifteen review gaps with explicit draft applicability and role ownership", () => {
  const expectedGaps = new Set(Array.from({ length: 15 }, (_, index) => `G${String(index + 1).padStart(2, "0")}`));
  const actualGaps = new Set();
  for (const topic of catalogue.topics) {
    exactKeys(topic, ["id", "title", "gapIds", "domainIds", "applicability", "ownerRoles", "reviewState", "sourceIds", "checks"], topic.id);
    assert.equal(topic.reviewState, "draft");
    text(topic.title, `${topic.id}.title`);
    text(topic.applicability, `${topic.id}.applicability`);
    uniqueReferences(topic.gapIds, expectedGaps, `${topic.id}.gapIds`);
    topic.gapIds.forEach((id) => actualGaps.add(id));
    uniqueReferences(topic.domainIds, domainIds, `${topic.id}.domainIds`);
    assert(Array.isArray(topic.ownerRoles) && topic.ownerRoles.length > 0);
    assert.equal(new Set(topic.ownerRoles).size, topic.ownerRoles.length);
    topic.ownerRoles.forEach((role) => text(role, `${topic.id}.ownerRole`));
  }
  assert.deepEqual([...actualGaps].sort(), [...expectedGaps].sort());
});

check("ties every phase-specific management check and two aids to valid canonical IDs", () => {
  const seen = new Set();
  for (const topic of catalogue.topics) {
    assert.deepEqual(topic.checks.map(({ phaseId }) => phaseId), PHASES, `${topic.id} canonical phase order`);
    for (const check of topic.checks) {
      exactKeys(check, ["id", "phaseId", "prompt", "evidence", "action", "tools", "entryIds"], check.id);
      assert.equal(check.id, `COV-${topic.id}-${check.phaseId}`);
      assert(!seen.has(check.id), `Duplicate check ${check.id}`);
      seen.add(check.id);
      for (const field of ["prompt", "evidence", "action"]) text(check[field], `${check.id}.${field}`);
      uniqueReferences(check.entryIds, entryMap, `${check.id}.entryIds`);
      for (const entryId of check.entryIds) {
        const target = entryMap.get(entryId);
        assert(PHASES.includes(target.phaseId), `${check.id} link has an unknown canonical phase`);
        assert.equal(target.entry.reviewState, "reviewed", `${check.id} link must target reviewed core content`);
        assert(topic.domainIds.includes(target.domainId), `${check.id} link outside topic domains`);
      }
      assert.equal(check.tools.length, 2, `${check.id} requires two illustrative aids`);
      for (const tool of check.tools) {
        exactKeys(tool, ["name", "use"], `${check.id}.tool`);
        text(tool.name, `${check.id}.tool.name`);
        text(tool.use, `${check.id}.tool.use`);
      }
      assert.notEqual(check.tools[0].name, check.tools[1].name, `${check.id} aids must be distinct`);
    }
  }
  assert.equal(seen.size, 90);
});

check("uses complete official HTTPS source context with no orphan or unknown associations", () => {
  const sourceIds = new Set(catalogue.sources.map(({ id }) => id));
  assert.equal(sourceIds.size, catalogue.sources.length, "Unique context-source IDs");
  for (const source of catalogue.sources) {
    exactKeys(source, ["id", "title", "authority", "url", "reviewedOn"], source.id);
    assert.match(source.id, /^COV-S-[A-Za-z0-9-]+$/);
    text(source.title, `${source.id}.title`);
    text(source.authority, `${source.id}.authority`);
    const url = new URL(source.url);
    assert.equal(url.protocol, "https:");
    assert(!url.username && !url.password && !url.port);
    assert(SOURCE_HOSTS.has(url.hostname.replace(/^www\./, "")), `${source.id}: unreviewed source authority host ${url.hostname}`);
    assert.match(source.reviewedOn, /^\d{4}-\d{2}-\d{2}$/);
    assert.equal(new Date(`${source.reviewedOn}T00:00:00Z`).toISOString().slice(0, 10), source.reviewedOn);
  }
  const referenced = new Set();
  for (const topic of catalogue.topics) {
    uniqueReferences(topic.sourceIds, sourceIds, `${topic.id}.sourceIds`);
    topic.sourceIds.forEach((id) => referenced.add(id));
  }
  assert.deepEqual([...referenced].sort(), [...sourceIds].sort(), "Every catalogue source must have a topic context association");
});

check("keeps six recommendation profiles and five tabletop scenarios referentially coherent", () => {
  const topicIds = new Set(catalogue.topics.map(({ id }) => id));
  assert.equal(catalogue.profiles.length, 6);
  assert.equal(catalogue.scenarios.length, 5);
  for (const [type, entries, fields] of [
    ["profile", catalogue.profiles, ["id", "title", "description", "topicIds"]],
    ["scenario", catalogue.scenarios, ["id", "title", "domainIds", "topicIds", "prompt", "expectedEvidence"]],
  ]) {
    assert.equal(new Set(entries.map(({ id }) => id)).size, entries.length, `${type} unique IDs`);
    for (const entry of entries) {
      exactKeys(entry, fields, `${type} ${entry.id}`);
      text(entry.id, `${type}.id`);
      text(entry.title, `${type}.title`);
      uniqueReferences(entry.topicIds, topicIds, `${type} ${entry.id}.topicIds`);
      if (type === "profile") text(entry.description, `${entry.id}.description`);
      else {
        uniqueReferences(entry.domainIds, domainIds, `${entry.id}.domainIds`);
        assert(entry.domainIds.length >= 2, `${entry.id} must span multiple domains`);
        text(entry.prompt, `${entry.id}.prompt`);
        text(entry.expectedEvidence, `${entry.id}.expectedEvidence`);
      }
    }
  }
});

check("accepts relevant cross-phase context but rejects unrelated-domain core references", () => {
  vm.runInContext(read("coverage-model.js"), baseline, { filename: "coverage-model.js", timeout: 5_000 });
  vm.runInContext("globalThis.__mergedCore = __core.domains.map((domain) => ({ ...domain, actors: __core.actorProfiles[domain.id] }));", baseline);
  assert.equal(baseline.CSMCoverage.validateCatalogue(baseline.CSMCoverageCatalogue, baseline.__mergedCore).valid, true);
  const crossPhaseLinks = catalogue.topics.flatMap((topic) => topic.checks.flatMap((check) => check.entryIds.filter((id) => entryMap.get(id).phaseId !== check.phaseId)));
  assert(crossPhaseLinks.length > 0, "The reviewed content fixture must exercise meaningful cross-phase context");
  vm.runInContext(`
    globalThis.__unrelatedCatalogue = JSON.parse(JSON.stringify(CSMCoverageCatalogue));
    const topic = __unrelatedCatalogue.topics.find((record) => record.domainIds.length < __mergedCore.length);
    const unrelatedDomain = __mergedCore.find((domain) => !topic.domainIds.includes(domain.id));
    topic.checks[0].entryIds = [unrelatedDomain.cells.identify.controls[0].id];
  `, baseline);
  const invalid = baseline.CSMCoverage.validateCatalogue(baseline.__unrelatedCatalogue, baseline.__mergedCore);
  assert.equal(invalid.valid, false);
  assert(invalid.errors.some((message) => /canonical core link/.test(message)));
});

check("fails closed when any content shard is missing or structurally corrupt", () => {
  for (const name of Object.keys(SHARDS)) {
    for (const corrupt of [undefined, { sources: {}, topics: [] }, { sources: [], topics: {} }]) {
      const context = fixture((runtime) => {
        runtime.CSMCoverageCatalogue = { stale: true };
        if (corrupt === undefined) delete runtime.CSMCoverageShards[name];
        else runtime.CSMCoverageShards[name] = corrupt;
      });
      assert.equal(context.CSMCoverageCatalogue, undefined, `${name} must not expose a partial or stale catalogue`);
      assert.match(context.CSMCoverageCatalogueError, /required|Malformed/);
    }
  }
});

check("fails closed on a conflicting repeated source instead of silently overwriting it", () => {
  const context = fixture((runtime) => {
    const source = plain(runtime.CSMCoverageShards.governance.sources[0]);
    runtime.CSMCoverageShards.safety.sources.push({ ...source, title: `${source.title} conflict` });
  });
  assert.equal(context.CSMCoverageCatalogue, undefined);
  assert.match(context.CSMCoverageCatalogueError, /Conflicting coverage source/);
});

console.log(`COVERAGE CATALOGUE CONTRACTS PASSED — ${passed} cases; 18 topics, 90 checks, 180 aids`);
