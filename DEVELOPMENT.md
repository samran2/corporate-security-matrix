# Development Guide

This repository is a dependency-free static product. Its optional agent-assisted development workflow uses the open [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) collection to reinforce planning, implementation, testing, review and release discipline.

The skills are development tooling, not a runtime dependency. The public site must continue to work without Codex, an agent, Node packages or a build service.

## Installed skill baseline

The development environment was verified with all 24 upstream skills at revision:

```text
f63ec56a3cc936408d792956ae583c3c96a825bd
```

Installed skills:

- `api-and-interface-design`
- `browser-testing-with-devtools`
- `ci-cd-and-automation`
- `code-review-and-quality`
- `code-simplification`
- `context-engineering`
- `debugging-and-error-recovery`
- `deprecation-and-migration`
- `documentation-and-adrs`
- `doubt-driven-development`
- `frontend-ui-engineering`
- `git-workflow-and-versioning`
- `idea-refine`
- `incremental-implementation`
- `interview-me`
- `observability-and-instrumentation`
- `performance-optimization`
- `planning-and-task-breakdown`
- `security-and-hardening`
- `shipping-and-launch`
- `source-driven-development`
- `spec-driven-development`
- `test-driven-development`
- `using-agent-skills`

The seven shared upstream references are also required for complete internal links:

- accessibility checklist
- project definition of done
- observability checklist
- orchestration patterns
- performance checklist
- security checklist
- JavaScript and TypeScript testing patterns

## Codex installation

The upstream repository supports native Codex plugin installation:

```bash
codex plugin marketplace add addyosmani/agent-skills
codex plugin add agent-skills@agent-skills
```

Start a new Codex session after installation so the skills are discovered. Review upstream changes before updating the installed revision; development instructions can materially change agent behavior.

## Project workflow mapping

Use the smallest relevant skill set for the change:

| Work | Primary skills |
| --- | --- |
| New product capability | `spec-driven-development`, `planning-and-task-breakdown`, `incremental-implementation` |
| UI and responsive behavior | `frontend-ui-engineering`, `browser-testing-with-devtools` |
| Source or framework change | `source-driven-development`, `documentation-and-adrs` |
| Bug or failed validation | `debugging-and-error-recovery`, `test-driven-development` |
| Security-sensitive change | `security-and-hardening`, `doubt-driven-development` |
| Performance work | `performance-optimization`, `browser-testing-with-devtools` |
| Pull-request review | `code-review-and-quality`, `code-simplification` |
| GitHub release | `ci-cd-and-automation`, `git-workflow-and-versioning`, `shipping-and-launch` |

Skills guide the process; repository tests and release gates remain the source of truth. A skill must never be used to bypass the requirements in [ROADMAP.md](ROADMAP.md), weaken security controls or invent evidence.

## Local release checks

```bash
git diff --check
node --check matrix-domains.js
node --check matrix-actors.js
node --check matrix-briefs.js
node --check matrix-references.js
node --check app.js
node scripts/validate_data.mjs
python3 -m py_compile scripts/validate_project.py
python3 scripts/validate_project.py
python3 scripts/validate_project.py --check-links
```

Complete responsive, keyboard, reduced-motion and print review before a public release. The exact blocking gates and publication sequence are maintained in [ROADMAP.md](ROADMAP.md).

## Update policy

1. Review the upstream changelog and diff from the recorded revision.
2. Check for renamed skills, new shared references and changed tool requirements.
3. Install into a fresh session and verify that all referenced support files resolve.
4. Run this repository's complete validation and visual QA.
5. Update the revision recorded in this file only after verification.

Do not vendor upstream skill files into this repository unless the project intentionally accepts the maintenance and licensing responsibility for a fork.
