# ADR-0001: Keep assessments local and use passphrase-encrypted exports

## Status

Proposed for the `v1.2.0` assessment/export and `v1.4.0` two-snapshot comparison · 2026-08-29. This ADR is not yet an implementation or human approval record. Independent human security and privacy review remains an open release gate.

## Context

Assessment data may describe consequential organisational weaknesses. The project must remain a dependency-free static GitHub Pages application with no account, backend, analytics or automatic browser persistence. Users still need an intentional way to pause work and continue later.

The later comparison capability needs baseline and current snapshots without creating history, synchronisation or a hidden cache. The same import boundary must therefore serve both continuation and comparison.

Native Web Crypto supports PBKDF2 and AES-GCM. W3C recommends authenticated encryption such as AES-GCM; OWASP prefers authenticated modes and AES with an ideally 256-bit key. OWASP recommends Argon2id for password hashing, but it is not a native Web Crypto algorithm and adding a cryptographic runtime dependency would violate the project's runtime constraint. OWASP records PBKDF2-HMAC-SHA-256 at 600,000 iterations, which is available natively.

## Decision

Keep the active assessment only in the current page's JavaScript memory. Never send or automatically persist it. Provide explicit local export/import using the browser's native Web Crypto API and an encrypted JSON envelope.

Version 1 uses:

- AES-256-GCM with a 128-bit tag;
- PBKDF2-HMAC-SHA-256 with exactly 600,000 iterations;
- a fresh 16-byte random salt and 12-byte random IV for every export;
- a non-extractable derived key with only the required `encrypt` or `decrypt` usage;
- UTF-8 for the passphrase, AAD and plaintext JSON;
- canonical padded Base64 for binary JSON fields;
- a hard 1 MiB encrypted-file limit.

The visible envelope has exactly two top-level fields. The fixed-order `header` is:

```json
{
  "header": {
    "format": "csm-assessment-encrypted",
    "formatVersion": 1,
    "contentType": "application/vnd.csm.assessment+json",
    "schemaVersion": 1,
    "kdf": {
      "name": "PBKDF2",
      "hash": "SHA-256",
      "iterations": 600000,
      "salt": "<base64, 16 bytes>"
    },
    "cipher": {
      "name": "AES-GCM",
      "keyLength": 256,
      "tagLength": 128,
      "iv": "<base64, 12 bytes>"
    }
  },
  "ciphertext": "<base64>"
}
```

The exporter encodes `JSON.stringify(header)` as AES-GCM `additionalData`. The importer does not trust property order from the file: after strict validation, it rebuilds the same fixed-order header from validated values and derives AAD from that object. Salt and IV are included in the authenticated header; they also participate directly in derivation/encryption. The Web Crypto ciphertext contains the appended GCM authentication tag.

The encrypted plaintext has exact top-level fields `{schema, schemaVersion, frameworkVersion, overlay, createdAt, updatedAt, cells}`. `schema` is `"csm-assessment"`, `schemaVersion` is `1`, and `overlay` is `null` or exactly `{id, version}`. `cells` contains exactly 45 canonical `domain-slug.phase` records, for example `personnel-security.identify`; each cell is exactly `{maturity, confidence, criticalGap, nextAction, ownerRole}`. No framework version, overlay selection, timestamp or assessment value is exposed outside the ciphertext.

Import is fail-closed and atomic: check `File.size`, parse and validate the fixed envelope, authenticate/decrypt, fatally decode UTF-8, then validate the complete plaintext into a temporary object. Only a fully valid object may replace live state. Unknown versions and properties are rejected. A wrong passphrase and any authenticated-data or ciphertext change return the same generic failure.

The application neither stores nor recovers the passphrase. A browser or password manager may independently offer to save the form value, so the interface states that distinction and tells the user to keep the passphrase separately. Inputs accept Unicode and spaces without trimming or normalisation, require at least 15 Unicode code points, cap the UTF-8 representation at 1,024 bytes and require confirmation during export. Release references to the passphrase and `CryptoKey` after use, while acknowledging that JavaScript and the browser do not guarantee memory zeroisation.

If Web Crypto is missing, users can still assess and print, but export/import is unavailable. Printing is explicit and warns that it creates an unencrypted copy outside the application boundary.

For `v1.4.0`, comparison has two named in-memory slots, baseline and current. Each independently accepts only the same encrypted format and completes all size, envelope, AEAD and plaintext validation before atomically replacing that slot. No source filename or passphrase survives the import operation. Comparison begins only when both snapshots are compatible and valid; derived deltas remain in memory and are subject to the same URL, storage, network and print restrictions as the source assessments.

## Alternatives considered

### Browser storage

Rejected. `localStorage`, `sessionStorage`, IndexedDB and Cache Storage expand persistence and XSS exposure, weaken the clear-on-close mental model and conflict with the locked privacy posture.

### Plain JSON export

Rejected. A file, backup or sync copy would expose assessment data without any confidentiality control.

### Backend accounts and server-side storage

Rejected for v1.x. This would add identity, authorisation, retention, deletion, tenant isolation, breach and operational obligations that have not passed the `v2.0` decision gate.

### Argon2id through a JavaScript/Wasm dependency

Deferred. It offers memory-hard password derivation and OWASP prefers it, but native Web Crypto does not expose it. A new cryptographic dependency conflicts with the dependency-free runtime and creates supply-chain and compatibility work. Reconsider only through a superseding ADR.

### Browser-managed key or recovery service

Rejected. Persistent keys or escrow would undermine portability and the no-storage/no-backend boundary. Forgotten-passphrase recovery is intentionally unavailable.

### Envelope encryption with a separate random data key

Deferred. Directly deriving a fresh key with a fresh salt is sufficient for one small standalone file. A DEK/KEK structure adds format and key-wrapping complexity without enabling server-side rotation or key custody in this architecture.

## Consequences

- Plaintext exists on screen and in browser memory during use; this is not protection from a compromised origin, browser extension, OS, device or shoulder surfing.
- A strong passphrase protects a stolen export, but a weak/reused passphrase remains susceptible to offline guessing. There is no meaningful client-side rate limit against an attacker who owns the file.
- Lost passphrases and unsaved in-memory work are unrecoverable. The UI and documentation must state this before export and clear/reload actions.
- Two-snapshot comparison temporarily doubles plaintext exposure and may reveal sensitive trends. It retains at most two snapshots, no filenames or passphrases, and cannot establish their authorship or chronology.
- Every format or crypto-policy change requires a new `formatVersion` and migration decision; import never guesses compatibility.
- Cryptographic work may be noticeable on slower devices. Benchmark 600,000 PBKDF2 iterations across supported browsers and keep the UI responsive before release; do not accept a file-controlled iteration count.
- The full security and privacy requirements and acceptance cases live in [the assessment threat model](../ASSESSMENT-THREAT-MODEL.md).
- This ADR and automated tests do not close the required independent human security and privacy release review.

## Authoritative references

- [W3C Web Cryptography Level 2](https://www.w3.org/TR/webcrypto/)
- [W3C Cryptography Usage in Web Standards](https://www.w3.org/TR/security-guidelines-cryptography/)
- [OWASP Cryptographic Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html)
- [OWASP Password Storage Cheat Sheet — PBKDF2](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html#pbkdf2)
- [OWASP HTML5 Security Cheat Sheet — Storage APIs](https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html#storage-apis)
- [OWASP File Upload Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html)
