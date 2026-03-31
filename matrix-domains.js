const phases = [
  {
    id: "identify",
    title: "Identify",
    summary: "Map assets, exposure, obligations and critical dependencies before loss starts."
  },
  {
    id: "protect",
    title: "Protect",
    summary: "Reduce likelihood through hardening, training, governance and secure design."
  },
  {
    id: "detect",
    title: "Detect",
    summary: "Surface weak signals, anomalies and control drift early enough to act."
  },
  {
    id: "respond",
    title: "Respond",
    summary: "Contain impact, protect people and coordinate fast decisions under pressure."
  },
  {
    id: "recover",
    title: "Recover",
    summary: "Restore continuity, repair trust and feed lessons back into the system."
  }
];

const domains = [
  {
    id: "personnel-security",
    name: "People and Personnel Security",
    focus: "Workforce integrity, duty of care, travel risk, psychosocial safety and continuity of critical roles.",
    sourceContext: "This source pack is scoped to travel risk, workplace conduct, psychosocial safety, targeted personal protection and workforce resilience.",
    cells: {
      identify: {
        threats: [
          "Critical roles concentrated in too few people or geographies",
          "Travel, lone work or high-risk assignment exposure not risk-tiered",
          "Employees, contractors or temporary staff granted sensitive access without proportional screening"
        ],
        controls: [
          "Map critical roles, delegated authorities and succession coverage",
          "Maintain personnel and travel risk registers for high-risk roles and locations",
          "Apply risk-based pre-employment, onboarding and third-party screening within legal limits"
        ]
      },
      protect: {
        threats: [
          "Workplace violence, harassment, coercion or intimidation against staff",
          "Misuse of privileged knowledge, access or relationships by insiders",
          "Fatigue, stress or unmanaged mental-health strain degrading judgement and performance"
        ],
        controls: [
          "Use role-based access, segregation of duties and confidentiality commitments",
          "Establish violence prevention, travel protection and executive protection routines where justified",
          "Provide manager training, wellbeing support and clear conduct expectations"
        ]
      },
      detect: {
        threats: [
          "Behavioral change, retaliation, coercion indicators or policy drift going unreported",
          "Access misuse, unusual privilege activity or confidentiality breaches",
          "Loss of contact, welfare concerns or deteriorating team climate during travel or crisis periods"
        ],
        controls: [
          "Maintain speak-up, grievance and welfare reporting channels with protected escalation paths",
          "Review privileged access, exception cases and insider-risk indicators jointly across HR, security and legal",
          "Use check-in routines, travel monitoring and periodic role-risk reviews"
        ]
      },
      respond: {
        threats: [
          "Credible threat, assault, kidnapping, disappearance or welfare emergency affecting personnel",
          "Confirmed insider event requiring immediate containment and evidence protection",
          "Loss of a key decision-maker during an ongoing disruption"
        ],
        controls: [
          "Activate welfare checks, emergency contacts, travel support and crisis escalation immediately",
          "Suspend affected access, preserve evidence and coordinate HR, legal, security and line leadership",
          "Transfer authority using pre-approved backups and continuity delegations"
        ]
      },
      recover: {
        threats: [
          "Trauma, burnout, attrition or mistrust persisting after the event",
          "Long-term capability loss in critical teams or specialist functions",
          "Repeat personnel incidents caused by unchanged practices or culture"
        ],
        controls: [
          "Use return-to-work, psychosocial support and structured debrief processes",
          "Rebuild role redundancy, staffing resilience and leadership bench strength",
          "Refresh travel, conduct, access and workforce-risk controls from lessons learned"
        ]
      }
    }
  },
  {
    id: "premises-security",
    name: "Physical and Site Security",
    focus: "Facilities, perimeters, critical utilities, protective design, zoning and physical asset protection.",
    sourceContext: "This source pack is scoped to protective design, facility planning, access layers, critical infrastructure dependencies and site-level physical resilience.",
    cells: {
      identify: {
        threats: [
          "Exposed perimeters, delivery routes, parking areas or public interfaces around critical sites",
          "Critical utilities, control rooms or archives located in weakly protected zones",
          "Single-site dependence with no alternate facility or fallback workspace"
        ],
        controls: [
          "Perform site threat and vulnerability assessments using zoning and critical-asset mapping",
          "Review utilities, access routes, neighbours, protest exposure and environmental design factors",
          "Link site criticality to business-impact and alternate-site planning"
        ]
      },
      protect: {
        threats: [
          "Unauthorized access, theft, sabotage, vandalism or protest-related disruption",
          "Compromised badges, keys, visitor routines or uncontrolled contractor access",
          "Damage escalation because barriers, storage, lighting or utility safeguards are inadequate"
        ],
        controls: [
          "Layer perimeter protection, access control, locks, barriers, lighting and secure storage",
          "Control visitor, vendor and delivery flows through authorization, escorting and permit rules",
          "Protect critical rooms, utilities and records with segmented access and physical hardening"
        ]
      },
      detect: {
        threats: [
          "Intrusion, tampering or unauthorized movement hidden by surveillance blind spots",
          "Access rights misuse, tailgating or credential sharing remaining undetected",
          "Alarm, CCTV or guard-response failure discovered only after impact"
        ],
        controls: [
          "Use alarms, CCTV, access logs and guard tours with health checks on the security systems themselves",
          "Review visitor, delivery and vehicle anomalies against normal operating patterns",
          "Test detection coverage around critical spaces, utilities and out-of-hours operations"
        ]
      },
      respond: {
        threats: [
          "Intrusion, suspicious item, targeted attack or civil disorder affecting the site",
          "Physical compromise of utilities, communications or building-management systems",
          "Need for immediate lockdown, evacuation or shelter decisions under uncertainty"
        ],
        controls: [
          "Execute lockdown, shelter or evacuation playbooks using site command roles and clear triggers",
          "Protect people first, isolate affected areas and preserve scene integrity for investigation",
          "Coordinate site leadership, security providers, emergency services and public authorities"
        ]
      },
      recover: {
        threats: [
          "Prolonged facility outage, loss of credentials or damaged utilities after the incident",
          "Business disruption due to restricted access, repair activity or investigation holds",
          "Repeat physical incidents because design weaknesses were left unchanged"
        ],
        controls: [
          "Restore utilities, reissue credentials, validate controls and reopen spaces in controlled phases",
          "Use alternate workspace and prioritized site-restoration sequencing",
          "Capture lessons into site design, access architecture, vendor controls and capital planning"
        ]
      }
    }
  },
  {
    id: "rescue-safety",
    name: "Emergency Preparedness and Life Safety",
    focus: "All-hazards emergency planning, fire safety, evacuation, first response and casualty management.",
    sourceContext: "This source pack is scoped to emergency action planning, incident management, first response, evacuation readiness and casualty handling.",
    cells: {
      identify: {
        threats: [
          "Fire load, ignition sources, hazardous work or occupancy risks not fully understood",
          "Weak evacuation capacity for vulnerable occupants, visitors or high-density operations",
          "Mass-casualty or severe incident scenarios exceeding normal first-response assumptions"
        ],
        controls: [
          "Maintain all-hazards emergency plans, hazard maps and incident-command roles for each site",
          "Assess occupancy, evacuation routes, assembly points and first-aid capacity against real scenarios",
          "Identify external responder interfaces, special populations and high-impact incident triggers"
        ]
      },
      protect: {
        threats: [
          "Fire, explosion, smoke spread, structural failure or delayed emergency notification",
          "Unsafe hot work, contractor activity or temporary arrangements bypassing life-safety controls",
          "Insufficient drills, equipment readiness or first-aid competence among personnel"
        ],
        controls: [
          "Use permits, compartmentation, extinguishers, suppression, signage and maintained escape routes",
          "Control high-risk work through authorization, supervision and shutdown criteria",
          "Train personnel in alarm response, evacuation, first aid and first-response firefighting where appropriate"
        ]
      },
      detect: {
        threats: [
          "Blocked exits, disabled alarms or degraded suppression systems discovered too late",
          "Near misses, small incidents or weak signals ignored before escalation",
          "Lack of visibility on equipment readiness, drill performance or emergency communications"
        ],
        controls: [
          "Inspect, test and maintain alarms, suppression, emergency lighting, exits and response equipment",
          "Track near misses, drill findings and emergency-readiness deficiencies as leading indicators",
          "Verify emergency communications, accountability processes and responder contact data regularly"
        ]
      },
      respond: {
        threats: [
          "Active fire, explosion, collapse, severe injury or mass-casualty incident in progress",
          "Rapid loss of safe occupancy requiring immediate command decisions",
          "Confusion between internal response teams and public emergency services"
        ],
        controls: [
          "Alarm, evacuate or shelter as required, account for people and establish incident command quickly",
          "Provide first aid, triage and immediate hazard isolation only within trained and safe operating limits",
          "Guide emergency services, share situation data and maintain a single decision log during the event"
        ]
      },
      recover: {
        threats: [
          "Unsafe re-entry, depleted emergency stocks or unresolved life-safety defects after the incident",
          "Psychological impact and degraded readiness after a severe event",
          "Reopening without addressing the systemic causes of the emergency"
        ],
        controls: [
          "Use phased re-entry, safety validation and replenishment of emergency resources before resuming operations",
          "Conduct after-action review, welfare support and retraining where performance gaps were exposed",
          "Update layouts, permits, drills and emergency plans based on root-cause findings"
        ]
      }
    }
  },
  {
    id: "security-of-production-and-operations",
    name: "Operations, Supply Chain and Quality",
    focus: "Products, services, logistics, supplier dependencies, payment integrity and quality management.",
    sourceContext: "This source pack is scoped to supply-chain dependence, quality control, continuity of delivery, payment integrity and operational risk treatment.",
    cells: {
      identify: {
        threats: [
          "Single-source suppliers, logistics bottlenecks or concentration risk in critical inputs",
          "Product, service or process failure modes not linked to customer harm and duty-of-care obligations",
          "Weak visibility into payment approvals, stock movements or high-value asset flows"
        ],
        controls: [
          "Map critical suppliers, service dependencies, transport routes and acceptable downtime thresholds",
          "Define quality-critical control points, customer safety obligations and recall thresholds",
          "Assess procurement, inventory and payment processes for fraud, error and disruption exposure"
        ]
      },
      protect: {
        threats: [
          "Counterfeit, poor-quality or unsafe inputs entering production or service delivery",
          "Contract ambiguity, chain-of-custody failure or weak handoffs across operations and logistics",
          "Unauthorized payments, inventory loss or weak change control in production environments"
        ],
        controls: [
          "Use supplier due diligence, approved-vendor controls, incoming checks and product-quality gates",
          "Define responsibilities, specifications, storage and transport requirements across the supply chain",
          "Apply secure approvals, reconciliation controls and change management for critical operations"
        ]
      },
      detect: {
        threats: [
          "Nonconformance, delivery anomalies or production deviations emerging before formal failure",
          "Supplier performance drift, recurring defects or weakening quality capability",
          "Payment irregularities or unexplained stock movement indicating fraud or control breakdown"
        ],
        controls: [
          "Monitor traceability, reconciliations, nonconformance data and exception handling",
          "Review supplier KPIs, audit findings, delivery reliability and corrective-action completion",
          "Use transaction monitoring and inventory analysis to surface abnormal patterns early"
        ]
      },
      respond: {
        threats: [
          "Product recall, customer safety event, supplier outage or shipment loss",
          "Fraud event or payment compromise affecting delivery obligations",
          "Need to halt production or service to contain quality or safety impact"
        ],
        controls: [
          "Trigger recall, stop-ship, hold-and-inspect or contingency sourcing plans with clear authority",
          "Contain financial exposure, reroute logistics and prioritize critical customers or services",
          "Coordinate regulatory, customer, supplier and contractual communications rapidly"
        ]
      },
      recover: {
        threats: [
          "Backlog, claims, penalties or trust erosion after operational disruption",
          "Long-term supplier degradation or repeated quality escapes",
          "Recovery focused only on output volume instead of resilient process redesign"
        ],
        controls: [
          "Use staged recovery scheduling, claims handling and critical-service restoration priorities",
          "Requalify suppliers, strengthen quality controls and update sourcing strategy where concentration was exposed",
          "Feed lessons into design, contracting, supplier governance and continuity plans"
        ]
      }
    }
  },
  {
    id: "environmental-safety",
    name: "Environmental and Hazardous Materials Safety",
    focus: "Environmental management systems, hazardous materials, permits, pollution prevention and ecological resilience.",
    sourceContext: "This source pack is scoped to environmental management systems, hazardous substances, emissions, waste, energy performance and incident containment.",
    cells: {
      identify: {
        threats: [
          "Hazardous materials, emissions sources or waste streams not fully inventoried or classified",
          "Permit obligations, sensitive receptors or community exposure pathways overlooked",
          "High energy, water or material intensity creating compliance and resilience stress"
        ],
        controls: [
          "Maintain environmental aspects registers, chemical inventories, permit registers and site baselines",
          "Map receptors, drainage, storage, transport and worst-case release scenarios",
          "Baseline energy, water, emissions and waste performance against operational risk and targets"
        ]
      },
      protect: {
        threats: [
          "Spills, releases, uncontrolled waste or pollution caused by weak handling and storage",
          "Cross-contamination, incompatible storage or contractor-caused environmental harm",
          "Failure to meet legal, customer or lender expectations on environmental performance"
        ],
        controls: [
          "Use segregation, containment, labeling, storage and transport controls for hazardous materials",
          "Operate an environmental management system with training, maintenance and contractor requirements",
          "Build resource efficiency, pollution prevention and emergency controls into routine operations"
        ]
      },
      detect: {
        threats: [
          "Leaks, abnormal consumption, permit deviations or emissions exceedances remaining unnoticed",
          "Weak monitoring around chemicals, waste routes, bunds or discharge points",
          "Community complaints or inspection findings surfacing before internal controls do"
        ],
        controls: [
          "Use inspections, metering, sampling, alarms and environmental KPI dashboards",
          "Monitor chemical, waste, drainage and storage controls with defined escalation thresholds",
          "Track complaints, deviations and regulator findings as early warning indicators"
        ]
      },
      respond: {
        threats: [
          "Spill, release, fire water contamination or pollution incident in progress",
          "Immediate risk to people, water, soil, wildlife or community trust",
          "Missed notification, sampling or containment actions increasing impact"
        ],
        controls: [
          "Isolate the source, protect people first and deploy spill, containment and shutdown measures",
          "Notify authorities and specialists as required, and begin sampling and impact assessment quickly",
          "Coordinate communications, remediation contractors and environmental decision logs in real time"
        ]
      },
      recover: {
        threats: [
          "Long-tail remediation cost, permit action, litigation or reputational damage after the event",
          "Loss of community confidence or license to operate due to weak follow-up",
          "Recurrence because environmental design and contractor controls were not improved"
        ],
        controls: [
          "Execute cleanup, remediation, reporting and stakeholder follow-up transparently",
          "Refresh permits, operating controls, contractor requirements and monitoring design",
          "Invest in resilient process design, efficiency and higher-integrity containment architecture"
        ]
      }
    }
  },
  {
    id: "information-and-cyber-security",
    name: "Information and Cybersecurity",
    focus: "Data, identities, systems, privacy, secure operations and digital continuity.",
    sourceContext: "This source pack is scoped to cyber-risk governance, baseline controls, incident response, third-party exposure and threat-informed defense.",
    cells: {
      identify: {
        threats: [
          "Critical data, systems, identities or recovery dependencies not inventoried and classified",
          "Third-party connections, cloud services or operational technology dependencies hidden from governance",
          "Weak understanding of crown-jewel assets and legal or contractual protection requirements"
        ],
        controls: [
          "Maintain asset, identity, data and dependency inventories tied to business criticality",
          "Classify information and services by confidentiality, integrity, availability and recovery need",
          "Map legal, privacy, supplier and customer obligations to the systems and data they affect"
        ]
      },
      protect: {
        threats: [
          "Phishing, ransomware, credential theft, misconfiguration or exploitable internet exposure",
          "Excess privilege, unmanaged endpoints or insecure remote access opening high-impact paths",
          "Data leakage or privacy failure caused by weak handling, transfer or retention controls"
        ],
        controls: [
          "Use MFA, least privilege, hardened baselines, segmentation and secure remote-access controls",
          "Maintain vulnerability, patch, endpoint, email and backup protections as core hygiene",
          "Apply encryption, data-handling rules, supplier controls and workforce cyber-awareness training"
        ]
      },
      detect: {
        threats: [
          "Compromise, lateral movement or suspicious privilege use hidden in routine operations",
          "Logging, monitoring or backup failures reducing visibility into attacks and outages",
          "Third-party or identity anomalies missed until services or data are affected"
        ],
        controls: [
          "Use centralized logging, EDR, network visibility and alert triage across critical environments",
          "Monitor identity, endpoint, network and data signals for abnormal behavior and integrity loss",
          "Continuously test backup recoverability, logging coverage and detection-use-case health"
        ]
      },
      respond: {
        threats: [
          "Cyber incident, major outage or data breach spreading faster than decision-making can keep up",
          "Regulated or sensitive data disclosure requiring legal, privacy and customer action",
          "Conflicting business pressure to restore service before containment is complete"
        ],
        controls: [
          "Contain accounts, hosts, credentials and network paths using predefined incident authority",
          "Run incident response, forensic preservation, legal assessment and crisis communications in parallel",
          "Make restore decisions from a trusted picture of scope, eradication status and recovery integrity"
        ]
      },
      recover: {
        threats: [
          "Prolonged outage, residual compromise or unreliable recovery after initial containment",
          "Loss of trust due to repeated incidents, weak transparency or poor corrective action",
          "Rebuilt services inheriting the same architectural weaknesses that enabled the event"
        ],
        controls: [
          "Restore from tested backups and trusted rebuild procedures with validation before reconnecting",
          "Rotate secrets, harden architecture and improve resilience based on root-cause findings",
          "Revalidate suppliers, monitoring coverage, business processes and customer trust after recovery"
        ]
      }
    }
  },
  {
    id: "compliance-control",
    name: "Integrity, Compliance and Investigations",
    focus: "Anti-corruption, misconduct prevention, reporting, investigations and control integrity.",
    sourceContext: "This source pack is scoped to anti-corruption, integrity programmes, third-party due diligence, misconduct reporting and investigation governance.",
    cells: {
      identify: {
        threats: [
          "Bribery, fraud, conflicts of interest or theft risk embedded in high-risk processes and markets",
          "Third parties, intermediaries or politically exposed relationships creating integrity exposure",
          "Unclear ownership for speak-up, legal hold, investigations or disciplinary decision-making"
        ],
        controls: [
          "Run integrity and misconduct risk assessments across procurement, sales, finance and public-interface activities",
          "Tier third parties, gifts, hospitality and approval points by corruption and fraud exposure",
          "Define reporting, investigation, legal-hold and remediation ownership with documented escalation paths"
        ]
      },
      protect: {
        threats: [
          "Improper payments, facilitation pressure, books-and-records manipulation or asset misuse",
          "Retaliation, weak culture or management override undermining compliance controls",
          "Third-party relationships used to bypass controls the organization would not breach directly"
        ],
        controls: [
          "Use codes of conduct, anti-bribery policies, segregation of duties and approval thresholds",
          "Apply due diligence, contractual controls, certifications and targeted training for high-risk actors",
          "Protect reporters and investigation integrity through confidentiality, non-retaliation and independent oversight"
        ]
      },
      detect: {
        threats: [
          "Suspicious payments, procurement anomalies or hospitality patterns escaping review",
          "Misconduct reports buried by weak intake, poor triage or fragmented ownership",
          "Evidence destruction or data loss before an allegation can be tested"
        ],
        controls: [
          "Use transaction analytics, audit trails, exception monitoring and reconciliations in high-risk processes",
          "Operate secure speak-up channels with triage criteria and case-management discipline",
          "Trigger preservation of relevant records, devices and communications when serious allegations arise"
        ]
      },
      respond: {
        threats: [
          "Confirmed bribery, fraud, theft, retaliation or major control breach requiring immediate action",
          "Regulatory inquiry, law-enforcement contact or sanctions exposure affecting leadership decisions",
          "Inconsistent response across HR, legal, finance and security weakening case credibility"
        ],
        controls: [
          "Secure evidence, isolate actors, stop suspect transactions and activate investigation governance rapidly",
          "Coordinate legal, HR, finance, compliance and security using documented authority and decision logs",
          "Cooperate with authorities and affected counterparties in line with law and case strategy"
        ]
      },
      recover: {
        threats: [
          "Trust erosion, financial loss or monitor obligations after a major integrity failure",
          "Recurring misconduct because incentives, controls or leadership signals were left unchanged",
          "Weak remediation closure causing the organization to fail the same test again"
        ],
        controls: [
          "Track remediation to closure with accountable owners, deadlines and independent validation",
          "Redesign incentives, approvals, third-party governance and books-and-records controls where failures occurred",
          "Use lessons learned to strengthen culture, training, communications and assurance plans"
        ]
      }
    }
  },
  {
    id: "contingency-and-crisis-management",
    name: "Business Continuity and Crisis Management",
    focus: "Critical services, dependencies, crisis leadership, resilience exercises and coordinated recovery.",
    sourceContext: "This source pack is scoped to continuity systems, crisis exercises, all-hazards resilience, external coordination and coordinated recovery.",
    cells: {
      identify: {
        threats: [
          "Critical services, recovery priorities and dependency chains not understood well enough for crisis decisions",
          "Single points of failure across people, sites, utilities, suppliers or digital services",
          "Crisis triggers and decision rights undefined until pressure is already high"
        ],
        controls: [
          "Run business-impact analysis and scenario planning across core services, products and jurisdictions",
          "Map dependency chains, maximum tolerable downtime and minimum operating requirements",
          "Define crisis governance, activation thresholds, external stakeholder maps and authority structures"
        ]
      },
      protect: {
        threats: [
          "Insufficient continuity capability for outages, political disruption, extreme weather or supply shocks",
          "Outdated plans, untrained leaders or no alternate arrangements for critical operations",
          "Overreliance on a single site, supplier, utility or team during extraordinary conditions"
        ],
        controls: [
          "Maintain continuity plans, alternate suppliers, alternate sites and reserve capacity proportionate to impact",
          "Use backups, inventory buffers, utility resilience and mutual-support arrangements where justified",
          "Exercise crisis leadership, communications and continuity decisions before disruption occurs"
        ]
      },
      detect: {
        threats: [
          "Escalating external or internal warning signals missed before service disruption becomes acute",
          "Readiness gaps hidden because plans are untested or assumptions are stale",
          "Threshold breaches not escalated because the organization lacks a common operating picture"
        ],
        controls: [
          "Monitor triggers, dependency health, geopolitical and environmental signals and service-status thresholds",
          "Use dashboards, readiness reviews and exercises to expose plan drift and capability gaps",
          "Verify contact data, team availability, recovery assumptions and decision-support information routinely"
        ]
      },
      respond: {
        threats: [
          "Acute crisis, multi-site outage or public issue requiring coordinated leadership under time pressure",
          "Fragmented communications, conflicting priorities or uncontrolled workarounds worsening the event",
          "Slow coordination with authorities, key customers, staff or suppliers increasing impact"
        ],
        controls: [
          "Activate crisis structures, decision logs and a shared operating picture with clear strategic priorities",
          "Prioritize life safety, continuity of critical services and disciplined stakeholder communications",
          "Coordinate with suppliers, customers, authorities and internal response teams in real time"
        ]
      },
      recover: {
        threats: [
          "Recovery stalling because exhausted teams, dependencies and financial pressure were not managed",
          "Reputational loss caused by opaque communications or inconsistent restart sequencing",
          "Failure to learn from the event leaving resilience static while risk evolves"
        ],
        controls: [
          "Use phased restoration, prioritized backlog handling and executive oversight of recovery dependencies",
          "Conduct after-action reviews, stakeholder follow-up and resilience investment decisions promptly",
          "Update continuity plans, contracts, inventories, exercises and governance based on real lessons"
        ]
      }
    }
  },
  {
    id: "industrial-safety",
    name: "Occupational Health and Safety",
    focus: "Safe work systems, worker health, wellbeing, contractor interfaces and preventive control of workplace harm.",
    sourceContext: "This source pack is scoped to occupational safety systems, worker health, psychosocial risk, preventive controls and safe work conditions.",
    cells: {
      identify: {
        threats: [
          "Hazardous tasks, machinery, energy sources or substances not fully assessed before work starts",
          "Psychosocial, ergonomic or fatigue risks treated as secondary instead of operational hazards",
          "Shared workplaces and contractor interfaces leaving responsibilities unclear"
        ],
        controls: [
          "Run job hazard analysis, exposure mapping and worker consultation for routine and non-routine work",
          "Identify ergonomic, psychosocial, chemical and physical risk factors with appropriate surveillance",
          "Define employer, contractor and shared-site responsibilities before work is authorized"
        ]
      },
      protect: {
        threats: [
          "Unsafe work methods, machine interaction or energy isolation failures causing serious injury",
          "Chronic harm from exposure, workload, repetitive strain or poor workplace design",
          "Violence, fatigue or time pressure degrading safe behavior and supervision"
        ],
        controls: [
          "Use safe-work systems, permits, machine guarding, lockout-tagout and verified PPE controls",
          "Control exposure, ergonomics and human-factor risks through engineering and organizational measures",
          "Support workload management, violence prevention and supervisor capability as part of safety performance"
        ]
      },
      detect: {
        threats: [
          "Unsafe acts, equipment deterioration or exposure trends not escalated before injury occurs",
          "Near misses and minor injuries underreported, masking systemic weaknesses",
          "Health surveillance, contractor oversight or site inspections failing to reach real risk areas"
        ],
        controls: [
          "Use inspections, supervisor observations, near-miss reporting and exposure monitoring",
          "Review absence, incident, training and health data for patterns that indicate emerging harm",
          "Audit contractor compliance, permit adherence and corrective-action closure"
        ]
      },
      respond: {
        threats: [
          "Injury, exposure, violent event or unsafe condition requiring immediate work stoppage",
          "Confusion over medical response, site isolation or regulatory notification duties",
          "Pressure to restart work before hazards have been controlled"
        ],
        controls: [
          "Provide first aid and medical escalation, isolate the area and halt unsafe work immediately",
          "Preserve scene integrity, notify required internal and external parties and begin structured investigation",
          "Use competent review before authorizing restart of affected work"
        ]
      },
      recover: {
        threats: [
          "Loss of work ability, recurrent injury or degraded workforce trust after a serious event",
          "Return-to-work handled poorly, prolonging harm and capability loss",
          "Corrective actions closing on paper but not in practice"
        ],
        controls: [
          "Use rehabilitation, return-to-work planning and workload adjustment to support sustained recovery",
          "Redesign work, tools, supervision and training based on verified root causes",
          "Track corrective actions and leading indicators until safer performance is demonstrated"
        ]
      }
    }
  }
];
