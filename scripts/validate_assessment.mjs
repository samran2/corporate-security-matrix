import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { webcrypto } from "node:crypto";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const root = new URL("../", import.meta.url);

const dataContext = vm.createContext({});
vm.runInContext(
  `${fs.readFileSync(new URL("matrix-domains.js", root), "utf8")}\n` +
    "globalThis.__assessmentFixture = { domains, phases };",
  dataContext
);

const domainDefinitions = Array.from(dataContext.__assessmentFixture.domains, (domain) => ({
  id: domain.id,
  name: domain.name
}));
const phaseDefinitions = Array.from(dataContext.__assessmentFixture.phases, (phase) => ({
  id: phase.id,
  title: phase.title
}));

const model = require(fileURLToPath(new URL("../assessment-model.js", import.meta.url)));
const cryptoApi = require(fileURLToPath(new URL("../assessment-crypto.js", import.meta.url)));

const tests = [];
const test = (name, run) => tests.push({ name, run });
const expectCode = async (operation, code) => {
  await assert.rejects(operation, (error) => error && error.code === code);
};

const mutateBase64Byte = (value, index) => {
  const bytes = Buffer.from(value, "base64");
  bytes[index] ^= 1;
  return bytes.toString("base64");
};

test("creates one empty assessment cell for every canonical domain and phase", () => {
  const assessment = model.createAssessment({
    domains: domainDefinitions,
    phases: phaseDefinitions,
    frameworkVersion: "1.1.0",
    now: "2026-08-29T10:00:00.000Z"
  });

  assert.equal(Object.keys(assessment.cells).length, 45);
  assert.equal(assessment.overlay, null);
  assert.deepEqual(Object.keys(assessment.cells), [
    "personnel-security.identify",
    "personnel-security.protect",
    "personnel-security.detect",
    "personnel-security.respond",
    "personnel-security.recover",
    ...Object.keys(assessment.cells).slice(5)
  ]);
  assert.deepEqual(assessment.cells["personnel-security.identify"], {
    maturity: null,
    confidence: {
      controlEvidence: null,
      independentChallenge: null,
      exerciseRecency: null
    },
    criticalGap: "",
    nextAction: "",
    ownerRole: ""
  });
  assert.equal(model.validateAssessment(assessment, domainDefinitions, phaseDefinitions), assessment);
});

test("rejects a non-canonical domain or phase boundary before creating state", () => {
  assert.throws(
    () => model.createAssessment({
      domains: domainDefinitions.slice(0, 8),
      phases: phaseDefinitions,
      frameworkVersion: "1.1.0"
    }),
    (error) => error && error.code === "INVALID_DEFINITIONS"
  );
  assert.throws(
    () => model.createAssessment({
      domains: domainDefinitions,
      phases: [...phaseDefinitions].reverse(),
      frameworkVersion: "1.1.0"
    }),
    (error) => error && error.code === "INVALID_DEFINITIONS"
  );
});

test("updates one cell immutably and enforces all score and text bounds", () => {
  const original = model.createAssessment({
    domains: domainDefinitions,
    phases: phaseDefinitions,
    frameworkVersion: "1.1.0",
    now: "2026-08-29T10:00:00.000Z"
  });
  const updated = model.updateAssessmentCell(
    original,
    "personnel-security.identify",
    {
      maturity: 2,
      confidence: { controlEvidence: 4, independentChallenge: 2, exerciseRecency: 0 },
      criticalGap: "  A material gap  ",
      nextAction: "Run the exercise",
      ownerRole: "Security lead"
    },
    { domains: domainDefinitions, phases: phaseDefinitions, now: "2026-08-29T10:05:00.000Z" }
  );

  assert.notEqual(updated, original);
  assert.equal(original.cells["personnel-security.identify"].maturity, null);
  assert.equal(updated.cells["personnel-security.identify"].criticalGap, "A material gap");
  assert.equal(updated.updatedAt, "2026-08-29T10:05:00.000Z");
  assert.throws(
    () => model.updateAssessmentCell(updated, "personnel-security.identify", { maturity: 5 }, {
      domains: domainDefinitions,
      phases: phaseDefinitions
    }),
    (error) => error && error.code === "INVALID_CELL"
  );
  assert.throws(
    () => model.updateAssessmentCell(updated, "personnel-security.identify", { ownerRole: "x".repeat(121) }, {
      domains: domainDefinitions,
      phases: phaseDefinitions
    }),
    (error) => error && error.code === "INVALID_CELL"
  );
  assert.throws(
    () => model.updateAssessmentCell(updated, "personnel-security.identify", { criticalGap: 7 }, {
      domains: domainDefinitions,
      phases: phaseDefinitions
    }),
    (error) => error && error.code === "INVALID_CELL"
  );
});

test("counts user-facing text limits by Unicode code point", () => {
  const assessment = model.createAssessment({
    domains: domainDefinitions,
    phases: phaseDefinitions,
    frameworkVersion: "1.1.0"
  });
  const accepted = model.updateAssessmentCell(assessment, "personnel-security.identify", {
    criticalGap: "🛡️".repeat(250)
  }, { domains: domainDefinitions, phases: phaseDefinitions });
  assert.equal(Array.from(accepted.cells["personnel-security.identify"].criticalGap).length, 500);
  assert.throws(
    () => model.updateAssessmentCell(assessment, "personnel-security.identify", {
      criticalGap: "🛡".repeat(501)
    }, { domains: domainDefinitions, phases: phaseDefinitions }),
    (error) => error && error.code === "INVALID_CELL"
  );
});

test("calculates maturity, confidence, coverage, distribution and weakest phase", () => {
  let assessment = model.createAssessment({
    domains: domainDefinitions,
    phases: phaseDefinitions,
    frameworkVersion: "1.1.0",
    now: "2026-08-29T10:00:00.000Z"
  });
  assessment = model.updateAssessmentCell(assessment, "personnel-security.identify", {
    maturity: 2,
    confidence: { controlEvidence: 4, independentChallenge: 2, exerciseRecency: 0 },
    nextAction: "Close the first gap",
    ownerRole: "Security lead"
  }, { domains: domainDefinitions, phases: phaseDefinitions, now: "2026-08-29T10:01:00.000Z" });
  assessment = model.updateAssessmentCell(assessment, "personnel-security.protect", {
    maturity: 4,
    confidence: { controlEvidence: 4, independentChallenge: 4, exerciseRecency: 4 }
  }, { domains: domainDefinitions, phases: phaseDefinitions, now: "2026-08-29T10:02:00.000Z" });

  const summary = model.summarizeAssessment(assessment, domainDefinitions, phaseDefinitions);
  assert.equal(summary.assessedCells, 2);
  assert.equal(summary.totalCells, 45);
  assert.equal(summary.isComplete, false);
  assert.equal(summary.coveragePercent, 4.4);
  assert.equal(summary.maturityIndex, 3);
  assert.equal(summary.confidenceIndex, 82.5);
  assert.deepEqual(summary.maturityDistribution, { 0: 0, 1: 0, 2: 1, 3: 0, 4: 1 });
  assert.equal(summary.weakestPhase.id, "identify");
  assert.equal(summary.prioritizedActions[0].cellId, "personnel-security.identify");
});

test("does not count a partially scored cell as assessed", () => {
  let assessment = model.createAssessment({
    domains: domainDefinitions,
    phases: phaseDefinitions,
    frameworkVersion: "1.1.0"
  });
  assessment = model.updateAssessmentCell(assessment, "personnel-security.identify", {
    maturity: 2,
    confidence: { controlEvidence: 4, independentChallenge: null, exerciseRecency: null }
  }, { domains: domainDefinitions, phases: phaseDefinitions });

  const maturityOnly = model.summarizeAssessment(assessment, domainDefinitions, phaseDefinitions);
  assert.equal(maturityOnly.assessedCells, 0);
  assert.equal(maturityOnly.maturityAssessedCells, 1);
  assert.equal(maturityOnly.confidenceAssessedCells, 0);
  assert.equal(maturityOnly.maturityIndex, 2);
  assert.equal(maturityOnly.confidenceIndex, null);
  assert.deepEqual(maturityOnly.maturityDistribution, { 0: 0, 1: 0, 2: 1, 3: 0, 4: 0 });

  assessment = model.updateAssessmentCell(assessment, "personnel-security.protect", {
    confidence: { controlEvidence: 4, independentChallenge: 2, exerciseRecency: 0 }
  }, { domains: domainDefinitions, phases: phaseDefinitions });
  const separateDimensions = model.summarizeAssessment(assessment, domainDefinitions, phaseDefinitions);
  assert.equal(separateDimensions.assessedCells, 0);
  assert.equal(separateDimensions.maturityAssessedCells, 1);
  assert.equal(separateDimensions.confidenceAssessedCells, 1);
  assert.equal(separateDimensions.maturityIndex, 2);
  assert.equal(separateDimensions.confidenceIndex, 65);
});

test("keeps update timestamps monotonic when the system clock moves backward", () => {
  const assessment = model.createAssessment({
    domains: domainDefinitions,
    phases: phaseDefinitions,
    frameworkVersion: "1.1.0",
    now: "2026-08-29T10:00:00.000Z"
  });
  const updated = model.updateAssessmentCell(assessment, "personnel-security.identify", {
    maturity: 1
  }, {
    domains: domainDefinitions,
    phases: phaseDefinitions,
    now: "2026-08-29T09:59:00.000Z"
  });
  assert.equal(updated.updatedAt, assessment.updatedAt);
  assert.equal(model.validateAssessment(updated, domainDefinitions, phaseDefinitions), updated);
});

test("strict validation rejects unknown schema versions, missing cells and extra fields", () => {
  const assessment = model.createAssessment({
    domains: domainDefinitions,
    phases: phaseDefinitions,
    frameworkVersion: "1.1.0"
  });
  assert.throws(
    () => model.validateAssessment({ ...assessment, schemaVersion: 99 }, domainDefinitions, phaseDefinitions),
    (error) => error && error.code === "UNSUPPORTED_SCHEMA"
  );
  const missingCell = structuredClone(assessment);
  delete missingCell.cells["personnel-security.identify"];
  assert.throws(
    () => model.validateAssessment(missingCell, domainDefinitions, phaseDefinitions),
    (error) => error && error.code === "INVALID_ASSESSMENT"
  );
  assert.throws(
    () => model.validateAssessment({ ...assessment, unexpected: true }, domainDefinitions, phaseDefinitions),
    (error) => error && error.code === "INVALID_ASSESSMENT"
  );
  assert.equal(model.validateAssessment({
    ...assessment,
    overlay: { id: "eu-fi", version: "1.3.0" }
  }, domainDefinitions, phaseDefinitions).overlay.id, "eu-fi");
  assert.throws(
    () => model.validateAssessment({ ...assessment, overlay: { id: "eu-fi" } }, domainDefinitions, phaseDefinitions),
    (error) => error && error.code === "INVALID_ASSESSMENT"
  );
});

test("encrypts and decrypts a versioned assessment without retaining its passphrase", async () => {
  const assessment = model.createAssessment({
    domains: domainDefinitions,
    phases: phaseDefinitions,
    frameworkVersion: "1.1.0",
    now: "2026-08-29T10:00:00.000Z"
  });
  const passphrase = "correct horse battery staple";
  const envelope = await cryptoApi.encryptAssessment(assessment, passphrase, {
    crypto: webcrypto,
    validate: (candidate) => model.validateAssessment(candidate, domainDefinitions, phaseDefinitions)
  });

  assert.equal(envelope.header.format, "csm-assessment-encrypted");
  assert.equal(envelope.header.formatVersion, 1);
  assert.equal(envelope.header.kdf.iterations, 600000);
  assert.equal(envelope.header.kdf.hash, "SHA-256");
  assert.equal(envelope.header.cipher.name, "AES-GCM");
  assert.equal(envelope.header.cipher.keyLength, 256);
  assert.equal(envelope.header.cipher.tagLength, 128);
  assert.equal(Buffer.from(envelope.header.kdf.salt, "base64").length, 16);
  assert.equal(Buffer.from(envelope.header.cipher.iv, "base64").length, 12);
  assert.equal(JSON.stringify(envelope).includes(passphrase), false);

  const decrypted = await cryptoApi.decryptAssessment(JSON.stringify(envelope), passphrase, {
    crypto: webcrypto,
    validate: (candidate) => model.validateAssessment(candidate, domainDefinitions, phaseDefinitions)
  });
  assert.deepEqual(decrypted, assessment);
});

test("reports one non-oracular error for a wrong passphrase or changed ciphertext", async () => {
  const assessment = model.createAssessment({
    domains: domainDefinitions,
    phases: phaseDefinitions,
    frameworkVersion: "1.1.0"
  });
  const envelope = await cryptoApi.encryptAssessment(assessment, "valid passphrase", {
    crypto: webcrypto,
    validate: (candidate) => model.validateAssessment(candidate, domainDefinitions, phaseDefinitions)
  });
  await expectCode(
    () => cryptoApi.decryptAssessment(JSON.stringify(envelope), "wrong passphrase", {
      crypto: webcrypto,
      validate: (candidate) => model.validateAssessment(candidate, domainDefinitions, phaseDefinitions)
    }),
    "DECRYPTION_FAILED"
  );

  const changed = structuredClone(envelope);
  const bytes = Buffer.from(changed.ciphertext, "base64");
  bytes[0] ^= 1;
  changed.ciphertext = bytes.toString("base64");
  await expectCode(
    () => cryptoApi.decryptAssessment(JSON.stringify(changed), "valid passphrase", {
      crypto: webcrypto,
      validate: (candidate) => model.validateAssessment(candidate, domainDefinitions, phaseDefinitions)
    }),
    "DECRYPTION_FAILED"
  );
});

test("fails closed for changed authenticated metadata, salts, IVs, tags and malformed ciphertext", async () => {
  const assessment = model.createAssessment({
    domains: domainDefinitions,
    phases: phaseDefinitions,
    frameworkVersion: "1.1.0"
  });
  const passphrase = "authenticated envelope passphrase";
  const envelope = await cryptoApi.encryptAssessment(assessment, passphrase, {
    crypto: webcrypto,
    validate: (candidate) => model.validateAssessment(candidate, domainDefinitions, phaseDefinitions)
  });
  const decrypt = (candidate) => cryptoApi.decryptAssessment(JSON.stringify(candidate), passphrase, {
    crypto: webcrypto,
    validate: (value) => model.validateAssessment(value, domainDefinitions, phaseDefinitions)
  });

  let observedAdditionalData;
  const observingCrypto = {
    getRandomValues: webcrypto.getRandomValues.bind(webcrypto),
    subtle: {
      importKey: webcrypto.subtle.importKey.bind(webcrypto.subtle),
      deriveKey: webcrypto.subtle.deriveKey.bind(webcrypto.subtle),
      encrypt: webcrypto.subtle.encrypt.bind(webcrypto.subtle),
      decrypt: async (algorithm, key, ciphertext) => {
        observedAdditionalData = new Uint8Array(algorithm.additionalData);
        return webcrypto.subtle.decrypt(algorithm, key, ciphertext);
      }
    }
  };
  await cryptoApi.decryptAssessment(JSON.stringify(envelope), passphrase, {
    crypto: observingCrypto,
    validate: (value) => model.validateAssessment(value, domainDefinitions, phaseDefinitions)
  });
  assert.equal(
    new TextDecoder().decode(observedAdditionalData),
    cryptoApi.canonicalizeHeader(envelope.header),
    "The complete canonical header must be bound to AES-GCM as additional authenticated data."
  );

  const changedMetadata = structuredClone(envelope);
  changedMetadata.header.contentType = "application/json";
  assert.notEqual(
    cryptoApi.canonicalizeHeader(changedMetadata.header),
    cryptoApi.canonicalizeHeader(envelope.header)
  );
  await expectCode(() => decrypt(changedMetadata), "INVALID_ENVELOPE");

  const changedSalt = structuredClone(envelope);
  changedSalt.header.kdf.salt = mutateBase64Byte(changedSalt.header.kdf.salt, 0);
  await expectCode(() => decrypt(changedSalt), "DECRYPTION_FAILED");

  const changedIv = structuredClone(envelope);
  changedIv.header.cipher.iv = mutateBase64Byte(changedIv.header.cipher.iv, 0);
  await expectCode(() => decrypt(changedIv), "DECRYPTION_FAILED");

  const changedTag = structuredClone(envelope);
  const tagBytes = Buffer.from(changedTag.ciphertext, "base64");
  changedTag.ciphertext = mutateBase64Byte(changedTag.ciphertext, tagBytes.length - 1);
  await expectCode(() => decrypt(changedTag), "DECRYPTION_FAILED");

  const truncatedCiphertext = structuredClone(envelope);
  truncatedCiphertext.ciphertext = Buffer.from(envelope.ciphertext, "base64")
    .subarray(0, tagBytes.length - 1)
    .toString("base64");
  await expectCode(() => decrypt(truncatedCiphertext), "DECRYPTION_FAILED");

  const tagOnlyCiphertext = structuredClone(envelope);
  tagOnlyCiphertext.ciphertext = Buffer.alloc(cryptoApi.GCM_TAG_BITS / 8).toString("base64");
  await expectCode(() => decrypt(tagOnlyCiphertext), "INVALID_ENVELOPE");

  const malformedCiphertext = structuredClone(envelope);
  malformedCiphertext.ciphertext = "not+canonical=base64";
  await expectCode(() => decrypt(malformedCiphertext), "INVALID_ENVELOPE");

  const malformedIv = structuredClone(envelope);
  malformedIv.header.cipher.iv = "AA==";
  await expectCode(() => decrypt(malformedIv), "INVALID_ENVELOPE");

  const malformedSalt = structuredClone(envelope);
  malformedSalt.header.kdf.salt = "%%%%";
  await expectCode(() => decrypt(malformedSalt), "INVALID_ENVELOPE");
});

test("accepts an envelope at exactly 1 MiB and rejects the next byte", async () => {
  const assessment = model.createAssessment({
    domains: domainDefinitions,
    phases: phaseDefinitions,
    frameworkVersion: "1.1.0"
  });
  const envelope = await cryptoApi.encryptAssessment(assessment, "exact boundary passphrase", {
    crypto: webcrypto,
    validate: (candidate) => model.validateAssessment(candidate, domainDefinitions, phaseDefinitions)
  });
  const prefix = `{"header":${JSON.stringify(envelope.header)},"ciphertext":"`;
  const suffix = '"}';
  const availableBytes = cryptoApi.MAX_FILE_BYTES - Buffer.byteLength(prefix) - Buffer.byteLength(suffix);
  const ciphertextLength = availableBytes - (availableBytes % 4);
  const leadingWhitespaceLength = availableBytes - ciphertextLength;
  const exactBoundary = `${" ".repeat(leadingWhitespaceLength)}${prefix}${"A".repeat(ciphertextLength)}${suffix}`;

  assert.equal(Buffer.byteLength(exactBoundary), cryptoApi.MAX_FILE_BYTES);
  assert.ok(cryptoApi.parseEnvelope(exactBoundary).ciphertext.byteLength > cryptoApi.GCM_TAG_BITS / 8);
  await expectCode(() => Promise.resolve().then(() => cryptoApi.parseEnvelope(`${exactBoundary} `)), "FILE_TOO_LARGE");
});

test("uses fresh salt and IV material for every encrypted export", async () => {
  const assessment = model.createAssessment({
    domains: domainDefinitions,
    phases: phaseDefinitions,
    frameworkVersion: "1.1.0"
  });
  const options = {
    crypto: webcrypto,
    validate: (candidate) => model.validateAssessment(candidate, domainDefinitions, phaseDefinitions)
  };
  const first = await cryptoApi.encryptAssessment(assessment, "fresh randomness passphrase", options);
  const second = await cryptoApi.encryptAssessment(assessment, "fresh randomness passphrase", options);

  assert.notEqual(first.header.kdf.salt, second.header.kdf.salt);
  assert.notEqual(first.header.cipher.iv, second.header.cipher.iv);
  assert.notEqual(first.ciphertext, second.ciphertext);
});

test("coordinates page-wide imports with a fail-fast lock that always releases", async () => {
  let releaseFirst;
  const firstGate = new Promise((resolve) => {
    releaseFirst = resolve;
  });
  let secondRan = false;
  const first = cryptoApi.withExclusiveImport(() => firstGate);

  await assert.rejects(
    () => cryptoApi.withExclusiveImport(() => {
      secondRan = true;
    }),
    (error) => error &&
      error.code === "IMPORT_BUSY" &&
      error.message === "Another encrypted assessment import is already in progress. Wait for it to finish and try again."
  );
  assert.equal(secondRan, false);
  releaseFirst("first complete");
  assert.equal(await first, "first complete");

  await assert.rejects(
    () => cryptoApi.withExclusiveImport(async () => {
      throw new Error("synthetic import failure");
    }),
    /synthetic import failure/
  );
  assert.equal(await cryptoApi.withExclusiveImport(() => "released after async failure"), "released after async failure");
  await assert.rejects(
    () => cryptoApi.withExclusiveImport(() => {
      throw new Error("synthetic synchronous failure");
    }),
    /synthetic synchronous failure/
  );
  assert.equal(await cryptoApi.withExclusiveImport(() => "released after sync failure"), "released after sync failure");
});

test("prevents a deferred import from overwriting newer reset, edit or clear state", async () => {
  for (const newerState of ["reset state", "edited state", "cleared state"]) {
    const guard = cryptoApi.createImportCommitGuard();
    const importToken = guard.capture();
    let releaseDecrypt;
    const decryptGate = new Promise((resolve) => {
      releaseDecrypt = resolve;
    });
    let liveState = "original state";
    const pendingImport = cryptoApi.withExclusiveImport(async () => {
      await decryptGate;
      guard.assertCurrent(importToken);
      liveState = "imported state";
    });

    liveState = newerState;
    guard.invalidate();
    releaseDecrypt();
    await expectCode(() => pendingImport, "IMPORT_STATE_CHANGED");
    assert.equal(liveState, newerState);
    assert.equal(await cryptoApi.withExclusiveImport(() => "lock released"), "lock released");
  }
});

test("rejects oversized, unsupported or invalid imports before replacing live state", async () => {
  const validPassphrase = "a sufficiently long passphrase";
  await expectCode(
    () => cryptoApi.decryptAssessment("x".repeat(1024 * 1024 + 1), validPassphrase, {
      crypto: webcrypto,
      validate: () => true
    }),
    "FILE_TOO_LARGE"
  );
  await expectCode(
    () => cryptoApi.decryptAssessment(JSON.stringify({
      header: { format: "csm-assessment-encrypted", formatVersion: 99 },
      ciphertext: "AA=="
    }), validPassphrase, { crypto: webcrypto, validate: () => true }),
    "UNSUPPORTED_VERSION"
  );
  await expectCode(
    () => cryptoApi.decryptAssessment("{}", validPassphrase, { crypto: webcrypto, validate: () => true }),
    "INVALID_ENVELOPE"
  );
});

test("disables cryptographic operations when Web Crypto is unavailable", async () => {
  const assessment = model.createAssessment({
    domains: domainDefinitions,
    phases: phaseDefinitions,
    frameworkVersion: "1.1.0"
  });
  await expectCode(
    () => cryptoApi.encryptAssessment(assessment, "passphrase", { crypto: null, validate: () => true }),
    "CRYPTO_UNAVAILABLE"
  );
});

test("enforces passphrase bounds without trimming or normalizing Unicode and whitespace", async () => {
  const assessment = model.createAssessment({
    domains: domainDefinitions,
    phases: phaseDefinitions,
    frameworkVersion: "1.1.0"
  });
  await expectCode(
    () => cryptoApi.encryptAssessment(assessment, "fourteen-chars", {
      crypto: webcrypto,
      validate: (candidate) => model.validateAssessment(candidate, domainDefinitions, phaseDefinitions)
    }),
    "INVALID_PASSPHRASE"
  );
  assert.equal(cryptoApi.MIN_PASSPHRASE_CODE_POINTS, 15);
  assert.equal(cryptoApi.MAX_PASSPHRASE_BYTES, 1024);
  await expectCode(
    () => cryptoApi.encryptAssessment(assessment, "🛡".repeat(300), {
      crypto: webcrypto,
      validate: (candidate) => model.validateAssessment(candidate, domainDefinitions, phaseDefinitions)
    }),
    "INVALID_PASSPHRASE"
  );
});

test("assessment page is CSP-safe, accessible by construction and storage-free", () => {
  const html = fs.readFileSync(new URL("assessment.html", root), "utf8");
  const browser = fs.readFileSync(new URL("assessment.js", root), "utf8");
  const cryptoSource = fs.readFileSync(new URL("assessment-crypto.js", root), "utf8");

  assert.match(html, /<html lang="en">/);
  assert.match(html, /connect-src 'none'/);
  assert.match(html, /<h1\b[^>]*>/);
  assert.match(html, /<main id="assessment-workspace" tabindex="-1">/);
  assert.match(
    html,
    /<section[^>]*id="assessmentStartupNotice"(?![^>]*\shidden(?:\s|>|=))[^>]*>[\s\S]*If this message remains visible[\s\S]*No assessment data has been collected or stored[\s\S]*index\.html#matrix-explorer[\s\S]*framework\.html[\s\S]*SOURCE-LIBRARY\.md[\s\S]*59-source library[\s\S]*<\/section>/,
    "The static startup notice must remain useful when JavaScript is disabled or assessment.js is missing."
  );
  assert.match(html, /<div class="assessment-shell assessment-app" data-assessment-app hidden>/);
  assert.match(html, /id="assessmentHeatmap"/);
  assert.match(html, /id="assessmentEditor"/);
  assert.match(html, /id="assessmentStatus"[^>]*role="status"/);
  assert.match(html, /id="assessmentError"[^>]*role="alert"/);
  assert.match(html, /id="assessmentPassphraseConfirmation"/);
  assert.match(html, /Printing creates an unencrypted copy/);
  assert.match(html, /Do not enter personal data, credentials/);
  for (const label of ["0 Exposed", "1 Reactive", "2 Defined", "3 Assured", "4 Adaptive"]) {
    assert.match(`${html}\n${browser}`, new RegExp(label));
  }
  assert.doesNotMatch(`${html}\n${browser}`, /\b(?:Absent|Ad hoc|Managed)\b/);
  assert.match(browser, /calculateConfidence\(cell\.confidence\)[\s\S]*confidence \$\{confidenceValue\} of 100/);
  assert.match(
    browser,
    /file\.size > cryptoApi\.MAX_FILE_BYTES[\s\S]{0,260}elements\.file\.value = "";[\s\S]{0,120}clearPassphrases\(\);/,
    "Oversized imports must clear both passphrase controls before returning."
  );
  const importStart = browser.indexOf("const importEncryptedAssessment");
  const importEnd = browser.indexOf("const resetAssessment", importStart);
  const importSource = browser.slice(importStart, importEnd);
  const orderedImportTokens = [
    "const passphrase = elements.passphrase.value",
    "clearPassphrases();",
    "const file = elements.file.files",
    "const importToken = assessmentImportGuard.capture()",
    "cryptoApi.withExclusiveImport",
    "cryptoApi.decryptAssessment",
    "assessmentImportGuard.assertCurrent(importToken)",
    "assessment = candidate"
  ];
  let previousTokenIndex = -1;
  for (const token of orderedImportTokens) {
    const tokenIndex = importSource.indexOf(token);
    assert.ok(tokenIndex > previousTokenIndex, `Main import must order ${token} after the preceding security boundary.`);
    previousTokenIndex = tokenIndex;
  }
  assert.match(
    importSource,
    /await cryptoApi\.withExclusiveImport\(async \(\) => \{[\s\S]*const candidate = await cryptoApi\.decryptAssessment\([\s\S]*assessmentImportGuard\.assertCurrent\(importToken\);[\s\S]*assessment = candidate;[\s\S]*assessmentImportGuard\.invalidate\(\);[\s\S]*\n\s{8}\}\);/,
    "Main import must decrypt, verify freshness and commit inside one exclusive operation."
  );
  assert.match(browser, /IMPORT_BUSY:\s*cryptoApi\.IMPORT_BUSY_MESSAGE/);
  assert.match(browser, /IMPORT_STATE_CHANGED:\s*cryptoApi\.IMPORT_STATE_CHANGED_MESSAGE/);
  assert.match(browser, /const assessmentImportGuard = cryptoApi\.createImportCommitGuard\(\)/);
  assert.match(browser, /const startupNotice = document\.getElementById\("assessmentStartupNotice"\)/);
  assert.match(
    browser,
    /const showFatalError[\s\S]*errorMessage\.hidden = false;[\s\S]*startupNotice\.hidden = true;[\s\S]*app\.hidden = false;[\s\S]*errorMessage\.focus\(\);/,
    "A loaded main controller must prepare and expose its fatal error before replacing the static notice."
  );
  assert.match(
    browser,
    /app\.hidden = false;\s*startupNotice\.hidden = true;\s*\} catch/,
    "The main app must replace the startup notice only after initialization succeeds."
  );
  assert.equal((browser.match(/startupNotice\.hidden = true;/g) || []).length, 2);
  assert.match(
    browser,
    /const printAssessment = \(\) => \{\s*document\.body\.removeAttribute\("data-print-view"\);\s*globalThis\.print\(\);\s*\};/
  );
  assert.match(browser, /elements\.print\.addEventListener\("click", printAssessment\)/);
  for (const mutation of ["applyCellChanges", "clearSelectedCell", "resetAssessment"]) {
    const mutationStart = browser.indexOf(`const ${mutation}`);
    const mutationEnd = browser.indexOf("};", mutationStart);
    assert.match(
      browser.slice(mutationStart, mutationEnd),
      /assessmentImportGuard\.invalidate\(\)/,
      `${mutation} must invalidate a pending import before that import can commit.`
    );
  }
  assert.match(
    browser,
    /addEventListener\("change",[\s\S]*assessmentImportGuard\.invalidate\(\)[\s\S]*updateEditorScorePreview/
  );
  assert.match(
    browser,
    /addEventListener\("input",[\s\S]*assessmentImportGuard\.invalidate\(\)[\s\S]*updateCharacterCounts/
  );
  assert.match(importSource, /file\.size > cryptoApi\.MAX_FILE_BYTES/);
  assert.doesNotMatch(importSource, /file\.size >= cryptoApi\.MAX_FILE_BYTES/);
  assert.match(html, /assessment-model\.js[\s\S]*assessment-crypto\.js[\s\S]*assessment\.js/);
  assert.doesNotMatch(`${browser}\n${cryptoSource}`, /\b(?:localStorage|sessionStorage|indexedDB)\b/);
  assert.doesNotMatch(`${browser}\n${cryptoSource}`, /\.innerHTML\b/);
  assert.doesNotMatch(browser, /\bfetch\s*\(/);
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
  console.error(`ASSESSMENT VALIDATION FAILED (${failures}/${tests.length})`);
  process.exit(1);
}

console.log(`ASSESSMENT VALIDATION PASSED (${tests.length} tests)`);
