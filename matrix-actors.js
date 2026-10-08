const actorProfiles = {
  "personnel-security": {
    identify: [
      {
        id: "CSM-D01-I-A01",
        text: "Applicant or contractor deliberately concealing malicious intent to gain trusted access",
        reviewState: "reviewed"
      },
      {
        id: "CSM-D01-I-A02",
        text: "Organized crime group or hostile competitor gathering leverage through people and relationships",
        reviewState: "reviewed"
      },
      {
        id: "CSM-D01-I-A03",
        text: "Rushed or inconsistent approval process granting access without proportionate screening",
        reviewState: "reviewed"
      }
    ],
    protect: [
      {
        id: "CSM-D01-P-A01",
        text: "Insider deliberately misusing privileged access or a compromised contractor account",
        reviewState: "reviewed"
      },
      {
        id: "CSM-D01-P-A02",
        text: "Stalker, violent extremist or targeted harasser focusing on named individuals",
        reviewState: "reviewed"
      },
      {
        id: "CSM-D01-P-A03",
        text: "Coercive criminal or hostile intelligence collector pressuring staff for access or information",
        reviewState: "reviewed"
      }
    ],
    detect: [
      {
        id: "CSM-D01-D-A01",
        text: "Insider misusing access, knowledge or authority for personal or external benefit",
        reviewState: "reviewed"
      },
      {
        id: "CSM-D01-D-A02",
        text: "Harasser, retaliator or coercive contact attempting to isolate or silence staff",
        reviewState: "reviewed"
      },
      {
        id: "CSM-D01-D-A03",
        text: "Excessive workload, low job control or inadequate support creating psychosocial harm",
        reviewState: "reviewed"
      }
    ],
    respond: [
      {
        id: "CSM-D01-R-A01",
        text: "Violent individual or group targeting personnel or executive movement",
        reviewState: "reviewed"
      },
      {
        id: "CSM-D01-R-A02",
        text: "Suspected insider misuse requiring proportionate access restriction and evidence preservation",
        reviewState: "reviewed"
      },
      {
        id: "CSM-D01-R-A03",
        text: "Abductor, extortionist or crisis opportunist exploiting travel or welfare gaps",
        reviewState: "reviewed"
      }
    ],
    recover: [
      {
        id: "CSM-D01-RC-A01",
        text: "Unresolved insider or coercion risk testing weak post-incident follow-up",
        reviewState: "reviewed"
      },
      {
        id: "CSM-D01-RC-A02",
        text: "Critical-role concentration, attrition or capability loss slowing recovery",
        reviewState: "reviewed"
      },
      {
        id: "CSM-D01-RC-A03",
        text: "Retaliation, stigma or disinformation deepening mistrust after the event",
        reviewState: "reviewed"
      }
    ]
  },
  "premises-security": {
    identify: [
      {
        id: "CSM-D02-I-A01",
        text: "Criminal reconnaissance actor mapping access points, routines or blind spots",
        reviewState: "reviewed"
      },
      {
        id: "CSM-D02-I-A02",
        text: "Lawful public assembly or protest affecting access routes without hostile intent",
        reviewState: "reviewed"
      },
      {
        id: "CSM-D02-I-A03",
        text: "Unvetted contractor, vendor or delivery actor able to approach critical areas",
        reviewState: "reviewed"
      }
    ],
    protect: [
      {
        id: "CSM-D02-P-A01",
        text: "Intruder, thief or saboteur attempting unauthorized access or damage",
        reviewState: "reviewed"
      },
      {
        id: "CSM-D02-P-A02",
        text: "Civil disorder, targeted obstruction or violent action disrupting the site perimeter",
        reviewState: "reviewed"
      },
      {
        id: "CSM-D02-P-A03",
        text: "Malicious contractor or visitor abusing weak escort and credential routines",
        reviewState: "reviewed"
      }
    ],
    detect: [
      {
        id: "CSM-D02-D-A01",
        text: "Intruder or tailgater moving through normal operational traffic",
        reviewState: "reviewed"
      },
      {
        id: "CSM-D02-D-A02",
        text: "Credential-sharing insider or badge borrower bypassing identity assurance",
        reviewState: "reviewed"
      },
      {
        id: "CSM-D02-D-A03",
        text: "Hostile surveillant or pre-attack reconnaissance actor testing response times",
        reviewState: "reviewed"
      }
    ],
    respond: [
      {
        id: "CSM-D02-R-A01",
        text: "Armed intruder, violent actor or saboteur forcing rapid protective action",
        reviewState: "reviewed"
      },
      {
        id: "CSM-D02-R-A02",
        text: "Civil disorder or violent crowd behavior affecting access, evacuation or lockdown decisions",
        reviewState: "reviewed"
      },
      {
        id: "CSM-D02-R-A03",
        text: "Malicious insider with physical access to utilities, control rooms or secure records",
        reviewState: "reviewed"
      }
    ],
    recover: [
      {
        id: "CSM-D02-RC-A01",
        text: "Opportunistic thief exploiting outage, cleanup or repair windows",
        reviewState: "reviewed"
      },
      {
        id: "CSM-D02-RC-A02",
        text: "Persistent hostile actor returning after initial disruption to test unresolved weaknesses",
        reviewState: "reviewed"
      },
      {
        id: "CSM-D02-RC-A03",
        text: "Fraudulent contractor exploiting recovery work, badge resets or emergency procurement",
        reviewState: "reviewed"
      }
    ]
  },
  "rescue-safety": {
    identify: [
      {
        id: "CSM-D03-I-A01",
        text: "Work planning, supervision or coordination failure before emergency conditions emerge",
        reviewState: "reviewed"
      },
      {
        id: "CSM-D03-I-A02",
        text: "Arsonist, malicious saboteur or violent actor creating life-safety consequences deliberately",
        reviewState: "reviewed"
      },
      {
        id: "CSM-D03-I-A03",
        text: "Natural hazard, utility failure or technical malfunction escalating into an emergency",
        reviewState: "reviewed"
      }
    ],
    protect: [
      {
        id: "CSM-D03-P-A01",
        text: "Permit, supervision or work-control failure bypassing life-safety safeguards",
        reviewState: "reviewed"
      },
      {
        id: "CSM-D03-P-A02",
        text: "Arsonist, malicious intruder or violent attacker creating fire or evacuation triggers",
        reviewState: "reviewed"
      },
      {
        id: "CSM-D03-P-A03",
        text: "Equipment failure, maintenance gap or utility fault degrading life-safety performance",
        reviewState: "reviewed"
      }
    ],
    detect: [
      {
        id: "CSM-D03-D-A01",
        text: "Weak reporting or supervision allowing early warning signs to go unrecognized",
        reviewState: "reviewed"
      },
      {
        id: "CSM-D03-D-A02",
        text: "Maintenance or service process failing to surface degraded readiness",
        reviewState: "reviewed"
      },
      {
        id: "CSM-D03-D-A03",
        text: "Malicious actor attempting concealment, delayed reporting or false reassurance",
        reviewState: "reviewed"
      }
    ],
    respond: [
      {
        id: "CSM-D03-R-A01",
        text: "Fire, explosion, collapse or technical failure already threatening life safety",
        reviewState: "reviewed"
      },
      {
        id: "CSM-D03-R-A02",
        text: "Unsafe work condition or control failure driving fast-moving emergency impact",
        reviewState: "reviewed"
      },
      {
        id: "CSM-D03-R-A03",
        text: "Arsonist or violent attacker requiring immediate coordination with responders",
        reviewState: "reviewed"
      }
    ],
    recover: [
      {
        id: "CSM-D03-RC-A01",
        text: "Unsafe work practice, permit weakness or contractor-control failure recurring after the event",
        reviewState: "reviewed"
      },
      {
        id: "CSM-D03-RC-A02",
        text: "Unresolved technical defect or maintenance debt undermining restored readiness",
        reviewState: "reviewed"
      },
      {
        id: "CSM-D03-RC-A03",
        text: "Malicious actor exploiting reduced readiness during cleanup, restocking or re-entry",
        reviewState: "reviewed"
      }
    ]
  },
  "security-of-production-and-operations": {
    identify: [
      {
        id: "CSM-D04-I-A01",
        text: "Single-point supplier, logistics provider or service partner creating concentration risk",
        reviewState: "reviewed"
      },
      {
        id: "CSM-D04-I-A02",
        text: "Dishonest intermediary, reseller or transporter obscuring product integrity and chain of custody",
        reviewState: "reviewed"
      },
      {
        id: "CSM-D04-I-A03",
        text: "Internal fraud actor in procurement, warehouse, finance or scheduling functions",
        reviewState: "reviewed"
      }
    ],
    protect: [
      {
        id: "CSM-D04-P-A01",
        text: "Counterfeit, nonconforming or unsafe input entering the delivery chain",
        reviewState: "reviewed"
      },
      {
        id: "CSM-D04-P-A02",
        text: "Cargo thief, fraudster or payment attacker exploiting operational handoffs",
        reviewState: "reviewed"
      },
      {
        id: "CSM-D04-P-A03",
        text: "Internal operator bypassing quality, approval or segregation-of-duty rules",
        reviewState: "reviewed"
      }
    ],
    detect: [
      {
        id: "CSM-D04-D-A01",
        text: "Supplier with degrading capability, quality discipline or financial resilience",
        reviewState: "reviewed"
      },
      {
        id: "CSM-D04-D-A02",
        text: "Fraudster manipulating orders, invoices, inventory or payment instructions",
        reviewState: "reviewed"
      },
      {
        id: "CSM-D04-D-A03",
        text: "Operator concealing defects, losses, rework or service breakdown signals",
        reviewState: "reviewed"
      }
    ],
    respond: [
      {
        id: "CSM-D04-R-A01",
        text: "Supplier outage, transport interruption or customs delay blocking delivery",
        reviewState: "reviewed"
      },
      {
        id: "CSM-D04-R-A02",
        text: "Fraudster or organized theft group targeting goods, funds or shipping information",
        reviewState: "reviewed"
      },
      {
        id: "CSM-D04-R-A03",
        text: "Defective-product producer or compromised service partner forcing stop-ship or recall",
        reviewState: "reviewed"
      }
    ],
    recover: [
      {
        id: "CSM-D04-RC-A01",
        text: "Same concentrated supplier base or fragile logistics path reintroducing disruption",
        reviewState: "reviewed"
      },
      {
        id: "CSM-D04-RC-A02",
        text: "Customer, counterparty or insurer challenging weak records and traceability",
        reviewState: "reviewed"
      },
      {
        id: "CSM-D04-RC-A03",
        text: "Repeat fraud actor probing unchanged approvals and exception paths",
        reviewState: "reviewed"
      }
    ]
  },
  "environmental-safety": {
    identify: [
      {
        id: "CSM-D05-I-A01",
        text: "Weak planning or supervision allowing hazardous materials to be handled without full situational awareness",
        reviewState: "reviewed"
      },
      {
        id: "CSM-D05-I-A02",
        text: "Hazardous-material supplier or transporter introducing hidden storage, labeling or route risk",
        reviewState: "reviewed"
      },
      {
        id: "CSM-D05-I-A03",
        text: "Flood, storm, wildfire or extreme heat amplifying release, runoff and containment failure",
        reviewState: "reviewed"
      }
    ],
    protect: [
      {
        id: "CSM-D05-P-A01",
        text: "Work-control, supervision or maintenance failure leading to spills or emissions",
        reviewState: "reviewed"
      },
      {
        id: "CSM-D05-P-A02",
        text: "Non-compliant contractor, hauler or waste partner bypassing environmental safeguards",
        reviewState: "reviewed"
      },
      {
        id: "CSM-D05-P-A03",
        text: "Malicious polluter, saboteur or insider deliberately causing contamination",
        reviewState: "reviewed"
      }
    ],
    detect: [
      {
        id: "CSM-D05-D-A01",
        text: "Monitoring or reporting gaps hiding leak indicators, abnormal consumption or containment failure",
        reviewState: "reviewed"
      },
      {
        id: "CSM-D05-D-A02",
        text: "Contractor or supplier bypassing controls and delaying deviation reporting",
        reviewState: "reviewed"
      },
      {
        id: "CSM-D05-D-A03",
        text: "Community, lender or regulator identifying harm before internal monitoring does",
        reviewState: "reviewed"
      }
    ],
    respond: [
      {
        id: "CSM-D05-R-A01",
        text: "Operational or contractor-control failure triggering immediate containment needs",
        reviewState: "reviewed"
      },
      {
        id: "CSM-D05-R-A02",
        text: "Transporter, utility or external partner causing release, runoff or uncontrolled discharge",
        reviewState: "reviewed"
      },
      {
        id: "CSM-D05-R-A03",
        text: "Storm, flood, fire water or equipment failure driving spread beyond the site",
        reviewState: "reviewed"
      }
    ],
    recover: [
      {
        id: "CSM-D05-RC-A01",
        text: "Same contractor weakness, storage design flaw or process gap recurring in recovery",
        reviewState: "reviewed"
      },
      {
        id: "CSM-D05-RC-A02",
        text: "Long-tail impacts increasing legitimate scrutiny from communities, regulators or claimants",
        reviewState: "reviewed"
      },
      {
        id: "CSM-D05-RC-A03",
        text: "Malicious actor exploiting weakened controls during cleanup, waste handling or restart",
        reviewState: "reviewed"
      }
    ]
  },
  "information-and-cyber-security": {
    identify: [
      {
        id: "CSM-D06-I-A01",
        text: "Cybercriminal, ransomware affiliate or extortion-focused intrusion actor",
        reviewState: "reviewed"
      },
      {
        id: "CSM-D06-I-A02",
        text: "Insider with privileged knowledge, administrative access or data-handling authority",
        reviewState: "reviewed"
      },
      {
        id: "CSM-D06-I-A03",
        text: "Compromised supplier, managed service provider, cloud partner or software dependency carrying hidden risk",
        reviewState: "reviewed"
      }
    ],
    protect: [
      {
        id: "CSM-D06-P-A01",
        text: "Phishing operator, identity attacker or credential broker targeting the workforce",
        reviewState: "reviewed"
      },
      {
        id: "CSM-D06-P-A02",
        text: "Ransomware, extortion or intrusion actor seeking persistence and operational disruption",
        reviewState: "reviewed"
      },
      {
        id: "CSM-D06-P-A03",
        text: "Malicious insider or privileged-access error weakening core safeguards",
        reviewState: "reviewed"
      }
    ],
    detect: [
      {
        id: "CSM-D06-D-A01",
        text: "Intrusion actor moving laterally, escalating privilege or staging exfiltration",
        reviewState: "reviewed"
      },
      {
        id: "CSM-D06-D-A02",
        text: "Insider abusing access, violating retention rules or extracting sensitive data",
        reviewState: "reviewed"
      },
      {
        id: "CSM-D06-D-A03",
        text: "Compromised third party generating suspicious activity inside trusted connections",
        reviewState: "reviewed"
      }
    ],
    respond: [
      {
        id: "CSM-D06-R-A01",
        text: "Ransomware or extortion actor forcing restoration and communication decisions",
        reviewState: "reviewed"
      },
      {
        id: "CSM-D06-R-A02",
        text: "Data thief, disclosure actor or privacy-impacting attacker triggering legal obligations",
        reviewState: "reviewed"
      },
      {
        id: "CSM-D06-R-A03",
        text: "Advanced or state-backed intrusion operator persisting through partial containment",
        reviewState: "reviewed"
      }
    ],
    recover: [
      {
        id: "CSM-D06-RC-A01",
        text: "Same intrusion actor exploiting incomplete eradication or an untrusted rebuild",
        reviewState: "reviewed"
      },
      {
        id: "CSM-D06-RC-A02",
        text: "Opportunistic criminal targeting weakened recovery controls, credentials or vendors",
        reviewState: "reviewed"
      },
      {
        id: "CSM-D06-RC-A03",
        text: "Supplier, dependency or federated identity still carrying compromise into restored services",
        reviewState: "reviewed"
      }
    ]
  },
  "compliance-control": {
    identify: [
      {
        id: "CSM-D07-I-A01",
        text: "Corrupt employee, manager or approver positioned in a high-risk process",
        reviewState: "reviewed"
      },
      {
        id: "CSM-D07-I-A02",
        text: "Third-party intermediary, consultant, distributor or agent creating concealed influence paths",
        reviewState: "reviewed"
      },
      {
        id: "CSM-D07-I-A03",
        text: "Vendor, customer or public official offering or requesting an improper advantage",
        reviewState: "reviewed"
      }
    ],
    protect: [
      {
        id: "CSM-D07-P-A01",
        text: "Bribe demander, corrupt intermediary or extortionary counterparty",
        reviewState: "reviewed"
      },
      {
        id: "CSM-D07-P-A02",
        text: "Management override actor suppressing controls, approvals or adverse information",
        reviewState: "reviewed"
      },
      {
        id: "CSM-D07-P-A03",
        text: "Retaliator or collusive insider network exploiting weak oversight and fear",
        reviewState: "reviewed"
      }
    ],
    detect: [
      {
        id: "CSM-D07-D-A01",
        text: "Fraudster manipulating transactions, master data or documentation trails",
        reviewState: "reviewed"
      },
      {
        id: "CSM-D07-D-A02",
        text: "Collusive employee-supplier pair embedding favoritism, overbilling or kickbacks",
        reviewState: "reviewed"
      },
      {
        id: "CSM-D07-D-A03",
        text: "Retaliating manager suppressing reports, evidence or witness cooperation",
        reviewState: "reviewed"
      }
    ],
    respond: [
      {
        id: "CSM-D07-R-A01",
        text: "Person or network named in a credible allegation attempting to distort the fact pattern",
        reviewState: "reviewed"
      },
      {
        id: "CSM-D07-R-A02",
        text: "Regulatory or law-enforcement inquiry changing evidence, disclosure or cooperation duties",
        reviewState: "reviewed"
      },
      {
        id: "CSM-D07-R-A03",
        text: "Retaliator or evidence destroyer escalating pressure once misconduct is surfaced",
        reviewState: "reviewed"
      }
    ],
    recover: [
      {
        id: "CSM-D07-RC-A01",
        text: "Same corrupt network testing unchanged governance, incentives or third-party channels",
        reviewState: "reviewed"
      },
      {
        id: "CSM-D07-RC-A02",
        text: "Litigant, claimant or independent monitor identifying weak remediation follow-through",
        reviewState: "reviewed"
      },
      {
        id: "CSM-D07-RC-A03",
        text: "Bad-faith intermediary resurfacing through another affiliate, partner or geography",
        reviewState: "reviewed"
      }
    ]
  },
  "contingency-and-crisis-management": {
    identify: [
      {
        id: "CSM-D08-I-A01",
        text: "Natural hazard, climate-related event or public-health emergency",
        reviewState: "reviewed"
      },
      {
        id: "CSM-D08-I-A02",
        text: "Geopolitical change, civil disruption or state action altering the operating environment rapidly",
        reviewState: "reviewed"
      },
      {
        id: "CSM-D08-I-A03",
        text: "Critical supplier, utility, platform or infrastructure provider becoming a systemic dependency",
        reviewState: "reviewed"
      }
    ],
    protect: [
      {
        id: "CSM-D08-P-A01",
        text: "Extreme weather, seismic event or natural hazard stressing reserves and alternates",
        reviewState: "reviewed"
      },
      {
        id: "CSM-D08-P-A02",
        text: "Disinformation, rumor or intense public scrutiny amplifying confusion during disruption",
        reviewState: "reviewed"
      },
      {
        id: "CSM-D08-P-A03",
        text: "Single-point supplier, utility or service provider weakening continuity posture",
        reviewState: "reviewed"
      }
    ],
    detect: [
      {
        id: "CSM-D08-D-A01",
        text: "Deteriorating supplier, utility or logistics provider signaling pending interruption",
        reviewState: "reviewed"
      },
      {
        id: "CSM-D08-D-A02",
        text: "State action or geopolitical change altering conditions faster than plans assume",
        reviewState: "reviewed"
      },
      {
        id: "CSM-D08-D-A03",
        text: "Rumor, unreliable public information or a fast media cycle accelerating confusion",
        reviewState: "reviewed"
      }
    ],
    respond: [
      {
        id: "CSM-D08-R-A01",
        text: "Severe consequences from a natural hazard, infrastructure outage or multi-site disruption",
        reviewState: "reviewed"
      },
      {
        id: "CSM-D08-R-A02",
        text: "Cyber, geopolitical or disinformation actor compounding the operational crisis",
        reviewState: "reviewed"
      },
      {
        id: "CSM-D08-R-A03",
        text: "Key supplier, customer or public authority shaping timing, access and recovery decisions",
        reviewState: "reviewed"
      }
    ],
    recover: [
      {
        id: "CSM-D08-RC-A01",
        text: "Same unresolved dependency, climate hazard or design weakness reappearing",
        reviewState: "reviewed"
      },
      {
        id: "CSM-D08-RC-A02",
        text: "Opportunistic attacker exploiting reduced controls and emergency exceptions during recovery",
        reviewState: "reviewed"
      },
      {
        id: "CSM-D08-RC-A03",
        text: "Stakeholder, investor or media scrutiny intensifying visible recovery missteps",
        reviewState: "reviewed"
      }
    ]
  },
  "industrial-safety": {
    identify: [
      {
        id: "CSM-D09-I-A01",
        text: "Work authorized before hazards, energy sources or interfaces are fully controlled",
        reviewState: "reviewed"
      },
      {
        id: "CSM-D09-I-A02",
        text: "Leadership or production pressure normalizing risky work or poor ergonomics",
        reviewState: "reviewed"
      },
      {
        id: "CSM-D09-I-A03",
        text: "Equipment, tool or chemical supplier introducing hidden health and safety hazards",
        reviewState: "reviewed"
      }
    ],
    protect: [
      {
        id: "CSM-D09-P-A01",
        text: "Weak work design or supervision bypassing safe-work rules and verified energy isolation",
        reviewState: "reviewed"
      },
      {
        id: "CSM-D09-P-A02",
        text: "Violent individual, aggressive customer or credible threat of workplace violence",
        reviewState: "reviewed"
      },
      {
        id: "CSM-D09-P-A03",
        text: "Fatigue, excessive workload or inadequate competence increasing unsafe conditions",
        reviewState: "reviewed"
      }
    ],
    detect: [
      {
        id: "CSM-D09-D-A01",
        text: "Reporting or supervision gaps hiding early signs of exposure or imminent failure",
        reviewState: "reviewed"
      },
      {
        id: "CSM-D09-D-A02",
        text: "Contractor-control failure suppressing near misses, unsafe conditions or health effects",
        reviewState: "reviewed"
      },
      {
        id: "CSM-D09-D-A03",
        text: "Equipment failure or supplier quality issue surfacing as repeated weak signals",
        reviewState: "reviewed"
      }
    ],
    respond: [
      {
        id: "CSM-D09-R-A01",
        text: "Imminent serious danger or workplace violence requiring immediate protective action",
        reviewState: "reviewed"
      },
      {
        id: "CSM-D09-R-A02",
        text: "Equipment failure, hazardous release or acute exposure event already in motion",
        reviewState: "reviewed"
      },
      {
        id: "CSM-D09-R-A03",
        text: "Supervisor or production pressure actor pushing premature restart",
        reviewState: "reviewed"
      }
    ],
    recover: [
      {
        id: "CSM-D09-RC-A01",
        text: "Same unsafe work design, contractor-control gap or leadership pressure recurring",
        reviewState: "reviewed"
      },
      {
        id: "CSM-D09-RC-A02",
        text: "Long-term exposure source, ergonomic burden or latent hazard not fully removed",
        reviewState: "reviewed"
      },
      {
        id: "CSM-D09-RC-A03",
        text: "Organizational pressure undermining corrective action, retraining or return-to-work quality",
        reviewState: "reviewed"
      }
    ]
  }
};
