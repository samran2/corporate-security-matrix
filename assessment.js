"use strict";

(() => {
  const app = document.querySelector("[data-assessment-app]");
  const startupNotice = document.getElementById("assessmentStartupNotice");
  const errorMessage = document.getElementById("assessmentError");
  const statusMessage = document.getElementById("assessmentStatus");
  if (!app || !startupNotice || !errorMessage || !statusMessage) return;

  const showFatalError = (message) => {
    app.dataset.fatal = "true";
    errorMessage.textContent = message;
    errorMessage.hidden = false;
    startupNotice.hidden = true;
    app.hidden = false;
    errorMessage.focus();
  };

  try {
    const model = globalThis.AssessmentModel;
    const cryptoApi = globalThis.AssessmentCrypto;
    const canonicalDomains = typeof domains === "undefined" ? null : domains;
    const canonicalPhases = typeof phases === "undefined" ? null : phases;
    if (!model || !cryptoApi || !canonicalDomains || !canonicalPhases) {
      throw new Error("The assessment could not start because a required local data file is unavailable.");
    }

    const domainDefinitions = canonicalDomains.map((domain) => ({ id: domain.id, name: domain.name }));
    const phaseDefinitions = canonicalPhases.map((phase) => ({ id: phase.id, title: phase.title }));
    model.validateDefinitions(domainDefinitions, phaseDefinitions);

    const frameworkVersion = document.body.dataset.frameworkVersion;
    let assessment = model.createAssessment({
      domains: domainDefinitions,
      phases: phaseDefinitions,
      frameworkVersion
    });
    let selectedCellId = model.getCellIds(domainDefinitions, phaseDefinitions)[0];
    const assessmentImportGuard = cryptoApi.createImportCommitGuard();
    const heatmapCells = new Map();

    const elements = {
      completionMessage: document.getElementById("completionMessage"),
      maturityIndex: document.getElementById("maturityIndex"),
      confidenceIndex: document.getElementById("confidenceIndex"),
      coverageIndex: document.getElementById("coverageIndex"),
      coverageDetail: document.getElementById("coverageDetail"),
      weakestPhase: document.getElementById("weakestPhase"),
      weakestPhaseDetail: document.getElementById("weakestPhaseDetail"),
      maturityDistribution: document.getElementById("maturityDistribution"),
      priorityActions: document.getElementById("priorityActions"),
      priorityEmpty: document.getElementById("priorityEmpty"),
      assessmentVersion: document.getElementById("assessmentVersion"),
      heatmap: document.getElementById("assessmentHeatmap"),
      editor: document.getElementById("assessmentEditor"),
      editorTitle: document.getElementById("editor-title"),
      cellProgress: document.getElementById("cellProgress"),
      maturity: document.getElementById("maturityScore"),
      controlEvidence: document.getElementById("controlEvidenceScore"),
      independentChallenge: document.getElementById("independentChallengeScore"),
      exerciseRecency: document.getElementById("exerciseRecencyScore"),
      cellConfidence: document.getElementById("cellConfidence"),
      criticalGap: document.getElementById("criticalGap"),
      criticalGapCount: document.getElementById("criticalGapCount"),
      nextAction: document.getElementById("nextAction"),
      nextActionCount: document.getElementById("nextActionCount"),
      ownerRole: document.getElementById("ownerRole"),
      ownerRoleCount: document.getElementById("ownerRoleCount"),
      applyCell: document.getElementById("applyCell"),
      clearCell: document.getElementById("clearCell"),
      print: document.getElementById("printAssessment"),
      passphrase: document.getElementById("assessmentPassphrase"),
      passphraseConfirmation: document.getElementById("assessmentPassphraseConfirmation"),
      download: document.getElementById("downloadAssessment"),
      file: document.getElementById("assessmentFile"),
      import: document.getElementById("importAssessment"),
      cryptoAvailability: document.getElementById("cryptoAvailability"),
      reset: document.getElementById("resetAssessment")
    };

    const clearError = () => {
      errorMessage.textContent = "";
      errorMessage.hidden = true;
    };

    const announce = (message) => {
      statusMessage.textContent = "";
      globalThis.requestAnimationFrame(() => {
        statusMessage.textContent = message;
      });
    };

    const showError = (message) => {
      errorMessage.textContent = message;
      errorMessage.hidden = false;
      errorMessage.focus();
    };

    const formatError = (error) => {
      if (!error || typeof error !== "object") return "The assessment operation could not be completed.";
      const messages = {
        CRYPTO_UNAVAILABLE: "Encrypted save and import are unavailable in this browser. Assessment and printing still work.",
        INVALID_PASSPHRASE: "Use a passphrase of at least 15 characters and no more than 1,024 UTF-8 bytes.",
        FILE_TOO_LARGE: "The encrypted assessment must be no larger than 1 MiB.",
        INVALID_ENVELOPE: "The selected file is not a supported encrypted assessment.",
        UNSUPPORTED_VERSION: "This encrypted assessment version is not supported by this edition.",
        DECRYPTION_FAILED: "The file could not be decrypted. The passphrase is incorrect or the file was changed.",
        IMPORT_BUSY: cryptoApi.IMPORT_BUSY_MESSAGE,
        IMPORT_STATE_CHANGED: cryptoApi.IMPORT_STATE_CHANGED_MESSAGE,
        INVALID_ASSESSMENT: "The decrypted file does not contain a valid 45-cell assessment.",
        UNSUPPORTED_SCHEMA: "The assessment uses a schema version this edition cannot open."
      };
      return messages[error.code] || "The assessment operation could not be completed.";
    };

    const scoreFromSelect = (select) => select.value === "" ? null : Number(select.value);
    const setSelectScore = (select, value) => {
      select.value = value === null ? "" : String(value);
    };
    const scoreCount = (cell) => [
      cell.maturity,
      cell.confidence.controlEvidence,
      cell.confidence.independentChallenge,
      cell.confidence.exerciseRecency
    ].filter((score) => score !== null).length;
    const formatIndex = (value, suffix) => value === null ? "—" : `${value.toFixed(1)}${suffix}`;

    const createHeatmap = () => {
      const table = document.createElement("table");
      const caption = document.createElement("caption");
      caption.textContent = "Nine security domains by five lifecycle phases. Select any score button to edit that cell.";
      table.append(caption);

      const head = document.createElement("thead");
      const headRow = document.createElement("tr");
      const domainHeading = document.createElement("th");
      domainHeading.scope = "col";
      domainHeading.textContent = "Security domain";
      headRow.append(domainHeading);
      phaseDefinitions.forEach((phase) => {
        const heading = document.createElement("th");
        heading.scope = "col";
        heading.textContent = phase.title;
        headRow.append(heading);
      });
      head.append(headRow);
      table.append(head);

      const body = document.createElement("tbody");
      domainDefinitions.forEach((domain) => {
        const row = document.createElement("tr");
        const heading = document.createElement("th");
        heading.scope = "row";
        heading.textContent = domain.name;
        row.append(heading);

        phaseDefinitions.forEach((phase) => {
          const cellId = `${domain.id}.${phase.id}`;
          const tableCell = document.createElement("td");
          const button = document.createElement("button");
          const value = document.createElement("span");
          const progress = document.createElement("small");
          button.type = "button";
          button.className = "assessment-cell-button assessment-cell-button--unset";
          button.setAttribute("aria-pressed", "false");
          button.append(value, progress);
          button.addEventListener("click", () => selectCell(cellId, true));
          tableCell.append(button);
          row.append(tableCell);
          heatmapCells.set(cellId, { button, value, progress, domain, phase });
        });
        body.append(row);
      });
      table.append(body);
      elements.heatmap.replaceChildren(table);
    };

    const renderHeatmap = () => {
      heatmapCells.forEach(({ button, value, progress, domain, phase }, cellId) => {
        const cell = assessment.cells[cellId];
        const completedScores = scoreCount(cell);
        const classSuffix = cell.maturity === null ? "unset" : String(cell.maturity);
        button.className = `assessment-cell-button assessment-cell-button--${classSuffix}`;
        button.setAttribute("aria-pressed", String(cellId === selectedCellId));
        value.textContent = cell.maturity === null ? "—" : String(cell.maturity);
        progress.textContent = completedScores === 4 ? "Complete" : `${completedScores}/4 scores`;
        const maturityLabel = cell.maturity === null ? "maturity not set" : `maturity ${cell.maturity} of 4`;
        const confidenceValue = model.calculateConfidence(cell.confidence);
        const confidenceLabel = confidenceValue === null
          ? "confidence not fully scored"
          : `confidence ${confidenceValue} of 100`;
        button.setAttribute(
          "aria-label",
          `${domain.name}, ${phase.title}: ${maturityLabel}; ${confidenceLabel}; ${completedScores} of 4 scores set`
        );
      });
    };

    const renderDistribution = (summary) => {
      const labels = ["0 Exposed", "1 Reactive", "2 Defined", "3 Assured", "4 Adaptive"];
      const items = labels.map((label, score) => {
        const item = document.createElement("li");
        const name = document.createElement("span");
        const bar = document.createElement("progress");
        const count = document.createElement("strong");
        name.textContent = label;
        bar.max = summary.totalCells;
        bar.value = summary.maturityDistribution[score];
        bar.setAttribute("aria-label", `${label}: ${summary.maturityDistribution[score]} cells`);
        count.textContent = String(summary.maturityDistribution[score]);
        item.append(name, bar, count);
        return item;
      });
      elements.maturityDistribution.replaceChildren(...items);
    };

    const renderPriorities = (summary) => {
      const items = summary.prioritizedActions.map((priority) => {
        const item = document.createElement("li");
        const action = document.createElement("strong");
        const context = document.createElement("span");
        action.textContent = priority.nextAction;
        const maturity = priority.maturity === null ? "maturity not set" : `maturity ${priority.maturity}/4`;
        const confidence = priority.confidence === null ? "confidence incomplete" : `confidence ${priority.confidence.toFixed(1)}/100`;
        const owner = priority.ownerRole ? ` · Owner: ${priority.ownerRole}` : "";
        context.textContent = `${priority.domainName} · ${priority.phaseTitle} · ${maturity} · ${confidence}${owner}`;
        item.append(action, context);
        return item;
      });
      elements.priorityActions.replaceChildren(...items);
      elements.priorityEmpty.hidden = items.length > 0;
    };

    const renderSummary = () => {
      const summary = model.summarizeAssessment(assessment, domainDefinitions, phaseDefinitions);
      elements.maturityIndex.textContent = formatIndex(summary.maturityIndex, " / 4");
      elements.confidenceIndex.textContent = formatIndex(summary.confidenceIndex, " / 100");
      elements.coverageIndex.textContent = `${summary.coveragePercent.toFixed(1)}%`;
      elements.coverageDetail.textContent = `${summary.assessedCells} of ${summary.totalCells} cells`;
      elements.completionMessage.textContent = summary.isComplete
        ? "Complete · all 45 cells fully assessed"
        : `${summary.assessedCells === 0 ? "Not started" : "In progress"} · ${summary.assessedCells} of ${summary.totalCells} cells fully assessed`;
      if (summary.weakestPhase) {
        elements.weakestPhase.textContent = summary.weakestPhase.title;
        elements.weakestPhaseDetail.textContent = `${summary.weakestPhase.maturity.toFixed(1)} / 4 across maturity-scored cells`;
      } else {
        elements.weakestPhase.textContent = "—";
        elements.weakestPhaseDetail.textContent = "Score maturity to compare phases";
      }
      const overlayLabel = assessment.overlay
        ? `${assessment.overlay.id} overlay ${assessment.overlay.version}`
        : "Core model";
      elements.assessmentVersion.textContent = `Framework ${assessment.frameworkVersion} · ${overlayLabel} · Assessment schema ${assessment.schemaVersion}`;
      renderDistribution(summary);
      renderPriorities(summary);
    };

    const updateCharacterCounts = () => {
      elements.criticalGapCount.textContent = String(Array.from(elements.criticalGap.value).length);
      elements.nextActionCount.textContent = String(Array.from(elements.nextAction.value).length);
      elements.ownerRoleCount.textContent = String(Array.from(elements.ownerRole.value).length);
    };

    const updateEditorScorePreview = () => {
      const confidence = {
        controlEvidence: scoreFromSelect(elements.controlEvidence),
        independentChallenge: scoreFromSelect(elements.independentChallenge),
        exerciseRecency: scoreFromSelect(elements.exerciseRecency)
      };
      const result = model.calculateConfidence(confidence);
      elements.cellConfidence.textContent = result === null ? "—" : `${result.toFixed(1)} / 100`;
      const completedScores = [scoreFromSelect(elements.maturity), ...Object.values(confidence)]
        .filter((score) => score !== null).length;
      elements.cellProgress.textContent = `${completedScores} of 4 scores set`;
    };

    const renderEditor = () => {
      const separator = selectedCellId.lastIndexOf(".");
      const domainId = selectedCellId.slice(0, separator);
      const phaseId = selectedCellId.slice(separator + 1);
      const domain = domainDefinitions.find((item) => item.id === domainId);
      const phase = phaseDefinitions.find((item) => item.id === phaseId);
      const cell = assessment.cells[selectedCellId];
      elements.editorTitle.textContent = `${domain.name} · ${phase.title}`;
      setSelectScore(elements.maturity, cell.maturity);
      setSelectScore(elements.controlEvidence, cell.confidence.controlEvidence);
      setSelectScore(elements.independentChallenge, cell.confidence.independentChallenge);
      setSelectScore(elements.exerciseRecency, cell.confidence.exerciseRecency);
      elements.criticalGap.value = cell.criticalGap;
      elements.nextAction.value = cell.nextAction;
      elements.ownerRole.value = cell.ownerRole;
      updateCharacterCounts();
      updateEditorScorePreview();
    };

    const renderAll = () => {
      renderSummary();
      renderHeatmap();
      renderEditor();
    };

    function selectCell(cellId, moveFocus) {
      if (!Object.prototype.hasOwnProperty.call(assessment.cells, cellId)) return;
      selectedCellId = cellId;
      renderHeatmap();
      renderEditor();
      if (moveFocus) {
        elements.editor.scrollIntoView({ block: "start" });
        elements.editorTitle.focus();
      }
    }

    const readEditorCell = () => ({
      maturity: scoreFromSelect(elements.maturity),
      confidence: {
        controlEvidence: scoreFromSelect(elements.controlEvidence),
        independentChallenge: scoreFromSelect(elements.independentChallenge),
        exerciseRecency: scoreFromSelect(elements.exerciseRecency)
      },
      criticalGap: elements.criticalGap.value,
      nextAction: elements.nextAction.value,
      ownerRole: elements.ownerRole.value
    });

    const applyCellChanges = () => {
      clearError();
      try {
        assessment = model.updateAssessmentCell(assessment, selectedCellId, readEditorCell(), {
          domains: domainDefinitions,
          phases: phaseDefinitions
        });
        assessmentImportGuard.invalidate();
        renderAll();
        announce("Cell changes applied to the in-memory assessment.");
      } catch (error) {
        showError(error && error.message ? error.message : "The selected cell could not be updated.");
      }
    };

    const clearSelectedCell = () => {
      if (!globalThis.confirm("Clear every score and note in this cell?")) return;
      clearError();
      try {
        assessment = model.updateAssessmentCell(assessment, selectedCellId, {
          maturity: null,
          confidence: { controlEvidence: null, independentChallenge: null, exerciseRecency: null },
          criticalGap: "",
          nextAction: "",
          ownerRole: ""
        }, { domains: domainDefinitions, phases: phaseDefinitions });
        assessmentImportGuard.invalidate();
        renderAll();
        announce("Selected cell cleared from the in-memory assessment.");
      } catch (error) {
        showError(error && error.message ? error.message : "The selected cell could not be cleared.");
      }
    };

    const clearPassphrases = () => {
      elements.passphrase.value = "";
      elements.passphraseConfirmation.value = "";
    };

    const validateForCrypto = (candidate) => model.validateAssessment(
      candidate,
      domainDefinitions,
      phaseDefinitions
    );

    const downloadEncryptedAssessment = async () => {
      clearError();
      if (elements.passphrase.value !== elements.passphraseConfirmation.value) {
        showError("The passphrase and confirmation do not match. Enter both again.");
        clearPassphrases();
        elements.passphrase.focus();
        return;
      }
      elements.download.disabled = true;
      elements.download.setAttribute("aria-busy", "true");
      try {
        const envelope = await cryptoApi.encryptAssessment(assessment, elements.passphrase.value, {
          crypto: globalThis.crypto,
          validate: validateForCrypto
        });
        const contents = cryptoApi.serializeEncryptedAssessment(envelope);
        const blob = new Blob([contents], { type: "application/json" });
        const objectUrl = globalThis.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = objectUrl;
        link.download = `corporate-security-matrix-${new Date().toISOString().slice(0, 10)}.csm-assessment.json`;
        link.click();
        globalThis.setTimeout(() => globalThis.URL.revokeObjectURL(objectUrl), 0);
        announce("Encrypted continuation file downloaded. Keep its passphrase separately.");
      } catch (error) {
        showError(formatError(error));
      } finally {
        clearPassphrases();
        elements.download.removeAttribute("aria-busy");
        elements.download.disabled = !cryptoApi.isWebCryptoAvailable(globalThis.crypto);
      }
    };

    const importEncryptedAssessment = async () => {
      clearError();
      const passphrase = elements.passphrase.value;
      clearPassphrases();
      const file = elements.file.files && elements.file.files[0];
      if (!file) {
        showError("Choose an encrypted assessment file before importing.");
        elements.file.focus();
        return;
      }
      if (file.size > cryptoApi.MAX_FILE_BYTES) {
        showError("The encrypted assessment must be no larger than 1 MiB.");
        elements.file.value = "";
        clearPassphrases();
        return;
      }
      const importToken = assessmentImportGuard.capture();
      elements.import.disabled = true;
      elements.import.setAttribute("aria-busy", "true");
      try {
        await cryptoApi.withExclusiveImport(async () => {
          const bytes = await file.arrayBuffer();
          const serialized = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
          const candidate = await cryptoApi.decryptAssessment(serialized, passphrase, {
            crypto: globalThis.crypto,
            validate: validateForCrypto
          });
          assessmentImportGuard.assertCurrent(importToken);
          assessment = candidate;
          assessmentImportGuard.invalidate();
        });
        renderAll();
        announce("Encrypted assessment imported and fully validated in memory.");
      } catch (error) {
        showError(formatError(error));
      } finally {
        clearPassphrases();
        elements.file.value = "";
        elements.import.removeAttribute("aria-busy");
        elements.import.disabled = !cryptoApi.isWebCryptoAvailable(globalThis.crypto);
      }
    };

    const resetAssessment = () => {
      if (!globalThis.confirm("Reset all 45 cells in this tab? This cannot be undone.")) return;
      clearError();
      assessment = model.createAssessment({ domains: domainDefinitions, phases: phaseDefinitions, frameworkVersion });
      assessmentImportGuard.invalidate();
      selectedCellId = model.getCellIds(domainDefinitions, phaseDefinitions)[0];
      renderAll();
      announce("Assessment reset. All in-memory scores and notes were cleared.");
    };

    const printAssessment = () => {
      document.body.removeAttribute("data-print-view");
      globalThis.print();
    };

    createHeatmap();
    renderAll();

    [elements.maturity, elements.controlEvidence, elements.independentChallenge, elements.exerciseRecency]
      .forEach((select) => select.addEventListener("change", () => {
        assessmentImportGuard.invalidate();
        updateEditorScorePreview();
      }));
    [elements.criticalGap, elements.nextAction, elements.ownerRole]
      .forEach((input) => input.addEventListener("input", () => {
        assessmentImportGuard.invalidate();
        updateCharacterCounts();
      }));
    elements.applyCell.addEventListener("click", applyCellChanges);
    elements.clearCell.addEventListener("click", clearSelectedCell);
    elements.print.addEventListener("click", printAssessment);
    elements.download.addEventListener("click", downloadEncryptedAssessment);
    elements.import.addEventListener("click", importEncryptedAssessment);
    elements.reset.addEventListener("click", resetAssessment);

    const hasCrypto = cryptoApi.isWebCryptoAvailable(globalThis.crypto);
    elements.download.disabled = !hasCrypto;
    elements.import.disabled = !hasCrypto;
    elements.passphrase.disabled = !hasCrypto;
    elements.passphraseConfirmation.disabled = !hasCrypto;
    elements.file.disabled = !hasCrypto;
    elements.cryptoAvailability.textContent = hasCrypto
      ? "Web Crypto is available. Encryption happens locally in this tab."
      : "Web Crypto is unavailable. Encrypted save and import are disabled; assessment and printing remain available.";

    app.hidden = false;
    startupNotice.hidden = true;
  } catch (error) {
    showFatalError(error && error.message
      ? error.message
      : "The assessment could not start because its local data contract is invalid.");
  }
})();
