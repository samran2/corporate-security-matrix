# Corporate Security Matrix Roadmap

Last updated: August 28, 2026

Current release target: `v1.0.0`
Product status: public-release candidate

This roadmap is the operating plan for taking the Corporate Security Matrix from a strong static product to a dependable, professionally governed GitHub release. It combines product work, content assurance, repository governance, deployment and post-release ownership in one place.

## Release standard

A release is complete only when it is:

- useful without explanation;
- visually deliberate at desktop and mobile widths;
- fully keyboard operable and compatible with reduced-motion preferences;
- honest about scope, limitations and source applicability;
- deterministic to validate from a clean checkout;
- safe to publish as a static site;
- deployed, smoke-tested and recoverable; and
- versioned with an immutable tag and release notes.

Status key:

- `[x]` complete in the release candidate
- `[ ]` required before or immediately after publication
- `[~]` intentionally scheduled for a later release

## v1.0.0 — Public foundation

### 1. Product identity and experience

- [x] Establish a distinct Corporate Security Matrix identity and remove stale project naming.
- [x] Ship one restrained visual system across the matrix, framework, acknowledgements and error page.
- [x] Provide a premium responsive hero, product narrative and clear primary actions.
- [x] Present all nine domains in an immediately scannable desktop selector.
- [x] Provide a touch-native mobile domain selector with the active domain kept in view.
- [x] Support domain search and decision-layer filtering.
- [x] Provide correct roving-tabindex and arrow-key behavior for tabs and radio controls.
- [x] Encode domain, decision layer and search state in a shareable URL.
- [x] Support browser Back and Forward navigation.
- [x] Provide a copyable link to the current matrix view.
- [x] Provide a single-column mobile matrix and a readable print layout.
- [x] Respect `prefers-reduced-motion` in CSS and JavaScript behavior.
- [x] Provide visible focus states and minimum 44-pixel primary touch targets.
- [x] Provide a compact accessible mobile navigation menu.
- [x] Add a favicon, Apple touch icon and a purpose-built 1200×630 social card.

### 2. Content and evidence quality

- [x] Align domain names across the interface, README and source library.
- [x] Use one public vocabulary for actors or failure sources, risks and mitigations.
- [x] Validate nine domains, five phases and 46 domain-level source mappings in code.
- [x] Add stable identifiers to every visible matrix entry.
- [x] Label source scope as international, European Union or United States guidance.
- [x] Document the Finland-specific EK comparator separately from the governing source base.
- [x] Replace broken or retired source URLs before publication.
- [x] Publish verification method, date, limitations and automated-link-check behavior.
- [x] Publish a non-normative operating framework for ownership, maturity, evidence confidence and cadence.
- [x] State clearly that the model does not replace law, certified engineering, emergency procedures or professional judgment.
- [ ] Complete an independent subject-matter review of the highest-consequence life-safety, occupational-safety and hazardous-material guidance after publication.
- [~] Add entry-level source and clause traceability in `v1.1.0`; `v1.0.0` is explicitly domain-mapped.

### 3. Accessibility, security and technical quality

- [x] Use semantic landmarks, headings, lists, tabs, tabpanels and radio-group semantics.
- [x] Add skip links, live result feedback and new-tab announcements.
- [x] Meet WCAG AA contrast for body text, metadata and focus indicators.
- [x] Remove inline styles and keep the strict self-hosted Content Security Policy.
- [x] Avoid third-party JavaScript, analytics, cookies and Web Storage.
- [x] Render user-controlled search text only through `textContent`.
- [x] Use `noopener noreferrer` for links that open a new tab.
- [x] Validate internal paths, element IDs, ARIA relationships and security-sensitive source patterns.
- [x] Validate the data model in an isolated Node.js context.
- [x] Pin every GitHub Action to an immutable commit SHA.
- [x] Use least-privilege workflow permissions and explicit timeouts.
- [x] Separate deterministic pull-request validation from scheduled network checks.
- [x] Retry transient network failures while continuing to fail on persistent broken links.
- [x] Pass JavaScript syntax, Python compilation, YAML parsing, project validation and W3C HTML error checks.
- [x] Pass local HTTP smoke tests for every shipped page, script, stylesheet and image.
- [ ] Record a final production-browser console check after GitHub Pages deployment.

### 4. Repository professionalism

- [x] Replace aspirational README claims with shipped functionality.
- [x] Add `FRAMEWORK.md`, `CHANGELOG.md`, `CITATION.cff` and a complete source library.
- [x] Add contribution, security and conduct guidance.
- [x] Add pull-request and content-correction issue templates.
- [x] Add Dependabot configuration for GitHub Actions.
- [x] Add canonical metadata, Open Graph metadata, Twitter card metadata, `robots.txt` and `sitemap.xml`.
- [x] Add a resilient project-aware `404.html`.
- [x] Add this roadmap and make it discoverable from the README.
- [x] Document the optional agent-assisted workflow and its verified skill baseline.
- [ ] Set the GitHub repository description, homepage and topics.
- [ ] Enable private vulnerability reporting in repository settings.
- [ ] Add a branch ruleset requiring the `Quality` workflow for pull requests after the first release is stable.
- [ ] Review and close or supersede stale test pull requests and branches without deleting active work.

### 5. GitHub Pages and release publication

- [ ] Enable GitHub Pages with GitHub Actions as the build source.
- [x] Add a least-privilege Pages build and deployment workflow.
- [x] Validate the release candidate before packaging the Pages artifact.
- [x] Smoke-test the deployed home page and framework page in the deployment job.
- [ ] Push the reviewed release commit to `main`.
- [ ] Confirm the `Quality`, `External source links` and `Publish GitHub Pages` workflows.
- [ ] Verify the production home page, framework, acknowledgements, 404 handling, assets and deep links.
- [ ] Confirm canonical URLs, sitemap and social-preview image return HTTP 200.
- [ ] Create and push the signed or annotated `v1.0.0` tag.
- [ ] Publish a GitHub Release from `CHANGELOG.md` with upgrade and verification notes.
- [ ] Confirm the repository homepage points to the live Pages URL.

## Required release gates

| Gate | Blocking requirement | Evidence |
| --- | --- | --- |
| Source integrity | 9 domains, 5 phases, 46 complete HTTPS source mappings | `node scripts/validate_data.mjs` |
| Release surface | Required files, internal paths, CSP, ARIA links and safe DOM patterns pass | `python3 scripts/validate_project.py` |
| External evidence | No persistent broken source URL | `python3 scripts/validate_project.py --check-links` |
| Syntax | All JavaScript and Python entry points compile | `node --check …`, `python3 -m py_compile …` |
| Workflow integrity | All workflow YAML parses and Actions are SHA-pinned | local YAML parse + code review |
| HTML | Zero W3C error-level messages across all public HTML documents | W3C Nu validation |
| Responsive UX | Desktop, tablet and mobile matrix controls remain readable and operable | 1440×900, 768×1024 and 390×844 review |
| Accessibility | Keyboard flow, focus, reduced motion, contrast and live feedback pass | manual release checklist |
| Privacy and security | No third-party scripts, storage, dynamic HTML injection or secret material | validator + security review |
| Deployment | Pages workflow succeeds and production smoke tests return HTTP 200 | GitHub Actions + production checks |
| Versioning | Commit, tag, changelog, citation and GitHub Release all agree | `v1.0.0` release audit |

Any failed blocking gate stops publication. A restricted automated response from an official source host (`401`, `403` or `429`) is recorded for human review but is not treated as a broken link by itself.

## Publication runbook

1. Freeze content changes and review the complete staged diff.
2. Run all deterministic and external-link checks from a clean working tree.
3. Run desktop, tablet and mobile visual and keyboard QA.
4. Confirm repository secrets, tokens and personal data are absent.
5. Enable GitHub Pages with GitHub Actions as the source.
6. Commit the release candidate with a concise release message.
7. Push `main` and wait for the `Quality` and Pages workflows to complete.
8. Smoke-test the production URLs and browser console.
9. Update repository description, homepage and topics.
10. Create the `v1.0.0` tag and GitHub Release only after production verification.
11. Record any release exception in the GitHub Release notes and create an owned follow-up issue.

## Rollback plan

If the production site fails a release gate after deployment:

1. Stop tag and release creation if they have not occurred.
2. Identify the last known-good commit from the Pages deployment history.
3. Prepare a normal revert commit; do not rewrite shared history.
4. Push the revert to `main` and let the same validation and Pages workflows deploy it.
5. Verify production again and document the incident and corrective action.
6. If the issue is limited to one source link or content statement, prefer a forward fix over a broad rollback.

## Post-release operations

### First 24 hours

- [ ] Recheck the production Pages URL, framework, social image, sitemap and representative deep link.
- [ ] Confirm no workflow regression or deployment warning is unresolved.
- [ ] Confirm the GitHub Release and citation metadata show the same version and date.

### First 7 days

- [ ] Triage accessibility, factual-correction and source-link reports.
- [ ] Review GitHub traffic only at aggregate repository level; do not add product analytics for this release.
- [ ] Convert accepted release findings into owned issues with severity, scope and target release.

### Ongoing cadence

- Weekly: automated external-source link check.
- Monthly: dependency and workflow maintenance review.
- Quarterly: content-risk, accessibility and browser-compatibility review.
- Annually or after material change: full framework and source re-baseline.
- After every major incident, regulation change or source revision: targeted domain review.

## Planned releases

### v1.1.0 — Traceability and practitioner workflow

- [~] Map each material entry to one or more source records and, where licensing permits, clause or section references.
- [~] Add source version, review date, reviewer status and applicability metadata.
- [~] Add printable domain briefs and CSV/JSON export without introducing a backend.
- [~] Add stable fragment links for individual matrix entries.
- [~] Add a documented content-review workflow and reviewer sign-off record.

### v1.2.0 — Sector and jurisdiction overlays

- [~] Define a schema for sector, organization-size and jurisdiction overlays.
- [~] Pilot one high-quality overlay before adding broad coverage.
- [~] Add applicability filters without presenting advisory guidance as law.
- [~] Add translations only with named human review, glossary control and full parity tests.

### v2.0.0 — Assessment workspace, only if justified

- [~] Validate demand through practitioner research before adding accounts or persistence.
- [~] Threat-model any backend, identity, collaboration or evidence-upload feature before implementation.
- [~] Separate public reference content from private organizational assessment data.
- [~] Provide export, retention, deletion, audit and access-control guarantees before accepting sensitive information.

## Decision ownership

- **Product direction:** prioritizes user value and release scope.
- **Editorial owner:** accepts terminology, source and applicability changes.
- **Domain reviewer:** challenges high-consequence guidance within their professional discipline.
- **Technical maintainer:** owns validation, accessibility, security and deployment integrity.
- **Release owner:** confirms every gate, publishes the release and coordinates rollback when needed.

One person may hold multiple roles in a small project, but every release decision must still have a named owner and recorded evidence.

## Definition of done

The complete GitHub update is done when the release commit is on `main`, required workflows are green, GitHub Pages is live and verified, repository metadata is complete, `v1.0.0` is tagged and published, release documentation agrees, and no unresolved blocker remains in this roadmap.
