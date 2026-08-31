import fs from "node:fs";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import vm from "node:vm";

const projectRoot = new URL("../", import.meta.url);
const lifecycleRegisterUrl = new URL("source-lifecycle-register.json", projectRoot);
const changeRegisterUrl = new URL("source-change-register.json", projectRoot);
const changeCheckpointUrl = new URL("source-change-register.checkpoint.json", projectRoot);
const lifecycleRegisterText = fs.readFileSync(lifecycleRegisterUrl, "utf8");
const changeRegisterText = fs.readFileSync(changeRegisterUrl, "utf8");
const changeCheckpointText = fs.readFileSync(changeCheckpointUrl, "utf8");
const lifecycleRegister = parseJsonText(lifecycleRegisterText, "source-lifecycle-register.json");
const changeEvents = parseJsonText(changeRegisterText, "source-change-register.json");
const changeCheckpoint = parseJsonText(changeCheckpointText, "source-change-register.checkpoint.json");
const canonicalSource = ["matrix-domains.js", "matrix-references.js"]
  .map((file) => fs.readFileSync(new URL(file, projectRoot), "utf8"))
  .join("\n") + ";globalThis.__sourceData = { domains, referencesByDomain };";
const context = vm.createContext({});
vm.runInContext(canonicalSource, context, { filename: "source-register.bundle.js", timeout: 5_000 });

const LIFECYCLE_ROOT_FIELDS = ["schemaVersion", "keyNamespaces", "reviewPolicy", "sources"];
const LIFECYCLE_RECORD_FIELDS = ["sourceKey", "reviewOwnerRole", "verifiedOn", "nextReviewOn", "status"];
const EVENT_FIELDS = ["id", "sourceKey", "recordedOn", "type", "summary"];
const EVENT_FIELDS_WITH_PREVIOUS = [...EVENT_FIELDS, "previous"];
const CHECKPOINT_FIELDS = ["schemaVersion", "canonicalization", "eventCount", "lastEventId", "sha256"];
const EVENT_TYPES = new Set(["added", "verified", "metadata-updated", "url-changed", "superseded", "withdrawn"]);
const DEFAULT_OWNER_ROLE = "Framework source maintainer";
const REVIEW_CADENCE_MONTHS = 3;
const CHECKPOINT_SCHEMA_VERSION = "1.0.0";
const EVENT_CANONICALIZATION = "csm-source-events-v1";
const GENESIS_EVENT_PREFIX = Object.freeze({
  count: 59,
  sha256: "902c425bca1a60b88f77679c2ab7503135d5c1e1041cc3883e0a02a9994eb38c"
});

function parseJsonText(text, label) {
  try {
    return JSON.parse(text);
  } catch (error) {
    console.error(`- ${label} contains invalid JSON: ${error.message}`);
    process.exit(1);
  }
}

function buildCanonicalSources() {
  const sources = new Map();
  for (const domain of context.__sourceData.domains) {
    for (const reference of context.__sourceData.referencesByDomain[domain.id] ?? []) {
      const sourceKey = `core/${domain.id}/${reference.id}`;
      sources.set(sourceKey, { ...reference, domainId: domain.id, sourceKey });
    }
  }
  return sources;
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function hasExactKeys(value, expected) {
  if (!isRecord(value)) return false;
  const actual = Object.keys(value).sort();
  const required = [...expected].sort();
  return actual.length === required.length && actual.every((key, index) => key === required[index]);
}

function isNonEmptyTrimmedString(value) {
  return typeof value === "string" && value.length > 0 && value === value.trim();
}

function isValidIsoDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  if (year < 1) return false;
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function addMonthsClamped(value, months) {
  const [year, month, day] = value.split("-").map(Number);
  const monthIndex = year * 12 + (month - 1) + months;
  const targetYear = Math.floor(monthIndex / 12);
  const targetMonth = monthIndex % 12;
  const lastDay = new Date(Date.UTC(targetYear, targetMonth + 1, 0)).getUTCDate();
  return `${String(targetYear).padStart(4, "0")}-${String(targetMonth + 1).padStart(2, "0")}-${String(Math.min(day, lastDay)).padStart(2, "0")}`;
}

function isAbsoluteHttpsUrl(value) {
  if (typeof value !== "string" || value !== value.trim()) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && Boolean(url.hostname) && !url.username && !url.password;
  } catch {
    return false;
  }
}

function stableJson(value) {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  if (isRecord(value)) {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function sha256(value) {
  return crypto.createHash("sha256").update(value, "utf8").digest("hex");
}

function nextAppendEvent(events, overrides = {}) {
  const tail = events.at(-1);
  const nextDate = new Date(`${tail.recordedOn}T00:00:00.000Z`);
  nextDate.setUTCDate(nextDate.getUTCDate() + 1);
  const recordedOn = nextDate.toISOString().slice(0, 10);
  return {
    id: `SRC-${recordedOn.replaceAll("-", "")}-001`,
    sourceKey: events[0].sourceKey,
    recordedOn,
    type: "verified",
    summary: "Recorded a later human source-currency verification.",
    ...overrides
  };
}

function checkpointFor(events) {
  return {
    schemaVersion: CHECKPOINT_SCHEMA_VERSION,
    canonicalization: EVENT_CANONICALIZATION,
    eventCount: events.length,
    lastEventId: events.at(-1)?.id,
    sha256: sha256(stableJson(events))
  };
}

function orderRecord(value, orderedFields) {
  if (!isRecord(value)) return value;
  const ordered = {};
  for (const field of orderedFields) {
    if (Object.hasOwn(value, field)) ordered[field] = value[field];
  }
  for (const field of Object.keys(value).filter((key) => !orderedFields.includes(key)).sort()) {
    ordered[field] = value[field];
  }
  return ordered;
}

function canonicalJson(value, kind = "generic") {
  let canonicalValue = value;
  if (kind === "events" && Array.isArray(value)) {
    canonicalValue = value.map((event) => orderRecord(event, EVENT_FIELDS_WITH_PREVIOUS));
  } else if (kind === "checkpoint") {
    canonicalValue = orderRecord(value, CHECKPOINT_FIELDS);
  } else if (kind === "lifecycle" && isRecord(value)) {
    canonicalValue = orderRecord(value, LIFECYCLE_ROOT_FIELDS);
    canonicalValue.keyNamespaces = orderRecord(value.keyNamespaces, ["core", "overlay"]);
    canonicalValue.reviewPolicy = orderRecord(value.reviewPolicy, [
      "defaultOwnerRole",
      "cadenceMonths",
      "requiresHumanCurrencyJudgement"
    ]);
    if (Array.isArray(value.sources)) {
      canonicalValue.sources = value.sources.map((record) => orderRecord(record, LIFECYCLE_RECORD_FIELDS));
    }
  }
  return `${JSON.stringify(canonicalValue, null, 2)}\n`;
}

function validateCanonicalJsonText(errors, label, rawText, parsedValue, kind = "generic") {
  if (rawText !== canonicalJson(parsedValue, kind)) {
    errors.push(`${label} must use canonical two-space JSON with one trailing newline; duplicate keys and alternate serialisations are rejected.`);
  }
}

function validateCheckpoint(errors, events, checkpoint, allowUncheckpointedTail) {
  if (!hasExactKeys(checkpoint, CHECKPOINT_FIELDS)) {
    errors.push(
      "Source change-register checkpoint must contain exactly schemaVersion, canonicalization, eventCount, lastEventId and sha256."
    );
    return;
  }

  if (checkpoint.schemaVersion !== CHECKPOINT_SCHEMA_VERSION) {
    errors.push(`Source change-register checkpoint schemaVersion must be \"${CHECKPOINT_SCHEMA_VERSION}\".`);
  }
  if (checkpoint.canonicalization !== EVENT_CANONICALIZATION) {
    errors.push(`Source change-register checkpoint canonicalization must be \"${EVENT_CANONICALIZATION}\".`);
  }
  if (!Number.isSafeInteger(checkpoint.eventCount) || checkpoint.eventCount < GENESIS_EVENT_PREFIX.count) {
    errors.push(`Source change-register checkpoint eventCount must be an integer of at least ${GENESIS_EVENT_PREFIX.count}.`);
    return;
  }
  if (!/^SRC-\d{8}-\d{3}$/.test(checkpoint.lastEventId)) {
    errors.push("Source change-register checkpoint lastEventId must use SRC-YYYYMMDD-NNN.");
  }
  if (!/^[a-f0-9]{64}$/.test(checkpoint.sha256)) {
    errors.push("Source change-register checkpoint sha256 must be a lowercase SHA-256 digest.");
  }

  if (events.length < checkpoint.eventCount) {
    errors.push(
      `Source change-register checkpoint records ${checkpoint.eventCount} events, but the register contains only ${events.length}.`
    );
    return;
  }

  const checkpointedEvents = events.slice(0, checkpoint.eventCount);
  if (sha256(stableJson(checkpointedEvents)) !== checkpoint.sha256) {
    errors.push("Source change-register checkpoint integrity check failed: checkpointed events must not be rewritten, removed or reordered.");
  }
  if (checkpointedEvents.at(-1)?.id !== checkpoint.lastEventId) {
    errors.push("Source change-register checkpoint lastEventId does not match its checkpointed event prefix.");
  }
  if (!allowUncheckpointedTail && events.length > checkpoint.eventCount) {
    errors.push(
      `Source change-register checkpoint must be advanced after review; it covers ${checkpoint.eventCount} of ${events.length} events.`
    );
  }
}

function validateAcceptedEventPrefix(errors, events, acceptedBaseEvents) {
  if (!Array.isArray(acceptedBaseEvents)) {
    errors.push("Base-revision source change register must be an array.");
    return;
  }
  if (events.length < acceptedBaseEvents.length) {
    errors.push(
      `Current register contains fewer source events than the base revision (${events.length} < ${acceptedBaseEvents.length}).`
    );
    return;
  }
  for (const [index, acceptedEvent] of acceptedBaseEvents.entries()) {
    if (stableJson(events[index]) !== stableJson(acceptedEvent)) {
      errors.push(
        `Current register must preserve every source event accepted by the base revision; event ${index + 1} differs.`
      );
      return;
    }
  }
}

function validateSourceRegister(lifecycle, events, canonicalSources, options = {}) {
  const errors = [];

  if (options.rawLifecycleRegisterText !== undefined) {
    validateCanonicalJsonText(errors, "Source lifecycle register", options.rawLifecycleRegisterText, lifecycle, "lifecycle");
  }
  if (options.rawChangeRegisterText !== undefined) {
    validateCanonicalJsonText(errors, "Source change register", options.rawChangeRegisterText, events, "events");
  }
  if (options.rawCheckpointText !== undefined) {
    validateCanonicalJsonText(
      errors,
      "Source change-register checkpoint",
      options.rawCheckpointText,
      options.checkpoint,
      "checkpoint"
    );
  }

  if (!hasExactKeys(lifecycle, LIFECYCLE_ROOT_FIELDS)) {
    errors.push("Lifecycle register must contain exactly schemaVersion, keyNamespaces, reviewPolicy and sources.");
  }
  if (!isRecord(lifecycle)) return errors;

  if (lifecycle.schemaVersion !== "1.0.0") {
    errors.push('Lifecycle register schemaVersion must be "1.0.0".');
  }
  if (
    !hasExactKeys(lifecycle.keyNamespaces, ["core", "overlay"]) ||
    lifecycle.keyNamespaces?.core !== "core/{domainId}/{sourceId}" ||
    lifecycle.keyNamespaces?.overlay !== "overlay/{overlayId}/{sourceId}"
  ) {
    errors.push("Lifecycle keyNamespaces must declare the exact core and overlay compound-key templates.");
  }
  if (
    !hasExactKeys(lifecycle.reviewPolicy, ["defaultOwnerRole", "cadenceMonths", "requiresHumanCurrencyJudgement"]) ||
    lifecycle.reviewPolicy?.defaultOwnerRole !== DEFAULT_OWNER_ROLE ||
    lifecycle.reviewPolicy?.cadenceMonths !== REVIEW_CADENCE_MONTHS ||
    lifecycle.reviewPolicy?.requiresHumanCurrencyJudgement !== true
  ) {
    errors.push("Lifecycle reviewPolicy must retain the three-month, human-reviewed framework-source policy.");
  }

  if (!Array.isArray(lifecycle.sources)) {
    errors.push("Lifecycle sources must be an array.");
    return errors;
  }

  const lifecycleKeys = new Set();
  for (const [index, record] of lifecycle.sources.entries()) {
    const location = `Lifecycle source ${index + 1}`;
    if (!hasExactKeys(record, LIFECYCLE_RECORD_FIELDS)) {
      errors.push(`${location} must contain exactly sourceKey, reviewOwnerRole, verifiedOn, nextReviewOn and status.`);
    }
    if (!isRecord(record)) continue;

    if (!isNonEmptyTrimmedString(record.sourceKey) || !/^core\/[a-z0-9]+(?:-[a-z0-9]+)*\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(record.sourceKey)) {
      errors.push(`${location}.sourceKey must be a compound core source key.`);
    }
    if (lifecycleKeys.has(record.sourceKey)) {
      errors.push(`Duplicate lifecycle sourceKey: ${record.sourceKey}.`);
    } else if (typeof record.sourceKey === "string") {
      lifecycleKeys.add(record.sourceKey);
    }

    const canonical = canonicalSources.get(record.sourceKey);
    if (canonical) {
      if (record.status !== canonical.status) {
        errors.push(`${record.sourceKey} status must equal the canonical source status.`);
      }
      if (record.verifiedOn !== canonical.verifiedOn) {
        errors.push(`${record.sourceKey} verifiedOn must equal the canonical source date.`);
      }
    }
    if (record.reviewOwnerRole !== DEFAULT_OWNER_ROLE) {
      errors.push(`${record.sourceKey ?? location} reviewOwnerRole must be ${DEFAULT_OWNER_ROLE}.`);
    }
    if (!isValidIsoDate(record.verifiedOn)) {
      errors.push(`${record.sourceKey ?? location} verifiedOn must be a valid YYYY-MM-DD date.`);
    }
    if (!isValidIsoDate(record.nextReviewOn)) {
      errors.push(`${record.sourceKey ?? location} nextReviewOn must be a valid YYYY-MM-DD date.`);
    } else if (isValidIsoDate(record.verifiedOn)) {
      if (record.nextReviewOn <= record.verifiedOn) {
        errors.push(`${record.sourceKey ?? location} nextReviewOn must be after verifiedOn.`);
      }
      const expectedReview = addMonthsClamped(record.verifiedOn, REVIEW_CADENCE_MONTHS);
      if (record.nextReviewOn !== expectedReview) {
        errors.push(
          `${record.sourceKey ?? location} nextReviewOn must equal ${expectedReview} under the ${REVIEW_CADENCE_MONTHS}-month review cadence.`
        );
      }
    }
    if (!isNonEmptyTrimmedString(record.status)) {
      errors.push(`${record.sourceKey ?? location} status must be a non-empty trimmed string.`);
    }
  }

  const canonicalKeys = new Set(canonicalSources.keys());
  const missingLifecycle = [...canonicalKeys].filter((sourceKey) => !lifecycleKeys.has(sourceKey));
  const extraLifecycle = [...lifecycleKeys].filter((sourceKey) => !canonicalKeys.has(sourceKey));
  if (missingLifecycle.length || extraLifecycle.length || lifecycle.sources.length !== canonicalSources.size) {
    const details = [
      missingLifecycle.length ? `missing ${missingLifecycle.join(", ")}` : "",
      extraLifecycle.length ? `extra ${extraLifecycle.join(", ")}` : ""
    ].filter(Boolean).join("; ");
    errors.push(`Lifecycle/core source parity mismatch${details ? ` (${details})` : ""}.`);
  }

  if (!Array.isArray(events)) {
    errors.push("Source change register must be an array.");
    return errors;
  }

  if (events.length < GENESIS_EVENT_PREFIX.count) {
    errors.push(`Source change register must retain at least ${GENESIS_EVENT_PREFIX.count} events from the immutable baseline.`);
  } else {
    const prefixDigest = sha256(stableJson(events.slice(0, GENESIS_EVENT_PREFIX.count)));
    if (prefixDigest !== GENESIS_EVENT_PREFIX.sha256) {
      errors.push("Immutable source-event prefix integrity check failed: existing baseline events must not be rewritten, removed or reordered.");
    }
  }

  validateCheckpoint(
    errors,
    events,
    options.checkpoint ?? changeCheckpoint,
    options.allowUncheckpointedTail === true
  );
  if (options.acceptedBaseEvents !== undefined) {
    validateAcceptedEventPrefix(errors, events, options.acceptedBaseEvents);
  }

  const eventIds = new Set();
  const sourcesWithEvents = new Set();
  const predecessorToSuccessor = new Map();
  const successionEdges = new Map();
  let previousOrderKey = null;

  for (const [index, event] of events.entries()) {
    const location = `Source event ${index + 1}`;
    const hasPrevious = isRecord(event) && Object.hasOwn(event, "previous");
    if (!hasExactKeys(event, hasPrevious ? EVENT_FIELDS_WITH_PREVIOUS : EVENT_FIELDS)) {
      errors.push(`${location} must contain exactly id, sourceKey, recordedOn, type, summary and optional previous.`);
    }
    if (!isRecord(event)) continue;

    for (const field of EVENT_FIELDS) {
      if (!isNonEmptyTrimmedString(event[field])) {
        errors.push(`${location}.${field} must be a non-empty trimmed string.`);
      }
    }

    if (eventIds.has(event.id)) {
      errors.push(`Duplicate source event ID: ${event.id}.`);
    } else if (typeof event.id === "string") {
      eventIds.add(event.id);
    }
    if (!EVENT_TYPES.has(event.type)) {
      errors.push(`${location} has unsupported type: ${event.type ?? "missing"}.`);
    }
    if (!lifecycleKeys.has(event.sourceKey)) {
      errors.push(`${location} references an unknown lifecycle source: ${event.sourceKey ?? "missing"}.`);
    } else {
      sourcesWithEvents.add(event.sourceKey);
    }

    const idMatch = typeof event.id === "string" ? event.id.match(/^SRC-(\d{8})-(\d{3})$/) : null;
    if (!idMatch) {
      errors.push(`${location}.id must use SRC-YYYYMMDD-NNN.`);
    }
    if (!isValidIsoDate(event.recordedOn)) {
      errors.push(`${location}.recordedOn must be a valid YYYY-MM-DD date.`);
    } else if (idMatch && idMatch[1] !== event.recordedOn.replaceAll("-", "")) {
      errors.push(`${location} event ID date component must match recordedOn.`);
    }

    if (isNonEmptyTrimmedString(event.recordedOn) && isNonEmptyTrimmedString(event.id)) {
      const orderKey = `${event.recordedOn}\0${event.id}`;
      if (previousOrderKey !== null && orderKey <= previousOrderKey) {
        errors.push("Change-register events must be ordered by recordedOn and id.");
      }
      previousOrderKey = orderKey;
    }

    if ((event.type === "added" || event.type === "verified") && hasPrevious) {
      errors.push(`${location} ${event.type} event must not declare previous.`);
    } else if (event.type === "superseded") {
      if (!hasPrevious || !isNonEmptyTrimmedString(event.previous)) {
        errors.push(`${location} superseded event requires a previous predecessor source key.`);
      } else if (!lifecycleKeys.has(event.previous)) {
        errors.push(`${location} references an unknown predecessor source: ${event.previous}.`);
      } else {
        const existingSuccessor = predecessorToSuccessor.get(event.previous);
        if (existingSuccessor && existingSuccessor !== event.sourceKey) {
          errors.push(`${event.previous} has more than one successor.`);
        } else {
          predecessorToSuccessor.set(event.previous, event.sourceKey);
        }
        if (!successionEdges.has(event.sourceKey)) successionEdges.set(event.sourceKey, new Set());
        successionEdges.get(event.sourceKey).add(event.previous);
      }
    } else if (event.type === "url-changed") {
      if (!hasPrevious) {
        errors.push(`${location} url-changed event requires previous.`);
      } else if (!isAbsoluteHttpsUrl(event.previous)) {
        errors.push(`${location} url-changed previous must be an absolute HTTPS URL.`);
      }
    } else if (hasPrevious && !isNonEmptyTrimmedString(event.previous)) {
      errors.push(`${location}.previous must be a non-empty trimmed string when present.`);
    }
  }

  for (const sourceKey of lifecycleKeys) {
    if (!sourcesWithEvents.has(sourceKey)) {
      errors.push(`${sourceKey} has no change-register event.`);
    }
  }

  const visiting = new Set();
  const visited = new Set();
  let cycleFound = false;
  function visit(sourceKey) {
    if (visiting.has(sourceKey)) {
      cycleFound = true;
      return;
    }
    if (visited.has(sourceKey) || cycleFound) return;
    visiting.add(sourceKey);
    for (const predecessor of successionEdges.get(sourceKey) ?? []) visit(predecessor);
    visiting.delete(sourceKey);
    visited.add(sourceKey);
  }
  for (const sourceKey of successionEdges.keys()) visit(sourceKey);
  if (cycleFound) errors.push("Source succession graph contains a cycle.");

  return errors;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function runMutationTests(canonicalSources) {
  const cases = [
    {
      name: "accepts the canonical lifecycle and event registers",
      mutate() {},
      expectedError: null
    },
    {
      name: "accepts repeated bare source IDs because compound keys remain unique",
      mutate() {},
      expectedError: null,
      extraCheck(lifecycle) {
        const matches = lifecycle.sources.filter((source) => source.sourceKey.endsWith("/ifc-general-ehs"));
        if (matches.length !== 3 || new Set(matches.map((source) => source.sourceKey)).size !== 3) {
          return "Expected three distinct compound keys for ifc-general-ehs.";
        }
        return null;
      }
    },
    {
      name: "rejects a missing core lifecycle record",
      mutate(lifecycle) { lifecycle.sources.pop(); },
      expectedError: "Lifecycle/core source parity mismatch"
    },
    {
      name: "rejects a bare source ID instead of a compound key",
      mutate(lifecycle) { lifecycle.sources[0].sourceKey = "iso-31030-2021"; },
      expectedError: "must be a compound core source key"
    },
    {
      name: "rejects duplicate lifecycle source keys",
      mutate(lifecycle) { lifecycle.sources[1].sourceKey = lifecycle.sources[0].sourceKey; },
      expectedError: "Duplicate lifecycle sourceKey"
    },
    {
      name: "rejects source status drift",
      mutate(lifecycle) { lifecycle.sources[0].status = "Assumed current"; },
      expectedError: "status must equal the canonical source status"
    },
    {
      name: "rejects source verification-date drift",
      mutate(lifecycle) { lifecycle.sources[0].verifiedOn = "2026-08-28"; },
      expectedError: "verifiedOn must equal the canonical source date"
    },
    {
      name: "rejects a review deadline that is not after verification",
      mutate(lifecycle) { lifecycle.sources[0].nextReviewOn = lifecycle.sources[0].verifiedOn; },
      expectedError: "nextReviewOn must be after verifiedOn"
    },
    {
      name: "rejects an unassigned review-owner role",
      mutate(lifecycle) { lifecycle.sources[0].reviewOwnerRole = ""; },
      expectedError: "reviewOwnerRole must be Framework source maintainer"
    },
    {
      name: "rejects lifecycle fields outside the exact root contract",
      mutate(lifecycle) { lifecycle.reviewedBy = "Example"; },
      expectedError: "Lifecycle register must contain exactly schemaVersion, keyNamespaces, reviewPolicy and sources"
    },
    {
      name: "rejects reordered lifecycle keys in raw JSON",
      mutate(lifecycle) {
        const reordered = {
          sources: lifecycle.sources,
          reviewPolicy: lifecycle.reviewPolicy,
          keyNamespaces: lifecycle.keyNamespaces,
          schemaVersion: lifecycle.schemaVersion
        };
        return {
          checkpoint: checkpointFor(changeEvents),
          rawLifecycleRegisterText: `${JSON.stringify(reordered, null, 2)}\n`
        };
      },
      expectedError: "must use canonical two-space JSON"
    },
    {
      name: "rejects lifecycle-record fields outside the exact contract",
      mutate(lifecycle) { lifecycle.sources[0].reviewer = "Example"; },
      expectedError: "must contain exactly sourceKey, reviewOwnerRole, verifiedOn, nextReviewOn and status"
    },
    {
      name: "rejects an invalid calendar review date",
      mutate(lifecycle) { lifecycle.sources[0].nextReviewOn = "2026-11-31"; },
      expectedError: "nextReviewOn must be a valid YYYY-MM-DD date"
    },
    {
      name: "rejects review-cadence drift",
      mutate(lifecycle) { lifecycle.sources[0].nextReviewOn = "2026-12-29"; },
      expectedError: "nextReviewOn must equal 2026-11-29 under the 3-month review cadence"
    },
    {
      name: "rejects an event gap for a lifecycle source",
      mutate(_lifecycle, events) { events.shift(); },
      expectedError: "has no change-register event"
    },
    {
      name: "rejects an appended event until its checkpoint is explicitly advanced",
      mutate(_lifecycle, events) {
        events.push(nextAppendEvent(events));
      },
      expectedError: "checkpoint must be advanced"
    },
    {
      name: "accepts a new event after its append-only checkpoint is advanced",
      mutate(_lifecycle, events) {
        events.push(nextAppendEvent(events));
        return { checkpoint: checkpointFor(events) };
      },
      expectedError: null
    },
    {
      name: "rejects rewriting a future event after it was checkpointed",
      mutate(_lifecycle, events) {
        events.push(nextAppendEvent(events));
        const checkpoint = checkpointFor(events);
        events.at(-1).summary = "Rewrote a later accepted source event.";
        return { checkpoint };
      },
      expectedError: "checkpoint integrity check failed"
    },
    {
      name: "rejects removing a future event after it was checkpointed",
      mutate(_lifecycle, events) {
        events.push(nextAppendEvent(events));
        const checkpoint = checkpointFor(events);
        events.splice(events.length - 1, 1);
        return { checkpoint };
      },
      expectedError: "checkpoint records 60 events"
    },
    {
      name: "accepts a future tail that preserves every event from the selected base revision",
      mutate(_lifecycle, events) {
        const acceptedBaseEvents = clone(events);
        events.push(nextAppendEvent(events));
        return { checkpoint: checkpointFor(events), acceptedBaseEvents };
      },
      expectedError: null
    },
    {
      name: "rejects rewriting an event accepted on a later base revision",
      mutate(_lifecycle, events) {
        events.push(nextAppendEvent(events));
        const acceptedBaseEvents = clone(events);
        events.at(-1).summary = "Rewrote an event already accepted on the base revision.";
        return { checkpoint: checkpointFor(events), acceptedBaseEvents };
      },
      expectedError: "must preserve every source event accepted by the base revision"
    },
    {
      name: "rejects removing an event accepted on a later base revision",
      mutate(_lifecycle, events) {
        events.push(nextAppendEvent(events));
        const acceptedBaseEvents = clone(events);
        events.splice(events.length - 1, 1);
        return { checkpoint: checkpointFor(events), acceptedBaseEvents };
      },
      expectedError: "contains fewer source events than the base revision"
    },
    {
      name: "rejects non-canonical raw change-register JSON",
      mutate(_lifecycle, events) {
        return {
          checkpoint: checkpointFor(events),
          rawChangeRegisterText: `${JSON.stringify(events, null, 4)}\n`
        };
      },
      expectedError: "must use canonical two-space JSON"
    },
    {
      name: "rejects duplicate raw JSON keys that parsing would otherwise collapse",
      mutate(_lifecycle, events) {
        const canonical = `${JSON.stringify(events, null, 2)}\n`;
        const duplicated = canonical.replace(
          `    \"id\": \"${events[0].id}\",`,
          `    \"id\": \"SRC-20000101-001\",\n    \"id\": \"${events[0].id}\","`
        );
        return { checkpoint: checkpointFor(events), rawChangeRegisterText: duplicated };
      },
      expectedError: "must use canonical two-space JSON"
    },
    {
      name: "rejects reordered event keys even when JSON parsing preserves that order",
      mutate(_lifecycle, events) {
        const reordered = clone(events);
        const first = reordered[0];
        reordered[0] = {
          summary: first.summary,
          type: first.type,
          recordedOn: first.recordedOn,
          sourceKey: first.sourceKey,
          id: first.id
        };
        return {
          checkpoint: checkpointFor(events),
          rawChangeRegisterText: `${JSON.stringify(reordered, null, 2)}\n`
        };
      },
      expectedError: "must use canonical two-space JSON"
    },
    {
      name: "rejects checkpoint digest drift",
      mutate(_lifecycle, events) {
        const checkpoint = checkpointFor(events);
        checkpoint.sha256 = "0".repeat(64);
        return { checkpoint };
      },
      expectedError: "checkpoint integrity check failed"
    },
    {
      name: "rejects checkpoint count drift",
      mutate(_lifecycle, events) {
        const checkpoint = checkpointFor(events);
        checkpoint.eventCount += 1;
        return { checkpoint };
      },
      expectedError: "checkpoint records 60 events"
    },
    {
      name: "rejects checkpoint anchor-ID drift",
      mutate(_lifecycle, events) {
        const checkpoint = checkpointFor(events);
        checkpoint.lastEventId = events[0].id;
        return { checkpoint };
      },
      expectedError: "lastEventId does not match"
    },
    {
      name: "rejects unknown checkpoint canonicalization",
      mutate(_lifecycle, events) {
        const checkpoint = checkpointFor(events);
        checkpoint.canonicalization = "unknown";
        return { checkpoint };
      },
      expectedError: "checkpoint canonicalization must be"
    },
    {
      name: "rejects non-canonical checkpoint JSON",
      mutate(_lifecycle, events) {
        const checkpoint = checkpointFor(events);
        return {
          checkpoint,
          rawCheckpointText: `${JSON.stringify(checkpoint)}\n`
        };
      },
      expectedError: "must use canonical two-space JSON"
    },
    {
      name: "rejects rewriting an event in the immutable baseline",
      mutate(_lifecycle, events) {
        events[0].summary = "Rewrote a previously recorded source event.";
      },
      expectedError: "Immutable source-event prefix integrity check failed"
    },
    {
      name: "rejects truncating the immutable event baseline",
      mutate(_lifecycle, events) { events.splice(17, 1); },
      expectedError: "must retain at least 59 events"
    },
    {
      name: "rejects duplicate event IDs",
      mutate(_lifecycle, events) { events[1].id = events[0].id; },
      expectedError: "Duplicate source event ID"
    },
    {
      name: "rejects an uncontrolled event type",
      mutate(_lifecycle, events) { events[0].type = "reviewed-again"; },
      expectedError: "has unsupported type"
    },
    {
      name: "rejects event fields outside the exact contract",
      mutate(_lifecycle, events) { events[0].reviewer = "Example"; },
      expectedError: "must contain exactly id, sourceKey, recordedOn, type, summary and optional previous"
    },
    {
      name: "rejects an event ID whose date disagrees with recordedOn",
      mutate(_lifecycle, events) { events[0].recordedOn = "2026-08-28"; },
      expectedError: "date component must match recordedOn"
    },
    {
      name: "rejects events outside chronological ID order",
      mutate(_lifecycle, events) { events.reverse(); },
      expectedError: "Change-register events must be ordered by recordedOn and id"
    },
    {
      name: "rejects an event for an unknown lifecycle source",
      mutate(_lifecycle, events) { events[0].sourceKey = "core/personnel-security/not-a-source"; },
      expectedError: "references an unknown lifecycle source"
    },
    {
      name: "rejects previous metadata on a verified event",
      mutate(_lifecycle, events) { events[0].previous = "old value"; },
      expectedError: "verified event must not declare previous"
    },
    {
      name: "rejects a superseding event without its predecessor",
      mutate(_lifecycle, events) { events[0].type = "superseded"; },
      expectedError: "superseded event requires a previous predecessor source key"
    },
    {
      name: "rejects a URL-change event without its former URL",
      mutate(_lifecycle, events) { events[0].type = "url-changed"; },
      expectedError: "url-changed event requires previous"
    },
    {
      name: "accepts a valid predecessor reference on a superseding source",
      mutate(_lifecycle, events) {
        const appended = nextAppendEvent(events, {
          sourceKey: events[1].sourceKey,
          type: "superseded",
          summary: "Recorded a successor relationship after the immutable baseline.",
          previous: events[0].sourceKey
        });
        events.push(appended);
        return { checkpoint: checkpointFor(events) };
      },
      expectedError: null
    },
    {
      name: "rejects an unknown predecessor source",
      mutate(_lifecycle, events) {
        events[0].type = "superseded";
        events[0].previous = "core/personnel-security/not-a-source";
      },
      expectedError: "references an unknown predecessor source"
    },
    {
      name: "rejects a cyclic succession graph",
      mutate(_lifecycle, events) {
        events[0].type = "superseded";
        events[0].previous = events[1].sourceKey;
        events[1].type = "superseded";
        events[1].previous = events[0].sourceKey;
      },
      expectedError: "Source succession graph contains a cycle"
    },
    {
      name: "rejects two successors for one predecessor",
      mutate(_lifecycle, events) {
        events[1].type = "superseded";
        events[1].previous = events[0].sourceKey;
        events[2].type = "superseded";
        events[2].previous = events[0].sourceKey;
      },
      expectedError: "has more than one successor"
    },
    {
      name: "rejects a non-HTTPS previous URL",
      mutate(_lifecycle, events) {
        events[0].type = "url-changed";
        events[0].previous = "http://example.invalid/old";
      },
      expectedError: "previous must be an absolute HTTPS URL"
    }
  ];

  let failures = 0;
  for (const testCase of cases) {
    const lifecycle = clone(lifecycleRegister);
    const events = clone(changeEvents);
    const options = testCase.mutate(lifecycle, events) ?? {};
    const errors = validateSourceRegister(lifecycle, events, canonicalSources, options);
    const extraError = testCase.extraCheck?.(lifecycle) ?? null;
    const passed = testCase.expectedError === null
      ? errors.length === 0 && !extraError
      : errors.some((error) => error.includes(testCase.expectedError));
    if (passed) {
      console.log(`PASS — ${testCase.name}`);
    } else {
      failures += 1;
      console.error(`FAIL — ${testCase.name}`);
      if (extraError) console.error(extraError);
      if (errors.length) console.error(errors.map((error) => `- ${error}`).join("\n"));
    }
  }
  if (failures) process.exit(1);
  console.log(`SOURCE REGISTER MUTATION TESTS PASSED — ${cases.length} cases.`);
}

function parseArguments(args) {
  const parsed = {
    testMutations: false,
    advanceCheckpoint: false,
    confirmedAppendOnlyReview: false,
    againstGitRef: null
  };
  const seen = new Set();

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (seen.has(argument)) throw new Error(`Duplicate argument: ${argument}`);
    seen.add(argument);
    if (argument === "--test-mutations") {
      parsed.testMutations = true;
    } else if (argument === "--advance-checkpoint") {
      parsed.advanceCheckpoint = true;
    } else if (argument === "--confirm-append-only-review") {
      parsed.confirmedAppendOnlyReview = true;
    } else if (argument === "--against-git-ref") {
      const gitRef = args[index + 1];
      if (!gitRef || !/^[a-f0-9]{40}$/.test(gitRef)) {
        throw new Error("--against-git-ref requires one lowercase 40-character hexadecimal commit SHA.");
      }
      parsed.againstGitRef = gitRef;
      index += 1;
    } else {
      throw new Error(`Unknown argument: ${argument}`);
    }
  }

  if (parsed.testMutations && args.length !== 1) {
    throw new Error("--test-mutations cannot be combined with checkpoint or git-history options.");
  }
  if (parsed.advanceCheckpoint && !parsed.confirmedAppendOnlyReview) {
    throw new Error("--advance-checkpoint requires --confirm-append-only-review after explicit human review.");
  }
  if (!parsed.advanceCheckpoint && parsed.confirmedAppendOnlyReview) {
    throw new Error("--confirm-append-only-review is valid only with --advance-checkpoint.");
  }
  return parsed;
}

function isExactGenesisCandidate(events, checkpoint) {
  return Array.isArray(events) &&
    events.length === GENESIS_EVENT_PREFIX.count &&
    sha256(stableJson(events)) === GENESIS_EVENT_PREFIX.sha256 &&
    hasExactKeys(checkpoint, CHECKPOINT_FIELDS) &&
    checkpoint.schemaVersion === CHECKPOINT_SCHEMA_VERSION &&
    checkpoint.canonicalization === EVENT_CANONICALIZATION &&
    checkpoint.eventCount === GENESIS_EVENT_PREFIX.count &&
    checkpoint.lastEventId === events.at(-1)?.id &&
    checkpoint.sha256 === GENESIS_EVENT_PREFIX.sha256;
}

function loadBaseEventsFromGit(
  gitRef,
  runGit = execFileSync,
  candidateEvents = changeEvents,
  candidateCheckpoint = changeCheckpoint
) {
  try {
    const objectType = runGit("git", ["--no-replace-objects", "cat-file", "-t", gitRef], {
      cwd: fileURLToPath(projectRoot),
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"]
    }).trim();
    if (objectType !== "commit") {
      throw new Error(`object type is ${objectType || "unknown"}, not commit`);
    }
    runGit("git", ["--no-replace-objects", "merge-base", "--is-ancestor", gitRef, "HEAD"], {
      cwd: fileURLToPath(projectRoot),
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"]
    });
  } catch (error) {
    const detail = String(error?.stderr ?? error?.message ?? "git merge-base failed").trim();
    throw new Error(`Base commit ${gitRef} must exist locally and be an ancestor of HEAD: ${detail}`);
  }

  let historicalPath;
  try {
    historicalPath = runGit(
      "git",
      ["--no-replace-objects", "ls-tree", "--name-only", gitRef, "--", "source-change-register.json"],
      {
        cwd: fileURLToPath(projectRoot),
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"]
      }
    ).trim();
  } catch (error) {
    const detail = String(error?.stderr ?? error?.message ?? "git ls-tree failed").trim();
    throw new Error(`Could not inspect base commit ${gitRef} for source-change-register.json: ${detail}`);
  }

  if (historicalPath === "") {
    if (isExactGenesisCandidate(candidateEvents, candidateCheckpoint)) return [];
    throw new Error(
      `Base commit ${gitRef} lacks source-change-register.json; this is allowed only for the exact pinned genesis candidate.`
    );
  }
  if (historicalPath !== "source-change-register.json") {
    throw new Error(`Base commit ${gitRef} returned an unexpected source-register path: ${historicalPath}.`);
  }

  let rawText;
  try {
    rawText = runGit("git", ["--no-replace-objects", "show", `${gitRef}:source-change-register.json`], {
      cwd: fileURLToPath(projectRoot),
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"]
    });
  } catch (error) {
    const detail = String(error?.stderr ?? error?.message ?? "git show failed").trim();
    throw new Error(`Could not read source-change-register.json from base commit ${gitRef}: ${detail}`);
  }

  let baseEvents;
  try {
    baseEvents = JSON.parse(rawText);
  } catch (error) {
    throw new Error(`Base commit ${gitRef} contains invalid source-change-register JSON: ${error.message}`);
  }
  const errors = [];
  validateCanonicalJsonText(errors, `Base commit ${gitRef} source change register`, rawText, baseEvents, "events");
  if (errors.length) throw new Error(errors.join("\n"));
  if (!Array.isArray(baseEvents)) {
    throw new Error(`Base commit ${gitRef} source-change-register.json must be an array.`);
  }
  if (
    baseEvents.length < GENESIS_EVENT_PREFIX.count ||
    sha256(stableJson(baseEvents.slice(0, GENESIS_EVENT_PREFIX.count))) !== GENESIS_EVENT_PREFIX.sha256
  ) {
    throw new Error(`Base commit ${gitRef} does not preserve the validated ${GENESIS_EVENT_PREFIX.count}-event genesis prefix.`);
  }
  return baseEvents;
}

function writeCheckpointAtomically(targetUrl, checkpoint) {
  const checkpointPath = fileURLToPath(targetUrl);
  const temporaryPath = `${checkpointPath}.tmp-${process.pid}`;
  try {
    fs.writeFileSync(temporaryPath, canonicalJson(checkpoint, "checkpoint"), {
      encoding: "utf8",
      flag: "wx"
    });
    fs.renameSync(temporaryPath, checkpointPath);
  } finally {
    fs.rmSync(temporaryPath, { force: true });
  }
}

function runCommandContractTests() {
  const fullSha = "a".repeat(40);
  const cases = [
    {
      name: "accepts a strict full-SHA base comparison argument",
      run() {
        const parsed = parseArguments(["--against-git-ref", fullSha]);
        return parsed.againstGitRef === fullSha;
      }
    },
    {
      name: "rejects a short git ref",
      run() {
        try { parseArguments(["--against-git-ref", "main"]); } catch { return true; }
        return false;
      }
    },
    {
      name: "rejects an uppercase git ref",
      run() {
        try { parseArguments(["--against-git-ref", "A".repeat(40)]); } catch { return true; }
        return false;
      }
    },
    {
      name: "rejects duplicate command flags",
      run() {
        try { parseArguments(["--advance-checkpoint", "--advance-checkpoint", "--confirm-append-only-review"]); } catch { return true; }
        return false;
      }
    },
    {
      name: "requires explicit review confirmation before checkpoint advancement",
      run() {
        try { parseArguments(["--advance-checkpoint"]); } catch { return true; }
        return false;
      }
    },
    {
      name: "loads a canonical base register only after commit and ancestry checks",
      run() {
        const calls = [];
        const runGit = (_command, argumentsList) => {
          calls.push(argumentsList);
          if (argumentsList.includes("cat-file")) return "commit\n";
          if (argumentsList.includes("merge-base")) return "";
          if (argumentsList.includes("ls-tree")) return "source-change-register.json\n";
          if (argumentsList.includes("show")) return changeRegisterText;
          throw new Error("Unexpected git command.");
        };
        const baseEvents = loadBaseEventsFromGit(fullSha, runGit);
        return baseEvents.length === changeEvents.length && calls.length === 4 &&
          calls.every((argumentsList) => argumentsList[0] === "--no-replace-objects");
      }
    },
    {
      name: "rejects a full SHA that is not a commit",
      run() {
        const runGit = () => "blob\n";
        try { loadBaseEventsFromGit(fullSha, runGit); } catch (error) { return error.message.includes("not commit"); }
        return false;
      }
    },
    {
      name: "rejects a commit that is not an ancestor",
      run() {
        const runGit = (_command, argumentsList) => {
          if (argumentsList.includes("cat-file")) return "commit\n";
          throw new Error("not an ancestor");
        };
        try { loadBaseEventsFromGit(fullSha, runGit); } catch (error) { return error.message.includes("ancestor of HEAD"); }
        return false;
      }
    },
    {
      name: "allows a missing historical register only for the exact pinned genesis candidate",
      run() {
        const runGit = (_command, argumentsList) => {
          if (argumentsList.includes("cat-file")) return "commit\n";
          if (argumentsList.includes("merge-base")) return "";
          if (argumentsList.includes("ls-tree")) return "";
          throw new Error("Unexpected git command.");
        };
        return loadBaseEventsFromGit(fullSha, runGit).length === 0;
      }
    },
    {
      name: "rejects a missing historical register for any post-genesis candidate",
      run() {
        const runGit = (_command, argumentsList) => {
          if (argumentsList.includes("cat-file")) return "commit\n";
          if (argumentsList.includes("merge-base")) return "";
          if (argumentsList.includes("ls-tree")) return "";
          throw new Error("Unexpected git command.");
        };
        const futureEvents = clone(changeEvents);
        futureEvents.push(nextAppendEvent(futureEvents));
        try {
          loadBaseEventsFromGit(fullSha, runGit, futureEvents, checkpointFor(futureEvents));
        } catch (error) {
          return error.message.includes("exact pinned genesis candidate");
        }
        return false;
      }
    },
    {
      name: "writes an advanced checkpoint through an atomic same-directory replacement",
      run() {
        const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "csm-source-checkpoint-"));
        const targetPath = path.join(temporaryDirectory, "checkpoint.json");
        try {
          fs.writeFileSync(targetPath, changeCheckpointText, "utf8");
          const futureEvents = clone(changeEvents);
          futureEvents.push(nextAppendEvent(futureEvents));
          const advanced = checkpointFor(futureEvents);
          writeCheckpointAtomically(pathToFileURL(targetPath), advanced);
          const actual = fs.readFileSync(targetPath, "utf8");
          const leftovers = fs.readdirSync(temporaryDirectory).filter((entry) => entry.includes(".tmp-"));
          return actual === canonicalJson(advanced, "checkpoint") && leftovers.length === 0;
        } finally {
          fs.rmSync(temporaryDirectory, { recursive: true, force: true });
        }
      }
    }
  ];

  let failures = 0;
  for (const testCase of cases) {
    let passed = false;
    try { passed = testCase.run() === true; } catch (error) { console.error(error); }
    if (passed) {
      console.log(`PASS — ${testCase.name}`);
    } else {
      failures += 1;
      console.error(`FAIL — ${testCase.name}`);
    }
  }
  if (failures) process.exit(1);
  console.log(`SOURCE REGISTER COMMAND TESTS PASSED — ${cases.length} cases.`);
}

function exitWithErrors(errors) {
  if (!errors.length) return;
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}

const canonicalSources = buildCanonicalSources();
let argumentsParsed;
try {
  argumentsParsed = parseArguments(process.argv.slice(2));
} catch (error) {
  console.error(`- ${error.message}`);
  process.exit(1);
}

if (argumentsParsed.testMutations) {
  runMutationTests(canonicalSources);
  runCommandContractTests();
} else {
  let acceptedBaseEvents;
  if (argumentsParsed.againstGitRef) {
    try {
      acceptedBaseEvents = loadBaseEventsFromGit(argumentsParsed.againstGitRef);
    } catch (error) {
      console.error(`- ${error.message}`);
      process.exit(1);
    }
  }

  const validationOptions = {
    checkpoint: changeCheckpoint,
    rawLifecycleRegisterText: lifecycleRegisterText,
    rawChangeRegisterText: changeRegisterText,
    rawCheckpointText: changeCheckpointText,
    acceptedBaseEvents,
    allowUncheckpointedTail: argumentsParsed.advanceCheckpoint
  };
  const errors = validateSourceRegister(lifecycleRegister, changeEvents, canonicalSources, validationOptions);

  if (
    argumentsParsed.advanceCheckpoint &&
    isRecord(changeCheckpoint) &&
    Number.isSafeInteger(changeCheckpoint.eventCount) &&
    changeEvents.length <= changeCheckpoint.eventCount
  ) {
    errors.push(
      `Checkpoint advancement requires at least one appended event; both files currently cover ${changeEvents.length} events.`
    );
  }

  exitWithErrors(errors);

  if (argumentsParsed.advanceCheckpoint) {
    const advancedCheckpoint = checkpointFor(changeEvents);
    writeCheckpointAtomically(changeCheckpointUrl, advancedCheckpoint);
    console.log(
      `SOURCE REGISTER CHECKPOINT ADVANCED — ${advancedCheckpoint.eventCount} events through ` +
        `${advancedCheckpoint.lastEventId}; SHA-256 ${advancedCheckpoint.sha256}.`
    );
    process.exit(0);
  }

  console.log(
    `SOURCE REGISTER VALIDATION PASSED — ${lifecycleRegister.sources.length} lifecycle records and ` +
      `${changeEvents.length} change-register events; checkpoint ${changeCheckpoint.sha256}.`
  );
}
