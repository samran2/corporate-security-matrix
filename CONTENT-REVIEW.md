# Corporate Security Matrix Content Review

Edition: 1.1.0
Review date: 2026-08-29
Status: release-candidate core-content review record; mitigation-tool human review, final candidate, release-owner authorization, workflow and live-site gates pending

## Review statement

The v1.1.0 candidate received a multi-stage internal review across all 9 domains, 5 lifecycle phases and 495 visible matrix entries: 135 Threat source entries, 180 Risks & failure modes entries, and 180 Controls & actions entries.

That completed core-content review does not cover the subsequently integrated set of 360 mitigation implementation-aid records. Their automated contract review is complete, but their human semantic and applicability review remains open.

The review improved clarity, source currency, applicability boundaries and source access. It does not convert the Matrix into a standard, legal opinion, certification method or professional assurance report.

## Review stages

1. **Structure and completeness:** checked the domain, phase and layer contract, stable entry identifiers, required source fields and deterministic validation rules.
2. **Editorial clarity:** applied one vocabulary and style contract, removed vague or dramatic language, and separated threat sources, initiating conditions, dependencies and legitimate stakeholders.
3. **Source currency:** checked official publication records for title, edition or release, status, amendment and canonical destination.
4. **Applicability:** challenged legal effect, intended audience, jurisdiction, sector, contract and professional-practice boundaries.
5. **Domain review:** ran focused review passes for people, physical security, emergency response, operations, environment, cyber, integrity, continuity and occupational safety.
6. **Traceability and usability:** reviewed how domain and phase context sources are presented without creating false entry-level precision.
7. **Fresh-context challenge:** used separate internal review passes for editorial consistency, factual continuity, accessibility and final-diff risk.
8. **Release verification:** local validators, browser checks, GitHub workflows and production smoke tests remain blocking gates before tag and Release publication.

The internal process was AI-assisted and remained under project editorial ownership. No named external reviewer or external assurance provider participated.

## Mitigation-tool review status

The integrated development working tree contains a separate mapping from every one of the 180 canonical Controls & actions identifiers to exactly two `{ name, use }` implementation aids, 360 records in total. The runtime shows one limitation notice, renders each pair through a native disclosure, includes tool text in search and expands the content for print. The feature introduces no vendor links, runtime network requests or browser storage.

Deterministic validation checks exact identifier coverage, record counts and shape, load order, atomic failure, text bounds, safe DOM construction, URL and markup absence, a bounded named-vendor and endorsement list, and absolute risk-removal patterns. These are structural and heuristic screens. They do not establish that a suggestion is the best choice, is available in a jurisdiction, is truly vendor-neutral in every market, meets a legal or standard clause, is safe for a particular operation or will mitigate the stated risk.

Before release, named competent human reviewers must review all 180 relationships and 360 records. The evidence record must identify reviewer and domain scope, date, findings and disposition, and must cover practical usefulness, hidden vendor specificity, privacy and worker impacts, professional-competence boundaries and jurisdiction- or compliance-sensitive wording. High-consequence mappings require review within the relevant discipline.

## Evidence and traceability contract

- The Matrix is evidence-led synthesis. Source wording is not copied into the matrix as a substitute for interpretation.
- Official and authoritative source records inform a domain and, where explicitly mapped, its phase context. They do not establish compliance or prove every individual matrix entry.
- A phase quick link is contextual unless an explicit entry-to-source relationship says otherwise.
- An ISO public page is an official publication record, not the licensed full standard.
- Source reachability, source currency, normative status and legal applicability are separate questions.
- Laws, regulations, permits, treaties, employment rights, privacy duties, contracts and professional obligations must be determined for the relevant jurisdiction, sector and operation.
- A source record must identify enough context to distinguish its publisher, title, edition or release, status, jurisdiction or audience, applicability note and review date.

## Editorial style contract

1. **Threat source:** may be a person, natural hazard, technical failure, dependency or initiating condition; it is not automatically a hostile actor.
2. **Risk or failure mode:** states one principal exposure, event or impact.
3. **Control or action:** starts with an action verb where practical and identifies a testable object, outcome or decision criterion.
4. **Length:** one principal idea per matrix line, normally no more than about 24 words.
5. **Precision:** avoid unsupported absolutes and vague terms such as “properly,” “truly,” “in real time,” “higher-integrity” or “existential.”
6. **Neutrality:** describe control and system conditions without blaming or stigmatizing workers, affected communities, regulators, claimants or people experiencing distress.
7. **Acronyms:** expand an acronym at first visible use.
8. **Evidence:** keep official source, domain source pack, entry citation and legal applicability conceptually separate.
9. **Assurance:** frame questions so they can be answered with evidence or a recorded decision.
10. **House style:** United States English, sentence case and no terminal period in matrix fragments.

## Material review outcomes

| Domain | Material clarification |
| --- | --- |
| People and Personnel Security | Separated psychosocial health and distress from insider-risk indicators; made screening role-based, proportionate, privacy-preserving and locally lawful. |
| Physical and Site Security | Distinguished lawful protest from violence or access disruption; bounded video-surveillance privacy and counter-unmanned-aircraft authority. |
| Emergency Preparedness and Life Safety | Scoped planning to reasonably foreseeable site hazards; bounded first aid, clinical triage, evacuation assistance and life-safety engineering by competence and law. |
| Operations, Supply Chain and Quality | Limited NIST C-SCRM to ICT/OT supply chains and made recall, customs, payment and product-safety duties sector- and jurisdiction-specific. |
| Environmental and Hazardous Materials Safety | Separated environmental impacts from occupational exposure and emergency response while preserving shared hazardous-material interfaces. |
| Information and Cybersecurity | Explained NIST CSF 2.0 Govern as cross-cutting, bounded notification duties and replaced absolute control-cadence claims with risk-based wording. |
| Integrity, Compliance and Investigations | Broadened the source base beyond anti-bribery and avoided prejudging allegations, politically exposed persons or legitimate regulators and claimants. |
| Business Continuity and Crisis Management | Replaced arbitrary time promises with scenario-specific decision windows and separated natural hazards from disaster consequences shaped by exposure and vulnerability. |
| Occupational Health and Safety | Made employer accountability, worker participation, hierarchy of controls, confidentiality and competent occupational-health oversight explicit. |

## Source-currency corrections

- [ISO 14001:2026](https://www.iso.org/standard/14001) replaced the withdrawn 2015 edition in the environmental source pack.
- [IFRC International First Aid, Resuscitation and Education Guidelines 2025](https://www.ifrc.org/document/ifrc-international-first-aid-resuscitation-and-education-guidelines-2025) replaced the 2020 guidance.
- [NIST SP 800-61 Rev. 3](https://csrc.nist.gov/pubs/sp/800/61/r3/final) is recorded with its full title and April 2025 final status, superseding Rev. 2.
- NIST SP 800-53 Rev. 5 is distinguished from the current online control content, [Release 5.2.0](https://csrc.nist.gov/news/2025/nist-releases-revision-to-sp-800-53-controls).
- Current official routes replace retired or overly broad CISA, ILO, OECD, UNDRR, World Bank and other source destinations; the World Bank record uses the complete title *Integrity Compliance Programs for SMEs: Practical Guidance and Resources* and its 2024 final-release status.
- New official records fill material scope gaps in employment screening, unmanned-aircraft awareness, supply-chain continuity, compliance management, whistleblowing, internal investigations, crisis management, business-impact analysis and occupational health.

## Source-status watchlist

| Source or family | Status at review | Next review trigger |
| --- | --- | --- |
| ISO 9001:2015 + Amendment 1:2024 | Published edition; ISO expects a revised edition in September 2026 | Recheck immediately after the new edition is published |
| IFC General Environmental, Health, and Safety Guidelines | Established technical reference; IFC update process is underway | Recheck when IFC publishes the replacement or revised set |
| ISO 22301:2019 + Amendment 1:2024 | Current published edition; revision activity is underway | Recheck on publication of a replacement edition |
| ISO 31000:2018 | Current published guidance; revision activity is underway | Recheck on publication of a replacement edition |
| ISO 22341:2021 | Current publication under review | Recheck when ISO records a confirmation, revision or replacement |
| ISO 45001:2018 + Amendment 1:2024 | Current published edition; revision activity is underway | Recheck on publication of a replacement edition |
| NIST online control catalogs and CISA guidance | Living public guidance can change without a new matrix release | Review on material release, route change or scheduled source audit |
| Laws, regulations and contractual duties | Context-specific and continuously changeable | Review before use and after any relevant legal, sector or contract change |

## Known limitations and required human review

- No external subject-matter expert, legal counsel, certification body, licensed engineer, occupational physician or emergency-service authority has signed off this edition.
- The review is not a clause-by-clause assessment against any standard and does not demonstrate conformity, certification or due diligence.
- Domain and phase mappings are contextual unless explicit entry-level traceability is recorded.
- Source coverage cannot determine which law, permit, notification deadline, employment right, privacy restriction, professional duty or contract applies to a particular organization.
- High-consequence life safety, hazardous materials, occupational health, security operations, investigations and incident-response decisions require competent human review and local procedures.
- The mitigation implementation aids have not received the required named human semantic, vendor-neutrality or compliance-context review; passing pattern checks must not be represented as expert approval.
- Translation, accessibility and editorial review do not remove the need to test meaning with the intended practitioners and affected workforce.

## Acceptance and release status

The editorial and source-review record is complete for the 495-entry core content. Publication of a candidate containing the mitigation-tool layer remains blocked until:

- deterministic data, UI, project, syntax and workflow checks pass on the final candidate;
- named competent reviewers complete and record the 180-mapping, 360-record mitigation-tool review described above;
- external source links are checked and access-controlled results are manually reviewed;
- desktop, tablet and mobile browser, keyboard, reduced-motion and console checks pass;
- the release owner approves the release pull request before merge;
- GitHub `Quality` and `External source links` checks succeed for the final `main` commit, then the release owner separately approves its protected `github-pages` deployment;
- the `Publish GitHub Pages` workflow succeeds for that same commit;
- the live site passes production smoke tests; and
- after production verification, the release owner authorizes the immutable `v1.1.0` tag and GitHub Release.

See [FACT-CHECK.md](FACT-CHECK.md) for verification details, [SOURCE-LIBRARY.md](SOURCE-LIBRARY.md) for the source set and [ROADMAP.md](ROADMAP.md) for the release gates.
