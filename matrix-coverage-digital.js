(() => {
  "use strict";

  // Draft management discussion aids, not legal, engineering or incident instructions.
  // Source dates record retrieval; they do not imply competent human content approval.
  globalThis.CSMCoverageShards = globalThis.CSMCoverageShards || {};
  globalThis.CSMCoverageShards.digital = {
    sources: [
      {
        id: "COV-S-DIGITAL-OT",
        title: "NIST SP 800-82 Revision 3: Guide to Operational Technology Security (final, 2023)",
        authority: "National Institute of Standards and Technology",
        url: "https://csrc.nist.gov/pubs/sp/800/82/r3/final",
        reviewedOn: "2026-10-09"
      },
      {
        id: "COV-S-DIGITAL-SSDF",
        title: "NIST SP 800-218: Secure Software Development Framework Version 1.1 (final)",
        authority: "National Institute of Standards and Technology",
        url: "https://csrc.nist.gov/pubs/sp/800/218/final",
        reviewedOn: "2026-10-09"
      },
      {
        id: "COV-S-DIGITAL-AI",
        title: "NIST AI 600-1: Artificial Intelligence Risk Management Framework, Generative Artificial Intelligence Profile",
        authority: "National Institute of Standards and Technology",
        url: "https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-generative-artificial-intelligence",
        reviewedOn: "2026-10-09"
      },
      {
        id: "COV-S-DIGITAL-GDPR",
        title: "Regulation (EU) 2016/679: General Data Protection Regulation",
        authority: "European Union, EUR-Lex",
        url: "https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng",
        reviewedOn: "2026-10-09"
      },
      {
        id: "COV-S-DIGITAL-EXPORT",
        title: "Export control guidance for companies",
        authority: "Ministry for Foreign Affairs of Finland",
        url: "https://um.fi/vientivalvontaohjeistus-yrityksille",
        reviewedOn: "2026-10-09"
      },
      {
        id: "COV-S-DIGITAL-SANCTIONS",
        title: "What are sanctions? Finnish foreign ministry guidance",
        authority: "Ministry for Foreign Affairs of Finland",
        url: "https://um.fi/mita-ovat-pakotteet",
        reviewedOn: "2026-10-09"
      },
      {
        id: "COV-S-DIGITAL-ESPIONAGE",
        title: "Economic security: good corporate security protects against espionage",
        authority: "Finnish Security and Intelligence Service, Supo",
        url: "https://supo.fi/yritysturvallisuus",
        reviewedOn: "2026-10-09"
      },
      {
        id: "COV-S-DIGITAL-COMMS",
        title: "Guidance on effective communications in a cyber incident",
        authority: "UK National Cyber Security Centre",
        url: "https://www.ncsc.gov.uk/guidance/effective-communications-in-a-cyber-incident",
        reviewedOn: "2026-10-09"
      },
      {
        id: "COV-S-DIGITAL-DEEPFAKES",
        title: "Archived 2023 release notice: NSA, FBI and CISA information sheet on deepfake threats (historical context)",
        authority: "US Cybersecurity and Infrastructure Security Agency",
        url: "https://www.cisa.gov/news-events/alerts/2023/09/12/nsa-fbi-and-cisa-release-cybersecurity-information-sheet-deepfake-threats",
        reviewedOn: "2026-10-09"
      }
    ],
    topics: [
      {
        id: "ot-iot",
        title: "OT, IoT and connected physical systems",
        gapIds: ["G06"],
        domainIds: ["information-and-cyber-security", "premises-security", "security-of-production-and-operations", "industrial-safety", "contingency-and-crisis-management"],
        applicability: "Does the organization operate or depend on connected production, building, access-control or other physical systems with distinct safety and availability constraints?",
        ownerRoles: ["OT security lead", "Engineering lead", "Site operations lead"],
        reviewState: "draft",
        sourceIds: ["COV-S-DIGITAL-OT"],
        checks: [
          {
            id: "COV-ot-iot-identify",
            phaseId: "identify",
            prompt: "Are connected physical assets, support dependencies and safety-related interfaces assigned accountable technical and operational owners?",
            evidence: "A site-reviewed asset and dependency inventory showing support life, remote access, criticality and links to approved safety assessments.",
            action: "Have competent engineering and security personnel reconcile the inventory with site procedures; do not infer safe operating limits from this checklist.",
            tools: [
              { name: "OT asset register", use: "Record controller or device, owner, network zone, supplier, support end date and business function without intrusive discovery." },
              { name: "Cyber-to-physical dependency diagram", use: "Map IT, utilities, building systems and safety interfaces for a joint site review of common failures." }
            ],
            entryIds: ["CSM-D06-I-M01", "CSM-D04-I-M01", "CSM-D02-I-M01"]
          },
          {
            id: "COV-ot-iot-protect",
            phaseId: "protect",
            prompt: "Are segmentation, supplier access and changes approved with operational safety, supportability and maintenance constraints considered?",
            evidence: "Approved zone and conduit diagrams, time-bounded remote-access records and engineering-reviewed change exceptions.",
            action: "Review exposure with competent site personnel and plan approved changes; never apply generic IT isolation, scanning or patching instructions to live plant.",
            tools: [
              { name: "Zone and conduit review sheet", use: "Document required connections, business justification, responsible owner and separately approved restrictions." },
              { name: "Supplier remote-access approval ledger", use: "Track authorized purpose, access window, individual accountability, supervision and revocation evidence." }
            ],
            entryIds: ["CSM-D06-P-M02", "CSM-D04-P-M04", "CSM-D09-P-M02"]
          },
          {
            id: "COV-ot-iot-detect",
            phaseId: "detect",
            prompt: "Can operators and security staff distinguish authorized change from suspicious activity without impairing the physical process?",
            evidence: "Site-approved monitoring design, configuration baselines, supplier-session reviews and a tested cross-team escalation record.",
            action: "Agree feasible detection and escalation with engineering; assess monitoring compatibility before connecting tools to operational networks.",
            tools: [
              { name: "Approved configuration comparison", use: "Compare authorized controller, gateway and access settings with a retained baseline during permitted review activities." },
              { name: "OT alert routing matrix", use: "Route cyber observations to operators and security with asset context, uncertainty and agreed escalation authority." }
            ],
            entryIds: ["CSM-D06-D-M01", "CSM-D06-D-M03", "CSM-D08-D-M04"]
          },
          {
            id: "COV-ot-iot-respond",
            phaseId: "respond",
            prompt: "Are cyber containment decisions joined to competent physical-safety decisions and approved site emergency procedures?",
            evidence: "A jointly exercised authority map covering operations, engineering, safety, incident response and supplier support.",
            action: "Resolve authority conflicts in a tabletop using approved site procedures; this aid does not prescribe stopping, isolating or restarting equipment.",
            tools: [
              { name: "Joint incident authority card", use: "List who may authorize cyber measures and who must assess physical consequences under site-specific procedures." },
              { name: "OT decision log template", use: "Record the observation, safety consultation, authorized decision, constraints and required reassessment." }
            ],
            entryIds: ["CSM-D06-R-M01", "CSM-D08-R-M02", "CSM-D09-R-M03"]
          },
          {
            id: "COV-ot-iot-recover",
            phaseId: "recover",
            prompt: "Is recovery evidence sufficient for competent personnel to authorize restoration of trusted cyber and physical functions?",
            evidence: "Approved restore tests, configuration provenance, supplier support records and documented engineering and business acceptance prerequisites.",
            action: "Close recovery prerequisites and unresolved exceptions with competent owners; technical restoration alone is not permission to resume plant operations.",
            tools: [
              { name: "OT recovery prerequisite register", use: "Track trusted configurations, compatible spares, support dependencies, test evidence and outstanding approvals." },
              { name: "Joint restoration acceptance record", use: "Capture separate technical, safety and operational acceptance against locally approved recovery procedures." }
            ],
            entryIds: ["CSM-D06-RC-M01", "CSM-D06-RC-M04", "CSM-D08-RC-M01"]
          }
        ]
      },
      {
        id: "secure-product-lifecycle",
        title: "Secure software and digital-product lifecycle",
        gapIds: ["G07"],
        domainIds: ["information-and-cyber-security", "security-of-production-and-operations"],
        applicability: "Does the organization develop, commission, distribute or materially configure software or digital products whose compromise could harm customers or operations?",
        ownerRoles: ["Product security lead", "Engineering lead", "Product owner"],
        reviewState: "draft",
        sourceIds: ["COV-S-DIGITAL-SSDF"],
        checks: [
          {
            id: "COV-secure-product-lifecycle-identify",
            phaseId: "identify",
            prompt: "Are product trust boundaries, security requirements, dependencies and supported lifecycle responsibilities explicit before release?",
            evidence: "Reviewed architecture and abuse cases, component inventories, support commitments and accountable product-security ownership.",
            action: "Prioritize harmful misuse and dependency exposure with product and engineering owners; assess applicable product duties separately with competent advisers.",
            tools: [
              { name: "Product threat-model worksheet", use: "Map assets, trust boundaries, misuse cases, customer consequences and owners for unresolved design risks." },
              { name: "Software component inventory", use: "Maintain a software bill of materials with versions, origin, dependency paths, owner and support status." }
            ],
            entryIds: ["CSM-D06-I-M01", "CSM-D04-I-M02", "CSM-D06-I-M03"]
          },
          {
            id: "COV-secure-product-lifecycle-protect",
            phaseId: "protect",
            prompt: "Do build and release controls protect source, secrets, dependencies and approval authority from unreviewed change?",
            evidence: "Reviewed code-change rules, separated build identities, dependency decisions, signed artifact provenance and security test results.",
            action: "Define proportionate release gates, restrict build permissions and resolve documented exceptions before an authorized release.",
            tools: [
              { name: "Secure release gate checklist", use: "Require accountable review of tests, dependency risk, secret checks and unresolved security exceptions." },
              { name: "Build provenance record", use: "Associate a release with reviewed source, build environment, dependency inputs, integrity checks and approval." }
            ],
            entryIds: ["CSM-D06-P-M04", "CSM-D04-P-M04", "CSM-D06-P-M02"]
          },
          {
            id: "COV-secure-product-lifecycle-detect",
            phaseId: "detect",
            prompt: "Can component vulnerabilities, reported weaknesses and unexpected product behavior reach an owner throughout the support period?",
            evidence: "Vulnerability intake records, component advisory matching, security regression results and customer-facing support contact tests.",
            action: "Establish risk-based triage and validated testing; a scanner result or absence of reports is not proof of product security.",
            tools: [
              { name: "Component advisory matching queue", use: "Match supplier advisories to deployed component versions and route confirmed exposure to product owners." },
              { name: "Security regression case library", use: "Retain repeatable tests for previously corrected abuse cases and boundary failures in an authorized test environment." }
            ],
            entryIds: ["CSM-D06-D-M03", "CSM-D06-D-M04", "CSM-D04-D-M04"]
          },
          {
            id: "COV-secure-product-lifecycle-respond",
            phaseId: "respond",
            prompt: "Can the organization coordinate vulnerability validation, mitigation, affected-customer advice and disclosure decisions without losing evidence?",
            evidence: "A exercised vulnerability-response workflow with scope decisions, investigation records, customer messaging and legal review where applicable.",
            action: "Assign one accountable coordination role and separate verified impact from uncertainty; assess notification and disclosure duties case by case.",
            tools: [
              { name: "Coordinated disclosure case record", use: "Track reporter contact, reproducibility, affected versions, interim protection, remediation owner and agreed communication milestones." },
              { name: "Affected-release decision matrix", use: "Compare affected versions, exposure, customer harm and safe mitigation options for authorized product decisions." }
            ],
            entryIds: ["CSM-D06-R-M02", "CSM-D06-R-M04", "CSM-D04-R-M03"]
          },
          {
            id: "COV-secure-product-lifecycle-recover",
            phaseId: "recover",
            prompt: "Are corrected releases verified, customer remediation tracked and systemic causes fed into design and support commitments?",
            evidence: "Regression evidence, release integrity records, adoption status, root-cause actions and documented end-of-support communication.",
            action: "Verify the correction in an authorized environment, track unresolved customer exposure and improve the lifecycle rather than closing on release alone.",
            tools: [
              { name: "Remediation adoption register", use: "Track supported versions, published corrections, known deployment status and unresolved customer transition risks." },
              { name: "Product-security root-cause review", use: "Identify failed design or release assumptions and assign preventive tests, owners and follow-up evidence." }
            ],
            entryIds: ["CSM-D06-RC-M04", "CSM-D04-RC-M03", "CSM-D06-RC-M03"]
          }
        ]
      },
      {
        id: "ai-security",
        title: "AI systems, agents and information integrity",
        gapIds: ["G08"],
        domainIds: ["information-and-cyber-security", "security-of-production-and-operations", "compliance-control"],
        applicability: "Does the organization use or supply AI that handles sensitive information, influences consequential decisions or can invoke tools or external actions?",
        ownerRoles: ["AI system owner", "Information security lead", "Product risk lead"],
        reviewState: "draft",
        sourceIds: ["COV-S-DIGITAL-AI"],
        checks: [
          {
            id: "COV-ai-security-identify",
            phaseId: "identify",
            prompt: "Are AI uses, model and data dependencies, affected people and action permissions inventoried with accountable owners?",
            evidence: "An AI-use register covering intended purpose, sensitive inputs, supplier retention, agent permissions and consequential failure scenarios.",
            action: "Review harm and misuse with relevant technical and business specialists; determine legal applicability separately, not from the technology label.",
            tools: [
              { name: "AI-use and dependency register", use: "Record system purpose, model or provider version, data flows, owner, users, connected tools and fallback." },
              { name: "AI misuse scenario worksheet", use: "Discuss prompt injection, poisoned inputs, data leakage, misleading output and unauthorized actions for the actual use case." }
            ],
            entryIds: ["CSM-D06-I-M04", "CSM-D06-I-M03", "CSM-D04-I-M02"]
          },
          {
            id: "COV-ai-security-protect",
            phaseId: "protect",
            prompt: "Are AI data access and tool actions constrained independently of model instructions, with meaningful human approval for consequential actions?",
            evidence: "Enforced permission boundaries, permitted data sources, supplier handling terms, approval records and tested non-AI fallback arrangements.",
            action: "Limit privileges and sensitive inputs, validate outputs before consequential use and test controls; prompts alone are not an access-control boundary.",
            tools: [
              { name: "Agent permission allowlist", use: "Document and enforce permitted tools, data scopes and action limits outside the model's instruction text." },
              { name: "Consequential-action approval workflow", use: "Require an authorized reviewer to inspect evidence and approve a consequential action before execution." }
            ],
            entryIds: ["CSM-D06-P-M01", "CSM-D06-P-M04", "CSM-D07-P-M01"]
          },
          {
            id: "COV-ai-security-detect",
            phaseId: "detect",
            prompt: "Can owners identify unsafe behavior, unauthorized actions and material changes in AI performance under representative conditions?",
            evidence: "Versioned evaluation results, lawfully minimized action logs, boundary-test outcomes and reviewed user-reported failures.",
            action: "Set use-case-specific evaluation and escalation criteria; do not treat a benchmark, moderation filter or deepfake detector as a guarantee.",
            tools: [
              { name: "Adversarial AI evaluation set", use: "Test representative hostile inputs, sensitive-data requests and permission bypass attempts in an authorized isolated environment." },
              { name: "AI action audit worksheet", use: "Compare authorized tool actions with observed outcomes while minimizing retained personal and sensitive data." }
            ],
            entryIds: ["CSM-D06-D-M02", "CSM-D06-D-M03", "CSM-D04-D-M04"]
          },
          {
            id: "COV-ai-security-respond",
            phaseId: "respond",
            prompt: "Can authorized owners pause risky AI functions, preserve relevant evidence and assess affected decisions, data or external actions?",
            evidence: "An exercised AI incident workflow covering decision authority, affected outputs, permissions, supplier coordination and notification assessment.",
            action: "Use authorized controls and context-specific continuity arrangements; review downstream impact with competent owners before assuming withdrawal resolves the harm.",
            tools: [
              { name: "AI incident impact tracker", use: "Record affected model versions, inputs, decisions, recipients, tool actions, uncertainty and accountable investigation owners." },
              { name: "AI fallback authority card", use: "Identify who may disable a risky function and which reviewed manual or alternative process can replace it." }
            ],
            entryIds: ["CSM-D06-R-M01", "CSM-D06-R-M02", "CSM-D04-R-M01"]
          },
          {
            id: "COV-ai-security-recover",
            phaseId: "recover",
            prompt: "Are corrected AI functions re-evaluated and affected decisions revisited before approved return to use?",
            evidence: "Corrective evaluation results, reviewed downstream remediation, revised permissions and owner acceptance of residual limitations.",
            action: "Revalidate the changed system and fallback, address affected people or transactions where appropriate and document unresolved limitations.",
            tools: [
              { name: "AI reauthorization checklist", use: "Require updated boundary tests, permission review, supplier change review and accountable approval before resuming the affected use." },
              { name: "Affected-decision correction ledger", use: "Track decisions needing competent reassessment, notification or correction without retaining unnecessary personal data." }
            ],
            entryIds: ["CSM-D06-RC-M04", "CSM-D04-RC-M03", "CSM-D07-RC-M01"]
          }
        ]
      },
      {
        id: "data-protection",
        title: "Personal-data lifecycle and privacy safeguards",
        gapIds: ["G09"],
        domainIds: ["information-and-cyber-security", "compliance-control", "personnel-security"],
        applicability: "Which personal-data processing, controller or processor roles and jurisdictions apply, including workforce data, and does GDPR apply to the activity?",
        ownerRoles: ["Privacy lead", "Data protection officer where applicable", "Processing owner"],
        reviewState: "draft",
        sourceIds: ["COV-S-DIGITAL-GDPR"],
        checks: [
          {
            id: "COV-data-protection-identify",
            phaseId: "identify",
            prompt: "Are processing purposes, lawful bases, data categories, recipients, retention and international transfers assessed for the applicable roles and law?",
            evidence: "A reviewed processing inventory, scope analysis and documented decisions on rights, special-category conditions and DPIA requirements where applicable.",
            action: "Have competent privacy advisers determine applicability and lawful processing; consent is not a universal basis and this checklist makes no legal determination.",
            tools: [
              { name: "Processing and transfer register", use: "Map purposes, data categories, roles, lawful-basis decisions, processors, locations, retention and transfer arrangements." },
              { name: "Privacy impact screening worksheet", use: "Record the need for a DPIA, affected rights, risk factors and competent review of unresolved scope." }
            ],
            entryIds: ["CSM-D06-I-M03", "CSM-D06-I-M02", "CSM-D01-I-M04"]
          },
          {
            id: "COV-data-protection-protect",
            phaseId: "protect",
            prompt: "Are data minimization, access, retention, processor arrangements and applicable transfer safeguards built into the processing lifecycle?",
            evidence: "Approved privacy design reviews, retention rules, processor agreements, access controls and competent assessment of transfer safeguards where needed.",
            action: "Implement documented purpose limits and safeguards with privacy and system owners; security controls alone do not establish lawful processing.",
            tools: [
              { name: "Privacy-by-design review checklist", use: "Check necessity, default access, minimization, retention, notices and rights handling before an approved processing change." },
              { name: "Processor and transfer control matrix", use: "Track contractual roles, subprocessors, handling locations, documented safeguards, owners and review triggers." }
            ],
            entryIds: ["CSM-D06-P-M03", "CSM-D06-P-M01", "CSM-D07-P-M02"]
          },
          {
            id: "COV-data-protection-detect",
            phaseId: "detect",
            prompt: "Can owners identify unauthorized processing, retention drift, failed rights requests and changes to processor or transfer arrangements?",
            evidence: "Access and deletion reviews, rights-request case records, supplier-change notices and documented privacy incident escalation.",
            action: "Review a proportionate sample and overdue cases with competent privacy owners, limiting monitoring and audit records to lawful necessary information.",
            tools: [
              { name: "Rights-request case tracker", use: "Record request type, lawful identity verification, applicable deadline, responsible role and outcome without unnecessary personal details." },
              { name: "Retention and access sampling sheet", use: "Compare representative records and permissions against approved purposes and retention rules, documenting unexplained exceptions." }
            ],
            entryIds: ["CSM-D06-D-M02", "CSM-D07-D-M01", "CSM-D06-D-M04"]
          },
          {
            id: "COV-data-protection-respond",
            phaseId: "respond",
            prompt: "Can privacy and incident owners assess a suspected personal-data breach, preserve lawful evidence and decide applicable notifications promptly?",
            evidence: "A breach-assessment workflow documenting awareness, affected data and people, uncertainty, risk evaluation and reasoned notification decisions.",
            action: "Escalate promptly to competent privacy and legal owners; notification recipients, thresholds and deadlines depend on applicable law and incident facts.",
            tools: [
              { name: "Personal-data breach assessment record", use: "Track discovery, known exposure, affected groups, risk considerations, safeguards and accountable notification decisions." },
              { name: "Notification decision timeline", use: "Record awareness and decision times, jurisdiction-specific requirements, communications and reasons for unresolved or deferred conclusions." }
            ],
            entryIds: ["CSM-D06-R-M02", "CSM-D06-R-M04", "CSM-D07-R-M03"]
          },
          {
            id: "COV-data-protection-recover",
            phaseId: "recover",
            prompt: "Are affected processing controls, records and individual remedies reviewed before ongoing processing is accepted?",
            evidence: "Verified corrective actions, processor follow-up, revised impact assessments where needed and reviewed deletion or preservation decisions.",
            action: "Close documented remediation with privacy owners while reconciling retention, rights and lawful preservation; do not delete evidence or resume processing automatically.",
            tools: [
              { name: "Privacy remediation register", use: "Assign corrective actions, affected processing, accountable roles, deadlines and independent closure evidence." },
              { name: "Processing revalidation record", use: "Reassess purpose, access, processor or transfer changes, rights handling and retention after a material incident or change." }
            ],
            entryIds: ["CSM-D06-RC-M04", "CSM-D07-RC-M01", "CSM-D07-RC-M03"]
          }
        ]
      },
      {
        id: "trade-compliance",
        title: "Sanctions and export-control interfaces",
        gapIds: ["G10"],
        domainIds: ["compliance-control", "security-of-production-and-operations", "information-and-cyber-security"],
        applicability: "Could transactions, counterparties, ownership, destinations or transfers of goods, software, technology or services bring applicable sanctions or export controls into scope?",
        ownerRoles: ["Trade compliance lead", "Legal adviser", "Supply chain lead"],
        reviewState: "draft",
        sourceIds: ["COV-S-DIGITAL-EXPORT", "COV-S-DIGITAL-SANCTIONS"],
        checks: [
          {
            id: "COV-trade-compliance-identify",
            phaseId: "identify",
            prompt: "Are sanctions exposure and export-control classification assessed separately for actual transactions, ownership, end users, end uses and technology transfers?",
            evidence: "A competent jurisdiction and transaction scope assessment, documented classification questions and accountable review of ownership and end-use uncertainty.",
            action: "Obtain qualified review where relevant; neither a clean name-screening result nor anti-bribery controls establish sanctions or export-control clearance.",
            tools: [
              { name: "Trade-control scope worksheet", use: "Separate applicable sanctions, goods or technology classification, destination, end-user, end-use and authorization questions." },
              { name: "Counterparty ownership map", use: "Document reliable ownership and control information, intermediaries, evidence gaps and competent-review triggers." }
            ],
            entryIds: ["CSM-D07-I-M02", "CSM-D04-I-M04", "CSM-D06-I-M03"]
          },
          {
            id: "COV-trade-compliance-protect",
            phaseId: "protect",
            prompt: "Are transactions and relevant technology access subject to documented approvals before commitments, shipment, payment or disclosure?",
            evidence: "Competently reviewed authorization records, screening procedures, transfer restrictions and proportionate segregation of approval responsibilities.",
            action: "Set documented review gates and resolve uncertain cases with competent advisers; do not infer permission from this tool or bypass restrictions through intermediaries.",
            tools: [
              { name: "Trade approval gate checklist", use: "Require documented scope review, classification or authorization decisions and release authority for relevant transactions." },
              { name: "Controlled-technology access register", use: "Track approved access to relevant technical information, supplier collaboration and disclosure decisions under applicable rules." }
            ],
            entryIds: ["CSM-D07-P-M02", "CSM-D04-P-M03", "CSM-D06-P-M03"]
          },
          {
            id: "COV-trade-compliance-detect",
            phaseId: "detect",
            prompt: "Do relevant list, ownership, routing, end-use and product changes trigger reassessment rather than reliance on a previous clearance?",
            evidence: "Dated official-source checks, reassessment records, unexplained transaction exception reviews and audit of approved scope against actual activity.",
            action: "Review defined change triggers and exceptions with competent owners; automated screening is an aid, not a legal conclusion or complete evasion detector.",
            tools: [
              { name: "Trade-control change watchlist", use: "Track relevant official updates and changed ownership, destination, end use or product scope for assigned review." },
              { name: "Transaction exception review queue", use: "Flag unexplained routing, payment, party or technology-access differences from approved records for human assessment." }
            ],
            entryIds: ["CSM-D07-D-M01", "CSM-D04-D-M01", "CSM-D07-D-M04"]
          },
          {
            id: "COV-trade-compliance-respond",
            phaseId: "respond",
            prompt: "Can an uncertain or suspected restricted transaction reach authorized legal review with records preserved and decisions controlled?",
            evidence: "An escalation and decision workflow documenting transaction status, evidence preservation, authorization and competent advice on next steps.",
            action: "Use approved escalation and interim controls; assess any reporting, licensing or freezing obligation with competent advisers rather than applying universal instructions.",
            tools: [
              { name: "Trade exception decision record", use: "Record facts, uncertainty, authorized interim measures, specialist advice and the reasoned disposition of a flagged case." },
              { name: "Trade case preservation index", use: "Identify relevant contracts, approvals, shipment, payment and technical-disclosure records for lawful preservation by authorized personnel." }
            ],
            entryIds: ["CSM-D07-R-M01", "CSM-D07-R-M03", "CSM-D04-R-M02"]
          },
          {
            id: "COV-trade-compliance-recover",
            phaseId: "recover",
            prompt: "Are corrected controls, permitted supplier alternatives and residual transaction obligations reviewed before relevant activity resumes?",
            evidence: "Competent closure decisions, revised approvals, validated process changes and requalification records for affected counterparties or routes.",
            action: "Revalidate the actual legal and operational scope, document unresolved restrictions and retain normal authorized records without suggesting sanctions evasion alternatives.",
            tools: [
              { name: "Trade remediation and closure checklist", use: "Track root causes, revised approvals, training, open obligations and competent acceptance of corrective evidence." },
              { name: "Alternative-supply approval record", use: "Review a proposed supplier or route against current trade-control scope and business quality requirements before authorization." }
            ],
            entryIds: ["CSM-D07-RC-M01", "CSM-D07-RC-M02", "CSM-D04-RC-M02"]
          }
        ]
      },
      {
        id: "strategic-information",
        title: "Strategic knowledge, intellectual property and espionage exposure",
        gapIds: ["G10"],
        domainIds: ["information-and-cyber-security", "personnel-security", "premises-security", "compliance-control", "security-of-production-and-operations"],
        applicability: "Does the organization hold sensitive research, strategic information, trade secrets or transaction access that could attract theft, coercion or hostile influence?",
        ownerRoles: ["Corporate security lead", "Information owner", "Transaction legal lead"],
        reviewState: "draft",
        sourceIds: ["COV-S-DIGITAL-ESPIONAGE"],
        checks: [
          {
            id: "COV-strategic-information-identify",
            phaseId: "identify",
            prompt: "Are strategically valuable knowledge, research and M&A or investment information mapped to exposure paths and accountable owners?",
            evidence: "A sensitivity and access map covering staff, partners, visitors, data rooms, research collaboration and relevant transaction changes.",
            action: "Assess exposure using assets, access and transaction context; do not infer suspicion from nationality or replace lawful, proportionate assessment with profiling.",
            tools: [
              { name: "Strategic knowledge exposure map", use: "List valuable knowledge, owner, business consequences, legitimate users and physical or digital disclosure paths." },
              { name: "Transaction security diligence worksheet", use: "Review proposed investment, acquisition or research access with legal and security owners, recording evidence gaps and applicable review questions." }
            ],
            entryIds: ["CSM-D06-I-M02", "CSM-D01-I-M03", "CSM-D07-I-M02"]
          },
          {
            id: "COV-strategic-information-protect",
            phaseId: "protect",
            prompt: "Are sensitive knowledge-sharing, partner access and transaction data rooms limited to approved purpose, scope and duration?",
            evidence: "Reviewed access permissions, confidentiality arrangements, visitor or partner controls and authorized decisions on staged disclosure.",
            action: "Use proportionate need-to-know controls and reviewed sharing arrangements while preserving lawful workforce rights and legitimate collaboration.",
            tools: [
              { name: "Staged-disclosure approval register", use: "Record which transaction or research information may be shared, with whom, under which safeguards and for how long." },
              { name: "Sensitive-access reconciliation", use: "Compare staff, partner, physical-access and data-room permissions against current approved roles and purposes." }
            ],
            entryIds: ["CSM-D06-P-M03", "CSM-D01-P-M01", "CSM-D02-P-M01"]
          },
          {
            id: "COV-strategic-information-detect",
            phaseId: "detect",
            prompt: "Can unusual access, unexplained information requests and coercion concerns be assessed lawfully without assumptions of guilt?",
            evidence: "Approved monitoring scope, access exception reviews, confidential reporting routes and documented impartial triage of credible concerns.",
            action: "Review relevant signals with authorized security, privacy and legal roles; minimize monitoring and corroborate facts before escalating allegations.",
            tools: [
              { name: "Sensitive-access exception review sheet", use: "Compare observed access with approved purpose and role, retaining only necessary lawful evidence and alternative explanations." },
              { name: "Coercion and suspicious-approach reporting card", use: "Provide a confidential route for staff to seek support and report unusual information requests without unsupported accusations." }
            ],
            entryIds: ["CSM-D06-D-M02", "CSM-D01-D-M01", "CSM-D07-D-M02"]
          },
          {
            id: "COV-strategic-information-respond",
            phaseId: "respond",
            prompt: "Are suspected strategic-information losses handled with lawful evidence preservation, staff protection and competent incident and transaction advice?",
            evidence: "An impartial case record, preservation authority, necessary access decisions and competent assessment of contractual, authority and staff-support interfaces.",
            action: "Escalate credible facts through approved channels and preserve rights; this checklist neither attributes espionage nor prescribes covert investigation techniques.",
            tools: [
              { name: "Strategic-information incident scope record", use: "Document known information, recipients, access paths, uncertainty and lawful preservation responsibilities for authorized investigators." },
              { name: "Legal and security coordination checklist", use: "Coordinate approved access measures, staff support, transaction consequences and any appropriate authority contact with competent advisers." }
            ],
            entryIds: ["CSM-D07-R-M01", "CSM-D07-R-M02", "CSM-D06-R-M02"]
          },
          {
            id: "COV-strategic-information-recover",
            phaseId: "recover",
            prompt: "Are lost knowledge, affected relationships and access arrangements reassessed before trusted collaboration or transaction activity continues?",
            evidence: "Reviewed loss implications, corrected access, contract or partner decisions and independently checked remediation ownership.",
            action: "Reassess disclosure and residual exposure with information and legal owners; restored accounts cannot reverse information already disclosed.",
            tools: [
              { name: "Strategic-loss consequence register", use: "Track affected research, contracts, intellectual-property decisions and operational consequences with competent business and legal owners." },
              { name: "Partner-access reauthorization record", use: "Verify corrected permissions, sharing scope, responsibilities and unresolved exposure before renewed approved collaboration." }
            ],
            entryIds: ["CSM-D06-RC-M03", "CSM-D07-RC-M01", "CSM-D04-RC-M03"]
          }
        ]
      },
      {
        id: "verified-crisis-communications",
        title: "Verified crisis instructions and trusted communications",
        gapIds: ["G14"],
        domainIds: ["contingency-and-crisis-management", "information-and-cyber-security", "compliance-control", "personnel-security"],
        applicability: "Could unavailable or compromised channels, impersonation, synthetic media or misinformation disrupt critical instructions, payments or stakeholder communication?",
        ownerRoles: ["Crisis management lead", "Communications lead", "Information security lead"],
        reviewState: "draft",
        sourceIds: ["COV-S-DIGITAL-COMMS", "COV-S-DIGITAL-DEEPFAKES"],
        checks: [
          {
            id: "COV-verified-crisis-communications-identify",
            phaseId: "identify",
            prompt: "Are critical instruction paths, stakeholder needs and alternatives mapped for loss or compromise of familiar communication channels?",
            evidence: "A role-based communications map, verified contact provenance, channel dependencies and exercise assumptions about impersonation and synthetic media.",
            action: "Assign communication and instruction authority, identify independent verification routes and review applicable notification duties with competent owners.",
            tools: [
              { name: "Critical communication dependency map", use: "Map audiences, authorized senders, essential channels, shared technical dependencies and independently maintained fallback contacts." },
              { name: "Impersonation tabletop pack", use: "Discuss an urgent payment or crisis instruction carried by convincing voice or video while a normal account is compromised." }
            ],
            entryIds: ["CSM-D08-I-M03", "CSM-D08-I-M04", "CSM-D01-I-M01"]
          },
          {
            id: "COV-verified-crisis-communications-protect",
            phaseId: "protect",
            prompt: "Are consequential instructions independently verified and fallback channels exercised before a disruption?",
            evidence: "A practiced callback and dual-approval procedure, independently sourced contacts, trained spokespeople and tested alternative channels.",
            action: "Require approved verification for consequential requests; familiar voice, video, caller identification or apparent urgency alone does not establish authority.",
            tools: [
              { name: "Independent callback procedure", use: "Confirm a consequential request using a pre-established trusted contact route, not a number or link supplied in the request." },
              { name: "Dual-authority instruction checklist", use: "Require separate authorized approval and verified request context before an exceptional payment, disclosure or critical instruction." }
            ],
            entryIds: ["CSM-D08-P-M04", "CSM-D07-P-M01", "CSM-D01-P-M04"]
          },
          {
            id: "COV-verified-crisis-communications-detect",
            phaseId: "detect",
            prompt: "Can staff challenge conflicting instructions and communications teams identify impersonation or misinformation without relying on automated authenticity claims?",
            evidence: "A tested challenge-and-escalation route, discrepancies between approved messages and observed claims, and channel-integrity checks.",
            action: "Corroborate suspicious content through independently trusted sources; detection tools and media provenance can inform review but cannot guarantee truth.",
            tools: [
              { name: "Instruction discrepancy log", use: "Capture conflicting requests, verification attempts, uncertainty and escalation to the authorized decision role." },
              { name: "Verified-message comparison sheet", use: "Compare public or internal claims with the current approved statement and investigate material discrepancies through trusted channels." }
            ],
            entryIds: ["CSM-D08-D-M03", "CSM-D06-D-M04", "CSM-D08-D-M04"]
          },
          {
            id: "COV-verified-crisis-communications-respond",
            phaseId: "respond",
            prompt: "Do authorized crisis messages separate confirmed facts from uncertainty and reach affected audiences through verified, accessible channels?",
            evidence: "Approved message versions, factual review and privacy checks, decision logs, stakeholder updates and documented handling of impersonated instructions.",
            action: "Use authorized communication and escalation procedures, correct material errors and avoid unsupported assurances, attribution or disclosure of sensitive investigation details.",
            tools: [
              { name: "Facts-and-uncertainty message template", use: "State verified impact, current uncertainty, authorized actions, help channels and the next update without speculative attribution." },
              { name: "Crisis publication approval log", use: "Track factual, legal and communication review, authorized publisher, version, audience, channel and correction history." }
            ],
            entryIds: ["CSM-D08-R-M01", "CSM-D08-R-M03", "CSM-D01-R-M04"]
          },
          {
            id: "COV-verified-crisis-communications-recover",
            phaseId: "recover",
            prompt: "Are trust, contact validity and communication gaps re-evaluated as recovery evidence and incident understanding change?",
            evidence: "Continuing stakeholder updates, reviewed corrections, verified contact changes and an after-action assessment of message reach and comprehension.",
            action: "Revalidate affected channels, address outstanding concerns and update rehearsals; technical recovery does not automatically restore stakeholder trust.",
            tools: [
              { name: "Stakeholder follow-up and correction register", use: "Track revised impact, unresolved questions, responsible roles, approved corrections and continuing update commitments." },
              { name: "Communication after-action worksheet", use: "Review verification failures, accessibility, timing, channel independence and participant understanding, then assign tested improvements." }
            ],
            entryIds: ["CSM-D08-RC-M02", "CSM-D08-RC-M03", "CSM-D06-RC-M04"]
          }
        ]
      }
    ]
  };
})();
