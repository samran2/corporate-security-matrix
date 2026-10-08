/* Draft management-review questions, not engineering or emergency instructions.
 * Sources supply topic context only; they do not approve these checks or map
 * each linked core control to a legal obligation. See ADR 0003.
 */
(() => {
  "use strict";

  globalThis.CSMCoverageShards = globalThis.CSMCoverageShards || {};
  globalThis.CSMCoverageShards.safety = {
    sources: [
      {
        id: "COV-S-TUKES-PROCESS-SYSTEM",
        title: "Process-safety management system",
        authority: "Finnish Safety and Chemicals Agency (Tukes)",
        url: "https://tukes.fi/prosessiturvallisuusjarjestelma",
        reviewedOn: "2026-10-09"
      },
      {
        id: "COV-S-TUKES-PROCESS-CHANGE",
        title: "Process-safety management of change",
        authority: "Finnish Safety and Chemicals Agency (Tukes)",
        url: "https://tukes.fi/prosessiturvallisuusjarjestelma/muutosten-hallinta",
        reviewedOn: "2026-10-09"
      },
      {
        id: "COV-S-TUKES-CONSUMER-SERVICES",
        title: "Consumer-service safety guidance (2025)",
        authority: "Finnish Safety and Chemicals Agency (Tukes)",
        url: "https://tukes.fi/kulutuspalvelujen-turvallisuus",
        reviewedOn: "2026-10-09"
      },
      {
        id: "COV-S-TUKES-SERVICE-RISK",
        title: "Risk-based consumer-service safety and continual improvement",
        authority: "Finnish Safety and Chemicals Agency (Tukes)",
        url: "https://tukes.fi/tuotteet-ja-palvelut/vapaa-ajan-palveluiden-turvallisuus/palveluntarjoajan-velvollisuudet/riskiperusteisuus-ja-jatkuva-parantaminen",
        reviewedOn: "2026-10-09"
      },
      {
        id: "COV-S-TUKES-PRODUCT-RESPONSIBILITY",
        title: "Responsibilities for consumer-product safety",
        authority: "Finnish Safety and Chemicals Agency (Tukes)",
        url: "https://tukes.fi/tuotteet-ja-palvelut/yleiset-kulutustavarat/vastuu-tuotteen-turvallisuudesta",
        reviewedOn: "2026-10-09"
      },
      {
        id: "COV-S-TRAFICOM-DANGEROUS-GOODS",
        title: "Dangerous-goods transport context (VAK)",
        authority: "Finnish Transport and Communications Agency (Traficom)",
        url: "https://www.traficom.fi/fi/liikennejarjestelma/vaarallisten-aineiden-kuljetus/vaarallisten-aineiden-kuljetus-vak",
        reviewedOn: "2026-10-09"
      },
      {
        id: "COV-S-TRAFICOM-DG-ADVISER",
        title: "Dangerous-goods safety adviser: role and competence",
        authority: "Finnish Transport and Communications Agency (Traficom)",
        url: "https://www.traficom.fi/fi/liikennejarjestelma/vaarallisten-aineiden-kuljetus/vaarallisten-aineiden-kuljetusten-turvallisuusneuvonantaja",
        reviewedOn: "2026-10-09"
      },
      {
        id: "COV-S-TRAFICOM-DRIVER-QUALIFICATIONS",
        title: "Driver licences and professional qualifications",
        authority: "Finnish Transport and Communications Agency (Traficom)",
        url: "https://www.traficom.fi/fi/kuljetusala/kuljettajan-luvat-ja-patevyydet",
        reviewedOn: "2026-10-09"
      },
      {
        id: "COV-S-HVK-CONTINUITY",
        title: "Business continuity and supply-security cooperation",
        authority: "National Emergency Supply Agency (Huoltovarmuuskeskus)",
        url: "https://www.huoltovarmuuskeskus.fi/tietoa-huoltovarmuudesta/jatkuvuudenhallinta",
        reviewedOn: "2026-10-09"
      }
    ],
    topics: [
      {
        id: "process-technical-safety",
        title: "Process, functional and technical safety",
        gapIds: ["G05"],
        domainIds: ["security-of-production-and-operations", "environmental-safety", "industrial-safety", "rescue-safety"],
        applicability: "Do our processes or equipment create major chemical, pressure, electrical, explosion-atmosphere or safety-function hazards requiring competent specialist assessment? Occupational-safety checks alone do not establish process safety.",
        ownerRoles: ["Process-safety lead", "Engineering and maintenance lead", "Site operations lead"],
        reviewState: "draft",
        sourceIds: ["COV-S-TUKES-PROCESS-SYSTEM", "COV-S-TUKES-PROCESS-CHANGE"],
        checks: [
          {
            id: "COV-process-technical-safety-identify",
            phaseId: "identify",
            prompt: "Has competent review identified process hazards, safety-critical functions and applicable technical specialties separately from routine occupational hazards?",
            evidence: "Site-specific hazard study, technical-scope decisions and responsible specialist roles.",
            action: "Commission a competent multidisciplinary review of undocumented hazards and barriers.",
            tools: [
              { name: "Specialist hazard-review worksheet", use: "Record assessment scope, hazard scenarios, barrier owners and unresolved questions; it cannot replace engineering analysis." },
              { name: "Technical applicability register", use: "Track electrical, pressure, explosion-atmosphere and functional-safety review needs with competent reviewers and review dates." }
            ],
            entryIds: ["CSM-D05-I-M02", "CSM-D09-I-M01"]
          },
          {
            id: "COV-process-technical-safety-protect",
            phaseId: "protect",
            prompt: "Are safety-critical barriers, approved operating limits and permanent or temporary changes governed by competent, site-specific authorization?",
            evidence: "Approved technical basis, maintenance responsibilities and sampled change approvals, including temporary-change expiry.",
            action: "Close change-approval gaps with engineering and operations before affected work is authorized.",
            tools: [
              { name: "Process change-control register", use: "Track hazard-review approval, temporary-change expiry, training and document updates without inventing equipment settings." },
              { name: "Barrier assurance schedule", use: "Assign verification and maintenance responsibilities using approved specialist procedures and acceptance criteria." }
            ],
            entryIds: ["CSM-D04-P-M03", "CSM-D04-P-M04", "CSM-D09-P-M02"]
          },
          {
            id: "COV-process-technical-safety-detect",
            phaseId: "detect",
            prompt: "Do competent teams detect degraded barriers, overdue verification and unauthorized changes, with escalation separate from injury statistics?",
            evidence: "Barrier-status reviews, verification records, deviations and escalation decisions.",
            action: "Assign owners to unresolved barrier deficiencies using site-approved risk decisions.",
            tools: [
              { name: "Safety-critical deficiency log", use: "Link failed or overdue verification to the affected barrier, escalation owner and authorized disposition." },
              { name: "Change-to-field reconciliation", use: "Sample actual configuration against approved change records with competent personnel; avoid intrusive testing without authorization." }
            ],
            entryIds: ["CSM-D05-D-M02", "CSM-D09-D-M04"]
          },
          {
            id: "COV-process-technical-safety-respond",
            phaseId: "respond",
            prompt: "Have trained teams rehearsed authority, responder handover and site-approved decision paths when a safety-critical condition deteriorates?",
            evidence: "Exercise records demonstrating role boundaries and handover under site emergency procedures.",
            action: "Resolve decision conflicts through competent review and an authorized tabletop exercise.",
            tools: [
              { name: "Safety decision-authority map", use: "Clarify authorized roles and escalation routes; it is not a shutdown or intervention procedure." },
              { name: "Responder handover exercise", use: "Rehearse sharing approved hazard information and command handover without performing hazardous interventions." }
            ],
            entryIds: ["CSM-D03-R-M03", "CSM-D03-R-M04", "CSM-D05-R-M03"]
          },
          {
            id: "COV-process-technical-safety-recover",
            phaseId: "recover",
            prompt: "Are commissioning and restart decisions supported by competent verification, completed change actions and applicable site or authority approvals?",
            evidence: "Authorized readiness review, barrier verification and documented closure of restart conditions.",
            action: "Require the designated competent authority to resolve outstanding readiness conditions.",
            tools: [
              { name: "Commissioning readiness dossier", use: "Index approved verification, training and authorization records; the dossier itself does not establish safe operation." },
              { name: "Temporary-change closure review", use: "Confirm temporary measures are removed or formally reassessed before normal operation is authorized." }
            ],
            entryIds: ["CSM-D09-R-M03", "CSM-D05-R-M04", "CSM-D04-RC-M03"]
          }
        ]
      },
      {
        id: "product-service-safety",
        title: "Product, service and customer safety",
        gapIds: ["G11"],
        domainIds: ["security-of-production-and-operations", "rescue-safety", "industrial-safety"],
        applicability: "Do products or services expose users or bystanders to harm, including foreseeable misuse, vulnerable users or lifecycle changes? Determine sector and operator-role duties with competent legal and safety review; cyber controls do not replace customer safety.",
        ownerRoles: ["Product or service safety lead", "Quality assurance lead", "Customer operations lead"],
        reviewState: "draft",
        sourceIds: ["COV-S-TUKES-PRODUCT-RESPONSIBILITY", "COV-S-TUKES-CONSUMER-SERVICES", "COV-S-TUKES-SERVICE-RISK"],
        checks: [
          {
            id: "COV-product-service-safety-identify",
            phaseId: "identify",
            prompt: "Have competent owners assessed intended use, foreseeable misuse, affected user groups and product or service safety responsibilities?",
            evidence: "Lifecycle hazard assessment, user-group assumptions and reviewed operator-role scope.",
            action: "Review unassessed lifecycle stages and user needs with competent specialists.",
            tools: [
              { name: "Lifecycle hazard inventory", use: "Map design, delivery, use, maintenance and retirement hazards to assessment owners rather than treating a quality certificate as proof." },
              { name: "Operator-role responsibility matrix", use: "Record manufacturer, supplier and service-provider interfaces; obtain jurisdiction-specific review where duties differ." }
            ],
            entryIds: ["CSM-D04-I-M02", "CSM-D03-I-M03"]
          },
          {
            id: "COV-product-service-safety-protect",
            phaseId: "protect",
            prompt: "Are safety requirements, user information and safety-affecting changes reviewed before release or service delivery?",
            evidence: "Competent safety approval, relevant verification and controlled user-information revisions.",
            action: "Introduce a safety review gate for unassessed changes and user information.",
            tools: [
              { name: "Safety release-review checklist", use: "Confirm responsible specialists have reviewed hazards, tests, supplied components and unresolved release conditions." },
              { name: "User-information review record", use: "Check safety communication against actual users, language and accessibility needs; warnings do not replace hazard control." }
            ],
            entryIds: ["CSM-D04-P-M01", "CSM-D04-P-M04"]
          },
          {
            id: "COV-product-service-safety-detect",
            phaseId: "detect",
            prompt: "Do complaints, returns, near misses and field observations reach a named safety decision-maker instead of remaining isolated customer-service cases?",
            evidence: "Sampled field-signal triage, trend review and safety escalation decisions.",
            action: "Connect customer and operational signals to competent safety triage.",
            tools: [
              { name: "Field-safety signal register", use: "Link anonymized complaint and incident categories to affected products or services, review ownership and action status." },
              { name: "Traceability sampling exercise", use: "Test whether responsible teams can identify affected deliveries or service sessions from an agreed scenario." }
            ],
            entryIds: ["CSM-D04-D-M04", "CSM-D04-D-M01"]
          },
          {
            id: "COV-product-service-safety-respond",
            phaseId: "respond",
            prompt: "Have responsible teams rehearsed safety escalation, customer communication and recall or service-restriction decisions where applicable?",
            evidence: "Scenario decisions, decision authority and reviewed notification or recall arrangements.",
            action: "Exercise a realistic field-safety case with competent safety and legal owners.",
            tools: [
              { name: "Recall and service-restriction tabletop", use: "Test authority, affected-scope identification and customer interfaces; use approved organizational response procedures." },
              { name: "Safety notification decision log", use: "Record verified facts, responsible reviewers and applicable notification decisions without assuming one rule fits every sector." }
            ],
            entryIds: ["CSM-D04-R-M01", "CSM-D04-R-M03"]
          },
          {
            id: "COV-product-service-safety-recover",
            phaseId: "recover",
            prompt: "Is resumed delivery supported by competent safety verification, effective corrective actions and a plan for affected users or remaining products?",
            evidence: "Approved corrective-action verification, resumption decisions and continuing field monitoring.",
            action: "Verify corrective-action effectiveness before treating the safety case as closed.",
            tools: [
              { name: "Corrective-action effectiveness review", use: "Compare revised controls with the original failure mechanism and record independent challenge appropriate to consequence." },
              { name: "Affected-user follow-up plan", use: "Track communication and unresolved remediation through approved systems without entering personal case data here." }
            ],
            entryIds: ["CSM-D04-RC-M02", "CSM-D04-RC-M03"]
          }
        ]
      },
      {
        id: "event-safety",
        title: "Public events and visitor safety",
        gapIds: ["G11"],
        domainIds: ["premises-security", "rescue-safety", "security-of-production-and-operations", "industrial-safety"],
        applicability: "Do we organize, host or supply events, public activities or temporary venues? Assess ordinary crowd congestion, structures and visitor needs as well as deliberate threats. Competent local review determines event-specific duties and operating arrangements.",
        ownerRoles: ["Event organizer lead", "Venue operations lead", "Event safety coordinator"],
        reviewState: "draft",
        sourceIds: ["COV-S-TUKES-CONSUMER-SERVICES", "COV-S-TUKES-SERVICE-RISK"],
        checks: [
          {
            id: "COV-event-safety-identify",
            phaseId: "identify",
            prompt: "Have competent reviewers assessed visitor flow, crowd pinch points, temporary structures, changing conditions and organizer–venue–provider responsibilities?",
            evidence: "Event-specific risk review, approved venue assumptions and responsibility agreements.",
            action: "Resolve unowned visitor-safety interfaces before event authorization.",
            tools: [
              { name: "Event safety interface map", use: "Assign organizer, venue and provider ownership for visitor flow, structures, accessibility and emergency coordination." },
              { name: "Visitor-journey hazard review", use: "Discuss arrival, queuing, participation and departure with competent reviewers; do not calculate capacity from generic assumptions." }
            ],
            entryIds: ["CSM-D03-I-M02", "CSM-D03-I-M04", "CSM-D09-I-M03"]
          },
          {
            id: "COV-event-safety-protect",
            phaseId: "protect",
            prompt: "Are capacity, flow arrangements, temporary installations and visitor instructions approved by competent personnel for the specific event?",
            evidence: "Authorized event plan, specialist acceptance records and provider briefings.",
            action: "Close approval and briefing gaps using competent venue and event specialists.",
            tools: [
              { name: "Event readiness sign-off register", use: "Index competent approvals for temporary structures, visitor areas and staff capability; do not substitute a checklist for inspection." },
              { name: "Visitor communication rehearsal", use: "Review understandable, accessible messages and staff handoffs against the approved event plan." }
            ],
            entryIds: ["CSM-D03-P-M01", "CSM-D03-P-M03", "CSM-D03-P-M04"]
          },
          {
            id: "COV-event-safety-detect",
            phaseId: "detect",
            prompt: "Can event teams recognize crowd congestion, changed weather or installation conditions and escalate against approved decision criteria?",
            evidence: "Event observation arrangements, contact checks and documented escalation responsibilities.",
            action: "Rehearse detection-to-decision handoffs using site-approved criteria.",
            tools: [
              { name: "Event observation-and-escalation card", use: "List approved observation responsibilities and escalation contacts, without prescribing crowd limits or structural tolerances." },
              { name: "Condition-change tabletop", use: "Check how weather, a blocked route or unavailable communications changes the event decision chain." }
            ],
            entryIds: ["CSM-D03-D-M01", "CSM-D03-D-M03", "CSM-D03-D-M04"]
          },
          {
            id: "COV-event-safety-respond",
            phaseId: "respond",
            prompt: "Have authorized staff rehearsed visitor communication, assistance, interruption authority and handover to public responders under the approved event plan?",
            evidence: "Exercise or briefing records demonstrating roles, visitor assistance and responder interfaces.",
            action: "Resolve communication and decision gaps through an authorized event exercise.",
            tools: [
              { name: "Event command handover exercise", use: "Rehearse who decides and communicates, respecting competence and public-responder authority; it is not an emergency instruction." },
              { name: "Accessible message review", use: "Check approved event messages and assistance arrangements with representative visitor needs and fallback channels." }
            ],
            entryIds: ["CSM-D03-R-M01", "CSM-D03-R-M03", "CSM-D03-R-M04"]
          },
          {
            id: "COV-event-safety-recover",
            phaseId: "recover",
            prompt: "Do competent owners review reopening or event closeout, safe dismantling interfaces and lessons before similar activities recur?",
            evidence: "Authorized closeout or reopening review and verified corrective-action ownership.",
            action: "Carry event findings into the next approval and provider briefing cycle.",
            tools: [
              { name: "Event closeout review", use: "Review visitor findings, temporary-installation handback and contractor interfaces under approved procedures." },
              { name: "Repeat-event action tracker", use: "Require evidence of implemented improvements before copying the previous event plan." }
            ],
            entryIds: ["CSM-D03-RC-M01", "CSM-D03-RC-M04", "CSM-D09-RC-M03"]
          }
        ]
      },
      {
        id: "transport-dangerous-goods",
        title: "Transport, fleet and dangerous goods",
        gapIds: ["G12"],
        domainIds: ["security-of-production-and-operations", "environmental-safety", "industrial-safety", "rescue-safety"],
        applicability: "Do we operate fleets or act in transport, packing, loading, unloading or temporary-storage interfaces? Determine dangerous-goods involvement, transport mode and role-specific duties with competent review; cargo security alone does not establish transport safety.",
        ownerRoles: ["Transport operations lead", "Fleet safety lead", "Dangerous-goods competent adviser"],
        reviewState: "draft",
        sourceIds: ["COV-S-TRAFICOM-DANGEROUS-GOODS", "COV-S-TRAFICOM-DG-ADVISER", "COV-S-TRAFICOM-DRIVER-QUALIFICATIONS"],
        checks: [
          {
            id: "COV-transport-dangerous-goods-identify",
            phaseId: "identify",
            prompt: "Have competent owners identified transport modes, fleet exposure, loading interfaces and any dangerous-goods roles or exemptions needing specialist confirmation?",
            evidence: "Transport-role inventory and competent review of applicable goods, modes and responsibilities.",
            action: "Resolve unreviewed transport-role and dangerous-goods scope decisions.",
            tools: [
              { name: "Transport-role applicability matrix", use: "Map operator, sender, packer, loader and receiver interfaces; ask a competent specialist to validate duties and exceptions." },
              { name: "Fleet-and-route exposure inventory", use: "Record vehicle classes, routes, transfer sites and critical contractor dependencies for management review." }
            ],
            entryIds: ["CSM-D04-I-M01", "CSM-D05-I-M02", "CSM-D09-I-M03"]
          },
          {
            id: "COV-transport-dangerous-goods-protect",
            phaseId: "protect",
            prompt: "Are driver competence, vehicle readiness and loading or transfer controls governed by approved mode-specific procedures and responsible parties?",
            evidence: "Qualification checks, maintenance governance and sampled loading or transfer authorizations.",
            action: "Close competence and handoff gaps with the transport operator and relevant specialists.",
            tools: [
              { name: "Qualification and readiness register", use: "Track required competence and vehicle-review status in approved systems; personal records are not entered here." },
              { name: "Loading-interface review checklist", use: "Confirm who checks approved packaging, loading and transfer arrangements; it is not a cargo-classification or securing instruction." }
            ],
            entryIds: ["CSM-D04-P-M02", "CSM-D05-P-M01", "CSM-D09-P-M04"]
          },
          {
            id: "COV-transport-dangerous-goods-detect",
            phaseId: "detect",
            prompt: "Do operators detect competence expiry, vehicle defects, loading deviations and transport or temporary-storage incidents early enough for authorized review?",
            evidence: "Exception samples, readiness monitoring and transport-partner corrective-action reviews.",
            action: "Connect transport exceptions to named decision owners and competent escalation.",
            tools: [
              { name: "Transport safety exception register", use: "Track reported defects and transfer deviations against approved review and disposition responsibilities." },
              { name: "Partner safety assurance review", use: "Review incident trends, overdue corrective actions and verified capability beyond delivery-time performance." }
            ],
            entryIds: ["CSM-D04-D-M02", "CSM-D05-D-M04", "CSM-D09-D-M03"]
          },
          {
            id: "COV-transport-dangerous-goods-respond",
            phaseId: "respond",
            prompt: "Have responsible parties rehearsed transport-incident notification, accurate goods information and responder coordination within approved role-specific arrangements?",
            evidence: "Mode-specific exercise, validated contact routes and competent notification review.",
            action: "Exercise an operator–site–responder handoff without simulating hazardous handling.",
            tools: [
              { name: "Transport incident tabletop", use: "Test authority and information handoff using approved operator procedures; do not invent spill-response or rescue steps." },
              { name: "Incident information responsibility map", use: "Identify who supplies verified goods and consignment information and who reviews applicable reporting duties." }
            ],
            entryIds: ["CSM-D05-R-M02", "CSM-D05-R-M03", "CSM-D03-R-M03"]
          },
          {
            id: "COV-transport-dangerous-goods-recover",
            phaseId: "recover",
            prompt: "Are vehicles, cargo routes and partner arrangements returned to service only after competent verification and closure of incident-related conditions?",
            evidence: "Authorized return-to-service decisions and verified transport or supplier corrective actions.",
            action: "Have competent transport owners verify readiness before normal dispatch resumes.",
            tools: [
              { name: "Return-to-service evidence checklist", use: "Index competent inspection and authorization records without asserting that this checklist certifies a vehicle or load." },
              { name: "Transport lessons review", use: "Feed verified causes into operator selection, training, maintenance and transfer-interface governance." }
            ],
            entryIds: ["CSM-D04-RC-M02", "CSM-D04-RC-M04", "CSM-D05-RC-M04"]
          }
        ]
      },
      {
        id: "cross-domain-resilience",
        title: "Coupled dependencies and prolonged disruption",
        gapIds: ["G14"],
        domainIds: ["contingency-and-crisis-management", "security-of-production-and-operations", "information-and-cyber-security", "environmental-safety", "rescue-safety", "industrial-safety"],
        applicability: "Which critical services depend on shared utilities, people, sites, digital systems or suppliers, and could several fail together or remain unavailable for an extended period? Determine sector, jurisdiction and civil-preparedness coordination context rather than assuming universal duties.",
        ownerRoles: ["Business continuity lead", "Critical-service owner", "Crisis coordination lead"],
        reviewState: "draft",
        sourceIds: ["COV-S-HVK-CONTINUITY"],
        checks: [
          {
            id: "COV-cross-domain-resilience-identify",
            phaseId: "identify",
            prompt: "Has business-impact analysis tested coupled failures and prolonged utility, staffing or supplier shortages across critical service dependencies?",
            evidence: "Dependency map, scenario assumptions and documented minimum service needs.",
            action: "Challenge hidden shared dependencies with service, safety and technology owners.",
            tools: [
              { name: "Coupled-dependency map", use: "Connect critical services to shared utilities, sites, suppliers, personnel and technology; mark untested assumptions." },
              { name: "Extended-disruption scenario worksheet", use: "Compare combined cyber, flood, resource and supplier disruptions without presenting a generic duration as a required resilience target." }
            ],
            entryIds: ["CSM-D08-I-M01", "CSM-D08-I-M02", "CSM-D04-I-M04"]
          },
          {
            id: "COV-cross-domain-resilience-protect",
            phaseId: "protect",
            prompt: "Have owners tested whether alternatives, reserves and partner support remain available when the same disruption affects several parties?",
            evidence: "Exercises challenging fallback independence and critical-partner continuity assumptions.",
            action: "Replace unverified fallback assumptions with exercised arrangements and owned decisions.",
            tools: [
              { name: "Fallback independence review", use: "Check shared locations, utilities and suppliers behind supposed alternatives before relying on them." },
              { name: "Resource-allocation tabletop", use: "Test extended staffing and resource constraints with safety, service and supplier roles under approved continuity plans." }
            ],
            entryIds: ["CSM-D08-P-M01", "CSM-D08-P-M02", "CSM-D08-P-M04"]
          },
          {
            id: "COV-cross-domain-resilience-detect",
            phaseId: "detect",
            prompt: "Can teams combine dependency warnings into a shared escalation picture while showing unknowns and degraded information quality?",
            evidence: "Cross-team trigger reviews and exercised information handoffs during degraded communications.",
            action: "Resolve inconsistent trigger ownership and stale partner assumptions.",
            tools: [
              { name: "Dependency warning register", use: "Record relevant service, utility and partner signals with source, freshness and escalation ownership." },
              { name: "Degraded-information exercise", use: "Challenge how teams distinguish verified facts from assumptions when ordinary status channels fail." }
            ],
            entryIds: ["CSM-D08-D-M01", "CSM-D08-D-M03", "CSM-D08-D-M04"]
          },
          {
            id: "COV-cross-domain-resilience-respond",
            phaseId: "respond",
            prompt: "Have leaders rehearsed cross-domain service priorities, safety constraints and external coordination during a compound, prolonged disruption?",
            evidence: "Exercise decision log with trade-offs, accountable roles and applicable authority or sector interfaces.",
            action: "Exercise unresolved priority conflicts with competent safety and external coordination roles.",
            tools: [
              { name: "Critical-service decision log", use: "Capture verified constraints, decision authority and review points without substituting for site emergency procedures." },
              { name: "External coordination map", use: "Review supplier, customer, competent-authority and relevant sector-network interfaces; confirm applicability and contacts locally." }
            ],
            entryIds: ["CSM-D08-R-M01", "CSM-D08-R-M02", "CSM-D08-R-M03"]
          },
          {
            id: "COV-cross-domain-resilience-recover",
            phaseId: "recover",
            prompt: "Does phased restoration verify dependencies, safe operating conditions and closure of emergency exceptions before removing crisis oversight?",
            evidence: "Joint restoration approvals, reconciled workarounds and funded improvement decisions.",
            action: "Verify cross-domain restoration prerequisites and assign remaining exception owners.",
            tools: [
              { name: "Restoration dependency review", use: "Sequence approved readiness decisions across sites, technology, suppliers and services with competent safety review." },
              { name: "Emergency-exception closure tracker", use: "Track temporary contracts, manual workarounds and unresolved capability gaps to explicit review or closure." }
            ],
            entryIds: ["CSM-D08-RC-M01", "CSM-D08-RC-M03", "CSM-D08-RC-M04"]
          }
        ]
      }
    ]
  };
})();
