const referencesByDomain = {
  "personnel-security": [
    {
      id: "iso-31030-2021",
      shortTitle: "ISO 31030:2021",
      jurisdiction: "Global",
      authority: "International standard",
      access: "Official record — full standard not included",
      applicability: "Guidance for organizations managing work-related travel risk; legal duties and traveller protections remain jurisdiction-specific.",
      verifiedOn: "2026-08-29",
      status: "Current",
      editionNote: "Published in 2021 and under ISO systematic review in 2026.",
      org: "ISO",
      type: "Travel Risk",
      title: "ISO 31030:2021 Travel risk management — Guidance for organizations",
      note: "Guidance for business-travel risk, duty of care and traveller protection.",
      url: "https://www.iso.org/standard/54204.html"
    },
    {
      id: "cisa-personal-security",
      shortTitle: "CISA Personal Security",
      jurisdiction: "United States",
      authority: "Government guidance",
      access: "Open access — official guidance page",
      applicability: "Advisory material for critical-infrastructure personnel and leaders; it is not a global executive-protection standard.",
      verifiedOn: "2026-08-29",
      status: "Current",
      editionNote: "Official CISA action guide available from the resource page.",
      org: "CISA",
      type: "Personal Security",
      title: "Personal Security Considerations Action Guide",
      note: "Operational advice for reducing targeted personal risk to personnel and leadership.",
      url: "https://www.cisa.gov/resources-tools/resources/personal-security-considerations-action-guide"
    },
    {
      id: "cisa-employment-screening",
      shortTitle: "CISA Employment Screening",
      jurisdiction: "United States",
      authority: "Government guidance",
      access: "Open access — official guidance page",
      applicability: "Advisory screening guidance; organizations must apply role-based, proportionate and locally lawful privacy and equality safeguards.",
      verifiedOn: "2026-08-29",
      status: "Current",
      editionNote: "Official CISA onboarding and employment-screening fact sheet.",
      org: "CISA",
      type: "Employment Screening",
      title: "Resources for Onboarding and Employment Screening Fact Sheet",
      note: "Practical considerations for risk-based onboarding and employment screening.",
      url: "https://www.cisa.gov/resources-tools/resources/resources-onboarding-and-employment-screening-fact-sheet"
    },
    {
      id: "cisa-insider-threat-resources",
      shortTitle: "CISA Insider Threat Resources",
      jurisdiction: "United States",
      authority: "Government guidance",
      access: "Open access — official resource collection",
      applicability: "Advisory insider-threat resources; health conditions or distress must not be treated as evidence of malicious intent.",
      verifiedOn: "2026-08-29",
      status: "Current",
      editionNote: "Maintained CISA resource and tools collection.",
      org: "CISA",
      type: "Insider Threat",
      title: "Insider Threat Mitigation Resources and Tools",
      note: "Resources for prevention, reporting, assessment and proportionate insider-risk mitigation.",
      url: "https://www.cisa.gov/topics/physical-security/insider-threat-mitigation/resources-and-tools"
    },
    {
      id: "ilo-c190",
      shortTitle: "ILO Convention No. 190",
      jurisdiction: "Ratifying ILO member States",
      authority: "International labour convention",
      access: "Open access — official NORMLEX record",
      applicability: "Treaty obligations bind ratifying States; organizational duties arise through applicable national implementation.",
      verifiedOn: "2026-08-29",
      status: "In force",
      editionNote: "Adopted in 2019; ratification status must be checked by jurisdiction.",
      org: "ILO",
      type: "Convention",
      title: "Violence and Harassment Convention, 2019 (No. 190)",
      note: "International labour instrument for preventing violence and harassment in the world of work.",
      url: "https://normlex.ilo.org/dyn/nrmlx_en/f?p=NORMLEXPUB%3A12100%3A0%3A%3ANO%3A%3AP12100_ILO_CODE%3AC190"
    },
    {
      id: "who-mental-health-at-work",
      shortTitle: "WHO Mental Health at Work",
      jurisdiction: "Global",
      authority: "UN health guidance",
      access: "Open access — official publication page",
      applicability: "Public-health guidance on psychosocial risks and workplace interventions; clinical and employment decisions require competent local advice.",
      verifiedOn: "2026-08-29",
      status: "Current",
      editionNote: "Published in 2022.",
      org: "WHO",
      type: "Workplace Health",
      title: "WHO Guidelines on Mental Health at Work",
      note: "Guidance on work-related psychosocial risk, worker wellbeing and protective workplace practices.",
      url: "https://www.who.int/publications/i/item/9789240053052"
    }
  ],
  "premises-security": [
    {
      id: "cisa-hometown-security",
      shortTitle: "CISA Hometown Security",
      jurisdiction: "United States",
      authority: "Government guidance",
      access: "Open access — official program page",
      applicability: "Voluntary physical-security resources for public gathering places and critical infrastructure; local law and site risk determine controls.",
      verifiedOn: "2026-08-29",
      status: "Current",
      editionNote: "Current CISA destination for layered physical-security resources.",
      org: "CISA",
      type: "Physical Security",
      title: "Hometown Security",
      note: "Resources for assessing vulnerabilities and building layered physical security and resilience.",
      url: "https://www.cisa.gov/hometown-security"
    },
    {
      id: "ifc-general-ehs",
      shortTitle: "IFC General EHS Guidelines",
      jurisdiction: "Global project-finance context",
      authority: "Development-finance guidance",
      access: "Open access — official publication page",
      applicability: "Good international industry practice for relevant projects; local building, fire, labour and environmental law still governs.",
      verifiedOn: "2026-08-29",
      status: "Current edition; update underway",
      editionNote: "Underlying General EHS Guidelines were published in 2007 and are being updated by IFC.",
      org: "IFC",
      type: "Facility Safety",
      title: "General Environmental, Health, and Safety Guidelines",
      note: "Cross-industry good practice for facility, life-safety and site controls.",
      url: "https://www.ifc.org/en/insights-reports/general-environmental-health-and-safety-guidelines"
    },
    {
      id: "iso-22341-2021",
      shortTitle: "ISO 22341:2021",
      jurisdiction: "Global",
      authority: "International standard",
      access: "Official record — full standard not included",
      applicability: "Guidance for crime prevention through environmental design; it does not replace site-specific security assessment or local planning law.",
      verifiedOn: "2026-08-29",
      status: "Current; under review",
      editionNote: "Published in 2021 and under ISO review in 2026.",
      org: "ISO",
      type: "Protective Security",
      title: "ISO 22341:2021 Security and resilience — Protective security — Guidelines for crime prevention through environmental design",
      note: "Guidance for site-design choices that reduce crime opportunity and strengthen physical protection.",
      url: "https://www.iso.org/standard/50078.html"
    },
    {
      id: "iso-22342-2023",
      shortTitle: "ISO 22342:2023",
      jurisdiction: "Global",
      authority: "International standard",
      access: "Official record — full standard not included",
      applicability: "Guidance for organizational security planning against intentional harmful acts; continuity and safety requirements need their own source basis.",
      verifiedOn: "2026-08-29",
      status: "Current",
      editionNote: "First edition published in 2023.",
      org: "ISO",
      type: "Security Planning",
      title: "ISO 22342:2023 Security and resilience — Protective security — Guidelines for the development of a security plan for an organization",
      note: "Structure for converting malicious-act risk assessment into an organizational security plan.",
      url: "https://www.iso.org/standard/50079.html"
    },
    {
      id: "cisa-be-air-aware",
      shortTitle: "CISA Be Air Aware",
      jurisdiction: "United States",
      authority: "Government guidance",
      access: "Open access — official program page",
      applicability: "Advisory unmanned-aircraft-system awareness and reporting guidance; detection, mitigation, jamming and interdiction are legally restricted.",
      verifiedOn: "2026-08-29",
      status: "Current",
      editionNote: "Maintained CISA physical-security resource.",
      org: "CISA",
      type: "Unmanned Aircraft Systems",
      title: "Be Air Aware",
      note: "Resources for recognizing, reporting and lawfully managing unmanned-aircraft-system risks.",
      url: "https://www.cisa.gov/topics/physical-security/be-air-aware"
    }
  ],
  "rescue-safety": [
    {
      id: "osha-emergency-preparedness",
      shortTitle: "OSHA Emergency Preparedness",
      jurisdiction: "United States",
      authority: "Federal workplace-safety guidance",
      access: "Open access — official guidance page",
      applicability: "General US workplace guidance for reasonably foreseeable emergencies; sector rules, state plans and local fire codes may add requirements.",
      verifiedOn: "2026-08-29",
      status: "Current",
      editionNote: "Maintained OSHA guidance page.",
      org: "OSHA",
      type: "Emergency Preparedness",
      title: "Emergency Preparedness and Response: Getting Started",
      note: "Practical baseline for workplace emergency organization and readiness.",
      url: "https://www.osha.gov/emergency-preparedness/getting-started"
    },
    {
      id: "osha-1910-38",
      shortTitle: "OSHA 29 CFR 1910.38",
      jurisdiction: "United States federal jurisdiction",
      authority: "Federal regulation",
      access: "Open access — official regulatory text",
      applicability: "Applies to covered US workplaces when an OSHA standard requires an emergency action plan; it is not a global requirement.",
      verifiedOn: "2026-08-29",
      status: "Current regulation",
      editionNote: "Electronic Code of Federal Regulations content presented by OSHA.",
      org: "OSHA",
      type: "Emergency Action Plan",
      title: "29 CFR 1910.38 Emergency action plans",
      note: "US federal requirements for covered workplace emergency action plans, evacuation and accountability.",
      url: "https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.38"
    },
    {
      id: "osha-fight-or-flee",
      shortTitle: "OSHA Fight or Flee",
      jurisdiction: "United States",
      authority: "Federal workplace-safety guidance",
      access: "Open access — official eTool",
      applicability: "Decision support for US emergency action planning; firefighting roles require appropriate training, equipment and regulatory compliance.",
      verifiedOn: "2026-08-29",
      status: "Current",
      editionNote: "Part of OSHA's Evacuation Plans and Procedures eTool.",
      org: "OSHA",
      type: "Evacuation Decision",
      title: "Fight or Flee? Fire Extinguisher Use Decisions",
      note: "Guidance for deciding whether personnel evacuate or are designated and prepared to use extinguishers.",
      url: "https://www.osha.gov/etools/evacuation-plans-procedures/eap/fight-or-flee"
    },
    {
      id: "ifc-general-ehs",
      shortTitle: "IFC General EHS Guidelines",
      jurisdiction: "Global project-finance context",
      authority: "Development-finance guidance",
      access: "Open access — official publication page",
      applicability: "Good international industry practice; life and fire safety systems must meet local code and be designed and maintained by competent professionals.",
      verifiedOn: "2026-08-29",
      status: "Current edition; update underway",
      editionNote: "Underlying General EHS Guidelines were published in 2007 and are being updated by IFC.",
      org: "IFC",
      type: "EHS",
      title: "General Environmental, Health, and Safety Guidelines",
      note: "Cross-industry reference for emergency management and life-safety practice.",
      url: "https://www.ifc.org/en/insights-reports/general-environmental-health-and-safety-guidelines"
    },
    {
      id: "iso-22320-2018",
      shortTitle: "ISO 22320:2018",
      jurisdiction: "Global",
      authority: "International standard",
      access: "Official record — full standard not included",
      applicability: "Incident-management guidance for organizations of any type; it does not displace statutory emergency-service command.",
      verifiedOn: "2026-08-29",
      status: "Current",
      editionNote: "Published in 2018 and confirmed by ISO in 2024.",
      org: "ISO",
      type: "Incident Management",
      title: "ISO 22320:2018 Security and resilience — Emergency management — Guidelines for incident management",
      note: "Guidance for command, coordination, cooperation and operational information in incidents.",
      url: "https://www.iso.org/standard/67851.html"
    },
    {
      id: "ifrc-first-aid-2025",
      shortTitle: "IFRC First Aid Guidelines 2025",
      jurisdiction: "Global Red Cross and Red Crescent context",
      authority: "International humanitarian guidance",
      access: "Open access — official publication page and PDF",
      applicability: "Evidence-informed first-aid education guidance; responders must act within competence and local clinical or legal protocols.",
      verifiedOn: "2026-08-29",
      status: "Current",
      editionNote: "2025 edition published by IFRC on 18 March 2026; supersedes the 2020 edition.",
      org: "IFRC",
      type: "First Aid",
      title: "IFRC International First Aid, Resuscitation and Education Guidelines 2025",
      note: "Current evidence-informed guidance for first-aid and resuscitation education across the IFRC network.",
      url: "https://www.ifrc.org/document/ifrc-international-first-aid-resuscitation-and-education-guidelines-2025"
    },
    {
      id: "who-mass-casualty-emergency-units",
      shortTitle: "WHO Mass Casualty Management",
      jurisdiction: "Global health-system context",
      authority: "UN health guidance",
      access: "Open access — official program page",
      applicability: "Healthcare and emergency-unit guidance; it should not be treated as a generic corporate-site triage standard.",
      verifiedOn: "2026-08-29",
      status: "Current",
      editionNote: "Maintained WHO emergency and critical-care resource.",
      org: "WHO",
      type: "Mass Casualty",
      title: "Mass Casualty Management in Emergency Units",
      note: "Guidance for coordinated clinical capacity when casualty volume exceeds normal emergency-unit resources.",
      url: "https://www.who.int/teams/integrated-health-services/clinical-services-and-systems/emergency-and-critical-care/mass-casualty-management"
    }
  ],
  "security-of-production-and-operations": [
    {
      id: "nist-c-scrm-publications",
      shortTitle: "NIST C-SCRM Publications",
      jurisdiction: "United States; globally usable guidance",
      authority: "Government technical guidance",
      access: "Open access — official project page",
      applicability: "Cybersecurity supply-chain guidance for information and operational technology products and services; it does not cover every commercial supply risk.",
      verifiedOn: "2026-08-29",
      status: "Current resource collection",
      editionNote: "Maintained NIST Cybersecurity Supply Chain Risk Management publication index.",
      org: "NIST",
      type: "Supply Chain",
      title: "Cybersecurity Supply Chain Risk Management Publications",
      note: "Official collection for technology supply-chain dependency, due-diligence and risk-treatment guidance.",
      url: "https://csrc.nist.gov/Projects/cyber-supply-chain-risk-management/publications"
    },
    {
      id: "iso-28000-2022",
      shortTitle: "ISO 28000:2022",
      jurisdiction: "Global",
      authority: "International standard",
      access: "Official record — full standard not included",
      applicability: "Security-management-system requirements relevant to supply chains and organizations of any type; product safety and customs rules remain sector- and jurisdiction-specific.",
      verifiedOn: "2026-08-29",
      status: "Current",
      editionNote: "Second edition published in 2022 with Amendment 1:2024.",
      org: "ISO",
      type: "Security Systems",
      title: "ISO 28000:2022 Security and resilience — Security management systems — Requirements",
      note: "Requirements for an organizational security management system with supply-chain relevance.",
      url: "https://www.iso.org/standard/79612.html"
    },
    {
      id: "iso-31000-2018",
      shortTitle: "ISO 31000:2018",
      jurisdiction: "Global",
      authority: "International standard",
      access: "Official record — full standard not included",
      applicability: "General risk-management guidance; it is not a certifiable requirements standard and does not supply sector-specific controls.",
      verifiedOn: "2026-08-29",
      status: "Current; revision planned",
      editionNote: "Second edition published in 2018; ISO identifies the standard as current and to be revised.",
      org: "ISO",
      type: "Risk Management",
      title: "ISO 31000:2018 Risk management — Guidelines",
      note: "Cross-functional risk logic for operational dependencies and treatment decisions.",
      url: "https://www.iso.org/standard/65694.html"
    },
    {
      id: "nist-sp-800-161-r1",
      shortTitle: "NIST SP 800-161 Rev. 1",
      jurisdiction: "United States; globally usable guidance",
      authority: "Government technical guidance",
      access: "Open access — official publication and PDF",
      applicability: "Detailed cybersecurity supply-chain guidance for systems and organizations, focused on information and operational technology dependencies.",
      verifiedOn: "2026-08-29",
      status: "Current",
      editionNote: "Revision 1 with Update 1 published in November 2024.",
      org: "NIST",
      type: "Supply Chain",
      title: "NIST SP 800-161 Rev. 1 Cybersecurity Supply Chain Risk Management Practices for Systems and Organizations",
      note: "Detailed guidance for managing technology supplier and dependency risk across the system life cycle.",
      url: "https://csrc.nist.gov/pubs/sp/800/161/r1/upd1/final"
    },
    {
      id: "iso-9001-2015",
      shortTitle: "ISO 9001:2015",
      jurisdiction: "Global",
      authority: "International standard",
      access: "Official record — full standard not included",
      applicability: "Quality-management-system requirements for products and services; safety, recall and regulatory duties remain sector- and jurisdiction-specific.",
      verifiedOn: "2026-08-29",
      status: "Current; replacement edition under publication",
      editionNote: "2015 edition with Amendment 1:2024 remains current; a 2026 edition is expected in September 2026.",
      org: "ISO",
      type: "Quality Management",
      title: "ISO 9001:2015 Quality management systems — Requirements",
      note: "Quality-management requirements for dependable products, services and operational control.",
      url: "https://www.iso.org/standard/62085.html"
    },
    {
      id: "iso-ts-22318-2021",
      shortTitle: "ISO/TS 22318:2021",
      jurisdiction: "Global",
      authority: "International technical specification",
      access: "Official record — full specification not included",
      applicability: "Guidance for supply-chain continuity within a business continuity management system; commercial, customs and product obligations require separate validation.",
      verifiedOn: "2026-08-29",
      status: "Current",
      editionNote: "Second edition published in 2021 and confirmed by ISO in 2025.",
      org: "ISO",
      type: "Supply Continuity",
      title: "ISO/TS 22318:2021 Security and resilience — Business continuity management systems — Guidelines for supply chain continuity management",
      note: "Guidance for identifying and treating supply-chain continuity risks and dependencies.",
      url: "https://www.iso.org/standard/79001.html"
    }
  ],
  "environmental-safety": [
    {
      id: "iso-14001-2026",
      shortTitle: "ISO 14001:2026",
      jurisdiction: "Global",
      authority: "International standard",
      access: "Official record — full standard not included",
      applicability: "Environmental-management-system requirements; permits, emission limits and notification duties must be checked by location and activity.",
      verifiedOn: "2026-08-29",
      status: "Current",
      editionNote: "Fourth edition published on 15 April 2026; replaces withdrawn ISO 14001:2015.",
      org: "ISO",
      type: "Environmental Management",
      title: "ISO 14001:2026 Environmental management systems — Requirements with guidance for use",
      note: "Current international requirements for environmental management systems and continual improvement.",
      url: "https://www.iso.org/standard/14001"
    },
    {
      id: "ifc-general-ehs",
      shortTitle: "IFC General EHS Guidelines",
      jurisdiction: "Global project-finance context",
      authority: "Development-finance guidance",
      access: "Open access — official publication page",
      applicability: "Good international industry practice for relevant projects; local permits, legal limits and regulator directions take precedence.",
      verifiedOn: "2026-08-29",
      status: "Current edition; update underway",
      editionNote: "Underlying General EHS Guidelines were published in 2007 and are being updated by IFC.",
      org: "IFC",
      type: "EHS",
      title: "General Environmental, Health, and Safety Guidelines",
      note: "Cross-industry good practice for hazardous materials, pollution prevention, emissions and releases.",
      url: "https://www.ifc.org/en/insights-reports/general-environmental-health-and-safety-guidelines"
    },
    {
      id: "iso-50001-2018",
      shortTitle: "ISO 50001:2018",
      jurisdiction: "Global",
      authority: "International standard",
      access: "Official record — full standard not included",
      applicability: "Energy-management-system requirements; the standard does not by itself establish wider environmental or climate compliance.",
      verifiedOn: "2026-08-29",
      status: "Current",
      editionNote: "Second edition published in 2018 with Amendment 1:2024.",
      org: "ISO",
      type: "Energy Management",
      title: "ISO 50001:2018 Energy management systems — Requirements with guidance for use",
      note: "Requirements for systematic energy-performance improvement and operational energy management.",
      url: "https://www.iso.org/standard/69426.html"
    },
    {
      id: "who-chemical-incidents",
      shortTitle: "WHO Chemical Incidents",
      jurisdiction: "Global public-health context",
      authority: "UN health guidance",
      access: "Open access — official topic page",
      applicability: "High-level public-health context for chemical incidents; it is not a site engineering, process-safety or permit standard.",
      verifiedOn: "2026-08-29",
      status: "Current topic resource",
      editionNote: "Maintained WHO health-topic page.",
      org: "WHO",
      type: "Chemical Incidents",
      title: "Chemical Incidents",
      note: "Public-health context for preparedness and response to chemical releases and exposure events.",
      url: "https://www.who.int/health-topics/chemical-incidents/"
    },
    {
      id: "who-chemical-safety",
      shortTitle: "WHO Chemical Safety",
      jurisdiction: "Global public-health context",
      authority: "UN health guidance",
      access: "Open access — official topic page",
      applicability: "High-level health context for chemical exposure; technical controls and legal limits require competent local and sector-specific sources.",
      verifiedOn: "2026-08-29",
      status: "Current topic resource",
      editionNote: "Maintained WHO health-topic page.",
      org: "WHO",
      type: "Chemical Safety",
      title: "Chemical Safety",
      note: "Public-health context for hazardous substances, exposure prevention and chemical risk.",
      url: "https://www.who.int/health-topics/chemical-safety"
    }
  ],
  "information-and-cyber-security": [
    {
      id: "nist-csf-2-0",
      shortTitle: "NIST CSF 2.0",
      jurisdiction: "United States; globally usable framework",
      authority: "Government framework",
      access: "Open access — official publication and PDF",
      applicability: "Voluntary cyber-risk framework for organizations of any size; its six functions include Govern, while this matrix uses five operational phases and treats governance as cross-cutting.",
      verifiedOn: "2026-08-29",
      status: "Current",
      editionNote: "Version 2.0 published in February 2024.",
      org: "NIST",
      type: "Framework",
      title: "The NIST Cybersecurity Framework (CSF) 2.0",
      note: "Cyber-risk outcomes organized around Govern, Identify, Protect, Detect, Respond and Recover.",
      url: "https://www.nist.gov/publications/nist-cybersecurity-framework-csf-20"
    },
    {
      id: "cisa-cybersecurity-performance-goals",
      shortTitle: "CISA Cybersecurity Performance Goals",
      jurisdiction: "United States",
      authority: "Government guidance",
      access: "Open access — official program page",
      applicability: "Voluntary baseline outcomes designed especially for critical infrastructure; sector, legal and contractual requirements may be stricter.",
      verifiedOn: "2026-08-29",
      status: "Current",
      editionNote: "Maintained CISA cybersecurity performance-goals resource.",
      org: "CISA",
      type: "Baseline Controls",
      title: "Cross-Sector Cybersecurity Performance Goals",
      note: "Prioritized baseline cybersecurity outcomes for organizations and critical-infrastructure operators.",
      url: "https://www.cisa.gov/cybersecurity-performance-goals"
    },
    {
      id: "nist-sp-800-61-r3",
      shortTitle: "NIST SP 800-61 Rev. 3",
      jurisdiction: "United States; globally usable guidance",
      authority: "Government technical guidance",
      access: "Open access — official publication and PDF",
      applicability: "Cybersecurity incident-response guidance aligned to CSF 2.0; notification and evidence duties remain jurisdiction- and contract-specific.",
      verifiedOn: "2026-08-29",
      status: "Current",
      editionNote: "Final Revision 3 published in April 2025 and supersedes Revision 2.",
      org: "NIST",
      type: "Incident Response",
      title: "NIST SP 800-61 Rev. 3 Incident Response Recommendations and Considerations for Cybersecurity Risk Management: A CSF 2.0 Community Profile",
      note: "Current NIST incident-response guidance integrated with Cybersecurity Framework 2.0 outcomes.",
      url: "https://csrc.nist.gov/pubs/sp/800/61/r3/final"
    },
    {
      id: "iso-iec-27001-2022",
      shortTitle: "ISO/IEC 27001:2022",
      jurisdiction: "Global",
      authority: "International standard",
      access: "Official record — full standard not included",
      applicability: "Certifiable information-security-management-system requirements; privacy and sector obligations need separate legal assessment.",
      verifiedOn: "2026-08-29",
      status: "Current",
      editionNote: "Third edition published in 2022 with Amendment 1:2024.",
      org: "ISO",
      type: "ISMS",
      title: "ISO/IEC 27001:2022 Information security, cybersecurity and privacy protection — Information security management systems — Requirements",
      note: "International requirements for managing information-security risks through an information security management system.",
      url: "https://www.iso.org/standard/27001"
    },
    {
      id: "nist-sp-800-53-r5",
      shortTitle: "NIST SP 800-53 Rev. 5",
      jurisdiction: "United States; globally reusable catalog",
      authority: "Government technical guidance",
      access: "Open access — official publication, catalogs and PDF",
      applicability: "Security and privacy control catalog designed for information systems and organizations; selection and tailoring require a risk-based baseline.",
      verifiedOn: "2026-08-29",
      status: "Current",
      editionNote: "Revision 5 control material is current at Release 5.2.0, published on 27 August 2025.",
      org: "NIST",
      type: "Security Controls",
      title: "NIST SP 800-53 Rev. 5 Security and Privacy Controls for Information Systems and Organizations",
      note: "Extensive control catalog for secure system design, operations, assurance and resilience.",
      url: "https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final"
    },
    {
      id: "enisa-threat-landscape-2025",
      shortTitle: "ENISA Threat Landscape 2025",
      jurisdiction: "European Union",
      authority: "EU agency threat report",
      access: "Open access — official publication and PDF",
      applicability: "European threat context and horizon evidence; it is not a control standard or a substitute for organization-specific intelligence.",
      verifiedOn: "2026-08-29",
      status: "Current edition",
      editionNote: "Version 1.2 updated on 9 January 2026.",
      org: "ENISA",
      type: "Threat Intelligence",
      title: "ENISA Threat Landscape 2025",
      note: "European cross-sector analysis of material cyber threats, attack patterns and trends.",
      url: "https://www.enisa.europa.eu/publications/enisa-threat-landscape-2025"
    }
  ],
  "compliance-control": [
    {
      id: "unodc-uncac",
      shortTitle: "UN Convention against Corruption",
      jurisdiction: "States Parties",
      authority: "United Nations treaty",
      access: "Open access — official full text PDF",
      applicability: "Treaty obligations bind States Parties; corporate duties arise through applicable implementing law rather than directly and uniformly from the Convention.",
      verifiedOn: "2026-08-29",
      status: "In force",
      editionNote: "Convention adopted in 2003; ratification and national implementation must be checked by jurisdiction.",
      org: "UNODC",
      type: "Convention",
      title: "United Nations Convention against Corruption",
      note: "International anti-corruption treaty covering prevention, criminalization, cooperation and asset recovery.",
      url: "https://www.unodc.org/documents/treaties/UNCAC/Publications/Convention/08-50026_E.pdf"
    },
    {
      id: "unodc-business-integrity",
      shortTitle: "UNODC Business Integrity Portal",
      jurisdiction: "Global",
      authority: "United Nations implementation resource",
      access: "Open access — official resource portal",
      applicability: "Voluntary implementation resources for business integrity; users must validate legal duties and sector-specific requirements separately.",
      verifiedOn: "2026-08-29",
      status: "Current resource portal",
      editionNote: "Maintained UNODC business-focused resource collection.",
      org: "UNODC",
      type: "Business Integrity",
      title: "Business Integrity Portal",
      note: "Business-focused resources for designing and operating anti-corruption and integrity programmes.",
      url: "https://businessintegrity.unodc.org/bip/"
    },
    {
      id: "ungc-principle-10",
      shortTitle: "UN Global Compact Principle 10",
      jurisdiction: "Global voluntary initiative",
      authority: "Voluntary corporate principle",
      access: "Open access — official principle page",
      applicability: "Voluntary commitment for participating organizations; it is not law or a certification requirement.",
      verifiedOn: "2026-08-29",
      status: "Current voluntary principle",
      editionNote: "One of the Ten Principles of the UN Global Compact.",
      org: "UNGC",
      type: "Principle 10",
      title: "UN Global Compact Principle Ten: Anti-Corruption",
      note: "Voluntary corporate principle addressing corruption in all its forms, including extortion and bribery.",
      url: "https://unglobalcompact.org/what-is-gc/mission/principles/principle-10"
    },
    {
      id: "oecd-anti-bribery-recommendation-2021",
      shortTitle: "OECD Anti-Bribery Recommendation",
      jurisdiction: "OECD Anti-Bribery Convention Parties",
      authority: "Intergovernmental legal instrument",
      access: "Open access — official legal-instrument record",
      applicability: "Recommendation to adhering governments; corporate expectations depend on national law, enforcement and contractual context.",
      verifiedOn: "2026-08-29",
      status: "In force",
      editionNote: "Recommendation adopted on 26 November 2021 as OECD/LEGAL/0378.",
      org: "OECD",
      type: "Anti-Bribery",
      title: "Recommendation of the Council for Further Combating Bribery of Foreign Public Officials in International Business Transactions",
      note: "International benchmark for anti-bribery prevention, detection, enforcement and corporate compliance expectations.",
      url: "https://legalinstruments.oecd.org/en/instruments/OECD-LEGAL-0378"
    },
    {
      id: "iso-37001-2025",
      shortTitle: "ISO 37001:2025",
      jurisdiction: "Global",
      authority: "International standard",
      access: "Official record — full standard not included",
      applicability: "Anti-bribery management-system requirements; it does not cover the full compliance, whistleblowing or investigation landscape.",
      verifiedOn: "2026-08-29",
      status: "Current",
      editionNote: "Second edition published in 2025.",
      org: "ISO",
      type: "Anti-Bribery",
      title: "ISO 37001:2025 Anti-bribery management systems — Requirements with guidance for use",
      note: "Management-system requirements for preventing, detecting and responding to bribery.",
      url: "https://www.iso.org/standard/37001"
    },
    {
      id: "world-bank-integrity-smes",
      shortTitle: "World Bank Integrity Compliance",
      jurisdiction: "Global development and procurement context",
      authority: "Development-bank guidance",
      access: "Open access — official document record",
      applicability: "Practical guidance for small and medium-sized enterprises; procurement rules, sanctions and legal duties vary by institution and jurisdiction.",
      verifiedOn: "2026-08-29",
      status: "Current publication record",
      editionNote: "2024 final release; official World Bank document record verified in 2026.",
      org: "World Bank",
      type: "Integrity",
      title: "Integrity Compliance Programs for SMEs: Practical Guidance and Resources",
      note: "Practical guidance for organizations building proportionate anti-corruption and integrity capability.",
      url: "https://documents.worldbank.org/en/publication/documents-reports/documentdetail/099717003082422668"
    },
    {
      id: "iso-37301-2021",
      shortTitle: "ISO 37301:2021",
      jurisdiction: "Global",
      authority: "International standard",
      access: "Official record — full standard not included",
      applicability: "Compliance-management-system requirements; applicable obligations must be determined for each organization, activity and jurisdiction.",
      verifiedOn: "2026-08-29",
      status: "Current",
      editionNote: "First edition published in 2021 with Amendment 1:2024 and confirmed by ISO on 3 August 2026.",
      org: "ISO",
      type: "Compliance Management",
      title: "ISO 37301:2021 Compliance management systems — Requirements with guidance for use",
      note: "Requirements for an organization-wide compliance management system.",
      url: "https://www.iso.org/standard/75080.html"
    },
    {
      id: "iso-37002-2021",
      shortTitle: "ISO 37002:2021",
      jurisdiction: "Global",
      authority: "International standard",
      access: "Official record — full standard not included",
      applicability: "Guidance for internal whistleblowing management systems; reporter protection, privacy and investigation duties remain jurisdiction-specific.",
      verifiedOn: "2026-08-29",
      status: "Current",
      editionNote: "First edition published in 2021 and confirmed by ISO on 30 July 2026.",
      org: "ISO",
      type: "Whistleblowing",
      title: "ISO 37002:2021 Whistleblowing management systems — Guidelines",
      note: "Guidance for receiving, assessing, addressing and concluding reports of wrongdoing.",
      url: "https://www.iso.org/standard/65035.html"
    },
    {
      id: "iso-ts-37008-2023",
      shortTitle: "ISO/TS 37008:2023",
      jurisdiction: "Global",
      authority: "International technical specification",
      access: "Official record — full specification not included",
      applicability: "Guidance for internal investigations; employment rights, privilege, privacy, evidence handling and external reporting remain jurisdiction-specific.",
      verifiedOn: "2026-08-29",
      status: "Current",
      editionNote: "First edition published in 2023 and confirmed by ISO on 25 August 2026.",
      org: "ISO",
      type: "Internal Investigations",
      title: "ISO/TS 37008:2023 Internal investigations of organizations — Guidance",
      note: "Guidance for impartial, competent and appropriately governed internal investigations.",
      url: "https://www.iso.org/standard/74094.html"
    }
  ],
  "contingency-and-crisis-management": [
    {
      id: "iso-22301-2019",
      shortTitle: "ISO 22301:2019",
      jurisdiction: "Global",
      authority: "International standard",
      access: "Official record — full standard not included",
      applicability: "Certifiable business-continuity-management-system requirements; recovery objectives and obligations must be calibrated to the organization.",
      verifiedOn: "2026-08-29",
      status: "Current; revision in development",
      editionNote: "Second edition published in 2019 with Amendment 1:2024; a revision is in development.",
      org: "ISO",
      type: "Business Continuity",
      title: "ISO 22301:2019 Security and resilience — Business continuity management systems — Requirements",
      note: "Requirements for continuity planning, resilience capability and recovery governance.",
      url: "https://www.iso.org/standard/75106.html"
    },
    {
      id: "undrr-sendai-framework",
      shortTitle: "Sendai Framework 2015–2030",
      jurisdiction: "Global intergovernmental policy context",
      authority: "United Nations framework",
      access: "Open access — official publication page",
      applicability: "Non-binding disaster-risk-reduction framework led by States and relevant stakeholders; it is not a corporate continuity standard.",
      verifiedOn: "2026-08-29",
      status: "Current framework period",
      editionNote: "Adopted in 2015 and applies through 2030.",
      org: "UNDRR",
      type: "Resilience",
      title: "Sendai Framework for Disaster Risk Reduction 2015–2030",
      note: "Global policy framework emphasizing risk understanding, governance, preparedness and build back better.",
      url: "https://www.undrr.org/publication/sendai-framework-disaster-risk-reduction-2015-2030"
    },
    {
      id: "iso-31000-2018",
      shortTitle: "ISO 31000:2018",
      jurisdiction: "Global",
      authority: "International standard",
      access: "Official record — full standard not included",
      applicability: "General risk-management guidance; it does not define crisis command, recovery targets or legal priorities for an organization.",
      verifiedOn: "2026-08-29",
      status: "Current; revision planned",
      editionNote: "Second edition published in 2018; ISO identifies the standard as current and to be revised.",
      org: "ISO",
      type: "Risk Management",
      title: "ISO 31000:2018 Risk management — Guidelines",
      note: "Cross-enterprise risk logic for governance, escalation and recovery decisions.",
      url: "https://www.iso.org/standard/65694.html"
    },
    {
      id: "iso-22398-2013",
      shortTitle: "ISO 22398:2013",
      jurisdiction: "Global",
      authority: "International standard",
      access: "Official record — full standard not included",
      applicability: "Generic exercise guidance; exercise objectives, safeguards and evaluation criteria must be tailored to the organization and scenario.",
      verifiedOn: "2026-08-29",
      status: "Current",
      editionNote: "Published in 2013 and confirmed by ISO.",
      org: "ISO",
      type: "Exercises",
      title: "ISO 22398:2013 Societal security — Guidelines for exercises",
      note: "Guidance for planning, conducting and improving preparedness and continuity exercises.",
      url: "https://www.iso.org/standard/50294.html"
    },
    {
      id: "who-health-edrm",
      shortTitle: "WHO Health EDRM Framework",
      jurisdiction: "Global health and public-sector context",
      authority: "UN health framework",
      access: "Open access — official repository record and PDF",
      applicability: "Health emergency and disaster-risk-management framework; it is not a generic corporate business-continuity standard.",
      verifiedOn: "2026-08-29",
      status: "Current publication",
      editionNote: "Published in 2019.",
      org: "WHO",
      type: "Health EDRM",
      title: "Health Emergency and Disaster Risk Management Framework",
      note: "Public-health framework for preparedness, response and recovery across health emergencies and disasters.",
      url: "https://iris.who.int/handle/10665/326106"
    },
    {
      id: "iso-22361-2022",
      shortTitle: "ISO 22361:2022",
      jurisdiction: "Global",
      authority: "International standard",
      access: "Official record — full standard not included",
      applicability: "Guidance for strategic crisis-management capability; it does not replace incident-specific statutory command or professional emergency response.",
      verifiedOn: "2026-08-29",
      status: "Current",
      editionNote: "First edition published in 2022.",
      org: "ISO",
      type: "Crisis Management",
      title: "ISO 22361:2022 Security and resilience — Crisis management — Guidelines",
      note: "Guidance for building strategic crisis leadership, decision-making and communication capability.",
      url: "https://www.iso.org/standard/50267.html"
    },
    {
      id: "iso-ts-22317-2021",
      shortTitle: "ISO/TS 22317:2021",
      jurisdiction: "Global",
      authority: "International technical specification",
      access: "Official record — full specification not included",
      applicability: "Guidance for formal business impact analysis within a continuity program; impact criteria and recovery objectives require organizational approval.",
      verifiedOn: "2026-08-29",
      status: "Current",
      editionNote: "Second edition published in 2021.",
      org: "ISO",
      type: "Business Impact Analysis",
      title: "ISO/TS 22317:2021 Security and resilience — Business continuity management systems — Guidelines for business impact analysis",
      note: "Guidance for identifying priority activities, impacts, dependencies and time-based recovery needs.",
      url: "https://www.iso.org/standard/79000.html"
    }
  ],
  "industrial-safety": [
    {
      id: "ilo-osh-2001",
      shortTitle: "ILO-OSH 2001",
      jurisdiction: "Global",
      authority: "International labour guidance",
      access: "Open access — official publication page",
      applicability: "Non-binding guidance for occupational safety and health management systems; national labour law and sector rules remain controlling.",
      verifiedOn: "2026-08-29",
      status: "Current guidance",
      editionNote: "Published on 6 December 2001 and maintained by ILO as an OSH management-system reference.",
      org: "ILO",
      type: "OSH",
      title: "Guidelines on occupational safety and health management systems, ILO-OSH 2001",
      note: "System-focused guidance for employer accountability, worker participation and continual occupational safety improvement.",
      url: "https://www.ilo.org/resource/guidelines-occupational-safety-and-health-management-systems-ilo-osh-2001"
    },
    {
      id: "iso-45001-2018",
      shortTitle: "ISO 45001:2018",
      jurisdiction: "Global",
      authority: "International standard",
      access: "Official record — full standard not included",
      applicability: "Certifiable occupational health and safety management-system requirements; local law and sector-specific hazards still determine controls.",
      verifiedOn: "2026-08-29",
      status: "Current; revision in development",
      editionNote: "First edition published in 2018 with Amendment 1:2024; a revision is in development.",
      org: "ISO",
      type: "OH&S",
      title: "ISO 45001:2018 Occupational health and safety management systems — Requirements with guidance for use",
      note: "Requirements for managing occupational risks through accountable systems and worker participation.",
      url: "https://www.iso.org/standard/63787.html"
    },
    {
      id: "ifc-general-ehs-ohs",
      shortTitle: "IFC General EHS — OHS",
      jurisdiction: "Global project-finance context",
      authority: "Development-finance guidance",
      access: "Open access — official chapter PDF",
      applicability: "Good international industry practice for relevant projects; local labour, safety and technical requirements remain controlling.",
      verifiedOn: "2026-08-29",
      status: "Current edition; update underway",
      editionNote: "Occupational Health and Safety chapter of the 2007 General EHS Guidelines; IFC is updating the guidelines.",
      org: "IFC",
      type: "EHS",
      title: "General Environmental, Health, and Safety Guidelines — Occupational Health and Safety",
      note: "Cross-industry good practice for workplace hazards, control hierarchy, training and safe operations.",
      url: "https://www.ifc.org/content/dam/ifc/doc/2000/2007-general-ehs-guidelines-occupational-health-and-safety-en.pdf"
    },
    {
      id: "ilo-c155",
      shortTitle: "ILO Convention No. 155",
      jurisdiction: "Ratifying ILO member States",
      authority: "International labour convention",
      access: "Open access — official NORMLEX record",
      applicability: "Treaty obligations bind ratifying States; employer and worker rights and duties arise through applicable national implementation.",
      verifiedOn: "2026-08-29",
      status: "In force; fundamental convention",
      editionNote: "Adopted in 1981; ratification status and national implementation must be checked by jurisdiction.",
      org: "ILO",
      type: "Convention",
      title: "Occupational Safety and Health Convention, 1981 (No. 155)",
      note: "International labour instrument for coherent occupational safety policy, employer duties and worker participation.",
      url: "https://normlex.ilo.org/dyn/nrmlx_en/f?p=NORMLEXPUB%3A12100%3A0%3A%3ANO%3A%3AP12100_ILO_CODE%3AC155"
    },
    {
      id: "who-occupational-health",
      shortTitle: "WHO Occupational Health",
      jurisdiction: "Global public-health context",
      authority: "UN health guidance",
      access: "Open access — official topic page",
      applicability: "High-level occupational-health context; it does not replace workplace hazard standards, clinical protocols or local law.",
      verifiedOn: "2026-08-29",
      status: "Current topic resource",
      editionNote: "Maintained WHO health-topic page.",
      org: "WHO",
      type: "Worker Health",
      title: "Occupational Health",
      note: "Public-health context for preventing work-related injury and illness and improving working conditions.",
      url: "https://www.who.int/health-topics/occupational-health"
    },
    {
      id: "ilo-worker-health-surveillance",
      shortTitle: "ILO Worker Health Surveillance",
      jurisdiction: "Global",
      authority: "International labour guidance",
      access: "Open access — official publication page",
      applicability: "Ethical guidance for justified occupational health surveillance; confidentiality, consent and legal requirements must be applied locally.",
      verifiedOn: "2026-08-29",
      status: "Published guidance",
      editionNote: "Published on 1 January 1998; currency and local clinical protocols should be reviewed before use.",
      org: "ILO",
      type: "Health Surveillance",
      title: "Technical and Ethical Guidelines for Workers' Health Surveillance",
      note: "Principles for proportionate, confidential and professionally governed worker health surveillance.",
      url: "https://www.ilo.org/publications/technical-and-ethical-guidelines-workers-health-surveillance"
    },
    {
      id: "ilo-managing-disability",
      shortTitle: "ILO Managing Disability at Work",
      jurisdiction: "Global",
      authority: "International labour code of practice",
      access: "Open access — official publication page",
      applicability: "Non-binding workplace guidance; return-to-work, adjustment, confidentiality and non-discrimination duties depend on local law.",
      verifiedOn: "2026-08-29",
      status: "Published guidance",
      editionNote: "ILO code of practice published on 13 February 2002; apply it in the context of current national law and practice.",
      org: "ILO",
      type: "Disability and Return to Work",
      title: "Managing Disability in the Workplace: ILO Code of Practice",
      note: "Guidance for inclusive retention, adjustment and return-to-work practices.",
      url: "https://www.ilo.org/publications/managing-disability-workplace-ilo-code-practice"
    },
    {
      id: "ilo-psychosocial-risks",
      shortTitle: "ILO Psychosocial Risks",
      jurisdiction: "Global",
      authority: "International labour guidance",
      access: "Open access — official resource page",
      applicability: "Work-design and organizational-risk guidance; mental-health conditions must not be used as a proxy for misconduct or threat.",
      verifiedOn: "2026-08-29",
      status: "Current resource",
      editionNote: "ILO occupational safety and health resource published on 10 November 2022.",
      org: "ILO",
      type: "Psychosocial Risk",
      title: "Psychosocial Risks and Stress at Work",
      note: "Guidance context for addressing workload, control, support, violence and other work-related psychosocial hazards.",
      url: "https://www.ilo.org/resource/psychosocial-risks-and-stress-work"
    }
  ]
};

// These mappings identify contextual sources for each domain phase. They do not
// claim entry-level provenance, demonstrate compliance or replace applicability review.
const phaseEvidenceByDomain = {
  "personnel-security": {
    identify: {
      relationship: "context",
      sourceIds: ["iso-31030-2021", "cisa-employment-screening", "who-mental-health-at-work"]
    },
    protect: {
      relationship: "context",
      sourceIds: ["cisa-personal-security", "cisa-insider-threat-resources", "ilo-c190"]
    },
    detect: {
      relationship: "context",
      sourceIds: ["cisa-insider-threat-resources", "who-mental-health-at-work"]
    },
    respond: {
      relationship: "context",
      sourceIds: ["cisa-personal-security", "ilo-c190", "who-mental-health-at-work"]
    },
    recover: {
      relationship: "context",
      sourceIds: ["iso-31030-2021", "ilo-c190", "who-mental-health-at-work"]
    }
  },
  "premises-security": {
    identify: {
      relationship: "context",
      sourceIds: ["cisa-hometown-security", "iso-22341-2021", "cisa-be-air-aware"]
    },
    protect: {
      relationship: "context",
      sourceIds: ["cisa-hometown-security", "iso-22341-2021", "iso-22342-2023"]
    },
    detect: {
      relationship: "context",
      sourceIds: ["cisa-hometown-security", "cisa-be-air-aware", "ifc-general-ehs"]
    },
    respond: {
      relationship: "context",
      sourceIds: ["iso-22342-2023", "cisa-be-air-aware", "ifc-general-ehs"]
    },
    recover: {
      relationship: "context",
      sourceIds: ["iso-22342-2023", "ifc-general-ehs"]
    }
  },
  "rescue-safety": {
    identify: {
      relationship: "context",
      sourceIds: ["osha-emergency-preparedness", "osha-1910-38", "iso-22320-2018"]
    },
    protect: {
      relationship: "context",
      sourceIds: ["ifc-general-ehs", "osha-fight-or-flee", "osha-1910-38"]
    },
    detect: {
      relationship: "context",
      sourceIds: ["ifc-general-ehs", "iso-22320-2018"]
    },
    respond: {
      relationship: "context",
      sourceIds: ["iso-22320-2018", "ifrc-first-aid-2025", "who-mass-casualty-emergency-units"]
    },
    recover: {
      relationship: "context",
      sourceIds: ["osha-emergency-preparedness", "ifrc-first-aid-2025", "who-mass-casualty-emergency-units"]
    }
  },
  "security-of-production-and-operations": {
    identify: {
      relationship: "context",
      sourceIds: ["iso-31000-2018", "nist-c-scrm-publications", "iso-ts-22318-2021"]
    },
    protect: {
      relationship: "context",
      sourceIds: ["iso-28000-2022", "iso-9001-2015", "nist-sp-800-161-r1"]
    },
    detect: {
      relationship: "context",
      sourceIds: ["iso-9001-2015", "nist-sp-800-161-r1", "iso-28000-2022"]
    },
    respond: {
      relationship: "context",
      sourceIds: ["iso-28000-2022", "iso-ts-22318-2021", "nist-sp-800-161-r1"]
    },
    recover: {
      relationship: "context",
      sourceIds: ["iso-ts-22318-2021", "iso-9001-2015", "iso-31000-2018"]
    }
  },
  "environmental-safety": {
    identify: {
      relationship: "context",
      sourceIds: ["iso-14001-2026", "who-chemical-safety", "who-chemical-incidents"]
    },
    protect: {
      relationship: "context",
      sourceIds: ["iso-14001-2026", "ifc-general-ehs", "iso-50001-2018"]
    },
    detect: {
      relationship: "context",
      sourceIds: ["iso-14001-2026", "ifc-general-ehs", "who-chemical-safety"]
    },
    respond: {
      relationship: "context",
      sourceIds: ["ifc-general-ehs", "who-chemical-incidents", "iso-14001-2026"]
    },
    recover: {
      relationship: "context",
      sourceIds: ["iso-14001-2026", "iso-50001-2018", "ifc-general-ehs"]
    }
  },
  "information-and-cyber-security": {
    identify: {
      relationship: "context",
      sourceIds: ["nist-csf-2-0", "nist-sp-800-53-r5", "enisa-threat-landscape-2025"]
    },
    protect: {
      relationship: "context",
      sourceIds: ["cisa-cybersecurity-performance-goals", "iso-iec-27001-2022", "nist-sp-800-53-r5"]
    },
    detect: {
      relationship: "context",
      sourceIds: ["cisa-cybersecurity-performance-goals", "nist-sp-800-53-r5", "enisa-threat-landscape-2025"]
    },
    respond: {
      relationship: "context",
      sourceIds: ["nist-sp-800-61-r3", "nist-csf-2-0", "iso-iec-27001-2022"]
    },
    recover: {
      relationship: "context",
      sourceIds: ["nist-sp-800-61-r3", "nist-csf-2-0", "iso-iec-27001-2022"]
    }
  },
  "compliance-control": {
    identify: {
      relationship: "context",
      sourceIds: ["unodc-uncac", "iso-37301-2021", "oecd-anti-bribery-recommendation-2021"]
    },
    protect: {
      relationship: "context",
      sourceIds: ["iso-37001-2025", "iso-37301-2021", "ungc-principle-10"]
    },
    detect: {
      relationship: "context",
      sourceIds: ["iso-37002-2021", "unodc-business-integrity", "world-bank-integrity-smes"]
    },
    respond: {
      relationship: "context",
      sourceIds: ["iso-ts-37008-2023", "iso-37002-2021", "unodc-uncac"]
    },
    recover: {
      relationship: "context",
      sourceIds: ["iso-37301-2021", "iso-ts-37008-2023", "world-bank-integrity-smes"]
    }
  },
  "contingency-and-crisis-management": {
    identify: {
      relationship: "context",
      sourceIds: ["iso-ts-22317-2021", "iso-31000-2018", "undrr-sendai-framework"]
    },
    protect: {
      relationship: "context",
      sourceIds: ["iso-22301-2019", "iso-22361-2022", "who-health-edrm"]
    },
    detect: {
      relationship: "context",
      sourceIds: ["iso-22301-2019", "iso-22398-2013", "iso-ts-22317-2021"]
    },
    respond: {
      relationship: "context",
      sourceIds: ["iso-22361-2022", "undrr-sendai-framework", "who-health-edrm"]
    },
    recover: {
      relationship: "context",
      sourceIds: ["iso-22301-2019", "iso-22398-2013", "iso-ts-22317-2021"]
    }
  },
  "industrial-safety": {
    identify: {
      relationship: "context",
      sourceIds: ["iso-45001-2018", "ilo-osh-2001", "who-occupational-health"]
    },
    protect: {
      relationship: "context",
      sourceIds: ["ifc-general-ehs-ohs", "ilo-c155", "ilo-psychosocial-risks"]
    },
    detect: {
      relationship: "context",
      sourceIds: ["ilo-worker-health-surveillance", "iso-45001-2018", "who-occupational-health"]
    },
    respond: {
      relationship: "context",
      sourceIds: ["ifc-general-ehs-ohs", "ilo-c155", "ilo-osh-2001"]
    },
    recover: {
      relationship: "context",
      sourceIds: ["ilo-managing-disability", "ilo-worker-health-surveillance", "ilo-psychosocial-risks"]
    }
  }
};
