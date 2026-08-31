# Changelog

All notable project changes are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses semantic versioning for public releases.

## [Unreleased] — v1.1.0 candidate, 2026-08-29

Publication is pending the remaining release gates, release-owner approval before merge and a separate protected-environment approval before deployment. No `v1.1.0` tag, production publication or GitHub Release is claimed by this entry.

The mitigation-tool work below is present in the integrated development working tree only. Its release scope and named human content review remain open; it is not part of the current public `v1.0.0` site.

### Added

- Contextual original-source quick links for lifecycle phases, with clear separation between context evidence and entry-level proof
- Explicit source metadata for status, audience, jurisdiction, applicability and review date
- A durable content-review record covering all 9 domains and 495 visible entries
- Official guidance for employment screening, unmanned-aircraft awareness, supply-chain continuity, compliance management, whistleblowing, internal investigations, crisis management, business-impact analysis and occupational health
- A deterministic UI contract validator for public terminology, evidence links and no-script fallback
- A separate mitigation-tool dataset covering all 180 canonical Controls & actions identifiers with exactly two vendor-neutral implementation aids each, 360 `{ name, use }` records in total
- Fail-closed mitigation-tool data and UI gates, a visible limitation notice, accessible native disclosures, tool-aware search and expanded print output, with no vendor links or new runtime network or browser-storage behavior

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
