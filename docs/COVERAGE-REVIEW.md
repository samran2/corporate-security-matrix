# Corporate Security Matrix — corporate-security coverage review

Review date: 2026-10-08

Status: development review and proposed backlog; not an expert approval, conformity assessment or accepted taxonomy migration.

## Verdict

The nine-domain structure is a sound navigation foundation for corporate security. It corresponds closely to the nine areas in the [EK corporate-security model](https://ek.fi/hyotytietoa-yrityksille/yritysturvallisuus/). The largest gaps are the depth, applicability and traceability of subtopics, rather than missing top-level domain names. EK itself emphasizes tailoring to the business, sector and local circumstances; no generic matrix can guarantee exhaustive coverage or complete security.

Keep the nine domains and five lifecycle phases as the overview. Add a separately versioned subtopic and coverage layer, shared governance, cross-domain scenarios and context-specific overlays. Do not add columns or domains merely to make the matrix appear more comprehensive.

## Scope and method

The review inspected the local release-candidate working tree: core risks, controls, threat-source records, domain briefs, implementation aids, framework, assessment model and EU–Finland pilot. The data gate confirms 9 domains, 5 phases, 495 entries and 59 source records. There are 180 controls and 360 illustrative implementation aids.

Three perspectives were combined: governance/personnel/physical security, cyber/integrity/continuity, and operations/safety/environment. Findings were checked against actual entry text and implementation aids, not just keyword absence. Official framework and authority publications inform the recommendations; they do not establish an entry-level normative mapping.

This is a content review, not a new repository-wide vulnerability scan. It does not verify that any organization's controls operate effectively. Local future-version assessment and overlay code is not evidence that those features have passed their public release gates.

## Existing domain coverage

| Current domain | EK counterpart | Assessment of the structure |
| --- | --- | --- |
| People and Personnel Security | Henkilöstöturvallisuus | Present; employment lifecycle and travel-program governance need depth. |
| Physical and Site Security | Kiinteistö- ja toimitilaturvallisuus | Present; confidential meetings and event/public-interface scenarios need depth. |
| Emergency Preparedness and Life Safety | Pelastusturvallisuus | Present; event-specific and specialist-hazard overlays are needed where applicable. |
| Operations, Supply Chain and Quality | Tuotannon ja toiminnan turvallisuus | Present; product/service assurance, supplier exit and transport-specific depth are needed. |
| Environmental and Hazardous Materials Safety | Ympäristöturvallisuus | Present; process/technical safety must not be assumed from environmental controls. |
| Information and Cybersecurity | Tietoturvallisuus | Present; OT, AI, product software and operational privacy need explicit subtopics. |
| Integrity, Compliance and Investigations | Väärinkäytösten ja poikkeamien hallinta | Present; export controls and strategic information protection need explicit treatment. |
| Business Continuity and Crisis Management | Varautuminen ja kriisinhallinta | Present; dependency scenarios and jurisdiction/sector preparedness need deeper validation. |
| Occupational Health and Safety | Työturvallisuus, työterveyshuolto ja työsuojelu | Present; occupation-specific hazards require competent specialist profiles. |

The correspondence above is this review's mapping, not an EK endorsement. Broad coverage does not mean full implementation or equal relevance to every company. [EK model and scope](https://ek.fi/hyotytietoa-yrityksille/yritysturvallisuus/)

## Priority coverage gaps

“First” and “next” indicate proposed content-development order, not universal risk severity. A context-specific gap can be urgent for an exposed organization and irrelevant to another.

### G01 — Subtopic coverage and applicability: first

**Evidence:** `assessment-model.js` defines one maturity score, three confidence components, one critical-gap text, next action and owner role per domain/phase cell. It has no subtopic coverage or applicability decision. `coveragePercent` counts cells with all four scores; it does not measure the breadth of security topics considered. `scripts/validate_data.mjs` fixes the current release to three threat sources, four risks and four controls per cell.

**Recommendation:** introduce a coverage inventory with “applicable / not applicable with rationale / not yet determined”, evidence expectations, reviewer and stable links to controls. Distinguish assessment completion, applicable-topic coverage and control effectiveness. Never label 45/45 scores as “100% corporate security”. Do not infer non-applicability from a missing score. Shared governance and contextual profiles are consistent with [NIST CSF 2.0](https://nvlpubs.nist.gov/nistpubs/CSWP/NIST.CSWP.29.pdf).

### G02 — Operational governance: first

**Evidence:** `FRAMEWORK.md` already defines appetite, residual-risk acceptance, accountability, independent assurance and review cadence. Governance is therefore not absent. Its connection to the browser assessment is thin.

**Recommendation:** connect applicable scope, protected assets/services, policy, decision authority, exception expiry, risk acceptance, target capability, resource decisions and verification of corrective actions. Maintain the fuller governance record in an approved organizational system; do not turn the static site into a personal-data or evidence-document repository. [ASIS ESRM implementation guide](https://www.asisonline.org/globalassets/publications-and-resources/documents/a-brief-guide-to-esrm-implementation.pdf)

### G03 — Employee and contractor exit: first

**Evidence:** `CSM-D01-I-M03` and `CSM-D01-I-M04` address screening and role changes. The IAM aid for `CSM-D01-P-M01` mentions revocation. `CSM-D01-R-M02` covers incident containment, not the complete routine leaver process.

**Recommendation:** make coordinated joiner–mover–leaver controls explicit: HR trigger, timely digital/physical access removal, keys/devices and delegated authority, remote connections, asset return, confidentiality reminders and verification of exceptions. Access revocation alone is not a complete exit process. [NPSA ongoing personnel security](https://www.npsa.gov.uk/specialised-guidance/insider-risk-guidance/ongoing-personnel-security)

### G04 — Supplier exit and transition: first/next

**Evidence:** `CSM-D04-P-M01`, `CSM-D04-P-M02`, `CSM-D04-D-M02`, `CSM-D06-P-M03` and `CSM-D07-P-M02` already cover selection, contracts and monitoring. The relationship-ending phase is not an explicit control chain.

**Recommendation:** assess service transition, data return/deletion, account and integration shutdown, physical access, downstream subcontractors, retained duties and ownership-change reassessment. [NPSA procurement lifecycle](https://www.npsa.gov.uk/security-best-practices/supply-chain-guidance/guidance-practitioners), [NIST CSF 2.0 supplier lifecycle](https://nvlpubs.nist.gov/nistpubs/CSWP/NIST.CSWP.29.pdf)

### G05 — Process, functional and specialist technical safety: first where applicable

**Evidence:** `CSM-D04-P-M03` and its aid cover general change review/testing/rollback; `CSM-D04-P-M04` addresses configuration and traceability. `CSM-D05-I-M02` addresses releases; `CSM-D09-P-M02` addresses permits, guarding and isolation. A restart checklist already exists under `CSM-D09-R-M03`. These are valuable partial controls, but do not constitute a process-safety management model.

**Recommendation:** add a specialist profile for process hazard analysis, safety-critical equipment/barriers and their verification, safe operating limits, process-specific management of change, temporary changes and safe commissioning/restart. Electrical, pressure, explosion-atmosphere and functional-safety topics need explicit applicability and competent review. Do not produce generic engineering or emergency instructions. Tukes explicitly distinguishes process safety from occupational safety and explains why occupational-safety management alone is insufficient. [Tukes process-safety system](https://tukes.fi/prosessiturvallisuusjarjestelma), [Tukes management of change](https://tukes.fi/prosessiturvallisuusjarjestelma/muutosten-hallinta)

### G06 — OT, IoT and cyber-physical security: first where applicable

**Evidence:** `CSM-D06-I-R02` identifies OT dependencies; `CSM-D06-P-M02` provides broad IT controls. OT-specific protective and response constraints are not separately assessable.

**Recommendation:** add authorized remote maintenance, safe containment/stopping, engineering coordination, controlled testing and maintenance windows, legacy-device compensating controls, and safety verification before reconnection. Include building automation and connected physical-security systems, not just factories. [NIST SP 800-82 Rev. 3](https://csrc.nist.gov/pubs/sp/800/82/r3/final)

### G07 — Software-product security lifecycle: first for developers/manufacturers

**Evidence:** `CSM-D06-P-M04` and its aids cover pipeline, dependency, artifact, secret and release checks. D04 covers product quality/change. Neither makes the complete software-product lifecycle independently assessable.

**Recommendation:** add secure requirements/design, threat modeling, component provenance/SBOM, vulnerability ownership for delivered products, coordinated disclosure/PSIRT, secure update delivery and support/end-of-life decisions. Treat EU product obligations as applicability-reviewed overlay context, not universal requirements. [NIST SSDF](https://csrc.nist.gov/projects/ssdf), [European Commission CRA context](https://digital-strategy.ec.europa.eu/en/policies/cyber-resilience-act)

### G08 — AI and GenAI security: first for AI users/providers

**Evidence:** `CSM-D06-I-R04`/`CSM-D06-I-M04` identify shadow services and development tooling, but core entries do not explicitly cover AI-specific security.

**Recommendation:** assess AI-use inventory, provider/model trust, sensitive-data handling, prompt injection, data/model poisoning, permissions for agent tools, human decision authority, evaluation/monitoring and shutdown criteria. Link people, data, integrity and operations rather than creating an isolated AI silo. [NIST GenAI risk-management profile](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf)

### G09 — Operational data-protection lifecycle: first/next

**Evidence:** `CSM-D06-I-M03`, `CSM-D06-P-M03` and `CSM-D06-R-M04` already cover privacy context, handling and notifications. The processing-inventory aid records purpose, data types and locations. Privacy is not absent, but is broader than confidentiality or breach response.

**Recommendation:** provide assessable subtopics for lawful processing/transparency, individual rights, privacy-by-design, impact assessment, processors/international transfers and verified retention/deletion. Determine jurisdiction-specific duties through reviewed overlays. [GDPR official text](https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng)

### G10 — Export control, sanctions and strategic information: first where exposed

**Evidence:** D07 already covers bribery, conflicts, transaction integrity and investigations. D04 covers border/customs dependencies. `CSM-D06-I-M02` covers crown-jewel information and D01 recognizes hostile intelligence collection. These do not explicitly cover export-control decisions or an R&D/strategic-technology protection lifecycle.

**Recommendation:** separate end-user/end-use, product/software/technology-transfer and licensing checks from anti-bribery controls. Add protection of trade secrets, research partnerships, acquisitions and strategic technology, with reporting/escalation and ownership/control checks. Sanctions/export applicability requires legal specialist review. [Finnish MFA export-control guidance](https://um.fi/vientivalvontaohjeistus-yrityksille), [Supo economic security](https://supo.fi/yritysturvallisuus)

### G11 — Product/service, customer and public-event safety: next; first for exposed services

**Evidence:** `CSM-D04-I-M02`, `CSM-D04-D-M04` and `CSM-D04-R-M01` already cover customer harm, field failures and recall. D03 includes visitors, assisted evacuation and occupancy. D02's violent-crowd threat does not cover ordinary crowd congestion.

**Recommendation:** add sector-specific product/service hazard assessment and foreseeable misuse, user information, lifecycle change and field surveillance. For events, add capacity/flow, temporary structures, organizer/site/provider responsibility, visitor communication and competent response planning. Keep accessibility already covered in the core; deepen it rather than calling it absent. [Tukes service-risk management](https://tukes.fi/tuotteet-ja-palvelut/vapaa-ajan-palveluiden-turvallisuus/palveluntarjoajan-velvollisuudet/riskiperusteisuus-ja-jatkuva-parantaminen), [Tukes current consumer-service guidance](https://tukes.fi/kulutuspalvelujen-turvallisuus)

**Source-currency caution:** Tukes flags its older event-safety guide as containing references to repealed legislation and being updated. Do not use that older guide as a current legal-duty mapping. [Tukes guidance status](https://tukes.fi/tuotteet-ja-palvelut/vapaa-ajan-palveluiden-turvallisuus/ohjeita-palvelujen-turvallisuudesta)

### G12 — Transport/fleet and dangerous-goods operations: next where applicable

**Evidence:** D04 already covers routes, storage/transport conditions, chain of custody, shipment loss and rerouting. D05 covers hazardous-material transport broadly. Driver/fleet and dangerous-goods operational duties are not an explicit specialist profile.

**Recommendation:** cover operator responsibilities, competent personnel, vehicle/loading controls, interfaces at transfer/temporary storage and transport-specific emergency arrangements. Separate cargo security from transport safety. [Traficom dangerous-goods context](https://www.traficom.fi/fi/liikennejarjestelma/vaarallisten-aineiden-kuljetus/vaarallisten-aineiden-kuljetus-vak)

### G13 — Travel-program decisions and confidential meetings: next

**Evidence:** D01 and its aids already include destination risk, routes, lodging, communications, medical/contingency arrangements, check-ins and travel support. D02 covers visitors and critical rooms.

**Recommendation:** deepen travel approval/cancellation and evacuation authority, long-term overseas assignments/family exposure, assistance/insurance limits and post-trip learning. Add confidential-meeting participant verification, visual/acoustic leakage and recording risks to D02/D06. [ISO 31030 official record](https://www.iso.org/standard/54204.html), [EK people/site context](https://ek.fi/hyotytietoa-yrityksille/yritysturvallisuus/)

### G14 — Cross-domain dependency and prolonged-disruption scenarios: first/next

**Evidence:** D08 already contains BIA, recovery priorities, natural/climate/public-health and geopolitical initiating conditions, alternative capacity, crisis communications and restoration. D05 explicitly covers severe-weather runoff. These topics are not wholly missing.

**Recommendation:** make coupled scenarios testable: ransomware plus production safety; flood plus power/communications loss; supplier failure plus sanctions; insider misuse plus strategic-information loss; deepfake leadership instructions plus payment fraud. Add context-specific prolonged resource shortage, civil preparedness and external coordination. Verify credible communications, dependencies and restoration decisions, not merely document existence. [Huoltovarmuuskeskus continuity management](https://www.huoltovarmuuskeskus.fi/tietoa-huoltovarmuudesta/jatkuvuudenhallinta)

### G15 — Risk transfer and insurance: next

**Evidence:** Insurers appear in threat-source/stakeholder records, including `CSM-D04-RC-A02`; controls concentrate on prevention and recovery.

**Recommendation:** include relevant coverage, exclusions, required protective measures, claims evidence and continuity assumptions. Insurance can transfer some financial consequences; it does not eliminate risk or replace prevention. [EK insurance context](https://ek.fi/hyotytietoa-yrityksille/yritysturvallisuus/)

## Proposed target structure

1. **Shared governance:** scope, protected values/assets, ownership, decision rights, assurance and review cadence.
2. **Existing 9 × 5 overview:** stable domain/phase IDs and backward-compatible navigation.
3. **Versioned subtopics:** explicit applicability, linked canonical entries, expected evidence and cross-domain relationships.
4. **Reviewed overlays:** jurisdiction, sector and operating context, with official sources and specialist approval.
5. **Scenario assurance:** demonstrate that interfaces work when several domains fail together.

Candidate overlays include office/remote work, industrial/high-hazard operations, digital-product providers, public-facing services/events, logistics and critical services. Highly regulated contexts such as healthcare, food, aviation or nuclear operations need their own competent specialist review; naming a profile is not evidence of coverage.

The current exact 495-entry / 3–4–4 contract remains the release gate for the current candidate. Do not squeeze all new topics into four ever-longer controls, reuse IDs for new meanings, or silently relax validation. A later content/schema version must explicitly define additions, compatibility, review state, tests and resource budget. Retain the dependency-free, local/private architecture.

## Acceptance criteria for a future coverage expansion

- Every applicable subtopic has an owner, scenario/control links, expected evidence and review status.
- Exclusions and unresolved applicability are visible; neither silently counts as covered.
- Every proposed control has vendor-neutral implementation aids and a clear limit on what the aid proves.
- Source relevance, legal applicability and control-effectiveness evidence remain distinct.
- Safety, environment, security/governance and applicable legal specialists approve their own high-consequence content before it becomes `reviewed`.
- Cross-domain exercises demonstrate actual handoffs, decision rights and safe restoration.
- Reports distinguish completion, topic coverage, maturity, confidence and residual-risk decisions.
- Existing public IDs/URLs and privacy guarantees remain compatible, or an explicit migration is documented.

## What this review does not recommend

Do not report governance, supply chain, cryptography, digital evidence custody, corruption/fraud, crisis communications, accessibility, climate hazards or public-health disruption as entirely absent: the current content already addresses them. Do not equate general market, exchange-rate or investment risks with corporate-security domains unless a defined security or continuity consequence brings them into scope.

No runtime content, review-state labels or release approval is changed by this document. These are proposed improvements, not a claim that all corporate-security areas are now complete.
