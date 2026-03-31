const domainProfiles = {
  "personnel-security": {
    mission: "Keep the workforce trustworthy, protected, capable and operational under routine pressure, travel exposure and crisis conditions.",
    protects: [
      "Trusted access, sensitive relationships and delegated authority",
      "Critical-role continuity, executive movement and high-risk travel assignments",
      "Psychological safety, conduct discipline and workforce resilience"
    ],
    owners: [
      "HR and People Operations",
      "Corporate Security and Travel Security",
      "Legal, line leadership and employee relations"
    ],
    failureModes: [
      "Access is granted faster than trust is verified",
      "Behavioral red flags stay trapped inside management silos",
      "Key-person loss, coercion or burnout becomes visible only after disruption starts"
    ],
    assuranceQuestions: [
      "Which people, roles or contractors can stop the business or expose crown-jewel information if they fail?",
      "Can we detect insider misuse, coercion, harassment or welfare decline early enough to intervene?",
      "Do travel, conduct, access and continuity decisions use the same risk picture?"
    ]
  },
  "premises-security": {
    mission: "Keep sites, access layers, critical utilities and physical assets secure, usable and recoverable under normal, criminal and hostile conditions.",
    protects: [
      "Perimeters, public interfaces and layered access boundaries",
      "Critical rooms, utilities, archives and operational control points",
      "Safe occupancy, trusted movement and alternate site availability"
    ],
    owners: [
      "Corporate Security and guard providers",
      "Facilities, real estate and site operations",
      "Business continuity, emergency leads and local management"
    ],
    failureModes: [
      "Public-facing space bleeds into trusted space without real control",
      "Visitor, vendor and contractor flows outrun badge and escort discipline",
      "A single site or utility becomes a hidden single point of failure"
    ],
    assuranceQuestions: [
      "Do we know which spaces, routes and utilities matter most to continuity and safety?",
      "Can we detect hostile reconnaissance, badge misuse or perimeter testing before entry succeeds?",
      "Can the business still operate if one facility, access layer or utility is denied?"
    ]
  },
  "rescue-safety": {
    mission: "Prepare the organization to protect life, coordinate first response and recover safely from fires, severe incidents and all-hazards emergencies.",
    protects: [
      "Life safety, safe egress and accountability for people on site",
      "Emergency command, responder coordination and first-aid capability",
      "Readiness of alarms, suppression, evacuation routes and emergency resources"
    ],
    owners: [
      "Safety and emergency preparedness leads",
      "Facilities, engineering and site operations",
      "Frontline supervisors, first responders and incident commanders"
    ],
    failureModes: [
      "Plans exist on paper but do not match occupancy, shift patterns or real layouts",
      "Alarming, suppression or accountability processes degrade without being tested",
      "Command confusion delays evacuation, triage or handover to public responders"
    ],
    assuranceQuestions: [
      "Would our emergency plan still work at night, during maintenance, or with visitors and contractors on site?",
      "Which severe incidents would exceed our internal first-response capability within minutes?",
      "Can leaders make shelter, evacuation and re-entry decisions from reliable information?"
    ]
  },
  "security-of-production-and-operations": {
    mission: "Protect the integrity, continuity and trustworthiness of products, services, logistics, payments and supplier-dependent operations.",
    protects: [
      "Critical products, service commitments and customer obligations",
      "Supply continuity, traceability and quality-critical control points",
      "Payment integrity, inventory assurance and operational decision discipline"
    ],
    owners: [
      "Operations, supply chain and procurement leaders",
      "Quality, logistics and customer delivery teams",
      "Finance controls, fraud prevention and contract owners"
    ],
    failureModes: [
      "Single-source dependency hides inside normal purchasing efficiency",
      "Quality drift and fraud signals are treated as separate problems instead of one control picture",
      "Recovery focuses on output volume while process integrity remains weak"
    ],
    assuranceQuestions: [
      "Which supplier, route, warehouse, payment path or service partner can interrupt delivery first?",
      "Can we prove traceability, product integrity and decision authority during recalls or disputes?",
      "Do quality, fraud and continuity controls reinforce each other or leave gaps between teams?"
    ]
  },
  "environmental-safety": {
    mission: "Prevent environmental harm, manage hazardous materials responsibly and sustain legal, operational and community trust under routine and incident conditions.",
    protects: [
      "Air, water, soil and community receptors around operations",
      "Hazardous-material inventories, storage, transport and waste pathways",
      "Environmental permits, resource efficiency and license to operate"
    ],
    owners: [
      "Environmental managers and EHS leaders",
      "Operations, maintenance and hazardous-material handlers",
      "Contractor managers, transport partners and site leadership"
    ],
    failureModes: [
      "Chemical, waste and drainage realities drift away from the documented inventory",
      "Contractors and transport partners bypass safeguards at the edge of the operating system",
      "Community, lender or regulator sees deterioration before internal monitoring does"
    ],
    assuranceQuestions: [
      "Which substances, processes or receptors would create our most serious environmental event?",
      "Can we detect leaks, exceedances or permit drift before a regulator or community does?",
      "Are remediation and restart decisions balancing compliance, ecology and business pressure properly?"
    ]
  },
  "information-and-cyber-security": {
    mission: "Protect information, digital trust and resilient operations against cyber intrusion, misuse, outage and data compromise.",
    protects: [
      "Crown-jewel data, identities, critical applications and connected infrastructure",
      "Customer trust, privacy obligations and operational technology dependencies",
      "Recovery integrity, monitoring visibility and trusted digital workflows"
    ],
    owners: [
      "Security operations, identity and infrastructure teams",
      "Application, cloud, data and privacy owners",
      "Business continuity, incident response and supplier-risk functions"
    ],
    failureModes: [
      "Critical assets and dependencies are not known precisely enough for defensive prioritization",
      "Identity sprawl and third-party trust paths grow faster than governance",
      "Restoration decisions outrun containment and rebuild trust"
    ],
    assuranceQuestions: [
      "Which identities, systems or data exposures would create existential business harm first?",
      "Can we see lateral movement, supplier compromise and backup failure before they become outage?",
      "Would we trust our own rebuilt environment after a major cyber incident?"
    ]
  },
  "compliance-control": {
    mission: "Preserve integrity, lawful conduct and defensible investigations across high-risk transactions, third parties and leadership decisions.",
    protects: [
      "Books and records integrity, reporting channels and evidence preservation",
      "Third-party relationships, public-interface decisions and anti-bribery controls",
      "Organizational trust, disciplinary fairness and remediation credibility"
    ],
    owners: [
      "Compliance, legal and investigation functions",
      "Finance controls, procurement and commercial leadership",
      "HR, internal audit and board-level oversight"
    ],
    failureModes: [
      "Culture signals tolerate workaround behavior while policies say the opposite",
      "Case ownership fragments across legal, HR, finance and security",
      "Remediation closes formally without changing incentives or decision pathways"
    ],
    assuranceQuestions: [
      "Where can improper payments, conflicts or books-and-records manipulation hide in normal business flow?",
      "Can serious allegations move from intake to evidence protection fast enough to remain credible?",
      "Do leaders see integrity failures as operational risk, not just legal exposure?"
    ]
  },
  "contingency-and-crisis-management": {
    mission: "Sustain critical services, coordinate leadership decisions and restore operations under multi-hazard, cross-functional crisis conditions.",
    protects: [
      "Critical services, recovery priorities and executive decision capacity",
      "Dependency resilience across sites, suppliers, utilities and digital services",
      "Stakeholder trust, crisis communications and disciplined restoration"
    ],
    owners: [
      "Continuity and crisis management teams",
      "Executive leadership, business owners and communications leads",
      "Technology, facilities, supply chain and external coordination functions"
    ],
    failureModes: [
      "Critical service assumptions are too vague to guide real trade-off decisions",
      "Single points of failure stay hidden across teams because no one owns the whole dependency chain",
      "A crisis room forms only after the event has already fragmented decision-making"
    ],
    assuranceQuestions: [
      "Which dependencies fail first when stress hits several domains at once?",
      "Can leaders choose what to save, stop and defer within the first hour of a major crisis?",
      "Are exercises testing real decisions, cross-team friction and external coordination, not just document existence?"
    ]
  },
  "industrial-safety": {
    mission: "Prevent acute injury, chronic harm and unsafe work through disciplined controls, competent supervision and worker-centered operating conditions.",
    protects: [
      "Workers performing hazardous, repetitive or high-consequence tasks",
      "Safe systems of work, exposure control and verified work authorization",
      "Long-term work ability, contractor interfaces and trust in supervision"
    ],
    owners: [
      "Safety leaders, supervisors and line management",
      "Engineering, maintenance and work-permit authorities",
      "Occupational health, HR and contractor oversight teams"
    ],
    failureModes: [
      "Production pressure silently overrides safe-work discipline",
      "Near misses and chronic exposures are normalized instead of escalated",
      "Corrective actions close on paper while the job remains unchanged"
    ],
    assuranceQuestions: [
      "Which tasks, exposures or worker groups carry the highest irreversible harm potential?",
      "Can we prove that work stops when isolation, guarding, supervision or conditions are wrong?",
      "Do workers trust the system enough to report unsafe conditions before injury happens?"
    ]
  }
};

const phaseFramingByDomain = {
  "personnel-security": {
    identify: "Know who holds trust, authority, travel exposure and single-point role knowledge before people risk becomes business risk.",
    protect: "Reduce insider, coercion and wellbeing risk through access discipline, conduct systems and targeted protective measures.",
    detect: "Spot behavioral drift, misuse, retaliation and welfare decline early enough to intervene without delay.",
    respond: "Protect the person, preserve evidence, transfer authority and coordinate HR, legal and security decisions immediately.",
    recover: "Rebuild trust, capability and psychosocial resilience while closing the conditions that enabled the personnel event."
  },
  "premises-security": {
    identify: "Understand site criticality, protective zones, public interfaces and utility dependencies before a physical incident chooses them for you.",
    protect: "Harden the site through layered barriers, trusted access routes and tighter control of visitors, vendors and deliveries.",
    detect: "See reconnaissance, badge misuse, tailgating and equipment failure before a physical breach turns into a continuity event.",
    respond: "Contain the incident at site level while keeping people safe, protecting critical spaces and guiding external responders.",
    recover: "Restore site trust, access integrity and utility confidence before normal occupancy and operations are resumed fully."
  },
  "rescue-safety": {
    identify: "Model fires, severe injuries and occupancy realities as they actually occur, not as plans assume they occur.",
    protect: "Keep life-safety systems, permits, training and escape routes ready for the moment routine work turns abnormal.",
    detect: "Use inspections, drills and weak-signal reporting to catch readiness drift before an emergency outruns the site.",
    respond: "Create command clarity, protect life first and coordinate internal actions with public emergency services under pressure.",
    recover: "Return to safe occupancy only after equipment, people and decision processes are truly ready again."
  },
  "security-of-production-and-operations": {
    identify: "Map where supplier, payment, traceability and quality breakdowns can interrupt customer commitments first.",
    protect: "Strengthen approvals, quality gates, chain-of-custody discipline and supplier integrity before defects or fraud escape.",
    detect: "Watch for deviations in quality, inventory, delivery and payments as early warnings of bigger operational loss.",
    respond: "Contain customer harm, supplier disruption and fraud exposure with clear authority for stop-ship, recall and rerouting decisions.",
    recover: "Rebuild dependable delivery through stronger design, sourcing and control architecture rather than simple throughput recovery."
  },
  "environmental-safety": {
    identify: "Know which substances, receptors, permits and resource loads define your real environmental risk perimeter.",
    protect: "Control storage, handling, transport and maintenance so routine operations do not drift into environmental damage.",
    detect: "Use monitoring, inspection and complaint intelligence to surface release, exceedance and permit drift before escalation.",
    respond: "Contain the source quickly, protect people and environment together, and coordinate notifications and impact assessment in real time.",
    recover: "Restore legal, ecological and community trust through transparent remediation and higher-integrity operating design."
  },
  "information-and-cyber-security": {
    identify: "Prioritize the data, identities, services and third-party trust paths that would matter most in a major cyber event.",
    protect: "Reduce exploitable attack paths with disciplined identity, configuration, endpoint, data-handling and supplier controls.",
    detect: "Turn logging, endpoint, network and identity signals into usable warning of compromise before business disruption peaks.",
    respond: "Contain scope fast, protect evidence and make restoration decisions from a trusted view of attacker presence and impact.",
    recover: "Rebuild from trusted states, close architectural weaknesses and restore stakeholder confidence in digital operations."
  },
  "compliance-control": {
    identify: "Pinpoint where bribery, fraud, retaliation and records manipulation can hide inside ordinary business decisions.",
    protect: "Build friction into high-risk decisions so improper payments, override behavior and third-party abuse are harder to execute.",
    detect: "Use reporting channels, analytics and preservation triggers to surface misconduct before facts disappear or normalize.",
    respond: "Protect the case, protect reporters and coordinate legal, HR, finance and security so response stays credible.",
    recover: "Turn findings into governance, incentive and oversight changes that prevent the same integrity failure from returning."
  },
  "contingency-and-crisis-management": {
    identify: "Define what must survive, which dependencies threaten that outcome and who decides when conditions deteriorate fast.",
    protect: "Build alternate capacity, leadership readiness and exercised continuity arrangements before a crisis tests them.",
    detect: "Recognize trigger breaches, external escalation and readiness drift early enough to activate before fragmentation starts.",
    respond: "Establish strategic priorities, one operating picture and disciplined stakeholder coordination across the whole crisis.",
    recover: "Restore services in business-priority order while capturing lessons that change resilience investments and governance."
  },
  "industrial-safety": {
    identify: "Understand the real work, not just the written procedure, so hazardous tasks and chronic exposure are visible before harm.",
    protect: "Use engineered safeguards, permits, supervision and human-factor controls to keep unsafe work from becoming normal.",
    detect: "Treat near misses, exposure trends and weak supervision as early indicators of future injury, not minor noise.",
    respond: "Stop unsafe work, care for the injured and preserve the facts needed to prevent repeat harm.",
    recover: "Return people and work safely through verified corrective action, rehabilitation and stronger day-to-day supervision."
  }
};

domains.forEach((domain) => {
  domain.actors = actorProfiles[domain.id] ?? {};
  domain.profile = domainProfiles[domain.id] ?? null;
  domain.phaseFraming = phaseFramingByDomain[domain.id] ?? {};
});
