#!/usr/bin/env node

import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  chmodSync,
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { gzipSync } from "node:zlib";
import test from "node:test";
import * as checker from "./validate_html.mjs";

const checksum = (algorithm, bytes, encoding = "hex") =>
  createHash(algorithm).update(bytes).digest(encoding);
const JAR_BYTES = Buffer.from("a reviewed standalone validator fixture");

function nuFixture() {
  return {
    assetSizeBytes: JAR_BYTES.length,
    sha256: checksum("sha256", JAR_BYTES),
    upstreamSha1: checksum("sha1", JAR_BYTES),
    archiveEntry: "package/build/dist/vnu.jar",
    packageArchiveEntries: ["package/LICENSE", "package/build/dist/vnu.jar"],
  };
}

function tarHeader(name, size, type = "0") {
  const header = Buffer.alloc(512);
  header.write(name, 0, 100);
  header.write("0000400\0", 100, 8);
  header.write("0000000\0", 108, 8);
  header.write("0000000\0", 116, 8);
  header.write(`${size.toString(8).padStart(11, "0")}\0`, 124, 12);
  header.write("00000000000\0", 136, 12);
  header.fill(32, 148, 156);
  header.write(type, 156, 1);
  header.write("ustar\0", 257, 6);
  header.write("00", 263, 2);
  const sum = header.reduce((total, value) => total + value, 0);
  header.write(`${sum.toString(8).padStart(6, "0")}\0 `, 148, 8);
  return header;
}

function tarFixture(entries = [
  ["package/LICENSE", Buffer.from("MIT")],
  ["package/build/dist/vnu.jar", JAR_BYTES],
]) {
  return Buffer.concat([
    ...entries.flatMap(([name, bytes, type]) => [
      tarHeader(name, bytes.length, type),
      bytes,
      Buffer.alloc((512 - bytes.length % 512) % 512),
    ]),
    Buffer.alloc(1024),
  ]);
}

function packedFixture(tar = tarFixture()) {
  const bytes = gzipSync(tar);
  return {
    bytes,
    nu: {
      ...nuFixture(),
      unpackedTarSizeBytes: tar.length,
      tarballSizeBytes: bytes.length,
      tarballSha256: checksum("sha256", bytes),
      tarballIntegrity: `sha512-${checksum("sha512", bytes, "base64")}`,
    },
  };
}

function temporaryDirectory(callback) {
  const directory = mkdtempSync(resolve(realpathSync(tmpdir()), "csm-nu-security-test-"));
  try {
    return callback(directory);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

test("accepts only public addresses, including rejecting IPv4 and IPv6 aliases", () => {
  for (const address of ["185.199.108.133", "104.16.27.34", "2606:4700::6810:1b22"]) {
    assert.equal(checker.isPublicAddress(address), true, address);
  }
  for (const address of [
    "0.0.0.0", "10.2.3.4", "100.64.0.1", "127.0.0.1", "169.254.169.254",
    "172.16.0.1", "192.168.0.1", "192.0.2.1", "198.18.0.1", "203.0.113.1",
    "224.0.0.1", "255.255.255.255", "::", "::1", "fe80::1", "fc00::1",
    "::ffff:127.0.0.1", "2001:db8::1", "2002:7f00:1::", "3fff::1", "not-an-IP",
  ]) {
    assert.equal(checker.isPublicAddress(address), false, address);
  }
});

test("preserves the official npm 200 download and pins the vetted DNS address", async () => {
  const url = "https://registry.npmjs.org/vnu-jar/-/vnu-jar-26.8.30.tgz";
  let requested;
  const response = await checker.fetchValidatorAsset(url, {
    lookupAll: async () => [
      { address: "2606:4700::6810:1b22", family: 6 },
      { address: "104.16.27.34", family: 4 },
    ],
    requestAsset: async (target, options) => {
      requested = { target, options };
      return new Response(JAR_BYTES);
    },
  });
  assert.equal(requested.target.href, url);
  assert.equal(requested.options.address.address, "104.16.27.34");
  assert.deepEqual(Buffer.from(await response.arrayBuffer()), JAR_BYTES);
});

test("follows bounded approved redirects and validates DNS at every hop", async () => {
  const lookups = [];
  const targets = [];
  const response = await checker.fetchValidatorAsset("https://registry.npmjs.org/start", {
    lookupAll: async (host) => {
      lookups.push(host);
      return [{ address: "104.16.27.34", family: 4 }];
    },
    requestAsset: async (url) => {
      targets.push(url.pathname);
      return targets.length === 1
        ? new Response(null, { status: 302, headers: { location: "/final" } })
        : new Response(JAR_BYTES);
    },
  });
  assert.deepEqual(targets, ["/start", "/final"]);
  assert.deepEqual(lookups, ["registry.npmjs.org", "registry.npmjs.org"]);
  assert.equal(response.status, 200);
});

test("rejects unsafe redirect targets before resolving or requesting them", async () => {
  for (const location of [
    "http://registry.npmjs.org/a", "https://registry.npmjs.org:444/a",
    "https://user:pass@registry.npmjs.org/a", "https://registry.npmjs.org.evil.test/a",
    "https://registry.npmjs.org./a", "https://127.1/a", "https://2130706433/a",
    "https://[::ffff:127.0.0.1]/a", "https://api.github.com/a",
  ]) {
    let requests = 0;
    let lookups = 0;
    await assert.rejects(checker.fetchValidatorAsset("https://registry.npmjs.org/start", {
      lookupAll: async () => {
        lookups += 1;
        return [{ address: "104.16.27.34", family: 4 }];
      },
      requestAsset: async () => {
        requests += 1;
        return new Response(null, { status: 302, headers: { location } });
      },
    }), /approved HTTPS download URL/);
    assert.equal(requests, 1, location);
    assert.equal(lookups, 1, location);
  }
});

test("rejects any non-public DNS answer and DNS rebinding on an approved redirect", async () => {
  for (const answers of [
    [],
    [{ address: "127.0.0.1", family: 4 }],
    [{ address: "104.16.27.34", family: 4 }, { address: "10.0.0.1", family: 4 }],
    [{ address: "::ffff:169.254.169.254", family: 6 }],
  ]) {
    await assert.rejects(checker.fetchValidatorAsset("https://registry.npmjs.org/a", {
      lookupAll: async () => answers,
      requestAsset: async () => { throw new Error("Unsafe destination was requested."); },
    }), /public DNS addresses/);
  }
  let lookups = 0;
  let requests = 0;
  await assert.rejects(checker.fetchValidatorAsset("https://registry.npmjs.org/a", {
    lookupAll: async () => [{ address: ++lookups === 1 ? "104.16.27.34" : "127.0.0.1", family: 4 }],
    requestAsset: async () => {
      requests += 1;
      return new Response(null, { status: 302, headers: { location: "/b" } });
    },
  }), /public DNS addresses/);
  assert.equal(requests, 1);
});

test("pins the connection lookup and rejects a peer outside the vetted address", () => {
  const approved = { address: "104.16.27.34", family: 4 };
  const connectionLookup = checker.pinnedLookup("registry.npmjs.org", approved);
  connectionLookup("registry.npmjs.org", { all: true }, (error, addresses) => {
    assert.equal(error, null);
    assert.deepEqual(addresses, [approved]);
  });
  connectionLookup("registry.npmjs.org", {}, (error, address, family) => {
    assert.equal(error, null);
    assert.equal(address, approved.address);
    assert.equal(family, 4);
  });
  connectionLookup("unapproved.test", {}, (error) => assert.match(error.message, /changed.*hostname/));
  assert.doesNotThrow(() => checker.validateConnectedAddress(approved.address, approved));
  for (const peer of ["127.0.0.1", "104.16.27.35", "::ffff:127.0.0.1"]) {
    assert.throws(() => checker.validateConnectedAddress(peer, approved), /unapproved network address/);
  }
});

test("rejects missing redirect locations, excessive hops, and non-success statuses", async () => {
  for (const response of [
    new Response(null, { status: 302 }),
    new Response(null, { status: 404 }),
  ]) {
    await assert.rejects(checker.fetchValidatorAsset("https://registry.npmjs.org/a", {
      lookupAll: async () => [{ address: "104.16.27.34", family: 4 }],
      requestAsset: async () => response,
    }), /redirect location|HTTP 404/);
  }
  let requests = 0;
  await assert.rejects(checker.fetchValidatorAsset("https://registry.npmjs.org/a", {
    lookupAll: async () => [{ address: "104.16.27.34", family: 4 }],
    requestAsset: async () => {
      requests += 1;
      return new Response(null, { status: 302, headers: { location: "/a" } });
    },
  }), /redirect limit/);
  assert.equal(requests, 4);
});

test("cancels a body rejected by its declared length immediately", async () => {
  let cancelled = false;
  const response = new Response(new ReadableStream({
    cancel() { cancelled = true; },
  }), { headers: { "content-length": "3" } });
  await assert.rejects(checker.readExactAssetBytes(response, 4), /declared 3 bytes/);
  assert.equal(cancelled, true);
});

test("extracts the reviewed JAR in memory without executing package scripts", () => {
  const { bytes, nu } = packedFixture();
  assert.deepEqual(checker.extractValidatorJar(bytes, nu), JAR_BYTES);
  const changed = Buffer.from(bytes);
  changed[changed.length - 1] ^= 1;
  assert.throws(() => checker.extractValidatorJar(changed, nu), /package checksum mismatch/);
});

test("rejects tar traversal, symlinks, extra entries, duplicates and missing JARs", () => {
  for (const entries of [
    [["../vnu.jar", JAR_BYTES]],
    [["package/build/dist/vnu.jar", JAR_BYTES, "2"]],
    [["package/build/dist/vnu.jar", JAR_BYTES], ["package/unreviewed.js", Buffer.from("bad")]],
    [["package/build/dist/vnu.jar", JAR_BYTES], ["package/build/dist/vnu.jar", JAR_BYTES]],
    [["package/LICENSE", Buffer.from("MIT")]],
  ]) {
    const { bytes, nu } = packedFixture(tarFixture(entries));
    assert.throws(() => checker.extractValidatorJar(bytes, nu), /archive entry|regular files|missing/);
  }
});

test("rejects malformed tar headers, overflow, truncation and decompression overflow", () => {
  const corruptHeader = tarFixture();
  corruptHeader[1] ^= 1;
  const corrupt = packedFixture(corruptHeader);
  assert.throws(() => checker.extractValidatorJar(corrupt.bytes, corrupt.nu), /header checksum/);
  const tooLargeEntry = Buffer.concat([tarHeader("package/build/dist/vnu.jar", 41 * 1024 * 1024), Buffer.alloc(1024)]);
  const oversized = packedFixture(tooLargeEntry);
  assert.throws(() => checker.extractValidatorJar(oversized.bytes, oversized.nu), /archive size|truncated/);
  const truncated = packedFixture(tarFixture().subarray(0, 1536));
  assert.throws(() => checker.extractValidatorJar(truncated.bytes, truncated.nu), /truncated|end marker/);
  const bomb = packedFixture(Buffer.alloc(4096));
  bomb.nu.unpackedTarSizeBytes = 1024;
  assert.throws(() => checker.extractValidatorJar(bomb.bytes, bomb.nu), /size|buffer/i);
});

test("rejects a extracted JAR with the wrong exact bytes or digest", () => {
  const changedJar = Buffer.from(JAR_BYTES);
  changedJar[0] ^= 1;
  const wrongHash = packedFixture(tarFixture([
    ["package/LICENSE", Buffer.from("MIT")],
    ["package/build/dist/vnu.jar", changedJar],
  ]));
  assert.throws(() => checker.extractValidatorJar(wrongHash.bytes, wrongHash.nu), /checksum mismatch/);
  const wrongSize = packedFixture(tarFixture([
    ["package/LICENSE", Buffer.from("MIT")],
    ["package/build/dist/vnu.jar", Buffer.concat([JAR_BYTES, Buffer.from("x")])],
  ]));
  assert.throws(() => checker.extractValidatorJar(wrongSize.bytes, wrongSize.nu), /size/);
});

test("rejects cache symlinks, non-regular files, writable and oversized files", () => temporaryDirectory((directory) => {
  const good = resolve(directory, "reviewed.jar");
  writeFileSync(good, JAR_BYTES, { mode: 0o600 });
  assert.deepEqual(checker.readVerifiedJar(good, nuFixture()), JAR_BYTES);
  const link = resolve(directory, "link.jar");
  symlinkSync(good, link);
  assert.throws(() => checker.readVerifiedJar(link, nuFixture()), /regular file|symlink/);
  const parentLink = resolve(directory, "parent-link");
  const nested = resolve(directory, "nested");
  mkdirSync(nested);
  writeFileSync(resolve(nested, "vnu.jar"), JAR_BYTES, { mode: 0o600 });
  symlinkSync(nested, parentLink);
  assert.throws(() => checker.readVerifiedJar(resolve(parentLink, "vnu.jar"), nuFixture()), /symlink ancestors/);
  assert.throws(() => checker.readVerifiedJar(directory, nuFixture()), /regular file/);
  const oversized = resolve(directory, "oversized.jar");
  writeFileSync(oversized, Buffer.alloc(JAR_BYTES.length + 1), { mode: 0o600 });
  assert.throws(() => checker.readVerifiedJar(oversized, nuFixture()), /size/);
  chmodSync(good, 0o666);
  assert.throws(() => checker.readVerifiedJar(good, nuFixture()), /writable|ownership/);
}));

test("executes a private read-only snapshot even when the shared cache is replaced", async () => {
  const directory = mkdtempSync(resolve(realpathSync(tmpdir()), "csm-nu-swap-test-"));
  let validator;
  try {
    const cachePath = resolve(directory, "cache", "hash", "vnu.jar");
    mkdirSync(dirname(cachePath), { recursive: true, mode: 0o700 });
    writeFileSync(cachePath, JAR_BYTES, { mode: 0o600 });
    let inspectedPath;
    validator = await checker.ensureValidator({
      cachePath,
      nu: nuFixture(),
      download: async () => { throw new Error("A valid cache should not download."); },
      inspect: (jarPath) => {
        inspectedPath = jarPath;
        writeFileSync(cachePath, "attacker replacement");
      },
    });
    assert.notEqual(validator.jarPath, cachePath);
    assert.equal(validator.jarPath, inspectedPath);
    assert.deepEqual(readFileSync(validator.jarPath), JAR_BYTES);
    assert.equal(lstatSync(dirname(validator.jarPath)).mode & 0o777, 0o700);
    assert.equal(lstatSync(validator.jarPath).mode & 0o777, 0o400);
    validator.cleanup();
    assert.equal(existsSync(validator.jarPath), false);
    assert.equal(readFileSync(cachePath, "utf8"), "attacker replacement");
  } finally {
    validator?.cleanup();
    rmSync(directory, { recursive: true, force: true });
  }
});

test("recovers corrupt cache safely, creates concurrent snapshots, and cleans inspection failures", async () => {
  const directory = mkdtempSync(resolve(realpathSync(tmpdir()), "csm-nu-recovery-test-"));
  const snapshots = [];
  try {
    const cachePath = resolve(directory, "cache", "hash", "vnu.jar");
    mkdirSync(dirname(cachePath), { recursive: true, mode: 0o700 });
    writeFileSync(cachePath, "bad", { mode: 0o600 });
    const options = { cachePath, nu: nuFixture(), download: async () => JAR_BYTES, inspect: () => {} };
    snapshots.push(...await Promise.all([checker.ensureValidator(options), checker.ensureValidator(options)]));
    assert.notEqual(snapshots[0].jarPath, snapshots[1].jarPath);
    for (const snapshot of snapshots) assert.deepEqual(readFileSync(snapshot.jarPath), JAR_BYTES);
    let failedPath;
    await assert.rejects(checker.ensureValidator({
      ...options,
      inspect: (path) => { failedPath = path; throw new Error("inspection failed"); },
    }), /inspection failed/);
    assert.equal(existsSync(failedPath), false);
  } finally {
    for (const snapshot of snapshots) snapshot.cleanup();
    rmSync(directory, { recursive: true, force: true });
  }
});

test("ignores symlinked cache ancestors without changing the linked target", async () => {
  const directory = mkdtempSync(resolve(realpathSync(tmpdir()), "csm-nu-ancestor-test-"));
  let validator;
  try {
    const target = resolve(directory, "target");
    mkdirSync(target, { mode: 0o700 });
    const targetJar = resolve(target, "vnu.jar");
    writeFileSync(targetJar, "preserve linked target", { mode: 0o600 });
    const alias = resolve(directory, "alias");
    symlinkSync(target, alias);
    validator = await checker.ensureValidator({
      cachePath: resolve(alias, "vnu.jar"),
      nu: nuFixture(),
      download: async () => JAR_BYTES,
      inspect: () => {},
    });
    assert.deepEqual(readFileSync(validator.jarPath), JAR_BYTES);
    assert.equal(readFileSync(targetJar, "utf8"), "preserve linked target");
    assert.equal(lstatSync(alias).isSymbolicLink(), true);
  } finally {
    validator?.cleanup();
    rmSync(directory, { recursive: true, force: true });
  }
});
