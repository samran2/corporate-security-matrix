# Security Best Practices Report

Audit date: March 31, 2026

## Executive summary

No critical or high-severity frontend findings were identified in the repository. The project is a static site with no user input handling, no third-party JavaScript, no browser storage and no dynamic HTML injection. The main residual risk is deployment-layer: GitHub Pages cannot enforce every browser protection through repository code alone.

## Findings

### SBP-001

- Severity: Medium
- Title: Meta-delivered CSP cannot enforce all protections on GitHub Pages
- Location: `index.html`, `SECURITY.md`
- Evidence: the project uses a meta-delivered `Content-Security-Policy`, and the security documentation explicitly notes that response-header protections such as `frame-ancestors`, `sandbox` and reporting directives remain hosting-layer concerns.
- Impact: if the site is hosted only on GitHub Pages, some anti-clickjacking and CSP reporting protections cannot be fully enforced from repository code alone.
- Fix: if the project is fronted by a CDN, reverse proxy or custom host, configure `Content-Security-Policy`, `frame-ancestors` or `X-Frame-Options`, `X-Content-Type-Options: nosniff`, and an explicit `Referrer-Policy` as HTTP response headers.
- Mitigation: keep the site static, avoid user input, avoid third-party scripts, and preserve the current CSP-safe rendering model.
- False positive notes: this is a real deployment limitation, not a code-execution bug in the repository itself.

## Positive controls verified

- `index.html` defines CSP, referrer policy and publication metadata without inline scripts.
- `index.html` uses `target="_blank"` together with `rel="noopener noreferrer"` for external hero links.
- `app.js` applies `target="_blank"` and `rel="noopener noreferrer"` to generated reference links.
- `app.js` uses event listeners for UI behavior rather than string event handlers.
- `scripts/validate_project.py` enforces file presence, CSP presence, safe external link markup, forbidden sink scanning and external URL validation.

## Checks executed

- `node --check matrix-domains.js`
- `node --check matrix-actors.js`
- `node --check matrix-briefs.js`
- `node --check matrix-references.js`
- `node --check app.js`
- `python3 -m py_compile scripts/validate_project.py`
- `python3 scripts/validate_project.py`
- local static smoke test with `python3 -m http.server` plus `curl -fI` checks for `index.html`, `matrix-domains.js`, `matrix-actors.js`, `matrix-briefs.js`, `matrix-references.js`, `app.js` and `styles.css`
- manual scan for dangerous frontend sinks such as `innerHTML`, `document.write`, `eval`, string timers and browser storage APIs

## Conclusion

The repository is suitable for public publication as a low-risk static project. The remaining work after publication is operational, not code-level: keep validation running, rerun source verification before major releases, and use header-based browser protections if the site is later fronted by infrastructure beyond plain GitHub Pages.
