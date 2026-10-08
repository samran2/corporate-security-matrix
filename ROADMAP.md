# Corporate Security Matrix Roadmap

Last updated: August 29, 2026

Current public release: `v1.0.0`

Active release candidate: `v1.1.0` — local working-tree candidate; not yet published

Planning horizon: September 2026–January 2028

## Product direction

The Corporate Security Matrix is being developed into a dependable, evidence-led decision and local-assessment tool for security leadership. The production architecture remains a static GitHub Pages site: no accounts, runtime backend, product analytics or automatic browser persistence.

The roadmap deliberately separates repository work from external assurance and publication. A checked item means evidence exists in the repository for that release section. It does not imply that a future release, a human approval or a production deployment has occurred.

Status key:

- `[x]` implemented or documented in the current release candidate and supported by repository evidence
- `[ ]` open and required for the named release or decision gate
- External gates are never checked without recorded evidence from the responsible human or service

## v1.1.0 — Verifiable and safe foundation

Target: September–October 2026

### Candidate evidence already present

- [x] Complete the structured editorial and applicability review across 9 domains, 5 lifecycle phases and 495 visible entries.
- [x] Document the evidence contract, editorial style, review limitations and source-status watchlist.
- [x] Add contextual phase quick links and explicit source status, audience, jurisdiction, applicability and review metadata.
- [x] Correct material source records, including ISO 14001:2026, the IFRC 2025 first-aid guidance, current NIST revisions and the World Bank 2024 final release.
- [x] Use the public decision-layer names **Threat sources**, **Risks & failure modes** and **Controls & actions**.
- [x] Mark the maturity scale, confidence weighting, review cadence and adoption path as project-defined or illustrative heuristics.

### Local implementation still requiring final-candidate verification

- [x] Store all 495 entries as explicit `{ id, text, reviewState }` records. Preserve each `CSM-Dxx-{I|P|D|R|RC}-{A|R|M}xx` identifier with its content when entries are reordered or edited.
- [x] Enforce exactly 9 canonical domains, 5 ordered phases, 3/4/4 entries per cell, globally unique identifiers and normalized text, supported review states and exactly 59 source records.
- [x] Add a separate, versioned mitigation-tool mapping for all 180 canonical `M` identifiers, with exactly two vendor-neutral implementation aids per mitigation and 360 `{ name, use }` records in total.
- [x] Validate the mitigation-tool mapping before startup and fail closed on missing, malformed or unmatched records. Present the aids in accessible native disclosures, include their names and uses in search, expose one visible limitation notice and expand them for print without adding runtime network requests or browser storage.
- [ ] Complete and record competent human review of all mitigation-to-tool relationships. Automated URL, named-vendor, endorsement and absolute-claim screens are bounded heuristics and do not establish semantic suitability, availability, safety, legal applicability or compliance.
- [x] Make startup atomic: missing or invalid data must produce a clear error state, never a partial matrix that appears authoritative.
- [x] Provide a useful no-JavaScript state with dead controls hidden, the correct source count and working framework and source-library links.
- [ ] Canonicalize URL state and handle malformed fragments without exceptions or unnecessary history entries.
- [ ] Preserve sensible focus through Back/Forward navigation, mobile boundary navigation and same-page mobile-menu activation.
- [ ] Resolve print contrast defects and verify primary mobile controls meet the 44-by-44-pixel target.
- [x] Align the candidate documentation on evidence scope, application-side storage, URL/log exposure, public decision-layer terms and source metadata.
- [ ] Build the v1.1 Pages artifact from one explicit, version-scoped manifest, include every linked v1.1 public document, exclude planned v1.2–v1.5 runtime features and validate the assembled `_site` artifact.
- [ ] Smoke-test every public page, asset, document and representative deep link from the assembled artifact and the deployed site.
- [ ] Run external-link checks for each final `main` SHA, bind deployment evidence to the newest run attempt and record the URL, response status and final destination for restricted responses.
- [x] Add a locally executed, version- and checksum-pinned W3C Nu validator to CI.

### v1.1.0 release gate

Publication remains blocked until all of the following are true on the same release SHA:

- [ ] Data, mutation, UI, project, syntax, HTML, browser, accessibility, print and security gates pass.
- [ ] `Quality`, `External source links` and `Publish GitHub Pages` report success for the same release SHA.
- [ ] The assembled Pages artifact, production pages, public documents, assets and deep links pass smoke tests.
- [ ] The v1.1 artifact contains only v1.1 routes and runtime assets; planned v1.2–v1.5 functionality is absent from the deployment.
- [ ] If the mitigation-tool layer remains in v1.1 scope, the artifact contains all three tool fragments and their aggregator, its 180/360 contract and UI gates pass, and no partial tooling surface can render.
- [ ] Candidate documentation, citation metadata, visible edition, changelog, tag and GitHub Release agree.
- [ ] No unresolved P1 or P2 finding remains.

### v1.1.0 external gates

Repository-setting steps and the exact approval sequence are documented in [`RELEASE-CONTROLS.md`](RELEASE-CONTROLS.md). These controls remain open until a repository administrator and release owner record evidence.

- [ ] A three-discipline external panel accepts the high-consequence life-safety, hazardous-material and occupational-safety content after all material findings are resolved.
- [ ] Named competent human reviewers accept the semantic fit and bounded wording of all 360 implementation aids across the nine domains, including hidden vendor specificity and jurisdiction-, safety- and compliance-sensitive use.
- [ ] A read-only Gemini CLI review finds no unresolved blocker; the exact command, model, version, sandbox and output are recorded before reliance.
- [ ] A branch ruleset requires the `Quality` check for release pull requests.
- [ ] The release owner approves the release pull request before it is merged to `main`.
- [ ] After the `main` build and validation succeed, the protected `github-pages` environment requires a separate release-owner approval before deployment and prevents self-approval when repository settings support it.
- [ ] After production verification, the release owner authorizes the immutable `v1.1.0` tag and GitHub Release.

## v1.2.0 — Local assessment workspace

Target: Q4 2026–Q1 2027

- [ ] Add an accessible assessment view for the 45 domain-and-phase cells.
- [ ] Record, per cell, maturity 0–4; control-evidence, independent-challenge and exercise-recency confidence components; one critical gap; next action; and owner role.
- [ ] Keep assessment state in memory only. Do not place assessment answers in URLs, Web Storage, IndexedDB or network requests.
- [ ] Show maturity, confidence, coverage, distribution, weakest phase, heatmap and prioritized actions without combining maturity and confidence into a synthetic risk score.
- [ ] Calculate maturity as the arithmetic mean of assessed cells and label any result below 45/45 coverage as incomplete.
- [ ] Calculate confidence as `50% control evidence + 30% independent challenge + 20% exercise recency`, using 0–4 inputs normalized to 0–100.
- [ ] Produce an accessible browser-print report with no PDF library.
- [ ] Export and import a versioned encrypted `*.csm-assessment.json` continuation file.
- [ ] Use AES-256-GCM with a 96-bit random IV, a 128-bit salt and PBKDF2-HMAC-SHA-256 with 600,000 iterations; authenticate the format version and cryptographic parameters as additional data.
- [ ] Never store the passphrase. Reject an incorrect passphrase, changed ciphertext, files over 1 MiB and unknown schema versions atomically.
- [ ] Keep assessment and printing available when Web Crypto is unavailable while disabling import and export with an explicit message.
- [ ] Validate the additive corporate-security coverage preview: eighteen draft subtopics, explicit applicability/exclusion rationale, ninety lifecycle checks with implementation aids, context-profile recommendations and cross-domain scenarios. Keep topic scope and evidence assertions distinct from 45-cell assessment completion; preserve the canonical matrix and existing encrypted document contract.

Release gates:

- [ ] The assessment threat model and privacy review are accepted before merge.
- [ ] Cryptographic round-trip, incorrect-passphrase, tamper, size-limit and schema-version tests pass.
- [ ] Mobile, keyboard, screen-reader, print and reduced-motion paths pass with no new runtime network or storage dependency.
- [ ] Six security leaders complete the assessment and report flow, with at least 80% of core tasks completed without guidance.
- [ ] Named competent specialists accept new high-consequence coverage content before it enters a public release; local preview availability is not evidence of expert approval.

## v1.3.0 — European Union and Finland overlay pilot

Target: Q1–Q2 2027

- [ ] Add an overlay schema that references canonical domain, phase and, only when specifically validated, entry identifiers without copying core content.
- [ ] Pilot the overlay for Information and Cybersecurity, Occupational Health and Safety, and Environmental and Hazardous Materials Safety.
- [ ] Distinguish European Union requirements, Finnish implementation context, authority guidance and voluntary standards.
- [ ] Require every record to declare jurisdiction, applicability, status, effective date, review date and official source.
- [ ] Present the overlay as decision context, not a legal determination or certification claim.
- [ ] Support the public `overlay=eu-fi` URL parameter while keeping organizational assessment data out of URLs.
- [ ] Include the core-content and overlay versions in assessment reports.

Release gates:

- [ ] Overlay-to-source-library parity passes and every source is official, current and traceable.
- [ ] Security/governance, safety/life-safety and environment/hazardous-material specialists accept their respective pilot content.
- [ ] No unresolved statement implies certification, guaranteed compliance or universal legal applicability.

## v1.4.0 — Executive reporting and change tracking

Target: Q2–Q3 2027

- [ ] Compare two user-selected encrypted assessment snapshots in memory as baseline and current.
- [ ] Show maturity and confidence changes, improved and regressed cells, open critical gaps and the next-action portfolio.
- [ ] Produce a board-ready summary with at most five findings, owner roles, decisions required and framework and overlay versions.
- [ ] Keep the report accessible in HTML and print without a PowerPoint or cloud-distribution dependency.
- [ ] Run a 12-participant study across three organization sizes or operating contexts using task tests and interviews, not product analytics.

Release gate:

- [ ] At least 80% of participants identify the three main gaps, explain the index limitations and produce the executive report without facilitator correction.

## v1.5.0 — Content operations and maintainability

Target: Q3–Q4 2027

- [ ] Add a source change register with superseded versions, review dates, responsible roles and the next review date.
- [ ] Automate sitemap-to-canonical parity, source-library-to-runtime parity, workflow-SHA agreement, artifact-manifest checks and published-route smoke tests.
- [ ] Enforce a 150 kB gzip budget for critical HTML, CSS, JavaScript and data, excluding social-preview images. Require a documented exception for any overage.
- [ ] Establish quarterly accessibility, browser, source-currency and security reviews and annual framework re-baselining.
- [ ] Expand the EU–Finland overlay to the remaining six domains only if the pilot has all three specialist approvals and no unresolved material applicability error.
- [ ] If the expansion gate fails, use `v1.5.0` for correction and calibration instead of broader coverage.

## v2.0 decision gate — No backend commitment

Target decision window: Q4 2027–Q1 2028

The roadmap does not commit the project to a backend. A v2 architecture proposal may proceed only when all of these conditions are met:

- [ ] At least 20 organization interviews demonstrate a material need for multi-user collaboration or centralized history.
- [ ] Evidence shows the locally encrypted file model cannot meet the validated need.
- [ ] A privacy impact assessment, threat model and cost model are accepted.
- [ ] Tenant isolation, authorization, audit, export, retention and deletion guarantees are defined and testable.

If the gate is not met, the project continues as a static v1.x product.

## Public data contracts

- **Matrix entry:** `{ id, text, reviewState }`. Production rendering accepts reviewed content only. Editorial changes and reordering retain the identifier; meaningfully new content receives a new identifier.
- **Mitigation-tool mapping:** schema and framework versions, one limitation notice and an object keyed by every canonical mitigation `M` identifier. Each key has exactly two `{ name, use }` records. The mapping contains no vendor links and adds no runtime network or storage behavior; unknown, missing or extra records fail closed.
- **Assessment document:** schema version, framework version, timestamps and 45 `domainId.phaseId` cells. Unknown versions fail closed instead of being guessed compatible.
- **Encrypted assessment file:** `*.csm-assessment.json`, exposing only format, version and cryptographic metadata plus ciphertext.
- **Overlay:** versioned metadata, jurisdictions, applicability, review status, official sources and annotations referencing stable core identifiers.
- **Public URL state:** existing `domain`, `view` and `q` links remain backward compatible. `overlay=eu-fi` is reserved for v1.3. Assessment answers and free-text assessment fields never enter a URL.

## Delivery order and checkpoints

1. Stabilize and validate entry and source contracts before building assessment or overlay behavior.
2. Complete the v1.1 local implementation and full-candidate checkpoint.
3. Satisfy v1.1 external assurance, repository-setting and publication gates.
4. Build v1.2 in vertical slices: assessment state, accessible workflow, report, then encrypted continuation.
5. Build and review the three-domain v1.3 overlay before considering broader coverage.
6. Add comparison and executive reporting in v1.4 only after the assessment format is stable.
7. Add content-operations automation and make the v2 decision from research evidence.

After every two or three implementation tasks, run the full applicable checkpoint: deterministic tests, browser checks, assembled-artifact smoke tests and a fresh-context review. Repository-only implementation tasks, dependencies and acceptance criteria are maintained in `tasks/todo.md`; architecture and sequencing are recorded in `tasks/plan.md`. These working documents are intentionally outside the public release artifact.

## Common Definition of Done

Every release requires:

- new tests that fail without the change and pass with it;
- all existing regression gates passing;
- zero error-level W3C Nu messages across every HTML file in the version-scoped release manifest: four files for v1.1.0, increasing to five when `assessment.html` enters release scope in v1.2.0;
- browser coverage at 320, 390, 768 and 1440 pixels, including keyboard, reduced motion, print, error and no-JavaScript states;
- no open high- or medium-severity security or accessibility finding;
- competent human semantic review for implementation-aid content; automated vendor and claim-pattern checks are supporting evidence only;
- validation of the release artifact exactly as it will be published;
- agreement among documentation, changelog, citation, live version, tag and GitHub Release;
- release-owner and applicable external specialist approval; and
- a rollback path using a normal revert commit without shared-history rewriting.

## Publication and rollback

Publication order for releases that deploy from `main`:

1. Freeze content and review the complete candidate diff.
2. Run all local and external-link gates from the candidate commit.
3. Obtain external specialist evidence required by the release.
4. Obtain release-owner approval for the release pull request before merging it.
5. Merge the approved SHA to `main` and wait for its build, validation and source-link gates.
6. After those gates pass, obtain the separate protected-`github-pages`-environment approval and deploy that same SHA.
7. Verify the deployed pages, assets, documents, deep links and browser console.
8. Confirm release metadata agrees, then obtain or confirm release-owner authorization for the immutable tag and GitHub Release.
9. Record exceptions and owned follow-up work in the release notes.

If a post-deployment gate fails, stop tag or Release creation, identify the last known-good deployment and publish a normal revert commit through the same checks. Prefer a reviewed forward fix when the defect is limited and rollback would restore a larger known problem.

## Decision ownership

- **Product direction:** prioritizes user value and release scope.
- **Editorial owner:** accepts terminology, source and applicability changes.
- **Domain reviewer:** challenges high-consequence content and mitigation-to-tool fit within their discipline.
- **Technical maintainer:** owns validation, accessibility, security and deployment integrity.
- **Release owner:** approves publication, confirms release evidence and coordinates rollback.

One person may hold multiple roles, but approvals and evidence remain explicit. Until every v1.1.0 gate is satisfied and the release is published, `v1.0.0` remains the current public release.
