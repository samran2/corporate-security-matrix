"use strict";

((root) => {
  const ENCRYPTED_FORMAT = "csm-assessment-encrypted";
  const ENCRYPTED_FORMAT_VERSION = 1;
  const ASSESSMENT_SCHEMA_VERSION = 1;
  const CONTENT_TYPE = "application/vnd.csm.assessment+json";
  const PBKDF2_ITERATIONS = 600000;
  const SALT_BYTES = 16;
  const IV_BYTES = 12;
  const AES_KEY_BITS = 256;
  const GCM_TAG_BITS = 128;
  const MAX_FILE_BYTES = 1024 * 1024;
  const MIN_PASSPHRASE_CODE_POINTS = 15;
  const MAX_PASSPHRASE_BYTES = 1024;
  const IMPORT_BUSY_MESSAGE = "Another encrypted assessment import is already in progress. Wait for it to finish and try again.";
  const IMPORT_STATE_CHANGED_MESSAGE = "In-memory assessment data changed while the encrypted file was loading. The import was cancelled and the newer state was kept.";
  const HEADER_KEYS = Object.freeze([
    "format",
    "formatVersion",
    "contentType",
    "schemaVersion",
    "kdf",
    "cipher"
  ]);
  const KDF_KEYS = Object.freeze(["name", "hash", "iterations", "salt"]);
  const CIPHER_KEYS = Object.freeze(["name", "keyLength", "tagLength", "iv"]);
  let importInProgress = false;

  class AssessmentCryptoError extends Error {
    constructor(code, message) {
      super(message);
      this.name = "AssessmentCryptoError";
      this.code = code;
    }
  }

  const fail = (code, message) => {
    throw new AssessmentCryptoError(code, message);
  };

  const withExclusiveImport = async (operation) => {
    if (typeof operation !== "function") {
      fail("INVALID_IMPORT_OPERATION", "An encrypted assessment import operation is required.");
    }
    if (importInProgress) fail("IMPORT_BUSY", IMPORT_BUSY_MESSAGE);
    importInProgress = true;
    try {
      return await operation();
    } finally {
      importInProgress = false;
    }
  };

  const createImportCommitGuard = () => {
    let generation = Symbol("assessment import generation");
    return Object.freeze({
      capture: () => generation,
      invalidate: () => {
        generation = Symbol("assessment import generation");
      },
      assertCurrent: (token) => {
        if (token !== generation) fail("IMPORT_STATE_CHANGED", IMPORT_STATE_CHANGED_MESSAGE);
      }
    });
  };

  const isPlainObject = (value) => {
    if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
  };

  const hasExactKeys = (value, expected) => {
    if (!isPlainObject(value)) return false;
    const actual = Object.keys(value).sort();
    const wanted = [...expected].sort();
    return actual.length === wanted.length && actual.every((key, index) => key === wanted[index]);
  };

  const getEncoder = () => new TextEncoder();
  const utf8Length = (value) => getEncoder().encode(value).byteLength;

  const bytesToBase64 = (bytes) => {
    let binary = "";
    const chunkSize = 0x8000;
    for (let index = 0; index < bytes.length; index += chunkSize) {
      binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
    }
    if (typeof root.btoa === "function") return root.btoa(binary);
    if (typeof Buffer !== "undefined") return Buffer.from(bytes).toString("base64");
    fail("CRYPTO_UNAVAILABLE", "This environment cannot encode an encrypted assessment.");
  };

  const base64ToBytes = (value, field) => {
    if (
      typeof value !== "string" ||
      value.length === 0 ||
      value.length % 4 !== 0 ||
      !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(value)
    ) {
      fail("INVALID_ENVELOPE", `${field} is not canonical base64.`);
    }

    let binary;
    try {
      if (typeof root.atob === "function") binary = root.atob(value);
      else if (typeof Buffer !== "undefined") binary = Buffer.from(value, "base64").toString("binary");
      else fail("CRYPTO_UNAVAILABLE", "This environment cannot decode an encrypted assessment.");
    } catch {
      fail("INVALID_ENVELOPE", `${field} is not valid base64.`);
    }
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    if (bytesToBase64(bytes) !== value) fail("INVALID_ENVELOPE", `${field} is not canonical base64.`);
    return bytes;
  };

  const isWebCryptoAvailable = (provider = root.crypto) => Boolean(
    provider &&
    provider.subtle &&
    typeof provider.getRandomValues === "function" &&
    typeof provider.subtle.importKey === "function" &&
    typeof provider.subtle.deriveKey === "function" &&
    typeof provider.subtle.encrypt === "function" &&
    typeof provider.subtle.decrypt === "function"
  );

  const requireCrypto = (provider) => {
    if (!isWebCryptoAvailable(provider)) {
      fail("CRYPTO_UNAVAILABLE", "Encrypted save and import require the Web Crypto API.");
    }
    return provider;
  };

  const validatePassphrase = (passphrase) => {
    if (typeof passphrase !== "string" || Array.from(passphrase).length < MIN_PASSPHRASE_CODE_POINTS) {
      fail("INVALID_PASSPHRASE", `The passphrase must contain at least ${MIN_PASSPHRASE_CODE_POINTS} characters.`);
    }
    if (utf8Length(passphrase) > MAX_PASSPHRASE_BYTES) {
      fail("INVALID_PASSPHRASE", `The passphrase must be no more than ${MAX_PASSPHRASE_BYTES} UTF-8 bytes.`);
    }
    return passphrase;
  };

  const createHeader = (salt, iv) => ({
    format: ENCRYPTED_FORMAT,
    formatVersion: ENCRYPTED_FORMAT_VERSION,
    contentType: CONTENT_TYPE,
    schemaVersion: ASSESSMENT_SCHEMA_VERSION,
    kdf: {
      name: "PBKDF2",
      hash: "SHA-256",
      iterations: PBKDF2_ITERATIONS,
      salt: bytesToBase64(salt)
    },
    cipher: {
      name: "AES-GCM",
      keyLength: AES_KEY_BITS,
      tagLength: GCM_TAG_BITS,
      iv: bytesToBase64(iv)
    }
  });

  const canonicalizeHeader = (header) => JSON.stringify({
    format: header.format,
    formatVersion: header.formatVersion,
    contentType: header.contentType,
    schemaVersion: header.schemaVersion,
    kdf: {
      name: header.kdf.name,
      hash: header.kdf.hash,
      iterations: header.kdf.iterations,
      salt: header.kdf.salt
    },
    cipher: {
      name: header.cipher.name,
      keyLength: header.cipher.keyLength,
      tagLength: header.cipher.tagLength,
      iv: header.cipher.iv
    }
  });

  const validateHeader = (header) => {
    if (!isPlainObject(header)) fail("INVALID_ENVELOPE", "The encrypted assessment header is missing.");
    if (header.format === ENCRYPTED_FORMAT && header.formatVersion !== ENCRYPTED_FORMAT_VERSION) {
      fail("UNSUPPORTED_VERSION", "This encrypted assessment format version is not supported.");
    }
    if (header.schemaVersion !== undefined && header.schemaVersion !== ASSESSMENT_SCHEMA_VERSION) {
      fail("UNSUPPORTED_VERSION", "This encrypted assessment schema version is not supported.");
    }
    if (
      !hasExactKeys(header, HEADER_KEYS) ||
      !hasExactKeys(header.kdf, KDF_KEYS) ||
      !hasExactKeys(header.cipher, CIPHER_KEYS)
    ) {
      fail("INVALID_ENVELOPE", "The encrypted assessment header contains missing or unknown fields.");
    }
    if (
      header.format !== ENCRYPTED_FORMAT ||
      header.formatVersion !== ENCRYPTED_FORMAT_VERSION ||
      header.contentType !== CONTENT_TYPE ||
      header.schemaVersion !== ASSESSMENT_SCHEMA_VERSION ||
      header.kdf.name !== "PBKDF2" ||
      header.kdf.hash !== "SHA-256" ||
      header.kdf.iterations !== PBKDF2_ITERATIONS ||
      header.cipher.name !== "AES-GCM" ||
      header.cipher.keyLength !== AES_KEY_BITS ||
      header.cipher.tagLength !== GCM_TAG_BITS
    ) {
      fail("INVALID_ENVELOPE", "The encrypted assessment uses unsupported cryptographic parameters.");
    }
    const salt = base64ToBytes(header.kdf.salt, "header.kdf.salt");
    const iv = base64ToBytes(header.cipher.iv, "header.cipher.iv");
    if (salt.byteLength !== SALT_BYTES) fail("INVALID_ENVELOPE", `The PBKDF2 salt must be ${SALT_BYTES} bytes.`);
    if (iv.byteLength !== IV_BYTES) fail("INVALID_ENVELOPE", `The AES-GCM IV must be ${IV_BYTES} bytes.`);
    return { salt, iv };
  };

  const deriveKey = async (passphrase, salt, provider, usage) => {
    const baseKey = await provider.subtle.importKey(
      "raw",
      getEncoder().encode(passphrase),
      { name: "PBKDF2" },
      false,
      ["deriveKey"]
    );
    return provider.subtle.deriveKey(
      { name: "PBKDF2", hash: "SHA-256", salt, iterations: PBKDF2_ITERATIONS },
      baseKey,
      { name: "AES-GCM", length: AES_KEY_BITS },
      false,
      [usage]
    );
  };

  const validatePlaintext = (assessment, validate) => {
    if (typeof validate !== "function") {
      fail("INVALID_ASSESSMENT", "An assessment validator is required at the cryptographic boundary.");
    }
    try {
      validate(assessment);
    } catch {
      fail("INVALID_ASSESSMENT", "The decrypted assessment does not match the supported schema.");
    }
    return assessment;
  };

  // Sources:
  // https://www.w3.org/TR/webcrypto/#aes-gcm
  // https://www.w3.org/TR/security-guidelines-cryptography/#authenticated-encryption
  // https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html#pbkdf2
  // https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html#implement-proper-password-strength-controls
  const encryptAssessment = async (assessment, passphrase, options = {}) => {
    const provider = requireCrypto(options.crypto === undefined ? root.crypto : options.crypto);
    validatePassphrase(passphrase);
    validatePlaintext(assessment, options.validate);

    const plaintext = getEncoder().encode(JSON.stringify(assessment));
    if (plaintext.byteLength > MAX_FILE_BYTES) {
      fail("FILE_TOO_LARGE", "The assessment is too large to export safely.");
    }
    const salt = provider.getRandomValues(new Uint8Array(SALT_BYTES));
    const iv = provider.getRandomValues(new Uint8Array(IV_BYTES));
    const header = createHeader(salt, iv);
    const additionalData = getEncoder().encode(canonicalizeHeader(header));
    const key = await deriveKey(passphrase, salt, provider, "encrypt");
    const encrypted = await provider.subtle.encrypt(
      { name: "AES-GCM", iv, additionalData, tagLength: GCM_TAG_BITS },
      key,
      plaintext
    );
    const envelope = { header, ciphertext: bytesToBase64(new Uint8Array(encrypted)) };
    if (utf8Length(JSON.stringify(envelope)) > MAX_FILE_BYTES) {
      fail("FILE_TOO_LARGE", "The encrypted assessment exceeds the 1 MiB file limit.");
    }
    return envelope;
  };

  const parseEnvelope = (serialized) => {
    if (typeof serialized !== "string") fail("INVALID_ENVELOPE", "The encrypted assessment must be UTF-8 JSON text.");
    if (utf8Length(serialized) > MAX_FILE_BYTES) {
      fail("FILE_TOO_LARGE", "Encrypted assessment files may not exceed 1 MiB.");
    }
    let envelope;
    try {
      envelope = JSON.parse(serialized);
    } catch {
      fail("INVALID_ENVELOPE", "The encrypted assessment is not valid JSON.");
    }
    if (!hasExactKeys(envelope, ["header", "ciphertext"])) {
      fail("INVALID_ENVELOPE", "The encrypted assessment envelope contains missing or unknown fields.");
    }
    const parameters = validateHeader(envelope.header);
    const ciphertext = base64ToBytes(envelope.ciphertext, "ciphertext");
    if (ciphertext.byteLength <= GCM_TAG_BITS / 8) {
      fail("INVALID_ENVELOPE", "The encrypted assessment ciphertext is empty or truncated.");
    }
    return { envelope, parameters, ciphertext };
  };

  const decryptAssessment = async (serialized, passphrase, options = {}) => {
    const provider = requireCrypto(options.crypto === undefined ? root.crypto : options.crypto);
    validatePassphrase(passphrase);
    const { envelope, parameters, ciphertext } = parseEnvelope(serialized);
    const additionalData = getEncoder().encode(canonicalizeHeader(envelope.header));
    const key = await deriveKey(passphrase, parameters.salt, provider, "decrypt");

    let plaintext;
    try {
      plaintext = await provider.subtle.decrypt(
        {
          name: "AES-GCM",
          iv: parameters.iv,
          additionalData,
          tagLength: GCM_TAG_BITS
        },
        key,
        ciphertext
      );
    } catch {
      fail("DECRYPTION_FAILED", "Unable to decrypt the assessment. The passphrase is incorrect or the file was changed.");
    }

    let assessment;
    try {
      assessment = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(plaintext));
    } catch {
      fail("INVALID_ASSESSMENT", "The decrypted assessment is not valid UTF-8 JSON.");
    }
    return validatePlaintext(assessment, options.validate);
  };

  const serializeEncryptedAssessment = (envelope) => {
    const serialized = JSON.stringify(envelope, null, 2);
    parseEnvelope(serialized);
    return `${serialized}\n`;
  };

  const api = Object.freeze({
    AES_KEY_BITS,
    ASSESSMENT_SCHEMA_VERSION,
    CONTENT_TYPE,
    ENCRYPTED_FORMAT,
    ENCRYPTED_FORMAT_VERSION,
    GCM_TAG_BITS,
    IMPORT_BUSY_MESSAGE,
    IMPORT_STATE_CHANGED_MESSAGE,
    IV_BYTES,
    MAX_FILE_BYTES,
    MIN_PASSPHRASE_CODE_POINTS,
    MAX_PASSPHRASE_BYTES,
    PBKDF2_ITERATIONS,
    SALT_BYTES,
    AssessmentCryptoError,
    canonicalizeHeader,
    createImportCommitGuard,
    decryptAssessment,
    encryptAssessment,
    isWebCryptoAvailable,
    parseEnvelope,
    serializeEncryptedAssessment,
    withExclusiveImport
  });

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.AssessmentCrypto = api;
})(typeof globalThis === "undefined" ? this : globalThis);
