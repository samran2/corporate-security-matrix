# Corporate Security Matrix Delivery Tasks

Last updated: 2026-10-09

This is the implementation backlog for [`../ROADMAP.md`](../ROADMAP.md). A checked task means its acceptance criteria and verification are supported by repository evidence. External approvals are listed separately and must never be inferred from code or automated test results.

The current phase-filter, action-brief and security-hardening changes are an unreleased development integration. The public release remains `v1.0.0`; browser, public-HTML, expert-review and release-approval gates below remain open.

## GitHub review handoff — 2026-10-09

The user subsequently authorized a GitHub update after Codex Security review. This permits development-branch commits, push and a draft pull request, not a merge, production deployment, version tag, GitHub Release or protection-setting change. The resulting commit and pull request will be recorded in GitHub; the earlier local-preview checkpoint below remains historical evidence.

- Completed Codex Security diff scan: `e7ef1bfc-9c24-4a04-ab4c-7b67bc40b5df`, baseline `c149c364c4fc5d69fc0e738fd524f73709814574`, snapshot `codex-security-snapshot/v1:sha256:54833e70a304946a94e223363e89577bbdb565c908ec2d32be91a399d1cb7aba`.
- Five independent compact reviews accounted for all 26 changed source/test/manifest/workflow files; nine documentation files were also reviewed. No technically plausible vulnerability candidates or reportable findings were identified. This is a diff review, not a new exhaustive repository audit or professional content approval.
- Deterministic local regression, workflow, project and artifact gates were rerun successfully. Java-based public-HTML execution and the existing external browser/content/release gates are not waived; GitHub CI results must be checked against the submitted commit.
- After sealing the immutable scan, only documentation was clarified to distinguish this authorization from the original local-only implementation. Runtime, data, validators and workflows remain the reviewed bytes. Documentation readback and final artifact validation are required before push.

## Premium coverage integration — local preview

Scope: implement G01–G15 from `docs/COVERAGE-REVIEW.md` without rewriting the canonical matrix or existing encrypted assessment format. Contract and privacy review: `docs/ADR-0003-coverage-workspace.md`. Usage and traceability: `docs/COVERAGE-WORKSPACE.md`.

- [x] Lock the additive catalogue/session contract and record the local-preview release boundary before parallel implementation.
- [x] Implement eighteen draft topics, ninety phase checks, 180 implementation aids and verified canonical-ID links.
- [x] Implement explicit applicability, mandatory non-applicability rationale, accountable roles, check judgments, critical gaps and next actions in memory only.
- [x] Implement six recommendation-only context profiles, five cross-domain tabletop scenarios and an honest printable leadership report.
- [x] Prove catalogue/document rejection, immutable atomic updates, source/core/profile/scenario parity and no URL/storage/network response flows.
- [ ] Verify keyboard, mobile, no-script, startup-error, reduced-motion, pagehide and print paths against the integrated preview.
- [x] Validate the unchanged four-page v1.1 artifact and exclusion of the draft workspace and its home-page link.
- [x] Complete independent code/security and content review, resolve material findings and record final evidence.
- [ ] Named competent human reviewers approve high-consequence content; user research and release-owner approval authorize publication. Automated tests and agent reviews cannot close this external gate.

The original local implementation task did not authorize commit, push, tag, GitHub Release or deployment. The later development-branch handoff authorization is recorded above; public release still requires its separate gates. The preview introduces no new continuation-file format; existing encrypted assessment files remain compatible and cannot contain coverage-topic judgments.

### Checkpoint evidence — 2026-10-09

- Model: `node scripts/test_coverage_model.mjs` passes 22 catalogue mutations plus exact document/version/ownership checks, atomic immutable updates, exclusions, literal-text safety and the real 18-topic catalogue.
- Catalogue: `node scripts/test_coverage_catalogue.mjs` passes 10 contracts: all G01–G15, 90 checks/180 aids, 27 official context records, shard/source/core parity, six profiles/five scenarios and fail-closed aggregation. Related cross-phase core context is explicitly supported; unrelated-domain links are rejected.
- UI: `node scripts/test_coverage_ui.mjs` passes 33 deterministic DOM cases. Ten actor-pack mutations cover the independently reproduced empty-pack startup bug. It is fixed by complete 9 × 5 × 3 actor validation and the exact 495-reviewed-entry guard. Safe text rendering, all missing bundles, invalid edits, native field labels, recommendation-only profiles, print lifecycle/failure and pagehide/BFCache reset pass. DOM tests are not real screen-reader or browser-print approval.
- Real browser (Codex in-app browser, fresh localhost port 8795): ready with no warning/error logs; no horizontal overflow and primary controls at least 44 × 44 pixels at 320, 390, 768 and 1440 widths; five saved judgments produce the expected separate counts; blank non-applicability rationale blocks topic navigation and focuses its field; profile recommendations retain all eighteen topics; a zero-result search leaves all eighteen report sections intact; Enter selects a topic and focuses its heading, followed by a visible-focus source link; literal test markup creates no DOM element; navigation to the matrix and Back returns an empty session with blank text fields and no saved sentinel in the report. Synthetic test judgments were discarded.
- Print: source rules and deterministic beforeprint/afterprint/failure tests pass. A native print attempt blocked the browser automation at the operating-system dialog; the temporary agent-created test tab was closed successfully. Actual print-layout/Save-as-PDF acceptance remains open. Native no-JavaScript, reduced-motion emulation, additional browser engines and screen-reader acceptance also remain open; their static/DOM safeguards are tested, not their full real-browser paths.
- Existing gates remain green: data/contracts, runtime bootstrap/history, action brief, matrix UI, mitigation tools/UI, assessment (19), comparison (9), overlays/UI and source-register mutations. HTML-download/archive security tests (16) and link-checker offline tests (21) pass.
- Workflow checks: baseline plus 112 mutations and 29 exact-SHA cases pass. Project validation passes 92 required files and six local HTML documents. Site tests pass 34 cases. The built v1.1 artifact has 36 files, four HTML pages, three canonical/sitemap pages and 99,050 / 150,000 gzip bytes; all draft coverage assets and its CTA are excluded. Final artifact SHA-256 after the development-preview changelog entry: `e8f7998e1165ae9c083c4be40e421a3d541e0422d8a2881f8ead113e571de8e7`.
- Artifact route smoke: 41 probes pass in two consecutive coherent localhost sweeps on port 8796, covering the published pages, assets, documents and deep links. This is not a production deployment or live GitHub verification.
- Independent fresh-context review of all shards, model, aggregator, UI, contracts and release pruning has no remaining P1/P2 findings. Source consultation and agent review do not constitute named competent human professional approval.
- The local W3C Nu execution gate remains unverified because Java is unavailable; its pinned downloader and security regressions pass. No release approval, commit, push or deployment is claimed.

## v1.1.0 — Candidate stabilization

### Task R11-01: Make entry identity explicit

**Description:** Convert every matrix entry to an explicit record and remove position-derived identity from the public contract.

**Acceptance criteria:**

- [x] All 495 entries contain immutable-format `id`, non-empty `text` and supported `reviewState` fields.
- [x] Reordering entries does not change which identifier belongs to a text.
- [x] Production rendering accepts reviewed records only and has no positional identifier fallback.

**Verification:**

- [x] `node scripts/validate_data.mjs`
- [x] `node scripts/validate_data_contract.mjs` proves reordered, duplicate, malformed and unreviewed entries fail correctly.

**Dependencies:** None

**Files likely touched:** `matrix-actors.js`, `matrix-domains.js`, `app.js`, `scripts/validate_data.mjs`

**Estimated scope:** Medium

### Task R11-02: Enforce canonical matrix and source contracts

**Description:** Make the validator fail closed on structural drift rather than reporting aggregate totals only.

**Acceptance criteria:**

- [x] Domain and phase identifiers and order are exact, and every cell has 3/4/4 layer entries.
- [x] Entry identifiers and normalized text are globally unique.
- [x] Exactly 59 complete source records exist and every domain-phase pair has an explicit contextual mapping.

**Verification:**

- [x] `node scripts/validate_data.mjs`
- [x] `node scripts/validate_data_contract.mjs` covers removed, moved, duplicated and renamed data before the original data passes again.

**Dependencies:** R11-01

**Files likely touched:** `scripts/validate_data.mjs`, `matrix-references.js`

**Estimated scope:** Small

### Task R11-02A: Add mitigation implementation aids

**Description:** Give every canonical Controls & actions entry two bounded, vendor-neutral implementation aids without changing the stable matrix-entry contract.

**Acceptance criteria:**

- [x] A separate schema-versioned mapping covers all 180 canonical `CSM-Dxx-{I|P|D|R|RC}-Mxx` identifiers exactly once and contains exactly two `{ name, use }` records per identifier, 360 records in total.
- [x] Runtime startup rejects missing, extra, malformed or unmatched tooling before a plausible matrix can render.
- [x] Tool names and uses contain no links, named-vendor promotion, markup or absolute risk-removal claims under the deterministic bounded checks; the feature adds no runtime network request or browser storage.
- [x] Every mitigation tile exposes a native `details` disclosure with a 44-pixel target, tool-aware search, safe narrow-screen wrapping and expanded print content, while one visible notice explains that the aids are illustrative and do not guarantee risk elimination.
- [ ] Named competent human reviewers verify all 180 mappings and 360 records for semantic fit, practical usefulness, hidden vendor specificity and jurisdiction-, safety-, privacy- and compliance-sensitive limitations. Automated pattern screens do not satisfy this criterion.

**Verification:**

- [x] `node scripts/validate_mitigation_tools.mjs`
- [x] `node scripts/validate_mitigation_tools_ui.mjs`
- [ ] Browser checks cover disclosure operation, tool-text search, 320- and 390-pixel wrapping, keyboard focus and expanded print output.
- [ ] The content-review record names each human reviewer's domain scope, date, findings and disposition.

**Dependencies:** R11-01, R11-02

**Files likely touched:** `matrix-tools-d01-d03.js`, `matrix-tools-d04-d06.js`, `matrix-tools-d07-d09.js`, `matrix-tools.js`, `index.html`, `app.js`, `styles.css`, mitigation-tool validators and review documentation

**Estimated scope:** Medium

### Task R11-02B: Turn selected controls into a local action brief

**Description:** Add lifecycle-phase filtering and a small cross-domain planning brief without changing canonical matrix content or collecting assessment responses.

**Acceptance criteria:**

- [x] `phase=identify|protect|detect|respond|recover` selects one lifecycle phase; omitted, `all` or invalid values resolve to all phases, and existing `domain`, `view` and `q` links retain their meaning.
- [x] Public phase state participates in URL canonicalization and Back/Forward restoration; canonical entry IDs participate in search.
- [x] The in-memory model accepts at most 12 unique reviewed canonical mitigation IDs across domains, with an owner role from the action's own domain profile and a valid Now/Next/Later horizon.
- [x] Invalid multi-field edits are rejected atomically; unknown IDs, duplicate selections, another domain's owner role and unknown fields cannot enter the brief.
- [x] Selection order and horizons are explicitly planning choices, not severity, risk ranking or prescribed deadlines; no person names, free-text notes or assessment answers are collected.
- [x] Selections remain independent of public filters and are excluded from URLs, history state, browser storage and network requests; reload or `pagehide` clears them.
- [x] Markdown/print output records exact IDs, the core framework version, tools and each action's own phase-context sources, states that overlays are not included, and warns that output is unencrypted.
- [ ] Real-browser checks establish keyboard focus after add/remove/clear, owner/horizon changes, phase selection and Back/Forward at 320, 390, 768 and 1440 pixels.
- [ ] No-JavaScript, startup-error, reduced-motion, print cancellation and browser navigation-cache paths remain useful and preserve the stated privacy behavior.

**Verification:**

- [x] `node scripts/test_action_brief.mjs` covers canonical selection, limits, duplicates, atomic owner/horizon validation, cross-domain provenance and Markdown escaping.
- [ ] Browser and print evidence is recorded against the final integrated candidate.

**Dependencies:** R11-01, R11-02, R11-02A, R11-03 and R11-04 for the complete UI contract

**Files likely touched:** `app.js`, `index.html`, `styles.css`, `scripts/test_action_brief.mjs` and candidate documentation

**Estimated scope:** Medium

### Task R11-03: Make startup atomic and no-JavaScript output useful

**Description:** Prevent partial authoritative-looking output when data is missing or invalid and provide a useful static fallback.

**Acceptance criteria:**

- [x] Rendering begins only after all required datasets pass runtime shape checks.
- [x] Any startup failure replaces the dynamic surface with one descriptive error state.
- [x] Without JavaScript, dead controls are hidden and the correct source count and document links remain available.

**Verification:**

- [x] `node scripts/validate_ui.mjs`
- [ ] Browser checks with each data script blocked and JavaScript disabled.

**Dependencies:** R11-01, R11-02

**Files likely touched:** `index.html`, `app.js`, `styles.css`, `scripts/validate_ui.mjs`

**Estimated scope:** Medium

### Task R11-04: Canonicalize resilient URL state

**Description:** Preserve shareable matrix links while normalizing invalid state and preventing fragment exceptions or duplicate history entries.

**Acceptance criteria:**

- [x] Invalid `domain`, `view` and whitespace-only `q` values are replaced with canonical URL state.
- [x] Malformed percent-encoded fragments never throw and resolve to a safe canonical location.
- [ ] A single user state change produces at most one intended history entry; Back and Forward restore state.

**Verification:**

- [x] Focused URL regression checks in `scripts/validate_ui.mjs`.
- [ ] Browser tests for valid links, invalid parameters, malformed fragments and Back/Forward.

**Dependencies:** R11-03

**Files likely touched:** `app.js`, `scripts/validate_ui.mjs`

**Estimated scope:** Small

### Task R11-05: Preserve mobile navigation focus

**Description:** Keep keyboard and switch users oriented at domain boundaries and after same-page mobile navigation.

**Acceptance criteria:**

- [x] Previous-at-domain-2 and next-at-domain-8 transfer focus to the remaining enabled boundary control.
- [x] Same-page mobile-menu activation closes the details navigation before moving to the target.
- [ ] Back/Forward restoration moves focus only when appropriate and never traps the user.

**Verification:**

- [ ] Keyboard browser checks at 320 and 390 pixels.
- [x] `node scripts/validate_ui.mjs`

**Dependencies:** R11-04

**Files likely touched:** `app.js`, `scripts/validate_ui.mjs`

**Estimated scope:** Small

### Task R11-06: Close print and mobile accessibility defects

**Description:** Correct white-on-white print text and ensure primary mobile controls meet the target size.

**Acceptance criteria:**

- [ ] All hero, metadata, navigation and matrix text remains readable in print preview.
- [ ] Primary mobile interactive controls have a minimum 44-by-44-pixel target at 320 and 390 pixels.
- [ ] Focus indication and reduced-motion behavior remain intact.

**Verification:**

- [ ] Print preview and PDF inspection for every public HTML page.
- [ ] Browser geometry and keyboard checks at 320, 390, 768 and 1440 pixels.

**Dependencies:** R11-03

**Files likely touched:** `styles.css`, `index.html`, `framework.html`

**Estimated scope:** Small

### Task R11-07A: Align evidence and source terminology

**Description:** Keep public layer names, evidence scope and material source metadata consistent without implying entry-level proof.

**Acceptance criteria:**

- [x] Documents use Threat sources, Risks & failure modes, and Controls & actions as the current public layers.
- [x] Evidence is described as domain context and, where explicitly mapped, phase context.
- [x] The World Bank record uses the complete title and 2024 final-release status.

**Verification:**

- [x] `rg` consistency audit finds no contradictory evidence-scope or terminology claim.
- [x] `python3 scripts/validate_project.py` and `node scripts/validate_ui.mjs` pass after the current integrated changes.

**Dependencies:** R11-01 and R11-02 for final identifier wording

**Files likely touched:** `README.md`, `FACT-CHECK.md`, `CONTENT-REVIEW.md`, `SOURCE-LIBRARY.md`

**Estimated scope:** Medium

### Task R11-07B: Align privacy and release status

**Description:** Distinguish application-side persistence from URL/log exposure and keep candidate publication controls truthful.

**Acceptance criteria:**

- [x] URL state exposure through browser history, copied links and hosting or access logs is explicit.
- [x] `v1.0.0` remains the public citation version and `v1.1.0` is identified as an unpublished candidate.
- [x] Release-owner approval precedes merge and a separate protected-environment approval precedes deployment.

**Verification:**

- [x] `rg` consistency audit finds no contradictory persistence, version or publication claim.
- [x] `python3 scripts/validate_project.py` passes after the current integrated changes.

**Dependencies:** None

**Files likely touched:** `ROADMAP.md`, `CHANGELOG.md`, `SECURITY.md`, `CITATION.cff`

**Estimated scope:** Medium

### Task R11-08: Build and validate one Pages artifact manifest

**Description:** Make the deployable `_site` directory the authoritative release surface.

**Acceptance criteria:**

- [ ] One version-scoped manifest controls the v1.1 artifact, includes every linked v1.1 public page, document and asset, and excludes planned v1.2–v1.5 runtime features.
- [x] Validation and smoke tests run against `_site`, not a more permissive repository-root server.
- [ ] Every v1.1 public route, asset, document and representative deep link returns the expected response from the release-scoped artifact.

**Verification:**

- [ ] `node scripts/site.mjs build _site` and `node scripts/site.mjs smoke <base-url>` are used by `.github/workflows/pages.yml`; the completed run must use the v1.1-scoped manifest.
- [ ] Missing-manifest-file mutation makes the artifact gate fail.

**Dependencies:** R11-03, R11-07A, R11-07B

**Files likely touched:** `.github/workflows/pages.yml`, `scripts/validate_project.py`, artifact manifest or assembly script

**Estimated scope:** Medium

### Task R11-09: Bind link and W3C gates to the release SHA

**Description:** Make HTML and source reachability evidence reproducible for the exact candidate being published.

**Acceptance criteria:**

- [x] External-link validation runs for each publishing `main` SHA and reports restricted URL, status and final destination.
- [x] W3C Nu runs locally in CI at a version and checksum pinned in the repository.
- [ ] All four v1.1 HTML files (`index.html`, `framework.html`, `acknowledgements.html` and `404.html`) have zero error-level messages.

**Verification:**

- [ ] Parse all workflow YAML and confirm every Action is SHA-pinned.
- [ ] `python3 scripts/validate_project.py --check-links` and the local Nu command pass on the candidate artifact.

**Dependencies:** R11-08

**Files likely touched:** `.github/workflows/links.yml`, `.github/workflows/validate.yml`, validation tooling

**Estimated scope:** Medium

### Task R11-09A: Isolate deployment authority and harden validation downloads

**Description:** Close the reviewed deployment-script, download-address and mutable-cache boundaries while retaining local, checksum-pinned HTML validation.

**Acceptance criteria:**

- [x] The protected Pages/OIDC job has no checkout, repository scripts or general shell step; only the pinned deployment action executes with write permissions.
- [x] Exact-SHA/current-main checks run in a separate read-only job, and production route smoke tests run in a separate read-only post-deployment job.
- [x] Documentation identifies the pre-approval current-main check as an observation rather than an atomic freshness lock, and a post-deployment smoke failure does not imply automatic rollback.
- [x] The official versioned `vnu-jar@26.8.30` tarball has exact-size, SHA-256 and SHA-512 pins; bounded extraction admits the exact regular-file archive set and verifies the originally reviewed JAR bytes without package installation or lifecycle scripts.
- [x] Nu executes a verified private per-run read-only JAR rather than reopening a mutable shared-cache path.
- [x] Nu and external-source redirect/DNS checks reject non-public destinations and bind connections to validated addresses.
- [ ] All four public HTML documents pass the completed local Nu gate on the candidate artifact.
- [ ] Independent security review accepts the final integrated diff before publication.

**Verification:**

- [x] `node --test scripts/test_validate_html.mjs` passes all 16 controlled download, extraction and cache checks.
- [x] `python3 scripts/test_validate_project_links.py` passes all 21 controlled endpoint/redirect checks.
- [ ] Integrated workflow validation, artifact build and browser smoke evidence names the final candidate.

**Dependencies:** R11-08 and R11-09

**Files likely touched:** `.github/workflows/pages.yml`, validator scripts/tests, `scripts/site-manifest.json` and release-control documentation

**Estimated scope:** Medium

### Task R11-10: Harden final-SHA workflow evidence

**Description:** Ensure deployment cannot rely on stale workflow success, omit published scripts from checks or lose evidence during transient API and concurrency failures.

**Acceptance criteria:**

- [ ] Only the newest run attempt for each required final-SHA workflow can satisfy the gate; pending, cancelled or failed newer attempts never fall back to older success.
- [ ] GitHub API reads retry bounded transient failures, external-link scheduling cannot deadlock the deployment wait, and a final evidence summary is emitted on failure.
- [ ] Quality and Pages syntax/contract checks cover every published v1.1 runtime file, enforce its four-file HTML set and the 150,000-byte gzip budget; `assessment.html` increases the set to five only when v1.2 enters release scope.

**Verification:**

- [ ] `node scripts/verify_workflow_runs.mjs --self-test` includes mixed old-success/new-pending, new-failed, rerun and transient-error cases.
- [ ] Workflow YAML parses, Actions remain SHA-pinned and the integrated artifact pipeline passes.

**Dependencies:** R11-08, R11-09

**Files likely touched:** `scripts/verify_workflow_runs.mjs`, workflow definitions, `scripts/site-manifest.json`, `scripts/site.mjs`

**Estimated scope:** Medium

## Checkpoint CP-1: v1.1 local candidate

- [ ] Evidence record names the candidate SHA, run date, environment and reviewer.
- [ ] `git diff --check`
- [ ] JavaScript syntax checks pass for every runtime and validator entry point.
- [ ] `node scripts/validate_data.mjs`
- [ ] `node scripts/validate_ui.mjs`
- [ ] `node scripts/validate_mitigation_tools.mjs` and `node scripts/validate_mitigation_tools_ui.mjs`
- [ ] `node scripts/test_action_brief.mjs`, `node --test scripts/test_validate_html.mjs` and `python3 scripts/test_validate_project_links.py`
- [ ] `python3 scripts/validate_project.py`
- [ ] Mutation checks prove the new gates fail for the intended defects.
- [ ] Every mitigation disclosure, tool-text search result and expanded print representation passes browser and accessibility review at the applicable viewport sizes.
- [ ] Phase filtering, canonical-ID search, cross-domain action selection, owner/horizon changes, page-lifetime clearing and unencrypted Markdown/print warnings pass browser review.
- [ ] The mitigation-tool human review record covers all 180 mappings and 360 records; heuristic vendor and claim-pattern screening is not treated as expert approval.
- [ ] Browser, keyboard, no-JavaScript, print, reduced-motion and error-state review passes at 320, 390, 768 and 1440 pixels.
- [ ] Fresh-context code, security and accessibility review finds no open P1 or P2 issue.

## Checkpoint CP-2: v1.1 release artifact

- [ ] Evidence record names the candidate SHA, artifact checksum and workflow run URLs.
- [ ] The assembled `_site` artifact passes project, W3C, link and route validation.
- [ ] Quality, source-link and Pages workflows identify the same candidate SHA.
- [ ] Release metadata is internally consistent while still identifying `v1.0.0` as public before publication.
- [ ] External gates E11-01 through E11-06 have recorded evidence.

## v1.2.0 — Local assessment workspace

### Task R12-01: Lock the assessment schema and calculations

**Description:** Define the versioned 45-cell plaintext document and pure summary calculations.

**Acceptance criteria:**

- [ ] The document uses `{schema:"csm-assessment", schemaVersion:1, frameworkVersion, overlay, createdAt, updatedAt, cells}` with exactly 45 `domainId.phaseId` cells.
- [ ] Each cell validates maturity, the three confidence components and bounded text fields exactly as documented.
- [ ] Maturity, confidence and coverage calculations are deterministic and remain separate.

**Verification:**

- [ ] `node scripts/validate_assessment.mjs`
- [ ] Boundary tests cover nulls, 0, 4, invalid ranges, missing cells and text limits.

**Dependencies:** CP-2

**Files likely touched:** `assessment-model.js`, `scripts/validate_assessment.mjs`

**Estimated scope:** Small

### Task R12-02: Build the in-memory 45-cell workflow

**Description:** Let a user navigate and edit every assessment cell without automatic persistence.

**Acceptance criteria:**

- [ ] All 45 cells can be selected and edited with visible labels, instructions and completion state.
- [ ] Inputs never write to URL, cookies, Web Storage, IndexedDB or the network.
- [ ] Reloading or closing the page discards unsaved in-memory state after a clear warning.

**Verification:**

- [ ] Browser workflow and negative storage/network inspection.
- [ ] `node scripts/validate_assessment.mjs`

**Dependencies:** R12-01

**Files likely touched:** `assessment.html`, `assessment.js`, `assessment.css`

**Estimated scope:** Medium

### Task R12-03: Make assessment navigation accessible

**Description:** Provide keyboard, screen-reader, mobile and reduced-motion operation for the heatmap and editor.

**Acceptance criteria:**

- [ ] The heatmap communicates domain, phase, maturity, confidence and completion without color alone.
- [ ] Keyboard focus order and announcements remain predictable through all 45 cells.
- [ ] The workflow remains usable at 320, 390, 768 and 1440 pixels and 200% zoom.

**Verification:**

- [ ] Keyboard and accessibility-tree review plus automated accessibility scan.
- [ ] Browser geometry and reduced-motion checks.

**Dependencies:** R12-02

**Files likely touched:** `assessment.html`, `assessment.js`, `assessment.css`

**Estimated scope:** Medium

### Task R12-04: Add executive summary and browser-print report

**Description:** Turn current in-memory responses into a candid leadership view without inventing a risk score.

**Acceptance criteria:**

- [ ] Show maturity, confidence, coverage, distribution, weakest phase, heatmap and prioritized actions separately.
- [ ] Results below 45/45 coverage are visibly marked incomplete.
- [ ] The HTML and browser-print report remain accessible and include framework and overlay provenance.

**Verification:**

- [ ] Golden calculation scenarios in `scripts/validate_assessment.mjs`.
- [ ] Print preview and PDF inspection at complete and incomplete coverage.

**Dependencies:** R12-03

**Files likely touched:** `assessment.html`, `assessment.js`, `assessment.css`

**Estimated scope:** Medium

### Task R12-05: Implement the encrypted container primitives

**Description:** Implement a testable Web Crypto boundary for explicit continuation-file export and import.

**Acceptance criteria:**

- [ ] The container is `{header,ciphertext}` and uses PBKDF2-HMAC-SHA-256 at 600,000 iterations with a 16-byte salt and AES-256-GCM with a 12-byte IV and 128-bit tag.
- [ ] Format, schema and algorithm parameters are authenticated as additional data.
- [ ] Passphrases and derived keys are never persisted or returned to application state.

**Verification:**

- [ ] Round-trip and deterministic metadata tests in `scripts/validate_assessment.mjs`.
- [ ] Fresh-context cryptographic review against the accepted threat model.

**Dependencies:** R12-01 and accepted assessment threat model

**Files likely touched:** `assessment-crypto.js`, `scripts/validate_assessment.mjs`

**Estimated scope:** Medium

### Task R12-06: Add fail-closed import and export UX

**Description:** Connect the crypto boundary to explicit user actions without partial imports.

**Acceptance criteria:**

- [ ] Export produces `*.csm-assessment.json`; import accepts at most 1 MiB and commits state only after complete authentication and schema validation.
- [ ] Incorrect passphrases, tampering and unknown versions produce clear errors without changing current state.
- [ ] When Web Crypto is unavailable, import and export are disabled while assessment and print remain usable.

**Verification:**

- [ ] Tests cover round-trip, wrong password, changed header/ciphertext, oversize and unknown schema.
- [ ] Browser check confirms no passphrase or assessment content reaches storage, URL or network.

**Dependencies:** R12-04, R12-05

**Files likely touched:** `assessment.html`, `assessment.js`, `assessment-crypto.js`, `scripts/validate_assessment.mjs`

**Estimated scope:** Medium

## Checkpoint CP-3: v1.2 core and persistence

- [ ] Evidence record names the candidate SHA, browser matrix, accessibility reviewer and threat-model decision.
- [ ] Assessment validator and all existing project gates pass.
- [ ] Threat model and privacy review are accepted and match the implementation.
- [ ] Keyboard, screen-reader, mobile, print, reduced-motion and Web-Crypto-unavailable paths pass.
- [ ] No runtime dependency, automatic persistence or assessment-data network request exists.
- [ ] External gate E12-01 has recorded evidence before release.

## v1.3.0 — EU–Finland overlay pilot

### Task R13-01: Lock the overlay schema and validator

**Description:** Define a versioned, context-only overlay contract separate from core matrix content.

**Acceptance criteria:**

- [ ] `matrixOverlays` schema version `1.0.0` validates the `eu-fi` `0.1.0-pilot` record and its EU/FI scope.
- [ ] Every annotation declares kind, context relationship, domain, phases, jurisdictions, applicability, effective/status/review data, authority and official sources.
- [ ] Entry-level mappings default to false and pilot annotations contain no unverified entry identifiers.

**Verification:**

- [ ] `node scripts/validate_overlays.mjs`
- [ ] Mutation tests reject copied core text, non-official sources, unknown identifiers and missing applicability fields.

**Dependencies:** R11-01, R11-02

**Files likely touched:** `matrix-overlays.js`, `scripts/validate_overlays.mjs`, `OVERLAY-EU-FI.md`

**Estimated scope:** Medium

### Task R13-02: Curate the three-domain pilot

**Description:** Populate context annotations for cyber, occupational safety and environmental/hazardous-material domains from official EU and Finnish sources.

**Acceptance criteria:**

- [ ] The pilot covers all three named domains and distinguishes EU law, Finnish law, authority guidance and voluntary standards.
- [ ] Every statement is traceable to an official URL and has a bounded applicability summary.
- [ ] No text claims certification, guaranteed compliance or universal applicability.

**Verification:**

- [ ] Overlay validator and source-library parity pass.
- [ ] Source-by-source editorial review is recorded without claiming external specialist approval.

**Dependencies:** R13-01

**Files likely touched:** `matrix-overlays.js`, `OVERLAY-EU-FI.md`, `SOURCE-LIBRARY.md`

**Estimated scope:** Medium

### Task R13-03: Add overlay selection and report provenance

**Description:** Expose the pilot as optional context in the matrix and assessment without mixing it into core synthesis.

**Acceptance criteria:**

- [ ] `overlay=eu-fi` selects the pilot and invalid values canonicalize safely.
- [ ] Overlay context is visually and semantically distinct from core entries and carries the legal-context disclaimer.
- [ ] Assessment reports include core and overlay versions while assessment answers stay out of URLs.

**Verification:**

- [ ] URL, accessibility and browser tests for overlay off, valid pilot and invalid value.
- [ ] Existing links without `overlay` remain backward compatible.

**Dependencies:** R12-04, R13-02

**Files likely touched:** `app.js`, `assessment.js`, `index.html`, `assessment.html`, `styles.css`

**Estimated scope:** Medium

## Checkpoint CP-4: v1.3 pilot

- [ ] Evidence record names the candidate SHA, overlay version, source-review date and parity output.
- [ ] Overlay schema, parity, UI, report provenance and existing project gates pass.
- [ ] All pilot sources are official, current and traceable at the review date.
- [ ] External gate E13-01 has three recorded specialist approvals before release.

## v1.4.0 — Executive reporting and change tracking

### Task R14-01: Load two snapshots without persistence

**Description:** Authenticate baseline and current files independently and keep both only in memory.

**Acceptance criteria:**

- [ ] Each file passes the complete R12 import boundary before comparison begins.
- [ ] Incompatible framework or schema versions produce an explicit non-destructive error.
- [ ] Clearing the comparison releases both plaintext snapshots and derived views.

**Verification:**

- [ ] Dual-file round-trip, mismatch and clear-state tests.
- [ ] Browser storage and network inspection remains empty.

**Dependencies:** R12-06

**Files likely touched:** comparison model, comparison UI, assessment crypto adapter

**Estimated scope:** Medium

### Task R14-02: Calculate and present cell deltas

**Description:** Compare maturity, confidence and action state without hiding coverage changes.

**Acceptance criteria:**

- [ ] Improved, regressed, unchanged and newly assessed cells are calculated deterministically.
- [ ] Coverage differences remain visible and are not interpreted as maturity improvement.
- [ ] The view lists open critical gaps and next actions with owner roles.

**Verification:**

- [ ] Golden comparison scenarios and incomplete-baseline cases.
- [ ] Keyboard and screen-reader review of delta semantics.

**Dependencies:** R14-01

**Files likely touched:** comparison model, comparison UI, comparison tests

**Estimated scope:** Medium

### Task R14-03: Produce the board-ready comparison report

**Description:** Generate an accessible summary with no more than five prioritized findings.

**Acceptance criteria:**

- [ ] The report includes decisions required, owner roles and framework and overlay versions.
- [ ] Findings are selected by documented deterministic rules and never imply a synthetic risk score.
- [ ] HTML and print output remain accessible without cloud or PowerPoint dependencies.

**Verification:**

- [ ] Golden report scenarios and print inspection.
- [ ] Accessibility and content review of ranking explanations.

**Dependencies:** R14-02

**Files likely touched:** comparison UI, report styles, comparison tests

**Estimated scope:** Medium

## v1.5.0 — Content operations and maintainability

### Task R15-01: Add source lifecycle records

**Description:** Track source replacement and review ownership without deleting history.

**Acceptance criteria:**

- [ ] Each source can record current, superseded or withdrawn status, predecessor/successor, owner, last review and next review.
- [ ] Runtime and source-library representations remain in parity.
- [ ] Overdue and broken official records fail or warn according to documented severity.

**Verification:**

- [ ] Source lifecycle and parity tests.
- [ ] Mutation tests for orphaned successors and invalid dates.

**Dependencies:** R13-02

**Files likely touched:** `matrix-references.js`, `SOURCE-LIBRARY.md`, validation tooling

**Estimated scope:** Medium

### Task R15-02: Automate release-surface parity

**Description:** Prevent canonical, sitemap, artifact, workflow and live-route drift.

**Acceptance criteria:**

- [ ] Sitemap and canonical routes agree exactly.
- [ ] Artifact manifest and linked public surface agree exactly.
- [ ] Quality, links and Pages evidence is checked against one release SHA.

**Verification:**

- [ ] Local parity suite and artifact smoke test.
- [ ] Mutation cases fail for a missing route, wrong canonical and mismatched SHA.

**Dependencies:** R11-08, R11-09

**Files likely touched:** validation tooling, workflow definitions, sitemap

**Estimated scope:** Medium

### Task R15-03: Enforce the critical resource budget

**Description:** Keep the static product fast as assessment and overlay assets grow.

**Acceptance criteria:**

- [ ] Critical HTML, CSS, JavaScript and data total at most 150 kB gzip, excluding social-preview images.
- [ ] CI reports the contribution of each resource and fails unexplained overages.
- [ ] Any exception names an owner, reason, expiry and reduction plan.

**Verification:**

- [ ] Reproducible gzip budget command runs against `_site`.
- [ ] Intentional overage mutation fails.

**Dependencies:** R15-02

**Files likely touched:** resource-budget validator, workflow definition, development documentation

**Estimated scope:** Small

### Task R15-04: Establish review cadence and expansion decision

**Description:** Turn accessibility, browser, source and security maintenance into owned recurring evidence.

**Acceptance criteria:**

- [ ] Quarterly and annual review templates identify owner, inputs, findings and next-review date.
- [ ] The six-domain overlay expansion proceeds only with all pilot approvals and no material applicability defect.
- [ ] A failed expansion gate produces a correction-and-calibration release scope.

**Verification:**

- [ ] Maintainer review of cadence records and expansion decision evidence.
- [ ] Roadmap status reflects the actual decision without claiming future work complete.

**Dependencies:** CP-4, R15-01, R15-03

**Files likely touched:** maintenance documentation and overlay review records

**Estimated scope:** Small

## Checkpoint CP-5: v1.4–v1.5

- [ ] Evidence record names the candidate SHA, comparison fixtures, budget result and research records.
- [ ] Comparison, report, source lifecycle, parity and resource-budget tests pass.
- [ ] External gate E14-01 has recorded usability-study evidence.
- [ ] External gate E15-01 records the overlay expansion or calibration decision.

## v2.0 — Research decision only

### Task R20-01: Evaluate the backend decision gate

**Description:** Decide whether centralized collaboration merits a separately approved v2 architecture project.

**Acceptance criteria:**

- [ ] At least 20 organization interviews identify a specific unmet multi-user or centralized-history need.
- [ ] Evidence compares that need with the local encrypted-file model and shows why it is insufficient.
- [ ] Privacy impact, threat, cost and operational models define testable tenant, authorization, audit, export, retention and deletion guarantees.

**Verification:**

- [ ] Product, privacy, security and release owners sign the decision record.
- [ ] If any criterion fails, the accepted decision is to continue the static v1.x architecture.

**Dependencies:** CP-5

**Files likely touched:** research synthesis and a new proposed architecture decision record only

**Estimated scope:** Medium

## External gates — evidence required

These items cannot be completed by repository edits or agent assertions.

### v1.1.0

- [ ] **E11-01:** A three-discipline external panel accepts the high-consequence content after material findings are resolved; reviewer, scope, date, findings and disposition are recorded.
- [ ] **E11-02:** Read-only Gemini CLI review is explicitly authorized; command, model, version, sandbox, input SHA and output are recorded and blockers resolved.
- [ ] **E11-03:** Repository administrator enables the required branch ruleset and records the settings evidence.
- [ ] **E11-04:** Repository administrator protects `github-pages` with required release-owner approval after build validation and before deployment, with no self-approval when supported.
- [ ] **E11-05:** Release owner approves the release pull request before merge, separately approves the protected production deployment, then authorizes the tag and GitHub Release after live verification.
- [ ] **E11-06:** Named competent human reviewers assess all 360 mitigation implementation aids for semantic fit, practical use, hidden vendor specificity and applicable legal, compliance, privacy and professional constraints; reviewer, domain scope, date, findings and disposition are recorded.

### v1.2.0

- [ ] **E12-01:** Six security leaders perform the assessment and report tasks; at least 80% of core tasks succeed without guidance and findings are triaged.

### v1.3.0

- [ ] **E13-01:** Security/governance, safety/life-safety and environment/hazardous-material specialists each approve their pilot scope and dispositions.

### v1.4.0

- [ ] **E14-01:** Twelve participants across three organization sizes or contexts complete the study; at least 80% meet all three comprehension and report tasks.

### v1.5.0

- [ ] **E15-01:** Product and domain owners record whether the pilot evidence permits six-domain expansion or requires correction and calibration.

### v2.0

- [ ] **E20-01:** Twenty organization interviews and the product decision record are complete.
- [ ] **E20-02:** Privacy, security, cost and operational owners accept the proposed guarantees before any backend implementation is planned.
