#!/usr/bin/env node

import assert from "node:assert/strict";
import { createHash, randomBytes } from "node:crypto";
import {
  appendFileSync,
  existsSync,
  readFileSync,
  rmSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import {
  compileReleaseSource,
  createSmokeRequest,
  evaluateSmokeResponse,
  fetchSmokeProbe,
  smokeRoutes,
  smokeSite,
  validateManifest,
} from "./site.mjs";
import {
  readExactAssetBytes,
  validateNuStandaloneEntries,
  validateStandaloneArchive,
} from "./validate_html.mjs";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(SCRIPT_DIR, "..");
const SITE_SCRIPT = resolve(SCRIPT_DIR, "site.mjs");
const SITE_MANIFEST = JSON.parse(readFileSync(resolve(SCRIPT_DIR, "site-manifest.json"), "utf8"));
const ARTIFACT = resolve(ROOT, `.site-pipeline-test-${process.pid}`);
const CHILD_ENV = { ...process.env };
delete CHILD_ENV.GITHUB_STEP_SUMMARY;
delete CHILD_ENV.GITHUB_SHA;
let passed = 0;

function runSite(...args) {
  return spawnSync(process.execPath, [SITE_SCRIPT, ...args], {
    cwd: ROOT,
    env: CHILD_ENV,
    encoding: "utf8",
    maxBuffer: 4 * 1024 * 1024,
  });
}

function output(result) {
  return `${result.stdout || ""}${result.stderr || ""}`;
}

function expectPass(args) {
  const result = runSite(...args);
  if (result.status !== 0) {
    throw new Error(`Expected site command to pass: ${args.join(" ")}\n${output(result)}`);
  }
}

function expectFail(args, pattern) {
  const result = runSite(...args);
  if (result.status === 0) {
    throw new Error(`Expected site command to fail: ${args.join(" ")}`);
  }
  if (!pattern.test(output(result))) {
    throw new Error(`Failure did not match ${pattern}:\n${output(result)}`);
  }
}

function rebuild() {
  expectPass(["build", ARTIFACT]);
}

function test(name, callback) {
  try {
    callback();
    passed += 1;
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
}

async function testAsync(name, callback) {
  try {
    await callback();
    passed += 1;
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
}

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

function manifestFixture(mutator) {
  const fixture = structuredClone(SITE_MANIFEST);
  mutator(fixture);
  return fixture;
}

function expectedIndex() {
  const bytes = Buffer.from(
    compileReleaseSource("index.html", readFileSync(resolve(ROOT, "index.html"), "utf8")),
    "utf8",
  );
  const title = bytes.toString("utf8").match(/<title>([\s\S]*?)<\/title>/i)?.[1].replace(/\s+/g, " ").trim() || "";
  return { file: "index.html", byteLength: bytes.byteLength, digest: sha256(bytes), title, bytes };
}

function scriptedSweep(states, attempts) {
  return async (_base, attempt) => {
    attempts.push(attempt);
    const successful = states[attempt - 1];
    return {
      failures: successful ? [] : [`fixture failure at attempt ${attempt}`],
      successes: [],
      probeCount: 1,
    };
  };
}

try {
  test("builds and validates the canonical manifest artifact", () => {
    rebuild();
  });

  test("builds the default artifact as an explicit v1.1 release scope", () => {
    rebuild();
    assert.equal(SITE_MANIFEST.releaseScope?.version, "1.1.0");
    assert.deepEqual(
      [...SITE_MANIFEST.htmlFiles].sort(),
      ["404.html", "acknowledgements.html", "framework.html", "index.html"],
    );

    const futureFiles = [
      "assessment.html",
      "assessment.css",
      "assessment-model.js",
      "assessment-crypto.js",
      "assessment-compare.js",
      "assessment.js",
      "assessment-comparison.js",
      "coverage.html",
      "coverage.css",
      "coverage.js",
      "coverage-model.js",
      "matrix-coverage.js",
      "matrix-coverage-governance.js",
      "matrix-coverage-safety.js",
      "matrix-coverage-digital.js",
      "matrix-overlays.js",
      "source-lifecycle-register.json",
      "source-change-register.json",
      "source-change-register.checkpoint.json",
      "OVERLAY-EU-FI.md",
      "SOURCE-CHANGE-REGISTER.md",
      "tasks/plan.md",
      "tasks/todo.md",
      "docs/ASSESSMENT-THREAT-MODEL.md",
      "docs/decisions/0001-local-assessment-and-encrypted-export.md",
      "docs/decisions/0002-separate-jurisdiction-overlays.md",
      "docs/ADR-0003-coverage-workspace.md",
      "docs/COVERAGE-WORKSPACE.md",
      "docs/COVERAGE-REVIEW.md",
    ];
    for (const file of futureFiles) {
      assert.equal(existsSync(resolve(ARTIFACT, file)), false, `${file} must not enter the v1.1 artifact`);
      assert.equal(existsSync(resolve(ROOT, file)), true, `${file} must remain available as future source work`);
    }
  });

  test("keeps included HTML and JavaScript closed over the v1.1 runtime", () => {
    rebuild();
    const forbiddenRuntimeReferences = [
      "assessment.html",
      "assessment.css",
      "assessment-model.js",
      "assessment-crypto.js",
      "assessment-compare.js",
      "assessment.js",
      "assessment-comparison.js",
      "coverage.html",
      "coverage.css",
      "coverage.js",
      "coverage-model.js",
      "matrix-coverage.js",
      "matrix-coverage-governance.js",
      "matrix-coverage-safety.js",
      "matrix-coverage-digital.js",
      "CSMCoverage",
      "matrix-overlays.js",
      "matrixOverlays",
      "overlaySelect",
      "overlayContext",
      "requestedOverlay",
      "overlayCatalog",
      "setOverlay(",
      "source-lifecycle-register.json",
      "source-change-register.json",
      "csm-release-scope:",
    ];
    const runtimeFiles = SITE_MANIFEST.files.filter((file) => /\.(?:html|js)$/.test(file));
    for (const file of runtimeFiles) {
      const text = readFileSync(resolve(ARTIFACT, file), "utf8");
      for (const reference of forbiddenRuntimeReferences) {
        assert.equal(text.includes(reference), false, `${file} contains future runtime reference ${reference}`);
      }
    }

    const syntax = spawnSync(process.execPath, ["--check", resolve(ARTIFACT, "app.js")], {
      cwd: ROOT,
      encoding: "utf8",
    });
    assert.equal(syntax.status, 0, output(syntax));
  });

  test("prunes the additive draft coverage workspace link from the public v1.1 artifact", () => {
    rebuild();
    const source = readFileSync(resolve(ROOT, "index.html"), "utf8");
    assert.match(source, /<!-- csm-release-scope:v1\.2\.0:begin -->[\s\S]*?href="coverage\.html"[\s\S]*?<!-- csm-release-scope:v1\.2\.0:end -->/);
    assert.equal(readFileSync(resolve(ARTIFACT, "index.html"), "utf8").includes("coverage.html"), false);
    assert.equal(existsSync(resolve(ARTIFACT, "coverage.html")), false);
    assert.deepEqual([...SITE_MANIFEST.htmlFiles].sort(), ["404.html", "acknowledgements.html", "framework.html", "index.html"]);
    assert.throws(
      () => validateManifest(manifestFixture((manifest) => { manifest.files.push("coverage.html"); })),
      /Future release file entered the v1\.1 manifest/,
    );
  });

  test("compiles the v1.1 control bar to two occupied columns", () => {
    rebuild();
    const css = readFileSync(resolve(ARTIFACT, "styles.css"), "utf8");
    assert.match(
      css,
      /\.control-bar\s*\{[\s\S]*?grid-template-columns:\s*minmax\(280px, 1fr\) auto;[\s\S]*?\}/,
    );
    assert.doesNotMatch(
      css,
      /grid-template-columns:\s*minmax\(280px, 1fr\) minmax\(220px, 0\.55fr\) auto;/,
    );
    assert.doesNotMatch(
      css,
      /grid-template-columns:\s*minmax\(260px, 1fr\) minmax\(220px, 0\.65fr\);/,
    );
    assert.doesNotMatch(css, /\.control-panel--view\s*\{\s*grid-column:\s*1 \/ -1;/);
  });

  test("rejects a future runtime reference injected into an included JavaScript file", () => {
    rebuild();
    appendFileSync(resolve(ARTIFACT, "app.js"), "\nvoid matrixOverlays;\n", "utf8");
    expectFail(["validate", ARTIFACT], /app\.js contains future runtime reference matrixOverlays/);
  });

  test("fails closed on malformed or incomplete release-scope markers", () => {
    assert.throws(
      () => compileReleaseSource("index.html", "<!doctype html>\n"),
      /missing declared markers/,
    );
    assert.throws(
      () => compileReleaseSource(
        "index.html",
        "<!-- csm-release-scope:v1.3.0:begin -->\n<!-- csm-release-scope:v1.3.0:begin -->\n",
      ),
      /Nested release scopes/,
    );
    assert.throws(
      () => compileReleaseSource(
        "index.html",
        "<!-- csm-release-scope:v1.3.0:end -->\n",
      ),
      /Unmatched release-scope end marker/,
    );
    assert.throws(
      () => compileReleaseSource(
        "index.html",
        "<!-- csm-release-scope:v1.3.0:begin -->\nfuture content\n",
      ),
      /Unclosed release scope v1\.3\.0/,
    );
    assert.throws(
      () => compileReleaseSource(
        "index.html",
        "<!-- csm-release-scope:v1.3.0:begin */\n/* csm-release-scope:v1.3.0:end -->\n",
      ),
      /Mismatched release-scope marker delimiters/,
    );
    assert.throws(
      () => compileReleaseSource(
        "index.html",
        "<!-- csm-release-scope:v1.3.0:begin -->\n/* csm-release-scope:v1.3.0:end */\n",
      ),
      /Mismatched release-scope marker forms/,
    );
    assert.throws(
      () => compileReleaseSource(
        "index.html",
        "/* csm-release-scope:v1.3.0:begin */\n/* csm-release-scope:v1.3.0:end */\n",
      ),
      /Mismatched release-scope marker form/,
    );
    assert.throws(
      () => compileReleaseSource(
        "styles.css",
        "<!-- csm-release-scope:v1.3.0:begin -->\n<!-- csm-release-scope:v1.3.0:end -->\n",
      ),
      /Mismatched release-scope marker form/,
    );
  });

  test("rejects CSS and Markdown marker sources omitted from pruning declarations", () => {
    for (const file of ["styles.css", "SOURCE-LIBRARY.md"]) {
      assert.throws(
        () => validateManifest(manifestFixture((manifest) => {
          delete manifest.releaseScope.sourcePruning[file];
        })),
        new RegExp(`undeclared source file: ${file.replace(".", "\\.")}`),
      );
    }
  });

  test("scans every published text artifact category for leaked release markers", () => {
    for (const [file, marker] of [
      ["styles.css", "\n/* csm-release-scope:v1.3.0:begin */\n"],
      ["README.md", "\n<!-- csm-release-scope:v1.3.0:begin -->\n"],
      ["robots.txt", "\n<!-- csm-release-scope:v1.3.0:begin -->\n"],
      ["sitemap.xml", "\n<!-- csm-release-scope:v1.3.0:begin -->\n"],
      ["CITATION.cff", "\n# csm-release-scope:v1.3.0:begin\n"],
      ["assets/favicon.svg", "\n<!-- csm-release-scope:v1.3.0:begin -->\n"],
      ["LICENSE", "\ncsm-release-scope:v1.3.0:begin\n"],
    ]) {
      rebuild();
      appendFileSync(resolve(ARTIFACT, file), marker, "utf8");
      expectFail(["validate", ARTIFACT], new RegExp(`${file.replace(".", "\\.")} contains an uncompiled release-scope marker`));
    }
  });

  test("rejects unsafe or internally inconsistent release manifests", () => {
    assert.throws(
      () => validateManifest(manifestFixture((manifest) => { manifest.releaseScope.version = "1.2.0"; })),
      /default Pages release scope must be exactly v1\.1\.0/,
    );
    assert.throws(
      () => validateManifest(manifestFixture((manifest) => { manifest.releaseScope.excludedScopes = ["v1.3.0"]; })),
      /must exclude exactly/,
    );
    assert.throws(
      () => validateManifest(manifestFixture((manifest) => { manifest.releaseScope.excludedFiles.push("index.html"); })),
      /Future release file entered the v1\.1 manifest/,
    );
    assert.throws(
      () => validateManifest(manifestFixture((manifest) => {
        manifest.releaseScope.excludedFiles = manifest.releaseScope.excludedFiles.filter(
          (file) => file !== "source-lifecycle-register.json",
        );
        manifest.files.push("source-lifecycle-register.json");
      })),
      /excludedFiles must contain exactly the known post-v1\.1 source files/,
    );
    assert.throws(
      () => validateManifest(manifestFixture((manifest) => {
        manifest.files.push("source-change-register.checkpoint.json");
      })),
      /Future release file entered the v1\.1 manifest: source-change-register\.checkpoint\.json/,
    );
    assert.throws(
      () => validateManifest(manifestFixture((manifest) => { manifest.files[0] = "../index.html"; })),
      /normalized repository-relative POSIX path/,
    );
    assert.throws(
      () => validateManifest(manifestFixture((manifest) => { manifest.releaseScope.forbiddenRuntimeReferences.push(""); })),
      /forbiddenRuntimeReferences must be a non-empty string array/,
    );
  });

  test("requires the exact ordered predeploy workflow identities", () => {
    const canonicalPredeployError =
      /requiredPredeployWorkflows must contain exactly validate\.yml\/Quality followed by links\.yml\/External source links\./;
    assert.throws(
      () => validateManifest(manifestFixture((manifest) => {
        manifest.requiredPredeployWorkflows.pop();
      })),
      canonicalPredeployError,
    );
    assert.throws(
      () => validateManifest(manifestFixture((manifest) => {
        manifest.requiredPredeployWorkflows.push({ file: "audit.yml", name: "Audit" });
      })),
      canonicalPredeployError,
    );
    assert.throws(
      () => validateManifest(manifestFixture((manifest) => {
        manifest.requiredPredeployWorkflows[1].file = "pages.yml";
      })),
      canonicalPredeployError,
    );
    assert.throws(
      () => validateManifest(manifestFixture((manifest) => {
        manifest.requiredPredeployWorkflows[1].name = "External links";
      })),
      canonicalPredeployError,
    );
    assert.throws(
      () => validateManifest(manifestFixture((manifest) => {
        manifest.requiredPredeployWorkflows.reverse();
      })),
      canonicalPredeployError,
    );
  });

  test("pins the W3C Nu checker to the exact reviewed official standalone asset identity", () => {
    const expectedNu = {
      version: "26.8.30",
      distribution: "npm-tarball",
      packageName: "vnu-jar",
      tarballUrl: "https://registry.npmjs.org/vnu-jar/-/vnu-jar-26.8.30.tgz",
      tarballSizeBytes: 30116214,
      tarballSha256: "2bda313c3dd6d05ada3655085ea12e40b380826fde8f719a44cb4deda6c8c887",
      tarballIntegrity: "sha512-M+m1H4/3lkBQGBFqmLpCB9nf7/4+Zqb4di0kNEwJ130vsyR2R/E8fULkL1IO9+TA3LwS8Dto07TT8ACzkXwNog==",
      unpackedTarSizeBytes: 32649216,
      archiveEntry: "package/build/dist/vnu.jar",
      packageArchiveEntries: [
        "package/LICENSE",
        "package/build/dist/vnu.jar",
        "package/vnu-jar.js",
        "package/vnu-java-downloader.js",
        "package/package.json",
        "package/README.md",
      ],
      releaseId: 258370454,
      releaseTargetCommit: "f84563f28898457af3cb76ec8c820cf17a2174c4",
      assetId: 535987626,
      assetUrl: "https://api.github.com/repos/validator/validator/releases/assets/535987626",
      assetSizeBytes: 32626931,
      sha256: "b7d886d87b031ca3096cf982477df911b3002448e48228510fd981a3b9c67f8e",
      upstreamSha1: "8e058f91d2777b777626ded9ec924478ec0feab1",
      mainClass: "nu.validator.client.SimpleCommandLineValidator",
      requiredArchiveEntries: [
        "META-INF/MANIFEST.MF",
        "nu/validator/client/SimpleCommandLineValidator.class",
        "org/eclipse/jetty/client/Response$CompleteListener.class",
        "com/ibm/icu/text/CharsetDetector.class",
      ],
    };
    assert.deepEqual(SITE_MANIFEST.w3cNu, expectedNu);

    for (const mutate of [
      (nu) => { nu.assetUrl = "https://repo1.maven.org/maven2/nu/validator/validator/26.8.24/validator-26.8.24.jar"; },
      (nu) => { nu.version = "26.8.24"; },
      (nu) => { nu.releaseId += 1; },
      (nu) => { nu.releaseTargetCommit = "0".repeat(40); },
      (nu) => { nu.assetId += 1; },
      (nu) => { nu.assetSizeBytes -= 1; },
      (nu) => { nu.sha256 = "0".repeat(64); },
      (nu) => { nu.upstreamSha1 = "0".repeat(40); },
      (nu) => { nu.requiredArchiveEntries.pop(); },
      (nu) => { nu.tarballUrl = "https://example.invalid/vnu.tgz"; },
      (nu) => { nu.tarballSizeBytes -= 1; },
      (nu) => { nu.tarballSha256 = "0".repeat(64); },
      (nu) => { nu.tarballIntegrity = "sha512-unknown"; },
      (nu) => { nu.unpackedTarSizeBytes += 512; },
      (nu) => { nu.archiveEntry = "package/other.jar"; },
      (nu) => { nu.packageArchiveEntries.pop(); },
      (nu) => { nu.unreviewedMirror = "https://example.invalid/vnu.jar"; },
    ]) {
      assert.throws(
        () => validateManifest(manifestFixture((manifest) => { mutate(manifest.w3cNu); })),
        /w3cNu must pin exactly the reviewed official standalone validator distribution/,
      );
    }
  });

  test("rejects a Nu archive that lacks standalone runtime dependencies", () => {
    const requiredEntries = SITE_MANIFEST.w3cNu.requiredArchiveEntries;
    assert.doesNotThrow(() => validateNuStandaloneEntries([
      "META-INF/MANIFEST.MF",
      ...requiredEntries,
      "nu/validator/messages.properties",
    ]));
    assert.throws(
      () => validateNuStandaloneEntries([
        "META-INF/MANIFEST.MF",
        "nu/validator/client/SimpleCommandLineValidator.class",
      ]),
      /standalone archive is missing required entries: .*org\/eclipse\/jetty\/client\/Response\$CompleteListener\.class/,
    );
    assert.throws(
      () => validateNuStandaloneEntries("nu/validator/client/SimpleCommandLineValidator.class"),
      /archive entry list must be an array/,
    );

    let inspectedCommand;
    assert.throws(
      () => validateStandaloneArchive("/tmp/thin-validator.jar", (command, args, options) => {
        inspectedCommand = { command, args, options };
        return {
          status: 0,
          stdout: "META-INF/MANIFEST.MF\nnu/validator/client/SimpleCommandLineValidator.class\n",
          stderr: "",
        };
      }),
      /org\/eclipse\/jetty\/client\/Response\$CompleteListener\.class/,
    );
    assert.equal(inspectedCommand.command, "jar");
    assert.deepEqual(inspectedCommand.args, ["--list", "--file", "/tmp/thin-validator.jar"]);
  });

  await testAsync("bounds Nu asset downloads even when Content-Length is absent", async () => {
    const exactResponse = new Response(new ReadableStream({
      start(controller) {
        controller.enqueue(new Uint8Array([1, 2]));
        controller.enqueue(new Uint8Array([3, 4]));
        controller.close();
      },
    }));
    assert.deepEqual(await readExactAssetBytes(exactResponse, 4), Buffer.from([1, 2, 3, 4]));

    const oversizedResponse = new Response(new ReadableStream({
      start(controller) {
        controller.enqueue(new Uint8Array([1, 2, 3]));
        controller.enqueue(new Uint8Array([4, 5]));
      },
    }));
    await assert.rejects(
      () => readExactAssetBytes(oversizedResponse, 4),
      /download exceeded 4 bytes before completion/,
    );
  });

  test("refuses to replace the repository root", () => {
    expectFail(["build", ROOT], /Refusing to replace unsafe build target/);
  });

  test("rejects a file outside the artifact manifest", () => {
    rebuild();
    writeFileSync(resolve(ARTIFACT, "unexpected.txt"), "not published\n", "utf8");
    expectFail(["validate", ARTIFACT], /outside the manifest/);
  });

  test("rejects a missing manifest document", () => {
    rebuild();
    unlinkSync(resolve(ARTIFACT, "ROADMAP.md"));
    expectFail(["validate", ARTIFACT], /missing manifest files: ROADMAP\.md/);
  });

  test("rejects an unpublished internal link target", () => {
    rebuild();
    appendFileSync(resolve(ARTIFACT, "index.html"), '\n<a href="missing-public-page.html">Broken</a>\n', "utf8");
    expectFail(["validate", ARTIFACT], /references unpublished internal target/);
  });

  test("rejects sitemap and canonical-page drift", () => {
    rebuild();
    const sitemapPath = resolve(ARTIFACT, "sitemap.xml");
    const sitemap = readFileSync(sitemapPath, "utf8").replace(
      /\s*<url>\s*<loc>https:\/\/samran2\.github\.io\/corporate-security-matrix\/acknowledgements\.html<\/loc>[\s\S]*?<\/url>/,
      "",
    );
    writeFileSync(sitemapPath, sitemap, "utf8");
    expectFail(["validate", ARTIFACT], /sitemap\.xml locations differ from canonical pages/);
  });

  test("rejects a manifest deep link whose HTML fragment is missing", () => {
    rebuild();
    const frameworkPath = resolve(ARTIFACT, "framework.html");
    const framework = readFileSync(frameworkPath, "utf8").replace(' id="adoption-title"', "");
    writeFileSync(frameworkPath, framework, "utf8");
    expectFail(["validate", ARTIFACT], /Manifest deep link references missing fragment adoption-title/);
  });

  test("keeps both public recovery CTAs on explicit index.html", () => {
    for (const file of ["README.md", "404.html"]) {
      rebuild();
      const path = resolve(ARTIFACT, file);
      const text = readFileSync(path, "utf8").replace(
        "https://samran2.github.io/corporate-security-matrix/index.html",
        "https://samran2.github.io/corporate-security-matrix/",
      );
      writeFileSync(path, text, "utf8");
      expectFail(["validate", ARTIFACT], /public recovery CTA must point explicitly/);
    }
  });

  test("rejects runtime resources above the exact 150000-byte gzip budget", () => {
    rebuild();
    appendFileSync(resolve(ARTIFACT, "app.js"), randomBytes(200_000).toString("base64"), "utf8");
    expectFail(["validate", ARTIFACT], /budget is 150000/);
  });

  test("cache-busts root and index as independent no-cache requests", () => {
    const root = createSmokeRequest(new URL("https://example.test/"), 1, "token");
    const index = createSmokeRequest(new URL("https://example.test/index.html"), 1, "token");
    const bareRoot = createSmokeRequest(new URL("https://example.test/"), 1, "token", false);
    const bareIndex = createSmokeRequest(new URL("https://example.test/index.html"), 1, "token", false);
    assert.equal(new URL(root.url).pathname, "/");
    assert.equal(new URL(index.url).pathname, "/index.html");
    assert.equal(new URL(root.url).searchParams.get("__csm_smoke"), "token-1");
    assert.equal(root.headers["Cache-Control"], "no-cache, no-store, max-age=0");
    assert.equal(root.headers.Pragma, "no-cache");
    assert.equal(bareRoot.url, "https://example.test/");
    assert.equal(bareIndex.url, "https://example.test/index.html");
    assert.equal(bareRoot.headers["Cache-Control"], undefined);
    assert.equal(bareRoot.headers.Pragma, undefined);
  });

  test("smokes every public manifest file but not the Pages control file", () => {
    const routes = smokeRoutes();
    assert.equal(routes[0], "");
    assert.ok(routes.includes("index.html"));
    assert.ok(!routes.includes("assessment.html"));
    assert.ok(!routes.includes(".nojekyll"));
    assert.equal(routes.length, new Set(routes).size);
  });

  test("accepts only the expected route body and title", () => {
    const expected = expectedIndex();
    const evaluation = evaluateSmokeResponse({
      requestedUrl: "https://example.test/?__csm_smoke=token-1",
      finalUrl: "https://example.test/?__csm_smoke=token-1",
      redirected: false,
      status: 200,
      bytes: expected.bytes,
    }, expected);
    assert.equal(evaluation.ok, true);
    assert.match(evaluation.marker, /^sha256:[a-f0-9]{64} title=/);
  });

  test("rejects an HTTP-200 Pages soft-404 body", () => {
    const expected = expectedIndex();
    const soft404 = Buffer.from("<!doctype html><title>Site not found · GitHub Pages</title><h1>There isn't a GitHub Pages site here.</h1>");
    const evaluation = evaluateSmokeResponse({
      requestedUrl: "https://example.test/?__csm_smoke=token-1",
      finalUrl: "https://example.test/?__csm_smoke=token-1",
      redirected: false,
      status: 200,
      bytes: soft404,
    }, expected);
    assert.equal(evaluation.ok, false);
    assert.match(evaluation.reason, /expected title/);
  });

  test("rejects stale same-title content and path redirects", () => {
    const expected = expectedIndex();
    const stale = Buffer.concat([expected.bytes, Buffer.from("\n<!-- stale edge -->")]);
    const staleEvaluation = evaluateSmokeResponse({
      requestedUrl: "https://example.test/?__csm_smoke=token-1",
      finalUrl: "https://example.test/?__csm_smoke=token-1",
      redirected: false,
      status: 200,
      bytes: stale,
    }, expected);
    assert.equal(staleEvaluation.ok, false);
    assert.match(staleEvaluation.reason, /body differs/);

    const redirectEvaluation = evaluateSmokeResponse({
      requestedUrl: "https://example.test/?__csm_smoke=token-1",
      finalUrl: "https://example.test/404.html",
      redirected: true,
      status: 200,
      bytes: expected.bytes,
    }, expected);
    assert.equal(redirectEvaluation.ok, false);
    assert.match(redirectEvaluation.reason, /redirected/);
  });

  test("rejects a same-path redirect that adds a cache-busting query", () => {
    const expected = expectedIndex();
    const evaluation = evaluateSmokeResponse({
      requestedUrl: "https://example.test/",
      finalUrl: "https://example.test/?__csm_smoke=redirect-added",
      redirected: true,
      status: 200,
      bytes: expected.bytes,
    }, expected);
    assert.equal(evaluation.ok, false);
    assert.match(evaluation.reason, /response was redirected/);
  });

  await testAsync("carries the fetch redirect signal into production smoke evaluation", async () => {
    const expected = expectedIndex();
    await assert.rejects(
      fetchSmokeProbe(
        {
          request: { url: "https://example.test/", cache: "default", headers: {} },
          expected,
        },
        async () => ({
          url: "https://example.test/?__csm_smoke=redirect-added",
          redirected: true,
          status: 200,
          headers: new Headers(),
          async arrayBuffer() { return expected.bytes; },
        }),
      ),
      /response was redirected/,
    );
  });

  await testAsync("accepts two consecutive coherent smoke sweeps", async () => {
    const attempts = [];
    await smokeSite("https://example.test/", 2, {
      sweep: scriptedSweep([true, true], attempts),
      delay: async () => {},
    });
    assert.deepEqual(attempts, [1, 2]);
  });

  await testAsync("resets coherent-sweep evidence after an intervening failure", async () => {
    const attempts = [];
    await assert.rejects(
      smokeSite("https://example.test/", 3, {
        sweep: scriptedSweep([true, false, true], attempts),
        delay: async () => {},
      }),
      /did not produce 2 consecutive coherent sweeps/,
    );
    assert.deepEqual(attempts, [1, 2, 3]);
  });

  await testAsync("accepts failure followed by two coherent sweeps", async () => {
    const attempts = [];
    await smokeSite("https://example.test/", 3, {
      sweep: scriptedSweep([false, true, true], attempts),
      delay: async () => {},
    });
    assert.deepEqual(attempts, [1, 2, 3]);
  });

  test("rejects a redirect that strips application query state", () => {
    const expected = expectedIndex();
    const evaluation = evaluateSmokeResponse({
      requestedUrl: "https://example.test/?domain=industrial-safety&view=mitigations&__csm_smoke=token-1",
      finalUrl: "https://example.test/?__csm_smoke=token-1",
      redirected: true,
      status: 200,
      bytes: expected.bytes,
    }, expected);
    assert.equal(evaluation.ok, false);
    assert.match(evaluation.reason, /preserve application query parameters/);
  });

  test("rejects a non-200 response even when its body is correct", () => {
    const expected = expectedIndex();
    const evaluation = evaluateSmokeResponse({
      requestedUrl: "https://example.test/?__csm_smoke=token-1",
      finalUrl: "https://example.test/?__csm_smoke=token-1",
      redirected: false,
      status: 404,
      bytes: expected.bytes,
    }, expected);
    assert.equal(evaluation.ok, false);
    assert.match(evaluation.reason, /expected HTTP 200/);
  });

  console.log(`SITE PIPELINE MUTATION TESTS PASSED — ${passed} cases`);
} finally {
  rmSync(ARTIFACT, { recursive: true, force: true });
}
