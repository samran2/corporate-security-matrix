(() => {
  "use strict";

  // Draft management checks, not verified normative mappings or expert approval.
  // reviewedOn records official-source consultation, not control effectiveness.
  globalThis.CSMCoverageShards = globalThis.CSMCoverageShards || {};
  globalThis.CSMCoverageShards.governance = {
    sources: [
      {
        id: "COV-S-GOV-ISO31000",
        title: "ISO 31000:2018 — Risk management — Guidelines",
        authority: "International Organization for Standardization",
        url: "https://www.iso.org/standard/65694.html",
        reviewedOn: "2026-10-09"
      },
      {
        id: "COV-S-GOV-EK",
        title: "Corporate security model and guidance",
        authority: "Confederation of Finnish Industries",
        url: "https://ek.fi/hyotytietoa-yrityksille/yritysturvallisuus/",
        reviewedOn: "2026-10-09"
      },
      {
        id: "COV-S-HR-NPSA-ONGOING",
        title: "Ongoing Personnel Security",
        authority: "UK National Protective Security Authority",
        url: "https://www.npsa.gov.uk/specialised-guidance/insider-risk-guidance/ongoing-personnel-security",
        reviewedOn: "2026-10-09"
      },
      {
        id: "COV-S-SUPPLIER-NPSA-LIFECYCLE",
        title: "Supply Chain Guidance for Practitioners",
        authority: "UK National Protective Security Authority",
        url: "https://www.npsa.gov.uk/security-best-practices/supply-chain-guidance/guidance-practitioners",
        reviewedOn: "2026-10-09"
      },
      {
        id: "COV-S-TRAVEL-ISO31030",
        title: "ISO 31030:2021 — Travel risk management — Guidance for organizations",
        authority: "International Organization for Standardization",
        url: "https://www.iso.org/standard/54204.html",
        reviewedOn: "2026-10-09"
      },
      {
        id: "COV-S-TRAVEL-MFA",
        title: "Travel guidance and consular assistance",
        authority: "Ministry for Foreign Affairs of Finland",
        url: "https://um.fi/matkustaminen",
        reviewedOn: "2026-10-09"
      },
      {
        id: "COV-S-MEETINGS-NPSA-PROTECTION",
        title: "Protective Security Considerations",
        authority: "UK National Protective Security Authority",
        url: "https://www.npsa.gov.uk/specialised-guidance/secure-business/protective-security-considerations",
        reviewedOn: "2026-10-09"
      },
      {
        id: "COV-S-MEETINGS-NPSA-WORKSPACES",
        title: "Shared Workspaces — Users Guidance",
        authority: "UK National Protective Security Authority",
        url: "https://www.npsa.gov.uk/specialised-guidance/secure-innovation/shared-workspaces-users-guidance",
        reviewedOn: "2026-10-09"
      },
      {
        id: "COV-S-INSURANCE-NAIC-INTERRUPTION",
        title: "Business Interruption and Business Owner Policy",
        authority: "U.S. National Association of Insurance Commissioners",
        url: "https://content.naic.org/insurance-topics/business-interruption-and-business-owner-policy",
        reviewedOn: "2026-10-09"
      }
    ],
    topics: [
      {
        id: "governance",
        title: "Operational security governance and assurance",
        gapIds: ["G01", "G02"],
        domainIds: ["personnel-security", "premises-security", "rescue-safety", "security-of-production-and-operations", "environmental-safety", "information-and-cyber-security", "compliance-control", "contingency-and-crisis-management", "industrial-safety"],
        applicability: "Which assets, people, services, locations and security topics need explicit ownership and accountable decisions in your organization?",
        ownerRoles: ["Board and executive oversight", "Framework and domain owners", "Independent assurance"],
        reviewState: "draft",
        sourceIds: ["COV-S-GOV-ISO31000", "COV-S-GOV-EK"],
        checks: [
          {
            id: "COV-governance-identify",
            phaseId: "identify",
            prompt: "Are protected assets and services, applicable topics, exclusions, dependencies and decision authorities defined with accountable owners?",
            evidence: "An approved scope and ownership record, justified exclusions, unresolved applicability questions and authority limits in the organization's governance system.",
            action: "Have domain and asset owners resolve scope gaps with executive oversight; record who may accept residual risk and who independently challenges the decision.",
            tools: [
              { name: "Asset-owner and scope map", use: "Link protected values, services and dependencies to owner roles; distinguish justified exclusions from unresolved scope." },
              { name: "Decision-rights matrix", use: "Specify authority for risk acceptance, escalation, funding and independent challenge, including deputy arrangements." }
            ],
            entryIds: ["CSM-D08-I-M01", "CSM-D08-I-M03", "CSM-D07-I-M03"]
          },
          {
            id: "COV-governance-protect",
            phaseId: "protect",
            prompt: "Do risk acceptance and control exceptions have authorized limits, an expiry date, compensating measures and funded corrective actions?",
            evidence: "Sampled acceptance decisions and exception approvals showing rationale, residual exposure, authority, expiry, review triggers and resource commitments.",
            action: "Set bounded exception approvals and escalation criteria; allocate owners and resources to corrective actions rather than treating acceptance as permanent closure.",
            tools: [
              { name: "Risk acceptance and exception register", use: "Record decision role, residual exposure, compensating controls, expiry and triggers for renewed approval." },
              { name: "Funded control delivery plan", use: "Connect capability targets and corrective actions to accountable roles, milestones and approved resources." }
            ],
            entryIds: ["CSM-D07-P-M01", "CSM-D08-P-M03", "CSM-D08-R-M04"]
          },
          {
            id: "COV-governance-detect",
            phaseId: "detect",
            prompt: "Does management receive evidence of control drift, overdue actions and expired exceptions, with independent challenge of consequential assumptions?",
            evidence: "Recent assurance samples, overdue-action and exception reports, control-test outcomes and records of management responses to independent challenge.",
            action: "Escalate expired or ineffective exceptions to the authorized owner and commission proportionate assurance; do not infer effectiveness from a completed checklist.",
            tools: [
              { name: "Exception expiry and action monitor", use: "Surface expired approvals, missing reviews and overdue corrective work against explicit escalation thresholds." },
              { name: "Independent assurance sampling plan", use: "Sample consequential controls and decisions using evidence, challenge criteria and documented follow-up." }
            ],
            entryIds: ["CSM-D07-D-M04", "CSM-D08-D-M02", "CSM-D08-D-M03"]
          },
          {
            id: "COV-governance-respond",
            phaseId: "respond",
            prompt: "When exposure changes or a control fails, can authorized leaders decide corrective action, temporary limits and resources using a shared decision record?",
            evidence: "An exercised escalation path and recent decision logs identifying evidence, authority, temporary safeguards, accepted uncertainty and the next review time.",
            action: "Convene the relevant domain, legal and executive roles; document consequential decisions and time-bound safeguards without silently extending an old acceptance.",
            tools: [
              { name: "Escalation decision log", use: "Capture the changed exposure, options, decision authority, safeguards and next review point in an approved system." },
              { name: "Temporary exception authorization workflow", use: "Route exceptional action to authorized roles and record limits, compensating measures and expiry." }
            ],
            entryIds: ["CSM-D08-R-M01", "CSM-D08-R-M04", "CSM-D07-R-M02"]
          },
          {
            id: "COV-governance-recover",
            phaseId: "recover",
            prompt: "Are corrective actions independently checked for effectiveness, temporary exceptions closed and lessons translated into policy, capability and funding decisions?",
            evidence: "Closure records with effectiveness checks, resolved or renewed exceptions and approved changes to policy, responsibilities, exercises or investment priorities.",
            action: "Require evidence-based closure by the accountable role, restore normal governance and schedule follow-up assurance of significant changes.",
            tools: [
              { name: "Corrective-action effectiveness tracker", use: "Separate implementation from demonstrated effectiveness; record closure authority and follow-up tests." },
              { name: "Lessons-to-policy change log", use: "Trace material lessons to approved policy, ownership, exercise and resource changes across affected domains." }
            ],
            entryIds: ["CSM-D07-RC-M01", "CSM-D07-RC-M04", "CSM-D08-RC-M04"]
          }
        ]
      },
      {
        id: "employment-lifecycle",
        title: "Employee and contractor joiner–mover–leaver controls",
        gapIds: ["G03"],
        domainIds: ["personnel-security", "premises-security", "information-and-cyber-security", "compliance-control"],
        applicability: "Which employees, contractors and remote workers hold physical access, digital privileges, assets or delegated authority requiring lifecycle control?",
        ownerRoles: ["Human Resources and People Operations", "Corporate Security and identity owners", "Legal and line leadership"],
        reviewState: "draft",
        sourceIds: ["COV-S-HR-NPSA-ONGOING", "COV-S-GOV-EK"],
        checks: [
          {
            id: "COV-employment-lifecycle-identify",
            phaseId: "identify",
            prompt: "Are joining, role changes, absence and departure triggers linked to an inventory of access, assets and delegated authority for employees and contractors?",
            evidence: "A lifecycle responsibility map and sampled reconciliations between approved workforce records, identity and badge systems, asset records and authority delegations.",
            action: "Identify gaps between HR, line managers, contractor sponsors, IT and facilities; define lawful, proportionate triggers and owners for each lifecycle change.",
            tools: [
              { name: "Workforce lifecycle responsibility map", use: "Connect each change trigger to accountable HR, sponsor, access, asset and delegated-authority roles." },
              { name: "Access and asset reconciliation sheet", use: "Compare approved roles with digital privileges, physical credentials, remote connections, assets and delegations." }
            ],
            entryIds: ["CSM-D01-I-M01", "CSM-D01-I-M03", "CSM-D06-I-M01"]
          },
          {
            id: "COV-employment-lifecycle-protect",
            phaseId: "protect",
            prompt: "Does an authorized lifecycle workflow adjust or remove access, recover assets and end delegations at risk-appropriate times, with privacy and fairness safeguards?",
            evidence: "Approved joiner, mover and leaver procedures, notice-period decisions, confidentiality reminders, handover arrangements and bounded exceptions for retained access.",
            action: "Coordinate digital and physical changes, keys and device return, remote access and authority handover; apply local employment and privacy review rather than blanket monitoring.",
            tools: [
              { name: "Coordinated offboarding checklist", use: "Track access removal, asset return, authority handover, confidentiality reminders and approved retention exceptions." },
              { name: "Role-change access approval workflow", use: "Remove obsolete access before granting justified new privileges; record sponsor approval and separation-of-duty checks." }
            ],
            entryIds: ["CSM-D01-P-M01", "CSM-D02-P-M01", "CSM-D06-P-M01", "CSM-D07-P-M03"]
          },
          {
            id: "COV-employment-lifecycle-detect",
            phaseId: "detect",
            prompt: "Do lawful reconciliations reveal departed or moved workers with unjustified credentials, remote access, delegated authority or outstanding assets?",
            evidence: "Recent exit samples, identity and badge reconciliation results, overdue asset-return records and authorized investigations of unexplained lifecycle exceptions.",
            action: "Investigate inconsistencies through HR, security and legal roles; distinguish administrative gaps from misconduct and escalate overdue exceptions under defined criteria.",
            tools: [
              { name: "Lifecycle reconciliation monitor", use: "Compare approved changes with access and asset records; flag mismatches without inferring malicious intent." },
              { name: "Sampled exit verification checklist", use: "Independently check selected departures across digital, physical, remote-access and authority records." }
            ],
            entryIds: ["CSM-D01-D-M02", "CSM-D01-D-M04", "CSM-D02-D-M01", "CSM-D06-D-M02"]
          },
          {
            id: "COV-employment-lifecycle-respond",
            phaseId: "respond",
            prompt: "Can HR, security, IT and facilities correct a missed departure or suspected misuse with authorized containment, evidence preservation and fair treatment?",
            evidence: "A tested coordination path and sampled exception records showing approved access restrictions, asset recovery, evidence handling and HR or legal decisions.",
            action: "Use the approved access-containment and employment process, preserve relevant records and coordinate outstanding assets and delegations without prejudging the person.",
            tools: [
              { name: "Coordinated access containment ticket", use: "Document authorized digital and physical restrictions, accountable roles and checks that changes took effect." },
              { name: "Asset-return and authority exception log", use: "Assign unresolved assets, keys and delegations to roles, with escalation and proportionate recovery decisions." }
            ],
            entryIds: ["CSM-D01-R-M02", "CSM-D01-R-M03", "CSM-D06-R-M01", "CSM-D07-R-M04"]
          },
          {
            id: "COV-employment-lifecycle-recover",
            phaseId: "recover",
            prompt: "Is lifecycle closure verified across systems and sites, with justified legacy duties, safe handover and lessons improving future joiner, mover and leaver controls?",
            evidence: "An independently checked closure record, resolved access and asset exceptions, lawful retained duties and approved updates to role templates and handover procedures.",
            action: "Close or renew outstanding exceptions with accountable approval, validate successor authority and correct process weaknesses without retaining unnecessary personal information.",
            tools: [
              { name: "Independent lifecycle closure record", use: "Verify outstanding credentials, assets and delegations are resolved or explicitly authorized and time-bounded." },
              { name: "Access-role and handover template review", use: "Use observed lifecycle failures to correct standard privileges, sponsor triggers and succession handovers." }
            ],
            entryIds: ["CSM-D01-RC-M02", "CSM-D01-RC-M04", "CSM-D02-RC-M04", "CSM-D06-RC-M04"]
          }
        ]
      },
      {
        id: "supplier-lifecycle",
        title: "Supplier lifecycle, ownership changes and secure exit",
        gapIds: ["G04"],
        domainIds: ["security-of-production-and-operations", "premises-security", "information-and-cyber-security", "compliance-control", "contingency-and-crisis-management"],
        applicability: "Which suppliers and subcontractors access assets, data, sites or critical services, and what happens if their ownership or relationship changes?",
        ownerRoles: ["Procurement and service owners", "Security and privacy owners", "Legal and contract management"],
        reviewState: "draft",
        sourceIds: ["COV-S-SUPPLIER-NPSA-LIFECYCLE", "COV-S-GOV-EK"],
        checks: [
          {
            id: "COV-supplier-lifecycle-identify",
            phaseId: "identify",
            prompt: "Are supplier and subcontractor access, sensitive assets, service dependencies, ownership exposure and exit needs mapped to accountable service owners?",
            evidence: "A tiered supplier inventory with access and asset boundaries, material subcontractors, ownership context, critical dependencies and transition assumptions.",
            action: "Evaluate physical, personnel and information exposure before outsourcing; identify services that cannot be transitioned safely and seek accountable risk decisions.",
            tools: [
              { name: "Supplier boundary and dependency map", use: "Map shared assets, sites, systems, data and material subcontractors to business and security owners." },
              { name: "Supplier exit readiness assessment", use: "Identify transition capacity, recoverable assets, retained duties and concentration constraints before commitment." }
            ],
            entryIds: ["CSM-D04-I-M01", "CSM-D04-I-M04", "CSM-D06-I-M03", "CSM-D07-I-M02"]
          },
          {
            id: "COV-supplier-lifecycle-protect",
            phaseId: "protect",
            prompt: "Do reviewed contracts and transition plans define security duties, change notifications, asset and data return, access shutdown and lawful retention at exit?",
            evidence: "Approved contract schedules and an executable exit plan covering responsibilities, subcontractors, assistance, return or deletion, audit rights and continuity arrangements.",
            action: "Have procurement, service, privacy and legal roles agree proportionate obligations and a feasible transition; specify approved exceptions and retained duties rather than assuming deletion is always lawful.",
            tools: [
              { name: "Contract security and exit schedule", use: "Set accountable obligations for notification, assurance, asset and data disposition, subcontractors and exit assistance." },
              { name: "Service transition playbook", use: "Sequence replacement service, knowledge transfer, access shutdown and verification with explicit approvals and fallback limits." }
            ],
            entryIds: ["CSM-D04-P-M01", "CSM-D04-P-M02", "CSM-D06-P-M03", "CSM-D07-P-M02"]
          },
          {
            id: "COV-supplier-lifecycle-detect",
            phaseId: "detect",
            prompt: "Are material ownership, subcontracting, service and security changes detected, and is transition readiness tested rather than inferred from contract wording?",
            evidence: "Supplier change notifications, assurance findings, overdue corrective actions and a rehearsal demonstrating transition prerequisites and asset or access reconciliation.",
            action: "Reassess changed exposure with competent owners, investigate unauthorized changes and remediate impractical exit assumptions before dependency becomes irreversible.",
            tools: [
              { name: "Supplier change and assurance trigger register", use: "Track ownership, control, subcontractor and service changes that require renewed due diligence or approval." },
              { name: "Exit rehearsal and reconciliation checklist", use: "Test transition assumptions and verify that access, assets and data can be accounted for across parties." }
            ],
            entryIds: ["CSM-D04-D-M02", "CSM-D07-D-M04", "CSM-D08-D-M01", "CSM-D08-D-M03"]
          },
          {
            id: "COV-supplier-lifecycle-respond",
            phaseId: "respond",
            prompt: "Can authorized owners coordinate supplier failure or termination, safe service transfer, access restrictions and contractual or regulatory communications?",
            evidence: "An exercised transition decision path, approved emergency sourcing guardrails and records of access, integration and site-permission shutdown coordinated with service continuity.",
            action: "Invoke the reviewed transition plan with legal and service owners; authorize containment and communications, protect essential services and track temporary access exceptions.",
            tools: [
              { name: "Supplier transition command log", use: "Record service priorities, authority, replacement decisions, communications and accepted temporary constraints." },
              { name: "Supplier access shutdown checklist", use: "Coordinate accounts, tokens, integrations, badges and subcontractor access without unsafe or unauthorized interruption." }
            ],
            entryIds: ["CSM-D04-R-M02", "CSM-D04-R-M03", "CSM-D06-R-M01", "CSM-D02-R-M03", "CSM-D08-R-M04"]
          },
          {
            id: "COV-supplier-lifecycle-recover",
            phaseId: "recover",
            prompt: "Is exit independently reconciled across assets, data, subcontractors and access, with legally retained duties and the replacement service verified?",
            evidence: "Return and deletion confirmations within their verified scope, resolved credentials and integration records, retained-duty approvals and acceptance tests of the replacement service.",
            action: "Verify closure rather than relying solely on supplier attestation; document lawful backup or record-retention exceptions and update sourcing and transition lessons.",
            tools: [
              { name: "Supplier exit evidence reconciliation", use: "Compare promised asset, data and access disposition with scoped verification and identify unresolved exceptions." },
              { name: "Residual supplier duties register", use: "Assign retained records, warranties, claims, confidentiality and permitted legacy access to accountable roles and reviews." }
            ],
            entryIds: ["CSM-D04-RC-M02", "CSM-D04-RC-M03", "CSM-D06-RC-M04", "CSM-D08-RC-M04"]
          }
        ]
      },
      {
        id: "travel-program",
        title: "Travel and overseas-assignment decision governance",
        gapIds: ["G13"],
        domainIds: ["personnel-security", "information-and-cyber-security", "contingency-and-crisis-management"],
        applicability: "Which work journeys or overseas assignments, including relevant accompanying-family exposure, need organizational approval and assistance arrangements?",
        ownerRoles: ["Travel and Corporate Security", "Human Resources and line leadership", "Crisis management and assistance coordination"],
        reviewState: "draft",
        sourceIds: ["COV-S-TRAVEL-ISO31030", "COV-S-TRAVEL-MFA", "COV-S-GOV-EK"],
        checks: [
          {
            id: "COV-travel-program-identify",
            phaseId: "identify",
            prompt: "Are journey purpose, destination, duration, traveler needs, assignment context and information exposure assessed against actual assistance capabilities?",
            evidence: "A proportionate assignment assessment and capability map covering current destination context, relevant family arrangements, assistance eligibility and protected information.",
            action: "Have travel, people and security owners assess exposure using necessary information only; confirm nationality-specific consular eligibility and provider limitations separately.",
            tools: [
              { name: "Work journey and assignment assessment", use: "Record purpose, destination, duration, relevant welfare needs and information exposure without unnecessary personal detail." },
              { name: "Assistance capability and eligibility map", use: "Check operating territories, provider reach, relevant family support and consular eligibility rather than assuming universal support." }
            ],
            entryIds: ["CSM-D01-I-M02", "CSM-D01-I-M04", "CSM-D06-I-M02", "CSM-D08-I-M02"]
          },
          {
            id: "COV-travel-program-protect",
            phaseId: "protect",
            prompt: "Are approval, postponement and cancellation authorities clear, with tested contacts, preparation and policy-specific assistance or insurance limits?",
            evidence: "An approved journey decision record, traveler briefing, provider contact test and review of relevant assistance conditions, exclusions and organizational fallback arrangements.",
            action: "Define who may decline or change travel, prepare travelers and verify provider capability; do not treat a policy, advisory or travel notification as a safety guarantee.",
            tools: [
              { name: "Journey approval and cancellation workflow", use: "Route assessed travel to the authorized role and record conditions, change triggers and postponement or cancellation decisions." },
              { name: "Travel assistance coverage checklist", use: "Verify applicable assistance and insurance conditions, contacts, preparation and fallback arrangements before departure." }
            ],
            entryIds: ["CSM-D01-P-M02", "CSM-D01-P-M04", "CSM-D06-P-M03", "CSM-D08-P-M03"]
          },
          {
            id: "COV-travel-program-detect",
            phaseId: "detect",
            prompt: "Do destination changes, assistance failures or missed agreed contacts trigger proportionate reassessment and escalation through an authorized travel-support process?",
            evidence: "Recent advisory reviews, agreed contact protocols, data-minimization and retention safeguards, and a test of missed-contact escalation and provider responsiveness.",
            action: "Review meaningful changes against defined triggers; use lawful, agreed welfare checks and avoid unnecessary continuous tracking or unsupported conclusions about a traveler.",
            tools: [
              { name: "Destination and assistance trigger monitor", use: "Track relevant official advisories and provider capability changes against agreed reassessment and escalation criteria." },
              { name: "Missed-contact escalation test", use: "Rehearse authorized contacts, verification and handoff when a traveler misses an agreed check-in." }
            ],
            entryIds: ["CSM-D01-D-M03", "CSM-D01-D-M04", "CSM-D08-D-M01", "CSM-D08-D-M03"]
          },
          {
            id: "COV-travel-program-respond",
            phaseId: "respond",
            prompt: "Can designated roles authorize assistance, journey suspension, relocation or evacuation decisions with competent providers and the appropriate local authorities?",
            evidence: "An exercised decision and contact map covering out-of-hours authority, welfare support, provider activation, relevant family communication and limits of organizational capability.",
            action: "Use approved crisis and assistance arrangements with competent advice; record authority and uncertainty without substituting generic matrix advice for local emergency instructions.",
            tools: [
              { name: "Travel incident decision log", use: "Document verified information, competent advice, authorized assistance decisions, welfare responsibilities and review points." },
              { name: "Assistance activation and escalation map", use: "Identify tested local, provider and organizational contact paths with eligibility, authority and out-of-hours limitations." }
            ],
            entryIds: ["CSM-D01-R-M01", "CSM-D01-R-M04", "CSM-D08-R-M01", "CSM-D08-R-M03"]
          },
          {
            id: "COV-travel-program-recover",
            phaseId: "recover",
            prompt: "Are post-assignment welfare, access and information issues reviewed, with assistance gaps and lessons translated into improved travel decisions?",
            evidence: "A proportionate post-assignment review, voluntary support arrangements, closure of temporary access or assistance exceptions and approved provider or travel-policy changes.",
            action: "Offer appropriate aftercare, review consequential provider failures and update assessments and preparation while separating private welfare information from operational lessons.",
            tools: [
              { name: "Post-assignment learning and support review", use: "Record operational lessons and agreed follow-up while keeping personal health and welfare information in appropriate channels." },
              { name: "Travel control and provider change register", use: "Track approved changes to decision criteria, assistance capability, contacts, preparation and exception closure." }
            ],
            entryIds: ["CSM-D01-RC-M01", "CSM-D01-RC-M03", "CSM-D06-RC-M04", "CSM-D08-RC-M03"]
          }
        ]
      },
      {
        id: "confidential-meetings",
        title: "Confidential physical, remote and hybrid meetings",
        gapIds: ["G13"],
        domainIds: ["premises-security", "information-and-cyber-security"],
        applicability: "Which discussions, meeting locations and conferencing services expose confidential information to unintended participants, viewing, overhearing or recording?",
        ownerRoles: ["Information owners and meeting hosts", "Facilities and Corporate Security", "Technology and privacy owners"],
        reviewState: "draft",
        sourceIds: ["COV-S-MEETINGS-NPSA-PROTECTION", "COV-S-MEETINGS-NPSA-WORKSPACES", "COV-S-GOV-EK"],
        checks: [
          {
            id: "COV-confidential-meetings-identify",
            phaseId: "identify",
            prompt: "Are meeting sensitivity, participant need-to-know, visual and acoustic exposure, remote endpoints and provider responsibilities assessed before choosing a venue or service?",
            evidence: "A meeting exposure assessment and venue or provider responsibility record addressing sightlines, overhearing, shared equipment, conferencing and recording or transcription handling.",
            action: "Match the meeting location and service to the information owner's requirements; identify unverified room, participant and provider assumptions without claiming a room is inherently secure.",
            tools: [
              { name: "Confidential meeting exposure assessment", use: "Review participants, sensitivity, sightlines, acoustic exposure, remote endpoints and recording or transcription risks." },
              { name: "Room and provider responsibility register", use: "Clarify host, facilities and provider duties for admission, equipment, confidentiality controls and information disposition." }
            ],
            entryIds: ["CSM-D02-I-M01", "CSM-D02-I-M04", "CSM-D06-I-M02", "CSM-D06-I-M03"]
          },
          {
            id: "COV-confidential-meetings-protect",
            phaseId: "protect",
            prompt: "Do hosts verify participant authorization and use appropriate room, admission, sharing and recording controls for the meeting's sensitivity?",
            evidence: "An approved meeting checklist, tested conferencing configuration, participant admission practice and information-owner decisions on recording, transcription and shared materials.",
            action: "Use authorized spaces and services, limit access and sharing to justified participants and agree recording or transcription handling with information and privacy owners.",
            tools: [
              { name: "Sensitive meeting readiness checklist", use: "Confirm participant authorization, room suitability, visible materials, nearby listeners and approved information handling." },
              { name: "Conferencing access and recording checklist", use: "Verify admission, screen-sharing, meeting links, recording and transcription settings against approved requirements." }
            ],
            entryIds: ["CSM-D02-P-M02", "CSM-D02-P-M03", "CSM-D06-P-M01", "CSM-D06-P-M03"]
          },
          {
            id: "COV-confidential-meetings-detect",
            phaseId: "detect",
            prompt: "Do authorized walkthroughs and meeting reviews reveal unintended visibility, overhearing, participants, recordings or weaknesses in shared-equipment handling?",
            evidence: "Proportionate room and test-call checks, host reviews of admitted participants and applicable recording settings, and documented provider or equipment exceptions.",
            action: "Test controls using approved, non-sensitive material and lawful methods; escalate deficiencies to facilities, technology and information owners without covert surveillance.",
            tools: [
              { name: "Visual and acoustic privacy walkthrough", use: "Use authorized checks and non-sensitive test material to examine sightlines, overhearing and shared-room assumptions." },
              { name: "Meeting access and recording review log", use: "Sample admission and configured recording practices, retaining only necessary approved records of exceptions." }
            ],
            entryIds: ["CSM-D02-D-M03", "CSM-D02-D-M04", "CSM-D06-D-M02", "CSM-D06-D-M04"]
          },
          {
            id: "COV-confidential-meetings-respond",
            phaseId: "respond",
            prompt: "Can the host and information owner handle suspected meeting disclosure by limiting further exposure, preserving relevant records and assessing required escalation?",
            evidence: "A tested disclosure escalation path and sampled decisions on affected information, containment, provider coordination, evidence handling and applicable notification review.",
            action: "Pause sensitive discussion or sharing when authorized, involve the information owner and legal or privacy roles and assess exposure before making claims about impact or notification duties.",
            tools: [
              { name: "Meeting disclosure triage worksheet", use: "Record known information, possible recipients, evidence limits and responsible information, privacy and security roles." },
              { name: "Disclosure containment decision record", use: "Document authorized access or sharing changes, provider requests, evidence preservation and escalation decisions." }
            ],
            entryIds: ["CSM-D02-R-M03", "CSM-D06-R-M01", "CSM-D06-R-M02", "CSM-D06-R-M04"]
          },
          {
            id: "COV-confidential-meetings-recover",
            phaseId: "recover",
            prompt: "Are room and conferencing weaknesses revalidated, temporary access closed and shared materials or recordings handled under approved retention decisions?",
            evidence: "Revalidation results, closed access exceptions and reviewed disposition of meeting materials, with documented limits on provider deletion or other verification.",
            action: "Correct and retest the affected room or service, handle shared equipment and records according to approved retention and evidence needs and update host guidance.",
            tools: [
              { name: "Room and platform revalidation sheet", use: "Verify fixes, shared-equipment handling and access closure against the original confidentiality requirements." },
              { name: "Meeting disclosure lesson tracker", use: "Connect lessons to provider, configuration, room and host-training changes with accountable verification." }
            ],
            entryIds: ["CSM-D02-RC-M03", "CSM-D02-RC-M04", "CSM-D06-RC-M02", "CSM-D06-RC-M04"]
          }
        ]
      },
      {
        id: "risk-transfer",
        title: "Insurance, retained exposure and claims readiness",
        gapIds: ["G15"],
        domainIds: ["security-of-production-and-operations", "compliance-control", "contingency-and-crisis-management"],
        applicability: "Which security or continuity loss scenarios may warrant contractual or insurance transfer, and which consequences remain with the organization?",
        ownerRoles: ["Finance and insurance coordination", "Legal and contract management", "Business continuity and security owners"],
        reviewState: "draft",
        sourceIds: ["COV-S-GOV-EK", "COV-S-INSURANCE-NAIC-INTERRUPTION"],
        checks: [
          {
            id: "COV-risk-transfer-identify",
            phaseId: "identify",
            prompt: "Are plausible security and continuity losses mapped to actual contracts and policies, including limits, exclusions and consequences that cannot be transferred?",
            evidence: "A scenario-to-policy review by competent finance, insurance and legal roles, identifying relevant jurisdictions, deductibles, interruption assumptions and retained exposure.",
            action: "Evaluate actual policy wording and contractual allocation in the organization's context; retain prevention and continuity controls because insurance does not eliminate risk.",
            tools: [
              { name: "Security scenario-to-policy map", use: "Compare plausible losses with specific contracts and policies, identifying relevant terms and unresolved interpretation." },
              { name: "Retained-loss and recovery assumption register", use: "Record uninsured consequences, deductibles, limits, payment uncertainty and continuity funding assumptions." }
            ],
            entryIds: ["CSM-D04-I-M01", "CSM-D04-I-M02", "CSM-D08-I-M02", "CSM-D08-I-M04"]
          },
          {
            id: "COV-risk-transfer-protect",
            phaseId: "protect",
            prompt: "Are transfer decisions reviewed by competent advisers, with protective conditions, notification responsibilities and claims records integrated into operating controls?",
            evidence: "Reviewed policy and contract terms, confirmed responsible roles, evidence of required protective measures and a claims preparation plan specific to the actual coverage.",
            action: "Resolve uncertain terms with qualified advisers, align protective measures and reporting responsibilities and maintain resilience independent of an assumed payout.",
            tools: [
              { name: "Policy terms and coverage comparison sheet", use: "Compare limits, exclusions, deductibles, territorial scope and conditions without assuming a standard product covers every loss." },
              { name: "Claims readiness and protective-conditions checklist", use: "Assign policy-specific notification, record preparation and protective-condition responsibilities to accountable roles." }
            ],
            entryIds: ["CSM-D04-P-M02", "CSM-D07-P-M04", "CSM-D08-P-M01", "CSM-D08-P-M02"]
          },
          {
            id: "COV-risk-transfer-detect",
            phaseId: "detect",
            prompt: "Are changing assets, services, suppliers and exposures checked against policy renewal, protective conditions and notification requirements?",
            evidence: "Policy review and renewal records, material-change assessments, sampled evidence of relevant protective conditions and tracked adviser or insurer clarification requests.",
            action: "Trigger a competent review when exposure or coverage changes, address unmet conditions and avoid equating a valid policy or paid premium with confirmed claim eligibility.",
            tools: [
              { name: "Policy change and renewal register", use: "Track renewal, material exposure changes and policy-specific review or notification triggers with assigned roles." },
              { name: "Protective-condition evidence sampling", use: "Check operating evidence against actual policy conditions and record uncertainty for competent interpretation." }
            ],
            entryIds: ["CSM-D04-D-M02", "CSM-D07-D-M03", "CSM-D08-D-M02", "CSM-D08-D-M03"]
          },
          {
            id: "COV-risk-transfer-respond",
            phaseId: "respond",
            prompt: "Can authorized claims and incident roles coordinate timely policy-specific notifications, preserve relevant loss records and sustain safe response and continuity?",
            evidence: "A tested claims contact and authority path, relevant policy notification requirements, evidence-preservation responsibilities and a loss-record index in approved organizational systems.",
            action: "Coordinate competent insurer, adviser and legal contacts using the actual policy; preserve necessary records and do not delay life safety or approved containment to pursue a claim.",
            tools: [
              { name: "Claims coordination and notification log", use: "Track policy-specific contacts, required notifications, advice, responsible roles and outstanding information requests." },
              { name: "Loss evidence and decision index", use: "Locate authorized financial, asset and incident records with custody and retention responsibilities, not uploads to this tool." }
            ],
            entryIds: ["CSM-D04-R-M03", "CSM-D07-R-M01", "CSM-D08-R-M01", "CSM-D08-R-M02"]
          },
          {
            id: "COV-risk-transfer-recover",
            phaseId: "recover",
            prompt: "Are claims, actual recovery costs and retained losses reconciled, with continued control improvements rather than treating reimbursement as risk closure?",
            evidence: "Recovery funding reconciliations, unresolved claim and coverage records, verified corrective actions and competent review of future policy and continuity assumptions.",
            action: "Reconcile settlements and uninsured consequences, retain unresolved claims under accountable ownership and use lessons to improve both controls and transfer arrangements.",
            tools: [
              { name: "Recovery funding and retained-loss reconciliation", use: "Compare verified costs, receipts and unresolved claims with funding assumptions and retained financial exposure." },
              { name: "Insurance and continuity learning review", use: "Review coverage gaps and claims experience with competent advisers while maintaining prevention and recovery improvements." }
            ],
            entryIds: ["CSM-D04-RC-M01", "CSM-D04-RC-M04", "CSM-D07-RC-M01", "CSM-D08-RC-M02"]
          }
        ]
      }
    ]
  };
})();
