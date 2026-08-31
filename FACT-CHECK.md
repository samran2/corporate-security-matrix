# Fact Check

Review version: 1.1.0 release candidate
Verification date: August 29, 2026

The v1.1.0 review combined deterministic data checks, structured editorial review and source-by-source currency and applicability review. It covered all 9 domains and 495 visible matrix entries across Threat sources, Risks & failure modes, and Controls & actions. The candidate is not the current public release.

This is an evidence-led synthesis review, not a legal opinion, conformity assessment, certification audit or external subject-matter assurance engagement.

## Verification method

1. Deterministic validation checks release files, HTML relationships, security-sensitive frontend patterns, stable entry identifiers and the matrix data contract.
2. Editorial review checks one principal idea per entry, consistent terminology, action-oriented controls, neutral language and separation of threat sources from legitimate stakeholders.
3. Source review checks official publication records for title, edition or release, status, intended audience, jurisdiction and material applicability limits.
4. Domain review challenges high-consequence statements across people, sites, emergency response, operations, environment, cyber, integrity, continuity and occupational safety.
5. Network validation checks the runtime-derived set of external URLs separately from deterministic pull-request checks.
6. Final browser, accessibility, workflow and live-site checks remain release gates; a documented candidate is not a published GitHub Release.
7. The release owner must approve the release pull request before merge and separately approve the protected `github-pages` environment after build validation and before deployment.

## Automated result contract

- Candidate target: exactly 59 source records across 9 domains, with an explicit contextual source mapping for each of the 5 lifecycle phases in every domain.
- The source validator derives the unique external URL total from the completed release candidate; this document does not freeze a stale URL count.
- A successful HTTP response proves reachability only. It does not prove that a title, edition, amendment, release, legal effect or applicability statement is correct.
- Responses such as `401`, `403` and `429` are recorded as access-controlled or rate-limited and require manual metadata review.
- No URL may be classified as broken by the final validator. Access-controlled sources still require manual title, edition and applicability review.

## Material source-currency corrections

- **ISO 14001:** the withdrawn ISO 14001:2015 record was replaced by [ISO 14001:2026 Environmental management systems — Requirements with guidance for use](https://www.iso.org/standard/14001), Edition 4, published April 2026.
- **IFRC first aid:** the 2020 guidance was replaced by the [IFRC International First Aid, Resuscitation and Education Guidelines 2025](https://www.ifrc.org/document/ifrc-international-first-aid-resuscitation-and-education-guidelines-2025), published by IFRC on March 18, 2026.
- **NIST incident response:** [NIST SP 800-61 Rev. 3](https://csrc.nist.gov/pubs/sp/800/61/r3/final), published April 2025, supersedes Rev. 2. Its full title is *Incident Response Recommendations and Considerations for Cybersecurity Risk Management: A CSF 2.0 Community Profile*.
- **NIST security and privacy controls:** the source record distinguishes the SP 800-53 Rev. 5 publication from the current online control content, [Release 5.2.0](https://csrc.nist.gov/news/2025/nist-releases-revision-to-sp-800-53-controls), finalized August 27, 2025.
- **NIST supply-chain guidance:** NIST C-SCRM and SP 800-161 are identified as ICT/OT product-and-service supply-chain guidance, not universal authority for logistics, customs, payment, product-safety or recall duties.
- **CISA source routes:** physical-security and cybersecurity-performance sources use current official destinations, with United States and critical-infrastructure context shown where relevant.
- **World Bank integrity guidance:** [*Integrity Compliance Programs for SMEs: Practical Guidance and Resources*](https://documents.worldbank.org/en/publication/documents-reports/documentdetail/099717003082422668) is recorded by its complete title and 2024 final-release status.

## Applicability clarifications

- ISO public pages are official publication records; they are not substitutes for the licensed full standards.
- NIST and CISA records provide official United States guidance. Their presence does not make United States law applicable to another jurisdiction.
- OSHA 29 CFR 1910.38 is a United States federal regulation with conditional applicability; it is not a global emergency-planning requirement.
- ILO conventions create obligations through ratification and national implementation. A convention citation is not a claim of identical direct corporate duties in every country.
- The United Nations Convention against Corruption binds States Parties; it does not operate as one universal corporate control standard.
- WHO mass-casualty material is scoped to healthcare and emergency-unit practice, not every corporate site.
- Recall, notification, environmental permit, employment, privacy, evidence-preservation and professional-practice duties must be checked by jurisdiction, sector, contract and operating context.

## Manually verified official anchors

- ISO 14001:2026: <https://www.iso.org/standard/14001>
- ISO 9001:2015 and Amendment 1:2024: <https://www.iso.org/standard/62085.html>
- ISO/TS 22318:2021: <https://www.iso.org/standard/79001.html>
- ISO 37301:2021 and Amendment 1:2024: <https://www.iso.org/standard/75080.html>
- ISO 37002:2021: <https://www.iso.org/standard/65035.html>
- ISO/TS 37008:2023: <https://www.iso.org/standard/74094.html>
- NIST SP 800-61 Rev. 3: <https://csrc.nist.gov/pubs/sp/800/61/r3/final>
- NIST SP 800-53 Rev. 5 and Release 5.2.0 planning note: <https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final>
- IFRC International First Aid, Resuscitation and Education Guidelines 2025: <https://www.ifrc.org/document/ifrc-international-first-aid-resuscitation-and-education-guidelines-2025>
- ENISA Threat Landscape 2025: <https://www.enisa.europa.eu/publications/enisa-threat-landscape-2025>
- WHO Guidelines on Mental Health at Work: <https://www.who.int/publications/i/item/9789240053052>
- ILO-OSH 2001 Guidelines: <https://www.ilo.org/resource/guidelines-occupational-safety-and-health-management-systems-ilo-osh-2001>

## Remaining cautions

- These sources inform each domain and, where explicitly mapped, its phase context; they do not establish compliance or prove every individual matrix entry.
- Official pages can change canonical URLs, publication metadata, amendments or status even when the underlying subject remains relevant.
- ISO 9001:2015 remains the published edition at this review date, with ISO expecting a revised edition in September 2026. Recheck after publication.
- The IFC General Environmental, Health, and Safety Guidelines are an established technical reference while an update process is underway. Recheck when IFC publishes the replacement set.
- No named external subject-matter expert, legal counsel, certification body or licensed engineer has signed off this review. High-consequence use requires competent human review in the applicable discipline and jurisdiction.

The detailed review record and watchlist are in [CONTENT-REVIEW.md](CONTENT-REVIEW.md).
