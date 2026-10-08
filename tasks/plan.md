# Implementation Plan: Corporate Security Matrix 2026–2028

## Overview

Deliver the approved roadmap as a sequence of independently verifiable releases. First stabilize the local `v1.1.0` candidate without publishing it. Then add the in-memory assessment workspace, the three-domain EU–Finland overlay pilot, comparison and executive reporting, and finally content-operations automation. A backend remains outside committed scope unless the `v2.0` research and assurance gate is met.

## Current state

- `v1.0.0` is the current public release and citation version.
- `v1.1.0` is a modified local candidate. It is not a tag, GitHub Release or authorized production publication.
- Contextual phase links and the 59-record source set exist in the candidate.
- `v1.2.0` and later releases remain planned until their acceptance criteria and release gates have recorded evidence.
- The working tree is user-owned. Implementation work must preserve unrelated edits and must not commit, push, tag or publish without separate authorization.

## Architecture decisions

- Keep a dependency-free static runtime on GitHub Pages with strict CSP, no accounts, no backend and no product analytics.
- Stabilize public identifiers and data contracts before assessment or overlay behavior depends on them.
- Keep assessment state in memory; persistence is an explicit user-controlled encrypted file operation.
- Keep legal and standards overlays separate from the original synthesis and reference the core by stable identifiers.
- Treat maturity, confidence and coverage as separate measures. Never collapse them into a synthetic risk score.
- Validate the assembled Pages artifact, not merely the source tree, before publication.
- Require release-owner approval before the release pull request merges, then require a separate protected-`github-pages`-environment approval after the `main` build and validation and before deployment.

The current design records are the proposed [assessment threat model](../docs/ASSESSMENT-THREAT-MODEL.md), [local assessment and encrypted-export ADR](../docs/decisions/0001-local-assessment-and-encrypted-export.md), and [separate jurisdiction-overlay ADR](../docs/decisions/0002-separate-jurisdiction-overlays.md). Their Proposed status is not evidence that a feature or human approval is complete.

## Dependency graph

```text
v1.1 stable entry/source contracts
├── v1.1 atomic startup, URL and accessibility fixes
├── v1.1 artifact and CI gates
├── v1.2 assessment schema and metrics
│   ├── in-memory assessment workflow
│   ├── executive summary and print report
│   └── encrypted continuation file
│       └── v1.4 two-snapshot comparison
└── v1.3 overlay schema
    ├── three-domain EU–Finland pilot
    └── overlay UI and report provenance
        └── v1.5 expansion decision

v1.2 + v1.3 validated releases
└── v1.4 executive reporting
    └── v1.5 content operations
        └── v2.0 research decision gate
```

## Delivery phases

### Phase 1 — v1.1 candidate stabilization

Complete the entry contract, atomic startup, URL and focus behavior, accessibility and print fixes, documentation consistency, artifact construction and CI validation. Run the complete candidate checkpoint before asking for any external approval.

### Phase 2 — v1.2 assessment workspace

Build vertical slices in this order: schema and calculations, in-memory editing, accessible 45-cell navigation, executive summary and print, cryptographic container, import/export UX. Complete threat-model and privacy review before merging cryptographic persistence.

### Phase 3 — v1.3 overlay pilot

Lock the overlay schema, curate one official-source pilot record set for each of the three named domains, then add selection and report provenance. Legal and specialist approval remains external.

### Phase 4 — v1.4 reporting and v1.5 operations

Add two-snapshot comparison only after the assessment schema is stable. Add source lifecycle, parity automation and the resource budget before deciding whether to expand the overlay or investigate a backend.

## Checkpoints

- **CP-1, v1.1 data and UI:** all deterministic checks plus runtime browser regression at 320, 390, 768 and 1440 pixels.
- **CP-2, v1.1 release artifact:** assembled `_site`, W3C, link, accessibility, print and security gates pass on one candidate SHA.
- **CP-3, v1.2 core and persistence:** 45-cell state, calculations, incomplete-result semantics, keyboard and print paths, cryptographic vectors and fail-closed imports pass; no passphrase or assessment answer reaches storage, URL or network.
- **CP-4, v1.3 pilot:** overlay parity and provenance pass before external domain review.
- **CP-5, v1.4–v1.5:** comparison, reporting, content lifecycle and resource-budget checks pass before user research or expansion decisions.

The task-level acceptance criteria, verification commands and dependencies are in [`todo.md`](todo.md).

## External gates

Repository work may prepare evidence but must not mark these complete:

- Three-discipline v1.1 content panel.
- Read-only Gemini CLI review with an explicitly approved command and recorded environment.
- GitHub branch ruleset and protected `github-pages` environment configuration.
- Release-owner approval before production publication, tag and GitHub Release.
- Six-participant v1.2 security-leader study and 12-participant v1.4 study.
- Three specialist approvals for the v1.3 overlay pilot.
- Twenty organization interviews plus privacy, threat and cost acceptance for any v2 backend proposal.

## Risks and mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Position-derived identifiers change meaning after reordering | High | Make identifiers explicit and mutation-test identity preservation before downstream work |
| Partial data load appears authoritative | High | Validate all datasets before rendering and show one atomic error state |
| Local assessment leaks through URL, storage or logs | High | Memory-only state, explicit encrypted export and negative storage/network tests |
| Overlay language implies legal advice | High | Separate schema, explicit applicability metadata, official sources and external specialist review |
| A `main` push deploys before the release decision is complete | High | Approve the release PR before merge and block deployment on a separate protected-environment approval after build validation |
| An older successful workflow run masks a newer pending or failed attempt | High | Resolve only the newest run attempt for each required workflow and regression-test mixed histories |
| Documentation gets ahead of implementation | Medium | Keep current, candidate and planned statuses explicit; update checkboxes only from evidence |
| Future feature growth breaks the static privacy model | Medium | Enforce the dependency-free runtime and v2 decision gate |

## Completion rule

A task is complete only when its acceptance criteria and verification steps pass, the applicable checkpoint is green, documentation reflects the actual state and no required external gate is represented as complete without evidence. Release publication follows the runbook in [`../ROADMAP.md`](../ROADMAP.md).
