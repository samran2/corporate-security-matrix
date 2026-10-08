# Development Guide

This repository is a dependency-free static product. Its optional agent-assisted development workflow uses the open [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) collection to reinforce planning, implementation, testing, review and release discipline.

The skills are development tooling, not a runtime dependency. The public site must continue to work without Codex, an agent, Node packages or a build service.

## Installed skill baseline

The development environment was verified with all 24 upstream skills at revision:

```text
f63ec56a3cc936408d792956ae583c3c96a825bd
```

Installed skills:

- `api-and-interface-design`
- `browser-testing-with-devtools`
- `ci-cd-and-automation`
- `code-review-and-quality`
- `code-simplification`
- `context-engineering`
- `debugging-and-error-recovery`
- `deprecation-and-migration`
- `documentation-and-adrs`
- `doubt-driven-development`
- `frontend-ui-engineering`
- `git-workflow-and-versioning`
- `idea-refine`
- `incremental-implementation`
- `interview-me`
- `observability-and-instrumentation`
- `performance-optimization`
- `planning-and-task-breakdown`
- `security-and-hardening`
- `shipping-and-launch`
- `source-driven-development`
- `spec-driven-development`
- `test-driven-development`
- `using-agent-skills`

The seven shared upstream references are also required for complete internal links:

- accessibility checklist
- project definition of done
- observability checklist
- orchestration patterns
- performance checklist
- security checklist
- JavaScript and TypeScript testing patterns

## Codex installation

The upstream repository supports native Codex plugin installation:

```bash
codex plugin marketplace add addyosmani/agent-skills --ref f63ec56a3cc936408d792956ae583c3c96a825bd
codex plugin add agent-skills@agent-skills
```

The full commit SHA is intentional: it binds the marketplace snapshot to the reviewed baseline above before Codex loads its instructions. Start a new Codex session after installation so the skills are discovered. Review upstream changes before updating the pinned revision; development instructions can materially change agent behavior.

## Project workflow mapping

Use the smallest relevant skill set for the change:

| Work | Primary skills |
| --- | --- |
| New product capability | `spec-driven-development`, `planning-and-task-breakdown`, `incremental-implementation` |
| UI and responsive behavior | `frontend-ui-engineering`, `browser-testing-with-devtools` |
| Source or framework change | `source-driven-development`, `documentation-and-adrs` |
| Bug or failed validation | `debugging-and-error-recovery`, `test-driven-development` |
| Security-sensitive change | `security-and-hardening`, `doubt-driven-development` |
| Performance work | `performance-optimization`, `browser-testing-with-devtools` |
| Pull-request review | `code-review-and-quality`, `code-simplification` |
| GitHub release | `ci-cd-and-automation`, `git-workflow-and-versioning`, `shipping-and-launch` |

Skills guide the process; repository tests and release gates remain the source of truth. A skill must never be used to bypass the requirements in [ROADMAP.md](ROADMAP.md), weaken security controls or invent evidence.

## Mitigation-tool contract

The integrated candidate keeps implementation aids separate from the core `{ id, text, reviewState }` entry records. Three canonical fragments cover domains D01–D09; `matrix-tools.js` merges them into schema version `1.0.0`, keyed by all 180 canonical mitigation `M` identifiers. Every identifier must have exactly two `{ name, use }` records, for 360 records in total.

Load all three fragments and the aggregator before `app.js`. Missing, extra or malformed tooling must stop initialization before a plausible matrix renders. If the feature is included in a release manifest, all four files are an atomic set. The UI contract requires one visible limitation notice, native `details` disclosures with a 44-pixel summary target, search across both tool fields, safe 320-pixel wrapping and expanded print output. The tooling layer must not add vendor links, runtime network calls or browser storage.

`validate_mitigation_tools.mjs` and `validate_mitigation_tools_ui.mjs` are deterministic structural and bounded text-pattern gates. Their URL, vendor-name, endorsement and absolute-claim rules are intentionally defensive but cannot prove semantic suitability, practical availability, vendor neutrality in every market, safety or compliance. A named competent human must review every mapping and record the domain scope, date, findings and disposition before publication.

## Candidate phase filter and action brief

The unpublished candidate adds a public `phase` filter with `all`, `identify`, `protect`, `detect`, `respond` and `recover` values. Omitted or invalid values resolve to `all`; the canonical URL omits that default. Existing `domain`, `view` and `q` links retain their meaning. Phase changes participate in Back/Forward restoration and the keyboard-focus contract. Canonical entry IDs are searchable alongside entry text and implementation aids.

The action brief holds at most 12 unique reviewed canonical mitigation IDs across domains in memory. Public filters do not change the selection. Each action accepts an owner role from its own domain profile, or `Unassigned`, and a user-selected Now/Next/Later planning horizon. Selection order and horizons are planning choices, not risk severity, a risk ranking or prescribed deadlines. The default horizon is Next. No person names, free-text notes or assessment responses are collected by the brief.

Selections and role/horizon choices never enter URLs, history state, browser storage or network requests. Reloading or leaving the page clears the brief; `pagehide` also clears it before a page can return from browser navigation cache. Markdown and browser-print outputs carry the core framework version, exact entry IDs, implementation aids and each selected action's own phase-context sources. They are core-only outputs and explicitly state that jurisdiction overlays are not included. Source context remains distinct from entry-level proof.

Markdown downloads and print/Save as PDF create unencrypted copies of potentially sensitive priorities. Keep this warning visible before export and in the report. The print path must reset its temporary print mode after printing, cancellation or failure. `scripts/test_action_brief.mjs` covers the canonical catalog, uniqueness and capacity bounds, atomic role/horizon validation, cross-domain provenance and Markdown escaping; browser checks still establish focus, disclosure, no-script and print behavior.

## Local release checks

The default Pages artifact is explicitly scoped to `v1.1.0` in `scripts/site-manifest.json`. Later assessment, comparison, overlay and source-operations files remain available for development but are excluded from that allowlist. Mixed-version source sections use paired `csm-release-scope` markers; `scripts/site.mjs` removes only the manifest-declared future sections and fails closed for missing, malformed, nested or undeclared markers. Validate and upload the assembled `_site` directory only—never the repository root.

For `v1.1.0`, the assembled artifact contains exactly four HTML documents: `index.html`, `framework.html`, `acknowledgements.html` and `404.html`. A later feature may enter the release manifest only when its roadmap gate is complete and the release identity is updated deliberately.

```bash
git diff --check
node --check matrix-domains.js
node --check matrix-actors.js
node --check matrix-briefs.js
node --check matrix-references.js
node --check matrix-overlays.js
node --check matrix-tools-d01-d03.js
node --check matrix-tools-d04-d06.js
node --check matrix-tools-d07-d09.js
node --check matrix-tools.js
node --check assessment-model.js
node --check assessment-crypto.js
node --check assessment-compare.js
node --check assessment.js
node --check assessment-comparison.js
node --check app.js
node scripts/validate_data.mjs
node scripts/validate_data_contract.mjs
node scripts/validate_assessment.mjs
node scripts/validate_assessment_compare.mjs
node scripts/validate_source_register.mjs
node scripts/validate_source_register.mjs --test-mutations
node scripts/validate_overlays.mjs
node scripts/test_validate_overlays.mjs
node scripts/test_runtime_bootstrap.mjs
node scripts/validate_overlay_ui.mjs
node scripts/validate_mitigation_tools.mjs
node scripts/validate_mitigation_tools_ui.mjs
node scripts/test_action_brief.mjs
node scripts/validate_ui.mjs
node scripts/validate_workflows.mjs --self-test
node scripts/verify_workflow_runs.mjs --self-test
node scripts/test_site.mjs
node --test scripts/test_validate_html.mjs
python3 -m py_compile scripts/validate_project.py
python3 scripts/test_validate_project_links.py
python3 scripts/validate_project.py
node scripts/site.mjs build _site
node scripts/validate_html.mjs _site
python3 scripts/validate_project.py --check-links
```

The HTML gate downloads the official versioned `vnu-jar@26.8.30` npm tarball, using the exact URL, byte size, SHA-256 and SHA-512 integrity value pinned in `scripts/site-manifest.json`. It extracts the standalone JAR in memory with bounded decompression and an exact regular-file archive allowlist; it does not install the package or execute install/postinstall scripts. The extracted JAR retains the originally reviewed exact size, SHA-256 and upstream SHA-1. The optional cache is not the execution path: each invocation checks the bytes and creates a private, randomly named per-run directory containing a read-only JAR, then inspects and executes that copy with Java 17 or newer and removes it afterward. Project HTML is validated locally.

Nu downloads are restricted to the approved HTTPS registry host. Each redirect and DNS answer is checked, the connection is pinned to a vetted public address, and the exact download size is enforced while reading. The external-source checker also validates redirect destinations and public DNS addresses before connecting. Their regression suites use controlled fixtures rather than requests to private networks.

To exercise exactly the same public-route list used after deployment, serve the assembled `_site` directory on loopback and run:

```bash
node scripts/site.mjs smoke http://127.0.0.1:8000/
```

The smoke gate checks both the ordinary and cache-busted forms of `/` and `/index.html`, rejects redirects, stripped application-query state and soft 404s, and requires every response body to match its route-specific manifest file. Production requires two consecutive coherent whole-manifest sweeps and reports available CDN diagnostics. `.nojekyll` is retained in the artifact closure and digest but excluded from HTTP smoke checks because GitHub Pages consumes rather than serves that control file.

The workflow contract permits action references only in canonical block-style YAML and requires every external action to use a full 40-character commit SHA. Flow-map steps, multiline action references, explicit or quoted mapping keys, YAML tags, anchors, aliases and merge keys fail closed so alternate YAML spellings cannot bypass the pin check.

Only the checkout-free Pages deployment job receives `pages: write` and `id-token: write`; it runs the pinned deployment action. Repository scripts run in separate read-only release-gate and post-deployment smoke jobs. The current-main check happens before protected-environment approval and is an observation, not an atomic lock: `main` can advance while approval or deployment waits. Release reviewers must inspect the candidate SHA and the resulting workflow evidence.

Complete responsive, keyboard, reduced-motion and print review before a public release. The exact blocking gates and publication sequence are maintained in [ROADMAP.md](ROADMAP.md).

Branch protection, required environment reviewers and release authorization remain repository settings, not claims automation can establish. Configure and verify them using [RELEASE-CONTROLS.md](RELEASE-CONTROLS.md) before publication.

## Update policy

1. Review the upstream changelog and diff from the recorded revision.
2. Check for renamed skills, new shared references and changed tool requirements.
3. Replace the `--ref` value in the installation command with the reviewed full commit SHA, install into a fresh session and verify that all referenced support files resolve.
4. Run this repository's complete validation and visual QA.
5. Update the revision recorded in this file only after verification.

Do not vendor upstream skill files into this repository unless the project intentionally accepts the maintenance and licensing responsibility for a fork.
