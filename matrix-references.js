const referencesByDomain = {
  "personnel-security": [
    {
      org: "ISO",
      type: "Travel Risk",
      title: "ISO 31030:2021 Travel risk management",
      note: "Global guidance for business travel risk, duty of care and traveller protection.",
      url: "https://www.iso.org/standard/54204.html"
    },
    {
      org: "CISA",
      type: "Personal Security",
      title: "Personal Security Considerations Action Guide",
      note: "Operational guidance on reducing targeted personal risk to staff and leadership.",
      url: "https://www.cisa.gov/resources-tools/resources/personal-security-considerations-action-guide"
    },
    {
      org: "ILO",
      type: "Convention",
      title: "Violence and Harassment Convention, 2019 (No. 190)",
      note: "Global labour baseline for preventing violence and harassment in the world of work.",
      url: "https://www.ilo.org/resource/ilc/108/violence-and-harassment-convention-2019-no-190"
    },
    {
      org: "WHO",
      type: "Workplace Health",
      title: "WHO Guidelines on Mental Health at Work",
      note: "Global guidance on psychosocial risk, worker wellbeing and protective workplace practices.",
      url: "https://www.who.int/publications/i/item/9789240053052"
    }
  ],
  "premises-security": [
    {
      org: "CISA",
      type: "Physical Security",
      title: "Physical Security",
      note: "Primary operational guidance for layered physical security and resilience.",
      url: "https://www.cisa.gov/topics/physical-security"
    },
    {
      org: "IFC",
      type: "Facility Safety",
      title: "General Environmental, Health, and Safety Guidelines",
      note: "Good international industry practice for facility, life-safety and site controls.",
      url: "https://www.ifc.org/en/insights-reports/general-environmental-health-and-safety-guidelines"
    },
    {
      org: "ISO",
      type: "Protective Security",
      title: "ISO 22341:2021 Security and resilience — Protective security — Guidelines for crime prevention through environmental design",
      note: "International guidance for site design choices that reduce crime opportunity and strengthen physical protection.",
      url: "https://www.iso.org/standard/50078.html"
    },
    {
      org: "ISO",
      type: "Security Planning",
      title: "ISO 22342:2023 Security and resilience — Protective security — Guidelines for the development of a security plan for an organization",
      note: "Structure for turning security risk assessment into an actionable organizational security plan.",
      url: "https://www.iso.org/standard/50079.html"
    }
  ],
  "rescue-safety": [
    {
      org: "OSHA",
      type: "Emergency Preparedness",
      title: "Emergency Preparedness and Response: Getting Started",
      note: "Practical baseline for workplace emergency organization and readiness.",
      url: "https://www.osha.gov/emergency-preparedness/getting-started"
    },
    {
      org: "OSHA",
      type: "Emergency Action Plan",
      title: "29 CFR 1910.38 Emergency action plans",
      note: "Core requirements for emergency action planning, evacuation and accountability.",
      url: "https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.38"
    },
    {
      org: "IFC",
      type: "EHS",
      title: "General Environmental, Health, and Safety Guidelines",
      note: "Cross-industry reference for emergency management and life-safety practice.",
      url: "https://www.ifc.org/en/insights-reports/general-environmental-health-and-safety-guidelines"
    },
    {
      org: "ISO",
      type: "Incident Management",
      title: "ISO 22320:2018 Security and resilience — Emergency management — Guidelines for incident management",
      note: "International incident-management guidance for command, coordination and information flow.",
      url: "https://www.iso.org/standard/67851.html"
    },
    {
      org: "IFRC",
      type: "First Aid",
      title: "International First Aid, Resuscitation and Education Guidelines 2020",
      note: "Global first-aid and emergency-care reference used across Red Cross and Red Crescent networks.",
      url: "https://www.ifrc.org/sites/default/files/2022-02/EN_GFARC_GUIDELINES_2020.pdf"
    },
    {
      org: "WHO",
      type: "Mass Casualty",
      title: "Mass Casualty Management",
      note: "WHO guidance for building coordinated emergency-service capacity in high-impact incidents.",
      url: "https://www.who.int/teams/integrated-health-services/clinical-services-and-systems/emergency-and-critical-care/mass-casualty-management"
    }
  ],
  "security-of-production-and-operations": [
    {
      org: "NIST",
      type: "Supply Chain",
      title: "Cybersecurity Supply Chain Risk Management Publications",
      note: "Primary source for supply-chain dependency mapping and risk treatment.",
      url: "https://csrc.nist.gov/Projects/cyber-supply-chain-risk-management/publications"
    },
    {
      org: "ISO",
      type: "Security Systems",
      title: "ISO 28000:2022 Security and resilience — Security management systems — Requirements",
      note: "Requirements for security management systems with supply chain relevance.",
      url: "https://www.iso.org/standard/79612.html"
    },
    {
      org: "ISO",
      type: "Risk Management",
      title: "ISO 31000:2018 Risk management — Guidelines",
      note: "Cross-functional risk logic for operational continuity and treatment decisions.",
      url: "https://www.iso.org/standard/65694.html"
    },
    {
      org: "NIST",
      type: "Supply Chain",
      title: "SP 800-161 Rev. 1 Cybersecurity Supply Chain Risk Management Practices for Systems and Organizations",
      note: "Detailed guidance for managing supplier, technology and dependency risk in complex operations.",
      url: "https://csrc.nist.gov/pubs/sp/800/161/r1/upd1/final"
    },
    {
      org: "ISO",
      type: "Quality Management",
      title: "ISO 9001:2015 Quality management systems — Requirements",
      note: "Global quality-management baseline for dependable products, services and operational control.",
      url: "https://www.iso.org/standard/62085.html"
    }
  ],
  "environmental-safety": [
    {
      org: "ISO",
      type: "Environmental Management",
      title: "ISO 14001:2015 Environmental management systems",
      note: "Global baseline for environmental management systems and compliance structure.",
      url: "https://www.iso.org/standard/60857.html"
    },
    {
      org: "IFC",
      type: "EHS",
      title: "General Environmental, Health, and Safety Guidelines",
      note: "Good international industry practice for spills, emissions and hazardous materials.",
      url: "https://www.ifc.org/en/insights-reports/general-environmental-health-and-safety-guidelines"
    },
    {
      org: "ISO",
      type: "Energy Management",
      title: "ISO 50001:2018 Energy management systems",
      note: "Energy-performance baseline with operational and sustainability relevance.",
      url: "https://www.iso.org/standard/69426.html"
    },
    {
      org: "WHO",
      type: "Chemical Incidents",
      title: "Chemical Incidents",
      note: "Global public-health reference for preparedness and response to chemical releases and exposure events.",
      url: "https://www.who.int/health-topics/chemical-incidents/"
    },
    {
      org: "WHO",
      type: "Chemical Safety",
      title: "Chemical Safety",
      note: "WHO guidance base for hazardous substances, exposure risk and preventive controls.",
      url: "https://www.who.int/health-topics/chemical-safety"
    }
  ],
  "information-and-cyber-security": [
    {
      org: "NIST",
      type: "Framework",
      title: "Cybersecurity Framework 2.0",
      note: "Global cyber-risk baseline with lifecycle logic aligned to the matrix phases.",
      url: "https://www.nist.gov/cyberframework"
    },
    {
      org: "CISA",
      type: "Baseline Controls",
      title: "Cross-Sector Cybersecurity Performance Goals",
      note: "Practical baseline measures for organizations of different sizes and sectors.",
      url: "https://www.cisa.gov/cross-sector-cybersecurity-performance-goals"
    },
    {
      org: "NIST",
      type: "Incident Response",
      title: "SP 800-61 Rev. 3 Incident Response Recommendations and Considerations for Cybersecurity Risk Management",
      note: "Current NIST incident response guidance aligned with CSF 2.0.",
      url: "https://csrc.nist.gov/pubs/sp/800/61/r3/final"
    },
    {
      org: "ISO",
      type: "ISMS",
      title: "ISO/IEC 27001:2022 Information security management systems",
      note: "Widely adopted international requirements for managing information-security risk.",
      url: "https://www.iso.org/standard/27001"
    },
    {
      org: "NIST",
      type: "Security Controls",
      title: "SP 800-53 Rev. 5 Security and Privacy Controls for Information Systems and Organizations",
      note: "Deep control catalog for secure system design, operations, assurance and resilience.",
      url: "https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final"
    },
    {
      org: "ENISA",
      type: "Threat Intelligence",
      title: "ENISA Threat Landscape 2025",
      note: "European Union threat baseline with broad cross-sector cyber risk and attack trend analysis.",
      url: "https://www.enisa.europa.eu/publications/enisa-threat-landscape-2025"
    }
  ],
  "compliance-control": [
    {
      org: "UNODC",
      type: "Convention",
      title: "United Nations Convention against Corruption",
      note: "Universal anti-corruption instrument covering prevention, criminalization and recovery.",
      url: "https://www.unodc.org/pdf/corruption/publications_unodc_convention-e.pdf"
    },
    {
      org: "UNODC",
      type: "Business Integrity",
      title: "Business Integrity Portal",
      note: "Business-focused implementation resources for integrity and anti-corruption programmes.",
      url: "https://businessintegrity.unodc.org/bip/"
    },
    {
      org: "UNGC",
      type: "Principle 10",
      title: "UN Global Compact Principle Ten: Anti-Corruption",
      note: "Global corporate integrity baseline for bribery, extortion and supply-chain conduct.",
      url: "https://unglobalcompact.org/what-is-gc/mission/principles/principle-10"
    },
    {
      org: "OECD",
      type: "Anti-Bribery",
      title: "2021 OECD Anti-Bribery Recommendation Overview",
      note: "International benchmark for anti-bribery controls, enforcement expectations and integrity governance.",
      url: "https://www.oecd.org/content/dam/oecd/en/topics/policy-issues/anti-corruption-and-integrity/2021-oecd-anti-bribery-recommendation-overview.pdf"
    },
    {
      org: "ISO",
      type: "Anti-Bribery",
      title: "ISO 37001:2025 Anti-bribery management systems — Requirements with guidance for use",
      note: "International management-system requirements for anti-bribery governance and controls.",
      url: "https://www.iso.org/standard/37001"
    },
    {
      org: "World Bank",
      type: "Integrity",
      title: "Integrity Compliance Programs for SMEs",
      note: "Practical anti-corruption and integrity guidance from the World Bank for organizations building compliance capability.",
      url: "https://openknowledge.worldbank.org/entities/publication/9bf2cf98-510c-47ef-a1dc-7f440ed08649"
    }
  ],
  "contingency-and-crisis-management": [
    {
      org: "ISO",
      type: "Business Continuity",
      title: "ISO 22301:2019 Security and resilience — Business continuity management systems — Requirements",
      note: "Primary standard for continuity planning, resilience and recovery governance.",
      url: "https://www.iso.org/standard/75106.html"
    },
    {
      org: "UNDRR",
      type: "Resilience",
      title: "Sendai Framework for Disaster Risk Reduction 2015-2030",
      note: "Global resilience model emphasizing understanding risk, preparedness and build-back-better.",
      url: "https://globalplatform.undrr.org/2022/sites/default/files/2022-04/Sendai%20Framework%20for%20Disaster%20Risk%20Reduction%202015%20-%202030.pdf"
    },
    {
      org: "ISO",
      type: "Risk Management",
      title: "ISO 31000:2018 Risk management — Guidelines",
      note: "Cross-enterprise risk logic for governance, escalation and recovery decisions.",
      url: "https://www.iso.org/standard/65694.html"
    },
    {
      org: "ISO",
      type: "Exercises",
      title: "ISO 22398:2013 Societal security — Guidelines for exercises",
      note: "Practical standard for testing continuity, preparedness and crisis-management capability through structured exercises.",
      url: "https://www.iso.org/standard/50294.html"
    },
    {
      org: "WHO",
      type: "Health EDRM",
      title: "Health Emergency and Disaster Risk Management Framework",
      note: "Global framework for preparedness, response and recovery across health and disaster contexts.",
      url: "https://iris.who.int/handle/10665/326106"
    }
  ],
  "industrial-safety": [
    {
      org: "ILO",
      type: "OSH",
      title: "ILO-OSH 2001 Guidelines on occupational safety and health management systems",
      note: "International labour baseline for integrated occupational safety management.",
      url: "https://www.ilo.org/publications/guidelines-occupational-safety-and-health-management-systems-ilo-osh-2001"
    },
    {
      org: "ISO",
      type: "OH&S",
      title: "ISO 45001:2018 Occupational health and safety management systems",
      note: "Global management-system requirements for workplace health and safety.",
      url: "https://www.iso.org/standard/63787.html"
    },
    {
      org: "IFC",
      type: "EHS",
      title: "General Environmental, Health, and Safety Guidelines",
      note: "Good international industry practice for workforce safety and site operations.",
      url: "https://www.ifc.org/en/insights-reports/general-environmental-health-and-safety-guidelines"
    },
    {
      org: "ILO",
      type: "Convention",
      title: "Occupational Safety and Health Convention, 1981 (No. 155)",
      note: "Foundational international labour convention for employer duties and worker protection.",
      url: "https://www.ilo.org/resource/other/occupational-safety-and-health-convention-no-155-fundamental-convention"
    },
    {
      org: "WHO",
      type: "Worker Health",
      title: "Protecting Workers' Health",
      note: "WHO baseline on occupational health risks, preventive systems and worker wellbeing.",
      url: "https://www.who.int/news-room/fact-sheets/detail/protecting-workers%27-health"
    }
  ]
};
