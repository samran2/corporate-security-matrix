# Fact Check

Verification date: August 28, 2026

This repository was checked against official source domains as part of the 1.0.0 publication review.

## Verification method

1. Deterministic validation checked the release files, HTML relationships, security-sensitive frontend patterns and the data model.
2. Network validation checked the unique external links found across the public HTML, source map and publication documentation.
3. Edition-specific and redirected sources retained the canonical official publication pages established in the March 31, 2026 review.
4. Scope labels distinguish international, European Union, United States and Finland-specific material.

## Automated result

- 46 domain-level source mappings validated across 9 domains; every domain contains all 5 lifecycle phases.
- 45 unique external URLs were checked with `python3 scripts/validate_project.py --check-links`.
- 28 URLs returned a successful response to automated retrieval.
- 17 official URLs returned an access-control or rate-limit response (`401`, `403` or `429`). Those servers were reachable but did not permit complete automated retrieval; they remain subject to scheduled rechecks and human review.
- No broken external link remained after correction.

## Corrected or tightened source entries

- ISO 31000 now uses the canonical standard page and the official title `ISO 31000:2018 Risk management — Guidelines`.
- ISO 22301 now uses the fuller official title `Security and resilience — Business continuity management systems — Requirements`.
- ISO 22320, ISO 22341, ISO 22342, ISO 22398 and ISO 28000 now use fuller official ISO publication titles.
- ISO 37001 now uses the fuller official title `Anti-bribery management systems — Requirements with guidance for use`.
- ISO 45001 now uses the canonical standard page URL.
- NIST SP 800-61 Rev. 3, SP 800-161 Rev. 1 and SP 800-53 Rev. 5 now use fuller official publication titles.
- The retired WHO `Protecting Workers' Health` fact-sheet URL was replaced with WHO's current `Occupational Health` topic page.

## Manually checked official anchors

- ISO 31000: <https://www.iso.org/standard/65694.html>
- ISO 22301: <https://www.iso.org/standard/75106.html>
- ISO 37001: <https://www.iso.org/standard/37001>
- NIST SP 800-61 Rev. 3: <https://csrc.nist.gov/pubs/sp/800/61/r3/final>
- NIST SP 800-161 Rev. 1 Update 1: <https://csrc.nist.gov/pubs/sp/800/161/r1/upd1/final>
- NIST SP 800-53 Rev. 5 Update 1: <https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final>
- ENISA Threat Landscape 2025: <https://www.enisa.europa.eu/publications/enisa-threat-landscape-2025>
- WHO Guidelines on Mental Health at Work: <https://www.who.int/publications/i/item/9789240053052>
- WHO Occupational Health: <https://www.who.int/health-topics/occupational-health>
- ILO-OSH 2001 Guidelines: <https://www.ilo.org/publications/guidelines-occupational-safety-and-health-management-systems-ilo-osh-2001>

## Remaining cautions

- Official pages can change canonical URLs, publication metadata or navigation structure over time even when the document itself remains valid.
- Some official sites restrict automated retrieval or use dynamic and redirected endpoints. A successful host response is not a substitute for periodic human review of title, edition and applicability.
- This repository is an original synthesis grounded in official sources. It does not reproduce or supersede the full normative content of the cited standards.
