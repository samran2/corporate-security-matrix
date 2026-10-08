"use strict";

((root) => {
  const ASSESSMENT_SCHEMA = "csm-assessment";
  const ASSESSMENT_SCHEMA_VERSION = 1;
  const FRAMEWORK_VERSION_PATTERN = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;
  const CANONICAL_DOMAIN_IDS = Object.freeze([
    "personnel-security",
    "premises-security",
    "rescue-safety",
    "security-of-production-and-operations",
    "environmental-safety",
    "information-and-cyber-security",
    "compliance-control",
    "contingency-and-crisis-management",
    "industrial-safety"
  ]);
  const CANONICAL_PHASE_IDS = Object.freeze(["identify", "protect", "detect", "respond", "recover"]);
  const TEXT_LIMITS = Object.freeze({ criticalGap: 500, nextAction: 500, ownerRole: 120 });
  const ASSESSMENT_KEYS = Object.freeze([
    "schema",
    "schemaVersion",
    "frameworkVersion",
    "overlay",
    "createdAt",
    "updatedAt",
    "cells"
  ]);
  const CELL_KEYS = Object.freeze(["maturity", "confidence", "criticalGap", "nextAction", "ownerRole"]);
  const CONFIDENCE_KEYS = Object.freeze(["controlEvidence", "independentChallenge", "exerciseRecency"]);

  class AssessmentModelError extends Error {
    constructor(code, message) {
      super(message);
      this.name = "AssessmentModelError";
      this.code = code;
    }
  }

  const fail = (code, message) => {
    throw new AssessmentModelError(code, message);
  };

  const isPlainObject = (value) => {
    if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
  };

  const hasExactKeys = (value, expected) => {
    if (!isPlainObject(value)) return false;
    const actual = Object.keys(value).sort();
    const wanted = [...expected].sort();
    return actual.length === wanted.length && actual.every((key, index) => key === wanted[index]);
  };

  const isIsoTimestamp = (value) => {
    if (typeof value !== "string") return false;
    const parsed = new Date(value);
    return !Number.isNaN(parsed.getTime()) && parsed.toISOString() === value;
  };

  const resolveTimestamp = (value) => {
    const timestamp = value === undefined ? new Date().toISOString() : value;
    if (!isIsoTimestamp(timestamp)) fail("INVALID_TIMESTAMP", "Assessment timestamps must be ISO 8601 UTC values.");
    return timestamp;
  };

  const validateDefinitionSet = (definitions, canonicalIds, label, titleKey) => {
    if (!Array.isArray(definitions) || definitions.length !== canonicalIds.length) {
      fail("INVALID_DEFINITIONS", `Expected exactly ${canonicalIds.length} canonical ${label}.`);
    }

    definitions.forEach((definition, index) => {
      if (!isPlainObject(definition) || definition.id !== canonicalIds[index]) {
        fail("INVALID_DEFINITIONS", `The canonical ${label} order does not match the assessment contract.`);
      }
      if (typeof definition[titleKey] !== "string" || !definition[titleKey].trim()) {
        fail("INVALID_DEFINITIONS", `Every ${label.slice(0, -1)} needs a display name.`);
      }
    });
  };

  const validateDefinitions = (domains, phases) => {
    validateDefinitionSet(domains, CANONICAL_DOMAIN_IDS, "domains", "name");
    validateDefinitionSet(phases, CANONICAL_PHASE_IDS, "phases", "title");
    return { domains, phases };
  };

  const createEmptyCell = () => ({
    maturity: null,
    confidence: {
      controlEvidence: null,
      independentChallenge: null,
      exerciseRecency: null
    },
    criticalGap: "",
    nextAction: "",
    ownerRole: ""
  });

  const getCellIds = (domains, phases) => domains.flatMap((domain) =>
    phases.map((phase) => `${domain.id}.${phase.id}`)
  );

  const createAssessment = ({ domains, phases, frameworkVersion, now } = {}) => {
    validateDefinitions(domains, phases);
    if (typeof frameworkVersion !== "string" || !FRAMEWORK_VERSION_PATTERN.test(frameworkVersion)) {
      fail("INVALID_FRAMEWORK_VERSION", "A semantic framework version is required.");
    }
    const timestamp = resolveTimestamp(now);
    const cells = {};
    getCellIds(domains, phases).forEach((cellId) => {
      cells[cellId] = createEmptyCell();
    });

    return {
      schema: ASSESSMENT_SCHEMA,
      schemaVersion: ASSESSMENT_SCHEMA_VERSION,
      frameworkVersion,
      overlay: null,
      createdAt: timestamp,
      updatedAt: timestamp,
      cells
    };
  };

  const validateScore = (value, field, cellId) => {
    if (value === null) return;
    if (!Number.isInteger(value) || value < 0 || value > 4) {
      fail("INVALID_CELL", `${cellId}.${field} must be null or an integer from 0 to 4.`);
    }
  };

  const validateBoundedText = (value, field, cellId) => {
    if (typeof value !== "string" || Array.from(value).length > TEXT_LIMITS[field]) {
      fail("INVALID_CELL", `${cellId}.${field} must be text no longer than ${TEXT_LIMITS[field]} characters.`);
    }
  };

  const validateCell = (cell, cellId) => {
    if (!hasExactKeys(cell, CELL_KEYS) || !hasExactKeys(cell.confidence, CONFIDENCE_KEYS)) {
      fail("INVALID_CELL", `${cellId} does not match the assessment cell contract.`);
    }
    validateScore(cell.maturity, "maturity", cellId);
    CONFIDENCE_KEYS.forEach((field) => validateScore(cell.confidence[field], `confidence.${field}`, cellId));
    Object.keys(TEXT_LIMITS).forEach((field) => validateBoundedText(cell[field], field, cellId));
    return cell;
  };

  const validateAssessment = (assessment, domains, phases) => {
    validateDefinitions(domains, phases);
    if (!isPlainObject(assessment)) fail("INVALID_ASSESSMENT", "The assessment must be a JSON object.");
    if (assessment.schema !== ASSESSMENT_SCHEMA) {
      fail("INVALID_ASSESSMENT", "The file is not a Corporate Security Matrix assessment.");
    }
    if (assessment.schemaVersion !== ASSESSMENT_SCHEMA_VERSION) {
      fail("UNSUPPORTED_SCHEMA", "This assessment schema version is not supported.");
    }
    if (!hasExactKeys(assessment, ASSESSMENT_KEYS)) {
      fail("INVALID_ASSESSMENT", "The assessment contains missing or unknown top-level fields.");
    }
    if (typeof assessment.frameworkVersion !== "string" || !FRAMEWORK_VERSION_PATTERN.test(assessment.frameworkVersion)) {
      fail("INVALID_ASSESSMENT", "The assessment framework version is invalid.");
    }
    if (assessment.overlay !== null && (
      !hasExactKeys(assessment.overlay, ["id", "version"]) ||
      typeof assessment.overlay.id !== "string" ||
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(assessment.overlay.id) ||
      typeof assessment.overlay.version !== "string" ||
      !FRAMEWORK_VERSION_PATTERN.test(assessment.overlay.version)
    )) {
      fail("INVALID_ASSESSMENT", "The assessment overlay metadata is invalid.");
    }
    if (!isIsoTimestamp(assessment.createdAt) || !isIsoTimestamp(assessment.updatedAt)) {
      fail("INVALID_ASSESSMENT", "The assessment timestamps are invalid.");
    }
    if (assessment.updatedAt < assessment.createdAt) {
      fail("INVALID_ASSESSMENT", "The assessment update timestamp precedes its creation timestamp.");
    }
    if (!isPlainObject(assessment.cells)) {
      fail("INVALID_ASSESSMENT", "The assessment cells must be a JSON object.");
    }

    const expectedCellIds = getCellIds(domains, phases);
    const actualCellIds = Object.keys(assessment.cells);
    if (
      actualCellIds.length !== expectedCellIds.length ||
      actualCellIds.some((cellId) => !expectedCellIds.includes(cellId))
    ) {
      fail("INVALID_ASSESSMENT", "The assessment must contain exactly the 45 canonical cells.");
    }
    expectedCellIds.forEach((cellId) => validateCell(assessment.cells[cellId], cellId));
    return assessment;
  };

  const normalizeCellPatch = (current, patch, cellId) => {
    if (!isPlainObject(patch)) fail("INVALID_CELL", `${cellId} update must be an object.`);
    const allowed = new Set(CELL_KEYS);
    if (Object.keys(patch).some((key) => !allowed.has(key))) {
      fail("INVALID_CELL", `${cellId} update contains an unknown field.`);
    }

    const confidencePatch = patch.confidence === undefined ? {} : patch.confidence;
    if (!isPlainObject(confidencePatch) || Object.keys(confidencePatch).some((key) => !CONFIDENCE_KEYS.includes(key))) {
      fail("INVALID_CELL", `${cellId}.confidence update contains an unknown field.`);
    }

    const normalizeText = (field) => {
      if (patch[field] === undefined) return current[field];
      if (typeof patch[field] !== "string") {
        fail("INVALID_CELL", `${cellId}.${field} must be text.`);
      }
      return patch[field].trim();
    };

    const next = {
      maturity: patch.maturity === undefined ? current.maturity : patch.maturity,
      confidence: {
        controlEvidence: confidencePatch.controlEvidence === undefined
          ? current.confidence.controlEvidence
          : confidencePatch.controlEvidence,
        independentChallenge: confidencePatch.independentChallenge === undefined
          ? current.confidence.independentChallenge
          : confidencePatch.independentChallenge,
        exerciseRecency: confidencePatch.exerciseRecency === undefined
          ? current.confidence.exerciseRecency
          : confidencePatch.exerciseRecency
      },
      criticalGap: normalizeText("criticalGap"),
      nextAction: normalizeText("nextAction"),
      ownerRole: normalizeText("ownerRole")
    };
    return validateCell(next, cellId);
  };

  const updateAssessmentCell = (assessment, cellId, patch, { domains, phases, now } = {}) => {
    validateAssessment(assessment, domains, phases);
    if (!Object.prototype.hasOwnProperty.call(assessment.cells, cellId)) {
      fail("INVALID_CELL", "The selected assessment cell is not canonical.");
    }
    const updatedCell = normalizeCellPatch(assessment.cells[cellId], patch, cellId);
    const proposedTimestamp = resolveTimestamp(now);
    const updatedAt = proposedTimestamp < assessment.updatedAt ? assessment.updatedAt : proposedTimestamp;
    return {
      ...assessment,
      updatedAt,
      cells: { ...assessment.cells, [cellId]: updatedCell }
    };
  };

  const isFullyAssessed = (cell) => cell.maturity !== null &&
    CONFIDENCE_KEYS.every((field) => cell.confidence[field] !== null);

  const round = (value, places = 1) => {
    const factor = 10 ** places;
    return Math.round((value + Number.EPSILON) * factor) / factor;
  };

  const calculateConfidence = (confidence) => {
    if (!hasExactKeys(confidence, CONFIDENCE_KEYS)) return null;
    if (CONFIDENCE_KEYS.some((field) => confidence[field] === null)) return null;
    CONFIDENCE_KEYS.forEach((field) => validateScore(confidence[field], field, "confidence"));
    return round((
      confidence.controlEvidence * 0.5 +
      confidence.independentChallenge * 0.3 +
      confidence.exerciseRecency * 0.2
    ) * 25);
  };

  const summarizeAssessment = (assessment, domains, phases) => {
    validateAssessment(assessment, domains, phases);
    const totalCells = domains.length * phases.length;
    const fullyAssessed = [];
    const maturityAssessed = [];
    const confidenceAssessed = [];
    const maturityDistribution = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 };
    const phaseTotals = new Map(phases.map((phase) => [phase.id, { total: 0, count: 0 }]));

    getCellIds(domains, phases).forEach((cellId) => {
      const cell = assessment.cells[cellId];
      const phaseId = cellId.slice(cellId.lastIndexOf(".") + 1);
      const confidence = calculateConfidence(cell.confidence);
      if (cell.maturity !== null) {
        maturityAssessed.push({ cellId, cell });
        maturityDistribution[cell.maturity] += 1;
        const phaseTotal = phaseTotals.get(phaseId);
        phaseTotal.total += cell.maturity;
        phaseTotal.count += 1;
      }
      if (confidence !== null) confidenceAssessed.push({ cellId, confidence });
      if (isFullyAssessed(cell)) fullyAssessed.push({ cellId, cell, confidence });
    });

    const maturityIndex = maturityAssessed.length
      ? round(maturityAssessed.reduce((sum, entry) => sum + entry.cell.maturity, 0) / maturityAssessed.length)
      : null;
    const confidenceIndex = confidenceAssessed.length
      ? round(confidenceAssessed.reduce((sum, entry) => sum + entry.confidence, 0) / confidenceAssessed.length)
      : null;
    const weakestPhase = phases
      .map((phase) => {
        const totals = phaseTotals.get(phase.id);
        return totals.count ? { id: phase.id, title: phase.title, maturity: round(totals.total / totals.count) } : null;
      })
      .filter(Boolean)
      .sort((left, right) => left.maturity - right.maturity)[0] || null;

    const prioritizedActions = getCellIds(domains, phases)
      .filter((cellId) => assessment.cells[cellId].nextAction)
      .map((cellId) => {
        const separator = cellId.lastIndexOf(".");
        const domainId = cellId.slice(0, separator);
        const phaseId = cellId.slice(separator + 1);
        const cell = assessment.cells[cellId];
        return {
          cellId,
          domainId,
          domainName: domains.find((domain) => domain.id === domainId).name,
          phaseId,
          phaseTitle: phases.find((phase) => phase.id === phaseId).title,
          maturity: cell.maturity,
          confidence: calculateConfidence(cell.confidence),
          criticalGap: cell.criticalGap,
          nextAction: cell.nextAction,
          ownerRole: cell.ownerRole
        };
      })
      .sort((left, right) => {
        const leftMaturity = left.maturity === null ? 5 : left.maturity;
        const rightMaturity = right.maturity === null ? 5 : right.maturity;
        if (leftMaturity !== rightMaturity) return leftMaturity - rightMaturity;
        const leftConfidence = left.confidence === null ? 101 : left.confidence;
        const rightConfidence = right.confidence === null ? 101 : right.confidence;
        return leftConfidence - rightConfidence;
      })
      .slice(0, 5);

    return {
      totalCells,
      assessedCells: fullyAssessed.length,
      maturityAssessedCells: maturityAssessed.length,
      confidenceAssessedCells: confidenceAssessed.length,
      isComplete: fullyAssessed.length === totalCells,
      coveragePercent: round((fullyAssessed.length / totalCells) * 100),
      maturityCoveragePercent: round((maturityAssessed.length / totalCells) * 100),
      confidenceCoveragePercent: round((confidenceAssessed.length / totalCells) * 100),
      maturityIndex,
      confidenceIndex,
      maturityDistribution,
      weakestPhase,
      prioritizedActions
    };
  };

  const api = Object.freeze({
    ASSESSMENT_SCHEMA,
    ASSESSMENT_SCHEMA_VERSION,
    CANONICAL_DOMAIN_IDS,
    CANONICAL_PHASE_IDS,
    TEXT_LIMITS,
    AssessmentModelError,
    calculateConfidence,
    createAssessment,
    getCellIds,
    summarizeAssessment,
    updateAssessmentCell,
    validateAssessment,
    validateDefinitions
  });

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.AssessmentModel = api;
})(typeof globalThis === "undefined" ? this : globalThis);
