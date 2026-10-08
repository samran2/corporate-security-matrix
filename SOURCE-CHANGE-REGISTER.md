# Source lifecycle and change register

This register makes source maintenance auditable without turning an automated check into a claim that a source is legally applicable, substantively current or sufficient evidence for a matrix entry.

The current baseline contains the 59 core source records used by the matrix. Their metadata was recorded as verified on 2026-08-29. The next review date is a governance deadline, not an automatic renewal of that verification. A human source-currency judgement remains required.

## Published files

- `source-lifecycle-register.json` assigns every core source a stable compound key, review-owner role, recorded verification date, next review date and the source status already present in the canonical source data.
- `source-change-register.json` is the append-only event stream for source changes. Existing events are never rewritten or removed; later changes add events.
- `source-change-register.checkpoint.json` records the schema, canonicalisation contract, event count, final event ID and SHA-256 digest of the entire reviewed event stream.
- `scripts/validate_source_register.mjs` validates both registers, the full-stream checkpoint and an optional trusted Git base revision against the canonical source data.

## Stable source keys

Source IDs are only unique inside a domain, so a bare source ID is not a valid registry key.

- Core source: `core/{domainId}/{sourceId}`
- Reserved overlay source: `overlay/{overlayId}/{sourceId}`

The overlay namespace is reserved to prevent future collisions. Overlay source records are not duplicated in the current lifecycle register; their canonical records and validation remain in the overlay dataset.

## Lifecycle records

Each lifecycle entry contains exactly:

- `sourceKey`
- `reviewOwnerRole`
- `verifiedOn`
- `nextReviewOn`
- `status`

`verifiedOn` and `status` must equal the canonical source record. `nextReviewOn` follows the three-month review cadence and must be later than `verifiedOn`. `reviewOwnerRole` assigns maintenance accountability; it is not the name of an external authority or reviewer.

## Append-only events

Each event contains exactly `{id, sourceKey, recordedOn, type, summary}` and may additionally contain `previous` when the event type permits it. Controlled event types are:

- `added`
- `verified`
- `metadata-updated`
- `url-changed`
- `superseded`
- `withdrawn`

For `superseded`, the event is recorded on the successor and `previous` is the predecessor's compound source key. Both records must exist, a predecessor may have only one successor, and the resulting succession graph must be acyclic. For `url-changed`, `previous` is the former absolute HTTPS URL. For metadata or withdrawal events, `previous` may contain the prior plain-text value. `added` and `verified` events do not use `previous`.

Event IDs use `SRC-YYYYMMDD-NNN`; their date component must match `recordedOn`. Events are ordered by date and ID. Every lifecycle record must have at least one event.

The one-time genesis prefix contains 59 events. Its SHA-256 is `902c425bca1a60b88f77679c2ab7503135d5c1e1041cc3883e0a02a9994eb38c`, calculated from deterministic JSON with object keys sorted. This fixed anchor protects the initial introduction of the register.

The versioned checkpoint must cover the entire current event stream, not only the genesis prefix. Normal validation fails when an event is appended until a human has reviewed the append and explicitly advances the checkpoint. The advance command first verifies the previous checkpointed prefix byte-for-byte at the data-contract level, validates the complete register, requires at least one new event, and then replaces the checkpoint atomically. It cannot advance over a rewrite, removal, reorder, invalid tail or no-op.

```bash
node scripts/validate_source_register.mjs --advance-checkpoint --confirm-append-only-review
```

Register, lifecycle and checkpoint JSON use canonical two-space formatting, explicit field order and one trailing newline. Alternate serialisations, reordered event/checkpoint keys and duplicate keys are rejected before their parsed values can hide a byte-level change.

For an already integrated register, release CI must additionally compare against the trusted full 40-character lowercase commit SHA supplied by the event context: the pull-request base SHA for a PR, or the push `before` SHA for a non-genesis push. The selected commit must exist locally, be a commit and be an ancestor of `HEAD`; its complete event array must be an exact prefix of the candidate. The checkout must contain that history. An arbitrary user-selected older ancestor is not release evidence.

```bash
node scripts/validate_source_register.mjs --against-git-ref "$TRUSTED_BASE_SHA"
```

The current repository `HEAD` predates these untracked candidate registers, so their first integration is an explicit genesis operation reviewed by the release owner. A missing historical register is accepted only when the candidate event stream and checkpoint exactly equal the pinned 59-event genesis count, final ID and digest. Any post-genesis candidate against a base without the register fails closed.

The checkpoint and genesis digest are accidental- and routine-change controls, not signatures. A repository writer who changes the register, checkpoint, validator and workflow together could bypass local checks. Protected review, a trusted event-derived base SHA and branch/ruleset controls remain required. Any intentional migration of the checkpoint contract requires explicit release-owner review; normal source maintenance only appends events and advances the checkpoint with the guarded command.

## Review procedure

At each review deadline, the framework source maintainer must inspect the official source and decide whether its URL, edition, status, authority, applicability and mappings remain accurate. The maintainer then updates canonical metadata where needed and appends the corresponding event. Link reachability alone is not a source-currency judgement.

Supersession or withdrawal does not silently delete history. Record the transition, update the canonical source set through normal review, and retain the immutable event trail needed to explain the change.
