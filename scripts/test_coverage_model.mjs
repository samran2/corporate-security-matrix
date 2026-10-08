import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const root = new URL("../", import.meta.url);
const context = {};
vm.createContext(context);
const coreSource = ["matrix-domains.js", "matrix-actors.js", "matrix-briefs.js"].map((file) => fs.readFileSync(new URL(file, root), "utf8")).join("\n");
vm.runInContext(`${coreSource}\nglobalThis.core = domains;`, context);
const domains = JSON.parse(JSON.stringify(context.core));
await import(new URL("coverage-model.js", root));
const model = globalThis.CSMCoverage;
const phases = ["identify", "protect", "detect", "respond", "recover"];
const topicIds = ["governance", "employment-lifecycle", "supplier-lifecycle", "travel-program", "confidential-meetings", "risk-transfer", "process-technical-safety", "product-service-safety", "event-safety", "transport-dangerous-goods", "cross-domain-resilience", "ot-iot", "secure-product-lifecycle", "ai-security", "data-protection", "trade-compliance", "strategic-information", "verified-crisis-communications"];
const clone = (value) => JSON.parse(JSON.stringify(value));
const now = "2026-10-09T09:00:00.000Z";
const later = "2026-10-09T10:00:00.000Z";
const catalogue = {
  schemaVersion: 1, version: "0.1.0-draft", frameworkVersion: "1.1.0-candidate", reviewState: "draft",
  sources: [{ id: "COV-S-NIST", title: "NIST context", authority: "NIST", url: "https://csrc.nist.gov/", reviewedOn: "2026-10-09" }],
  topics: topicIds.map((id, index) => ({
    id, title: `Topic ${id}`, gapIds: [`G${String(index % 15 + 1).padStart(2, "0")}`], domainIds: [domains[index % 9].id],
    applicability: "Does this topic apply to your organisation?", ownerRoles: [`Topic ${index} lead`], reviewState: "draft", sourceIds: ["COV-S-NIST"],
    checks: phases.map((phaseId) => ({
      id: `COV-${id}-${phaseId}`, phaseId, prompt: "Is there a documented management check?", evidence: "A reviewed management record.", action: "Ask a competent owner to review the record.",
      tools: [{ name: "Review register", use: "Record the management review." }, { name: "Discussion guide", use: "Discuss the documented assumptions." }],
      entryIds: [domains[index % 9].cells[phaseId].controls[0].id]
    }))
  })),
  profiles: ["office", "industrial", "digital-provider", "public-facing", "logistics", "critical-service"].map((id) => ({ id, title: id, description: "A recommendation, not an automatic exclusion.", topicIds: [topicIds[0]] })),
  scenarios: ["ransomware-production", "flood-power-comms", "supplier-restriction", "insider-ip-loss", "impersonated-payment"].map((id) => ({ id, title: id, domainIds: [domains[0].id], topicIds: [topicIds[0]], prompt: "Discuss a possible disruption.", expectedEvidence: "A competent review of the scenario." }))
};
assert.deepEqual(model.validateCatalogue(catalogue, domains), { valid: true, errors: [] });
const catalogueCases = [
  ["unknown schema", (value) => { value.schemaVersion = 2; }],
  ["unknown catalogue version", (value) => { value.version = "0.2.0"; }],
  ["unknown framework", (value) => { value.frameworkVersion = "2.0.0"; }],
  ["unknown field", (value) => { value.extra = true; }],
  ["missing topic", (value) => { value.topics.pop(); }],
  ["duplicate topic", (value) => { value.topics[1] = clone(value.topics[0]); }],
  ["non-draft topic", (value) => { value.topics[0].reviewState = "reviewed"; }],
  ["wrong phase order", (value) => { value.topics[0].checks.reverse(); }],
  ["missing tool", (value) => { value.topics[0].checks[0].tools.pop(); }],
  ["bad core link", (value) => { value.topics[0].checks[0].entryIds = ["CSM-D99-I-M01"]; }],
  ["wrong core domain", (value) => { value.topics[0].checks[0].entryIds = [domains[1].cells.identify.controls[0].id]; }],
  ["unknown source", (value) => { value.topics[0].sourceIds = ["COV-S-MISSING"]; }],
  ["unofficial source", (value) => { value.sources[0].url = "https://example.com/"; }],
  ["HTTP source", (value) => { value.sources[0].url = "http://csrc.nist.gov/"; }],
  ["URL credentials", (value) => { value.sources[0].url = "https://reader@csrc.nist.gov/"; }],
  ["invalid date", (value) => { value.sources[0].reviewedOn = "2026-02-30"; }],
  ["conflicting duplicate source", (value) => { value.sources.push({ ...value.sources[0], title: "Another record" }); }],
  ["bad profile link", (value) => { value.profiles[0].topicIds = ["missing"]; }],
  ["bad scenario domain", (value) => { value.scenarios[0].domainIds = ["missing"]; }],
  ["bad gap ID", (value) => { value.topics[0].gapIds = ["G99"]; }],
  ["missing gap coverage", (value) => { value.topics.forEach((topic) => { topic.gapIds = ["G01"]; }); }],
  ["orphan source", (value) => { value.sources.push({ ...value.sources[0], id: "COV-S-ORPHAN" }); }]
];
for (const [name, mutate] of catalogueCases) {
  const fixture = clone(catalogue);
  mutate(fixture);
  const result = model.validateCatalogue(fixture, domains);
  assert.equal(result.valid, false, name);
  assert(result.errors.length > 0, name);
}
assert.equal(model.validateCatalogue(null, domains).valid, false);
assert.equal(model.validateCatalogue(catalogue, null).valid, false);
const crossPhase = clone(catalogue);
crossPhase.topics[0].checks[0].entryIds = [domains[0].cells.recover.controls[0].id];
assert.equal(model.validateCatalogue(crossPhase, domains).valid, true, "Related core references may deliberately cross lifecycle phases.");
const noActors = clone(domains);
noActors.forEach((domain) => { delete domain.actors; });
const actorLink = clone(catalogue);
actorLink.topics[0].checks[0].entryIds = [domains[0].actors.identify[0].id];
assert.equal(model.validateCatalogue(actorLink, domains).valid, true);
assert.equal(model.validateCatalogue(actorLink, noActors).valid, false, "Missing actor records must not manufacture plausible IDs.");
const explicitMissingActors = clone(noActors);
explicitMissingActors.forEach((domain) => { domain.actors = undefined; });
assert.equal(model.validateCatalogue(catalogue, explicitMissingActors).valid, false, "An explicitly supplied missing actor pack fails closed, even without actor context links.");
const emptyActors = clone(noActors);
emptyActors.forEach((domain) => { domain.actors = {}; });
assert.equal(model.validateCatalogue(catalogue, emptyActors).valid, false);
const missingActorPhase = clone(domains);
missingActorPhase[0].actors.identify = undefined;
assert.equal(model.validateCatalogue(catalogue, missingActorPhase).valid, false, "Every explicitly supplied actor phase needs real records, not an undefined placeholder.");
const duplicateSource = clone(catalogue);
duplicateSource.sources.push(clone(duplicateSource.sources[0]));
assert.equal(model.validateCatalogue(duplicateSource, domains).valid, false, "The aggregator must deduplicate identical source aliases.");
const document = model.createDocument(catalogue, now);
assert.throws(() => model.createDocument(catalogue, "+010000-01-01T00:00:00.000Z"), "Version 1 timestamps stay within the bounded four-digit-year format.");
assert.throws(() => model.createDocument(catalogue, "2026-10-09T09:00:00Z"), "Non-canonical timestamps are not guessed compatible.");
assert.equal(model.validateDocument(document, catalogue).valid, true);
assert.equal(Object.keys(document.topics).length, 18);
assert.equal(Object.values(document.topics).flatMap((topic) => Object.values(topic.checks)).filter((state) => state === "not-assessed").length, 90);
const initial = model.summarize(document, catalogue);
assert.equal(initial.totalTopics, 18);
assert.equal(initial.undeterminedTopics, 18);
assert.equal(initial.totalChecks, 90);
assert.equal(initial.applicableChecks, 0);
assert.equal(initial.assessedChecks, 0);
assert.equal(initial.notAssessedChecks, 0);
const first = topicIds[0];
const firstCheck = catalogue.topics[0].checks[0].id;
const secondCheck = catalogue.topics[0].checks[1].id;
const changed = model.updateTopic(document, first, { applicability: "applicable", ownerRole: "Topic 0 lead", checks: { [firstCheck]: "gap", [secondCheck]: "evidence-available" }, criticalGap: "Missing record", nextAction: "Review the record" }, catalogue, later);
const literal = model.updateTopic(document, first, { criticalGap: "<script>alert('literal')</script> and x < y" }, catalogue, later);
assert(model.buildReport(literal, catalogue).includes("<script>alert('literal')</script> and x < y"), "Report output is literal plain text for a textContent sink, never HTML.");
assert.equal(document.topics[first].applicability, "undetermined", "An update never mutates the input.");
assert.notEqual(changed, document);
assert.notEqual(changed.topics[first], document.topics[first]);
assert.equal(changed.updatedAt, later);
const stats = model.summarize(changed, catalogue);
assert.equal(stats.applicableTopics, 1);
assert.equal(stats.applicableChecks, 5);
assert.equal(stats.assessedChecks, 2);
assert.equal(stats.notAssessedChecks, 3);
assert.equal(stats.gaps, 1);
assert.equal(stats.evidenceAvailable, 1);
assert.equal(stats.criticalGaps[0].ownerRole, "Topic 0 lead");
assert.equal(stats.actions[0].text, "Review the record");
const excluded = model.updateTopic(changed, first, { applicability: "not-applicable", rationale: "No such operation." }, catalogue, later);
assert.equal(excluded.topics[first].checks[firstCheck], "gap", "N/A does not erase a prior judgment.");
assert.equal(model.summarize(excluded, catalogue).assessedChecks, 0);
assert.equal(model.summarize(excluded, catalogue).criticalGaps.length, 0);
assert.equal(model.summarize(excluded, catalogue).actions.length, 0);
const unresolved = model.updateTopic(excluded, first, { applicability: "undetermined" }, catalogue, later);
assert.equal(model.summarize(unresolved, catalogue).criticalGaps.length, 1);
assert.equal(model.summarize(unresolved, catalogue).assessedChecks, 0);
const restored = model.updateTopic(unresolved, first, { applicability: "applicable", checks: { [secondCheck]: "partial" } }, catalogue, later);
assert.equal(restored.topics[first].checks[firstCheck], "gap", "Sparse edits retain other judgments.");
assert.equal(model.summarize(restored, catalogue).partial, 1);
for (const patch of [
  { applicability: "not-applicable", rationale: "   " }, { ownerRole: "A person's name" }, { rationale: "x".repeat(301) }, { criticalGap: "x".repeat(501) }, { nextAction: "x".repeat(501) }, { unknown: true },
  { checks: { unknown: "gap" } }, { checks: { [firstCheck]: "verified" } }, { applicability: "applicable", checks: { [firstCheck]: "gap" }, nextAction: "x".repeat(501) }
]) {
  const before = JSON.stringify(document);
  assert.throws(() => model.updateTopic(document, first, patch, catalogue, later));
  assert.equal(JSON.stringify(document), before, "Malformed multi-field update must fail atomically.");
}
assert.throws(() => model.updateTopic(document, "missing", {}, catalogue, later));
assert.throws(() => model.updateTopic(changed, first, {}, catalogue, now), "Timestamps cannot move backwards.");
for (const [name, mutate] of [
  ["format", (value) => { value.format = "csm-assessment"; }], ["version", (value) => { value.schemaVersion = 2; }], ["catalogue", (value) => { value.catalogueVersion = "0.2.0"; }], ["framework", (value) => { value.frameworkVersion = "2.0.0"; }],
  ["extra field", (value) => { value.extra = 1; }], ["extra topic", (value) => { value.topics.missing = {}; }], ["extra check", (value) => { value.topics[first].checks.extra = "gap"; }], ["N/A rationale", (value) => { value.topics[first].applicability = "not-applicable"; }], ["bad timestamp", (value) => { value.createdAt = "yesterday"; }]
]) {
  const fixture = clone(document);
  mutate(fixture);
  assert.equal(model.validateDocument(fixture, catalogue).valid, false, name);
  assert.throws(() => model.summarize(fixture, catalogue), name);
  assert.throws(() => model.buildReport(fixture, catalogue), name);
}
const report = model.buildReport(excluded, catalogue);
assert.match(report, /0\.1\.0-draft/);
assert.match(report, /1\.1\.0-candidate/);
assert.match(report, /not verified|not verification/i);
assert.match(report, /No such operation\./);
assert.match(report, /unresolved|undetermined/i);
assert.match(report, /excluded/i);
assert(report.includes(firstCheck));
assert(report.includes("Topic 0 lead"));
assert(report.includes(catalogue.topics[0].checks[0].prompt), "A check ID alone is not a self-contained judgment.");
assert(report.includes(catalogue.topics[0].checks[0].entryIds[0]));
assert(report.includes(catalogue.sources[0].title));
assert(report.includes(catalogue.sources[0].url));
const activeReport = model.buildReport(unresolved, catalogue);
assert(activeReport.indexOf("Critical-gap portfolio") < activeReport.indexOf(`Topic ${first} [${first}]`));
assert.match(activeReport, /Critical-gap portfolio[\s\S]*unresolved scope[\s\S]*Missing record/);
assert(!report.slice(report.indexOf("Critical-gap portfolio"), report.indexOf("Topic register")).includes("Missing record"), "N/A entries are excluded from leadership portfolios.");
assert(!Object.hasOwn(stats, "score"));
const source = fs.readFileSync(new URL("coverage-model.js", root), "utf8");
assert(!/innerHTML|insertAdjacentHTML|document\.write|\bfetch\s*\(|XMLHttpRequest|WebSocket|localStorage|sessionStorage|indexedDB|history\.|location\./i.test(source));
const actualContext = {};
vm.createContext(actualContext);
for (const file of ["matrix-coverage-governance.js", "matrix-coverage-safety.js", "matrix-coverage-digital.js", "matrix-coverage.js"]) {
  vm.runInContext(fs.readFileSync(new URL(file, root), "utf8"), actualContext, { filename: file, timeout: 1000 });
}
assert(actualContext.CSMCoverageCatalogue, "All three real shards assemble atomically.");
const actualCatalogue = clone(actualContext.CSMCoverageCatalogue);
const actualValidation = model.validateCatalogue(actualCatalogue, domains);
assert.equal(actualValidation.valid, true, actualValidation.errors.join(" "));
const actualDocument = model.createDocument(actualCatalogue, now);
assert.equal(model.summarize(actualDocument, actualCatalogue).totalChecks, 90);
assert(model.buildReport(actualDocument, actualCatalogue).includes(actualCatalogue.topics[0].checks[0].prompt));
console.log(`COVERAGE MODEL TESTS PASSED — ${catalogueCases.length} catalogue mutations, strict document validation, atomic immutable updates, retained judgments, honest applicable-only counts and plain-text reporting.`);
