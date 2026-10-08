# Assessment security and privacy threat model

## Status

Proposed design baseline for the `v1.2.0` assessment/export and `v1.4.0` two-snapshot comparison · 2026-08-29. This document records engineering requirements; it is not a security certification, privacy impact assessment or record of human review. Independent human security and privacy review remains an open release gate for each feature release.

## Scope and security objectives

The assessment feature evaluates 45 `domain-slug.phase` cells in a static browser application. It has no account, backend, telemetry or application-managed persistence. The browser holds the working assessment in memory; the user may explicitly print it or download a passphrase-encrypted continuation file. In `v1.4.0`, the user may place two independently selected, decrypted snapshots in memory as baseline and current for a local comparison.

Protect these assets:

- assessment values and free text, which may reveal sensitive weaknesses, priorities or operating conditions;
- the passphrase, derived encryption key and decrypted assessment while they exist in memory;
- the integrity of assessment values, framework/overlay version metadata and cryptographic parameters;
- the availability of the browser tab when it processes an untrusted import;
- the privacy promise that assessment answers do not enter URLs, browser storage, application logs or network requests.

Public matrix and overlay content is not confidential. Nevertheless, its integrity matters because altered guidance could mislead decisions.

## Architecture and trust boundaries

1. **Static origin to browser.** GitHub Pages supplies first-party HTML, CSS, JavaScript and public datasets. A compromised origin or first-party script can read plaintext while the assessment is open; CSP is defence in depth, not protection from an authorised malicious script.
2. **Person to assessment memory.** Numeric values, owner roles and free text cross from the keyboard into JavaScript memory. Treat every string as untrusted and potentially sensitive. Do not request names, evidence attachments or source documents.
3. **Memory to rendered or printed output.** Plaintext crosses into the DOM and, only after an explicit action, the browser/OS print pipeline. Render imported text through `textContent` or equivalent text nodes, never HTML interpretation. OWASP identifies `textContent` as a safe sink for untrusted text.
4. **Passphrase to Web Crypto.** The passphrase crosses into `TextEncoder`, PBKDF2 and a non-extractable AES key. Clear the form control immediately after key derivation and release references after the operation. JavaScript strings and browser key material cannot be guaranteed to be zeroised; the Web Crypto specification explicitly leaves key persistence and zeroisation to the user agent.
5. **Memory to local filesystem.** Export creates a Blob download containing only the encrypted envelope. The chosen filesystem path, backups and synchronisation services are outside the application boundary.
6. **Local filesystem to memory.** A selected `*.csm-assessment.json` file is attacker-controlled until its size, envelope, cryptographic authentication and decrypted payload all pass validation. Import into a temporary object and replace the target slot only after every check succeeds. The later comparison feature applies the same boundary independently to baseline and current.
7. **Browser to network and persistence.** Assessment code must not call `fetch`, XHR, Beacon, WebSocket, form submission, service workers or third-party scripts. It must not use cookies, `localStorage`, `sessionStorage`, IndexedDB, Cache Storage or URL state for answers. Retain the existing `connect-src 'none'`, `form-action 'none'`, `object-src 'none'` and first-party-only script policy.

## Required controls

### Working data and display

- Keep a single in-memory state object for the active tab. Reloading or closing the page irreversibly discards unsaved work.
- Permit URL state only for public view configuration such as `domain`, `view`, `q` and `overlay`. Never serialize assessment values, free text, passphrases, keys or import errors into the query, fragment or History API.
- Bound the model to exactly 45 canonical `domain-slug.phase` cells, for example `personnel-security.identify`. Each score is `null` or an integer from 0 through 4. Limit `criticalGap` and `nextAction` to 500 Unicode code points each and `ownerRole` to 120 Unicode code points. Reject excess input rather than silently truncating it.
- Label free-text fields as potentially sensitive. Advise users not to enter personal data, credentials, exploit details or information that would create risk if displayed.
- Use text-only DOM sinks for all user/imported strings. The existing CSP remains required and must not be relaxed to enable the feature.
- Do not place plaintext in console messages, error reports or test snapshots. User-facing failures identify the failed stage without echoing submitted content.
- Comparison keeps at most two validated snapshots in memory. It does not retain source filenames or either passphrase, and it does not infer authorship or whether a snapshot is truly “current” from its filename or timestamp.

### Passphrase and encryption

- Require a passphrase of at least 15 Unicode code points and no more than 1,024 UTF-8 bytes; allow spaces and all Unicode characters, do not silently trim or normalise, and require exact confirmation on export. The upper bound prevents disproportionate KDF input work. OWASP treats passwords shorter than 15 characters without MFA as weak and recommends allowing passphrases and Unicode.
- Derive a non-extractable 256-bit AES-GCM key directly with PBKDF2-HMAC-SHA-256, exactly 600,000 iterations and a fresh 16-byte salt from `crypto.getRandomValues` for every export.
- Encrypt with AES-256-GCM, a fresh 12-byte IV from `crypto.getRandomValues`, a 128-bit authentication tag and authenticated additional data (AAD) covering the full visible header. A fresh salt yields a new derived key on every export; an IV must never be reused with the same key.
- Use only the browser's native Web Crypto implementation. If `crypto.subtle`, `TextEncoder` or secure randomness is unavailable, assessment and print remain usable, but export and import are disabled with a clear explanation.
- The application must never persist or log the passphrase or derived key. A browser or password manager may independently offer to save a form value, so the interface must not claim that no software can store it and should tell the user to check that behaviour. Do not implement application recovery, escrow, a hint or a back door. A forgotten passphrase that was not separately retained means the encrypted file is permanently unrecoverable.
- Explain that encryption does not compensate for a weak/reused passphrase or a compromised browser, extension, device, first-party origin or unlocked screen.

### Envelope and atomic import

The format and canonical AAD construction are defined in [ADR-0001](decisions/0001-local-assessment-and-encrypted-export.md). Before any expensive operation:

- reject a file whose `File.size` exceeds 1 MiB;
- parse JSON once, require the exact top-level structure and reject unknown format versions or properties;
- require the fixed version-1 algorithm identifiers, key/tag lengths and exactly 600,000 iterations instead of accepting attacker-selected KDF cost;
- decode strict canonical Base64 and require a 16-byte salt, 12-byte IV and ciphertext long enough to contain the 16-byte GCM tag;
- permit only one import/decrypt operation at a time;
- return one generic authentication error for a wrong passphrase, altered header, altered IV/salt or altered ciphertext;
- after authenticated decryption, decode UTF-8 fatally, validate the complete assessment schema and size limits into a temporary object, then atomically swap state;
- leave the current assessment untouched after every rejection.

For two-snapshot comparison, each file independently passes the same 1 MiB envelope, AEAD and plaintext-schema checks before entering its named memory slot. A failed baseline import leaves the prior baseline untouched; the same applies to current. Compute or render deltas only when both slots contain compatible, fully validated snapshots. Never retain the selected filenames or passphrases, and never write snapshots or derived comparison results to URL, browser storage or network.

### Print and local disclosure

- Printing is an explicit user action and uses only current in-memory data. Do not auto-open the print dialog or encode the report in a route.
- Before printing, warn that paper, Save as PDF, browser print preview, OS spooling and managed printers can create unencrypted copies outside the application's control.
- A comparison report can disclose both original values and derived changes. Apply the same explicit-print warning and plaintext handling to it; do not treat a delta as less sensitive than its inputs.
- The interface cannot prevent shoulder surfing, screenshots, browser extensions, local malware or an unlocked shared device. Keep sensitive detail collapsible outside the report, provide a clear assessment action, and instruct users to lock their screen and handle exports/printouts under organisational policy.

## STRIDE analysis

| ID | STRIDE | Abuse case | Required mitigation | Residual risk |
| --- | --- | --- | --- | --- |
| S1 | Spoofing | A file is presented as an assessment authored or approved by someone else. | Show framework/overlay version and assessment timestamps, but never claim author identity, signature or approval. | AES-GCM authenticates possession of the passphrase, not a person or organisation. Provenance remains unverified. |
| S2 | Spoofing | Files are placed in the wrong baseline/current slots or a timestamp is treated as proof of chronology. | Require an explicit slot choice, label both internal timestamps and versions, and do not infer provenance or chronology from filename. | The user remains responsible for choosing the intended snapshots. |
| T1 | Tampering | An attacker changes the envelope, KDF/cipher parameters or ciphertext. | Strict header allowlist; rebuild canonical AAD; AES-GCM with a 128-bit tag; generic failure; atomic import. | Anyone who knows the passphrase can create a different valid file. |
| T2 | Tampering / EoP | Imported strings attempt DOM/script execution or corrupt canonical IDs. | Strict payload schema and ID allowlists; render only through safe text sinks; preserve strict CSP; imported data never selects executable code or URLs. | Compromise of an allowed first-party script defeats browser-only controls. |
| R1 | Repudiation | A participant denies changing a score or action. | State explicitly that there is no identity, audit trail or non-repudiation; snapshots are user-managed files. | The tool cannot settle authorship or change-history disputes. |
| I1 | Information disclosure | Answers leak through URL/history, storage, logs or network traffic. | Prohibit answer URL state and all application storage/network APIs; retain `connect-src 'none'`; never log plaintext. | The ordinary page URL may appear in browser history or hosting logs, but assessment fields never enter that URL. |
| I2 | Information disclosure | A stolen encrypted file is attacked offline. | 600,000-iteration PBKDF2, unique 128-bit salt, AES-256-GCM and minimum passphrase guidance. | Weak or reused passphrases remain guessable; there is no online rate limit for an offline file. |
| I3 | Information disclosure | Plaintext is seen on screen, in memory, in a screenshot or through printing. | Clear warnings, explicit print action, collapsible details, clear-state action and no automatic persistence. | A hostile extension, local malware, privileged user, camera, print spooler or shoulder surfer is out of scope. |
| I4 | Information disclosure | Comparison doubles the exposed plaintext or leaks sensitive deltas. | Hold no more than two validated snapshots, retain no filenames/passphrases, keep deltas memory-only and protect comparison print exactly like a full assessment. | A person viewing the screen/report may infer information not obvious in either snapshot alone. |
| D1 | Denial of service | A large/malformed file, hostile KDF count or repeated imports freeze the tab. | 1 MiB pre-read cap, exact fixed crypto parameters, strict bounded schema and one in-flight operation. | PBKDF2 intentionally consumes CPU; slower supported devices may experience delay. Benchmark before release. |
| D2 | Denial of service | Extremely large free text grows memory or export cost. | Enforce per-field Unicode code-point limits and the fixed 45-cell model at input and import boundaries. | Browser memory pressure outside these bounds remains user-agent dependent. |
| E1 | Elevation of privilege | Imported content attempts to gain capabilities or initiate communication. | Imported data is inert values only; no dynamic code, HTML, arbitrary URLs, workers, forms or network; CSP remains restrictive. | There are no application roles to elevate. Device/origin compromise is outside this model. |

## Security and privacy acceptance cases

- Export then import with the correct passphrase reproduces the complete assessment and version metadata.
- A wrong passphrase, one-bit ciphertext/header/IV/salt change and malformed GCM tag all fail without changing live state or revealing which check failed.
- A 1 MiB file is processed; a file of 1 MiB plus one byte is rejected before reading or KDF work.
- Unknown envelope/payload versions, extra properties, non-canonical IDs, out-of-range scores, overlong text, invalid Base64 and invalid UTF-8 are rejected atomically.
- Import cannot choose algorithms, iteration count, key length or tag length.
- Two exports of identical state and passphrase have different salts, IVs and ciphertext and both decrypt correctly.
- Assessment values never appear in `location.href`, history entries, Web Storage, IndexedDB, Cache Storage, cookies, network requests, console output or analytics.
- Imported XSS payloads display as text. Runtime and static checks find no unsafe DOM sink.
- Export/import controls are unavailable without Web Crypto, while assessment and print remain functional.
- Printing requires an explicit action and displays the unencrypted-copy warning.
- Clearing, reloading and closing behave as documented; no recovery claim is made for forgotten passphrases or discarded memory.
- Baseline and current imports are independent and atomic; swapping slot labels is explicit, a failed replacement preserves its prior slot, and no filename or passphrase is retained.
- Comparison produces no URL, browser-storage or network write, and its print path carries the same unencrypted-copy warning.
- Independent human security and privacy reviewers approve the implemented release; this proposed document alone cannot close that gate.

## Authoritative references

- [W3C Web Cryptography Level 2](https://www.w3.org/TR/webcrypto/) defines `getRandomValues`, PBKDF2, AES-GCM, AAD and the API's key-handling limitations.
- [W3C Cryptography Usage in Web Standards](https://www.w3.org/TR/security-guidelines-cryptography/) recommends authenticated encryption such as AES-GCM and describes PBKDF2.
- [OWASP Cryptographic Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html) recommends authenticated modes, AES with an ideally 256-bit key and secure randomness.
- [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html#pbkdf2) records the 600,000-iteration PBKDF2-HMAC-SHA-256 work factor used by this dependency-free Web Crypto design.
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html#implement-proper-password-strength-controls) informs passphrase length, Unicode and non-truncation rules.
- [OWASP File Upload Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html#file-upload-protection) supports allowlisting, content validation and size limits for untrusted files.
- [OWASP HTML5 Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html#storage-apis) explains why sensitive information is not put in browser storage.
- [OWASP Cross Site Scripting Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html#safe-sinks) identifies `textContent` and text nodes as safe DOM sinks.
- [W3C Content Security Policy Level 3](https://www.w3.org/TR/CSP3/) defines the restrictive directives retained as defence in depth.
