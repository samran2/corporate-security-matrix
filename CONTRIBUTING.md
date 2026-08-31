# Contributing

Thank you for helping improve the Corporate Security Matrix. Contributions should make the model more accurate, more applicable, easier to verify or easier to use.

The optional agent-assisted workflow and its verified skill baseline are documented in [DEVELOPMENT.md](DEVELOPMENT.md). Repository tests and the release gates in [ROADMAP.md](ROADMAP.md) remain authoritative regardless of tooling.

## Before proposing a change

- Search existing issues and pull requests.
- Keep operationally sensitive information, credentials and personal data out of public discussions.
- Use GitHub's private vulnerability-reporting channel for security-sensitive reports when available.
- Separate factual corrections from larger taxonomy or product proposals.

## Content standards

When adding or changing matrix content:

1. Prefer original, authoritative records from standards bodies, intergovernmental organizations, regulators and public framework owners.
2. Do not use vendor marketing, generic blogs or AI-generated citations as evidence.
3. Keep synthesis wording original; do not reproduce protected standards text.
4. Record the source edition or release, current status, verification date, authority, access level and applicability.
5. State jurisdiction, sector, legal, contractual and competence limits when guidance is not globally transferable.
6. Keep one principal idea per entry: threat sources may be people, hazards, dependencies or initiating conditions; risks describe exposures or failure modes; controls begin with an action and remain testable.
7. Describe system and control conditions without stigmatizing workers, health conditions, lawful activity or legitimate stakeholders.
8. Update `SOURCE-LIBRARY.md`, `matrix-references.js`, phase evidence mappings, `FACT-CHECK.md` and `CONTENT-REVIEW.md` when the evidence base changes.
9. Treat domain and phase sources as contextual guidance unless a specific entry-to-source relationship has been separately verified.

## Product standards

- Preserve the dependency-free static architecture unless a proposal demonstrates a material user benefit.
- Maintain keyboard access, readable focus states, responsive layouts and reduced-motion support.
- Do not add analytics, third-party scripts, cookies or browser storage without explicit project approval and documentation.
- Keep all user-controlled text out of HTML injection paths.
- Preserve deep links for domain, decision-layer and search state.

## Pull request checklist

- [ ] The change has a clear user or evidence-quality benefit.
- [ ] New or changed guidance is supported by authoritative sources.
- [ ] Scope and jurisdiction limitations are visible.
- [ ] Source status, edition and applicability have been reviewed independently from link reachability.
- [ ] Documentation and the shipped files tell the same story.
- [ ] JavaScript syntax checks pass.
- [ ] `python3 scripts/validate_project.py` passes.
- [ ] The matrix remains usable with a keyboard and at mobile width.
- [ ] No sensitive information, credentials or personal data are included.

## Local validation

```bash
node --check matrix-domains.js
node --check matrix-actors.js
node --check matrix-briefs.js
node --check matrix-references.js
node --check app.js
node scripts/validate_data.mjs
node scripts/validate_ui.mjs
python3 scripts/validate_project.py
```

Run `python3 scripts/validate_project.py --check-links` when a source URL changes.
