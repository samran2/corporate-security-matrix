# Release controls

This repository prepares deterministic release evidence, but repository settings remain an external control. A workflow file cannot create a branch ruleset, appoint a release owner, require an environment reviewer or prove that self-approval is disabled. Those settings must be configured and verified by a repository administrator before publication.

## Repository settings required before release

### Enable GitHub Pages

In **Settings → Pages**, set **Build and deployment → Source** to **GitHub Actions** and record the settings check in the release evidence. A repository workflow cannot enable Pages or prove that this external setting is correct. The `Configure Pages` step failing with “Pages not enabled/configured for GitHub Actions” is a blocking preflight failure, not a reason to bypass the workflow.

### Protect `main`

Create a GitHub branch ruleset targeting the default branch with these minimum controls:

- require a pull request before changes reach `main`;
- require at least one approval from the named release owner;
- dismiss stale approvals after new commits;
- require the `quality` job from the `Quality` workflow and require the branch to be current before merge;
- block force pushes and deletion; and
- restrict bypass permission to an explicitly documented emergency owner, or disable bypass where the repository plan supports it.

The external-source workflow runs again on the resulting `main` SHA. Do not infer that a pull-request link result belongs to the final merge commit.

### Protect `github-pages`

In **Settings → Environments → github-pages**, configure:

- the named release owner as a required reviewer;
- prevention of self-review when the repository plan exposes that control;
- deployment branches restricted to `main`; and
- no undocumented administrator bypass.

The Pages workflow assigns its mutation-capable deploy job to the `github-pages` environment. The build job may assemble and validate the artifact first, but deployment cannot start until the environment reviewer approves it. Record the settings review and deployment approval with the release evidence.

## Enforced repository pipeline

The version-scoped site manifest at `scripts/site-manifest.json` is the single allowlist for that release's Pages artifact, public smoke-test routes, canonical pages, deep links and critical-resource budget. Both `Quality` and `Publish GitHub Pages` build `_site` through `scripts/site.mjs`; Pages uploads that validated directory without rebuilding it. Each build records a deterministic artifact SHA-256 beside the exact commit SHA in the workflow summary. The two workflow summaries remain separate evidence records; automation does not currently compare those digest strings across workflow runs.

Before an artifact is eligible for deployment, automation verifies:

- source syntax plus every data and UI contract declared in that release's scope;
- exact manifest membership and internal-link closure;
- sitemap-to-canonical parity and the 150,000-byte aggregate gzip budget;
- error-free public HTML with a checksum-pinned local Nu HTML Checker; and
- every public manifest route and representative deep link over HTTP. Production checks require two consecutive whole-manifest sweeps, use cache-busted no-cache probes for all routes, and additionally request the bare `/` and `/index.html` cache keys exactly as users do. Every response must preserve application query state and match the route-specific artifact SHA-256 and expected HTML title. Evidence reports requested URL, final URL, status, body marker, content type and available CDN headers. `.nojekyll` remains in the artifact digest but is explicitly excluded because GitHub Pages consumes it as control metadata.

`External source links` runs for every `main` push as well as weekly and on demand. Its named restricted-access report records the requested URL, status and final destination for every `401`, `403` or `429` result.

Before the deploy job can reach the protected environment, the Pages release gate queries the GitHub Actions API with read-only permission and requires successful `push` runs of both `Quality` and `External source links` for its exact 40-character `GITHUB_SHA` on `main`. Evidence from another branch or commit, a manual run or a scheduled run cannot satisfy the gate. The newest run and rerun attempt controls the result, and the summary links to that immutable attempt. The check waits for a bounded period, honors bounded primary and secondary rate-limit delays, and fails closed on a completed failure, terminal API error or timeout.

## Release sequence

1. Freeze a candidate SHA and run all local gates.
2. Obtain the required specialist evidence for the release.
3. Obtain release-owner approval on the release pull request.
4. Merge the approved SHA to `main` and confirm `Quality` and `External source links` run for that final SHA.
5. Review and approve the pending `github-pages` environment deployment.
6. Confirm `Publish GitHub Pages` deployed the same SHA and that its manifest-backed production smoke test passed.
7. From a second network/browser vantage, verify both the bare public matrix URL and explicit `index.html`, essential assets and representative deep links. A single runner edge is not evidence of global CDN convergence.
8. Verify release metadata, then obtain or confirm authorization for the immutable tag and GitHub Release.

If a production gate fails, stop tag and Release creation and publish a normal revert commit through the same protected path. Do not rewrite shared history.
