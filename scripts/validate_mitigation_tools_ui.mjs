import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const ROOT = new URL("../", import.meta.url);
const html = fs.readFileSync(new URL("index.html", ROOT), "utf8");
const app = fs.readFileSync(new URL("app.js", ROOT), "utf8");
const css = fs.readFileSync(new URL("styles.css", ROOT), "utf8");
const dataFiles = [
  "matrix-domains.js",
  "matrix-actors.js",
  "matrix-briefs.js",
  "matrix-references.js",
  "matrix-overlays.js"
];
const toolFiles = [
  "matrix-tools-d01-d03.js",
  "matrix-tools-d04-d06.js",
  "matrix-tools-d07-d09.js"
];
const canonicalDisclaimer =
  "Tool suggestions are illustrative, vendor-neutral implementation aids. Select, configure and validate them for the organisation's context; they do not guarantee risk elimination.";
const dataSource = dataFiles
  .map((file) => fs.readFileSync(new URL(file, ROOT), "utf8"))
  .join("\n");
const fragmentSource = toolFiles
  .map((file) => fs.readFileSync(new URL(file, ROOT), "utf8"))
  .join("\n");
const aggregateSource = fs.readFileSync(new URL("matrix-tools.js", ROOT), "utf8");
const mutableAggregateSource = aggregateSource.replace(
  "const mitigationTools =",
  "let mitigationTools ="
);
const bootstrapMarker = "\ntry {\n  const bootstrapError = validateBootstrapData();";
assert(app.includes(bootstrapMarker), "app.js must retain the atomic bootstrap marker.");
const appPrelude = app.slice(0, app.indexOf(bootstrapMarker));

const errors = [];
const requireMatch = (value, pattern, message) => {
  if (!pattern.test(value)) errors.push(message);
};
const forbidMatch = (value, pattern, message) => {
  if (pattern.test(value)) errors.push(message);
};

const scriptOrder = [
  ...toolFiles.map((file) => `<script src="${file}"></script>`),
  '<script src="matrix-tools.js"></script>',
  '<script src="app.js"></script>'
].map((tag) => html.indexOf(tag));
if (
  scriptOrder.some((index) => index < 0) ||
  scriptOrder.some((index, position) => position > 0 && index <= scriptOrder[position - 1])
) {
  errors.push("Tool fragments and their aggregator must load in canonical order before app.js.");
}

requireMatch(
  html,
  new RegExp(`<p[^>]*class="[^"]*tooling-disclaimer[^"]*"[^>]*>${canonicalDisclaimer.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}</p>`),
  "The matrix needs one visible canonical vendor-neutral tooling disclaimer."
);
const visibleDisclaimerCount = html.split(canonicalDisclaimer).length - 1;
if (visibleDisclaimerCount !== 1) {
  errors.push(`The canonical tooling disclaimer must appear exactly once in visible HTML; found ${visibleDisclaimerCount}.`);
}

requireMatch(app, /function validateMitigationToolsBootstrapData\(/, "Runtime bootstrap must independently validate mitigation tooling.");
requireMatch(app, /typeof mitigationTools === "undefined"/, "Runtime bootstrap must safely detect a missing tooling aggregator.");
requireMatch(app, /const MITIGATION_TOOL_SCHEMA_VERSION = "1\.0\.0";/, "Runtime bootstrap must pin the tooling schema version.");
requireMatch(app, /mitigationTools\.schemaVersion\s*!==\s*MITIGATION_TOOL_SCHEMA_VERSION/, "Runtime bootstrap must enforce the tooling schema version.");
requireMatch(app, /const MITIGATION_TOOL_FRAMEWORK_VERSION = "1\.1\.0-candidate";/, "Runtime bootstrap must pin the framework version.");
requireMatch(app, /mitigationTools\.frameworkVersion\s*!==\s*MITIGATION_TOOL_FRAMEWORK_VERSION/, "Runtime bootstrap must enforce the framework version.");
requireMatch(app, /mitigationTools\.disclaimer[^\n]*MITIGATION_TOOL_DISCLAIMER/, "Runtime bootstrap must pin the tooling disclaimer.");
requireMatch(app, /mitigationIds\.size\s*!==\s*180/, "Runtime bootstrap must require exactly 180 canonical mitigation IDs.");
requireMatch(app, /tools\.length\s*!==\s*2/, "Runtime bootstrap must require exactly two tools per mitigation.");
requireMatch(app, /function createMitigationToolsDetails\(/, "Mitigation tiles need a dedicated accessible tooling disclosure renderer.");
requireMatch(app, /createElement\("details", "mitigation-tools"\)/, "Tool suggestions must render as native details disclosures.");
requireMatch(app, /"Implementation tools · 2"/, "Every tooling disclosure needs the stable summary text.");
requireMatch(
  app,
  /summary\.setAttribute\("aria-label", `Implementation tools for \$\{mitigationId\} · 2`\)/,
  "Repeated tooling disclosures need mitigation-specific accessible names."
);
requireMatch(app, /createElement\("ul", "mitigation-tools__list"\)/, "Tool records must render as a semantic list.");
requireMatch(app, /tool\.name[\s\S]{0,220}tool\.use/, "Each rendered tool needs both its name and operational use.");
requireMatch(
  app,
  /entry\.tools\.flatMap\(\(tool\) => \[tool\.name, tool\.use\]\)[\s\S]{0,220}getMatrixEntrySearchMatch\(state\.query, coreSearchValues, toolSearchValues\)/,
  "Search matching must classify core text separately from tool names and operational-use text."
);
requireMatch(
  app,
  /details\.open\s*=\s*revealTools/,
  "A tool-only search match must visibly reveal the matching tooling disclosure."
);
requireMatch(
  app,
  /createMatrixTile\(entry\.kind, entry\.label, entry\.text, entry\.id, entry\.tools, entry\.revealTools\)/,
  "The entry search result must carry its tooling-reveal state into the rendered tile."
);
forbidMatch(app, /\.innerHTML\s*=|insertAdjacentHTML|document\.write\s*\(/, "Tooling must use safe DOM construction only.");
forbidMatch(app, /\bfetch\s*\(|XMLHttpRequest|WebSocket/, "Tooling must not add runtime network requests.");
forbidMatch(app, /localStorage|sessionStorage|indexedDB/i, "Tooling must not add browser persistence.");

requireMatch(css, /\.tooling-disclaimer\s*\{/, "The visible tooling disclaimer needs project-native styling.");
requireMatch(css, /\.mitigation-tools\s*\{/, "Mitigation tooling disclosures need a stable visual container.");
requireMatch(
  css,
  /\.mitigation-tools__summary\s*\{[^}]*min-height:\s*2\.75rem/s,
  "Tool disclosure summaries must expose a 44px minimum touch target."
);
requireMatch(
  css,
  /\.mitigation-tools(?:__item|__name|__use|__summary)[^}]*\{[^}]*overflow-wrap:\s*anywhere/s,
  "Tool content must wrap safely in a 320px viewport."
);
requireMatch(
  css,
  /@media print[\s\S]*\.mitigation-tools\s*>\s*:not\(summary\)[^}]*display:\s*block\s*!important/s,
  "Print must expand and show closed mitigation-tool disclosures."
);
requireMatch(
  css,
  /@media print[\s\S]*\.tooling-disclaimer[\s\S]*color:\s*#000000\s*!important/s,
  "Print must retain a high-contrast tooling disclaimer."
);

function makeContext() {
  const contextObject = {
    URL,
    document: {
      documentElement: { classList: { remove() {} } }
    }
  };
  contextObject.window = contextObject;
  return vm.createContext(contextObject);
}

function validateFixture(mutation = "") {
  const context = makeContext();
  const source = [
    dataSource,
    fragmentSource,
    mutableAggregateSource,
    "mitigationTools = JSON.parse(JSON.stringify(mitigationTools));",
    mutation,
    appPrelude,
    ";globalThis.__bootstrapResult = validateBootstrapData();"
  ].join("\n");
  vm.runInContext(source, context, { filename: "mitigation-tools-ui.fixture.js", timeout: 5_000 });
  return context.__bootstrapResult;
}

function evaluateSearchMatch(query, coreValues, toolValues) {
  const context = makeContext();
  context.__searchFixture = { query, coreValues, toolValues };
  vm.runInContext(
    [
      appPrelude,
      "globalThis.__searchMatch = getMatrixEntrySearchMatch(",
      "  __searchFixture.query,",
      "  __searchFixture.coreValues,",
      "  __searchFixture.toolValues",
      ");"
    ].join("\n"),
    context,
    { filename: "mitigation-tools-ui.search-fixture.js", timeout: 5_000 }
  );
  return JSON.parse(JSON.stringify(context.__searchMatch));
}

function runAtomicScripts({ includeTooling = true, corruptTooling = false } = {}) {
  const runtime = {
    body: { dataset: { appState: "pending" } },
    error: { hidden: true }
  };
  const contextObject = {
    URL,
    document: {
      documentElement: { classList: { remove() {} } },
      body: runtime.body,
      getElementById(id) {
        return id === "matrixDataError" ? runtime.error : null;
      }
    }
  };
  contextObject.window = contextObject;
  const context = vm.createContext(contextObject);
  vm.runInContext(dataSource, context, { filename: "matrix-data.fixture.js", timeout: 5_000 });
  if (includeTooling) {
    const toolingSource = corruptTooling
      ? fragmentSource.replace('name: "Critical-role mapping system"', 'name: "https://unsafe.example/tool"')
      : fragmentSource;
    vm.runInContext(toolingSource, context, { filename: "matrix-tool-fragments.fixture.js", timeout: 5_000 });
    try {
      vm.runInContext(aggregateSource, context, { filename: "matrix-tools.fixture.js", timeout: 5_000 });
    } catch {
      // The app must still enter its accessible fatal state after an earlier data script rejects malformed input.
    }
  }

  const initializationCall = "\n    initializeApp();\n    document.body.dataset.appState = \"ready\";";
  assert(app.includes(initializationCall), "Atomic harness must locate the production initialization call.");
  const appWithStubbedInitialization = app.replace(
    initializationCall,
    "\n    globalThis.__initialized = true;\n    document.body.dataset.appState = \"ready\";"
  );
  vm.runInContext(appWithStubbedInitialization, context, {
    filename: "mitigation-tools-ui.atomic-fixture.js",
    timeout: 5_000
  });
  return { ...runtime, initialized: context.__initialized === true };
}

try {
  assert.deepEqual(
    evaluateSearchMatch(
      "Critical-role mapping system",
      ["Control or response action", "Map critical roles, delegated authorities and succession coverage"],
      [
        "Critical-role mapping system",
        "Link essential roles to authorities, skills, locations and named backup roles, then expose gaps in coverage."
      ]
    ),
    { matches: true, revealTools: true },
    "A tool-only query must match the entry and visibly reveal its tooling disclosure."
  );
  assert.deepEqual(
    evaluateSearchMatch(
      "Map critical roles, delegated authorities and succession coverage",
      ["Control or response action", "Map critical roles, delegated authorities and succession coverage"],
      [
        "Critical-role mapping system",
        "Link essential roles to authorities, skills, locations and named backup roles, then expose gaps in coverage."
      ]
    ),
    { matches: true, revealTools: false },
    "A core-text query must not force the tooling disclosure open."
  );
  assert.deepEqual(
    evaluateSearchMatch(
      "unrelated query",
      ["Control or response action", "Map critical roles, delegated authorities and succession coverage"],
      [
        "Critical-role mapping system",
        "Link essential roles to authorities, skills, locations and named backup roles, then expose gaps in coverage."
      ]
    ),
    { matches: false, revealTools: false },
    "An unrelated query must not match or reveal tooling."
  );
  assert.deepEqual(
    evaluateSearchMatch(
      "coverage",
      ["Control or response action", "Map critical roles, delegated authorities and succession coverage"],
      [
        "Critical-role mapping system",
        "Link essential roles to authorities, skills, locations and named backup roles, then expose gaps in coverage."
      ]
    ),
    { matches: true, revealTools: false },
    "A query matching both core text and tooling must not force the disclosure open."
  );
  assert.deepEqual(
    evaluateSearchMatch(
      "   ",
      ["Control or response action", "Map critical roles, delegated authorities and succession coverage"],
      ["Critical-role mapping system"]
    ),
    { matches: true, revealTools: false },
    "A blank query must preserve all entries without opening every tooling disclosure."
  );
  console.log("PASS — search reveals tooling only for a tool-only match");

  assert.equal(validateFixture(), "", "Canonical mitigation tooling must pass runtime bootstrap.");
  const mutations = [
    ["missing mitigation ID", "delete mitigationTools.entries['CSM-D01-I-M01'];"],
    ["unexpected mitigation ID", "mitigationTools.entries['CSM-D10-I-M01'] = mitigationTools.entries['CSM-D01-I-M01'];"],
    ["wrong schema version", "mitigationTools.schemaVersion = '2.0.0';"],
    ["wrong framework version", "mitigationTools.frameworkVersion = '1.0.0';"],
    ["changed disclaimer", "mitigationTools.disclaimer = 'Tools fix risk.';"],
    ["one-tool pair", "mitigationTools.entries['CSM-D01-I-M01'].pop();"],
    ["extra tool-record key", "mitigationTools.entries['CSM-D01-I-M01'][0].vendor = 'Example';"],
    ["duplicate tool names", "mitigationTools.entries['CSM-D01-I-M01'][1].name = mitigationTools.entries['CSM-D01-I-M01'][0].name;"],
    ["tool URL", "mitigationTools.entries['CSM-D01-I-M01'][0].use = 'Open https://unsafe.example/tool';"],
    ["bare uncommon-TLD URL", "mitigationTools.entries['CSM-D01-I-M01'][0].use = 'Configure vendor.example.xyz before use.';"],
    ["bare IP URL", "mitigationTools.entries['CSM-D01-I-M01'][0].use = 'Open 192.0.2.1/tool before use.';"],
    ["named vendor", "mitigationTools.entries['CSM-D01-I-M01'][0].name = 'Microsoft platform';"],
    ["named enterprise vendor", "mitigationTools.entries['CSM-D01-I-M01'][0].name = 'SAP case-management platform';"],
    ["named workforce vendor", "mitigationTools.entries['CSM-D01-I-M01'][0].name = 'Workday case-management platform';"],
    ["absolute risk claim", "mitigationTools.entries['CSM-D01-I-M01'][0].use = 'Guarantees complete security.';"],
    ["absolute compliance claim", "mitigationTools.entries['CSM-D01-I-M01'][0].use = 'This tool guarantees compliance with every requirement.';"],
    ["compliance certification claim", "mitigationTools.entries['CSM-D01-I-M01'][0].use = 'This tool certifies compliance with every requirement.';"],
    ["impossible-incident claim", "mitigationTools.entries['CSM-D01-I-M01'][0].use = 'This makes every incident impossible.';"],
    ["infallibility claim", "mitigationTools.entries['CSM-D01-I-M01'][0].use = 'This control cannot fail.';"],
    ["infallible-control claim", "mitigationTools.entries['CSM-D01-I-M01'][0].use = 'This control is infallible.';"],
    ["never-occurs guarantee", "mitigationTools.entries['CSM-D01-I-M01'][0].use = 'This tool guarantees that incidents never occur.';"],
    ["always-protects claim", "mitigationTools.entries['CSM-D01-I-M01'][0].use = 'This always protects personnel.';"],
    ["markup delimiter", "mitigationTools.entries['CSM-D01-I-M01'][0].name = '<tool>';"],
    ["overlong name", `mitigationTools.entries['CSM-D01-I-M01'][0].name = '${"x".repeat(73)}';`]
  ];
  for (const [name, mutation] of mutations) {
    const result = validateFixture(mutation);
    assert(result.includes("mitigation-tool data is invalid"), `${name} was not rejected atomically; received: ${result}`);
    console.log(`PASS — runtime rejects ${name}`);
  }

  const canonicalRuntime = runAtomicScripts();
  assert.equal(canonicalRuntime.body.dataset.appState, "ready");
  assert.equal(canonicalRuntime.error.hidden, true);
  assert.equal(canonicalRuntime.initialized, true);
  console.log("PASS — canonical tooling crosses the atomic initialization boundary");

  for (const fixture of [
    ["missing tooling scripts", { includeTooling: false }],
    ["malformed tooling scripts", { includeTooling: true, corruptTooling: true }]
  ]) {
    const [name, options] = fixture;
    const runtime = runAtomicScripts(options);
    assert.equal(runtime.body.dataset.appState, "error", `${name} must enter the fatal state.`);
    assert.equal(runtime.error.hidden, false, `${name} must reveal the accessible fatal alert.`);
    assert.equal(runtime.initialized, false, `${name} must not render a plausible matrix.`);
    console.log(`PASS — ${name} fail closed before matrix initialization`);
  }
} catch (error) {
  errors.push(error.message);
}

if (errors.length) {
  console.error("MITIGATION TOOL UI VALIDATION FAILED");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log("MITIGATION TOOL UI VALIDATION PASSED");
console.log("- Atomic 180-ID tooling contract and fail-closed mutations present");
console.log("- Accessible disclosures, tool-aware search and safe DOM rendering present");
console.log("- 44px, 320px wrapping and expanded print safeguards present");
