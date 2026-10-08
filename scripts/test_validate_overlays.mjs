import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const ROOT = new URL("../", import.meta.url);
const CORE_SOURCE = fs.readFileSync(new URL("matrix-domains.js", ROOT), "utf8");
const OVERLAY_SOURCE = fs.readFileSync(new URL("matrix-overlays.js", ROOT), "utf8");
const SOURCE_MAPPING = fs.readFileSync(new URL("OVERLAY-EU-FI.md", ROOT), "utf8");
const SOURCE_LIBRARY = fs.readFileSync(new URL("SOURCE-LIBRARY.md", ROOT), "utf8");
const VALIDATOR_SOURCE = fs.readFileSync(new URL("scripts/validate_overlays.mjs", ROOT), "utf8");

function replaceOnce(source, search, replacement, testName) {
  assert(source.includes(search), `${testName}: fixture pattern was not found.`);
  return source.replace(search, replacement);
}

function executeFixture(
  name,
  overlaySource,
  sourceMapping = SOURCE_MAPPING,
  sourceLibrary = SOURCE_LIBRARY
) {
  const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), "csm-overlay-validation-"));
  const scriptsDirectory = path.join(fixtureRoot, "scripts");
  fs.mkdirSync(scriptsDirectory);

  try {
    fs.writeFileSync(path.join(fixtureRoot, "matrix-domains.js"), CORE_SOURCE);
    fs.writeFileSync(path.join(fixtureRoot, "matrix-overlays.js"), overlaySource);
    fs.writeFileSync(path.join(fixtureRoot, "OVERLAY-EU-FI.md"), sourceMapping);
    fs.writeFileSync(path.join(fixtureRoot, "SOURCE-LIBRARY.md"), sourceLibrary);
    fs.writeFileSync(path.join(scriptsDirectory, "validate_overlays.mjs"), VALIDATOR_SOURCE);

    const result = spawnSync(process.execPath, [path.join(scriptsDirectory, "validate_overlays.mjs")], {
      encoding: "utf8",
      timeout: 10_000
    });
    return {
      name,
      status: result.status,
      output: `${result.stdout ?? ""}${result.stderr ?? ""}`
    };
  } finally {
    fs.rmSync(fixtureRoot, { recursive: true, force: true });
  }
}

const baseline = executeFixture("valid baseline", OVERLAY_SOURCE);
assert.equal(baseline.status, 0, `valid baseline should pass:\n${baseline.output}`);

const cases = [
  {
    name: "unknown top-level field",
    expected: "matrixOverlays has unknown field: unexpected",
    mutate: (source) =>
      replaceOnce(
        source,
        '  schemaVersion: "1.0.0",',
        '  schemaVersion: "1.0.0",\n  unexpected: true,',
        "unknown top-level field"
      )
  },
  {
    name: "entry mapping while disabled",
    expected: "entryIds is not allowed while scope.entryLevelMappings is false",
    mutate: (source) =>
      replaceOnce(
        source,
        '          phaseIds: ["identify", "protect", "detect", "respond", "recover"],\n          jurisdictions:',
        '          phaseIds: ["identify", "protect", "detect", "respond", "recover"],\n          entryIds: ["CSM-D06-I-A01"],\n          jurisdictions:',
        "entry mapping while disabled"
      )
  },
  {
    name: "domain outside pilot",
    expected: "domainId is outside the pilot: personnel-security",
    mutate: (source) =>
      replaceOnce(
        source,
        '          domainId: "information-and-cyber-security",',
        '          domainId: "personnel-security",',
        "domain outside pilot"
      )
  },
  {
    name: "unknown phase",
    expected: "phaseIds contains unknown phase: retire",
    mutate: (source) =>
      replaceOnce(
        source,
        '          phaseIds: ["identify", "protect", "detect", "respond", "recover"],',
        '          phaseIds: ["identify", "protect", "detect", "respond", "retire"],',
        "unknown phase"
      )
  },
  {
    name: "unofficial source host",
    expected: "must use an approved official source host: example.com",
    mutate: (source) =>
      replaceOnce(
        source,
        "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32022L2555",
        "https://example.com/nis2",
        "unofficial source host"
      )
  },
  {
    name: "duplicate annotation ID",
    expected: "Duplicate annotation ID: eu-fi-cyber-nis2-directive",
    mutate: (source) =>
      replaceOnce(
        source,
        '          id: "eu-fi-cyber-finland-act",',
        '          id: "eu-fi-cyber-nis2-directive",',
        "duplicate annotation ID"
      )
  },
  {
    name: "duplicate source URL",
    expected: "Overlay repeats source URL",
    mutate: (source) =>
      replaceOnce(
        source,
        "https://finlex.fi/fi/lainsaadanto/2025/124",
        "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32022L2555",
        "duplicate source URL"
      )
  },
  {
    name: "impossible calendar date",
    expected: "effective must be an ISO date",
    mutate: (source) =>
      replaceOnce(
        source,
        '          effective: "2023-01-16",',
        '          effective: "2023-02-31",',
        "impossible calendar date"
      )
  }
];

for (const testCase of cases) {
  const result = executeFixture(testCase.name, testCase.mutate(OVERLAY_SOURCE));
  assert.notEqual(result.status, 0, `${testCase.name} should fail closed.`);
  assert(
    result.output.includes(testCase.expected),
    `${testCase.name} did not report the expected failure.\nExpected: ${testCase.expected}\nOutput:\n${result.output}`
  );
}

const nis2MappingRow = SOURCE_MAPPING.split(/\r?\n/).find((line) =>
  line.startsWith("| `eu-fi-cyber-nis2-directive` |")
);
assert(nis2MappingRow, "NIS2 source-mapping row must exist in the baseline document.");

const documentationCases = [
  {
    name: "duplicate source-mapping row",
    expected: "must have exactly one source-mapping row",
    mutate: (source) => source.replace(nis2MappingRow, `${nis2MappingRow}\n${nis2MappingRow}`)
  },
  {
    name: "extra source URL in annotation row",
    expected: "source URL set does not match its OVERLAY-EU-FI.md row",
    mutate: (source) =>
      source.replace(
        nis2MappingRow,
        nis2MappingRow.replace(
          " |",
          " and [unmapped source](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32016R0679) |"
        )
      )
  },
  {
    name: "source URL moved to another annotation row",
    expected: "source URL set does not match its OVERLAY-EU-FI.md row",
    mutate: (source) => {
      const nis2Url = "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32022L2555";
      const finlandRow = source.split(/\r?\n/).find((line) =>
        line.startsWith("| `eu-fi-cyber-finland-act` |")
      );
      assert(finlandRow, "Finnish Cybersecurity Act source-mapping row must exist.");
      return source
        .replace(nis2MappingRow, nis2MappingRow.replace(`[Directive (EU) 2022/2555](${nis2Url})`, "Directive (EU) 2022/2555"))
        .replace(finlandRow, finlandRow.replace(" |", ` and [misplaced NIS2 source](${nis2Url}) |`));
    }
  }
];

for (const testCase of documentationCases) {
  const result = executeFixture(testCase.name, OVERLAY_SOURCE, testCase.mutate(SOURCE_MAPPING));
  assert.notEqual(result.status, 0, `${testCase.name} should fail closed.`);
  assert(
    result.output.includes(testCase.expected),
    `${testCase.name} did not report the expected failure.\nExpected: ${testCase.expected}\nOutput:\n${result.output}`
  );
}

const canonicalSourceLibraryCases = [
  {
    name: "overlay source missing from canonical source library",
    expected: "must have exactly one canonical source-library row",
    mutate: (source) =>
      source.replace(
        /^\| `eurlex-nis2-2022-2555` \|.*\n/m,
        ""
      )
  },
  {
    name: "noncanonical duplicate overlay source row",
    expected: "must use a bare HTTPS autolink",
    mutate: (source) => {
      const canonicalRow = source.split(/\r?\n/).find((line) =>
        line.startsWith("| `eurlex-nis2-2022-2555` |")
      );
      assert(canonicalRow, "Canonical NIS2 source-library row must exist.");
      const conflictingRow =
        "| `eurlex-nis2-2022-2555` | Conflicting record | [wrong link](https://example.invalid/fake) |";
      return source.replace(canonicalRow, `${canonicalRow}\n${conflictingRow}`);
    }
  },
  {
    name: "clickable link hidden in overlay source title",
    expected: "official record cell must be plain text",
    mutate: (source) =>
      source.replace(
        "| `eurlex-nis2-2022-2555` | Directive EU 2022/2555 |",
        "| `eurlex-nis2-2022-2555` | [Directive EU 2022/2555](https://attacker.invalid/fake) |"
      )
  }
];

for (const testCase of canonicalSourceLibraryCases) {
  const mutatedSourceLibrary = testCase.mutate(SOURCE_LIBRARY);
  assert.notEqual(
    mutatedSourceLibrary,
    SOURCE_LIBRARY,
    `${testCase.name}: canonical source-library fixture row must exist.`
  );
  const result = executeFixture(testCase.name, OVERLAY_SOURCE, SOURCE_MAPPING, mutatedSourceLibrary);
  assert.notEqual(result.status, 0, `${testCase.name} should fail closed.`);
  assert(
    result.output.includes(testCase.expected),
    `${testCase.name} did not report the expected failure.\nExpected: ${testCase.expected}\nOutput:\n${result.output}`
  );
}

console.log(
  `OVERLAY MUTATION TESTS PASSED — valid baseline and ` +
    `${cases.length + documentationCases.length + canonicalSourceLibraryCases.length} fail-closed cases.`
);
