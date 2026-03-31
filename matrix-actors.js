const actorProfiles = {
  "personnel-security": {
    identify: [
      "Malicious insider applicant or infiltrating contractor seeking trusted access",
      "Organized crime group or hostile competitor gathering leverage through people and relationships",
      "Negligent manager or rushed hiring chain approving access without sufficient vetting"
    ],
    protect: [
      "Disgruntled insider, privileged employee or compromised contractor",
      "Stalker, violent extremist or targeted harasser focusing on named individuals",
      "Coercive criminal or hostile intelligence collector pressuring staff for access or information"
    ],
    detect: [
      "Insider misusing access, knowledge or authority for personal or external benefit",
      "Harasser, retaliator or coercive contact attempting to isolate or silence staff",
      "Manager or contractor bypassing conduct, welfare or escalation controls"
    ],
    respond: [
      "Violent individual or group targeting personnel or executive movement",
      "Malicious insider requiring immediate access suspension and evidence preservation",
      "Kidnapper, extortionist or crisis opportunist exploiting travel or welfare gaps"
    ],
    recover: [
      "Same insider or coercive actor testing weak post-incident follow-up",
      "Opportunistic competitor exploiting capability loss, attrition or key-person gaps",
      "Reputational attacker or disinformation amplifier seeking to deepen mistrust after the event"
    ]
  },
  "premises-security": {
    identify: [
      "Criminal reconnaissance actor mapping access points, routines or blind spots",
      "Hostile activist or protest group studying public-facing interfaces and choke points",
      "Unvetted contractor, vendor or delivery actor able to approach critical areas"
    ],
    protect: [
      "Intruder, thief or saboteur attempting unauthorized access or damage",
      "Hostile protester, violent actor or agitator seeking disruption at the site perimeter",
      "Malicious contractor or visitor abusing weak escort and credential routines"
    ],
    detect: [
      "Intruder or tailgater moving through normal operational traffic",
      "Credential-sharing insider or badge borrower bypassing identity assurance",
      "Hostile surveillant or pre-attack reconnaissance actor testing response times"
    ],
    respond: [
      "Armed intruder, violent actor or saboteur forcing rapid protective action",
      "Civil-disorder actor or hostile crowd affecting access, evacuation or lockdown decisions",
      "Malicious insider with physical access to utilities, control rooms or secure records"
    ],
    recover: [
      "Opportunistic thief exploiting outage, cleanup or repair windows",
      "Persistent hostile actor returning after initial disruption to test unresolved weaknesses",
      "Fraudulent contractor exploiting recovery work, badge resets or emergency procurement"
    ]
  },
  "rescue-safety": {
    identify: [
      "Human error, unsafe contractor or weak supervision before emergency conditions emerge",
      "Arsonist, malicious saboteur or violent actor creating life-safety consequences deliberately",
      "Natural hazard, utility failure or technical malfunction escalating into an emergency"
    ],
    protect: [
      "Unsafe worker or contractor bypassing permits, alarms or safe conditions",
      "Arsonist, malicious intruder or violent attacker creating fire or evacuation triggers",
      "Equipment failure, maintenance gap or utility fault degrading life-safety performance"
    ],
    detect: [
      "Frontline worker or supervisor missing weak signals before escalation",
      "Equipment maintainer or service provider failing to surface degraded readiness",
      "Malicious actor attempting concealment, delayed reporting or false reassurance"
    ],
    respond: [
      "Fire, explosion, collapse or technical failure already threatening life safety",
      "Unsafe worker or contractor decision driving fast-moving emergency impact",
      "Arsonist or violent attacker requiring immediate coordination with responders"
    ],
    recover: [
      "Same unsafe practice, permit weakness or contractor failure recurring after the event",
      "Unresolved technical defect or maintenance debt undermining restored readiness",
      "Malicious actor exploiting reduced readiness during cleanup, restocking or re-entry"
    ]
  },
  "security-of-production-and-operations": {
    identify: [
      "Single-point supplier, logistics provider or service partner creating concentration risk",
      "Dishonest intermediary, reseller or transporter obscuring product integrity and chain of custody",
      "Internal fraud actor in procurement, warehouse, finance or scheduling functions"
    ],
    protect: [
      "Counterfeit, low-integrity or non-compliant supplier entering the delivery chain",
      "Cargo thief, fraudster or payment attacker exploiting operational handoffs",
      "Internal operator bypassing quality, approval or segregation-of-duty rules"
    ],
    detect: [
      "Supplier with degrading capability, quality discipline or financial resilience",
      "Fraudster manipulating orders, invoices, inventory or payment instructions",
      "Operator concealing defects, losses, rework or service breakdown signals"
    ],
    respond: [
      "Supplier outage, transport failure or customs disruption actor blocking delivery",
      "Fraudster or organized theft group targeting goods, funds or shipping information",
      "Defective-product producer or compromised service partner forcing stop-ship or recall"
    ],
    recover: [
      "Same concentrated supplier base or fragile logistics path reintroducing disruption",
      "Claimant, adversarial counterparty or insurer challenging weak records and traceability",
      "Repeat fraud actor probing unchanged approvals and exception paths"
    ]
  },
  "environmental-safety": {
    identify: [
      "Negligent operator or contractor handling hazardous materials without full situational awareness",
      "Hazardous-material supplier or transporter introducing hidden storage, labeling or route risk",
      "Natural hazard such as flood, storm or heat stress amplifying release and exposure pathways"
    ],
    protect: [
      "Operator error, weak supervision or maintenance lapse leading to spills or emissions",
      "Non-compliant contractor, hauler or waste partner bypassing environmental safeguards",
      "Malicious polluter, saboteur or disgruntled insider causing deliberate contamination"
    ],
    detect: [
      "Frontline staff missing leak indicators, abnormal consumption or containment failure",
      "Contractor or supplier bypassing controls and delaying deviation reporting",
      "Community, lender or regulator spotting harm before the organization does"
    ],
    respond: [
      "Spill-causing operator or contractor triggering immediate containment needs",
      "Transporter, utility or external partner causing release, runoff or uncontrolled discharge",
      "Storm, flood, fire water or equipment failure driving spread beyond the site"
    ],
    recover: [
      "Same contractor weakness, storage design flaw or process gap recurring in recovery",
      "Claimant, regulator or community stakeholder escalating long-tail impact and scrutiny",
      "Malicious actor exploiting weakened controls during cleanup, waste handling or restart"
    ]
  },
  "information-and-cyber-security": {
    identify: [
      "Cybercriminal, ransomware affiliate or extortion-focused intrusion actor",
      "Insider with privileged knowledge, administrative access or data-handling authority",
      "Compromised supplier, MSP, cloud partner or software dependency carrying hidden risk"
    ],
    protect: [
      "Phishing operator, identity attacker or credential broker targeting the workforce",
      "Ransomware, extortion or intrusion actor seeking persistence and operational disruption",
      "Malicious insider or negligent privileged user weakening core safeguards"
    ],
    detect: [
      "Intrusion actor moving laterally, escalating privilege or staging exfiltration",
      "Insider abusing access, violating retention rules or extracting sensitive data",
      "Compromised third party generating suspicious activity inside trusted connections"
    ],
    respond: [
      "Ransomware or extortion actor forcing restoration and communication decisions",
      "Data thief, disclosure actor or privacy-impacting attacker triggering legal obligations",
      "Advanced or state-backed intrusion operator persisting through partial containment"
    ],
    recover: [
      "Same intrusion actor exploiting incomplete eradication or weak rebuild trust",
      "Opportunistic criminal targeting weakened recovery controls, credentials or vendors",
      "Supplier, dependency or federated identity still carrying compromise into restored services"
    ]
  },
  "compliance-control": {
    identify: [
      "Corrupt employee, manager or approver positioned in a high-risk process",
      "Third-party intermediary, consultant, distributor or agent creating concealed influence paths",
      "Fraudulent vendor, customer or public official seeking improper advantage"
    ],
    protect: [
      "Bribe demander, corrupt intermediary or extortionary counterparty",
      "Management override actor suppressing controls, approvals or adverse information",
      "Retaliator or collusive insider network exploiting weak oversight and fear"
    ],
    detect: [
      "Fraudster manipulating transactions, master data or documentation trails",
      "Collusive employee-supplier pair embedding favoritism, overbilling or kickbacks",
      "Retaliating manager suppressing reports, evidence or witness cooperation"
    ],
    respond: [
      "Subject of investigation or collusive network trying to shape the fact pattern",
      "Regulator, law-enforcement or sanctions counterpart requiring disciplined engagement",
      "Retaliator or evidence destroyer escalating pressure once misconduct is surfaced"
    ],
    recover: [
      "Same corrupt network testing unchanged governance, incentives or third-party channels",
      "Litigant, claimant or monitor exposing weak remediation follow-through",
      "Bad-faith intermediary resurfacing through another affiliate, partner or geography"
    ]
  },
  "contingency-and-crisis-management": {
    identify: [
      "Natural hazard, climate-driven event or public-health emergency",
      "State, geopolitical or civil-disruption actor altering the operating environment rapidly",
      "Critical supplier, utility, platform or infrastructure provider becoming a systemic dependency"
    ],
    protect: [
      "Extreme weather, seismic event or natural hazard stressing reserves and alternates",
      "Disinformation, public-pressure or reputational actor amplifying confusion during disruption",
      "Single-point supplier, utility or service provider weakening continuity posture"
    ],
    detect: [
      "Deteriorating supplier, utility or logistics provider signaling pending interruption",
      "State or geopolitical actor altering conditions faster than plans assume",
      "Public-information actor, rumor network or media cycle accelerating confusion"
    ],
    respond: [
      "Natural disaster, infrastructure outage or severe multi-site disruption",
      "Cyber, geopolitical or disinformation actor compounding the operational crisis",
      "Key supplier, customer or authority shaping timing, access and recovery decisions"
    ],
    recover: [
      "Same unresolved dependency, climate hazard or design weakness reappearing",
      "Opportunistic attacker exploiting reduced controls and emergency exceptions during recovery",
      "Stakeholder, investor or media pressure actor amplifying visible recovery missteps"
    ]
  },
  "industrial-safety": {
    identify: [
      "Unsafe operator or contractor working before hazards are fully controlled",
      "Supervisor normalizing risky work, production pressure or poor ergonomics",
      "Equipment, tool or chemical supplier introducing hidden health and safety hazards"
    ],
    protect: [
      "Worker or contractor bypassing safe-work rules, isolation or PPE requirements",
      "Violent individual, aggressive customer or unstable person affecting worker safety",
      "Fatigued, overloaded or inadequately trained operator making unsafe decisions"
    ],
    detect: [
      "Frontline worker or supervisor missing early warning signs of exposure or imminent failure",
      "Contractor hiding near misses, unsafe conditions or health effects",
      "Equipment failure or supplier quality issue surfacing as repeated weak signals"
    ],
    respond: [
      "Unsafe operator, contractor or violent individual requiring immediate work stoppage",
      "Equipment failure, hazardous release or acute exposure event already in motion",
      "Supervisor or production pressure actor pushing premature restart"
    ],
    recover: [
      "Same unsafe work practice, contractor behavior or leadership pressure recurring",
      "Long-term exposure source, ergonomic burden or latent hazard not fully removed",
      "Organizational pressure undermining corrective action, retraining or return-to-work quality"
    ]
  }
};
