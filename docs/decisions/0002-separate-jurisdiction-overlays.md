# ADR-0002: Keep jurisdiction overlays separate from the core matrix

## Status

Proposed for the `v1.3.0` EU–Finland pilot · 2026-08-29. This ADR is not yet a legal, subject-matter or human approval record. Independent legal/applicability, security and privacy review remains an open release gate.

## Context

The core matrix is a globally transferable management synthesis. EU legislation, Finnish national law, authority guidance and voluntary standards differ in legal effect, scope, date and jurisdiction. Copying jurisdiction-specific statements into the core would blur those distinctions, create divergent duplicates and make a contextual mapping appear to prove compliance.

Assessment snapshots must remain interpretable when public guidance changes, but they must not embed or persist the full overlay dataset. Overlay selection is public configuration; organisation-specific answers are sensitive assessment state.

## Decision

Publish jurisdiction overlays as a separate, read-only static dataset in `matrix-overlays.js`. Its exact top-level contract is `{schemaVersion: "1.0.0", overlays: []}`. An overlay contains exactly `id`, `version`, `label`, `jurisdictions`, `scope`, `applicability`, `status`, `reviewedAt`, `nextReview`, `authority`, `disclaimer` and `annotations`. The first overlay is `id: "eu-fi"`, `version: "0.1.0-pilot"`, `status: "pilot"` and jurisdictions `EU` and `FI`.

Each annotation has:

- a stable annotation `id` and annotation `version` (`"1.0.0"` in the pilot);
- `kind`: `eu-law`, `fi-law`, `authority-guidance` or `voluntary-standard`;
- `relationship: "context"`;
- `jurisdictions`, `title`, `summary`, `authority`, `applicability`, `effective`, `status` and `reviewedOn` metadata;
- one or more official `sources`, each preserving source ID, title, authority, type, jurisdiction, status, review date and HTTPS URL;
- a canonical `domainId` and one or more canonical `phaseIds`;
- optional `entryIds` only after that exact entry relationship has been separately verified.

The pilot contains no entry-level mappings. It covers Information and Cybersecurity, Occupational Health and Safety, and Environmental and Hazardous Materials Safety at domain/phase context level.

Overlay data does not copy or replace core entry text, change maturity/confidence calculations or imply that a control satisfies a requirement. The UI labels its content as context, preserves category and jurisdiction distinctions, and never claims certification, universal applicability or legal advice.

Build validation is strict and fail-closed: unique IDs, known enums, valid metadata/date shapes, allowlisted official HTTPS sources, and canonical domain/phase/entry references are required. While `scope.entryLevelMappings` is `false`, every `entryIds` field is rejected. Enabling it requires a future reviewed data-contract change. Any orphaned reference, duplicate identifier or unknown property fails the data gate.

`overlay=eu-fi` is an allowlisted public URL parameter. Unknown overlay values canonicalise to no overlay and do not render residual data. Assessment answers and free text never enter the URL. An assessment/export records only the selected overlay `{id, version}` inside encrypted plaintext; reports display that pair. If that public overlay version is unavailable later, import still succeeds and reports the recorded version without silently substituting another.

Overlay scripts are first-party static assets and require no runtime network fetch, browser storage or CSP relaxation. Overlay strings and metadata remain untrusted at the rendering boundary and use text-only DOM sinks.

## Alternatives considered

### Add jurisdiction text directly to core entries

Rejected. It couples globally scoped guidance to changing local applicability, duplicates content and makes evidence scope harder to communicate and validate.

### Copy core entries into an EU–Finland edition

Rejected. Two matrices would drift and stable entry identities would stop being a reliable cross-version reference.

### Fetch laws and guidance at runtime

Rejected. Live fetching adds network/privacy/availability dependencies, makes releases non-reproducible and conflicts with the static `connect-src 'none'` architecture.

### Treat every source as an entry-level compliance mapping

Rejected. A domain or phase source can provide context without proving an individual statement. Entry-level relationships require separate verification and remain absent from the pilot.

### Store the complete overlay in each assessment file

Rejected. It increases sensitive-file size, duplicates public content and could make stale text appear current. Recording immutable overlay identity and version is enough for interpretation.

## Consequences

- Core IDs become a compatibility contract. Removing or repurposing one requires an explicit migration and overlay impact review.
- Overlay releases need source-currency, legal/applicability and subject-matter review distinct from core editorial review. Automated checks establish structure and traceability, not legal correctness.
- Users can share an overlay view because it contains only public configuration; they cannot share assessment answers through a URL.
- Reports remain reproducible by recording the overlay version, but reconstructing old public context requires retaining or archiving released overlay versions.
- Future jurisdictions can add independent overlay records without changing core entries or the assessment schema.

## Acceptance conditions

- The overlay validator rejects unknown core references, duplicate IDs, invalid enums/dates, non-HTTPS sources, unreviewed entry-level mappings and copied core entry records.
- Every pilot annotation preserves its `kind`, jurisdiction, authority, applicability, effective/status and review metadata in data and UI.
- `overlay=eu-fi` round-trips through URL state; an unknown value fails closed to no overlay.
- Selecting/changing an overlay does not modify scores, confidence, free text or core content.
- Exported assessment plaintext contains overlay ID/version only; the visible encrypted envelope contains neither overlay selection nor assessment data.
- The UI and report state that overlay context is not a compliance determination or legal advice.
- No overlay action causes a network request, persistent browser write or CSP relaxation.
- Independent human legal/applicability, security and privacy review approves the release; structural validation alone cannot close those gates.

## Related decision

[ADR-0001](0001-local-assessment-and-encrypted-export.md) defines how the overlay identity/version is protected inside an encrypted assessment export.
