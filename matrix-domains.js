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
    sourceContext: "This source pack covers trusted access, work travel, violence and harassment, psychosocial health and continuity of critical roles. Screening, monitoring, privacy and employment duties vary by role and jurisdiction.",
    cells: {
      identify: {
        threats: [
          {
            id: "CSM-D01-I-R01",
            text: "Critical roles concentrated in too few people or geographies",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D01-I-R02",
            text: "Travel, lone work or high-risk assignment exposure not risk-tiered",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D01-I-R03",
            text: "Sensitive access granted without role-based, risk-proportionate and locally lawful screening",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D01-I-R04",
            text: "Regional vetting, equality and privacy requirements applied inconsistently during onboarding or role changes",
            reviewState: "reviewed"
          }
        ],
        controls: [
          {
            id: "CSM-D01-I-M01",
            text: "Map critical roles, delegated authorities and succession coverage",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D01-I-M02",
            text: "Maintain personnel and travel risk registers for high-risk roles and locations",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D01-I-M03",
            text: "Apply role-based screening to employees and third parties within legal, equality and privacy limits",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D01-I-M04",
            text: "Define jurisdiction-specific vetting, re-screening and role-change reviews for positions with elevated access",
            reviewState: "reviewed"
          }
        ]
      },
      protect: {
        threats: [
          {
            id: "CSM-D01-P-R01",
            text: "Workplace violence, harassment, coercion or intimidation against staff",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D01-P-R02",
            text: "Misuse of privileged knowledge, access or relationships by insiders",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D01-P-R03",
            text: "Psychosocial risks such as excessive workload, low job control, violence or inadequate support harming health and work capacity",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D01-P-R04",
            text: "Social engineering, doxxing or family-targeting pressure against executives, assistants or exposed staff",
            reviewState: "reviewed"
          }
        ],
        controls: [
          {
            id: "CSM-D01-P-M01",
            text: "Use role-based access, segregation of duties and confidentiality commitments",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D01-P-M02",
            text: "Establish violence prevention, travel protection and executive protection routines where justified",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D01-P-M03",
            text: "Train managers to identify psychosocial risks, improve working conditions, respond supportively and route people to appropriate help",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D01-P-M04",
            text: "Extend protective awareness and contingency routines to assistants, travel planners and other exposed support roles",
            reviewState: "reviewed"
          }
        ]
      },
      detect: {
        threats: [
          {
            id: "CSM-D01-D-R01",
            text: "Retaliation, coercion, harassment or policy drift going unreported",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D01-D-R02",
            text: "Access misuse, unusual privilege activity or confidentiality breaches",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D01-D-R03",
            text: "Loss of contact, welfare concerns or deteriorating team climate during travel or crisis periods",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D01-D-R04",
            text: "Relevant human resources, technology and security signals remaining fragmented across functions",
            reviewState: "reviewed"
          }
        ],
        controls: [
          {
            id: "CSM-D01-D-M01",
            text: "Maintain distinct welfare, grievance and security reporting routes with protected escalation paths",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D01-D-M02",
            text: "Review privileged access, exceptions and misuse indicators jointly across human resources, security and legal",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D01-D-M03",
            text: "Use check-in routines, travel monitoring and periodic role-risk reviews",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D01-D-M04",
            text: "Review relevant signals with privacy safeguards without inferring malicious intent from a health or welfare condition",
            reviewState: "reviewed"
          }
        ]
      },
      respond: {
        threats: [
          {
            id: "CSM-D01-R-R01",
            text: "Credible threat, assault, kidnapping, disappearance or welfare emergency affecting personnel",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D01-R-R02",
            text: "Suspected or confirmed access misuse requiring proportionate containment and evidence protection",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D01-R-R03",
            text: "Loss of a key decision-maker during an ongoing disruption",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D01-R-R04",
            text: "Media attention, rumor or online harassment amplifying the personnel incident during first response",
            reviewState: "reviewed"
          }
        ],
        controls: [
          {
            id: "CSM-D01-R-M01",
            text: "Activate welfare checks, emergency contacts, travel support and crisis escalation immediately",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D01-R-M02",
            text: "Restrict affected access lawfully, preserve evidence and coordinate human resources, legal, security and line leadership",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D01-R-M03",
            text: "Transfer authority using pre-approved backups and continuity delegations",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D01-R-M04",
            text: "Use controlled communications and documented duty-of-care decisions for affected staff and their support networks",
            reviewState: "reviewed"
          }
        ]
      },
      recover: {
        threats: [
          {
            id: "CSM-D01-RC-R01",
            text: "Trauma, burnout, attrition or mistrust persisting after the event",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D01-RC-R02",
            text: "Long-term capability loss in critical teams or specialist functions",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D01-RC-R03",
            text: "Repeat personnel incidents caused by unchanged practices or culture",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D01-RC-R04",
            text: "Retaliation, stigma or emergency workaround access lingering after the formal case closes",
            reviewState: "reviewed"
          }
        ],
        controls: [
          {
            id: "CSM-D01-RC-M01",
            text: "Offer voluntary trauma-informed support and keep operational after-action review separate from personal welfare care",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D01-RC-M02",
            text: "Rebuild role redundancy, staffing resilience and leadership bench strength",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D01-RC-M03",
            text: "Refresh travel, conduct, access and workforce-risk controls from lessons learned",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D01-RC-M04",
            text: "Review retaliation indicators and return temporary delegations, access changes and staffing workarounds to governed arrangements",
            reviewState: "reviewed"
          }
        ]
      }
    }
  },
  {
    id: "premises-security",
    name: "Physical and Site Security",
    focus: "Facilities, perimeters, critical utilities, protective design, zoning and physical asset protection.",
    sourceContext: "This source pack covers protective design, access layers, critical utilities and site resilience. Lawful protest must remain distinct from violence or civil disorder, and surveillance and drone responses must follow applicable law.",
    cells: {
      identify: {
        threats: [
          {
            id: "CSM-D02-I-R01",
            text: "Exposed perimeters, delivery routes, parking areas or public interfaces around critical sites",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D02-I-R02",
            text: "Critical utilities, control rooms or archives located in weakly protected zones",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D02-I-R03",
            text: "Single-site dependence with no alternate facility or fallback workspace",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D02-I-R04",
            text: "Shared campuses, landlords or colocated tenants creating ambiguous control boundaries around critical areas",
            reviewState: "reviewed"
          }
        ],
        controls: [
          {
            id: "CSM-D02-I-M01",
            text: "Perform site threat and vulnerability assessments using zoning and critical-asset mapping",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D02-I-M02",
            text: "Review utilities, access routes, neighbors, lawful assembly impacts, civil disorder scenarios and environmental design factors",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D02-I-M03",
            text: "Link site criticality to business-impact and alternate-site planning",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D02-I-M04",
            text: "Document landlord, tenant, guard and facilities responsibilities for shared perimeters, utilities and incident triggers",
            reviewState: "reviewed"
          }
        ]
      },
      protect: {
        threats: [
          {
            id: "CSM-D02-P-R01",
            text: "Unauthorized access, theft, sabotage, vandalism or access disruption from public assembly",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D02-P-R02",
            text: "Compromised badges, keys, visitor routines or uncontrolled contractor access",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D02-P-R03",
            text: "Damage escalation because barriers, storage, lighting or utility safeguards are inadequate",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D02-P-R04",
            text: "Drone overflight, photography or remote reconnaissance affecting critical buildings and yards",
            reviewState: "reviewed"
          }
        ],
        controls: [
          {
            id: "CSM-D02-P-M01",
            text: "Layer perimeter protection, access control, locks, barriers, lighting and secure storage",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D02-P-M02",
            text: "Control visitor, vendor and delivery flows through authorization, escorting and permit rules",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D02-P-M03",
            text: "Protect critical rooms, utilities and records with segmented access and physical hardening",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D02-P-M04",
            text: "Use lawful monitoring, reporting and escalation criteria for drone activity and other reconnaissance",
            reviewState: "reviewed"
          }
        ]
      },
      detect: {
        threats: [
          {
            id: "CSM-D02-D-R01",
            text: "Intrusion, tampering or unauthorized movement hidden by surveillance blind spots",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D02-D-R02",
            text: "Access rights misuse, tailgating or credential sharing remaining undetected",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D02-D-R03",
            text: "Alarm, video surveillance or guard-response failure discovered only after impact",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D02-D-R04",
            text: "Maintenance bypasses or disabled security devices remaining unnoticed during projects or repairs",
            reviewState: "reviewed"
          }
        ],
        controls: [
          {
            id: "CSM-D02-D-M01",
            text: "Use alarms, privacy-governed video surveillance, access logs and guard tours with retention and access controls",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D02-D-M02",
            text: "Review visitor, delivery and vehicle anomalies against normal operating patterns",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D02-D-M03",
            text: "Test detection coverage around critical spaces, utilities and out-of-hours operations",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D02-D-M04",
            text: "Require device health monitoring, maintenance sign-off and documented compensating controls during maintenance and projects",
            reviewState: "reviewed"
          }
        ]
      },
      respond: {
        threats: [
          {
            id: "CSM-D02-R-R01",
            text: "Intrusion, suspicious item, targeted attack or civil disorder affecting the site",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D02-R-R02",
            text: "Physical compromise of utilities, communications or building-management systems",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D02-R-R03",
            text: "Need for immediate lockdown, evacuation or shelter decisions under uncertainty",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D02-R-R04",
            text: "Conflicting instructions between site security, facilities and business leaders slowing protective action",
            reviewState: "reviewed"
          }
        ],
        controls: [
          {
            id: "CSM-D02-R-M01",
            text: "Execute lockdown, shelter or evacuation playbooks using site command roles and clear triggers",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D02-R-M02",
            text: "Protect people first, isolate affected areas and preserve scene integrity for investigation",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D02-R-M03",
            text: "Coordinate site leadership, security providers, emergency services and public authorities",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D02-R-M04",
            text: "Pre-assign incident command, technical advisors and decision thresholds for lockdown, shutdown and reopening",
            reviewState: "reviewed"
          }
        ]
      },
      recover: {
        threats: [
          {
            id: "CSM-D02-RC-R01",
            text: "Prolonged facility outage, loss of credentials or damaged utilities after the incident",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D02-RC-R02",
            text: "Business disruption due to restricted access, repair activity or investigation holds",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D02-RC-R03",
            text: "Repeat physical incidents because design weaknesses were left unchanged",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D02-RC-R04",
            text: "Emergency access badges, contractor exemptions or temporary barriers becoming unmanaged long after the event",
            reviewState: "reviewed"
          }
        ],
        controls: [
          {
            id: "CSM-D02-RC-M01",
            text: "Verify credentials, physical controls and critical utilities before full occupancy and operations resume",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D02-RC-M02",
            text: "Use alternate workspace and prioritized site-restoration sequencing",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D02-RC-M03",
            text: "Capture lessons into site design, access architecture, vendor controls and capital planning",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D02-RC-M04",
            text: "Audit all temporary credentials, overrides and physical workarounds before declaring full site recovery",
            reviewState: "reviewed"
          }
        ]
      }
    }
  },
  {
    id: "rescue-safety",
    name: "Emergency Preparedness and Life Safety",
    focus: "Site-specific emergency planning, fire safety, evacuation, first response and casualty management.",
    sourceContext: "This source pack covers reasonably foreseeable site emergencies, evacuation, incident management and first response. Local fire and building codes govern design, and mass-casualty clinical guidance in this pack applies only to healthcare or on-site clinical contexts.",
    cells: {
      identify: {
        threats: [
          {
            id: "CSM-D03-I-R01",
            text: "Fire load, ignition sources, hazardous work or occupancy risks not fully understood",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D03-I-R02",
            text: "Weak evacuation support for disabled people, visitors and others who may need assistance",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D03-I-R03",
            text: "Mass-casualty or severe incident scenarios exceeding normal first-response assumptions",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D03-I-R04",
            text: "Night shifts, lone workers, visitors and people unfamiliar with the site missing from emergency assumptions",
            reviewState: "reviewed"
          }
        ],
        controls: [
          {
            id: "CSM-D03-I-M01",
            text: "Maintain site emergency plans, hazard maps and command roles for reasonably foreseeable scenarios",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D03-I-M02",
            text: "Assess occupancy, evacuation routes, assembly points and first-aid capacity against real scenarios",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D03-I-M03",
            text: "Identify external responder interfaces, people needing evacuation assistance and high-impact incident triggers",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D03-I-M04",
            text: "Scenario-test emergency plans against off-hours occupancy, contractors, visitors and assisted-evacuation needs",
            reviewState: "reviewed"
          }
        ]
      },
      protect: {
        threats: [
          {
            id: "CSM-D03-P-R01",
            text: "Fire, explosion, smoke spread, structural failure or delayed emergency notification",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D03-P-R02",
            text: "Unsafe hot work, contractor activity or temporary arrangements bypassing life-safety controls",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D03-P-R03",
            text: "Insufficient drills, equipment readiness or first-aid competence among personnel",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D03-P-R04",
            text: "Emergency equipment inaccessible because of storage creep, layout changes or poor housekeeping",
            reviewState: "reviewed"
          }
        ],
        controls: [
          {
            id: "CSM-D03-P-M01",
            text: "Use competent design and maintenance for code-compliant compartmentation, suppression, signage and escape routes",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D03-P-M02",
            text: "Control high-risk work through authorization, supervision and shutdown criteria",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D03-P-M03",
            text: "Train personnel for alarm response, evacuation and first aid within their competence and authorized role",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D03-P-M04",
            text: "Protect alarm points, exits, extinguishers and rescue routes from operational encroachment through inspections",
            reviewState: "reviewed"
          }
        ]
      },
      detect: {
        threats: [
          {
            id: "CSM-D03-D-R01",
            text: "Blocked exits, disabled alarms or degraded suppression systems discovered too late",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D03-D-R02",
            text: "Near misses, small incidents or weak signals ignored before escalation",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D03-D-R03",
            text: "Lack of visibility on equipment readiness, drill performance or emergency communications",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D03-D-R04",
            text: "Communications failure between alarm systems, wardens and responders during drills or incidents",
            reviewState: "reviewed"
          }
        ],
        controls: [
          {
            id: "CSM-D03-D-M01",
            text: "Inspect, test and maintain alarms, suppression, emergency lighting, exits and response equipment",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D03-D-M02",
            text: "Track near misses, drill findings and emergency-readiness deficiencies as leading indicators",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D03-D-M03",
            text: "Verify emergency communications, accountability processes and responder contact data regularly",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D03-D-M04",
            text: "Test alarm audibility, radio or phone fallback and accountability tools under realistic occupancy conditions",
            reviewState: "reviewed"
          }
        ]
      },
      respond: {
        threats: [
          {
            id: "CSM-D03-R-R01",
            text: "Active fire, explosion, collapse, severe injury or mass-casualty incident in progress",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D03-R-R02",
            text: "Rapid loss of safe occupancy requiring immediate command decisions",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D03-R-R03",
            text: "Confusion between internal response teams and public emergency services",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D03-R-R04",
            text: "Spontaneous, uncoordinated rescue attempts exposing untrained personnel to secondary harm",
            reviewState: "reviewed"
          }
        ],
        controls: [
          {
            id: "CSM-D03-R-M01",
            text: "Alarm, evacuate or shelter as required, account for people and establish incident command quickly",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D03-R-M02",
            text: "Provide first aid within competence and support formal triage by trained, authorized clinical or emergency responders",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D03-R-M03",
            text: "Guide emergency services, share situation data and maintain a single decision log during the event",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D03-R-M04",
            text: "Define and practice no-go thresholds and rescuer-safety rules until public responders assume control",
            reviewState: "reviewed"
          }
        ]
      },
      recover: {
        threats: [
          {
            id: "CSM-D03-RC-R01",
            text: "Unsafe re-entry, depleted emergency stocks or unresolved life-safety defects after the incident",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D03-RC-R02",
            text: "Psychological impact and degraded readiness after a severe event",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D03-RC-R03",
            text: "Reopening without addressing the systemic causes of the emergency",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D03-RC-R04",
            text: "Readiness degraded because lessons from drills and incidents are not converted into capital or maintenance action",
            reviewState: "reviewed"
          }
        ],
        controls: [
          {
            id: "CSM-D03-RC-M01",
            text: "Use phased re-entry, safety validation and replenishment of emergency resources before resuming operations",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D03-RC-M02",
            text: "Offer voluntary trauma-informed welfare support and conduct a separate operational after-action review",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D03-RC-M03",
            text: "Update layouts, permits, drills and emergency plans based on root-cause findings",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D03-RC-M04",
            text: "Track drill findings and post-incident actions to funded remediation with accountable owners",
            reviewState: "reviewed"
          }
        ]
      }
    }
  },
  {
    id: "security-of-production-and-operations",
    name: "Operations, Supply Chain and Quality",
    focus: "Products, services, logistics, supplier dependencies, payment integrity and quality management.",
    sourceContext: "This source pack combines general risk, supply continuity, security management and quality guidance. Cyber supply-chain sources apply only to information and communications technology and operational technology; other duties vary by sector and jurisdiction.",
    cells: {
      identify: {
        threats: [
          {
            id: "CSM-D04-I-R01",
            text: "Single-source suppliers, logistics bottlenecks or concentration risk in critical inputs",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D04-I-R02",
            text: "Product, service or process failures not linked to customer harm or applicable safety, legal and contract obligations",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D04-I-R03",
            text: "Weak visibility into payment approvals, stock movements or high-value asset flows",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D04-I-R04",
            text: "Hidden dependency on specialist tooling, software or customs brokers with no rapid substitute",
            reviewState: "reviewed"
          }
        ],
        controls: [
          {
            id: "CSM-D04-I-M01",
            text: "Map critical suppliers, service dependencies, transport routes, maximum tolerable disruption and required recovery times",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D04-I-M02",
            text: "Define quality-critical controls, customer safety obligations and recall criteria where applicable",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D04-I-M03",
            text: "Assess procurement, inventory and payment processes for fraud, error and disruption exposure",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D04-I-M04",
            text: "Map sole-source tooling, specialist service providers and border or clearance dependencies into continuity plans",
            reviewState: "reviewed"
          }
        ]
      },
      protect: {
        threats: [
          {
            id: "CSM-D04-P-R01",
            text: "Counterfeit, poor-quality or unsafe inputs entering production or service delivery",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D04-P-R02",
            text: "Contract ambiguity, chain-of-custody failure or weak handoffs across operations and logistics",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D04-P-R03",
            text: "Unauthorized payments, inventory loss or weak change control in production environments",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D04-P-R04",
            text: "Unauthorized specification changes or engineering deviations weakening quality and traceability",
            reviewState: "reviewed"
          }
        ],
        controls: [
          {
            id: "CSM-D04-P-M01",
            text: "Use proportionate supplier due diligence, approved-vendor controls, incoming verification and product-quality gates",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D04-P-M02",
            text: "Define responsibilities, specifications, storage and transport requirements across the supply chain",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D04-P-M03",
            text: "Apply secure approvals, reconciliation controls and change management for critical operations",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D04-P-M04",
            text: "Enforce controlled change approval, version discipline and traceability across product and process changes",
            reviewState: "reviewed"
          }
        ]
      },
      detect: {
        threats: [
          {
            id: "CSM-D04-D-R01",
            text: "Nonconformance, delivery anomalies or production deviations emerging before formal failure",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D04-D-R02",
            text: "Supplier performance drift, recurring defects or weakening quality capability",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D04-D-R03",
            text: "Payment irregularities or unexplained stock movement indicating fraud or control breakdown",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D04-D-R04",
            text: "Warranty, complaint or return data not tied back to supplier and process risk early enough",
            reviewState: "reviewed"
          }
        ],
        controls: [
          {
            id: "CSM-D04-D-M01",
            text: "Monitor traceability, reconciliations, nonconformance data and exception handling",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D04-D-M02",
            text: "Review supplier performance indicators, audit findings, delivery reliability and corrective-action completion",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D04-D-M03",
            text: "Use transaction monitoring and inventory analysis to surface abnormal patterns early",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D04-D-M04",
            text: "Feed customer complaints, returns and field-failure data into supplier and process surveillance",
            reviewState: "reviewed"
          }
        ]
      },
      respond: {
        threats: [
          {
            id: "CSM-D04-R-R01",
            text: "Product recall, customer safety event, supplier outage or shipment loss",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D04-R-R02",
            text: "Fraud event or payment compromise affecting delivery obligations",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D04-R-R03",
            text: "Need to halt production or service to contain quality or safety impact",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D04-R-R04",
            text: "Manual workarounds or emergency buys introducing additional quality or fraud exposure during disruption",
            reviewState: "reviewed"
          }
        ],
        controls: [
          {
            id: "CSM-D04-R-M01",
            text: "Where applicable, trigger recall, stop-ship, hold-and-inspect or contingency sourcing plans with clear authority",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D04-R-M02",
            text: "Contain financial exposure, reroute logistics and prioritize critical customers or services",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D04-R-M03",
            text: "Coordinate regulator, customer and supplier communications within applicable legal and contract duties",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D04-R-M04",
            text: "Use emergency-procurement guardrails, temporary-quality gates and documented exception approvals during contingency operations",
            reviewState: "reviewed"
          }
        ]
      },
      recover: {
        threats: [
          {
            id: "CSM-D04-RC-R01",
            text: "Backlog, claims, penalties or trust erosion after operational disruption",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D04-RC-R02",
            text: "Long-term supplier degradation or repeated quality escapes",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D04-RC-R03",
            text: "Recovery focused only on output volume instead of resilient process redesign",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D04-RC-R04",
            text: "Commercial pressure restoring service before inventory accuracy, quality assurance or reconciliations are stable",
            reviewState: "reviewed"
          }
        ],
        controls: [
          {
            id: "CSM-D04-RC-M01",
            text: "Use staged recovery scheduling, claims handling and critical-service restoration priorities",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D04-RC-M02",
            text: "Requalify suppliers, strengthen quality controls and update sourcing strategy where concentration was exposed",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D04-RC-M03",
            text: "Feed lessons into design, contracting, supplier governance and continuity plans",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D04-RC-M04",
            text: "Require post-disruption stock, payment and quality reconciliation before full output ramp-up",
            reviewState: "reviewed"
          }
        ]
      }
    }
  },
  {
    id: "environmental-safety",
    name: "Environmental and Hazardous Materials Safety",
    focus: "Environmental management, hazardous materials, permits, pollution prevention, ecosystems and affected communities.",
    sourceContext: "This source pack covers emissions, waste, releases and harm to air, water, soil, ecosystems and communities. Worker exposure belongs primarily to occupational safety; evacuation, medical response and command belong to emergency preparedness.",
    cells: {
      identify: {
        threats: [
          {
            id: "CSM-D05-I-R01",
            text: "Hazardous materials, emissions sources or waste streams not fully inventoried or classified",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D05-I-R02",
            text: "Legal, permit, customer, contract or financing requirements omitted from environmental planning",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D05-I-R03",
            text: "High energy, water or material intensity creating compliance and resilience stress",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D05-I-R04",
            text: "Legacy contamination, historical waste areas or unknown buried infrastructure complicating current operations",
            reviewState: "reviewed"
          }
        ],
        controls: [
          {
            id: "CSM-D05-I-M01",
            text: "Maintain environmental aspects registers, chemical inventories, permit registers and site baselines",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D05-I-M02",
            text: "Map receptors, drainage, storage, transport and credible releases, including worst cases where law or site risk requires",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D05-I-M03",
            text: "Baseline energy, water, emissions and waste performance against operational risk and targets",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D05-I-M04",
            text: "Maintain site history, legacy-contamination records and utility drawings in operational risk planning",
            reviewState: "reviewed"
          }
        ]
      },
      protect: {
        threats: [
          {
            id: "CSM-D05-P-R01",
            text: "Spills, releases, uncontrolled waste or pollution caused by weak handling and storage",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D05-P-R02",
            text: "Cross-contamination, incompatible storage or contractor-caused environmental harm",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D05-P-R03",
            text: "Failure to meet permit conditions, discharge limits or other environmental requirements",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D05-P-R04",
            text: "Stormwater and fire-water pathways carrying pollutants beyond intended containment during severe weather or fire",
            reviewState: "reviewed"
          }
        ],
        controls: [
          {
            id: "CSM-D05-P-M01",
            text: "Use segregation, containment, labeling, storage and transport controls for hazardous materials",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D05-P-M02",
            text: "Operate an environmental management system with training, maintenance and contractor requirements",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D05-P-M03",
            text: "Build resource efficiency, pollution prevention and emergency controls into routine operations",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D05-P-M04",
            text: "Engineer and inspect drainage isolation, secondary containment and contaminated run-off management arrangements",
            reviewState: "reviewed"
          }
        ]
      },
      detect: {
        threats: [
          {
            id: "CSM-D05-D-R01",
            text: "Leaks, abnormal consumption, permit-condition deviations or emission and discharge exceedances remaining unnoticed",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D05-D-R02",
            text: "Weak monitoring around chemicals, waste routes, bunds or discharge points",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D05-D-R03",
            text: "Community complaints or inspection findings surfacing before internal controls do",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D05-D-R04",
            text: "Portable containers, temporary storage or contractor waste handling operating outside routine monitoring",
            reviewState: "reviewed"
          }
        ],
        controls: [
          {
            id: "CSM-D05-D-M01",
            text: "Use inspections, metering, sampling, alarms and environmental performance dashboards",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D05-D-M02",
            text: "Monitor chemical, waste, drainage and storage controls with defined escalation thresholds",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D05-D-M03",
            text: "Track complaints, deviations and regulator findings as early warning indicators",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D05-D-M04",
            text: "Include temporary storage, contractor compounds and mobile assets in inspection and monitoring scope",
            reviewState: "reviewed"
          }
        ]
      },
      respond: {
        threats: [
          {
            id: "CSM-D05-R-R01",
            text: "Spill, release, fire water contamination or pollution incident in progress",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D05-R-R02",
            text: "Immediate risk to people, water, soil, wildlife or community trust",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D05-R-R03",
            text: "Missed notification, sampling or containment actions increasing impact",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D05-R-R04",
            text: "Conflicting pressure to resume operations before contamination boundaries and liabilities are understood",
            reviewState: "reviewed"
          }
        ],
        controls: [
          {
            id: "CSM-D05-R-M01",
            text: "Isolate the source, protect people first and deploy spill, containment and shutdown measures",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D05-R-M02",
            text: "Complete required notifications, sampling and impact assessment without delay",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D05-R-M03",
            text: "Coordinate communications, remediation contractors and environmental decisions at an incident-appropriate cadence",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D05-R-M04",
            text: "Require containment verification, competent environmental authorization and regulator approval where applicable before restart",
            reviewState: "reviewed"
          }
        ]
      },
      recover: {
        threats: [
          {
            id: "CSM-D05-RC-R01",
            text: "Long-tail remediation cost, permit action, litigation or reputational damage after the event",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D05-RC-R02",
            text: "Loss of environmental permits, regulatory permission or community acceptance after weak follow-up",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D05-RC-R03",
            text: "Recurrence because environmental design and contractor controls were not improved",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D05-RC-R04",
            text: "Remediation contractors or waste routes introducing secondary environmental risk during cleanup",
            reviewState: "reviewed"
          }
        ],
        controls: [
          {
            id: "CSM-D05-RC-M01",
            text: "Execute cleanup, remediation, reporting and stakeholder follow-up transparently",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D05-RC-M02",
            text: "Refresh permits, operating controls, contractor requirements and monitoring design",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D05-RC-M03",
            text: "Invest in resilient process design, resource efficiency and more reliable containment",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D05-RC-M04",
            text: "Govern cleanup contractors, waste manifests and restoration sampling with enhanced oversight until closure",
            reviewState: "reviewed"
          }
        ]
      }
    }
  },
  {
    id: "information-and-cyber-security",
    name: "Information and Cybersecurity",
    focus: "Data, identities, systems, privacy, secure operations and digital continuity.",
    sourceContext: "This source pack covers governance, voluntary cyber baselines, information security, incident response and European Union threat context. The NIST Cybersecurity Framework (CSF) 2.0 has six functions, including Govern; this matrix uses five operational phases and treats governance as cross-cutting. Legal and privacy duties vary by jurisdiction and contract.",
    cells: {
      identify: {
        threats: [
          {
            id: "CSM-D06-I-R01",
            text: "Critical data, systems, identities or recovery dependencies not inventoried and classified",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D06-I-R02",
            text: "Third-party connections, cloud services or operational technology dependencies hidden from governance",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D06-I-R03",
            text: "Weak understanding of crown-jewel assets and legal or contractual protection requirements",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D06-I-R04",
            text: "Shadow information technology, unmanaged software services and developer tooling creating undocumented data and identity exposure",
            reviewState: "reviewed"
          }
        ],
        controls: [
          {
            id: "CSM-D06-I-M01",
            text: "Maintain asset, identity, data and dependency inventories tied to business criticality",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D06-I-M02",
            text: "Classify information and services by confidentiality, integrity, availability and recovery need",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D06-I-M03",
            text: "Map legal, privacy, supplier and customer obligations to the systems and data they affect",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D06-I-M04",
            text: "Run recurring risk-based discovery for shadow services, unmanaged integrations and privileged automation accounts",
            reviewState: "reviewed"
          }
        ]
      },
      protect: {
        threats: [
          {
            id: "CSM-D06-P-R01",
            text: "Phishing, ransomware, credential theft, misconfiguration or exploitable internet exposure",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D06-P-R02",
            text: "Excess privilege, unmanaged endpoints or insecure remote access opening high-impact paths",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D06-P-R03",
            text: "Data leakage or privacy failure caused by weak handling, transfer or retention controls",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D06-P-R04",
            text: "Insecure software changes, exposed secrets or weak continuous-integration and delivery controls creating privileged attack paths",
            reviewState: "reviewed"
          }
        ],
        controls: [
          {
            id: "CSM-D06-P-M01",
            text: "Use phishing-resistant multifactor authentication where supported and enforce least privilege for high-risk access",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D06-P-M02",
            text: "Maintain hardened baselines, segmentation, vulnerability management, endpoint protection, email security and tested backups",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D06-P-M03",
            text: "Apply encryption, data-handling rules, supplier controls and workforce cyber-awareness training",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D06-P-M04",
            text: "Secure software pipelines, secret handling and privileged automation with separation, review and monitoring",
            reviewState: "reviewed"
          }
        ]
      },
      detect: {
        threats: [
          {
            id: "CSM-D06-D-R01",
            text: "Compromise, lateral movement or suspicious privilege use hidden in routine operations",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D06-D-R02",
            text: "Logging, monitoring or backup failures reducing visibility into attacks and outages",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D06-D-R03",
            text: "Third-party or identity anomalies missed until services or data are affected",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D06-D-R04",
            text: "Business users normalize suspicious behavior because alert fatigue or poor reporting culture suppresses early signals",
            reviewState: "reviewed"
          }
        ],
        controls: [
          {
            id: "CSM-D06-D-M01",
            text: "Use centralized logging, endpoint detection and response, network visibility and alert triage across critical environments",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D06-D-M02",
            text: "Monitor identity, endpoint, network and data signals for abnormal behavior and integrity loss",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D06-D-M03",
            text: "Test backup recovery, logging coverage and detection health at a cadence matched to criticality",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D06-D-M04",
            text: "Give workforce clear cyber escalation paths and validate that high-signal events reach responders quickly",
            reviewState: "reviewed"
          }
        ]
      },
      respond: {
        threats: [
          {
            id: "CSM-D06-R-R01",
            text: "Cyber incident, major outage or data breach spreading faster than decision-making can keep up",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D06-R-R02",
            text: "Regulated or sensitive data disclosure requiring legal, privacy and customer action",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D06-R-R03",
            text: "Conflicting business pressure to restore service before containment is complete",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D06-R-R04",
            text: "Applicable legal, regulator, contract or customer notification deadlines starting before technical scope is stable",
            reviewState: "reviewed"
          }
        ],
        controls: [
          {
            id: "CSM-D06-R-M01",
            text: "Contain accounts, hosts, credentials and network paths using predefined incident authority",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D06-R-M02",
            text: "Run incident response, forensic preservation, legal assessment and crisis communications in parallel",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D06-R-M03",
            text: "Make restore decisions from a trusted picture of scope, eradication status and recovery integrity",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D06-R-M04",
            text: "Run a parallel legal-notification workstream against applicable deadlines and stated evidence limits",
            reviewState: "reviewed"
          }
        ]
      },
      recover: {
        threats: [
          {
            id: "CSM-D06-RC-R01",
            text: "Prolonged outage, residual compromise or unreliable recovery after initial containment",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D06-RC-R02",
            text: "Loss of trust due to repeated incidents, weak transparency or poor corrective action",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D06-RC-R03",
            text: "Rebuilt services inheriting the same architectural weaknesses that enabled the event",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D06-RC-R04",
            text: "Backups restore data but not trust in identities, integrations or data integrity",
            reviewState: "reviewed"
          }
        ],
        controls: [
          {
            id: "CSM-D06-RC-M01",
            text: "Restore from tested backups and trusted rebuild procedures with validation before reconnecting",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D06-RC-M02",
            text: "Revoke or rotate exposed credentials and secrets, then close the architectural weaknesses that enabled compromise",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D06-RC-M03",
            text: "Revalidate suppliers, monitoring coverage, business processes and customer trust after recovery",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D06-RC-M04",
            text: "Revalidate identities, integrations, data integrity and business approvals before declaring recovery complete",
            reviewState: "reviewed"
          }
        ]
      }
    }
  },
  {
    id: "compliance-control",
    name: "Integrity, Compliance and Investigations",
    focus: "Compliance management, anti-corruption, speak-up systems, investigations and control integrity.",
    sourceContext: "This source pack covers compliance management, anti-corruption, whistleblowing and internal investigations. Employment rights, privilege, privacy, evidence handling and reporting duties remain jurisdiction-specific.",
    cells: {
      identify: {
        threats: [
          {
            id: "CSM-D07-I-R01",
            text: "Bribery, fraud, conflicts of interest or theft risk embedded in high-risk processes and markets",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D07-I-R02",
            text: "Third parties and public-official interactions creating heightened due-diligence needs without establishing misconduct",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D07-I-R03",
            text: "Unclear ownership for speak-up intake, evidence preservation, investigations or disciplinary decisions",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D07-I-R04",
            text: "Incentive schemes, sales targets or market-entry pressure rewarding borderline behavior",
            reviewState: "reviewed"
          }
        ],
        controls: [
          {
            id: "CSM-D07-I-M01",
            text: "Run integrity and misconduct risk assessments across procurement, sales, finance and public-interface activities",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D07-I-M02",
            text: "Tier third parties, gifts, hospitality and approval points by corruption and fraud exposure",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D07-I-M03",
            text: "Define reporting, investigation, evidence-preservation and remediation ownership under applicable law and procedure",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D07-I-M04",
            text: "Review compensation, commission and target structures for misconduct incentives and override pressure",
            reviewState: "reviewed"
          }
        ]
      },
      protect: {
        threats: [
          {
            id: "CSM-D07-P-R01",
            text: "Improper payments, facilitation pressure, books-and-records manipulation or asset misuse",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D07-P-R02",
            text: "Retaliation, weak culture or management override undermining compliance controls",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D07-P-R03",
            text: "Third-party relationships used to bypass controls the organization would not breach directly",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D07-P-R04",
            text: "Off-book communications, personal devices or side agreements bypassing formal records and approvals",
            reviewState: "reviewed"
          }
        ],
        controls: [
          {
            id: "CSM-D07-P-M01",
            text: "Use codes of conduct, anti-bribery policies, segregation of duties and approval thresholds",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D07-P-M02",
            text: "Apply due diligence, contract controls, certifications and targeted training for higher-risk relationships and roles",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D07-P-M03",
            text: "Protect reporters and investigation integrity through confidentiality, non-retaliation and independent oversight",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D07-P-M04",
            text: "Set channel, recordkeeping and contract-control expectations with monitoring and escalation for off-system behavior",
            reviewState: "reviewed"
          }
        ]
      },
      detect: {
        threats: [
          {
            id: "CSM-D07-D-R01",
            text: "Suspicious payments, procurement anomalies or hospitality patterns escaping review",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D07-D-R02",
            text: "Misconduct reports buried by weak intake, poor triage or fragmented ownership",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D07-D-R03",
            text: "Evidence destruction or data loss before an allegation can be tested",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D07-D-R04",
            text: "Small-value anomalies dismissed individually even though they form a repeated corruption or fraud pattern",
            reviewState: "reviewed"
          }
        ],
        controls: [
          {
            id: "CSM-D07-D-M01",
            text: "Use transaction analytics, audit trails, exception monitoring and reconciliations in high-risk processes",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D07-D-M02",
            text: "Operate secure speak-up channels with triage criteria and case-management discipline",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D07-D-M03",
            text: "Preserve relevant records, devices and communications when a credible allegation meets defined criteria",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D07-D-M04",
            text: "Aggregate low-value exceptions, hospitality events and vendor anomalies into trend analysis at enterprise level",
            reviewState: "reviewed"
          }
        ]
      },
      respond: {
        threats: [
          {
            id: "CSM-D07-R-R01",
            text: "Credible allegation or substantiated finding of bribery, fraud, theft, retaliation or major control failure",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D07-R-R02",
            text: "Regulator or law-enforcement inquiry creating potential penalties, debarment or independent monitoring",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D07-R-R03",
            text: "Inconsistent response across human resources, legal, finance and security weakening case credibility",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D07-R-R04",
            text: "Parallel internal actions unintentionally tipping off subjects or compromising witness safety",
            reviewState: "reviewed"
          }
        ],
        controls: [
          {
            id: "CSM-D07-R-M01",
            text: "Preserve evidence, apply lawful interim safeguards and stop suspect transactions under documented authority",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D07-R-M02",
            text: "Coordinate legal, human resources, finance, compliance and security using documented authority and decision logs",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D07-R-M03",
            text: "Cooperate with authorities and affected counterparties in line with law and case strategy",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D07-R-M04",
            text: "Sequence interim measures, interviews, evidence preservation and witness safeguards through an impartial case plan",
            reviewState: "reviewed"
          }
        ]
      },
      recover: {
        threats: [
          {
            id: "CSM-D07-RC-R01",
            text: "Trust erosion, financial loss or monitor obligations after a major integrity failure",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D07-RC-R02",
            text: "Recurring misconduct because incentives, controls or leadership signals were left unchanged",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D07-RC-R03",
            text: "Weak remediation closure causing the organization to fail the same test again",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D07-RC-R04",
            text: "Remediation documented for regulators but not translated into daily management practice",
            reviewState: "reviewed"
          }
        ],
        controls: [
          {
            id: "CSM-D07-RC-M01",
            text: "Track remediation to closure with accountable owners, deadlines and independent validation",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D07-RC-M02",
            text: "Redesign incentives, approvals, third-party governance and books-and-records controls where failures occurred",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D07-RC-M03",
            text: "Use lessons learned to strengthen culture, training, communications and assurance plans",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D07-RC-M04",
            text: "Embed remediation into manager objectives, assurance testing and board reporting until behavior changes",
            reviewState: "reviewed"
          }
        ]
      }
    }
  },
  {
    id: "contingency-and-crisis-management",
    name: "Business Continuity and Crisis Management",
    focus: "Critical services, dependencies, crisis leadership, resilience exercises and coordinated recovery.",
    sourceContext: "This source pack covers continuity systems, crisis management, exercises and multi-hazard resilience. Health-emergency guidance supports public-health coordination rather than generic continuity-system requirements.",
    cells: {
      identify: {
        threats: [
          {
            id: "CSM-D08-I-R01",
            text: "Critical services, recovery priorities and dependency chains not understood well enough for crisis decisions",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D08-I-R02",
            text: "Single points of failure across people, sites, utilities, suppliers or digital services",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D08-I-R03",
            text: "Crisis triggers and decision rights undefined until pressure is already high",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D08-I-R04",
            text: "Regional legal, customer or public-service obligations not prioritized clearly in cross-border crises",
            reviewState: "reviewed"
          }
        ],
        controls: [
          {
            id: "CSM-D08-I-M01",
            text: "Run business-impact analysis and scenario planning across core services, products and jurisdictions",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D08-I-M02",
            text: "Map dependency chains, maximum tolerable disruption, required recovery times and minimum operating requirements",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D08-I-M03",
            text: "Define crisis governance, activation thresholds, external stakeholder maps and authority structures",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D08-I-M04",
            text: "Rank statutory, customer and societal obligations within recovery priorities for each jurisdiction",
            reviewState: "reviewed"
          }
        ]
      },
      protect: {
        threats: [
          {
            id: "CSM-D08-P-R01",
            text: "Insufficient continuity capability for outages, political disruption, extreme weather or supply shocks",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D08-P-R02",
            text: "Outdated plans, untrained leaders or no alternate arrangements for critical operations",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D08-P-R03",
            text: "Overreliance on a single site, supplier, utility or team during extraordinary conditions",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D08-P-R04",
            text: "Crisis plans assume key leaders, networks or facilities are available when the scenario removes them",
            reviewState: "reviewed"
          }
        ],
        controls: [
          {
            id: "CSM-D08-P-M01",
            text: "Maintain continuity plans, alternate suppliers, alternate sites and reserve capacity proportionate to impact",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D08-P-M02",
            text: "Use backups, inventory buffers, utility resilience and mutual-support arrangements where justified",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D08-P-M03",
            text: "Exercise crisis leadership, communications and continuity decisions before disruption occurs",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D08-P-M04",
            text: "Exercise degraded-command, degraded-comms and leader-unavailability scenarios, not only nominal ones",
            reviewState: "reviewed"
          }
        ]
      },
      detect: {
        threats: [
          {
            id: "CSM-D08-D-R01",
            text: "Escalating external or internal warning signals missed before service disruption becomes acute",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D08-D-R02",
            text: "Readiness gaps hidden because plans are untested or assumptions are stale",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D08-D-R03",
            text: "Threshold breaches not escalated because the organization lacks a common operating picture",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D08-D-R04",
            text: "Fragmented thresholds across teams delay activation until the event has already spread",
            reviewState: "reviewed"
          }
        ],
        controls: [
          {
            id: "CSM-D08-D-M01",
            text: "Monitor triggers, dependency health, geopolitical and environmental signals and service-status thresholds",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D08-D-M02",
            text: "Use dashboards, readiness reviews and exercises to expose plan drift and capability gaps",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D08-D-M03",
            text: "Verify contact data, team availability, recovery assumptions and decision-support information routinely",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D08-D-M04",
            text: "Align trigger criteria across business, technology, security and site teams into a common escalation model",
            reviewState: "reviewed"
          }
        ]
      },
      respond: {
        threats: [
          {
            id: "CSM-D08-R-R01",
            text: "Acute crisis, multi-site outage or public issue requiring coordinated leadership under time pressure",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D08-R-R02",
            text: "Fragmented communications, conflicting priorities or uncontrolled workarounds worsening the event",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D08-R-R03",
            text: "Slow coordination with authorities, key customers, staff or suppliers increasing impact",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D08-R-R04",
            text: "Local teams improvising incompatible workarounds that undermine enterprise recovery priorities",
            reviewState: "reviewed"
          }
        ],
        controls: [
          {
            id: "CSM-D08-R-M01",
            text: "Activate crisis structures, decision logs and a shared operating picture with clear strategic priorities",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D08-R-M02",
            text: "Prioritize life safety, continuity of critical services and disciplined stakeholder communications",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D08-R-M03",
            text: "Coordinate with suppliers, customers, authorities and internal teams at a cadence matched to crisis conditions",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D08-R-M04",
            text: "Use enterprise guardrails for local improvisation, exception approval and prioritized resource allocation",
            reviewState: "reviewed"
          }
        ]
      },
      recover: {
        threats: [
          {
            id: "CSM-D08-RC-R01",
            text: "Recovery stalling because exhausted teams, dependencies and financial pressure were not managed",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D08-RC-R02",
            text: "Reputational loss caused by opaque communications or inconsistent restart sequencing",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D08-RC-R03",
            text: "Failure to learn from the event leaving resilience static while risk evolves",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D08-RC-R04",
            text: "Recovery creates new fragility because accumulated emergency exceptions are left in place",
            reviewState: "reviewed"
          }
        ],
        controls: [
          {
            id: "CSM-D08-RC-M01",
            text: "Use phased restoration, prioritized backlog handling and executive oversight of recovery dependencies",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D08-RC-M02",
            text: "Conduct after-action reviews, stakeholder follow-up and resilience investment decisions promptly",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D08-RC-M03",
            text: "Update continuity plans, contracts, inventories, exercises and governance based on real lessons",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D08-RC-M04",
            text: "Close emergency exceptions, temporary contracts and manual workarounds through structured recovery governance",
            reviewState: "reviewed"
          }
        ]
      }
    }
  },
  {
    id: "industrial-safety",
    name: "Occupational Health and Safety",
    focus: "Safe work systems, worker health, wellbeing, contractor interfaces and preventive control of workplace harm.",
    sourceContext: "This source pack covers occupational safety systems, worker health, psychosocial risk and preventive controls. Employers and line management remain accountable, while workers and their representatives participate in safety decisions. Health surveillance, stop-work and return-to-work duties vary by law.",
    cells: {
      identify: {
        threats: [
          {
            id: "CSM-D09-I-R01",
            text: "Hazardous tasks, machinery, energy sources or substances not fully assessed before work starts",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D09-I-R02",
            text: "Psychosocial, ergonomic or fatigue risks treated as secondary instead of operational hazards",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D09-I-R03",
            text: "Shared workplaces and contractor interfaces leaving responsibilities unclear",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D09-I-R04",
            text: "Workforce diversity, competence gaps or communication and access needs increasing task misunderstanding",
            reviewState: "reviewed"
          }
        ],
        controls: [
          {
            id: "CSM-D09-I-M01",
            text: "Run job hazard analysis, exposure mapping and worker consultation for routine and non-routine work",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D09-I-M02",
            text: "Use competent occupational-health input and lawful, justified, confidential surveillance for relevant exposure risks",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D09-I-M03",
            text: "Define employer, contractor and shared-site responsibilities before work is authorized",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D09-I-M04",
            text: "Adapt induction, supervision and work instructions to competence, communication and accessibility needs",
            reviewState: "reviewed"
          }
        ]
      },
      protect: {
        threats: [
          {
            id: "CSM-D09-P-R01",
            text: "Unsafe work methods, machine interaction or energy isolation failures causing serious injury",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D09-P-R02",
            text: "Chronic harm from exposure, workload, repetitive strain or poor workplace design",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D09-P-R03",
            text: "Violence, fatigue or time pressure degrading decision quality and supervision",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D09-P-R04",
            text: "Simultaneous operations, maintenance and cleaning activities creating interface hazards",
            reviewState: "reviewed"
          }
        ],
        controls: [
          {
            id: "CSM-D09-P-M01",
            text: "Eliminate or substitute hazards first, then apply engineering, organizational and residual personal protective controls",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D09-P-M02",
            text: "Use safe-work systems, permits, machine guarding and verified energy isolation for hazardous tasks",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D09-P-M03",
            text: "Support workload management, violence prevention and supervisor capability as part of safety performance",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D09-P-M04",
            text: "Control simultaneous operations through permits, area coordination and authorized stop-work procedures",
            reviewState: "reviewed"
          }
        ]
      },
      detect: {
        threats: [
          {
            id: "CSM-D09-D-R01",
            text: "Unsafe conditions, equipment deterioration or exposure trends not escalated before injury occurs",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D09-D-R02",
            text: "Near misses and minor injuries underreported, masking systemic weaknesses",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D09-D-R03",
            text: "Health surveillance, contractor oversight or site inspections failing to reach real risk areas",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D09-D-R04",
            text: "Supervision focused on paperwork rather than actual work conditions and control effectiveness",
            reviewState: "reviewed"
          }
        ],
        controls: [
          {
            id: "CSM-D09-D-M01",
            text: "Use inspections, supervisor observations, near-miss reporting and exposure monitoring",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D09-D-M02",
            text: "Review incident, training, absence and health trends lawfully and confidentially for emerging harm",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D09-D-M03",
            text: "Audit contractor compliance, permit adherence and corrective-action closure",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D09-D-M04",
            text: "Require field verification, worker engagement and effectiveness checks, not just document review",
            reviewState: "reviewed"
          }
        ]
      },
      respond: {
        threats: [
          {
            id: "CSM-D09-R-R01",
            text: "Injury, exposure, violence or imminent serious danger requiring immediate protective action",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D09-R-R02",
            text: "Confusion over medical response, site isolation or regulatory notification duties",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D09-R-R03",
            text: "Pressure to restart work before hazards have been controlled",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D09-R-R04",
            text: "Contractor and host-employer teams assuming the other party has response responsibility",
            reviewState: "reviewed"
          }
        ],
        controls: [
          {
            id: "CSM-D09-R-M01",
            text: "Provide urgent care, summon rescue or medical support and control the immediate hazard",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D09-R-M02",
            text: "After urgent care and hazard control, preserve evidence lawfully and begin a structured investigation",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D09-R-M03",
            text: "Authorize restart only after competent review under applicable law and site stop-work rules",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D09-R-M04",
            text: "Confirm host-contractor emergency roles, medical routes and notification duties before high-risk work",
            reviewState: "reviewed"
          }
        ]
      },
      recover: {
        threats: [
          {
            id: "CSM-D09-RC-R01",
            text: "Loss of work ability, recurrent injury or degraded workforce trust after a serious event",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D09-RC-R02",
            text: "Return-to-work handled poorly, prolonging harm and capability loss",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D09-RC-R03",
            text: "Corrective actions closing on paper but not in practice",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D09-RC-R04",
            text: "Injured or exposed workers return into the same unsafe conditions that caused the event",
            reviewState: "reviewed"
          }
        ],
        controls: [
          {
            id: "CSM-D09-RC-M01",
            text: "Offer voluntary, medically informed return-to-work planning with adjustments, confidentiality and non-discrimination",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D09-RC-M02",
            text: "Redesign work, tools, supervision and training based on verified root causes",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D09-RC-M03",
            text: "Track corrective actions and leading indicators until safer performance is demonstrated",
            reviewState: "reviewed"
          },
          {
            id: "CSM-D09-RC-M04",
            text: "Verify changed conditions, competence and supervision before authorizing return to similar tasks",
            reviewState: "reviewed"
          }
        ]
      }
    }
  }
];
