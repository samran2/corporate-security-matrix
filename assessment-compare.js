"use strict";

((root) => {
  const COMPARISON_SCHEMA = "csm-assessment-comparison";
  const COMPARISON_SCHEMA_VERSION = 1;
  const BOARD_SCHEMA = "csm-board-summary";
  const BOARD_SCHEMA_VERSION = 1;
  const MAX_BOARD_FINDINGS = 5;
  const DECISION_TEXT_LIMIT = 500;

  class AssessmentComparisonError extends Error {
    constructor(code, message) {
      super(message);
      this.name = "AssessmentComparisonError";
      this.code = code;
    }
  }

  const fail = (code, message) => {
    throw new AssessmentComparisonError(code, message);
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

  const getModel = (override) => {
    if (override) return override;
    if (root.AssessmentModel) return root.AssessmentModel;
    if (typeof require === "function") return require("./assessment-model.js");
    fail("MODEL_UNAVAILABLE", "The assessment model is unavailable.");
  };

  const round = (value, places = 1) => {
    const factor = 10 ** places;
    return Math.round((value + Number.EPSILON) * factor) / factor;
  };

  const mean = (values) => values.length
    ? round(values.reduce((sum, value) => sum + value, 0) / values.length)
    : null;

  const resolveTimestamp = (value) => {
    const timestamp = value === undefined ? new Date().toISOString() : value;
    const parsed = typeof timestamp === "string" ? new Date(timestamp) : null;
    if (!parsed || Number.isNaN(parsed.getTime()) || parsed.toISOString() !== timestamp) {
      fail("INVALID_TIMESTAMP", "Comparison timestamps must be ISO 8601 UTC values.");
    }
    return timestamp;
  };

  const validateInput = (assessment, label, model, domains, phases) => {
    try {
      return model.validateAssessment(assessment, domains, phases);
    } catch (error) {
      const suffix = error && error.code === "UNSUPPORTED_SCHEMA"
        ? " uses an unsupported assessment schema."
        : " is not a valid 45-cell assessment.";
      fail(`INVALID_${label.toUpperCase()}`, `The ${label}${suffix}`);
    }
  };

  const scoreState = (baseline, current) => {
    if (baseline === null && current === null) return "not-assessed";
    if (baseline === null) return "newly-assessed";
    if (current === null) return "no-longer-assessed";
    if (current > baseline) return "improved";
    if (current < baseline) return "regressed";
    return "unchanged";
  };

  const compareScore = (baseline, current) => ({
    baseline,
    current,
    delta: baseline === null || current === null ? null : round(current - baseline),
    state: scoreState(baseline, current)
  });

  const normalizeText = (value) => value.trim().replace(/\s+/gu, " ");

  const textState = (baseline, current) => {
    const previous = normalizeText(baseline);
    const next = normalizeText(current);
    if (!previous && !next) return "none";
    if (!previous) return "new";
    if (!next) return "removed";
    return previous === next ? "unchanged" : "changed";
  };

  const compareText = (baseline, current) => ({
    baseline,
    current,
    state: textState(baseline, current)
  });

  const coverage = (cellCount, totalCells) => ({
    cellCount,
    percent: round((cellCount / totalCells) * 100)
  });

  const summarizeSnapshot = (assessment, cellIds, model, domains, phases) => {
    const completeSummary = model.summarizeAssessment(assessment, domains, phases);
    const maturityCount = cellIds.filter((cellId) => assessment.cells[cellId].maturity !== null).length;
    const confidenceCount = cellIds.filter((cellId) =>
      model.calculateConfidence(assessment.cells[cellId].confidence) !== null
    ).length;
    return {
      frameworkVersion: assessment.frameworkVersion,
      overlay: assessment.overlay ? { ...assessment.overlay } : null,
      createdAt: assessment.createdAt,
      updatedAt: assessment.updatedAt,
      maturityIndex: completeSummary.maturityIndex,
      confidenceIndex: completeSummary.confidenceIndex,
      coverage: {
        maturity: coverage(maturityCount, cellIds.length),
        confidence: coverage(confidenceCount, cellIds.length),
        complete: coverage(completeSummary.assessedCells, cellIds.length)
      }
    };
  };

  const createCellComparison = (cellId, index, baseline, current, model, domains, phases) => {
    const separator = cellId.lastIndexOf(".");
    const domainId = cellId.slice(0, separator);
    const phaseId = cellId.slice(separator + 1);
    const baselineCell = baseline.cells[cellId];
    const currentCell = current.cells[cellId];
    return {
      index,
      cellId,
      domainId,
      domainName: domains.find((domain) => domain.id === domainId).name,
      phaseId,
      phaseTitle: phases.find((phase) => phase.id === phaseId).title,
      maturity: compareScore(baselineCell.maturity, currentCell.maturity),
      confidence: compareScore(
        model.calculateConfidence(baselineCell.confidence),
        model.calculateConfidence(currentCell.confidence)
      ),
      criticalGap: compareText(baselineCell.criticalGap, currentCell.criticalGap),
      nextAction: compareText(baselineCell.nextAction, currentCell.nextAction),
      ownerRole: compareText(baselineCell.ownerRole, currentCell.ownerRole)
    };
  };

  const overlayKey = (overlay) => overlay ? `${overlay.id}@${overlay.version}` : "core";

  const createCompatibility = (baseline, current) => {
    const sameFrameworkVersion = baseline.frameworkVersion === current.frameworkVersion;
    const sameOverlay = overlayKey(baseline.overlay) === overlayKey(current.overlay);
    const warnings = [];
    if (!sameFrameworkVersion) {
      warnings.push({
        code: "FRAMEWORK_VERSION_CHANGED",
        message: "Framework versions differ. Interpret changes in the context of both editions."
      });
    }
    if (!sameOverlay) {
      warnings.push({
        code: "OVERLAY_CHANGED",
        message: "Overlay context differs. Legal or standards context may affect interpretation."
      });
    }
    return { sameFrameworkVersion, sameOverlay, warnings };
  };

  const pairedDelta = (cells, field) => {
    const comparable = cells.filter((cell) => cell[field].delta !== null);
    return {
      cellCount: comparable.length,
      delta: mean(comparable.map((cell) => cell[field].delta))
    };
  };

  const selectCells = (cells, field, state) => cells.filter((cell) => cell[field].state === state);

  const findingTier = (cell) => {
    const hasGap = Boolean(normalizeText(cell.criticalGap.current));
    const hasAction = Boolean(normalizeText(cell.nextAction.current));
    const regressed = cell.maturity.state === "regressed";
    if (hasGap && regressed) return 0;
    if (regressed) return 1;
    if (hasGap && ["new", "changed"].includes(cell.criticalGap.state)) return 2;
    if (hasGap) return 3;
    if (hasAction) return 4;
    return 5;
  };

  const createSuggestedFindings = (cells) => cells
    .filter((cell) => findingTier(cell) < 5)
    .sort((left, right) => {
      const tierDifference = findingTier(left) - findingTier(right);
      if (tierDifference) return tierDifference;
      const leftDelta = left.maturity.delta === null ? 0 : left.maturity.delta;
      const rightDelta = right.maturity.delta === null ? 0 : right.maturity.delta;
      if (leftDelta !== rightDelta) return leftDelta - rightDelta;
      const leftMaturity = left.maturity.current === null ? 5 : left.maturity.current;
      const rightMaturity = right.maturity.current === null ? 5 : right.maturity.current;
      if (leftMaturity !== rightMaturity) return leftMaturity - rightMaturity;
      const leftConfidence = left.confidence.current === null ? 101 : left.confidence.current;
      const rightConfidence = right.confidence.current === null ? 101 : right.confidence.current;
      if (leftConfidence !== rightConfidence) return leftConfidence - rightConfidence;
      return left.index - right.index;
    })
    .map((cell) => {
      const basis = [];
      if (normalizeText(cell.criticalGap.current)) basis.push("open-critical-gap");
      if (cell.maturity.state === "regressed") basis.push("maturity-regression");
      if (normalizeText(cell.nextAction.current)) basis.push("next-action");
      return { cellId: cell.cellId, basis };
    });

  const compareAssessments = (baselineInput, currentInput, options = {}) => {
    const model = getModel(options.model);
    const domains = options.domains;
    const phases = options.phases;
    model.validateDefinitions(domains, phases);
    const baseline = validateInput(baselineInput, "baseline", model, domains, phases);
    const current = validateInput(currentInput, "current", model, domains, phases);
    const cellIds = model.getCellIds(domains, phases);
    const cells = cellIds.map((cellId, index) =>
      createCellComparison(cellId, index, baseline, current, model, domains, phases)
    );

    const result = {
      schema: COMPARISON_SCHEMA,
      schemaVersion: COMPARISON_SCHEMA_VERSION,
      generatedAt: resolveTimestamp(options.now),
      baseline: summarizeSnapshot(baseline, cellIds, model, domains, phases),
      current: summarizeSnapshot(current, cellIds, model, domains, phases),
      compatibility: createCompatibility(baseline, current),
      paired: {
        maturity: pairedDelta(cells, "maturity"),
        confidence: pairedDelta(cells, "confidence")
      },
      cells,
      improvedMaturityCells: selectCells(cells, "maturity", "improved"),
      regressedMaturityCells: selectCells(cells, "maturity", "regressed"),
      improvedConfidenceCells: selectCells(cells, "confidence", "improved"),
      regressedConfidenceCells: selectCells(cells, "confidence", "regressed"),
      newlyAssessedCells: selectCells(cells, "maturity", "newly-assessed"),
      noLongerAssessedCells: selectCells(cells, "maturity", "no-longer-assessed"),
      openCriticalGaps: cells.filter((cell) => normalizeText(cell.criticalGap.current)),
      actionPortfolio: cells.filter((cell) => normalizeText(cell.nextAction.current))
    };
    result.suggestedFindings = createSuggestedFindings(cells);
    return result;
  };

  const validateComparison = (comparison) => {
    if (
      !isPlainObject(comparison) ||
      comparison.schema !== COMPARISON_SCHEMA ||
      comparison.schemaVersion !== COMPARISON_SCHEMA_VERSION ||
      !Array.isArray(comparison.cells) ||
      comparison.cells.length !== 45 ||
      !isPlainObject(comparison.baseline) ||
      !isPlainObject(comparison.current) ||
      !isPlainObject(comparison.paired) ||
      !isPlainObject(comparison.compatibility)
    ) {
      fail("INVALID_COMPARISON", "A validated assessment comparison is required.");
    }
    return comparison;
  };

  const validateDecision = (decision) => {
    if (hasExactKeys(decision, ["status"]) && decision.status === "none") {
      return { status: "none" };
    }
    if (
      hasExactKeys(decision, ["status", "text"]) &&
      decision.status === "required" &&
      typeof decision.text === "string"
    ) {
      const text = decision.text.trim();
      if (text && Array.from(text).length <= DECISION_TEXT_LIMIT) {
        return { status: "required", text };
      }
    }
    fail(
      "INVALID_DECISION",
      `A required decision needs 1–${DECISION_TEXT_LIMIT} characters, or its status must be none.`
    );
  };

  const copySnapshotSummary = (snapshot) => ({
    frameworkVersion: snapshot.frameworkVersion,
    overlay: snapshot.overlay ? { ...snapshot.overlay } : null,
    createdAt: snapshot.createdAt,
    updatedAt: snapshot.updatedAt,
    maturityIndex: snapshot.maturityIndex,
    confidenceIndex: snapshot.confidenceIndex,
    coverage: {
      maturity: { ...snapshot.coverage.maturity },
      confidence: { ...snapshot.coverage.confidence },
      complete: { ...snapshot.coverage.complete }
    }
  });

  const createLimitations = (comparison) => {
    const limitations = [{
      code: "INDEX_LIMITATION",
      message: "Maturity and confidence remain separate indicators and do not constitute a risk score."
    }];
    if (comparison.baseline.coverage.complete.cellCount < 45) {
      limitations.push({
        code: "INCOMPLETE_BASELINE",
        message: "The baseline has fewer than 45 fully assessed cells."
      });
    }
    if (comparison.current.coverage.complete.cellCount < 45) {
      limitations.push({
        code: "INCOMPLETE_CURRENT",
        message: "The current snapshot has fewer than 45 fully assessed cells."
      });
    }
    if (comparison.paired.maturity.cellCount < 45 || comparison.paired.confidence.cellCount < 45) {
      limitations.push({
        code: "PAIRED_COVERAGE",
        message: "Aggregate changes use only cells assessed in both snapshots for that indicator."
      });
    }
    comparison.compatibility.warnings.forEach((warning) => limitations.push({ ...warning }));
    return limitations;
  };

  const findingText = (cell) => {
    if (normalizeText(cell.criticalGap.current)) return cell.criticalGap.current;
    if (cell.maturity.state === "regressed") {
      return `${cell.domainName} · ${cell.phaseTitle} maturity decreased from ${cell.maturity.baseline} to ${cell.maturity.current}.`;
    }
    if (normalizeText(cell.nextAction.current)) return cell.nextAction.current;
    return `${cell.domainName} · ${cell.phaseTitle} requires leadership review.`;
  };

  const buildBoardSummary = (comparisonInput, selections, options = {}) => {
    const comparison = validateComparison(comparisonInput);
    if (!Array.isArray(selections)) {
      fail("INVALID_FINDINGS", "Board findings must be an array.");
    }
    if (selections.length > MAX_BOARD_FINDINGS) {
      fail("TOO_MANY_FINDINGS", `A board summary may contain at most ${MAX_BOARD_FINDINGS} findings.`);
    }

    const cells = new Map(comparison.cells.map((cell) => [cell.cellId, cell]));
    const seen = new Set();
    const findings = selections.map((selection) => {
      if (!hasExactKeys(selection, ["cellId", "decision"]) || typeof selection.cellId !== "string") {
        fail("INVALID_FINDING", "Every board finding must reference one canonical comparison cell.");
      }
      if (seen.has(selection.cellId)) {
        fail("DUPLICATE_FINDING", "A comparison cell may appear only once in the board summary.");
      }
      const cell = cells.get(selection.cellId);
      if (!cell) fail("INVALID_FINDING", "A board finding references an unknown comparison cell.");
      seen.add(selection.cellId);
      return {
        cellId: cell.cellId,
        domainId: cell.domainId,
        domainName: cell.domainName,
        phaseId: cell.phaseId,
        phaseTitle: cell.phaseTitle,
        finding: findingText(cell),
        criticalGap: cell.criticalGap.current,
        nextAction: cell.nextAction.current,
        ownerRole: cell.ownerRole.current,
        decision: validateDecision(selection.decision),
        maturity: { ...cell.maturity },
        confidence: { ...cell.confidence }
      };
    });

    return {
      schema: BOARD_SCHEMA,
      schemaVersion: BOARD_SCHEMA_VERSION,
      generatedAt: resolveTimestamp(options.now),
      baseline: copySnapshotSummary(comparison.baseline),
      current: copySnapshotSummary(comparison.current),
      paired: {
        maturity: { ...comparison.paired.maturity },
        confidence: { ...comparison.paired.confidence }
      },
      limitations: createLimitations(comparison),
      findings
    };
  };

  const api = Object.freeze({
    COMPARISON_SCHEMA,
    COMPARISON_SCHEMA_VERSION,
    BOARD_SCHEMA,
    BOARD_SCHEMA_VERSION,
    DECISION_TEXT_LIMIT,
    MAX_BOARD_FINDINGS,
    AssessmentComparisonError,
    buildBoardSummary,
    compareAssessments
  });

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.AssessmentComparison = api;
})(typeof globalThis === "undefined" ? this : globalThis);
