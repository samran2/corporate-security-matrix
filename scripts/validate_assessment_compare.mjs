import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const root = new URL("../", import.meta.url);

const dataContext = vm.createContext({});
vm.runInContext(
  `${fs.readFileSync(new URL("matrix-domains.js", root), "utf8")}\n` +
    "globalThis.__comparisonFixture = { domains, phases };",
  dataContext
);

const domainDefinitions = Array.from(dataContext.__comparisonFixture.domains, (domain) => ({
  id: domain.id,
  name: domain.name
}));
const phaseDefinitions = Array.from(dataContext.__comparisonFixture.phases, (phase) => ({
  id: phase.id,
  title: phase.title
}));

const model = require(fileURLToPath(new URL("../assessment-model.js", import.meta.url)));
const comparisonApi = require(fileURLToPath(new URL("../assessment-compare.js", import.meta.url)));
const comparisonControllerApi = require(fileURLToPath(new URL("../assessment-comparison.js", import.meta.url)));

const tests = [];
const test = (name, run) => tests.push({ name, run });

const createAssessment = (frameworkVersion = "1.1.0", now = "2026-08-29T10:00:00.000Z") =>
  model.createAssessment({
    domains: domainDefinitions,
    phases: phaseDefinitions,
    frameworkVersion,
    now
  });

const updateCell = (assessment, cellId, patch, now = "2026-08-29T10:05:00.000Z") =>
  model.updateAssessmentCell(assessment, cellId, patch, {
    domains: domainDefinitions,
    phases: phaseDefinitions,
    now
  });

const completeCell = (assessment, cellId, maturity, confidence, fields = {}) => updateCell(
  assessment,
  cellId,
  {
    maturity,
    confidence: {
      controlEvidence: confidence,
      independentChallenge: confidence,
      exerciseRecency: confidence
    },
    ...fields
  }
);

const compare = (baseline, current) => comparisonApi.compareAssessments(baseline, current, {
  domains: domainDefinitions,
  phases: phaseDefinitions,
  model,
  now: "2026-08-29T12:00:00.000Z"
});

test("identical complete snapshots have full paired coverage and zero deltas", () => {
  let baseline = createAssessment();
  for (const cellId of model.getCellIds(domainDefinitions, phaseDefinitions)) {
    baseline = completeCell(baseline, cellId, 2, 3);
  }

  const result = compare(baseline, structuredClone(baseline));

  assert.equal(result.schema, "csm-assessment-comparison");
  assert.equal(result.schemaVersion, 1);
  assert.equal(result.cells.length, 45);
  assert.equal(result.paired.maturity.cellCount, 45);
  assert.equal(result.paired.maturity.delta, 0);
  assert.equal(result.paired.confidence.cellCount, 45);
  assert.equal(result.paired.confidence.delta, 0);
  assert.equal(result.baseline.coverage.complete.cellCount, 45);
  assert.equal(result.current.coverage.complete.percent, 100);
  assert.equal(result.improvedMaturityCells.length, 0);
  assert.equal(result.regressedConfidenceCells.length, 0);
  assert.equal(result.compatibility.warnings.length, 0);
});

test("maturity improvement and confidence regression remain separate dimensions", () => {
  const cellId = "personnel-security.identify";
  const baseline = completeCell(createAssessment(), cellId, 1, 4);
  const current = completeCell(createAssessment(), cellId, 3, 1);

  const result = compare(baseline, current);
  const cell = result.cells.find((entry) => entry.cellId === cellId);

  assert.deepEqual(cell.maturity, {
    baseline: 1,
    current: 3,
    delta: 2,
    state: "improved"
  });
  assert.deepEqual(cell.confidence, {
    baseline: 100,
    current: 25,
    delta: -75,
    state: "regressed"
  });
  assert.deepEqual(result.improvedMaturityCells.map((entry) => entry.cellId), [cellId]);
  assert.deepEqual(result.regressedConfidenceCells.map((entry) => entry.cellId), [cellId]);
  assert.equal(Object.hasOwn(result, "riskScore"), false);
});

test("paired deltas exclude newly and no-longer assessed cells without hiding coverage", () => {
  let baseline = createAssessment();
  let current = createAssessment();
  baseline = completeCell(baseline, "personnel-security.identify", 1, 1);
  baseline = completeCell(baseline, "personnel-security.protect", 4, 4);
  current = completeCell(current, "personnel-security.identify", 2, 2);
  current = completeCell(current, "personnel-security.detect", 3, 3);

  const result = compare(baseline, current);

  assert.equal(result.paired.maturity.cellCount, 1);
  assert.equal(result.paired.maturity.delta, 1);
  assert.equal(result.paired.confidence.cellCount, 1);
  assert.equal(result.paired.confidence.delta, 25);
  assert.equal(result.baseline.coverage.complete.cellCount, 2);
  assert.equal(result.current.coverage.complete.cellCount, 2);
  assert.deepEqual(result.newlyAssessedCells.map((entry) => entry.cellId), ["personnel-security.detect"]);
  assert.deepEqual(result.noLongerAssessedCells.map((entry) => entry.cellId), ["personnel-security.protect"]);
});

test("framework and overlay differences remain visible comparison context", () => {
  const baseline = createAssessment("1.1.0");
  const current = {
    ...createAssessment("1.3.0"),
    overlay: { id: "eu-fi", version: "0.1.0-pilot" }
  };

  const result = compare(baseline, current);

  assert.equal(result.compatibility.sameFrameworkVersion, false);
  assert.equal(result.compatibility.sameOverlay, false);
  assert.deepEqual(result.compatibility.warnings.map((warning) => warning.code), [
    "FRAMEWORK_VERSION_CHANGED",
    "OVERLAY_CHANGED"
  ]);
  assert.equal(result.baseline.frameworkVersion, "1.1.0");
  assert.deepEqual(result.current.overlay, { id: "eu-fi", version: "0.1.0-pilot" });
});

test("critical gaps and actions use exact normalized text transitions without semantic inference", () => {
  let baseline = createAssessment();
  let current = createAssessment();
  baseline = completeCell(baseline, "personnel-security.identify", 2, 2, {
    criticalGap: "A legacy gap",
    nextAction: "Retire the old action",
    ownerRole: "Security lead"
  });
  current = completeCell(current, "personnel-security.identify", 2, 2, {
    criticalGap: "",
    nextAction: "Approve the replacement action",
    ownerRole: "Executive sponsor"
  });
  baseline = completeCell(baseline, "personnel-security.protect", 2, 2, {
    criticalGap: "Spacing   only"
  });
  current = completeCell(current, "personnel-security.protect", 2, 2, {
    criticalGap: "Spacing only"
  });
  current = completeCell(current, "personnel-security.detect", 1, 1, {
    criticalGap: "<img src=x onerror=alert(1)>",
    nextAction: "Review <script>not markup</script>",
    ownerRole: "Board secretary"
  });

  const result = compare(baseline, current);
  const removedGap = result.cells.find((cell) => cell.cellId === "personnel-security.identify");
  const unchangedGap = result.cells.find((cell) => cell.cellId === "personnel-security.protect");
  const newGap = result.cells.find((cell) => cell.cellId === "personnel-security.detect");

  assert.equal(removedGap.criticalGap.state, "removed");
  assert.equal(removedGap.nextAction.state, "changed");
  assert.equal(unchangedGap.criticalGap.state, "unchanged");
  assert.equal(newGap.criticalGap.state, "new");
  assert.deepEqual(result.openCriticalGaps.map((cell) => cell.cellId), [
    "personnel-security.protect",
    "personnel-security.detect"
  ]);
  assert.equal(result.openCriticalGaps.some((cell) => cell.cellId === "personnel-security.identify"), false);
  assert.equal(result.actionPortfolio.length, 2);
  assert.equal(result.actionPortfolio[1].nextAction.current, "Review <script>not markup</script>");
});

test("board summary accepts at most five explicit decisions and never mutates comparison state", () => {
  let baseline = createAssessment();
  let current = createAssessment();
  const candidateIds = model.getCellIds(domainDefinitions, phaseDefinitions).slice(0, 6);
  candidateIds.forEach((cellId, index) => {
    baseline = completeCell(baseline, cellId, 3, 3);
    current = completeCell(current, cellId, index === 0 ? 1 : 2, 2, {
      criticalGap: `Gap ${index + 1}`,
      nextAction: `Action ${index + 1}`,
      ownerRole: index === 4 ? "" : `Owner role ${index + 1}`
    });
  });
  const result = compare(baseline, current);
  const before = JSON.stringify(result);
  const selections = candidateIds.slice(0, 5).map((cellId, index) => ({
    cellId,
    decision: index === 0
      ? { status: "required", text: "  Approve the funded response  " }
      : { status: "none" }
  }));

  const board = comparisonApi.buildBoardSummary(result, selections, {
    now: "2026-08-29T12:30:00.000Z"
  });

  assert.equal(board.schema, "csm-board-summary");
  assert.equal(board.schemaVersion, 1);
  assert.equal(board.findings.length, 5);
  assert.equal(board.findings[0].decision.text, "Approve the funded response");
  assert.equal(board.findings[4].ownerRole, "");
  assert.equal(board.baseline.frameworkVersion, "1.1.0");
  assert.equal(board.current.frameworkVersion, "1.1.0");
  assert.equal(JSON.stringify(result), before);
  assert.equal(result.suggestedFindings[0].cellId, candidateIds[0]);

  assert.throws(
    () => comparisonApi.buildBoardSummary(result, candidateIds.map((cellId) => ({
      cellId,
      decision: { status: "none" }
    }))),
    (error) => error && error.code === "TOO_MANY_FINDINGS"
  );
  assert.throws(
    () => comparisonApi.buildBoardSummary(result, [{
      cellId: candidateIds[0],
      decision: { status: "required", text: "   " }
    }]),
    (error) => error && error.code === "INVALID_DECISION"
  );
});

test("invalid snapshots and board selections fail closed with stable error codes", () => {
  const baseline = createAssessment();
  const current = createAssessment();

  assert.throws(
    () => compare({ ...baseline, schemaVersion: 99 }, current),
    (error) => error && error.code === "INVALID_BASELINE"
  );
  assert.throws(
    () => compare(baseline, { ...current, cells: {} }),
    (error) => error && error.code === "INVALID_CURRENT"
  );

  const result = compare(baseline, current);
  assert.throws(
    () => comparisonApi.buildBoardSummary(result, [
      { cellId: "personnel-security.identify", decision: { status: "none" } },
      { cellId: "personnel-security.identify", decision: { status: "none" } }
    ]),
    (error) => error && error.code === "DUPLICATE_FINDING"
  );
  assert.throws(
    () => comparisonApi.buildBoardSummary(result, [{
      cellId: "unknown.identify",
      decision: { status: "none" }
    }]),
    (error) => error && error.code === "INVALID_FINDING"
  );
});

test("comparison print mode persists until the browser dispatches afterprint", () => {
  const attributes = new Map();
  const body = {
    setAttribute: (name, value) => attributes.set(name, value),
    removeAttribute: (name) => attributes.delete(name)
  };
  let afterPrintHandler = null;
  let afterPrintOptions = null;
  let printCalls = 0;

  comparisonControllerApi.beginComparisonPrint({
    body,
    addEventListener: (type, handler, options) => {
      assert.equal(type, "afterprint");
      afterPrintHandler = handler;
      afterPrintOptions = options;
    },
    print: () => {
      printCalls += 1;
    }
  });

  assert.equal(printCalls, 1);
  assert.equal(attributes.get("data-print-view"), "comparison");
  assert.deepEqual(afterPrintOptions, { once: true });
  assert.equal(typeof afterPrintHandler, "function");
  afterPrintHandler();
  assert.equal(attributes.has("data-print-view"), false);
});

test("assessment page exposes an accessible two-snapshot comparison and board-report surface", () => {
  const html = fs.readFileSync(new URL("assessment.html", root), "utf8");
  const css = fs.readFileSync(new URL("assessment.css", root), "utf8");
  const controller = fs.readFileSync(new URL("assessment-comparison.js", root), "utf8");

  for (const id of [
    "comparisonError",
    "comparisonStatus",
    "baselineComparisonFile",
    "baselineComparisonPassphrase",
    "loadBaselineComparison",
    "currentComparisonFile",
    "currentComparisonPassphrase",
    "loadCurrentComparison",
    "compareSnapshots",
    "clearComparison",
    "comparisonReport",
    "comparisonChanges",
    "comparisonGaps",
    "comparisonActions",
    "boardFindingChoices",
    "generateBoardSummary",
    "boardSummaryReport",
    "printComparison"
  ]) {
    assert.match(html, new RegExp(`id="${id}"`), `assessment.html is missing #${id}`);
  }

  assert.match(
    html,
    /assessment-model\.js[\s\S]*assessment-crypto\.js[\s\S]*assessment-compare\.js[\s\S]*assessment\.js[\s\S]*assessment-comparison\.js/
  );
  assert.match(html, /<main id="assessment-workspace" tabindex="-1">/);
  assert.match(
    html,
    /<section class="assessment-comparison" id="assessment-comparison"[^>]*hidden[^>]*aria-busy="true"/,
    "The comparison surface must remain hidden until its controller initializes."
  );
  for (const id of ["baselineComparisonLoader", "currentComparisonLoader"]) {
    assert.match(html, new RegExp(`<fieldset[^>]*id="${id}"[^>]*disabled`));
  }
  for (const id of [
    "baselineComparisonFile",
    "baselineComparisonPassphrase",
    "loadBaselineComparison",
    "currentComparisonFile",
    "currentComparisonPassphrase",
    "loadCurrentComparison",
    "printComparison"
  ]) {
    assert.match(html, new RegExp(`<(?:input|button)[^>]*id="${id}"[^>]*disabled`));
  }
  assert.match(html, /Maximum file size: 1 MiB/);
  assert.match(html, /The two decrypted snapshots remain only in this tab/);
  assert.match(css, /body\[data-print-view="comparison"\]/);
  assert.match(
    css,
    /\.comparison-loader\s*\{[^}]*min-width:\s*0;[^}]*max-width:\s*100%;/s,
    "comparison fieldsets must be allowed to shrink inside a 320 px viewport"
  );
  assert.match(
    css,
    /\.comparison-loader input\s*\{[^}]*width:\s*100%;[^}]*max-width:\s*100%;/s,
    "comparison file and passphrase inputs must stay inside their loader"
  );
  assert.match(
    css,
    /body\[data-print-view="comparison"\] \.assessment-comparison\s*\{[^}]*display:\s*block !important;/s,
    "comparison print mode must reveal the comparison report"
  );
  assert.match(
    css,
    /@media print\s*\{[\s\S]*?\.assessment-comparison[\s\S]*?display:\s*none !important;/,
    "ordinary assessment printing must not include the comparison workspace"
  );
  assert.match(
    css,
    /body\[data-print-view="comparison"\] \.comparison-loaders[\s\S]*?display:\s*none !important;/,
    "comparison print mode must hide decryption loaders and interactive controls"
  );
  assert.match(controller, /\.textContent\s*=/);
  assert.match(controller, /buildBoardSummary\s*\(/);
  assert.match(controller, /MAX_BOARD_FINDINGS/);
  assert.match(controller, /data-print-view/);
  assert.match(controller, /afterprint/);
  assert.doesNotMatch(controller, /setTimeout\s*\(\s*clearPrintView/);
  assert.equal(
    (controller.match(/removeAttribute\("data-print-view"\)/g) || []).length,
    1,
    "Only the afterprint lifecycle may clear comparison print mode inside the comparison controller."
  );
  const resetViewsStart = controller.indexOf("const resetDerivedViews");
  const resetViewsEnd = controller.indexOf("const updateControls", resetViewsStart);
  assert.doesNotMatch(controller.slice(resetViewsStart, resetViewsEnd), /data-print-view/);
  assert.match(controller, /const beginComparisonPrint = \(\{ body, addEventListener, print \}\)/);
  assert.match(
    controller,
    /const showFatalError[\s\S]*section\.dataset\.fatal = "true";[\s\S]*control\.disabled = true;[\s\S]*elements\.loaders\.hidden = true;[\s\S]*elements\.error\.hidden = false;[\s\S]*section\.hidden = false;[\s\S]*elements\.error\.focus\(\);/,
    "A loaded but invalid comparison controller must expose one prepared, non-interactive fatal state."
  );
  assert.match(
    controller,
    /updateControls\(hasCrypto\);\s*section\.removeAttribute\("aria-busy"\);\s*section\.hidden = false;/,
    "The comparison surface must become visible only after successful initialization."
  );
  assert.match(controller, /catch \{\s*showFatalError\(/);
  const loadStart = controller.indexOf("const loadSlot");
  const loadEnd = controller.indexOf("const compareSnapshots", loadStart);
  const loadSource = controller.slice(loadStart, loadEnd);
  const orderedLoadTokens = [
    "const passphrase = slot.passphrase.value",
    'slot.passphrase.value = ""',
    "const file = slot.file.files",
    "const importToken = comparisonImportGuard.capture()",
    "cryptoApi.withExclusiveImport",
    "cryptoApi.decryptAssessment",
    "comparisonImportGuard.assertCurrent(importToken)",
    "slot.value = candidate"
  ];
  let previousTokenIndex = -1;
  for (const token of orderedLoadTokens) {
    const tokenIndex = loadSource.indexOf(token);
    assert.ok(tokenIndex > previousTokenIndex, `Comparison import must order ${token} after the preceding security boundary.`);
    previousTokenIndex = tokenIndex;
  }
  assert.match(
    loadSource,
    /await cryptoApi\.withExclusiveImport\(async \(\) => \{[\s\S]*const candidate = await cryptoApi\.decryptAssessment\([\s\S]*comparisonImportGuard\.assertCurrent\(importToken\);[\s\S]*slot\.value = candidate;[\s\S]*comparisonImportGuard\.invalidate\(\);[\s\S]*\n\s{8}\}\);/,
    "Comparison import must decrypt, verify freshness and commit inside one exclusive operation."
  );
  assert.match(controller, /IMPORT_BUSY:\s*globalThis\.AssessmentCrypto\.IMPORT_BUSY_MESSAGE/);
  assert.match(controller, /IMPORT_STATE_CHANGED:\s*globalThis\.AssessmentCrypto\.IMPORT_STATE_CHANGED_MESSAGE/);
  assert.match(controller, /const comparisonImportGuard = cryptoApi\.createImportCommitGuard\(\)/);
  const clearStart = controller.indexOf("const clearComparison");
  const clearEnd = controller.indexOf("const generateBoardSummary", clearStart);
  assert.match(
    controller.slice(clearStart, clearEnd),
    /comparisonImportGuard\.invalidate\(\)/,
    "Clearing the comparison must invalidate any pending snapshot import."
  );
  assert.doesNotMatch(controller, /\.innerHTML\b/);
  assert.doesNotMatch(controller, /\b(?:localStorage|sessionStorage|indexedDB|caches|serviceWorker)\b/);
  assert.doesNotMatch(controller, /\b(?:fetch|XMLHttpRequest|WebSocket|EventSource|sendBeacon)\b/);
  assert.doesNotMatch(controller, /\b(?:pushState|replaceState)\b/);
});

let failures = 0;
for (const { name, run } of tests) {
  try {
    await run();
    console.log(`PASS ${name}`);
  } catch (error) {
    failures += 1;
    console.error(`FAIL ${name}`);
    console.error(error);
  }
}

if (failures) {
  console.error(`ASSESSMENT COMPARISON VALIDATION FAILED (${failures}/${tests.length})`);
  process.exit(1);
}

console.log(`ASSESSMENT COMPARISON VALIDATION PASSED (${tests.length} tests)`);
