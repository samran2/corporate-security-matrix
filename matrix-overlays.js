const matrixOverlays = {
  schemaVersion: "1.0.0",
  overlays: [
    {
      id: "eu-fi",
      version: "0.1.0-pilot",
      label: "European Union and Finland context pilot",
      jurisdictions: ["EU", "FI"],
      scope: {
        domainIds: [
          "information-and-cyber-security",
          "industrial-safety",
          "environmental-safety"
        ],
        phaseIds: ["identify", "protect", "detect", "respond", "recover"],
        entryLevelMappings: false
      },
      applicability: "Context for organizations assessing operations in Finland. Every annotation has its own sector, activity, size and threshold limits; inclusion does not mean that an instrument applies to a particular organization.",
      status: "pilot",
      reviewedAt: "2026-08-29",
      nextReview: "2026-11-29",
      authority: "Source authority is recorded per annotation. The overlay is maintainer-curated and has not been approved by a regulator or external legal reviewer.",
      disclaimer: "This overlay is orientation material, not legal advice, a conformity assessment or evidence of compliance. Confirm applicability, current text, competent authority and obligations with qualified Finnish counsel or the responsible authority.",
      annotations: [
        {
          id: "eu-fi-cyber-nis2-directive",
          version: "1.0.0",
          kind: "eu-law",
          relationship: "context",
          domainId: "information-and-cyber-security",
          phaseIds: ["identify", "protect", "detect", "respond", "recover"],
          jurisdictions: ["EU", "FI"],
          title: "NIS2 cybersecurity risk management and reporting context",
          summary: "Provides lifecycle context for management oversight, all-hazards cyber risk management, incident handling, continuity, supply-chain security and significant-incident reporting.",
          applicability: "Applies through Member State implementation only to entities within the NIS2 scope. Sector, size, designation, public-administration rules and sector-specific equivalent requirements must be checked before use.",
          effective: "2023-01-16",
          status: "in-force",
          reviewedOn: "2026-08-29",
          authority: "European Parliament and Council of the European Union",
          sources: [
            {
              id: "eurlex-nis2-2022-2555",
              title: "Directive EU 2022/2555 on measures for a high common level of cybersecurity across the Union",
              authority: "European Parliament and Council of the European Union",
              type: "EU directive",
              jurisdiction: "EU",
              status: "In force; national implementation determines entity-level duties",
              reviewedOn: "2026-08-29",
              url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32022L2555"
            }
          ]
        },
        {
          id: "eu-fi-cyber-finland-act",
          version: "1.0.0",
          kind: "fi-law",
          relationship: "context",
          domainId: "information-and-cyber-security",
          phaseIds: ["identify", "protect", "detect", "respond", "recover"],
          jurisdictions: ["FI"],
          title: "Finnish Cybersecurity Act risk management and incident notification context",
          summary: "Provides Finnish context for an up-to-date cybersecurity risk-management model, proportionate controls, management responsibility and staged reporting of significant incidents.",
          applicability: "Only operators within the Act's defined scope and annexes are covered. The responsible supervisory authority and any sector-specific legislation must be determined for the operator.",
          effective: "2025-04-08",
          status: "in-force",
          reviewedOn: "2026-08-29",
          authority: "Parliament of Finland",
          sources: [
            {
              id: "finlex-cybersecurity-act-124-2025",
              title: "Kyberturvallisuuslaki 124/2025",
              authority: "Parliament of Finland; official current text in Finlex",
              type: "Finnish act",
              jurisdiction: "FI",
              status: "Current consolidated legislation",
              reviewedOn: "2026-08-29",
              url: "https://finlex.fi/fi/lainsaadanto/2025/124"
            }
          ]
        },
        {
          id: "eu-fi-cyber-implementing-regulation",
          version: "1.0.0",
          kind: "eu-law",
          relationship: "context",
          domainId: "information-and-cyber-security",
          phaseIds: ["identify", "protect", "detect", "respond", "recover"],
          jurisdictions: ["EU", "FI"],
          title: "NIS2 implementing rules for specified digital and trust-service entities",
          summary: "Adds technical and methodological context for security policy, risk treatment, incident handling, continuity, supply chains, access, assets, personnel and physical security.",
          applicability: "Limited to the digital-infrastructure, ICT-service-management, online-platform and trust-service entity types named in Regulation EU 2024/2690. It is not a universal NIS2 control catalogue.",
          effective: "2024-11-07",
          status: "in-force",
          reviewedOn: "2026-08-29",
          authority: "European Commission",
          sources: [
            {
              id: "eurlex-nis2-implementing-regulation-2024-2690",
              title: "Commission Implementing Regulation EU 2024/2690",
              authority: "European Commission",
              type: "EU implementing regulation",
              jurisdiction: "EU",
              status: "In force",
              reviewedOn: "2026-08-29",
              url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32024R2690"
            }
          ]
        },
        {
          id: "eu-fi-cyber-enisa-guidance",
          version: "1.0.0",
          kind: "authority-guidance",
          relationship: "context",
          domainId: "information-and-cyber-security",
          phaseIds: ["identify", "protect", "detect", "respond", "recover"],
          jurisdictions: ["EU", "FI"],
          title: "ENISA technical implementation guidance for specified NIS2 entities",
          summary: "Offers non-binding implementation examples and evidence considerations for the requirements in Regulation EU 2024/2690.",
          applicability: "Primarily for the entity types covered by Regulation EU 2024/2690. Other organizations may find it informative, but it does not extend legal scope or replace national authority guidance.",
          effective: "2025-06-26",
          status: "current-guidance",
          reviewedOn: "2026-08-29",
          authority: "European Union Agency for Cybersecurity",
          sources: [
            {
              id: "enisa-nis2-technical-guidance-2025",
              title: "NIS2 Technical Implementation Guidance",
              authority: "European Union Agency for Cybersecurity",
              type: "EU agency guidance",
              jurisdiction: "EU",
              status: "Current non-binding guidance, version 1.0 published June 2025",
              reviewedOn: "2026-08-29",
              url: "https://www.enisa.europa.eu/publications/nis2-technical-implementation-guidance"
            }
          ]
        },
        {
          id: "eu-fi-cyber-traficom-reporting",
          version: "1.0.0",
          kind: "authority-guidance",
          relationship: "context",
          domainId: "information-and-cyber-security",
          phaseIds: ["detect", "respond", "recover"],
          jurisdictions: ["FI"],
          title: "Traficom NIS2 operator and significant-incident reporting guidance",
          summary: "Provides Finnish operational context for determining NIS2 operator status and preparing the staged notification path for a significant incident.",
          applicability: "For Finnish NIS2 operators, especially sectors supervised by Traficom. Organizations must confirm their competent authority and use the current official reporting instructions.",
          effective: "2025-04-08",
          status: "current-guidance",
          reviewedOn: "2026-08-29",
          authority: "Finnish Transport and Communications Agency Traficom, National Cyber Security Centre Finland",
          sources: [
            {
              id: "traficom-nis2-key-information",
              title: "Tärkeää tietoa Euroopan unionin kyberturvallisuusdirektiivistä NIS2",
              authority: "Finnish Transport and Communications Agency Traficom, National Cyber Security Centre Finland",
              type: "Finnish authority guidance",
              jurisdiction: "FI",
              status: "Current web guidance",
              reviewedOn: "2026-08-29",
              url: "https://www.kyberturvallisuuskeskus.fi/fi/toimintamme/saantely-ja-valvonta/nis-2-euroopan-unionin-kyberturvallisuusdirektiivi/tarkeaa-tietoa-euroopan-unionin-kyberturvallisuusdirektiivista-nis2"
            }
          ]
        },
        {
          id: "eu-fi-osh-framework-directive",
          version: "1.0.0",
          kind: "eu-law",
          relationship: "context",
          domainId: "industrial-safety",
          phaseIds: ["identify", "protect", "detect", "respond"],
          jurisdictions: ["EU", "FI"],
          title: "EU occupational safety and health framework",
          summary: "Provides minimum EU context for employer responsibility, risk assessment, preventive and protective measures, worker information, training, consultation and review.",
          applicability: "Implemented through national law and subject to the Directive's scope and exclusions. Member States may maintain or introduce more protective provisions.",
          effective: "1989-06-19",
          status: "in-force",
          reviewedOn: "2026-08-29",
          authority: "Council of the European Communities",
          sources: [
            {
              id: "eurlex-osh-framework-89-391",
              title: "Council Directive 89/391/EEC on improvements in the safety and health of workers at work",
              authority: "Council of the European Communities",
              type: "EU directive",
              jurisdiction: "EU",
              status: "In force; current consolidated version available in EUR-Lex",
              reviewedOn: "2026-08-29",
              url: "https://eur-lex.europa.eu/legal-content/EN/ALL/?uri=CELEX%3A31989L0391"
            }
          ]
        },
        {
          id: "eu-fi-osh-finland-act",
          version: "1.0.0",
          kind: "fi-law",
          relationship: "context",
          domainId: "industrial-safety",
          phaseIds: ["identify", "protect", "detect", "respond"],
          jurisdictions: ["FI"],
          title: "Finnish Occupational Safety and Health Act",
          summary: "Provides Finnish context for the employer's general duty of care, safety programme, systematic hazard and risk assessment, instruction, monitoring and first-aid preparedness.",
          applicability: "Applies to work within the Act's scope. Work type, shared workplaces, leased labour and specific hazards can trigger additional legislation or decrees.",
          effective: "2003-01-01",
          status: "in-force",
          reviewedOn: "2026-08-29",
          authority: "Parliament of Finland",
          sources: [
            {
              id: "finlex-occupational-safety-act-738-2002",
              title: "Työturvallisuuslaki 738/2002",
              authority: "Parliament of Finland; official current text in Finlex",
              type: "Finnish act",
              jurisdiction: "FI",
              status: "Current consolidated legislation",
              reviewedOn: "2026-08-29",
              url: "https://finlex.fi/fi/lainsaadanto/2002/738"
            }
          ]
        },
        {
          id: "eu-fi-osh-occupational-health-care",
          version: "1.0.0",
          kind: "fi-law",
          relationship: "context",
          domainId: "industrial-safety",
          phaseIds: ["identify", "protect", "detect", "recover"],
          jurisdictions: ["FI"],
          title: "Finnish Occupational Health Care Act",
          summary: "Adds context for employer-arranged occupational health care, workplace assessment, prevention of work-related illness and injury, monitoring and support for work ability.",
          applicability: "Applies where the employer is required to comply with Finnish occupational-safety legislation. Service scope must reflect the work, hazards, workforce and changing workplace conditions.",
          effective: "2002-01-01",
          status: "in-force",
          reviewedOn: "2026-08-29",
          authority: "Parliament of Finland",
          sources: [
            {
              id: "finlex-occupational-health-care-act-1383-2001",
              title: "Työterveyshuoltolaki 1383/2001",
              authority: "Parliament of Finland; official current text in Finlex",
              type: "Finnish act",
              jurisdiction: "FI",
              status: "Current consolidated legislation",
              reviewedOn: "2026-08-29",
              url: "https://finlex.fi/fi/lainsaadanto/2001/1383"
            }
          ]
        },
        {
          id: "eu-fi-osh-risk-assessment-guidance",
          version: "1.0.0",
          kind: "authority-guidance",
          relationship: "context",
          domainId: "industrial-safety",
          phaseIds: ["identify", "protect", "detect"],
          jurisdictions: ["EU", "FI"],
          title: "EU guidance on workplace risk assessment",
          summary: "Describes a participative process for identifying hazards, evaluating risk, selecting controls, documenting results and reviewing effectiveness.",
          applicability: "Non-binding guidance that does not account for Member State implementing law and is not a ready-to-apply risk-assessment tool. Finnish requirements and sector-specific methods remain controlling.",
          effective: "2022-10-17",
          status: "current-guidance",
          reviewedOn: "2026-08-29",
          authority: "European Commission guidance hosted by the European Agency for Safety and Health at Work",
          sources: [
            {
              id: "euosha-workplace-risk-assessment-guidance",
              title: "Guidance on risk assessment at work",
              authority: "European Commission, hosted by the European Agency for Safety and Health at Work",
              type: "EU authority guidance",
              jurisdiction: "EU",
              status: "Current general guidance; last updated October 2022",
              reviewedOn: "2026-08-29",
              url: "https://osha.europa.eu/en/legislation/guidelines/guidance-risk-assessment-work"
            }
          ]
        },
        {
          id: "eu-fi-environment-seveso",
          version: "1.0.0",
          kind: "eu-law",
          relationship: "context",
          domainId: "environmental-safety",
          phaseIds: ["identify", "protect", "detect", "respond", "recover"],
          jurisdictions: ["EU", "FI"],
          title: "Seveso III major-accident hazard context",
          summary: "Provides lifecycle context for dangerous-substance inventories, major-accident prevention, safety management, emergency planning, public information and learning from incidents.",
          applicability: "Limited to establishments where named dangerous substances meet the Directive's scope and quantity thresholds. Classification, aggregation rules and national implementation must be checked.",
          effective: "2015-06-01",
          status: "in-force",
          reviewedOn: "2026-08-29",
          authority: "European Parliament and Council of the European Union",
          sources: [
            {
              id: "eurlex-seveso-iii-2012-18",
              title: "Directive 2012/18/EU on major-accident hazards involving dangerous substances",
              authority: "European Parliament and Council of the European Union",
              type: "EU directive",
              jurisdiction: "EU",
              status: "In force",
              reviewedOn: "2026-08-29",
              url: "https://eur-lex.europa.eu/legal-content/EN/ALL/?uri=CELEX%3A32012L0018"
            }
          ]
        },
        {
          id: "eu-fi-environment-finland-chemical-safety",
          version: "1.0.0",
          kind: "fi-law",
          relationship: "context",
          domainId: "environmental-safety",
          phaseIds: ["identify", "protect", "detect", "respond", "recover"],
          jurisdictions: ["FI"],
          title: "Finnish dangerous-chemical and explosives safety context",
          summary: "Provides Finnish context for preventing personal, environmental and property damage from industrial handling, storage, transfer and keeping of dangerous chemicals and explosives.",
          applicability: "Applies according to substance classification, activity, scale, quantity and statutory exclusions. Permit, notification, supervision and safety-document duties vary by operation.",
          effective: "2005-07-01",
          status: "in-force",
          reviewedOn: "2026-08-29",
          authority: "Parliament of Finland",
          sources: [
            {
              id: "finlex-chemical-safety-act-390-2005",
              title: "Laki vaarallisten kemikaalien ja räjähteiden käsittelyn turvallisuudesta 390/2005",
              authority: "Parliament of Finland; official current text in Finlex",
              type: "Finnish act",
              jurisdiction: "FI",
              status: "Current consolidated legislation",
              reviewedOn: "2026-08-29",
              url: "https://finlex.fi/fi/lainsaadanto/2005/390"
            }
          ]
        },
        {
          id: "eu-fi-environment-tukes-safety-report",
          version: "1.0.0",
          kind: "authority-guidance",
          relationship: "context",
          domainId: "environmental-safety",
          phaseIds: ["identify", "protect", "respond"],
          jurisdictions: ["FI"],
          title: "Tukes safety-report guidance for threshold dangerous-chemical facilities",
          summary: "Offers Finnish authority guidance on safety-report content, process-safety management and public-information practices for specified large-scale facilities.",
          applicability: "Only facilities exceeding the thresholds identified by the applicable Finnish decree are required to prepare this safety report. The guide does not determine a facility's threshold classification.",
          effective: "2024-10-22",
          status: "current-guidance",
          reviewedOn: "2026-08-29",
          authority: "Finnish Safety and Chemicals Agency",
          sources: [
            {
              id: "tukes-safety-report-2024",
              title: "Turvallisuusselvitys",
              authority: "Finnish Safety and Chemicals Agency",
              type: "Finnish authority guidance",
              jurisdiction: "FI",
              status: "Current guidance; issued October 2024",
              reviewedOn: "2026-08-29",
              url: "https://tukes.fi/turvallisuusselvitys"
            }
          ]
        },
        {
          id: "eu-fi-environment-industrial-emissions",
          version: "1.0.0",
          kind: "eu-law",
          relationship: "context",
          domainId: "environmental-safety",
          phaseIds: ["identify", "protect", "detect", "respond", "recover"],
          jurisdictions: ["EU", "FI"],
          title: "EU industrial-emissions prevention and control context",
          summary: "Provides context for integrated pollution prevention, permitting, best available techniques, monitoring, incidents and site-closure obligations for covered activities.",
          applicability: "Limited to the installations and activities within the Industrial Emissions Directive. The 2024 amendment has staged transposition and transition dates, so national implementation and facility-specific permit conditions must be checked.",
          effective: "2024-08-04",
          status: "in-force",
          reviewedOn: "2026-08-29",
          authority: "European Parliament and Council of the European Union",
          sources: [
            {
              id: "eurlex-industrial-emissions-consolidated-2024",
              title: "Consolidated Directive 2010/75/EU on industrial and livestock rearing emissions",
              authority: "European Parliament and Council of the European Union",
              type: "Consolidated EU directive",
              jurisdiction: "EU",
              status: "Current consolidated text dated August 2024",
              reviewedOn: "2026-08-29",
              url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A02010L0075-20240804"
            },
            {
              id: "eurlex-industrial-emissions-amendment-2024-1785",
              title: "Directive EU 2024/1785 amending the Industrial Emissions Directive",
              authority: "European Parliament and Council of the European Union",
              type: "EU amending directive",
              jurisdiction: "EU",
              status: "In force with staged transposition and transition dates",
              reviewedOn: "2026-08-29",
              url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32024L1785"
            }
          ]
        },
        {
          id: "eu-fi-environment-finland-protection-act",
          version: "1.0.0",
          kind: "fi-law",
          relationship: "context",
          domainId: "environmental-safety",
          phaseIds: ["identify", "protect", "detect", "respond", "recover"],
          jurisdictions: ["FI"],
          title: "Finnish Environmental Protection Act",
          summary: "Provides Finnish context for awareness of environmental impacts, prevention and limitation of pollution, permits, monitoring, incident duties and remediation-related decisions.",
          applicability: "Duties depend on the activity, emissions, location, permit or registration status and applicable decrees. Facility permits and authority decisions can impose more specific conditions.",
          effective: "2014-09-01",
          status: "in-force",
          reviewedOn: "2026-08-29",
          authority: "Parliament of Finland",
          sources: [
            {
              id: "finlex-environmental-protection-act-527-2014",
              title: "Ympäristönsuojelulaki 527/2014",
              authority: "Parliament of Finland; official current text in Finlex",
              type: "Finnish act",
              jurisdiction: "FI",
              status: "Current consolidated legislation",
              reviewedOn: "2026-08-29",
              url: "https://finlex.fi/fi/lainsaadanto/2014/527"
            }
          ]
        }
      ]
    }
  ]
};
