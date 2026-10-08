"use strict";

(() => {
  const beginComparisonPrint = ({ body, addEventListener, print }) => {
    const clearPrintView = () => body.removeAttribute("data-print-view");
    body.setAttribute("data-print-view", "comparison");
    addEventListener("afterprint", clearPrintView, { once: true });
    print();
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = Object.freeze({ beginComparisonPrint });
    return;
  }

  const section = document.getElementById("assessment-comparison");
  if (!section) return;

  const elements = {
    error: document.getElementById("comparisonError"),
    status: document.getElementById("comparisonStatus"),
    availability: document.getElementById("comparisonAvailability"),
    compare: document.getElementById("compareSnapshots"),
    clear: document.getElementById("clearComparison"),
    report: document.getElementById("comparisonReport"),
    warnings: document.getElementById("comparisonWarnings"),
    provenance: document.getElementById("comparisonProvenance"),
    metrics: document.getElementById("comparisonMetrics"),
    changes: document.getElementById("comparisonChanges"),
    gaps: document.getElementById("comparisonGaps"),
    actions: document.getElementById("comparisonActions"),
    choices: document.getElementById("boardFindingChoices"),
    selectionCount: document.getElementById("boardSelectionCount"),
    generateBoard: document.getElementById("generateBoardSummary"),
    boardReport: document.getElementById("boardSummaryReport"),
    boardContent: document.getElementById("boardSummaryContent"),
    print: document.getElementById("printComparison"),
    loaders: document.getElementById("comparisonLoaders"),
    primaryControls: document.getElementById("comparisonPrimaryControls")
  };

  const slots = {
    baseline: {
      value: null,
      busy: false,
      fieldset: document.getElementById("baselineComparisonLoader"),
      file: document.getElementById("baselineComparisonFile"),
      passphrase: document.getElementById("baselineComparisonPassphrase"),
      load: document.getElementById("loadBaselineComparison"),
      meta: document.getElementById("baselineComparisonMeta")
    },
    current: {
      value: null,
      busy: false,
      fieldset: document.getElementById("currentComparisonLoader"),
      file: document.getElementById("currentComparisonFile"),
      passphrase: document.getElementById("currentComparisonPassphrase"),
      load: document.getElementById("loadCurrentComparison"),
      meta: document.getElementById("currentComparisonMeta")
    }
  };

  let comparison = null;
  let boardSummary = null;
  let boardChoiceControls = [];

  const showFatalError = (message) => {
    section.dataset.fatal = "true";
    section.querySelectorAll("button, input, select, textarea, fieldset").forEach((control) => {
      control.disabled = true;
    });
    if (elements.loaders) elements.loaders.hidden = true;
    if (elements.primaryControls) elements.primaryControls.hidden = true;
    if (elements.report) elements.report.hidden = true;
    if (elements.availability) elements.availability.hidden = true;
    elements.error.textContent = message;
    elements.error.hidden = false;
    section.removeAttribute("aria-busy");
    section.hidden = false;
    elements.error.focus();
  };

  const createElement = (tag, className = "", text) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  };

  const clearError = () => {
    elements.error.textContent = "";
    elements.error.hidden = true;
  };

  const showError = (message, focusTarget = elements.error) => {
    elements.error.textContent = message;
    elements.error.hidden = false;
    focusTarget.focus();
  };

  const announce = (message) => {
    elements.status.textContent = "";
    globalThis.requestAnimationFrame(() => {
      elements.status.textContent = message;
    });
  };

  const formatError = (error) => {
    const messages = {
      CRYPTO_UNAVAILABLE: "Encrypted comparison is unavailable in this browser.",
      INVALID_PASSPHRASE: "Use the passphrase for this snapshot; it must contain at least 15 characters.",
      FILE_TOO_LARGE: "Each encrypted snapshot must be no larger than 1 MiB.",
      INVALID_ENVELOPE: "The selected file is not a supported encrypted assessment.",
      UNSUPPORTED_VERSION: "The selected encrypted file version is not supported by this edition.",
      DECRYPTION_FAILED: "The snapshot could not be decrypted. The passphrase is incorrect or the file was changed.",
      IMPORT_BUSY: globalThis.AssessmentCrypto.IMPORT_BUSY_MESSAGE,
      IMPORT_STATE_CHANGED: globalThis.AssessmentCrypto.IMPORT_STATE_CHANGED_MESSAGE,
      INVALID_ASSESSMENT: "The decrypted file does not contain a valid 45-cell assessment.",
      UNSUPPORTED_SCHEMA: "The assessment schema is not supported by this edition.",
      INVALID_BASELINE: "The baseline is not a supported 45-cell assessment.",
      INVALID_CURRENT: "The current snapshot is not a supported 45-cell assessment.",
      TOO_MANY_FINDINGS: "Select no more than five board findings.",
      INVALID_DECISION: "Enter the requested decision or mark that no board decision is required.",
      INVALID_FINDING: "A selected board finding is no longer available. Rebuild the comparison.",
      DUPLICATE_FINDING: "Each comparison cell may appear only once in the board summary."
    };
    return error && messages[error.code]
      ? messages[error.code]
      : "The comparison operation could not be completed.";
  };

  const formatOverlay = (overlay) => overlay ? `${overlay.id} ${overlay.version}` : "Core model";
  const formatIndex = (value, maximum) => value === null ? "—" : `${value.toFixed(1)} / ${maximum}`;
  const formatDelta = (value, suffix = "") => {
    if (value === null) return "Not comparable";
    const sign = value > 0 ? "+" : "";
    return `${sign}${value.toFixed(1)}${suffix}`;
  };
  const formatCellName = (cell) => `${cell.domainName} · ${cell.phaseTitle}`;
  const formatMaturity = (value) => value === null ? "not assessed" : `${value.toFixed(1)} / 4`;
  const formatConfidence = (value) => value === null ? "not assessed" : `${value.toFixed(1)} / 100`;

  const validateBoundary = (candidate, model, domains, phases) =>
    model.validateAssessment(candidate, domains, phases);

  const resetDerivedViews = () => {
    comparison = null;
    boardSummary = null;
    elements.report.hidden = true;
    elements.boardReport.hidden = true;
    elements.warnings.replaceChildren();
    elements.provenance.replaceChildren();
    elements.metrics.replaceChildren();
    elements.changes.replaceChildren();
    elements.gaps.replaceChildren();
    elements.actions.replaceChildren();
    elements.choices.replaceChildren();
    elements.boardContent.replaceChildren();
    boardChoiceControls = [];
    elements.selectionCount.textContent = "0 of 5 findings selected";
    elements.generateBoard.disabled = true;
    elements.print.disabled = true;
  };

  const updateControls = (hasCrypto) => {
    const hasEither = Boolean(slots.baseline.value || slots.current.value);
    elements.compare.disabled = !(slots.baseline.value && slots.current.value);
    elements.clear.disabled = !(hasEither || comparison);
    Object.values(slots).forEach((slot) => {
      const unavailable = !hasCrypto;
      slot.fieldset.disabled = unavailable;
      slot.file.disabled = unavailable;
      slot.passphrase.disabled = unavailable;
      slot.load.disabled = unavailable || slot.busy;
    });
  };

  const snapshotMeta = (assessment, model, domains, phases) => {
    const summary = model.summarizeAssessment(assessment, domains, phases);
    return `Framework ${assessment.frameworkVersion} · ${formatOverlay(assessment.overlay)} · ${summary.assessedCells} of ${summary.totalCells} cells complete · Updated ${assessment.updatedAt}`;
  };

  const renderWarnings = () => {
    const warnings = [...comparison.compatibility.warnings];
    if (comparison.baseline.coverage.complete.cellCount < 45) {
      warnings.push({ message: "The baseline is incomplete; maturity and confidence indices use their respective scored cells and may have different coverage." });
    }
    if (comparison.current.coverage.complete.cellCount < 45) {
      warnings.push({ message: "The current snapshot is incomplete; maturity and confidence indices use their respective scored cells and may have different coverage." });
    }
    if (!warnings.length) {
      elements.warnings.replaceChildren(createElement(
        "p",
        "comparison-context comparison-context--ok",
        "Both snapshots use the same framework and overlay context and contain all 45 fully assessed cells."
      ));
      return;
    }
    const title = createElement("strong", "", "Interpretation cautions");
    const list = createElement("ul");
    warnings.forEach((warning) => list.append(createElement("li", "", warning.message)));
    const container = createElement("div", "comparison-context comparison-context--warning");
    container.append(title, list);
    elements.warnings.replaceChildren(container);
  };

  const createSnapshotTableRow = (label, snapshot) => {
    const row = document.createElement("tr");
    const heading = createElement("th", "", label);
    heading.scope = "row";
    const values = [
      `Framework ${snapshot.frameworkVersion}`,
      formatOverlay(snapshot.overlay),
      formatIndex(snapshot.maturityIndex, 4),
      formatIndex(snapshot.confidenceIndex, 100),
      `${snapshot.coverage.complete.cellCount} / 45 (${snapshot.coverage.complete.percent.toFixed(1)}%)`
    ];
    row.append(heading, ...values.map((value) => createElement("td", "", value)));
    return row;
  };

  const renderProvenance = () => {
    const table = document.createElement("table");
    const caption = createElement("caption", "", "Snapshot provenance and standalone indices");
    const head = document.createElement("thead");
    const headRow = document.createElement("tr");
    ["Snapshot", "Framework", "Overlay", "Maturity", "Confidence", "Complete coverage"].forEach((label) => {
      const heading = createElement("th", "", label);
      heading.scope = "col";
      headRow.append(heading);
    });
    head.append(headRow);
    const body = document.createElement("tbody");
    body.append(
      createSnapshotTableRow("Baseline", comparison.baseline),
      createSnapshotTableRow("Current", comparison.current)
    );
    table.append(caption, head, body);
    const region = createElement("div", "comparison-table-region");
    region.tabIndex = 0;
    region.setAttribute("role", "region");
    region.setAttribute("aria-label", "Snapshot provenance table");
    region.append(table);
    elements.provenance.replaceChildren(region);
  };

  const createMetric = (label, value, detail) => {
    const article = document.createElement("article");
    article.append(
      createElement("span", "", label),
      createElement("strong", "", value),
      createElement("small", "", detail)
    );
    return article;
  };

  const renderMetrics = () => {
    elements.metrics.replaceChildren(
      createMetric(
        "Paired maturity change",
        formatDelta(comparison.paired.maturity.delta, " / 4"),
        `${comparison.paired.maturity.cellCount} cells assessed in both snapshots`
      ),
      createMetric(
        "Paired confidence change",
        formatDelta(comparison.paired.confidence.delta, " points"),
        `${comparison.paired.confidence.cellCount} cells evidenced in both snapshots`
      ),
      createMetric(
        "Current complete coverage",
        `${comparison.current.coverage.complete.percent.toFixed(1)}%`,
        `${comparison.current.coverage.complete.cellCount} of 45 cells`
      ),
      createMetric(
        "Open critical gaps",
        String(comparison.openCriticalGaps.length),
        "Current snapshot only"
      )
    );
  };

  const createChangeList = (title, cells, field) => {
    const sectionElement = createElement("section", "comparison-change-group");
    sectionElement.append(createElement("h5", "", `${title} (${cells.length})`));
    if (!cells.length) {
      sectionElement.append(createElement("p", "assessment-empty", "None."));
      return sectionElement;
    }
    const list = document.createElement("ul");
    cells.forEach((cell) => {
      const metric = cell[field];
      const item = document.createElement("li");
      item.append(
        createElement("strong", "", formatCellName(cell)),
        createElement(
          "span",
          "",
          `${formatDelta(metric.delta)} · ${metric.baseline === null ? "not assessed" : metric.baseline.toFixed(1)} → ${metric.current === null ? "not assessed" : metric.current.toFixed(1)}`
        )
      );
      list.append(item);
    });
    sectionElement.append(list);
    return sectionElement;
  };

  const renderChanges = () => {
    elements.changes.replaceChildren(
      createChangeList("Maturity improved", comparison.improvedMaturityCells, "maturity"),
      createChangeList("Maturity regressed", comparison.regressedMaturityCells, "maturity"),
      createChangeList("Confidence strengthened", comparison.improvedConfidenceCells, "confidence"),
      createChangeList("Confidence weakened", comparison.regressedConfidenceCells, "confidence"),
      createChangeList("Newly maturity-assessed", comparison.newlyAssessedCells, "maturity"),
      createChangeList("No longer maturity-assessed", comparison.noLongerAssessedCells, "maturity")
    );
  };

  const renderGaps = () => {
    if (!comparison.openCriticalGaps.length) {
      elements.gaps.replaceChildren(createElement("p", "assessment-empty", "No current critical gaps were recorded."));
      return;
    }
    const list = document.createElement("ol");
    comparison.openCriticalGaps.forEach((cell) => {
      const item = document.createElement("li");
      item.append(
        createElement("strong", "", formatCellName(cell)),
        createElement("p", "", cell.criticalGap.current),
        createElement("small", "", `Gap state: ${cell.criticalGap.state}`)
      );
      list.append(item);
    });
    elements.gaps.replaceChildren(list);
  };

  const renderActions = () => {
    if (!comparison.actionPortfolio.length) {
      elements.actions.replaceChildren(createElement("p", "assessment-empty", "No current next actions were recorded."));
      return;
    }
    const list = document.createElement("ol");
    comparison.actionPortfolio.forEach((cell) => {
      const item = document.createElement("li");
      const owner = cell.ownerRole.current || "Unassigned";
      item.append(
        createElement("strong", "", formatCellName(cell)),
        createElement("p", "", cell.nextAction.current),
        createElement(
          "small",
          "",
          `Owner: ${owner} · Maturity: ${formatMaturity(cell.maturity.current)} · Confidence: ${formatConfidence(cell.confidence.current)}`
        )
      );
      list.append(item);
    });
    elements.actions.replaceChildren(list);
  };

  const readableBasis = (basis) => {
    const labels = {
      "open-critical-gap": "open critical gap",
      "maturity-regression": "maturity regression",
      "next-action": "recorded next action"
    };
    return basis.map((value) => labels[value]).join(" · ");
  };

  const selectedChoiceControls = () => boardChoiceControls.filter((choice) => choice.include.checked);

  const invalidateBoardSummary = () => {
    boardSummary = null;
    elements.boardReport.hidden = true;
    elements.boardContent.replaceChildren();
  };

  const updateBoardChoiceState = (comparisonApi) => {
    const selected = selectedChoiceControls();
    const atLimit = selected.length >= comparisonApi.MAX_BOARD_FINDINGS;
    boardChoiceControls.forEach((choice) => {
      choice.include.disabled = atLimit && !choice.include.checked;
      choice.decisionRequired.disabled = !choice.include.checked;
      choice.decisionText.disabled = !choice.include.checked || !choice.decisionRequired.checked;
      choice.decisionControls.hidden = !choice.include.checked;
      choice.decisionTextContainer.hidden = !choice.include.checked || !choice.decisionRequired.checked;
    });
    elements.selectionCount.textContent = `${selected.length} of ${comparisonApi.MAX_BOARD_FINDINGS} findings selected`;
    elements.generateBoard.disabled = selected.length === 0;
    invalidateBoardSummary();
  };

  const renderBoardChoices = (comparisonApi) => {
    const cells = new Map(comparison.cells.map((cell) => [cell.cellId, cell]));
    boardChoiceControls = [];
    if (!comparison.suggestedFindings.length) {
      elements.choices.replaceChildren(createElement(
        "p",
        "assessment-empty",
        "No open gap, maturity regression or next action produced a suggested finding."
      ));
      elements.selectionCount.textContent = `0 of ${comparisonApi.MAX_BOARD_FINDINGS} findings selected`;
      elements.generateBoard.disabled = true;
      return;
    }

    const fragment = document.createDocumentFragment();
    comparison.suggestedFindings.forEach((suggestion, index) => {
      const cell = cells.get(suggestion.cellId);
      const fieldset = createElement("fieldset", "board-finding-choice");
      const legend = createElement("legend", "", formatCellName(cell));
      const includeId = `board-finding-${index}`;
      const decisionId = `board-decision-${index}`;
      const decisionTextId = `board-decision-text-${index}`;

      const includeLabel = createElement("label", "board-finding-choice__include");
      includeLabel.htmlFor = includeId;
      const include = document.createElement("input");
      include.id = includeId;
      include.type = "checkbox";
      include.value = cell.cellId;
      includeLabel.append(include, createElement("span", "", "Include in board summary"));

      const finding = createElement(
        "p",
        "board-finding-choice__finding",
        cell.criticalGap.current || cell.nextAction.current || "Maturity requires leadership review."
      );
      const context = createElement(
        "p",
        "assessment-help",
        `${readableBasis(suggestion.basis)} · Owner: ${cell.ownerRole.current || "Unassigned"}`
      );

      const decisionControls = createElement("div", "board-decision-controls");
      decisionControls.hidden = true;
      const decisionLabel = createElement("label", "board-decision-required");
      decisionLabel.htmlFor = decisionId;
      const decisionRequired = document.createElement("input");
      decisionRequired.id = decisionId;
      decisionRequired.type = "checkbox";
      decisionRequired.disabled = true;
      decisionLabel.append(decisionRequired, createElement("span", "", "A board decision is required"));

      const decisionTextContainer = createElement("label", "board-decision-text");
      decisionTextContainer.htmlFor = decisionTextId;
      decisionTextContainer.hidden = true;
      decisionTextContainer.append(createElement("span", "", "Decision requested"));
      const decisionText = document.createElement("textarea");
      decisionText.id = decisionTextId;
      decisionText.rows = 2;
      decisionText.maxLength = comparisonApi.DECISION_TEXT_LIMIT;
      decisionText.disabled = true;
      decisionText.placeholder = "State the decision leadership is being asked to make.";
      decisionTextContainer.append(decisionText);
      decisionControls.append(decisionLabel, decisionTextContainer);
      fieldset.append(legend, includeLabel, finding, context, decisionControls);
      fragment.append(fieldset);

      const controls = {
        cellId: cell.cellId,
        include,
        decisionRequired,
        decisionText,
        decisionControls,
        decisionTextContainer
      };
      boardChoiceControls.push(controls);
      include.addEventListener("change", () => {
        if (!include.checked) {
          decisionRequired.checked = false;
          decisionText.value = "";
        }
        updateBoardChoiceState(comparisonApi);
      });
      decisionRequired.addEventListener("change", () => {
        if (!decisionRequired.checked) decisionText.value = "";
        updateBoardChoiceState(comparisonApi);
        if (decisionRequired.checked) decisionText.focus();
      });
      decisionText.addEventListener("input", invalidateBoardSummary);
    });
    elements.choices.replaceChildren(fragment);
    updateBoardChoiceState(comparisonApi);
  };

  const appendDefinition = (list, term, description) => {
    list.append(createElement("dt", "", term), createElement("dd", "", description));
  };

  const renderBoardSummary = () => {
    const meta = createElement(
      "p",
      "comparison-board-meta",
      `Baseline: framework ${boardSummary.baseline.frameworkVersion}, ${formatOverlay(boardSummary.baseline.overlay)} · Current: framework ${boardSummary.current.frameworkVersion}, ${formatOverlay(boardSummary.current.overlay)} · Generated ${boardSummary.generatedAt}`
    );
    const limitationsHeading = createElement("h5", "", "Interpretation limits");
    const limitations = document.createElement("ul");
    boardSummary.limitations.forEach((limitation) => limitations.append(createElement("li", "", limitation.message)));
    const findingsHeading = createElement("h5", "", `Selected findings (${boardSummary.findings.length})`);
    const findings = document.createElement("ol");

    boardSummary.findings.forEach((finding) => {
      const item = document.createElement("li");
      const title = createElement("h6", "", `${finding.domainName} · ${finding.phaseTitle}`);
      const text = createElement("p", "", finding.finding);
      const details = document.createElement("dl");
      appendDefinition(details, "Owner role", finding.ownerRole || "Unassigned");
      appendDefinition(details, "Next action", finding.nextAction || "Not recorded");
      appendDefinition(
        details,
        "Maturity",
        `${formatMaturity(finding.maturity.baseline)} → ${formatMaturity(finding.maturity.current)} (${formatDelta(finding.maturity.delta)})`
      );
      appendDefinition(
        details,
        "Confidence",
        `${formatConfidence(finding.confidence.baseline)} → ${formatConfidence(finding.confidence.current)} (${formatDelta(finding.confidence.delta, " points")})`
      );
      appendDefinition(
        details,
        "Decision required",
        finding.decision.status === "required" ? finding.decision.text : "No board decision requested"
      );
      item.append(title, text, details);
      findings.append(item);
    });
    elements.boardContent.replaceChildren(meta, limitationsHeading, limitations, findingsHeading, findings);
    elements.boardReport.hidden = false;
    elements.boardReport.focus();
  };

  const renderComparison = (comparisonApi) => {
    renderWarnings();
    renderProvenance();
    renderMetrics();
    renderChanges();
    renderGaps();
    renderActions();
    renderBoardChoices(comparisonApi);
    elements.print.disabled = false;
    elements.report.hidden = false;
    elements.report.focus();
  };

  const initialize = () => {
    const requiredNodes = [
      ...Object.values(elements),
      ...Object.values(slots).flatMap((slot) => [
        slot.fieldset,
        slot.file,
        slot.passphrase,
        slot.load,
        slot.meta
      ])
    ];
    if (requiredNodes.some((node) => !node)) {
      throw new Error("The comparison markup is incomplete.");
    }
    const model = globalThis.AssessmentModel;
    const cryptoApi = globalThis.AssessmentCrypto;
    const comparisonApi = globalThis.AssessmentComparison;
    const canonicalDomains = typeof domains === "undefined" ? null : domains;
    const canonicalPhases = typeof phases === "undefined" ? null : phases;
    if (!model || !cryptoApi || !comparisonApi || !canonicalDomains || !canonicalPhases) {
      throw new Error("The comparison could not start because a required local file is unavailable.");
    }

    const domainDefinitions = canonicalDomains.map((domain) => ({ id: domain.id, name: domain.name }));
    const phaseDefinitions = canonicalPhases.map((phase) => ({ id: phase.id, title: phase.title }));
    model.validateDefinitions(domainDefinitions, phaseDefinitions);
    const hasCrypto = cryptoApi.isWebCryptoAvailable(globalThis.crypto);
    const comparisonImportGuard = cryptoApi.createImportCommitGuard();

    const loadSlot = async (name) => {
      const slot = slots[name];
      if (slot.busy) return;
      clearError();
      const passphrase = slot.passphrase.value;
      slot.passphrase.value = "";
      const file = slot.file.files && slot.file.files[0];
      if (!file) {
        showError(`Choose the encrypted ${name} file before loading.`, slot.file);
        return;
      }
      if (file.size > cryptoApi.MAX_FILE_BYTES) {
        showError("Each encrypted snapshot must be no larger than 1 MiB.", slot.file);
        slot.file.value = "";
        slot.passphrase.value = "";
        return;
      }
      const importToken = comparisonImportGuard.capture();

      slot.busy = true;
      slot.load.disabled = true;
      slot.load.setAttribute("aria-busy", "true");
      try {
        const loadedSnapshot = await cryptoApi.withExclusiveImport(async () => {
          const serialized = new TextDecoder("utf-8", { fatal: true }).decode(await file.arrayBuffer());
          const candidate = await cryptoApi.decryptAssessment(serialized, passphrase, {
            crypto: globalThis.crypto,
            validate: (value) => validateBoundary(value, model, domainDefinitions, phaseDefinitions)
          });
          comparisonImportGuard.assertCurrent(importToken);
          slot.value = candidate;
          comparisonImportGuard.invalidate();
          return candidate;
        });
        slot.meta.textContent = snapshotMeta(loadedSnapshot, model, domainDefinitions, phaseDefinitions);
        resetDerivedViews();
        announce(`${name === "baseline" ? "Baseline" : "Current"} snapshot authenticated and loaded in memory.`);
      } catch (error) {
        showError(formatError(error));
      } finally {
        slot.busy = false;
        slot.file.value = "";
        slot.passphrase.value = "";
        slot.load.removeAttribute("aria-busy");
        updateControls(hasCrypto);
      }
    };

    const compareSnapshots = () => {
      clearError();
      if (!slots.baseline.value || !slots.current.value) {
        showError("Load both validated snapshots before comparing them.");
        return;
      }
      try {
        comparison = comparisonApi.compareAssessments(slots.baseline.value, slots.current.value, {
          domains: domainDefinitions,
          phases: phaseDefinitions,
          model
        });
        boardSummary = null;
        elements.boardReport.hidden = true;
        elements.boardContent.replaceChildren();
        renderComparison(comparisonApi);
        announce("Comparison ready. Maturity, confidence and coverage changes are reported separately.");
      } catch (error) {
        showError(formatError(error));
      }
    };

    const clearComparison = () => {
      clearError();
      comparisonImportGuard.invalidate();
      slots.baseline.value = null;
      slots.current.value = null;
      slots.baseline.file.value = "";
      slots.current.file.value = "";
      slots.baseline.passphrase.value = "";
      slots.current.passphrase.value = "";
      slots.baseline.meta.textContent = "No baseline loaded.";
      slots.current.meta.textContent = "No current snapshot loaded.";
      resetDerivedViews();
      updateControls(hasCrypto);
      announce("Comparison cleared. This page no longer references either decrypted snapshot.");
    };

    const generateBoardSummary = () => {
      clearError();
      if (!comparison) {
        showError("Compare both snapshots before building a board summary.");
        return;
      }
      const selected = selectedChoiceControls();
      const missingDecision = selected.find((choice) =>
        choice.decisionRequired.checked && !choice.decisionText.value.trim()
      );
      if (missingDecision) {
        showError("Enter the requested board decision before generating the summary.", missingDecision.decisionText);
        return;
      }
      const selections = selected.map((choice) => ({
        cellId: choice.cellId,
        decision: choice.decisionRequired.checked
          ? { status: "required", text: choice.decisionText.value }
          : { status: "none" }
      }));
      try {
        boardSummary = comparisonApi.buildBoardSummary(comparison, selections);
        renderBoardSummary();
        announce(`Board summary generated with ${boardSummary.findings.length} findings.`);
      } catch (error) {
        showError(formatError(error));
      }
    };

    const printComparison = () => {
      clearError();
      if (!comparison) {
        showError("Compare both snapshots before printing the comparison report.");
        return;
      }
      beginComparisonPrint({
        body: document.body,
        addEventListener: globalThis.addEventListener.bind(globalThis),
        print: globalThis.print.bind(globalThis)
      });
    };

    slots.baseline.load.addEventListener("click", () => loadSlot("baseline"));
    slots.current.load.addEventListener("click", () => loadSlot("current"));
    elements.compare.addEventListener("click", compareSnapshots);
    elements.clear.addEventListener("click", clearComparison);
    elements.generateBoard.addEventListener("click", generateBoardSummary);
    elements.print.addEventListener("click", printComparison);

    elements.availability.textContent = hasCrypto
      ? "Web Crypto is available. Each file is decrypted and validated locally after you choose Load."
      : "Web Crypto is unavailable. Snapshot comparison is disabled; the current in-memory assessment and printing still work.";
    elements.print.disabled = true;
    updateControls(hasCrypto);
    section.removeAttribute("aria-busy");
    section.hidden = false;
  };

  try {
    initialize();
  } catch {
    showFatalError("The comparison could not start because its local data contract is unavailable.");
  }
})();
