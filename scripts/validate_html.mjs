#!/usr/bin/env node

import { createHash, randomUUID } from "node:crypto";
import {
  closeSync,
  constants,
  existsSync,
  fstatSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  openSync,
  readFileSync,
  readSync,
  realpathSync,
  renameSync,
  rmdirSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { lookup } from "node:dns/promises";
import { request } from "node:https";
import { BlockList, isIP } from "node:net";
import { tmpdir } from "node:os";
import { dirname, parse, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { Readable } from "node:stream";
import { fileURLToPath } from "node:url";
import { gunzipSync } from "node:zlib";
import { validateManifest } from "./site.mjs";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(SCRIPT_DIR, "..");
const MANIFEST = JSON.parse(readFileSync(resolve(SCRIPT_DIR, "site-manifest.json"), "utf8"));
const MAX_DOWNLOAD_BYTES = 40 * 1024 * 1024;
const MAX_REDIRECTS = 3;
const DOWNLOAD_HOST = "registry.npmjs.org";
const NON_PUBLIC_IPV4 = new BlockList();
for (const [network, bits] of [
  ["0.0.0.0", 8], ["10.0.0.0", 8], ["100.64.0.0", 10], ["127.0.0.0", 8],
  ["169.254.0.0", 16], ["172.16.0.0", 12], ["192.0.0.0", 24], ["192.0.2.0", 24],
  ["192.88.99.0", 24], ["192.168.0.0", 16], ["198.18.0.0", 15],
  ["198.51.100.0", 24], ["203.0.113.0", 24], ["224.0.0.0", 4], ["240.0.0.0", 4],
]) NON_PUBLIC_IPV4.addSubnet(network, bits, "ipv4");
const GLOBAL_IPV6 = new BlockList();
GLOBAL_IPV6.addSubnet("2000::", 3, "ipv6");
const NON_PUBLIC_IPV6 = new BlockList();
for (const [network, bits] of [["2001::", 23], ["2001:db8::", 32], ["2002::", 16], ["3fff::", 20]]) {
  NON_PUBLIC_IPV6.addSubnet(network, bits, "ipv6");
}

function digest(algorithm, bytes) {
  return createHash(algorithm).update(bytes).digest("hex");
}

function validatorCachePath() {
  const cacheRoot = process.env.CSM_VNU_CACHE_DIR
    ? resolve(process.env.CSM_VNU_CACHE_DIR)
    : resolve(realpathSync(tmpdir()), "corporate-security-matrix-vnu");
  return resolve(cacheRoot, MANIFEST.w3cNu.sha256, "vnu.jar");
}

function isPublicAddress(address) {
  const family = isIP(address);
  if (family === 4) return !NON_PUBLIC_IPV4.check(address, "ipv4");
  return family === 6 && GLOBAL_IPV6.check(address, "ipv6") && !NON_PUBLIC_IPV6.check(address, "ipv6");
}

function approvedDownloadUrl(value) {
  const url = new URL(value);
  if (
    url.protocol !== "https:" || url.hostname !== DOWNLOAD_HOST ||
    url.username || url.password || url.port || url.hash
  ) {
    throw new Error("Nu HTML Checker requires an approved HTTPS download URL.");
  }
  return url;
}

function pinnedLookup(hostname, address) {
  return (requestedHost, options, callback) => {
    if (requestedHost !== hostname) {
      callback(new Error("Nu HTML Checker connection changed the approved hostname."));
    } else if (options.all) {
      callback(null, [address]);
    } else {
      callback(null, address.address, address.family);
    }
  };
}

function validateConnectedAddress(peer, approved) {
  const permitted = new BlockList();
  permitted.addAddress(approved.address, approved.family === 4 ? "ipv4" : "ipv6");
  const family = isIP(peer);
  if (!isPublicAddress(peer) || !permitted.check(peer, family === 4 ? "ipv4" : "ipv6")) {
    throw new Error("Nu HTML Checker connected to an unapproved network address.");
  }
}

function requestApprovedAsset(url, { address, signal }) {
  return new Promise((resolveResponse, reject) => {
    const req = request(url, {
      agent: false,
      family: address.family,
      lookup: pinnedLookup(url.hostname, address),
      signal,
      headers: {
        Accept: "application/octet-stream",
        "User-Agent": "CorporateSecurityMatrixHtmlValidator/1.0",
      },
    }, (response) => {
      const headers = new Headers();
      for (const [name, value] of Object.entries(response.headers)) {
        if (value !== undefined) headers.set(name, Array.isArray(value) ? value.join(", ") : value);
      }
      resolveResponse({ status: response.statusCode, headers, body: Readable.toWeb(response) });
    });
    req.on("error", reject);
    req.once("socket", (socket) => {
      socket.once("secureConnect", () => {
        try {
          validateConnectedAddress(socket.remoteAddress, address);
        } catch (error) {
          req.destroy(error);
        }
      });
    });
    req.end();
  });
}

async function publicAddress(hostname, lookupAll, signal) {
  signal.throwIfAborted();
  let abort;
  try {
    const records = await Promise.race([
      lookupAll(hostname, { all: true, verbatim: true }),
      new Promise((_, reject) => {
        abort = () => reject(signal.reason);
        signal.addEventListener("abort", abort, { once: true });
      }),
    ]);
    if (
      !Array.isArray(records) || records.length === 0 ||
      records.some(({ address, family }) => !isPublicAddress(address) || isIP(address) !== family)
    ) {
      throw new Error("Nu HTML Checker download must resolve only to public DNS addresses.");
    }
    signal.throwIfAborted();
    return records.find(({ family }) => family === 4) || records[0];
  } finally {
    if (abort) signal.removeEventListener("abort", abort);
  }
}

async function fetchValidatorAsset(assetUrl, {
  lookupAll = lookup,
  requestAsset = requestApprovedAsset,
  signal = AbortSignal.timeout(120_000),
} = {}) {
  let url = approvedDownloadUrl(assetUrl);
  for (let redirects = 0; ; redirects += 1) {
    const address = await publicAddress(url.hostname, lookupAll, signal);
    const response = await requestAsset(url, { address, signal });
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      await response.body?.cancel();
      if (redirects >= MAX_REDIRECTS) throw new Error("Nu HTML Checker download exceeded its redirect limit.");
      const location = response.headers.get("location");
      if (!location) throw new Error("Nu HTML Checker download returned no redirect location.");
      url = approvedDownloadUrl(new URL(location, url).href);
    } else if (response.status !== 200) {
      await response.body?.cancel();
      throw new Error(`Nu HTML Checker download failed with HTTP ${response.status}.`);
    } else {
      return response;
    }
  }
}

function validateNuStandaloneEntries(entries, nu = MANIFEST.w3cNu) {
  if (
    !Array.isArray(entries) ||
    entries.some((entry) => typeof entry !== "string" || entry.length === 0)
  ) {
    throw new Error("Nu HTML Checker archive entry list must be an array of non-empty strings.");
  }
  const archiveEntries = new Set(entries);
  const missing = nu.requiredArchiveEntries.filter((entry) => !archiveEntries.has(entry));
  if (missing.length) {
    throw new Error(`Nu HTML Checker standalone archive is missing required entries: ${missing.join(", ")}.`);
  }
}

function validateStandaloneArchive(jarPath, runJar = spawnSync) {
  const result = runJar("jar", ["--list", "--file", jarPath], {
    cwd: ROOT,
    encoding: "utf8",
    maxBuffer: 16 * 1024 * 1024,
  });
  if (result.error?.code === "ENOENT") {
    throw new Error("Java 17 JDK or newer is required to inspect the pinned Nu HTML Checker archive.");
  }
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    const detail = (result.stderr || result.stdout || "").trim();
    throw new Error(
      `Nu HTML Checker standalone archive inspection failed (exit ${result.status})${detail ? `: ${detail}` : "."}`,
    );
  }
  const entries = result.stdout.split(/\r?\n/).filter(Boolean);
  validateNuStandaloneEntries(entries);
}

async function readExactAssetBytes(response, expectedBytes = MANIFEST.w3cNu.assetSizeBytes) {
  if (!Number.isSafeInteger(expectedBytes) || expectedBytes <= 0 || expectedBytes > MAX_DOWNLOAD_BYTES) {
    throw new Error("Nu HTML Checker expected download size is outside the approved bound.");
  }
  const declaredLength = Number(response.headers.get("content-length") || 0);
  if (declaredLength && declaredLength !== expectedBytes) {
    await response.body?.cancel("Nu HTML Checker download declared an unapproved size.");
    throw new Error(
      `Nu HTML Checker download declared ${declaredLength} bytes; expected exactly ${expectedBytes}.`,
    );
  }
  if (!response.body) {
    throw new Error("Nu HTML Checker download returned no response body.");
  }

  const reader = response.body.getReader();
  const chunks = [];
  let receivedBytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      receivedBytes += value.byteLength;
      if (receivedBytes > expectedBytes || receivedBytes > MAX_DOWNLOAD_BYTES) {
        await reader.cancel("Nu HTML Checker download exceeded the approved size.");
        throw new Error(
          `Nu HTML Checker download exceeded ${expectedBytes} bytes before completion.`,
        );
      }
      chunks.push(Buffer.from(value));
    }
  } finally {
    reader.releaseLock();
  }
  if (receivedBytes !== expectedBytes) {
    throw new Error(
      `Nu HTML Checker download has ${receivedBytes} bytes; expected exactly ${expectedBytes}.`,
    );
  }
  return Buffer.concat(chunks, receivedBytes);
}

function verifyJarBytes(bytes, nu) {
  if (bytes.length !== nu.assetSizeBytes || bytes.length > MAX_DOWNLOAD_BYTES) {
    throw new Error("Nu HTML Checker JAR has an unexpected exact size.");
  }
  if (digest("sha256", bytes) !== nu.sha256 || digest("sha1", bytes) !== nu.upstreamSha1) {
    throw new Error("Nu HTML Checker JAR checksum mismatch.");
  }
  return bytes;
}

function tarOctal(header, start, length) {
  const value = header.subarray(start, start + length).toString("ascii").replace(/\0.*$/, "").trim();
  if (!/^[0-7]+$/.test(value)) throw new Error("Nu HTML Checker package contains an invalid archive size.");
  const number = Number.parseInt(value, 8);
  if (!Number.isSafeInteger(number)) throw new Error("Nu HTML Checker package contains an invalid archive size.");
  return number;
}

function extractValidatorJar(bytes, nu = MANIFEST.w3cNu) {
  if (
    bytes.length !== nu.tarballSizeBytes || bytes.length > MAX_DOWNLOAD_BYTES ||
    digest("sha256", bytes) !== nu.tarballSha256 ||
    `sha512-${createHash("sha512").update(bytes).digest("base64")}` !== nu.tarballIntegrity
  ) {
    throw new Error("Nu HTML Checker package checksum mismatch or unexpected size.");
  }
  if (
    !Number.isSafeInteger(nu.unpackedTarSizeBytes) ||
    nu.unpackedTarSizeBytes <= 0 || nu.unpackedTarSizeBytes > MAX_DOWNLOAD_BYTES
  ) {
    throw new Error("Nu HTML Checker unpacked archive size is outside the approved bound.");
  }
  const tar = gunzipSync(bytes, { maxOutputLength: nu.unpackedTarSizeBytes });
  if (tar.length !== nu.unpackedTarSizeBytes || tar.length % 512 !== 0) {
    throw new Error("Nu HTML Checker unpacked archive has an unexpected size.");
  }
  const expected = new Set(nu.packageArchiveEntries);
  const seen = new Set();
  let jar;
  let ended = false;
  for (let offset = 0; offset < tar.length;) {
    const header = tar.subarray(offset, offset + 512);
    if (header.length !== 512) throw new Error("Nu HTML Checker package archive is truncated.");
    if (header.every((value) => value === 0)) {
      if (tar.length - offset < 1024 || !tar.subarray(offset).every((value) => value === 0)) {
        throw new Error("Nu HTML Checker package has an invalid archive end marker.");
      }
      ended = true;
      break;
    }
    const sum = header.reduce((total, value, index) => total + (index >= 148 && index < 156 ? 32 : value), 0);
    if (sum !== tarOctal(header, 148, 8)) throw new Error("Nu HTML Checker package archive header checksum mismatch.");
    const name = header.subarray(0, 100).toString("utf8").replace(/\0.*$/, "");
    const prefix = header.subarray(345, 500).toString("utf8").replace(/\0.*$/, "");
    if (prefix || !expected.has(name) || seen.has(name)) {
      throw new Error(`Nu HTML Checker package contains an unapproved or duplicate archive entry: ${name}.`);
    }
    if (header[156] !== 48 || header.subarray(257, 265).toString("ascii") !== "ustar\0" + "00") {
      throw new Error("Nu HTML Checker package archive must contain only regular files.");
    }
    const size = tarOctal(header, 124, 12);
    const end = offset + 512 + size;
    const next = offset + 512 + Math.ceil(size / 512) * 512;
    if (size > MAX_DOWNLOAD_BYTES || end > tar.length || next > tar.length) {
      throw new Error("Nu HTML Checker package archive size is invalid or truncated.");
    }
    if (!tar.subarray(end, next).every((value) => value === 0)) {
      throw new Error("Nu HTML Checker package archive padding is invalid.");
    }
    seen.add(name);
    if (name === nu.archiveEntry) jar = Buffer.from(tar.subarray(offset + 512, end));
    offset = next;
  }
  if (!ended) throw new Error("Nu HTML Checker package is missing its archive end marker.");
  if (seen.size !== expected.size || !jar) throw new Error("Nu HTML Checker package is missing a required archive entry.");
  return verifyJarBytes(jar, nu);
}

async function downloadValidator() {
  const response = await fetchValidatorAsset(MANIFEST.w3cNu.tarballUrl);
  const bytes = await readExactAssetBytes(response, MANIFEST.w3cNu.tarballSizeBytes);
  return extractValidatorJar(bytes);
}

function readVerifiedJar(jarPath, nu = MANIFEST.w3cNu) {
  if (!Number.isSafeInteger(nu.assetSizeBytes) || nu.assetSizeBytes <= 0 || nu.assetSizeBytes > MAX_DOWNLOAD_BYTES) {
    throw new Error("Nu HTML Checker expected JAR size is outside the approved bound.");
  }
  if (!lstatSync(jarPath).isFile()) throw new Error("Nu HTML Checker cache must be a regular file, never a symlink.");
  for (let path = dirname(jarPath); path !== parse(path).root; path = dirname(path)) {
    if (lstatSync(path).isSymbolicLink()) throw new Error("Nu HTML Checker cache must not use symlink ancestors.");
  }
  const fd = openSync(jarPath, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
  try {
    const stat = fstatSync(fd);
    if (!stat.isFile()) throw new Error("Nu HTML Checker cache must be a regular file.");
    if ((process.getuid && stat.uid !== process.getuid()) || (stat.mode & 0o022)) {
      throw new Error("Nu HTML Checker cache has unsafe ownership or is writable by other users.");
    }
    if (stat.size !== nu.assetSizeBytes) throw new Error("Nu HTML Checker cache has an unexpected exact size.");
    const bytes = Buffer.alloc(nu.assetSizeBytes);
    let received = 0;
    while (received < bytes.length) {
      const count = readSync(fd, bytes, received, bytes.length - received, received);
      if (count === 0) break;
      received += count;
    }
    if (received !== bytes.length || readSync(fd, Buffer.alloc(1), 0, 1, received) !== 0) {
      throw new Error("Nu HTML Checker cache changed size during its bounded read.");
    }
    return verifyJarBytes(bytes, nu);
  } finally {
    closeSync(fd);
  }
}

function cacheValidatorBytes(cachePath, bytes) {
  const directory = dirname(cachePath);
  const missing = [];
  // The cache is optional. Never follow unsafe ancestors or remove an existing cache.
  try {
    for (let path = directory; path !== parse(path).root; path = dirname(path)) {
      if (!existsSync(path)) {
        missing.unshift(path);
        continue;
      }
      const stat = lstatSync(path);
      if (!stat.isDirectory() || stat.isSymbolicLink()) return;
      const systemStickyDirectory = stat.uid === 0 && (stat.mode & 0o1000);
      if ((stat.mode & 0o022) && !systemStickyDirectory) return;
      if (stat.uid !== 0 && process.getuid && stat.uid !== process.getuid()) return;
    }
    for (const path of missing) {
      try { mkdirSync(path, { mode: 0o700 }); } catch (error) { if (error.code !== "EEXIST") throw error; }
      const stat = lstatSync(path);
      if (!stat.isDirectory() || stat.isSymbolicLink() || (stat.mode & 0o022) || (process.getuid && stat.uid !== process.getuid())) return;
    }
    const temporary = resolve(directory, `.vnu-${process.pid}-${randomUUID()}.tmp`);
    try {
      writeFileSync(temporary, bytes, { mode: 0o600, flag: "wx" });
      renameSync(temporary, cachePath);
    } finally {
      if (existsSync(temporary)) unlinkSync(temporary);
    }
  } catch {
    // Validation can proceed using the private verified copy when the cache is unavailable.
  }
}

async function ensureValidator({
  cachePath = validatorCachePath(),
  nu = MANIFEST.w3cNu,
  download = downloadValidator,
  inspect = validateStandaloneArchive,
} = {}) {
  let bytes;
  try { bytes = readVerifiedJar(cachePath, nu); } catch { /* Ignore untrusted or stale cache bytes. */ }
  if (!bytes) {
    bytes = verifyJarBytes(await download(), nu);
    cacheValidatorBytes(cachePath, bytes);
  }
  const directory = mkdtempSync(resolve(realpathSync(tmpdir()), "csm-nu-run-"));
  const jarPath = resolve(directory, "vnu.jar");
  let cleaned = false;
  const cleanup = () => {
    if (cleaned) return;
    if (existsSync(jarPath)) unlinkSync(jarPath);
    rmdirSync(directory);
    cleaned = true;
  };
  try {
    writeFileSync(jarPath, bytes, { mode: 0o400, flag: "wx" });
    readVerifiedJar(jarPath, nu);
    inspect(jarPath);
    return { jarPath, cleanup };
  } catch (error) {
    cleanup();
    throw error;
  }
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
  validateManifest(MANIFEST);
  const args = process.argv.slice(2);
  const fetchOnly = args.includes("--fetch-only");
  const positional = args.filter((arg) => arg !== "--fetch-only");
  if (positional.length > 1) {
    throw new Error("Usage: node scripts/validate_html.mjs [artifact-dir] [--fetch-only]");
  }

  const validator = await ensureValidator();
  try {
    console.log(`PINNED NU CHECKER VERIFIED — ${MANIFEST.w3cNu.version} ${MANIFEST.w3cNu.sha256}`);
    if (fetchOnly) return;
    const artifactRoot = resolve(ROOT, positional[0] || "_site");
    validateHtml(validator.jarPath, artifactRoot);
    console.log(`W3C NU HTML VALIDATION PASSED — ${MANIFEST.htmlFiles.length} documents`);
  } finally {
    validator.cleanup();
  }
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  main().catch((error) => {
    console.error(`W3C NU HTML VALIDATION FAILED — ${error.message}`);
    process.exitCode = 1;
  });
}

export {
  ensureValidator,
  extractValidatorJar,
  fetchValidatorAsset,
  isPublicAddress,
  pinnedLookup,
  readExactAssetBytes,
  readVerifiedJar,
  validateConnectedAddress,
  validateNuStandaloneEntries,
  validateStandaloneArchive,
};
