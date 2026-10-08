# Corporate Security Matrix

![Corporate Security Matrix social preview](assets/social-preview.png)

An open, evidence-led synthesis for seeing enterprise-security exposure, coordinating decisions and building resilience across professional boundaries.

[Open the live matrix](https://samran2.github.io/corporate-security-matrix/index.html) · [Read the operating framework](https://samran2.github.io/corporate-security-matrix/framework.html) · [Browse the source library](SOURCE-LIBRARY.md) · [Read the content-review record](CONTENT-REVIEW.md) · [Follow the roadmap](ROADMAP.md)

Current public release: `v1.0.0`. Documented candidate: `v1.1.0` · 2026-08-29. Publication remains subject to the release gates in the [roadmap](ROADMAP.md).

## Why it exists

Corporate security is rarely one team or one technology. Material disruption crosses people, facilities, operations, supply chains, cyber systems, integrity, safety and continuity. This project gives leaders and practitioners one shared structure for discussing those dependencies.

The matrix is a planning and management aid. It does not certify compliance, replace applicable law, provide legal advice or substitute for certified safety, security or engineering judgment.

## What is included

- **9 security domains** spanning people, physical assets, emergency readiness, operations, environment, cyber, integrity, continuity and occupational safety
- **5 lifecycle phases**: Identify, Protect, Detect, Respond and Recover
- **3 decision layers**: Threat sources, Risks & failure modes, and Controls & actions
- **Official and authoritative source records** with visible scope, status and applicability context
- **Interactive search and filters** with keyboard support, mobile layouts and shareable URL state
- **Operating framework** for ownership, maturity, evidence confidence, governance, cadence and staged adoption
- **Privacy by design**: no account, analytics, cookies, third-party scripts or application-managed browser storage

## Use the matrix

1. Choose the domain that contains the most material current exposure.
2. Review each lifecycle phase without averaging away a critical blind spot.
3. Filter Threat sources, Risks & failure modes, or Controls & actions, and search for relevant dependencies.
4. Assign an accountable owner and record current evidence—not intended policy.
5. Use the [operating framework](FRAMEWORK.md) to assess maturity, confidence and corrective actions.
6. Revisit the view after incidents, exercises, acquisitions, supplier changes and major technology or operating-model change.

The selected domain, decision layer and search term are encoded in the URL so a precise matrix view can be shared without application-side storage. The unpublished candidate also supports a lifecycle `phase` filter; links without it keep their existing behavior. URL state can remain in browser history, copied links and hosting or access logs, so do not enter sensitive organizational or personal information in search.

### Integrated action-brief development

The unreleased development candidate adds lifecycle-phase filtering, canonical-ID search and an action brief for up to 12 selected Controls & actions across domains. Choose an owner role from the action's domain profile and a Now/Next/Later planning horizon, then download Markdown or print the brief. Selection order and horizons express your planning choices; they are not a risk score, severity ranking or prescribed deadlines.

The brief stays in memory and survives changes to public filters. Reloading or leaving the page clears it, including browser navigation-cache restoration. Selections and owner/horizon choices are excluded from shared URLs, history state, browser storage and network requests. Owners are roles, not person names; the brief collects no free-text organisational notes or assessment responses.

Outputs include exact canonical IDs, the core framework version, implementation aids and the relevant phase-context sources for each action. They explicitly exclude jurisdiction overlays and describe sources as context, not entry-level proof. **Markdown download, print and Save as PDF create unencrypted copies that may contain sensitive priorities.** Handle those copies under your organisation's policy. This capability remains unreleased; development commits and draft pull requests do not satisfy the outstanding content, browser and release-approval gates.

### Integrated mitigation-tool development

The unpublished working-tree candidate maps all 180 canonical Controls & actions identifiers to exactly two illustrative implementation aids each, for 360 `{ name, use }` records. Each mitigation exposes the aids in an accessible `Implementation tools · 2` disclosure; tool names and uses participate in search and are expanded in print.

The aids are vendor-neutral categories, not product endorsements, procurement recommendations, compliance findings or evidence that a risk has been eliminated. The tooling layer contains no vendor links and adds no runtime network requests or browser storage. Its deterministic validator rejects structural drift, URLs, a bounded list of named-vendor and promotional patterns, and absolute risk-removal claims. Those checks are heuristic: named competent human reviewers must still verify every mapping for practical, legal, safety, privacy and jurisdictional fit before release. This capability is not part of the current public `v1.0.0` site.

## Domain model

| Domain | Primary focus |
| --- | --- |
| People and Personnel Security | Workforce integrity, duty of care, travel risk and critical roles |
| Physical and Site Security | Facilities, perimeters, utilities, zoning and protective design |
| Emergency Preparedness and Life Safety | Emergency action, evacuation, first response and casualty management |
| Operations, Supply Chain and Quality | Dependencies, production integrity, suppliers and continuity of delivery |
| Environmental and Hazardous Materials Safety | Substances, emissions, waste, permits and containment |
| Information and Cybersecurity | Governance, identity, technical exposure, detection and recovery |
| Integrity, Compliance and Investigations | Anti-corruption, reporting, investigations and control governance |
| Business Continuity and Crisis Management | All-hazards coordination, exercises, decision rights and recovery |
| Occupational Health and Safety | Safe systems of work, exposure control and workforce health |

## Evidence policy

The content is original, evidence-led synthesis. Source selection follows this order:

1. International standards and intergovernmental guidance
2. Official national or regional guidance where it adds transferable value
3. Supporting comparator sources with clearly bounded applicability

Official and authoritative sources are preferred over vendor material, consulting summaries and unattributed claims. These sources inform each domain and, where explicitly mapped, its phase context; they do not establish compliance or prove every individual matrix entry. Legal effect and applicability must be checked against the relevant jurisdiction, sector, contract and operating context. See [SOURCE-LIBRARY.md](SOURCE-LIBRARY.md), [FACT-CHECK.md](FACT-CHECK.md) and [CONTENT-REVIEW.md](CONTENT-REVIEW.md).

## Architecture

The public site is intentionally small and durable:

- semantic HTML, modern CSS and dependency-free JavaScript
- static GitHub Pages deployment
- no bundler, generated application code or runtime backend; release automation only assembles and validates an explicit static artifact
- no dynamic HTML injection or string-based code execution
- strict meta-delivered Content Security Policy for static-hosting compatibility
- progressive enhancement: the method and scope remain understandable without JavaScript

Core files:

- `index.html` — matrix product experience
- `framework.html` and `FRAMEWORK.md` — operating model
- `matrix-domains.js` — lifecycle Risks & failure modes and Controls & actions
- `matrix-actors.js` — threat sources and initiating conditions
- `matrix-briefs.js` — domain briefings and leadership questions
- `matrix-references.js` — domain source records and explicit phase-context mappings
- `matrix-tools-d01-d03.js`, `matrix-tools-d04-d06.js` and `matrix-tools-d07-d09.js` — candidate implementation-aid records keyed by canonical mitigation identifier
- `matrix-tools.js` — fail-closed aggregation and runtime contract for the mitigation-tool layer
- `app.js` — search, filtering, keyboard behavior, public URL state and the candidate in-memory action brief
- `styles.css` — responsive visual system and print layout
- `scripts/validate_project.py` — deterministic release checks
- `ROADMAP.md` — release gates, publication runbook and planned product evolution
- `RELEASE-CONTROLS.md` — required branch, protected-environment and release-approval settings
- `CONTENT-REVIEW.md` — editorial, source-currency and applicability review record
- `DEVELOPMENT.md` — optional agent-assisted workflow and verified skill baseline

## Run locally

```bash
python3 -m http.server 8000 --bind 127.0.0.1
```

Open `http://127.0.0.1:8000/`. The explicit loopback bind keeps the development server local to this computer.

## Validate a change

```bash
node --check matrix-domains.js
node --check matrix-actors.js
node --check matrix-briefs.js
node --check matrix-references.js
node --check matrix-tools-d01-d03.js
node --check matrix-tools-d04-d06.js
node --check matrix-tools-d07-d09.js
node --check matrix-tools.js
node --check app.js
node scripts/validate_data.mjs
node scripts/validate_mitigation_tools.mjs
node scripts/validate_mitigation_tools_ui.mjs
node scripts/test_action_brief.mjs
node scripts/validate_ui.mjs
node --test scripts/test_validate_html.mjs
python3 scripts/test_validate_project_links.py
python3 scripts/validate_project.py
```

Run the optional external-source check when network access is available:

```bash
python3 scripts/validate_project.py --check-links
```

GitHub Actions runs deterministic Quality checks for every push and pull request. External source links run for every `main` push, weekly and on demand.

## Contribute

Contributions are welcome when they improve factual accuracy, applicability, source quality, accessibility or practical use. Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.

Never include real credentials, sensitive operational details, personal data or information that could increase risk to a real organization. Security-sensitive reports should use GitHub's private vulnerability reporting when available; see [SECURITY.md](SECURITY.md).

## Attribution and license

Sami Rantanen is recognized as the originator of the initiative and its open public-purpose direction. See [Acknowledgements](acknowledgements.html).

The repository code and original synthesis are available under the [MIT License](LICENSE). Linked standards and publications remain under their respective owners and licenses.

The interface is inspired by the comparative interaction pattern of MITRE ATT&CK. This project is not a MITRE ATT&CK taxonomy, technique catalog or affiliated product.
