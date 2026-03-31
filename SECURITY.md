# Security Policy

This repository is a static knowledge project, not a software product with a runtime attack surface.

## Current hardening

The published site is intended to stay secure by default:

- no third-party JavaScript
- no user input processing
- no `innerHTML`, `eval`, string timers or browser storage
- no external font or asset dependency required for rendering
- Content Security Policy delivered via HTML meta tag for static hosting compatibility
- external links opened with `noopener noreferrer`
- repository validation script at `scripts/validate_project.py`
- GitHub Actions validation workflow at `.github/workflows/validate.yml`

## Runtime checks still required

Some browser protections are stronger as HTTP response headers than as HTML meta tags. If this project is later fronted by a CDN, reverse proxy or custom host, verify:

- `Content-Security-Policy` as a response header
- `frame-ancestors` or `X-Frame-Options` for clickjacking defense
- `X-Content-Type-Options: nosniff`
- a deployment-appropriate `Referrer-Policy`
- TLS and certificate handling at the hosting layer

On GitHub Pages specifically, treat `frame-ancestors`, `sandbox`, reporting directives and some other browser protections as deployment-layer limitations rather than repository-level guarantees.

## Report here

Use GitHub issues or pull requests for:

- broken or outdated official source links
- incorrect control guidance
- misleading threat descriptions
- factual errors in domain mapping
- validation failures from `scripts/validate_project.py` or the GitHub Actions workflow

## Do not use this project as

- a substitute for legal advice
- a substitute for certified life-safety engineering
- a substitute for country-specific compliance review
- an emergency response manual

## Handling sensitive reports

If you believe a public discussion would create avoidable risk for a real organization, report the issue privately to the maintainer instead of posting operationally sensitive detail.
