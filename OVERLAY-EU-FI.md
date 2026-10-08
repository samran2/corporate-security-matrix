# EU–Finland overlay pilot

Version `0.1.0-pilot` adds a read-only jurisdictional context dataset for three Corporate Security Matrix domains:

- Information and Cybersecurity (`information-and-cyber-security`)
- Occupational Health and Safety (`industrial-safety` in the canonical dataset)
- Environmental and Hazardous Materials Safety (`environmental-safety`)

The pilot was source-reviewed on 2026-08-29 and is scheduled for review by 2026-11-29. It has **not** been approved by a regulator, legal adviser or the three-domain external expert panel. It is orientation material, not legal advice, a conformity assessment or evidence of compliance.

## Public data contract

[`matrix-overlays.js`](matrix-overlays.js) exposes one dependency-free browser global:

```text
matrixOverlays
  schemaVersion: "1.0.0"
  overlays[]
    id: "eu-fi"
    version: "0.1.0-pilot"
    jurisdictions: ["EU", "FI"]
    scope: { domainIds, phaseIds, entryLevelMappings: false }
    reviewedAt, nextReview, status, authority, applicability, disclaimer
    annotations[]
```

Every annotation has a stable ID and version, a classification, the `context` relationship, a canonical `domainId`, one or more canonical `phaseIds`, jurisdiction and applicability boundaries, effective and review dates, status, authority and one or more official source records. A source record contains a stable ID, title, authority, type, jurisdiction, status, review date and HTTPS URL.

The supported annotation classifications are:

- `eu-law`: an EU legal instrument;
- `fi-law`: current Finnish legislation in Finlex;
- `authority-guidance`: non-binding guidance from an EU agency or Finnish competent authority;
- `voluntary-standard`: reserved for a future verified mapping to an official standard record.

The pilot contains no `voluntary-standard` annotations and no entry-level relationships. `scope.entryLevelMappings` is `false`, and the validator rejects every `entryIds` field while that flag is false. Enabling entry-level relationships requires a separate subject-matter review and contract change.

`effective` records an instrument's entry/application date or an authority guide's publication/update baseline. It does not determine when a duty applies to a particular organization. `reviewedOn` and `reviewedAt` record a maintainer source check, not legal or expert approval.

The matrix UI loads `matrix-overlays.js` as a first-party data file and renders the pilot only when the allowlisted `overlay=eu-fi` URL parameter or the labelled jurisdiction selector enables it. The URL records only the public overlay ID; assessment answers and organization-specific free text are never written into overlay URL state. The UI presents the selected overlay ID and version and keeps every annotation visibly bounded as context rather than an applicability or compliance decision.

## Source mapping

### Information and Cybersecurity

| Annotation | Lifecycle context | Official source and boundary |
| --- | --- | --- |
| `eu-fi-cyber-nis2-directive` | Identify, Protect, Detect, Respond, Recover | [Directive (EU) 2022/2555](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32022L2555) provides EU cybersecurity risk-management, governance and reporting context. Entity type, sector, size, designation, national implementation and sector-specific equivalent rules determine applicability. |
| `eu-fi-cyber-finland-act` | Identify, Protect, Detect, Respond, Recover | [Kyberturvallisuuslaki 124/2025](https://finlex.fi/fi/lainsaadanto/2025/124) is the current Finnish implementation source used here. Its defined operators, annexes, exclusions and sector-specific supervisors must be checked. |
| `eu-fi-cyber-implementing-regulation` | Identify, Protect, Detect, Respond, Recover | [Commission Implementing Regulation (EU) 2024/2690](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32024R2690) is limited to the digital, ICT-management, online-platform and trust-service provider types named in the instrument. |
| `eu-fi-cyber-enisa-guidance` | Identify, Protect, Detect, Respond, Recover | [ENISA NIS2 Technical Implementation Guidance](https://www.enisa.europa.eu/publications/nis2-technical-implementation-guidance) is non-binding and primarily supports entities covered by Regulation (EU) 2024/2690. It does not extend legal scope or replace national authority guidance. |
| `eu-fi-cyber-traficom-reporting` | Detect, Respond, Recover | [Traficom and NCSC-FI NIS2 guidance](https://www.kyberturvallisuuskeskus.fi/fi/toimintamme/saantely-ja-valvonta/nis-2-euroopan-unionin-kyberturvallisuusdirektiivi/tarkeaa-tietoa-euroopan-unionin-kyberturvallisuusdirektiivista-nis2) gives Finnish operator and staged incident-reporting context. The organization must first confirm its competent supervisor and current reporting route. |

### Occupational Health and Safety

| Annotation | Lifecycle context | Official source and boundary |
| --- | --- | --- |
| `eu-fi-osh-framework-directive` | Identify, Protect, Detect, Respond | [Council Directive 89/391/EEC](https://eur-lex.europa.eu/legal-content/EN/ALL/?uri=CELEX%3A31989L0391) supplies the EU minimum framework. National implementation controls organization-level duties, and Member States may provide more protective rules. |
| `eu-fi-osh-finland-act` | Identify, Protect, Detect, Respond | [Työturvallisuuslaki 738/2002](https://finlex.fi/fi/lainsaadanto/2002/738) is the current Finnish source for the general employer duty, hazard assessment, preventive work and first-aid context. Work type and hazard-specific legislation can add requirements. |
| `eu-fi-osh-occupational-health-care` | Identify, Protect, Detect, Recover | [Työterveyshuoltolaki 1383/2001](https://finlex.fi/fi/lainsaadanto/2001/1383) provides context for employer-arranged occupational health care and work-ability support. The required service scope depends on the work and conditions. |
| `eu-fi-osh-risk-assessment-guidance` | Identify, Protect, Detect | [EU guidance on risk assessment at work](https://osha.europa.eu/en/legislation/guidelines/guidance-risk-assessment-work) is non-binding. EU-OSHA expressly notes that the guide does not account for Member State implementation and is not a ready-to-apply risk-assessment tool. |

### Environmental and Hazardous Materials Safety

| Annotation | Lifecycle context | Official source and boundary |
| --- | --- | --- |
| `eu-fi-environment-seveso` | Identify, Protect, Detect, Respond, Recover | [Directive 2012/18/EU, Seveso III](https://eur-lex.europa.eu/legal-content/EN/ALL/?uri=CELEX%3A32012L0018) applies only to establishments within its dangerous-substance scope and quantity thresholds. Classification, aggregation and Finnish implementation must be checked. |
| `eu-fi-environment-finland-chemical-safety` | Identify, Protect, Detect, Respond, Recover | [Kemikaaliturvallisuuslaki 390/2005](https://finlex.fi/fi/lainsaadanto/2005/390) provides Finnish context for dangerous-chemical and explosives handling and storage. Duties vary with classification, quantities, activity and scale. |
| `eu-fi-environment-tukes-safety-report` | Identify, Protect, Respond | [Tukes safety-report guidance](https://tukes.fi/turvallisuusselvitys) applies to specified facilities exceeding Finnish dangerous-chemical thresholds. The guidance does not itself determine a facility's threshold classification. |
| `eu-fi-environment-industrial-emissions` | Identify, Protect, Detect, Respond, Recover | The [current consolidated Industrial Emissions Directive](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A02010L0075-20240804) and [Directive (EU) 2024/1785](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32024L1785) cover only specified installations and activities. The amendment has staged transposition and transition dates. |
| `eu-fi-environment-finland-protection-act` | Identify, Protect, Detect, Respond, Recover | [Ympäristönsuojelulaki 527/2014](https://finlex.fi/fi/lainsaadanto/2014/527) provides the Finnish pollution-prevention context. Activity, emissions, location, permit or registration status, decrees and permit conditions determine detailed duties. |

## Validation and integration hook

Run:

```bash
node --check matrix-overlays.js
node scripts/validate_overlays.mjs
node scripts/test_validate_overlays.mjs
node scripts/validate_overlay_ui.mjs
node scripts/test_runtime_bootstrap.mjs
```

The validator fails closed on:

- unknown schema fields, overlay IDs, versions, domains, phases, classifications, statuses or jurisdictions;
- missing EU-law, Finnish-law or authority-guidance coverage in a pilot domain;
- entry-level mappings while the pilot scope disables them;
- duplicate IDs, phases or source URLs;
- missing applicability, authority, dates or source metadata;
- non-HTTPS URLs, embedded credentials or source hosts outside the official allowlist;
- review dates that do not match the source-review baseline.

The mutation suite proves fail-closed behavior for an unknown field, an entry mapping while disabled, an out-of-scope domain, an unknown phase, an unofficial source host, duplicate annotation and source identifiers, an impossible calendar date, a duplicate source-mapping row, an undocumented extra source URL and a source URL moved to the wrong annotation row.

The UI integration remains intentionally additive: it loads the file after the core data scripts, selects the allowlisted `eu-fi` overlay by stable ID, validates the known schema version and renders annotation strings with text-only DOM APIs. Overlay text is not merged into the 495-entry core dataset, and the presence of an annotation is never interpreted as an applicability or compliance decision.

## Known limitations and release gates

- The pilot is selective, not an exhaustive register of EU or Finnish law.
- Only official Finnish-language current legislation is treated as controlling; convenience translations are not used as the source of record.
- Source status can change after the review date. Each release must recheck applicability, amendments, repeals, authority ownership and redirects.
- No organization-specific facts, permits, collective agreements, sector rules or authority decisions were assessed.
- No external legal, regulator or three-domain expert approval has occurred. These approvals remain release gates.
- `voluntary-standard` is a supported classification but has no pilot record. Adding one requires an official standard record, access/status verification and domain-expert approval.
- No current annotation is precise enough for an entry-level mapping. Such a mapping must be justified individually rather than inherited from a domain or phase relationship.
