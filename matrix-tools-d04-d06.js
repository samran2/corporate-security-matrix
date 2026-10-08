(function registerMitigationToolSet() {
  "use strict";

  if (!Array.isArray(window.CSM_MITIGATION_TOOL_SETS)) {
    window.CSM_MITIGATION_TOOL_SETS = [];
  }

  window.CSM_MITIGATION_TOOL_SETS.push({
    schemaVersion: "1.0.0",
    domainIds: [
      "security-of-production-and-operations",
      "environmental-safety",
      "information-and-cyber-security"
    ],
    entries: {
      "CSM-D04-I-M01": [
        {
          name: "Critical dependency mapping register",
          use: "Record suppliers, service dependencies, transport routes, disruption tolerances and recovery-time needs in one maintained relationship map."
        },
        {
          name: "Supply disruption scenario model",
          use: "Test plausible supplier, route and service outages against inventory, lead-time and recovery assumptions."
        }
      ],
      "CSM-D04-I-M02": [
        {
          name: "Quality control-plan repository",
          use: "Link quality-critical checks, acceptance criteria, customer-safety duties and responsible roles to products and processes."
        },
        {
          name: "Recall criteria decision checklist",
          use: "Structure the facts, thresholds, approvals and escalation points used when a product hold, withdrawal or recall may be needed."
        }
      ],
      "CSM-D04-I-M03": [
        {
          name: "Procure-to-pay control register",
          use: "Map approvals, reconciliations, handoffs and known fraud, error or disruption exposures across procurement, inventory and payment flows."
        },
        {
          name: "Process-risk simulation workbook",
          use: "Explore how volume spikes, missing approvals, stock errors or payment interruptions could affect critical operations."
        }
      ],
      "CSM-D04-I-M04": [
        {
          name: "Sole-source dependency register",
          use: "Track unique tooling, specialist providers, replacement lead times, substitutes and recovery prerequisites."
        },
        {
          name: "Border and clearance scenario planner",
          use: "Model customs, documentation, route and clearance delays and record usable contingency options."
        }
      ],
      "CSM-D04-P-M01": [
        {
          name: "Supplier due-diligence workflow",
          use: "Collect proportionate supplier information, risk reviews, approvals, expiry dates and follow-up actions."
        },
        {
          name: "Incoming verification and quality-gate system",
          use: "Record inspections, sampling, acceptance decisions, holds and deviations for received materials or services."
        }
      ],
      "CSM-D04-P-M02": [
        {
          name: "Supply-chain responsibility matrix",
          use: "Assign accountable roles for specifications, custody, storage, transport, acceptance and exception handling."
        },
        {
          name: "Storage and transport condition monitor",
          use: "Capture relevant location, temperature, shock, seal or custody observations and route exceptions."
        }
      ],
      "CSM-D04-P-M03": [
        {
          name: "Controlled approval and reconciliation workflow",
          use: "Route sensitive operational and financial actions through defined approvals, separation of duties and reconciliation evidence."
        },
        {
          name: "Critical operations change-control system",
          use: "Document proposed changes, risk review, testing, authorization, implementation and rollback readiness."
        }
      ],
      "CSM-D04-P-M04": [
        {
          name: "Configuration and version repository",
          use: "Maintain approved product, process, tooling and instruction versions with controlled release history."
        },
        {
          name: "Product genealogy and traceability platform",
          use: "Connect batches, components, suppliers, process steps and distribution records for targeted investigation and action."
        }
      ],
      "CSM-D04-D-M01": [
        {
          name: "Nonconformance and traceability system",
          use: "Capture defects, affected lots, containment status, investigation links and disposition decisions."
        },
        {
          name: "Reconciliation and exception dashboard",
          use: "Surface unmatched transactions, stock differences, overdue exceptions and unresolved handoffs for review."
        }
      ],
      "CSM-D04-D-M02": [
        {
          name: "Supplier performance scorecard",
          use: "Trend delivery, quality, service, resilience and responsiveness indicators by supplier and criticality."
        },
        {
          name: "Audit and corrective-action tracker",
          use: "Record findings, owners, due dates, evidence and effectiveness reviews without treating closure as proof of broader assurance."
        }
      ],
      "CSM-D04-D-M03": [
        {
          name: "Transaction anomaly analytics",
          use: "Flag unusual values, timing, counterparties, approvals or sequences for proportionate human review."
        },
        {
          name: "Inventory variance dashboard",
          use: "Compare expected and observed stock movements, aging, shrinkage and location balances to prioritize investigation."
        }
      ],
      "CSM-D04-D-M04": [
        {
          name: "Complaint and returns case system",
          use: "Link customer reports, returns, affected products, investigations and response status."
        },
        {
          name: "Field-failure trend analysis",
          use: "Group failure modes by product, supplier, batch, environment and time to identify emerging patterns."
        }
      ],
      "CSM-D04-R-M01": [
        {
          name: "Recall and stop-ship orchestration workspace",
          use: "Coordinate decision authority, affected-product scope, holds, notifications, retrieval and status reporting."
        },
        {
          name: "Contingency sourcing readiness register",
          use: "Maintain qualified alternatives, constraints, lead times, activation steps and temporary control needs."
        }
      ],
      "CSM-D04-R-M02": [
        {
          name: "Financial exposure tracker",
          use: "Estimate and update affected payments, inventory, claims, commitments and decision thresholds during disruption."
        },
        {
          name: "Logistics rerouting and capacity planner",
          use: "Compare alternate routes, carriers, capacity and customer priorities as conditions change."
        }
      ],
      "CSM-D04-R-M03": [
        {
          name: "Notification obligation matrix",
          use: "Record applicable regulator, customer and supplier communication triggers, owners, deadlines and evidence limits."
        },
        {
          name: "Stakeholder communication workspace",
          use: "Coordinate approved messages, audiences, delivery status, questions and corrections across response teams."
        }
      ],
      "CSM-D04-R-M04": [
        {
          name: "Emergency procurement checklist",
          use: "Prompt proportionate screening, authority, conflict, specification, documentation and follow-up controls under time pressure."
        },
        {
          name: "Temporary quality-gate and exception register",
          use: "Record interim acceptance checks, authorized deviations, compensating measures, expiry points and review owners."
        }
      ],
      "CSM-D04-RC-M01": [
        {
          name: "Staged recovery scheduler",
          use: "Sequence constrained materials, people, equipment and services against critical restoration priorities."
        },
        {
          name: "Claims and recovery case system",
          use: "Track losses, evidence, counterparties, submissions, decisions and outstanding recovery actions."
        }
      ],
      "CSM-D04-RC-M02": [
        {
          name: "Supplier requalification workflow",
          use: "Reassess capability, quality evidence, capacity, continuity measures and conditional approval actions after disruption."
        },
        {
          name: "Sourcing concentration analysis",
          use: "Visualize dependencies by supplier, geography, component and tier to inform diversification decisions."
        }
      ],
      "CSM-D04-RC-M03": [
        {
          name: "Operational lessons register",
          use: "Convert observed causes, decisions and control limitations into owned, dated improvement actions."
        },
        {
          name: "Design and contract change backlog",
          use: "Prioritize approved resilience changes across specifications, sourcing terms, governance and continuity plans."
        }
      ],
      "CSM-D04-RC-M04": [
        {
          name: "Stock, payment and quality reconciliation",
          use: "Compare recovered records and physical state before increasing production or service output."
        },
        {
          name: "Ramp-up readiness checklist",
          use: "Confirm capacity, material, workforce, equipment, quality and escalation conditions for each recovery stage."
        }
      ],
      "CSM-D05-I-M01": [
        {
          name: "Environmental aspects and permit register",
          use: "Maintain aspects, impacts, permit conditions and site baselines with measurement provenance, dates, locations, owners and review duties."
        },
        {
          name: "Chemical inventory and safety-data system",
          use: "Track substances, quantities, locations, classifications, safety information and accountable custodians."
        }
      ],
      "CSM-D05-I-M02": [
        {
          name: "Receptor and drainage mapping platform",
          use: "Map people, ecosystems, water paths, drains, storage and transport routes around release points and response access."
        },
        {
          name: "Release consequence scenario model",
          use: "Model credible site and transport releases, including worst-case quantities, pathways, weather and operating conditions when law or site risk requires."
        }
      ],
      "CSM-D05-I-M03": [
        {
          name: "Resource and emissions metering platform",
          use: "Collect energy, water, emissions and waste measures at useful operational boundaries."
        },
        {
          name: "Environmental baseline and target dashboard",
          use: "Compare performance with baselines, operating conditions and targets while preserving underlying measurement context."
        }
      ],
      "CSM-D05-I-M04": [
        {
          name: "Site history and contamination archive",
          use: "Preserve investigation, incident, remediation, land-use and legacy-condition records with location context."
        },
        {
          name: "Utility drawing and subsurface map repository",
          use: "Maintain controlled drainage, utility, tank, pipe and isolation-point drawings for operational planning."
        }
      ],
      "CSM-D05-P-M01": [
        {
          name: "Chemical compatibility and segregation checker",
          use: "Support storage and transport decisions using maintained hazard, compatibility and separation rules."
        },
        {
          name: "Hazardous-material inspection checklist",
          use: "Record labeling, container condition, secondary containment, inventory and transport-control observations."
        }
      ],
      "CSM-D05-P-M02": [
        {
          name: "Environmental management action register",
          use: "Coordinate training, maintenance, operating controls, objectives, responsibilities and follow-up reviews."
        },
        {
          name: "Contractor environmental control checklist",
          use: "Set site rules, pre-work checks, supervision, waste controls and escalation arrangements for contracted activities."
        }
      ],
      "CSM-D05-P-M03": [
        {
          name: "Resource-efficiency opportunity tracker",
          use: "Record operational opportunities, expected resource effects, dependencies, owners and measured outcomes."
        },
        {
          name: "Pollution-prevention and emergency-control checklist",
          use: "Verify relevant barriers, maintenance, response materials, isolation points and responsible roles for routine work."
        }
      ],
      "CSM-D05-P-M04": [
        {
          name: "Containment and drainage inspection system",
          use: "Schedule and document checks of bunds, valves, drains, interceptors, sumps and contaminated run-off arrangements."
        },
        {
          name: "Containment design-basis verification tool",
          use: "Specify, calculate and independently verify drainage isolation, secondary containment and contaminated run-off capacity before commissioning."
        }
      ],
      "CSM-D05-D-M01": [
        {
          name: "Environmental monitoring, alarm and dashboard platform",
          use: "Collect calibrated discharge, emission and resource signals; show performance, trigger thresholds and route alerts for escalation."
        },
        {
          name: "Sampling and inspection management system",
          use: "Plan fieldwork, record methods and locations, retain results and route exceptions for review."
        }
      ],
      "CSM-D05-D-M02": [
        {
          name: "Chemical, waste and drainage control dashboard",
          use: "Bring inventory, storage, waste movement, inspection and drainage observations into a common operating view."
        },
        {
          name: "Threshold alert and escalation workflow",
          use: "Route defined exceedances or control failures to responsible roles with acknowledgement and follow-up status."
        }
      ],
      "CSM-D05-D-M03": [
        {
          name: "Complaint and deviation case register",
          use: "Capture reports, location, timing, conditions, investigation status and response communications."
        },
        {
          name: "Finding and corrective-action tracker",
          use: "Track authority observations, internal findings, owners, deadlines, evidence and effectiveness review."
        }
      ],
      "CSM-D05-D-M04": [
        {
          name: "Temporary-area and mobile-asset inspection app",
          use: "Apply location-aware checks to temporary storage, contractor compounds, vehicles and movable equipment."
        },
        {
          name: "Contractor compound and asset register",
          use: "Maintain responsible parties, materials, controls, inspection status and planned removal dates."
        }
      ],
      "CSM-D05-R-M01": [
        {
          name: "Spill response equipment register",
          use: "Track location, suitability, inspection state and replenishment of containment and cleanup equipment."
        },
        {
          name: "Isolation and shutdown response playbooks",
          use: "Guide authorized responders through source control, life-safety priorities, isolation choices and escalation."
        }
      ],
      "CSM-D05-R-M02": [
        {
          name: "Environmental notification matrix",
          use: "Record potential notification triggers, recipients, responsible roles, timing and information requirements for the relevant context."
        },
        {
          name: "Sampling chain-of-custody system",
          use: "Document sample identity, location, method, custody, laboratory transfer and result linkage during impact assessment."
        }
      ],
      "CSM-D05-R-M03": [
        {
          name: "Environmental incident coordination workspace",
          use: "Maintain decisions, actions, operating picture, communications and technical advice at an incident-appropriate cadence."
        },
        {
          name: "Remediation contractor capability register",
          use: "Track available specialties, equipment, mobilization constraints, contacts and authorization status."
        }
      ],
      "CSM-D05-R-M04": [
        {
          name: "Containment verification checklist",
          use: "Record inspections, measurements, sampling and unresolved uncertainties before a restart decision."
        },
        {
          name: "Restart authorization evidence register",
          use: "Assemble competent reviews, conditions, external decisions where applicable and named operational approvals."
        }
      ],
      "CSM-D05-RC-M01": [
        {
          name: "Remediation case management system",
          use: "Coordinate cleanup scope, sampling, waste handling, contractors, decisions, costs and closure evidence."
        },
        {
          name: "Stakeholder reporting and follow-up log",
          use: "Record commitments, updates, questions, responses and outstanding engagement actions."
        }
      ],
      "CSM-D05-RC-M02": [
        {
          name: "Permit and operating-control change register",
          use: "Track affected requirements, proposed control changes, reviews, approvals, implementation and verification dates."
        },
        {
          name: "Monitoring design review tool",
          use: "Assess whether locations, methods, frequency, thresholds and data handling remain useful after the event."
        }
      ],
      "CSM-D05-RC-M03": [
        {
          name: "Resilient process design model",
          use: "Compare process, containment and utility alternatives across credible failure and recovery conditions."
        },
        {
          name: "Resource-efficiency investment portfolio",
          use: "Prioritize improvement options using expected operational, environmental, cost and implementation evidence."
        }
      ],
      "CSM-D05-RC-M04": [
        {
          name: "Cleanup contractor oversight register",
          use: "Track scope, competence, supervision, controls, deviations, evidence and corrective actions through closure."
        },
        {
          name: "Waste manifest and restoration sampling tracker",
          use: "Link waste movements, destinations, sample plans, results and acceptance decisions to the recovery record."
        }
      ],
      "CSM-D06-I-M01": [
        {
          name: "Asset and service inventory platform",
          use: "Maintain systems, devices, services, owners, locations, criticality and lifecycle status."
        },
        {
          name: "Identity, data and dependency mapping",
          use: "Connect identities, information stores, integrations and upstream services to the business activities they support."
        }
      ],
      "CSM-D06-I-M02": [
        {
          name: "Information classification catalog",
          use: "Record confidentiality, integrity, availability, handling and ownership decisions for defined information sets."
        },
        {
          name: "Service impact and recovery register",
          use: "Document service criticality, tolerable disruption, recovery objectives, dependencies and validation owners."
        }
      ],
      "CSM-D06-I-M03": [
        {
          name: "Obligation-to-system mapping register",
          use: "Link relevant legal, privacy, customer and supplier duties to affected systems, data, owners and review dates."
        },
        {
          name: "Data processing and supplier inventory",
          use: "Record processing purposes, data categories, service providers, locations, interfaces and accountable roles."
        }
      ],
      "CSM-D06-I-M04": [
        {
          name: "Unmanaged service discovery capability",
          use: "Surface previously unrecorded cloud services, exposed assets and integrations for risk-based review."
        },
        {
          name: "Automation identity and integration registry",
          use: "Track service accounts, tokens, privileges, owners, connected systems, expiry and review status."
        }
      ],
      "CSM-D06-P-M01": [
        {
          name: "Phishing-resistant authentication platform",
          use: "Support stronger authenticators for eligible high-risk access while recording enrollment and fallback paths."
        },
        {
          name: "Privileged access and entitlement governance",
          use: "Approve, time-limit, review and revoke elevated access according to role and operational need."
        }
      ],
      "CSM-D06-P-M02": [
        {
          name: "Baseline configuration and exposure management",
          use: "Maintain hardened configuration profiles, inventory deviations, prioritize vulnerabilities and track remediation decisions."
        },
        {
          name: "Layered endpoint, messaging and backup controls",
          use: "Operate endpoint protection, email defenses, segmentation and isolated backups with defined testing and escalation."
        }
      ],
      "CSM-D06-P-M03": [
        {
          name: "Encryption and key-management capability",
          use: "Apply approved cryptographic protection and manage keys, access, rotation and recovery for selected data flows."
        },
        {
          name: "Supplier assurance and secure-handling workflow",
          use: "Set supplier requirements, record due diligence and contractual controls, and deliver role-based data-handling and cyber training with review and remediation."
        }
      ],
      "CSM-D06-P-M04": [
        {
          name: "Software delivery security pipeline",
          use: "Apply code, dependency, artifact and release checks with review evidence and controlled promotion."
        },
        {
          name: "Secrets and automation access manager",
          use: "Store, issue, rotate and monitor machine credentials and privileged automation under separated approvals."
        }
      ],
      "CSM-D06-D-M01": [
        {
          name: "Central log management and correlation",
          use: "Collect time-aligned security records from critical environments and correlate selected signals for investigation."
        },
        {
          name: "Endpoint and network detection platform",
          use: "Provide endpoint activity, network visibility, alert context and triage workflows for responders."
        }
      ],
      "CSM-D06-D-M02": [
        {
          name: "Identity and behavior analytics",
          use: "Review selected identity anomalies only for authorised purposes under proportionality, transparency, access, retention and human-review controls."
        },
        {
          name: "Data and system integrity monitoring",
          use: "Observe selected configuration, file, database, network and data-flow changes against expected state."
        }
      ],
      "CSM-D06-D-M03": [
        {
          name: "Backup recovery testing harness",
          use: "Run repeatable restore exercises and record timing, data integrity, dependencies and exceptions."
        },
        {
          name: "Logging and detection health dashboard",
          use: "Track source coverage, ingestion gaps, alert-path tests, sensor health and unresolved blind spots."
        }
      ],
      "CSM-D06-D-M04": [
        {
          name: "Workforce cyber reporting channel",
          use: "Give personnel a clear route to report suspicious messages, access or system behavior with feedback status."
        },
        {
          name: "Alert-routing and responder drill platform",
          use: "Test whether high-signal events reach the correct on-call roles and capture timing and handoff gaps."
        }
      ],
      "CSM-D06-R-M01": [
        {
          name: "Identity and credential containment orchestration",
          use: "Support authorized account disablement, session revocation, credential rotation and scope tracking."
        },
        {
          name: "Endpoint and network isolation playbooks",
          use: "Guide proportionate host, segment and path containment with approvals, dependencies and reversal steps."
        }
      ],
      "CSM-D06-R-M02": [
        {
          name: "Security incident case management",
          use: "Coordinate timeline, hypotheses, actions, owners, legal questions, communications and decision records."
        },
        {
          name: "Forensic acquisition and evidence register",
          use: "Document collection scope, methods, integrity checks, custody, access and analysis status."
        }
      ],
      "CSM-D06-R-M03": [
        {
          name: "Recovery decision dashboard",
          use: "Present incident scope, affected services, containment, eradication, dependency and restoration evidence separately."
        },
        {
          name: "Trusted restore readiness checklist",
          use: "Prompt review of known persistence, rebuild source, backup condition, validation tests and reconnection authority."
        }
      ],
      "CSM-D06-R-M04": [
        {
          name: "Notification deadline and authority matrix",
          use: "Track potentially applicable clocks, decision owners, recipients, known facts and evidence limitations."
        },
        {
          name: "Legal and evidence review workspace",
          use: "Coordinate counsel, privacy, technical and communications inputs while preserving decisions and unresolved questions."
        }
      ],
      "CSM-D06-RC-M01": [
        {
          name: "Backup restoration orchestration",
          use: "Sequence restore jobs, dependencies, integrity checks, approvals and operational validation."
        },
        {
          name: "Clean rebuild and reconnect checklist",
          use: "Record trusted media, configuration, patching, monitoring, functional tests and staged reconnection decisions."
        }
      ],
      "CSM-D06-RC-M02": [
        {
          name: "Credential and secret rotation orchestrator",
          use: "Coordinate revocation and replacement across people, services, integrations and recovery dependencies."
        },
        {
          name: "Architecture remediation tracker",
          use: "Prioritize and evidence changes to trust boundaries, access paths, configurations and vulnerable components."
        }
      ],
      "CSM-D06-RC-M03": [
        {
          name: "Supplier security reassessment workflow",
          use: "Review affected providers, service dependencies, incident evidence, corrective actions and residual uncertainties."
        },
        {
          name: "Monitoring and business restoration scorecard",
          use: "Track service validation, detection coverage, operational controls, customer commitments and follow-up ownership."
        }
      ],
      "CSM-D06-RC-M04": [
        {
          name: "Identity and integration access review",
          use: "Reconfirm people, service accounts, privileges, tokens, connections and accountable owners after recovery."
        },
        {
          name: "Data integrity and business approval checklist",
          use: "Document reconciliation tests, known limitations, process-owner acceptance and criteria for declaring recovery complete."
        }
      ]
    }
  });
})();
