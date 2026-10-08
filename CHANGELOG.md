# Changelog

All notable project changes are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses semantic versioning for public releases.

## Local development preview — 2026-10-09 (not a release)

- Added a separate draft corporate-security coverage workspace addressing the fifteen identified coverage gaps through eighteen topics, ninety lifecycle management checks and 180 vendor-neutral implementation aids.
- Added explicit applicability and justified exclusions, accountable roles, user-reported evidence judgments, critical gaps and next actions; all session data remains in memory and is cleared on page exit.
- Added six recommendation-only context profiles, five cross-domain tabletop scenarios, 27 official topic-context records and a self-contained printable leadership report with version and limitation notices.
- Preserved all 495 canonical matrix records, 59 core source records and the existing encrypted assessment contract. Related core links identify their own phase and are not asserted to be verified normative mappings.
- Added model, catalogue and UI regression gates, including fail-closed validation of the complete actor dataset, and excluded the draft workspace and its home-page link from the four-page v1.1 release artifact.

This is an unreleased development preview, not part of the public v1.0.0 site or the v1.1 artifact. Named professional content approval, full browser/print accessibility acceptance and release-owner authorization remain open. Development commits and draft pull requests do not constitute a release; no tag or deployment is claimed.

## [Unreleased] — v1.1.0 candidate, 2026-08-29

Publication is pending the remaining release gates, release-owner approval before merge and a separate protected-environment approval before deployment. No `v1.1.0` tag, production publication or GitHub Release is claimed by this entry.

The mitigation-tool and action-brief work below is an integrated development candidate. Named human content review and the remaining browser, HTML and release gates remain open; these capabilities are not part of the current public `v1.0.0` site. A development-branch update is separate from approval to merge, tag or deploy this candidate.

### Added

- Contextual original-source quick links for lifecycle phases, with clear separation between context evidence and entry-level proof
- Explicit source metadata for status, audience, jurisdiction, applicability and review date
- A durable content-review record covering all 9 domains and 495 visible entries
- Official guidance for employment screening, unmanned-aircraft awareness, supply-chain continuity, compliance management, whistleblowing, internal investigations, crisis management, business-impact analysis and occupational health
- A deterministic UI contract validator for public terminology, evidence links and no-script fallback
- A separate mitigation-tool dataset covering all 180 canonical Controls & actions identifiers with exactly two vendor-neutral implementation aids each, 360 `{ name, use }` records in total
- Fail-closed mitigation-tool data and UI gates, a visible limitation notice, accessible native disclosures, tool-aware search and expanded print output, with no vendor links or new runtime network or browser-storage behavior
- Lifecycle-phase filtering with public `phase` URL state, backward-compatible existing links, keyboard operation and Back/Forward restoration
- An in-memory action brief for up to 12 unique canonical controls across domains, owner-role and Now/Next/Later choices, core-framework/source provenance, unencrypted Markdown download and browser printing
- Action-brief regression checks for capacity, duplicates, role/horizon validation, cross-domain source context and safe Markdown output; selections are cleared when reloading or leaving the page and are excluded from URLs, storage and network requests

### Changed

- Renamed the public decision layers to Threat sources, Risks & failure modes, and Controls & actions
- Migrated all 495 entries from position-derived identity to explicit, content-bound `{ id, text, reviewState }` records
- Reworked matrix entries for shorter, neutral and more testable language without blaming workers, affected communities or legitimate stakeholders
- Clarified jurisdiction, sector, contract, intended-audience and professional-competence boundaries across every domain
- Updated ISO 14001 to the 2026 edition and IFRC first-aid guidance to the 2025 guidelines published in 2026
- Recorded NIST SP 800-61 Rev. 3 with its full title and distinguished SP 800-53 Rev. 5 from online control Release 5.2.0
- Recorded the World Bank's *Integrity Compliance Programs for SMEs: Practical Guidance and Resources* as the 2024 final release
- Expanded integrity, continuity, supply-chain and occupational-health source coverage where the former packs were too narrow
- Marked the 0–4 maturity scale, 50/30/20 confidence weighting, governance cadence and adoption timeline as project-defined or illustrative heuristics
- Clarified that the application does not persist search state, while URL state may appear in browser history, copied links and hosting or access logs
- Made canonical entry IDs searchable and explained that action selection order and planning horizons do not represent risk severity or prescribed deadlines

### Security

- Isolated Pages/OIDC write permissions in a checkout-free job containing only the pinned deployment action; repository-script freshness checks and post-deployment smoke tests run in separate read-only jobs
- Restricted Nu downloads to the approved HTTPS registry and vetted public endpoints, bounded redirects and response reads, and replaced execution from a mutable shared cache with a private per-run read-only JAR copy
- Pinned the official `vnu-jar@26.8.30` distribution by exact tarball size, SHA-256 and SHA-512, with bounded regular-file extraction and the original standalone-JAR digests; no package installation or lifecycle scripts run
- Added public-address and redirect validation to external-source checks, with controlled regression fixtures for non-public destinations and DNS rebinding

### Fixed

- Overbroad claims that domain source packs proved individual entries or established compliance
- Legal-applicability overstatements involving OSHA rules, ILO conventions, UNCAC, notification duties, permits, recalls and evidence preservation
- Conflation of psychosocial distress with insider threat and of lawful protest with hostile activity
- Scope ambiguity between environmental safety, occupational health and safety, emergency response, cyber supply-chain guidance and healthcare mass-casualty guidance
- External-link reporting language that treated reachability as proof of title, edition or applicability

## [1.0.0] — 2026-08-29

### Added

- Premium responsive product experience with a distinctive visual system
- Interactive search across actors, risks and mitigations
- Decision-layer filtering with complete keyboard behavior
- Shareable URL state for domain, filter and search selections
- Mobile-native single-column lifecycle view and print layout
- Operating framework covering maturity, assessment confidence, governance and adoption
- Canonical metadata, large social cards, sitemap, robots policy and favicon
- Deterministic internal validation and scheduled external-link verification
- GitHub Pages deployment workflow and release documentation
- Stable matrix entry identifiers and visible source-scope labels
- A release roadmap with quality gates, publication and rollback runbooks, and post-release ownership
- A documented optional development workflow using the verified 24-skill `addyosmani/agent-skills` baseline

### Changed

- Reframed the product around its own evidence-led identity
- Simplified acknowledgements and clarified editorial stewardship
- Aligned public documentation with features actually shipped in the repository
- Standardized interface terminology to actors, risks and mitigations

### Fixed

- Incorrect filtered-result counts and incomplete radiogroup keyboard behavior
- Inaccessible mobile horizontal matrix layout
- Missing framework files referenced by the README
- Stale project naming in licensing and validation metadata
- Flaky always-on external-link checks in pull-request validation
- Retired WHO occupational-health source URL
- Optional Codex skill installation now binds to the reviewed upstream commit
- Local development serving is explicitly limited to the loopback interface
- GitHub Actions checkout credentials and Pages publication permissions are more tightly scoped
