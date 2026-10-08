# ADR 0003: Additive corporate-security coverage workspace

Date: 2026-10-09
Status: Accepted for local development; content and release approval pending

## Decision and scope

Implement the fifteen gaps in COVERAGE-REVIEW.md as an additive, English-language local preview. Preserve the nine canonical domains, five phases, 495 entry IDs, 59 core sources and existing assessment/encryption contracts. The preview is not a jurisdiction overlay, certification or evidence of compliance. All new content is explicitly draft and needs named competent human review.

The catalogue has eighteen topics, each with five phase-specific management checks and two vendor-neutral implementation aids per check. Checks use separate stable `COV-<topic>-<phase>` IDs. A source association supplies topic context, not verified entry-level proof. Core links must resolve to existing canonical IDs.

`coverage.html` is a local developer preview, excluded from the v1.1 Pages artifact. Its preview link in index.html is release-scoped and removed from that artifact. The original implementation scope allowed local changes only. A subsequent explicit GitHub-update request authorizes development-branch commits, push and a draft pull request after security review; it does not authorize merging, tagging or deploying the preview. See the GitHub review handoff in tasks/todo.md.

## Catalogue contract

Each content shard exposes `globalThis.CSMCoverageShards.<governance|safety|digital>` as `{ sources, topics }`. Each source is exactly `{ id, title, authority, url, reviewedOn }`, with official HTTPS URLs and ISO dates. Source IDs start `COV-S-`; repeated IDs must have identical records.

Each topic is exactly `{ id, title, gapIds, domainIds, applicability, ownerRoles, reviewState, sourceIds, checks }`. `reviewState` is `draft`. Applicability is a scope question, not a legal conclusion. Topic IDs and ownership:

- governance shard: governance, employment-lifecycle, supplier-lifecycle, travel-program, confidential-meetings, risk-transfer.
- safety shard: process-technical-safety, product-service-safety, event-safety, transport-dangerous-goods, cross-domain-resilience.
- digital shard: ot-iot, secure-product-lifecycle, ai-security, data-protection, trade-compliance, strategic-information, verified-crisis-communications.

Each topic has exactly one check in each canonical phase order: identify, protect, detect, respond, recover. A check is exactly `{ id, phaseId, prompt, evidence, action, tools, entryIds }`. Its ID is `COV-<topic>-<phase>`. `tools` contains exactly two `{ name, use }` aids; `entryIds` contains one or more real reviewed core IDs within the topic's domains. Related core entries can come from another lifecycle phase: recovery readiness, for example, can reference approved restart decisions in Respond. The UI identifies the target phase; these are related planning contexts, not independently verified normative mappings. Evidence describes a record to examine, not material to upload. Safety checks require competent personnel and site-specific procedures; do not prescribe engineering limits, equipment settings or emergency intervention steps.

The aggregator exposes `CSMCoverageCatalogue = { schemaVersion: 1, version: '0.1.0-draft', frameworkVersion: '1.1.0-candidate', reviewState: 'draft', sources, topics, profiles, scenarios }`. Profiles are `{ id, title, description, topicIds }` recommendations only, never automatic exclusions. Scenarios are `{ id, title, domainIds, topicIds, prompt, expectedEvidence }` tabletop discussion aids, not incident instructions.

## Session/model contract

`coverage-model.js` exposes `globalThis.CSMCoverage` with `validateCatalogue(catalogue, domains)`, `createDocument(catalogue, now?)`, `validateDocument(document, catalogue)`, `updateTopic(document, topicId, patch, catalogue, now?)`, `summarize(document, catalogue)` and `buildReport(document, catalogue)`.

Validators return `{ valid, errors }`. Document constructors/updaters/report functions throw on invalid input. Updates return a new document and never mutate an existing one; unknown keys or malformed multi-field edits fail atomically.

The document has exactly `{ format: 'csm-coverage', schemaVersion: 1, catalogueVersion, frameworkVersion, createdAt, updatedAt, topics }`. Every catalogue topic has exactly `{ applicability, rationale, ownerRole, criticalGap, nextAction, checks }`. Applicability is `undetermined`, `applicable` or `not-applicable`; non-applicability requires a nonblank rationale, at most 300 characters. Owner is empty or a catalogue role, never a person name. Critical gap and next action are optional text, each at most 500 characters. Check states are `not-assessed`, `gap`, `partial` or `evidence-available`. All checks initialize to not-assessed. Topic maps and check maps have exact keys; unknown schema/catalogue/framework versions are rejected.

Summary exposes `{ totalTopics, applicableTopics, notApplicableTopics, undeterminedTopics, totalChecks, applicableChecks, assessedChecks, notAssessedChecks, gaps, partial, evidenceAvailable, criticalGaps, actions }`. Counts apply only to explicitly applicable topics; `totalChecks` always exposes all ninety checks. Critical gaps/actions are arrays of `{ topicId, title, ownerRole, text }`, including unresolved topics but excluding non-applicable topics. No overall security score, maturity/confidence blend or completeness claim is calculated. Evidence-available is explicitly a user's assertion, not verification.

`buildReport` returns plain text for safe rendering with textContent, including catalogue/framework versions, draft status, all applicability decisions and rationales, check judgments, exclusions, unresolved scope and action owners. The browser prints accessible HTML using its native print path.

## Threat model and privacy review

Assets: topic applicability, organizational gaps and proposed actions. Trust boundaries: bundled untrusted catalogue content, typed session text, the DOM and user-initiated print output. Risks: script injection, misleading legal/safety assurance, accidental disclosure through URLs/storage/network/print, partial corrupt startup and lost session work.

Controls: exact bounded schemas; textContent/native form fields only; validated HTTPS source links; no user text in URL/history; no fetch, Web Storage, IndexedDB, service workers, third-party scripts or analytics; atomic catalogue validation before rendering; pagehide clears state and fields, including BFCache returns; prominent memory-only and unencrypted print warnings; explicit draft/applicability/user-assertion limitations. No attachments, actual evidence documents or personal names requested. Free-text fields warn against sensitive information. Print is an explicit local disclosure chosen by the user.

No new persistence/import format is introduced. Existing encrypted assessment files remain compatible and cannot contain these new topic judgments. Versioned encrypted coverage continuation requires a separately reviewed format and explicit migration work; silently reusing assessment schema 1 is prohibited.

## Verification and release gate

Test model rejection and atomic updates, catalogue/core/source parity, profiles/scenarios, privacy surfaces, startup failure, keyboard/mobile/reduced-motion/print paths, and unchanged v1.1 artifact exclusions. Verify at 320, 390, 768 and 1440 pixels. Independent content, security and usability review follow integration. Human professional content acceptance and release-owner approval remain external gates, never inferred from automated tests.
