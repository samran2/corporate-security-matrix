#!/usr/bin/env node

import {
  appendFileSync,
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { createHash, randomUUID } from "node:crypto";
import { dirname, isAbsolute, parse, posix, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(SCRIPT_DIR, "..");
const MANIFEST_PATH = resolve(SCRIPT_DIR, "site-manifest.json");
const MANIFEST = JSON.parse(readFileSync(MANIFEST_PATH, "utf8"));
const REQUIRED_HTML_FILES = [
  "index.html",
  "framework.html",
  "acknowledgements.html",
  "404.html",
];
const REQUIRED_EXCLUDED_RELEASE_SCOPES = ["v1.2.0", "v1.3.0", "v1.4.0", "v1.5.0"];
const REQUIRED_EXCLUDED_RELEASE_FILES = [
  "assessment.html",
  "assessment.css",
  "assessment-model.js",
  "assessment-crypto.js",
  "assessment-compare.js",
  "assessment.js",
  "assessment-comparison.js",
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
];
const REQUIRED_GZIP_BUDGET_BYTES = 150000;
const REQUIRED_PREDEPLOY_WORKFLOWS = [
  { file: "validate.yml", name: "Quality" },
  { file: "links.yml", name: "External source links" },
];
const RELEASE_SCOPE_MARKER_TOKEN = "csm-release-scope:";
const RELEASE_SCOPE_MARKER_PATTERN =
  /^\s*(\/\*|<!--)\s*csm-release-scope:(v\d+\.\d+\.\d+):(begin|end)\s*(\*\/|-->)\s*(?:\r?\n)?$/;

function fail(message) {
  throw new Error(message);
}

function unique(values, label) {
  if (new Set(values).size !== values.length) {
    fail(`${label} contains duplicate values.`);
  }
}

function validateRelativeFile(value, label) {
  if (typeof value !== "string" || value.length === 0) {
    fail(`${label} must be a non-empty string.`);
  }
  if (isAbsolute(value) || value.includes("\\") || posix.normalize(value) !== value || value.startsWith("../")) {
    fail(`${label} must be a normalized repository-relative POSIX path: ${value}`);
  }
}

function validateManifest(manifest = MANIFEST) {
  if (manifest.schemaVersion !== 1) {
    fail(`Unsupported site manifest schema: ${manifest.schemaVersion}`);
  }

  const baseUrl = new URL(manifest.siteBaseUrl);
  if (baseUrl.protocol !== "https:" || !baseUrl.pathname.endsWith("/")) {
    fail("siteBaseUrl must be an HTTPS URL ending in a slash.");
  }

  for (const [label, values] of [
    ["files", manifest.files],
    ["htmlFiles", manifest.htmlFiles],
    ["nonPublicFiles", manifest.nonPublicFiles],
  ]) {
    if (!Array.isArray(values) || values.length === 0) {
      fail(`${label} must be a non-empty array.`);
    }
    unique(values, label);
    values.forEach((value, index) => validateRelativeFile(value, `${label}[${index}]`));
  }

  const files = new Set(manifest.files);
  const releaseScope = manifest.releaseScope;
  if (!releaseScope || releaseScope.version !== "1.1.0") {
    fail("The default Pages release scope must be exactly v1.1.0.");
  }
  if (
    !Array.isArray(releaseScope.excludedScopes) ||
    JSON.stringify(releaseScope.excludedScopes) !== JSON.stringify(REQUIRED_EXCLUDED_RELEASE_SCOPES)
  ) {
    fail(`The v1.1 release must exclude exactly ${REQUIRED_EXCLUDED_RELEASE_SCOPES.join(", ")}.`);
  }
  unique(releaseScope.excludedScopes, "releaseScope.excludedScopes");

  if (
    !releaseScope.sourcePruning ||
    typeof releaseScope.sourcePruning !== "object" ||
    Array.isArray(releaseScope.sourcePruning) ||
    Object.keys(releaseScope.sourcePruning).length === 0
  ) {
    fail("releaseScope.sourcePruning must declare every mixed-version source file.");
  }
  for (const [file, scopes] of Object.entries(releaseScope.sourcePruning)) {
    validateRelativeFile(file, "releaseScope.sourcePruning file");
    if (!files.has(file) || !/\.(?:html|js|css|md)$/.test(file)) {
      fail(`Release-pruned source must be a published text file: ${file}`);
    }
    if (!Array.isArray(scopes) || scopes.length === 0) {
      fail(`Release-pruned source must declare at least one excluded scope: ${file}`);
    }
    unique(scopes, `releaseScope.sourcePruning[${file}]`);
    if (scopes.some((scope) => !releaseScope.excludedScopes.includes(scope))) {
      fail(`Release-pruned source declares a scope that v1.1 does not exclude: ${file}`);
    }
  }
  for (const file of manifest.files) {
    const source = resolve(ROOT, file);
    if (
      !releaseScope.sourcePruning[file] &&
      existsSync(source) &&
      lstatSync(source).isFile() &&
      readFileSync(source).includes(RELEASE_SCOPE_MARKER_TOKEN)
    ) {
      fail(`Release-scope marker appears in an undeclared source file: ${file}`);
    }
  }

  if (!Array.isArray(releaseScope.excludedFiles) || releaseScope.excludedFiles.length === 0) {
    fail("releaseScope.excludedFiles must be a non-empty array.");
  }
  unique(releaseScope.excludedFiles, "releaseScope.excludedFiles");
  for (const [index, file] of releaseScope.excludedFiles.entries()) {
    validateRelativeFile(file, `releaseScope.excludedFiles[${index}]`);
    if (files.has(file)) fail(`Future release file entered the v1.1 manifest: ${file}`);
    const source = resolve(ROOT, file);
    if (!existsSync(source) || !lstatSync(source).isFile() || lstatSync(source).isSymbolicLink()) {
      fail(`Future release source must remain as a regular non-symlink file: ${file}`);
    }
  }
  if (
    JSON.stringify([...releaseScope.excludedFiles].sort()) !==
    JSON.stringify([...REQUIRED_EXCLUDED_RELEASE_FILES].sort())
  ) {
    fail("releaseScope.excludedFiles must contain exactly the known post-v1.1 source files.");
  }

  if (
    !Array.isArray(releaseScope.forbiddenRuntimeReferences) ||
    releaseScope.forbiddenRuntimeReferences.length === 0 ||
    releaseScope.forbiddenRuntimeReferences.some((reference) => typeof reference !== "string" || !reference)
  ) {
    fail("releaseScope.forbiddenRuntimeReferences must be a non-empty string array.");
  }
  unique(releaseScope.forbiddenRuntimeReferences, "releaseScope.forbiddenRuntimeReferences");

  for (const file of manifest.htmlFiles) {
    if (!files.has(file)) {
      fail(`Manifest subset references a file outside files: ${file}`);
    }
  }
  for (const file of manifest.nonPublicFiles) {
    if (!files.has(file)) {
      fail(`nonPublicFiles references a file outside files: ${file}`);
    }
  }
  if (JSON.stringify([...manifest.nonPublicFiles].sort()) !== JSON.stringify([".nojekyll"])) {
    fail("nonPublicFiles must contain exactly the GitHub Pages control file .nojekyll.");
  }
  const entryPoint = manifest.entryPointContract;
  const expectedCanonical = manifest.siteBaseUrl;
  const expectedIndex = new URL("index.html", manifest.siteBaseUrl).href;
  if (
    !entryPoint ||
    entryPoint.canonicalUrl !== expectedCanonical ||
    entryPoint.explicitIndexUrl !== expectedIndex ||
    JSON.stringify([...(entryPoint.recoveryFiles || [])].sort()) !== JSON.stringify(["404.html", "README.md"])
  ) {
    fail("entryPointContract must keep the root canonical and the README/404 recovery links on explicit index.html.");
  }
  const manifestedHtml = manifest.files.filter((file) => file.endsWith(".html")).sort();
  const validatedHtml = [...manifest.htmlFiles].sort();
  const requiredHtml = [...REQUIRED_HTML_FILES].sort();
  if (JSON.stringify(manifestedHtml) !== JSON.stringify(validatedHtml)) {
    fail("htmlFiles must contain every published HTML file, with no unpublished additions.");
  }
  if (JSON.stringify(validatedHtml) !== JSON.stringify(requiredHtml)) {
    fail(`htmlFiles must contain exactly the ${REQUIRED_HTML_FILES.length} required v1.1 documents: ${REQUIRED_HTML_FILES.join(", ")}.`);
  }

  if (!Array.isArray(manifest.canonicalPages) || manifest.canonicalPages.length === 0) {
    fail("canonicalPages must be a non-empty array.");
  }
  unique(manifest.canonicalPages.map((entry) => entry.file), "canonical page files");
  unique(manifest.canonicalPages.map((entry) => entry.url), "canonical page URLs");
  for (const entry of manifest.canonicalPages) {
    validateRelativeFile(entry.file, "canonical page file");
    if (!manifest.htmlFiles.includes(entry.file)) {
      fail(`Canonical page is not an HTML file: ${entry.file}`);
    }
    const canonical = new URL(entry.url);
    if (canonical.protocol !== "https:" || canonical.origin !== baseUrl.origin || !canonical.pathname.startsWith(baseUrl.pathname)) {
      fail(`Canonical URL is outside siteBaseUrl: ${entry.url}`);
    }
  }
  if (manifest.canonicalPages.find((entry) => entry.file === "index.html")?.url !== entryPoint.canonicalUrl) {
    fail("index.html canonicalPages entry must remain the root canonical URL from entryPointContract.");
  }

  if (!Array.isArray(manifest.deepLinks)) {
    fail("deepLinks must be an array.");
  }
  unique(manifest.deepLinks, "deepLinks");
  for (const route of manifest.deepLinks) {
    if (typeof route !== "string" || route.length === 0) {
      fail("Every deep link must be a non-empty string.");
    }
    const url = new URL(route, baseUrl);
    if (url.origin !== baseUrl.origin || !url.pathname.startsWith(baseUrl.pathname)) {
      fail(`Deep link is outside siteBaseUrl: ${route}`);
    }
  }

  if (manifest.criticalGzipBudgetBytes !== REQUIRED_GZIP_BUDGET_BYTES) {
    fail(`criticalGzipBudgetBytes must be exactly ${REQUIRED_GZIP_BUDGET_BYTES}; no exception is approved.`);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(manifest.sitemapLastModified)) {
    fail("sitemapLastModified must use YYYY-MM-DD format.");
  }

  const nu = manifest.w3cNu;
  if (
    !nu ||
    typeof nu.version !== "string" ||
    new URL(nu.assetUrl).protocol !== "https:" ||
    !/^[a-f0-9]{64}$/.test(nu.sha256) ||
    !/^[a-f0-9]{40}$/.test(nu.upstreamSha1) ||
    !/^[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)+$/.test(nu.mainClass)
  ) {
    fail("w3cNu must declare an HTTPS asset, version, SHA-256, upstream SHA-1 and Java main class.");
  }
  if (!nu.assetUrl.includes(`/${nu.version}/`) || !nu.assetUrl.includes(`-${nu.version}.jar`)) {
    fail("w3cNu asset URL must be pinned to its declared immutable version.");
  }

  if (
    !Array.isArray(manifest.requiredPredeployWorkflows) ||
    manifest.requiredPredeployWorkflows.length !== REQUIRED_PREDEPLOY_WORKFLOWS.length ||
    manifest.requiredPredeployWorkflows.some((workflow, index) =>
      workflow?.file !== REQUIRED_PREDEPLOY_WORKFLOWS[index].file ||
      workflow?.name !== REQUIRED_PREDEPLOY_WORKFLOWS[index].name
    )
  ) {
    fail("requiredPredeployWorkflows must contain exactly validate.yml/Quality followed by links.yml/External source links.");
  }
}

function compileReleaseSource(relativePath, text) {
  if (typeof text !== "string") fail(`Release source must be text: ${relativePath}`);
  const declaredScopes = MANIFEST.releaseScope.sourcePruning[relativePath];
  if (!declaredScopes) {
    if (text.includes(RELEASE_SCOPE_MARKER_TOKEN)) {
      fail(`Release-scope marker appears in an undeclared source file: ${relativePath}`);
    }
    return text;
  }

  const seenScopes = new Set();
  const output = [];
  const expectedMarkerForm = /\.(?:html|md)$/.test(relativePath) ? "html" : "block";
  let activeScope = "";
  let activeMarkerForm = "";
  const lines = text.match(/[^\n]*(?:\n|$)/g) ?? [];
  if (lines.at(-1) === "") lines.pop();

  for (const line of lines) {
    if (!line.includes(RELEASE_SCOPE_MARKER_TOKEN)) {
      if (!activeScope) output.push(line);
      continue;
    }

    const marker = line.match(RELEASE_SCOPE_MARKER_PATTERN);
    if (!marker) fail(`Malformed release-scope marker in ${relativePath}.`);
    const [, openingDelimiter, scope, boundary, closingDelimiter] = marker;
    const markerForm = openingDelimiter === "/*" ? "block" : "html";
    const expectedClosingDelimiter = markerForm === "block" ? "*/" : "-->";
    if (closingDelimiter !== expectedClosingDelimiter) {
      fail(`Mismatched release-scope marker delimiters in ${relativePath}.`);
    }
    if (markerForm !== expectedMarkerForm) {
      fail(`Mismatched release-scope marker forms in ${relativePath}; expected ${expectedMarkerForm} comments.`);
    }
    if (!declaredScopes.includes(scope)) {
      fail(`Undeclared release scope ${scope} in ${relativePath}.`);
    }
    if (boundary === "begin") {
      if (activeScope) fail(`Nested release scopes are not allowed in ${relativePath}.`);
      activeScope = scope;
      activeMarkerForm = markerForm;
      seenScopes.add(scope);
      continue;
    }
    if (!activeScope || activeScope !== scope) {
      fail(`Unmatched release-scope end marker for ${scope} in ${relativePath}.`);
    }
    if (activeMarkerForm !== markerForm) {
      fail(`Mismatched release-scope marker forms for ${scope} in ${relativePath}.`);
    }
    activeScope = "";
    activeMarkerForm = "";
  }

  if (activeScope) fail(`Unclosed release scope ${activeScope} in ${relativePath}.`);
  const missingScopes = declaredScopes.filter((scope) => !seenScopes.has(scope));
  if (missingScopes.length) {
    fail(`Release-pruned source is missing declared markers for ${missingScopes.join(", ")}: ${relativePath}`);
  }
  const compiled = output.join("");
  if (compiled.includes(RELEASE_SCOPE_MARKER_TOKEN)) {
    fail(`Release-scope marker leaked into compiled source: ${relativePath}`);
  }
  return compiled;
}

function publishedSourceBytes(relativePath) {
  const bytes = readFileSync(resolve(ROOT, relativePath));
  if (!MANIFEST.releaseScope.sourcePruning[relativePath]) {
    if (bytes.includes(RELEASE_SCOPE_MARKER_TOKEN)) {
      fail(`Release-scope marker appears in an undeclared source file: ${relativePath}`);
    }
    return bytes;
  }
  return Buffer.from(compileReleaseSource(relativePath, bytes.toString("utf8")), "utf8");
}

function assertSafeBuildTarget(outputRoot) {
  const parsed = parse(outputRoot);
  const relativeToRoot = relative(ROOT, outputRoot);
  if (
    outputRoot === ROOT ||
    outputRoot === parsed.root ||
    relativeToRoot === ".." ||
    relativeToRoot.startsWith(`..${sep}`)
  ) {
    fail(`Refusing to replace unsafe build target: ${outputRoot}`);
  }
}

function listFiles(directory, prefix = "") {
  const files = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;
    const absolutePath = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...listFiles(absolutePath, relativePath));
    } else if (entry.isFile()) {
      files.push(relativePath);
    } else {
      fail(`Artifact contains a non-regular file: ${relativePath}`);
    }
  }
  return files.sort();
}

function copyManifestFiles(outputRoot) {
  assertSafeBuildTarget(outputRoot);
  rmSync(outputRoot, { recursive: true, force: true });
  mkdirSync(outputRoot, { recursive: true });

  for (const relativePath of MANIFEST.files) {
    const source = resolve(ROOT, relativePath);
    let component = ROOT;
    const segments = relativePath.split("/");
    for (const [index, segment] of segments.entries()) {
      component = resolve(component, segment);
      if (!existsSync(component)) fail(`Manifest source file is missing: ${relativePath}`);
      const componentStat = lstatSync(component);
      if (componentStat.isSymbolicLink()) {
        fail(`Manifest source path must not contain a symlink: ${relativePath}`);
      }
      const isLast = index === segments.length - 1;
      if ((isLast && !componentStat.isFile()) || (!isLast && !componentStat.isDirectory())) {
        fail(`Manifest source must resolve through directories to a regular file: ${relativePath}`);
      }
    }
    const destination = resolve(outputRoot, relativePath);
    mkdirSync(dirname(destination), { recursive: true });
    writeFileSync(destination, publishedSourceBytes(relativePath));
  }
}

function parseTagAttributes(html) {
  const tags = [];
  const tagPattern = /<([A-Za-z][A-Za-z0-9:-]*)\b([^>]*)>/g;
  for (const match of html.matchAll(tagPattern)) {
    const attributes = {};
    const attributePattern = /([^\s=/>]+)\s*=\s*(["'])([\s\S]*?)\2/g;
    for (const attribute of match[2].matchAll(attributePattern)) {
      attributes[attribute[1].toLowerCase()] = attribute[3];
    }
    tags.push({ name: match[1].toLowerCase(), attributes });
  }
  return tags;
}

function collectHtmlReferences(text) {
  const references = [];
  for (const tag of parseTagAttributes(text)) {
    for (const attribute of ["href", "src"]) {
      if (tag.attributes[attribute]) {
        references.push(tag.attributes[attribute]);
      }
    }
    const metadataName = tag.attributes.property || tag.attributes.name;
    if (tag.name === "meta" && ["og:image", "twitter:image"].includes(metadataName) && tag.attributes.content) {
      references.push(tag.attributes.content);
    }
  }
  return references;
}

function collectMarkdownReferences(text) {
  const references = [];
  const pattern = /!?\[[^\]]*\]\(([^)]+)\)/g;
  for (const match of text.matchAll(pattern)) {
    const value = match[1].trim();
    if (value.startsWith("<")) {
      const closing = value.indexOf(">");
      references.push(closing === -1 ? value : value.slice(1, closing));
    } else {
      references.push(value.split(/\s+/, 1)[0]);
    }
  }
  return references;
}

function collectCssReferences(text) {
  const references = [];
  const pattern = /url\(\s*(["']?)(.*?)\1\s*\)/g;
  for (const match of text.matchAll(pattern)) {
    references.push(match[2]);
  }
  return references;
}

function decodeUrlComponent(value, context) {
  try {
    return decodeURIComponent(value);
  } catch {
    fail(`Malformed percent-encoding in ${context}: ${value}`);
  }
}

function resolveInternalReference(sourceFile, rawTarget) {
  const target = rawTarget.trim();
  if (!target) {
    return null;
  }
  if (/^javascript:/i.test(target)) {
    fail(`${sourceFile} contains a javascript: reference.`);
  }
  if (/^(?:mailto:|tel:|data:)/i.test(target)) {
    return null;
  }

  const baseUrl = new URL(MANIFEST.siteBaseUrl);
  let targetUrl;
  try {
    targetUrl = new URL(target, new URL(sourceFile, baseUrl));
  } catch {
    fail(`${sourceFile} contains an invalid reference: ${target}`);
  }
  if (targetUrl.protocol !== "http:" && targetUrl.protocol !== "https:") {
    return null;
  }
  if (targetUrl.origin !== baseUrl.origin) {
    return null;
  }
  if (!targetUrl.pathname.startsWith(baseUrl.pathname)) {
    fail(`${sourceFile} points outside the published site root: ${target}`);
  }

  let file = decodeUrlComponent(targetUrl.pathname.slice(baseUrl.pathname.length), `${sourceFile} reference`);
  if (!file || file.endsWith("/")) {
    file = `${file}index.html`;
  }
  file = posix.normalize(file);
  if (file.startsWith("../") || file === "..") {
    fail(`${sourceFile} contains path traversal: ${target}`);
  }

  return {
    file,
    fragment: targetUrl.hash ? decodeUrlComponent(targetUrl.hash.slice(1), `${sourceFile} fragment`) : "",
    rawTarget: target,
  };
}

function collectReferences(relativePath, text) {
  if (relativePath.endsWith(".html")) {
    return collectHtmlReferences(text);
  }
  if (relativePath.endsWith(".md")) {
    return collectMarkdownReferences(text);
  }
  if (relativePath.endsWith(".css")) {
    return collectCssReferences(text);
  }
  return [];
}

function htmlIds(path) {
  const ids = new Set();
  for (const tag of parseTagAttributes(readFileSync(path, "utf8"))) {
    if (tag.attributes.id) {
      ids.add(tag.attributes.id);
    }
  }
  return ids;
}

function validateInternalLinks(outputRoot, errors) {
  const publishedFiles = new Set(MANIFEST.files);
  const idCache = new Map();

  for (const sourceFile of MANIFEST.files) {
    if (!/\.(?:html|md|css)$/.test(sourceFile)) {
      continue;
    }
    const text = readFileSync(resolve(outputRoot, sourceFile), "utf8");
    for (const rawTarget of collectReferences(sourceFile, text)) {
      let reference;
      try {
        reference = resolveInternalReference(sourceFile, rawTarget);
      } catch (error) {
        errors.push(error.message);
        continue;
      }
      if (!reference) {
        continue;
      }
      if (!publishedFiles.has(reference.file)) {
        errors.push(`${sourceFile} references unpublished internal target: ${reference.rawTarget}`);
        continue;
      }
      if (reference.fragment && reference.file.endsWith(".html")) {
        if (!idCache.has(reference.file)) {
          idCache.set(reference.file, htmlIds(resolve(outputRoot, reference.file)));
        }
        if (!idCache.get(reference.file).has(reference.fragment)) {
          errors.push(`${sourceFile} references missing fragment ${reference.fragment} in ${reference.file}`);
        }
      }
    }
  }
}

function validateManifestDeepLinks(outputRoot, errors) {
  const nonPublic = new Set(MANIFEST.nonPublicFiles);
  for (const route of MANIFEST.deepLinks) {
    const url = new URL(route, MANIFEST.siteBaseUrl);
    let file;
    try {
      file = smokeRouteFile(url);
    } catch (error) {
      errors.push(error.message);
      continue;
    }
    if (nonPublic.has(file)) {
      errors.push(`Deep link targets a non-public control file: ${route}`);
      continue;
    }
    if (url.hash && file.endsWith(".html")) {
      const fragment = decodeUrlComponent(url.hash.slice(1), `deep link ${route}`);
      if (!htmlIds(resolve(outputRoot, file)).has(fragment)) {
        errors.push(`Manifest deep link references missing fragment ${fragment} in ${file}: ${route}`);
      }
    }
  }
}

function canonicalLinks(text) {
  return parseTagAttributes(text)
    .filter((tag) => tag.name === "link" && tag.attributes.rel?.split(/\s+/).includes("canonical"))
    .map((tag) => tag.attributes.href)
    .filter(Boolean);
}

function xmlText(block, element) {
  const match = block.match(new RegExp(`<${element}>([^<]+)</${element}>`));
  return match ? match[1].replaceAll("&amp;", "&").trim() : "";
}

function validateCanonicalAndSitemap(outputRoot, errors) {
  const expectedByFile = new Map(MANIFEST.canonicalPages.map((entry) => [entry.file, entry.url]));
  const expectedUrls = MANIFEST.canonicalPages.map((entry) => entry.url).sort();

  for (const htmlFile of MANIFEST.htmlFiles) {
    const links = canonicalLinks(readFileSync(resolve(outputRoot, htmlFile), "utf8"));
    if (expectedByFile.has(htmlFile)) {
      if (links.length !== 1 || links[0] !== expectedByFile.get(htmlFile)) {
        errors.push(`${htmlFile} canonical must be exactly ${expectedByFile.get(htmlFile)}.`);
      }
    } else if (links.length !== 0) {
      errors.push(`${htmlFile} must not be indexed but declares a canonical URL.`);
    }
  }

  const sitemap = readFileSync(resolve(outputRoot, "sitemap.xml"), "utf8");
  const records = [...sitemap.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((match) => ({
    location: xmlText(match[1], "loc"),
    lastModified: xmlText(match[1], "lastmod"),
  }));
  const actualUrls = records.map((record) => record.location).sort();
  if (new Set(actualUrls).size !== actualUrls.length) {
    errors.push("sitemap.xml contains duplicate locations.");
  }
  if (JSON.stringify(actualUrls) !== JSON.stringify(expectedUrls)) {
    errors.push(`sitemap.xml locations differ from canonical pages (expected ${expectedUrls.join(", ")}).`);
  }
  for (const record of records) {
    if (record.lastModified !== MANIFEST.sitemapLastModified) {
      errors.push(`sitemap.xml ${record.location || "record"} must use lastmod ${MANIFEST.sitemapLastModified}.`);
    }
  }

  const robots = readFileSync(resolve(outputRoot, "robots.txt"), "utf8");
  const expectedSitemap = `Sitemap: ${new URL("sitemap.xml", MANIFEST.siteBaseUrl)}`;
  if (!robots.split(/\r?\n/).includes(expectedSitemap)) {
    errors.push(`robots.txt must declare ${expectedSitemap}.`);
  }
}

function validateEntryPointContract(outputRoot, errors) {
  const contract = MANIFEST.entryPointContract;
  const index = readFileSync(resolve(outputRoot, "index.html"), "utf8");
  const ogUrls = parseTagAttributes(index)
    .filter((tag) => tag.name === "meta" && tag.attributes.property === "og:url")
    .map((tag) => tag.attributes.content)
    .filter(Boolean);
  if (ogUrls.length !== 1 || ogUrls[0] !== contract.canonicalUrl) {
    errors.push(`index.html og:url must remain exactly ${contract.canonicalUrl}.`);
  }
  for (const file of contract.recoveryFiles) {
    const text = readFileSync(resolve(outputRoot, file), "utf8");
    const marker = file.endsWith(".html")
      ? `href="${contract.explicitIndexUrl}"`
      : `(${contract.explicitIndexUrl})`;
    if (!text.includes(marker)) {
      errors.push(`${file} public recovery CTA must point explicitly to ${contract.explicitIndexUrl}.`);
    }
  }
}

function validateReleaseScope(outputRoot, errors) {
  for (const file of MANIFEST.files) {
    const bytes = readFileSync(resolve(outputRoot, file));
    if (bytes.includes(RELEASE_SCOPE_MARKER_TOKEN)) {
      errors.push(`${file} contains an uncompiled release-scope marker.`);
    }
    if (!/\.(?:html|js)$/.test(file)) continue;
    const text = bytes.toString("utf8");
    for (const reference of MANIFEST.releaseScope.forbiddenRuntimeReferences) {
      if (text.includes(reference)) {
        errors.push(`${file} contains future runtime reference ${reference}.`);
      }
    }
  }
}

function validateBudget(outputRoot, errors) {
  const runtimeResources = MANIFEST.files.filter((file) => /\.(?:html|css|js|json)$/.test(file));
  const rows = runtimeResources.map((file) => {
    const bytes = readFileSync(resolve(outputRoot, file));
    return { file, gzipBytes: gzipSync(bytes, { level: 9 }).byteLength };
  });
  const total = rows.reduce((sum, row) => sum + row.gzipBytes, 0);
  if (total > MANIFEST.criticalGzipBudgetBytes) {
    errors.push(`Published runtime resources use ${total} gzip bytes; budget is ${MANIFEST.criticalGzipBudgetBytes}.`);
  }
  return { rows, total };
}

function calculateArtifactDigest(outputRoot) {
  const digest = createHash("sha256");
  for (const file of [...MANIFEST.files].sort()) {
    const bytes = readFileSync(resolve(outputRoot, file));
    digest.update(file, "utf8");
    digest.update("\0", "utf8");
    digest.update(String(bytes.byteLength), "utf8");
    digest.update("\0", "utf8");
    digest.update(bytes);
  }
  return digest.digest("hex");
}

function appendArtifactSummary(outputRoot, digest, budget) {
  const summaryPath = process.env.GITHUB_STEP_SUMMARY;
  if (!summaryPath) return;
  const sha = /^[a-f0-9]{40}$/.test(process.env.GITHUB_SHA || "")
    ? process.env.GITHUB_SHA
    : "unavailable";
  const lines = [
    "## Deterministic Pages artifact",
    "",
    `Commit: \`${sha}\``,
    `Manifest: \`scripts/site-manifest.json\``,
    `Release scope: \`v${MANIFEST.releaseScope.version}\``,
    `Artifact directory: \`${relative(ROOT, outputRoot) || "."}\``,
    `Artifact SHA-256: \`${digest}\``,
    `Runtime gzip: ${budget.total} / ${MANIFEST.criticalGzipBudgetBytes} bytes`,
    "",
  ];
  appendFileSync(summaryPath, `${lines.join("\n")}\n`, "utf8");
}

function validateArtifact(outputRoot) {
  if (!existsSync(outputRoot) || !lstatSync(outputRoot).isDirectory()) {
    fail(`Artifact directory does not exist: ${outputRoot}`);
  }

  const errors = [];
  const actualFiles = listFiles(outputRoot);
  const expectedFiles = [...MANIFEST.files].sort();
  if (JSON.stringify(actualFiles) !== JSON.stringify(expectedFiles)) {
    const expected = new Set(expectedFiles);
    const actual = new Set(actualFiles);
    const missing = expectedFiles.filter((file) => !actual.has(file));
    const extra = actualFiles.filter((file) => !expected.has(file));
    if (missing.length) errors.push(`Artifact is missing manifest files: ${missing.join(", ")}`);
    if (extra.length) errors.push(`Artifact contains files outside the manifest: ${extra.join(", ")}`);
  }

  if (errors.length) {
    fail(`Artifact validation failed:\n- ${errors.join("\n- ")}`);
  }

  validateInternalLinks(outputRoot, errors);
  validateManifestDeepLinks(outputRoot, errors);
  validateCanonicalAndSitemap(outputRoot, errors);
  validateEntryPointContract(outputRoot, errors);
  validateReleaseScope(outputRoot, errors);
  const budget = validateBudget(outputRoot, errors);
  const digest = calculateArtifactDigest(outputRoot);

  if (errors.length) {
    fail(`Artifact validation failed:\n- ${errors.join("\n- ")}`);
  }

  console.log("SITE ARTIFACT VALIDATION PASSED");
  console.log(`- Manifest files: ${expectedFiles.length}`);
  console.log(`- HTML documents: ${MANIFEST.htmlFiles.length}`);
  console.log(`- Canonical/sitemap pages: ${MANIFEST.canonicalPages.length}`);
  for (const row of budget.rows) {
    console.log(`- Runtime gzip: ${row.file} = ${row.gzipBytes} bytes`);
  }
  console.log(`- Runtime gzip total: ${budget.total} / ${MANIFEST.criticalGzipBudgetBytes} bytes`);
  console.log(`- Runtime gzip headroom: ${MANIFEST.criticalGzipBudgetBytes - budget.total} bytes`);
  console.log(`- Artifact SHA-256: ${digest}`);
  appendArtifactSummary(outputRoot, digest, budget);
}

function normalizeBaseUrl(rawBase) {
  const base = new URL(rawBase);
  if (!["http:", "https:"].includes(base.protocol) || base.username || base.password) {
    fail("Smoke-test base URL must use HTTP(S) without credentials.");
  }
  if (!base.pathname.endsWith("/")) {
    base.pathname += "/";
  }
  base.search = "";
  base.hash = "";
  return base;
}

function digestBytes(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

function normalizeTitle(bytes) {
  const match = bytes.toString("utf8").match(/<title>([\s\S]*?)<\/title>/i);
  return match ? match[1].replace(/\s+/g, " ").trim() : "";
}

function smokeRouteFile(url) {
  const baseUrl = new URL(MANIFEST.siteBaseUrl);
  if (url.origin !== baseUrl.origin || !url.pathname.startsWith(baseUrl.pathname)) {
    fail(`Smoke route is outside siteBaseUrl: ${url}`);
  }
  let file = decodeUrlComponent(url.pathname.slice(baseUrl.pathname.length), "smoke route");
  if (!file || file.endsWith("/")) file = `${file}index.html`;
  file = posix.normalize(file);
  if (!MANIFEST.files.includes(file)) fail(`Smoke route is not backed by a manifest file: ${url}`);
  return file;
}

function expectedSmokeResponse(url) {
  const file = smokeRouteFile(url);
  const bytes = publishedSourceBytes(file);
  return {
    file,
    byteLength: bytes.byteLength,
    digest: digestBytes(bytes),
    title: file.endsWith(".html") ? normalizeTitle(bytes) : "",
  };
}

function createSmokeRequest(url, attempt, smokeToken, cacheBusted = true) {
  const requestUrl = new URL(url);
  requestUrl.hash = "";
  if (cacheBusted) requestUrl.searchParams.set("__csm_smoke", `${smokeToken}-${attempt}`);
  const headers = { "User-Agent": "CorporateSecurityMatrixArtifactSmoke/2.0" };
  if (cacheBusted) {
    headers["Cache-Control"] = "no-cache, no-store, max-age=0";
    headers.Pragma = "no-cache";
  }
  return {
    url: requestUrl.href,
    cache: cacheBusted ? "no-store" : "default",
    headers,
  };
}

function applicationQuery(url) {
  return [...url.searchParams.entries()]
    .filter(([key]) => key !== "__csm_smoke")
    .sort(([leftKey, leftValue], [rightKey, rightValue]) => leftKey.localeCompare(rightKey) || leftValue.localeCompare(rightValue));
}

function evaluateSmokeResponse(evidence, expected) {
  const requested = new URL(evidence.requestedUrl);
  const final = new URL(evidence.finalUrl);
  const actualDigest = digestBytes(evidence.bytes);
  const actualTitle = expected.title ? normalizeTitle(evidence.bytes) : "";
  const marker = `sha256:${actualDigest}${actualTitle ? ` title=${JSON.stringify(actualTitle)}` : ""}`;

  if (evidence.status !== 200) {
    return { ok: false, reason: `expected HTTP 200, received ${evidence.status}`, marker };
  }
  if (final.origin !== requested.origin || final.pathname !== requested.pathname) {
    return { ok: false, reason: "response was redirected to a different origin or path", marker };
  }
  if (JSON.stringify(applicationQuery(final)) !== JSON.stringify(applicationQuery(requested))) {
    return { ok: false, reason: "response redirect did not preserve application query parameters", marker };
  }
  if (evidence.redirected) {
    return { ok: false, reason: "response was redirected", marker };
  }
  if (evidence.bytes.byteLength === 0) {
    return { ok: false, reason: "response body is empty", marker };
  }
  if (expected.title && actualTitle !== expected.title) {
    return {
      ok: false,
      reason: `expected title ${JSON.stringify(expected.title)}, received ${JSON.stringify(actualTitle || "none")}`,
      marker,
    };
  }
  if (evidence.bytes.byteLength !== expected.byteLength || actualDigest !== expected.digest) {
    return {
      ok: false,
      reason: `body differs from manifest file ${expected.file} (expected sha256:${expected.digest})`,
      marker,
    };
  }
  return { ok: true, marker };
}

function formatSmokeEvidence(evidence, expected) {
  const actualTitle = expected.title ? normalizeTitle(evidence.bytes) : "";
  const headers = evidence.headers || {};
  return [
    `requested=${evidence.requestedUrl}`,
    `status=${evidence.status}`,
    `final=${evidence.finalUrl}`,
    `body=sha256:${digestBytes(evidence.bytes)}`,
    expected.title ? `title=${JSON.stringify(actualTitle || "none")}` : "",
    `content-type=${JSON.stringify(headers.contentType || "unavailable")}`,
    `age=${JSON.stringify(headers.age || "unavailable")}`,
    `x-cache=${JSON.stringify(headers.xCache || "unavailable")}`,
    `x-served-by=${JSON.stringify(headers.xServedBy || "unavailable")}`,
    `etag=${JSON.stringify(headers.etag || "unavailable")}`,
    `last-modified=${JSON.stringify(headers.lastModified || "unavailable")}`,
    `x-github-request-id=${JSON.stringify(headers.githubRequestId || "unavailable")}`,
  ].filter(Boolean).join(" ");
}

async function fetchSmokeProbe(probe, requestFetch = fetch) {
  const { request, expected } = probe;
  try {
    const response = await requestFetch(request.url, {
      redirect: "follow",
      cache: request.cache,
      signal: AbortSignal.timeout(20_000),
      headers: request.headers,
    });
    const bytes = Buffer.from(await response.arrayBuffer());
    const evidence = {
      requestedUrl: request.url,
      finalUrl: response.url,
      redirected: response.redirected,
      status: response.status,
      bytes,
      headers: {
        contentType: response.headers.get("content-type"),
        age: response.headers.get("age"),
        xCache: response.headers.get("x-cache"),
        xServedBy: response.headers.get("x-served-by"),
        etag: response.headers.get("etag"),
        lastModified: response.headers.get("last-modified"),
        githubRequestId: response.headers.get("x-github-request-id"),
      },
    };
    const evaluation = evaluateSmokeResponse(evidence, expected);
    if (!evaluation.ok) {
      throw new Error(`${evaluation.reason}; ${formatSmokeEvidence(evidence, expected)}`);
    }
    return { ...probe, evidence: { ...evidence, marker: evaluation.marker } };
  } catch (error) {
    const detail = error.message?.includes("requested=")
      ? error.message
      : `request failed: ${error.message}; requested=${request.url} status=unavailable final=unavailable body=unavailable content-type=unavailable age=unavailable x-cache=unavailable x-served-by=unavailable etag=unavailable last-modified=unavailable x-github-request-id=unavailable`;
    throw new Error(detail);
  }
}

function smokeProbes(base, attempt, smokeToken) {
  const routes = smokeRoutes();
  const probes = routes.map((route) => ({
    route,
    mode: "cache-busted",
    request: createSmokeRequest(new URL(route, base), attempt, smokeToken, true),
    expected: expectedSmokeResponse(new URL(route, MANIFEST.siteBaseUrl)),
  }));
  for (const route of ["", "index.html"]) {
    probes.push({
      route,
      mode: "bare-user-path",
      request: createSmokeRequest(new URL(route, base), attempt, smokeToken, false),
      expected: expectedSmokeResponse(new URL(route, MANIFEST.siteBaseUrl)),
    });
  }
  return probes;
}

async function runSmokeSweep(base, attempt, smokeToken) {
  const probes = smokeProbes(base, attempt, smokeToken);
  const failures = [];
  const successes = [];

  for (let offset = 0; offset < probes.length; offset += 6) {
    await Promise.all(probes.slice(offset, offset + 6).map(async (probe) => {
      try {
        successes.push(await fetchSmokeProbe(probe));
      } catch (error) {
        failures.push(`${probe.route || "/"} [${probe.mode}]: ${error.message}`);
      }
    }));
  }
  return { failures, successes, probeCount: probes.length };
}

async function smokeSite(
  rawBase,
  retries,
  {
    sweep = runSmokeSweep,
    delay = (milliseconds) => new Promise((resolveDelay) => setTimeout(resolveDelay, milliseconds)),
  } = {},
) {
  const base = normalizeBaseUrl(rawBase);
  const smokeToken = randomUUID();
  const requiredConsecutiveSweeps = retries > 1 ? 2 : 1;
  let consecutiveSweeps = 0;
  let lastFailures = [];

  for (let attempt = 1; attempt <= retries; attempt += 1) {
    const sweepResult = await sweep(base, attempt, smokeToken);
    if (sweepResult.failures.length === 0) {
      consecutiveSweeps += 1;
      if (consecutiveSweeps >= requiredConsecutiveSweeps) {
        console.log(`SITE ROUTE SMOKE PASSED — ${sweepResult.probeCount} probes in ${consecutiveSweeps} consecutive coherent sweeps at ${base}`);
        for (const { route, mode, evidence } of sweepResult.successes.sort((left, right) => {
          const routeOrder = smokeRoutes().indexOf(left.route) - smokeRoutes().indexOf(right.route);
          return routeOrder || left.mode.localeCompare(right.mode);
        })) {
          console.log(`- ${route || "/"} [${mode}]: ${formatSmokeEvidence(evidence, expectedSmokeResponse(new URL(route, MANIFEST.siteBaseUrl)))}`);
        }
        return;
      }
    } else {
      consecutiveSweeps = 0;
      lastFailures = sweepResult.failures;
    }
    if (attempt < retries) {
      const delayMs = Math.min(1000 * (2 ** (attempt - 1)), 10_000);
      await delay(delayMs);
    }
  }
  const failureDetail = lastFailures.length ? `\n- ${lastFailures.join("\n- ")}` : "";
  fail(`Route smoke test did not produce ${requiredConsecutiveSweeps} consecutive coherent sweeps.${failureDetail}`);
}

function smokeRoutes() {
  const nonPublic = new Set(MANIFEST.nonPublicFiles);
  const routes = ["", ...MANIFEST.files.filter((file) => !nonPublic.has(file)), ...MANIFEST.deepLinks];
  unique(routes, "smoke routes");
  return routes;
}

function usage() {
  console.error("Usage: node scripts/site.mjs build|validate [artifact-dir] | smoke <base-url> [--retries N]");
}

async function main() {
  validateManifest();
  const [command, value, ...options] = process.argv.slice(2);
  if (command === "build" || command === "validate") {
    if (options.length) {
      usage();
      process.exitCode = 2;
      return;
    }
    const outputRoot = resolve(ROOT, value || "_site");
    if (command === "build") {
      copyManifestFiles(outputRoot);
    }
    validateArtifact(outputRoot);
    return;
  }
  if (command === "smoke" && value) {
    let retries = 1;
    if (options.length) {
      if (options.length !== 2 || options[0] !== "--retries" || !/^[1-9]\d*$/.test(options[1])) {
        usage();
        process.exitCode = 2;
        return;
      }
      retries = Number(options[1]);
      if (retries > 10) fail("Smoke retries cannot exceed 10.");
    }
    await smokeSite(value, retries);
    return;
  }
  usage();
  process.exitCode = 2;
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  main().catch((error) => {
    console.error(`SITE PIPELINE FAILED — ${error.message}`);
    process.exitCode = 1;
  });
}

export { compileReleaseSource, createSmokeRequest, evaluateSmokeResponse, fetchSmokeProbe, smokeRoutes, smokeSite, validateManifest };
