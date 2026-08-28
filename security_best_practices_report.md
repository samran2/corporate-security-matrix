# Security Best Practices Report

Audit date: August 28, 2026

## Executive summary

No critical or high-severity frontend findings were identified in the repository. The project is a static site with no third-party JavaScript, browser storage or dynamic HTML injection. Search input stays in memory and the URL, is rendered only through `textContent`, and is never submitted. The main residual risk is deployment-layer: GitHub Pages cannot enforce every browser protection through repository code alone.

## Findings

### SBP-001

- Severity: Medium
- Title: Meta-delivered CSP cannot enforce all protections on GitHub Pages
- Location: `index.html`, `SECURITY.md`
- Evidence: the project uses a meta-delivered `Content-Security-Policy`, and the security documentation explicitly notes that response-header protections such as `frame-ancestors`, `sandbox` and reporting directives remain hosting-layer concerns.
- Impact: if the site is hosted only on GitHub Pages, some anti-clickjacking and CSP reporting protections cannot be fully enforced from repository code alone.
- Fix: if the project is fronted by a CDN, reverse proxy or custom host, configure `Content-Security-Policy`, `frame-ancestors` or `X-Frame-Options`, `X-Content-Type-Options: nosniff`, and an explicit `Referrer-Policy` as HTTP response headers.
- Mitigation: keep the site static, avoid submitted or persisted user data, avoid third-party scripts, and preserve the current CSP-safe rendering model.
- False positive notes: this is a real deployment limitation, not a code-execution bug in the repository itself.

## Positive controls verified

- Every public HTML document defines CSP and a referrer policy without inline scripts.
- Public documents provide canonical, social-sharing and icon metadata where applicable.
- Static and generated `target="_blank"` links use `rel="noopener noreferrer"`.
- `app.js` applies `target="_blank"` and `rel="noopener noreferrer"` to generated reference links.
- `app.js` uses event listeners and `textContent` rather than string event handlers or HTML injection.
- URL state is validated against known domain and view identifiers before use.
- `scripts/validate_project.py` enforces file presence, internal-link integrity, ARIA relationships, CSP presence, safe external-link markup, forbidden-sink scanning, data validation and optional external URL validation.
- GitHub Actions are pinned to immutable commit SHAs and use least-privilege permissions for validation and deployment.

## Checks executed

- `node --check matrix-domains.js`
- `node --check matrix-actors.js`
- `node --check matrix-briefs.js`
- `node --check matrix-references.js`
- `node --check app.js`
- `node scripts/validate_data.mjs`
- `python3 -m py_compile scripts/validate_project.py`
- `python3 scripts/validate_project.py`
- `python3 scripts/validate_project.py --check-links`
- manual scan for dangerous frontend sinks such as `innerHTML`, `document.write`, `eval`, string timers and browser storage APIs

## Conclusion

The repository is suitable for public publication as a low-risk static project. Keep validation running, review sources before major releases, and add header-based browser protections if the site is later fronted by infrastructure beyond plain GitHub Pages.
