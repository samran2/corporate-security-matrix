(() => {
  "use strict";

  // An additive draft catalogue: canonical matrix records are never rewritten.
  const names = ["governance", "safety", "digital"];
  try {
    const shards = globalThis.CSMCoverageShards;
    if (!shards || names.some((name) => !shards[name])) {
      throw new TypeError("All three coverage content packs are required.");
    }
    const sourceMap = new Map();
    const topics = [];
    for (const name of names) {
      const shard = shards[name];
      if (!Array.isArray(shard.sources) || !Array.isArray(shard.topics)) {
        throw new TypeError(`Malformed coverage content pack: ${name}.`);
      }
      for (const source of shard.sources) {
        if (!source || typeof source.id !== "string") throw new TypeError("Invalid coverage source.");
        const existing = sourceMap.get(source.id);
        if (existing && JSON.stringify(existing) !== JSON.stringify(source)) {
          throw new TypeError(`Conflicting coverage source: ${source.id}.`);
        }
        sourceMap.set(source.id, source);
      }
      topics.push(...shard.topics);
    }
    globalThis.CSMCoverageCatalogue = {
      schemaVersion: 1,
      version: "0.1.0-draft",
      frameworkVersion: "1.1.0-candidate",
      reviewState: "draft",
      sources: [...sourceMap.values()],
      topics,
      profiles: [
        {
          id: "office", title: "Office and distributed work",
          description: "Start with people, information and workplace interfaces; inspect all other topics before deciding their applicability.",
          topicIds: ["governance", "employment-lifecycle", "supplier-lifecycle", "data-protection", "ai-security", "travel-program", "confidential-meetings", "verified-crisis-communications"]
        },
        {
          id: "industrial", title: "Industrial and production operations",
          description: "Focus discussion on plant, technical safety and operational dependencies. Competent site-specific assessment remains necessary.",
          topicIds: ["governance", "process-technical-safety", "ot-iot", "supplier-lifecycle", "transport-dangerous-goods", "cross-domain-resilience", "product-service-safety", "risk-transfer"]
        },
        {
          id: "digital-provider", title: "Software and digital services",
          description: "Start with product lifecycle, data and supplier dependencies; this does not exclude people, premises or service safety.",
          topicIds: ["governance", "secure-product-lifecycle", "ai-security", "data-protection", "supplier-lifecycle", "strategic-information", "cross-domain-resilience", "verified-crisis-communications"]
        },
        {
          id: "public-facing", title: "Customers, services and public events",
          description: "Review customer and participant harm, operating interfaces and communications alongside the full corporate-security model.",
          topicIds: ["governance", "product-service-safety", "event-safety", "employment-lifecycle", "supplier-lifecycle", "data-protection", "cross-domain-resilience", "verified-crisis-communications"]
        },
        {
          id: "logistics", title: "Transport and supply chain",
          description: "Start with movements, service transitions and disruption. Dangerous-goods duties depend on the organization's actual roles and cargo.",
          topicIds: ["governance", "transport-dangerous-goods", "supplier-lifecycle", "employment-lifecycle", "trade-compliance", "travel-program", "cross-domain-resilience", "risk-transfer"]
        },
        {
          id: "critical-service", title: "Critical and long-duration services",
          description: "Use coupled-disruption scenarios to examine dependencies and authority interfaces; critical-entity legal status is not inferred here.",
          topicIds: ["governance", "cross-domain-resilience", "ot-iot", "supplier-lifecycle", "employment-lifecycle", "verified-crisis-communications", "trade-compliance", "risk-transfer"]
        }
      ],
      scenarios: [
        {
          id: "ransomware-production", title: "Ransomware meets production safety",
          domainIds: ["information-and-cyber-security", "security-of-production-and-operations", "industrial-safety", "contingency-and-crisis-management"],
          topicIds: ["ot-iot", "process-technical-safety", "cross-domain-resilience", "verified-crisis-communications"],
          prompt: "Who joins cyber containment, competent plant safety decisions and business continuity when IT support and production visibility are unavailable? Use approved site procedures, not generic isolation or restart instructions.",
          expectedEvidence: "A jointly exercised authority map, safe-state decision interfaces, tested recovery prerequisites and a verified communication channel."
        },
        {
          id: "flood-power-comms", title: "Flood, power loss and communication failure",
          domainIds: ["premises-security", "environmental-safety", "rescue-safety", "contingency-and-crisis-management"],
          topicIds: ["cross-domain-resilience", "process-technical-safety", "supplier-lifecycle", "verified-crisis-communications"],
          prompt: "Which critical services, staff welfare arrangements and environmental controls depend on the same power, communications, location or replacement supplier during a prolonged disruption?",
          expectedEvidence: "A dependency map, resource-duration assumptions, competent authority contacts and an exercise showing when fallback arrangements cease to be adequate."
        },
        {
          id: "supplier-restriction", title: "A critical supplier becomes unavailable",
          domainIds: ["security-of-production-and-operations", "compliance-control", "contingency-and-crisis-management"],
          topicIds: ["supplier-lifecycle", "trade-compliance", "cross-domain-resilience", "strategic-information"],
          prompt: "How would a material ownership change, trade restriction or insolvency affect an essential supplier, its subcontractors, information access and transition to an alternative? Seek competent legal advice for restrictions.",
          expectedEvidence: "A reviewed dependency and scope assessment, transition decision record, data/access return plan and tested alternative capacity."
        },
        {
          id: "insider-ip-loss", title: "Sensitive knowledge leaves with trusted access",
          domainIds: ["personnel-security", "premises-security", "information-and-cyber-security", "compliance-control"],
          topicIds: ["employment-lifecycle", "strategic-information", "confidential-meetings", "data-protection"],
          prompt: "Can lawful employee or contractor exit arrangements reconcile physical access, accounts, keys, delegated authority and sensitive knowledge without disproportionate monitoring or assumptions of guilt?",
          expectedEvidence: "An accountable joiner-mover-leaver reconciliation, crown-jewel access map, proportionate escalation route and evidence-preservation responsibilities."
        },
        {
          id: "impersonated-payment", title: "An urgent instruction impersonates leadership",
          domainIds: ["personnel-security", "information-and-cyber-security", "compliance-control", "contingency-and-crisis-management"],
          topicIds: ["verified-crisis-communications", "ai-security", "governance", "strategic-information"],
          prompt: "Would an urgent payment, data disclosure or crisis instruction survive independent verification if familiar voice or video and a primary communication account could both be misleading?",
          expectedEvidence: "A practiced independent verification channel, dual-authority decision rule, clear pause/escalation criteria and a tabletop record of failed assumptions."
        }
      ]
    };
  } catch (error) {
    // No partial catalogue is made available to the renderer.
    delete globalThis.CSMCoverageCatalogue;
    globalThis.CSMCoverageCatalogueError = error instanceof Error ? error.message : "Coverage content could not be loaded.";
  }
})();
