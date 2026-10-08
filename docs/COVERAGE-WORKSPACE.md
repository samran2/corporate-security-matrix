# Corporate-security coverage workspace

Status: unpublished local preview, 2026-10-09. Catalogue `0.1.0-draft`; core framework `1.1.0-candidate`. New content has not received named professional approval.

## Use locally

Serve the repository using the local-server command in README.md, then open `/coverage.html`. The home page also exposes a clearly labeled draft-preview link in development. The v1.1 release artifact deliberately removes this link and excludes the workspace files.

1. Inspect all eighteen topics. A context profile recommends a starting set; it never decides non-applicability for you.
2. Set a topic to applicable, not applicable with a rationale, or leave its scope undetermined. Select an accountable role, not a person's name.
3. For applicable topics, examine the five lifecycle checks. Record a gap, partial coverage, or that evidence is available; the tool cannot verify that evidence or its effectiveness.
4. Use the expected evidence, practical action, two implementation aids and core-control links to prepare an organizational review. Keep actual evidence records in your approved system.
5. Record a critical gap and next action if useful. Avoid personal names, secrets, personal data and sensitive evidence in these optional fields.
6. Review the leadership report and cross-domain tabletop scenarios. Printing or Save as PDF creates an unencrypted copy under your control.

Session information stays in application memory; it is not placed in URLs, network requests or application-managed browser storage. Reloading or leaving clears it, including browser navigation-cache restoration. Valid topic edits are saved to the session when switching topics; invalid edits must be corrected before switching. The explicit save button updates the current report without switching topics. Browser behavior, operating-system capture and user-chosen output are outside the application's control.

There is deliberately no continuation-file export/import for the new coverage layer. Existing encrypted 45-cell assessment files remain unchanged and do not contain these topic decisions. Do not treat the separate assessment's cell completion percentage as the breadth of corporate-security coverage.

## Implemented gap traceability

| Review gap | Coverage topics or mechanism |
| --- | --- |
| G01 | Explicit applicability, exclusion rationale, separate unresolved-scope and check counts |
| G02 | Governance, decision authority, exceptions and assurance |
| G03 | Employee and contractor lifecycle |
| G04 | Supplier lifecycle and exit |
| G05 | Process and technical safety |
| G06 | OT, IoT and building-automation interfaces |
| G07 | Secure software/product lifecycle |
| G08 | AI and generative-AI security |
| G09 | Operational data protection |
| G10 | Trade compliance; strategic information |
| G11 | Product/service safety; public-event safety |
| G12 | Transport, fleet and dangerous goods |
| G13 | Travel programme; confidential meetings |
| G14 | Cross-domain resilience; verified crisis communications |
| G15 | Risk transfer and insurance recovery |

Each of eighteen topics has one check per canonical phase, ninety checks in total. Each check has two vendor-neutral aids, adding 180 aids without changing the existing 360 canonical mitigation aids. All checks link to existing stable matrix IDs. Six context profiles and five coupled-disruption scenarios connect the topics without adding domains or a synthetic risk score.

Sources are official context for topics, not independently verified normative mappings to individual controls. Source consultation dates do not mean expert review. National guidance is not automatically applicable outside its jurisdiction. A generic management workspace cannot establish legal applicability, equipment safety, compliance or exhaustive coverage for every organization. Site-, sector- and role-specific specialist assessments remain necessary.

## Verification and open gates

The implementation contract, privacy boundaries and staged release decision are recorded in ADR-0003-coverage-workspace.md. Model, catalogue, UI and artifact regression tests live in scripts/test_coverage_*.mjs. A final verification record is maintained in tasks/todo.md.

Before publication: named professional reviewers accept legal, privacy, life-safety, process-safety and security content; user research verifies comprehension; real screen-reader and cross-browser checks pass; a distinct coverage-continuation format is reviewed if introduced; and the release owner approves inclusion in a new release manifest. This work does not claim that those external gates are complete.
