import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const sourceFiles = [
  "matrix-domains.js",
  "matrix-actors.js",
  "matrix-briefs.js",
  "matrix-references.js",
  "matrix-overlays.js",
  "matrix-tools-d01-d03.js",
  "matrix-tools-d04-d06.js",
  "matrix-tools-d07-d09.js",
  "matrix-tools.js"
];
const dataSource = sourceFiles
  .map((file) => fs.readFileSync(new URL(`../${file}`, import.meta.url), "utf8"))
  .join("\n");
const appSource = fs.readFileSync(new URL("../app.js", import.meta.url), "utf8");
const bootstrapMarker = "\ntry {\n  const bootstrapError = validateBootstrapData();";
assert(appSource.includes(bootstrapMarker), "app.js must retain the atomic bootstrap marker.");
const appPrelude = appSource.slice(0, appSource.indexOf(bootstrapMarker));

function validateFixture(mutation = "") {
  const context = {
    URL,
    document: {
      documentElement: { classList: { remove() {} } }
    }
  };
  context.window = context;
  const source = `${dataSource}\n${mutation}\n${appPrelude}\n;globalThis.__bootstrapResult = validateBootstrapData();`;
  vm.runInNewContext(source, context, { filename: "runtime-bootstrap.fixture.js", timeout: 5_000 });
  return context.__bootstrapResult;
}

function replaceBindingWithNull(source, bindingName) {
  const declaration = `const ${bindingName} = {`;
  assert(source.includes(declaration), `${bindingName} fixture declaration must exist.`);
  return source.replace(
    declaration,
    `const ${bindingName} = null; const ignored${bindingName[0].toUpperCase()}${bindingName.slice(1)} = {`
  );
}

function runAtomicBootstrap(dataTransform) {
  const runtime = {
    body: { dataset: { appState: "pending" } },
    error: { hidden: true }
  };
  const context = {
    URL,
    document: {
      documentElement: { classList: { remove() {} } },
      body: runtime.body,
      getElementById(id) {
        return id === "matrixDataError" ? runtime.error : null;
      }
    }
  };
  context.window = context;
  const initializationCall = "\n    initializeApp();\n    document.body.dataset.appState = \"ready\";";
  assert(appSource.includes(initializationCall), "Atomic harness must locate the production initialization call.");
  const appWithStubbedInitialization = appSource.replace(
    initializationCall,
    "\n    globalThis.__initialized = true;\n    document.body.dataset.appState = \"ready\";"
  );

  vm.runInNewContext(`${dataTransform(dataSource)}\n${appWithStubbedInitialization}`, context, {
    filename: "runtime-bootstrap.atomic-fixture.js",
    timeout: 5_000
  });
  return { ...runtime, initialized: context.__initialized === true };
}

function runHistoryTransition(input, initialState = null) {
  const calls = [];
  const historyApi = {
    state: initialState,
    replaceState(state, _title, url) {
      this.state = state;
      calls.push({ method: "replace", state, url });
    },
    pushState(state, _title, url) {
      this.state = state;
      calls.push({ method: "push", state, url });
    }
  };
  const context = {
    URL,
    historyApi,
    historyInput: input,
    document: { documentElement: { classList: { remove() {} } } }
  };
  context.window = context;
  vm.runInNewContext(
    `${dataSource}\n${appPrelude}\n;writeCanonicalHistory(historyApi, historyInput);`,
    context,
    { filename: "runtime-history.fixture.js", timeout: 5_000 }
  );
  return JSON.parse(JSON.stringify(calls));
}

function classifyHistoryFragment(fragment) {
  const context = {
    URL,
    fragment,
    document: { documentElement: { classList: { remove() {} } } }
  };
  context.window = context;
  vm.runInNewContext(
    `${dataSource}\n${appPrelude}\n;globalThis.__fragmentResult = isHistoryFragmentFocusTarget(fragment);`,
    context,
    { filename: "runtime-history-fragment.fixture.js", timeout: 5_000 }
  );
  return context.__fragmentResult;
}

assert.equal(validateFixture(), "", "The canonical production dataset must pass runtime bootstrap.");

const cases = [
  {
    name: "wrong lifecycle phase order",
    mutation: "phases.reverse();",
    expected: "canonical order"
  },
  {
    name: "wrong security domain order",
    mutation: "domains.reverse();",
    expected: "canonical order"
  },
  {
    name: "duplicate matrix entry ID",
    mutation: "domains[0].cells.identify.threats[1].id = domains[0].cells.identify.threats[0].id;",
    expected: "Duplicate matrix entry ID"
  },
  {
    name: "normalized duplicate matrix entry text",
    mutation: "domains[0].cells.identify.threats[1].text = domains[0].cells.identify.threats[0].text.toUpperCase();",
    expected: "Duplicate matrix entry text"
  },
  {
    name: "entry ID with wrong domain prefix",
    mutation: "domains[0].cells.identify.threats[0].id = 'CSM-D09-I-R01';",
    expected: "entry ID contract is invalid"
  },
  {
    name: "entry ID with missing canonical suffix",
    mutation: "domains[0].cells.identify.threats[0].id = 'CSM-D01-I-R99';",
    expected: "entry ID contract is invalid"
  },
  {
    name: "missing EU–Finland pilot",
    mutation: "matrixOverlays.overlays = [];",
    expected: "overlay data is invalid"
  },
  {
    name: "missing overlay next-review date",
    mutation: "delete matrixOverlays.overlays[0].nextReview;",
    expected: "overlay data is invalid"
  },
  {
    name: "blank overlay label",
    mutation: "matrixOverlays.overlays[0].label = ' ';",
    expected: "overlay data is invalid"
  },
  {
    name: "duplicate overlay annotation phase",
    mutation: "matrixOverlays.overlays[0].annotations[0].phaseIds[1] = matrixOverlays.overlays[0].annotations[0].phaseIds[0];",
    expected: "overlay data is invalid"
  },
  {
    name: "impossible overlay review date",
    mutation: "matrixOverlays.overlays[0].reviewedAt = '2026-02-30';",
    expected: "overlay data is invalid"
  },
  {
    name: "unknown overlay schema field",
    mutation: "matrixOverlays.overlays[0].unexpected = true;",
    expected: "overlay data is invalid"
  },
  {
    name: "unknown overlay top-level field",
    mutation: "matrixOverlays.unexpected = true;",
    expected: "overlay data is invalid"
  },
  {
    name: "overlay entry mapping while disabled",
    mutation: "matrixOverlays.overlays[0].annotations[0].entryIds = ['CSM-D06-I-A01'];",
    expected: "overlay data is invalid"
  },
  {
    name: "overlay annotation domain outside pilot",
    mutation: "matrixOverlays.overlays[0].annotations[0].domainId = 'personnel-security';",
    expected: "overlay data is invalid"
  },
  {
    name: "unknown overlay annotation phase",
    mutation: "matrixOverlays.overlays[0].annotations[0].phaseIds[0] = 'retire';",
    expected: "overlay data is invalid"
  },
  {
    name: "duplicate overlay annotation ID",
    mutation: "matrixOverlays.overlays[0].annotations[1].id = matrixOverlays.overlays[0].annotations[0].id;",
    expected: "overlay data is invalid"
  },
  {
    name: "duplicate overlay source URL",
    mutation: "matrixOverlays.overlays[0].annotations[1].sources[0].url = matrixOverlays.overlays[0].annotations[0].sources[0].url;",
    expected: "overlay data is invalid"
  },
  {
    name: "impossible overlay effective date",
    mutation: "matrixOverlays.overlays[0].annotations[0].effective = '2023-02-31';",
    expected: "overlay data is invalid"
  },
  {
    name: "unsafe overlay source URL",
    mutation: "matrixOverlays.overlays[0].annotations[0].sources[0].url = 'https://example.com/nis2';",
    expected: "overlay data is invalid"
  },
  {
    name: "unsafe core source URL",
    mutation: "referencesByDomain[domains[0].id][0].url = 'javascript:alert(1)';",
    expected: "source pack is incomplete"
  },
  {
    name: "duplicate core source ID",
    mutation: "referencesByDomain[domains[0].id][1].id = referencesByDomain[domains[0].id][0].id;",
    expected: "source pack is incomplete"
  },
  {
    name: "duplicate phase source mapping",
    mutation: "phaseEvidenceByDomain[domains[0].id].identify.sourceIds[1] = phaseEvidenceByDomain[domains[0].id].identify.sourceIds[0];",
    expected: "matrix cell is incomplete"
  },
  {
    name: "orphaned core source record",
    mutation: "for (const mapping of Object.values(phaseEvidenceByDomain[domains[0].id])) mapping.sourceIds = mapping.sourceIds.filter((id) => id !== 'iso-31030-2021');",
    expected: "source pack is incomplete"
  },
  {
    name: "blank core source title",
    mutation: "referencesByDomain[domains[0].id][0].title = ' ';",
    expected: "source pack is incomplete"
  },
  {
    name: "unknown core source domain",
    mutation: "referencesByDomain.unexpected = [];",
    expected: "source data contract is invalid"
  },
  {
    name: "unknown phase-evidence key",
    mutation: "phaseEvidenceByDomain[domains[0].id].retire = phaseEvidenceByDomain[domains[0].id].recover;",
    expected: "phase evidence contract is incomplete"
  },
  {
    name: "blank lifecycle phase title",
    mutation: "phases[0].title = ' ';",
    expected: "lifecycle phase metadata is incomplete"
  },
  {
    name: "blank security domain name",
    mutation: "domains[0].name = ' ';",
    expected: "domain is incomplete"
  },
  {
    name: "extra matrix entry field",
    mutation: "domains[0].cells.identify.threats[0].legacyPosition = 1;",
    expected: "matrix cell is incomplete"
  }
];

for (const testCase of cases) {
  const result = validateFixture(testCase.mutation);
  assert(
    result.includes(testCase.expected),
    `${testCase.name} was not rejected as expected.\nExpected: ${testCase.expected}\nReceived: ${result}`
  );
  console.log(`PASS — runtime rejects ${testCase.name}`);
}

const canonicalRuntime = runAtomicBootstrap((source) => source);
assert.equal(canonicalRuntime.body.dataset.appState, "ready", "Canonical data must reach the ready state in the atomic harness.");
assert.equal(canonicalRuntime.error.hidden, true, "Canonical data must keep the accessible data error hidden.");
assert.equal(canonicalRuntime.initialized, true, "Canonical data must invoke the initialization boundary.");
console.log("PASS — atomic startup harness distinguishes the canonical ready state");

for (const bindingName of ["referencesByDomain", "phaseEvidenceByDomain"]) {
  const runtime = runAtomicBootstrap((source) => replaceBindingWithNull(source, bindingName));
  assert.equal(runtime.body.dataset.appState, "error", `${bindingName}=null must enter the atomic error state.`);
  assert.equal(runtime.error.hidden, false, `${bindingName}=null must reveal the accessible data error.`);
  assert.equal(runtime.initialized, false, `${bindingName}=null must not cross the initialization boundary.`);
  console.log(`PASS — atomic startup catches malformed ${bindingName}`);
}

assert.deepEqual(
  runHistoryTransition({
    currentUrl: "/index.html",
    nextUrl: "/index.html?domain=premises-security",
    push: true,
    focusSelector: "#tab-premises-security",
    returnFocusSelector: "#tab-personnel-security"
  }),
  [
    { method: "replace", state: { focusSelector: "#tab-personnel-security" }, url: "/index.html" },
    {
      method: "push",
      state: { focusSelector: "#tab-premises-security" },
      url: "/index.html?domain=premises-security"
    }
  ],
  "A pushed view must seed both the current entry's return focus and the destination focus."
);

assert.deepEqual(
  runHistoryTransition(
    {
      currentUrl: "/index.html",
      nextUrl: "/index.html",
      push: false,
      focusSelector: "#tab-personnel-security"
    },
    { focusSelector: "#tab-personnel-security" }
  ),
  [],
  "A canonical entry with correct focus metadata must not be rewritten."
);

assert.deepEqual(
  runHistoryTransition({
    currentUrl: "/index.html",
    nextUrl: "/index.html",
    push: false,
    focusSelector: "#tab-personnel-security"
  }),
  [{ method: "replace", state: { focusSelector: "#tab-personnel-security" }, url: "/index.html" }],
  "The initial canonical entry must receive focus metadata without adding a history entry."
);
console.log("PASS — history entries preserve return and destination focus without no-op writes");

for (const fragment of ["matrix-explorer", "source-pack", "source-personnel-security-iso-27001"]) {
  assert.equal(classifyHistoryFragment(fragment), true, `#${fragment} must retain fragment focus on history traversal.`);
}
for (const fragment of ["", "unknown-section", null]) {
  assert.equal(classifyHistoryFragment(fragment), false, `${String(fragment)} must fall back to history-state focus.`);
}
console.log("PASS — history traversal distinguishes focusable matrix fragments from canonical state focus");

console.log(
  `RUNTIME BOOTSTRAP TESTS PASSED — canonical baseline, ${cases.length} fail-closed mutations ` +
    "and 2 caught malformed-container startups."
);
