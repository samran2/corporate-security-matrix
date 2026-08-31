#!/usr/bin/env node

import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(SCRIPT_DIR, "..");
const MANIFEST = JSON.parse(readFileSync(resolve(SCRIPT_DIR, "site-manifest.json"), "utf8"));
const MAX_DOWNLOAD_BYTES = 40 * 1024 * 1024;

function digest(algorithm, bytes) {
  return createHash(algorithm).update(bytes).digest("hex");
}

function validatorCachePath() {
  const cacheRoot = process.env.CSM_VNU_CACHE_DIR
    ? resolve(process.env.CSM_VNU_CACHE_DIR)
    : resolve(tmpdir(), "corporate-security-matrix-vnu");
  return resolve(cacheRoot, MANIFEST.w3cNu.sha256, "vnu.jar");
}

async function downloadValidator(destination) {
  const response = await fetch(MANIFEST.w3cNu.assetUrl, {
    redirect: "follow",
    signal: AbortSignal.timeout(120_000),
    headers: {
      Accept: "application/octet-stream",
      "User-Agent": "CorporateSecurityMatrixHtmlValidator/1.0",
    },
  });
  if (!response.ok) {
    throw new Error(`Nu HTML Checker download failed with HTTP ${response.status}.`);
  }
  const declaredLength = Number(response.headers.get("content-length") || 0);
  if (declaredLength > MAX_DOWNLOAD_BYTES) {
    throw new Error(`Nu HTML Checker download exceeds ${MAX_DOWNLOAD_BYTES} bytes.`);
  }
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length === 0 || bytes.length > MAX_DOWNLOAD_BYTES) {
    throw new Error(`Nu HTML Checker download has invalid size: ${bytes.length} bytes.`);
  }
  const sha256 = digest("sha256", bytes);
  const sha1 = digest("sha1", bytes);
  if (sha256 !== MANIFEST.w3cNu.sha256 || sha1 !== MANIFEST.w3cNu.upstreamSha1) {
    throw new Error(
      `Nu HTML Checker checksum mismatch: expected SHA-256 ${MANIFEST.w3cNu.sha256} ` +
      `and upstream SHA-1 ${MANIFEST.w3cNu.upstreamSha1}; received ${sha256} / ${sha1}.`,
    );
  }

  mkdirSync(dirname(destination), { recursive: true });
  const temporary = `${destination}.${process.pid}.tmp`;
  writeFileSync(temporary, bytes, { mode: 0o600 });
  renameSync(temporary, destination);
}

async function ensureValidator() {
  const jarPath = validatorCachePath();
  if (existsSync(jarPath)) {
    const bytes = readFileSync(jarPath);
    if (
      digest("sha256", bytes) === MANIFEST.w3cNu.sha256 &&
      digest("sha1", bytes) === MANIFEST.w3cNu.upstreamSha1
    ) {
      return jarPath;
    }
    unlinkSync(jarPath);
  }
  await downloadValidator(jarPath);
  return jarPath;
}

function validateHtml(jarPath, artifactRoot) {
  const htmlPaths = MANIFEST.htmlFiles.map((file) => resolve(artifactRoot, file));
  for (const path of htmlPaths) {
    if (!existsSync(path)) {
      throw new Error(`HTML artifact is missing: ${path}`);
    }
  }

  const result = spawnSync(
    "java",
    ["-cp", jarPath, MANIFEST.w3cNu.mainClass, "--errors-only", ...htmlPaths],
    { cwd: ROOT, encoding: "utf8", stdio: "inherit" },
  );
  if (result.error?.code === "ENOENT") {
    throw new Error("Java 17 or newer is required to run the pinned Nu HTML Checker.");
  }
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    throw new Error(`Nu HTML Checker reported error-level HTML findings (exit ${result.status}).`);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const fetchOnly = args.includes("--fetch-only");
  const positional = args.filter((arg) => arg !== "--fetch-only");
  if (positional.length > 1) {
    throw new Error("Usage: node scripts/validate_html.mjs [artifact-dir] [--fetch-only]");
  }

  const jarPath = await ensureValidator();
  console.log(`PINNED NU CHECKER VERIFIED — ${MANIFEST.w3cNu.version} ${MANIFEST.w3cNu.sha256}`);
  if (fetchOnly) {
    return;
  }

  const artifactRoot = resolve(ROOT, positional[0] || "_site");
  validateHtml(jarPath, artifactRoot);
  console.log(`W3C NU HTML VALIDATION PASSED — ${MANIFEST.htmlFiles.length} documents`);
}

main().catch((error) => {
  console.error(`W3C NU HTML VALIDATION FAILED — ${error.message}`);
  process.exitCode = 1;
});
