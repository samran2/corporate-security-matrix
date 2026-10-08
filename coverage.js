(() => {
  "use strict";

  const PHASES = ["identify", "protect", "detect", "respond", "recover"];
  const CHECK_LABELS = {
    "not-assessed": "Not assessed",
    gap: "Gap",
    partial: "Partial",
    "evidence-available": "Evidence available — user assertion",
  };
  const APPLICABILITY_LABELS = {
    undetermined: "Scope undetermined",
    applicable: "Applicable",
    "not-applicable": "Not applicable — rationale recorded",
  };
  const IDS = [
    "app", "loading", "error", "status", "profile", "domain", "search", "topics",
    "topic-count", "editor-heading", "topic-context", "form", "applicability",
    "rationale", "owner", "critical-gap", "next-action", "checks", "save", "reset",
    "print", "report-text", "report", "stats", "scenarios", "profile-note", "form-error",
  ];
  const elements = Object.fromEntries(IDS.map((id) => [id, document.getElementById(`coverage-${id}`)]));
  let catalogue = null;
  let model = null;
  let session = null;
  let selectedTopicId = null;
  let edited = false;
  let entryIndex = new Map();
  let sourceIndex = new Map();
  let checkInputs = new Map();
  let printDetailsOpen = null;

  function node(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function announce(message) {
    elements.status.textContent = message;
  }

  function option(value, label) {
    const element = node("option", "", label);
    element.value = value;
    return element;
  }

  function sourceLink(source) {
    const url = new URL(source.url);
    if (url.protocol !== "https:" || url.username || url.password) throw new Error("Unsafe source URL.");
    const link = node("a", "", `${source.title} — ${source.authority} (opens a new tab)`);
    link.href = url.href;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    return link;
  }

  function buildCoreIndex(coreDomains, actors) {
    const index = new Map();
    for (const domain of coreDomains) {
      for (const phaseId of PHASES) {
        const groups = [...Object.values(domain.cells[phaseId]), actors[domain.id]?.[phaseId] || []];
        for (const group of groups) {
          for (const entry of group) {
            if (entry.reviewState === "reviewed") {
              if (index.has(entry.id)) throw new Error("Duplicate core entry.");
              index.set(entry.id, { ...entry, domainId: domain.id, phaseId });
            }
          }
        }
      }
    }
    return index;
  }

  function completeActorPacks(coreDomains, actors) {
    if (!actors || typeof actors !== "object" || Array.isArray(actors)) return false;
    const domainIds = coreDomains.map((domain) => domain.id);
    if (Object.keys(actors).length !== 9 || !domainIds.every((id) => Object.hasOwn(actors, id))) return false;
    return domainIds.every((id) => {
      const pack = actors[id];
      return pack && typeof pack === "object" && !Array.isArray(pack) &&
        Object.keys(pack).length === PHASES.length && PHASES.every((phase) =>
          Object.hasOwn(pack, phase) && Array.isArray(pack[phase]) && pack[phase].length === 3);
    });
  }

  function selectedTopic() {
    return catalogue.topics.find((topic) => topic.id === selectedTopicId);
  }

  function pendingPatch() {
    return {
      applicability: elements.applicability.value,
      rationale: elements.rationale.value,
      ownerRole: elements.owner.value,
      criticalGap: elements["critical-gap"].value,
      nextAction: elements["next-action"].value,
      checks: Object.fromEntries([...checkInputs].map(([checkId, input]) => [checkId, input.value])),
    };
  }

  function editorIsDirty() {
    return session !== null && selectedTopicId !== null &&
      JSON.stringify(pendingPatch()) !== JSON.stringify(session.topics[selectedTopicId]);
  }

  function updateApplicabilityFields() {
    const excluded = elements.applicability.value === "not-applicable";
    elements.rationale.required = excluded;
    for (const input of checkInputs.values()) input.disabled = excluded;
  }

  function clearFormErrors() {
    for (const id of ["applicability", "rationale", "owner", "critical-gap", "next-action"]) {
      elements[id].setCustomValidity("");
    }
    for (const input of checkInputs.values()) input.setCustomValidity("");
    elements["form-error"].hidden = true;
    elements["form-error"].textContent = "";
  }

  function pendingFieldError() {
    if (!Object.hasOwn(APPLICABILITY_LABELS, elements.applicability.value)) {
      return [elements.applicability, "Choose one of the three applicability judgments."];
    }
    if (elements.applicability.value === "not-applicable" && !elements.rationale.value.trim()) {
      return [elements.rationale, "A non-applicability decision needs a scope rationale."];
    }
    for (const [id, label, maximum] of [["rationale", "Scope rationale", 300], ["critical-gap", "Critical gap", 500], ["next-action", "Next action", 500]]) {
      if (Array.from(elements[id].value).length > maximum) return [elements[id], `${label} must be at most ${maximum} characters.`];
      if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u.test(elements[id].value)) {
        return [elements[id], `${label} contains an unsupported control character. Use plain text, tabs or line breaks.`];
      }
    }
    if (elements.owner.value && !selectedTopic().ownerRoles.includes(elements.owner.value)) {
      return [elements.owner, "Choose an accountable role from this topic's role list, or leave it unassigned."];
    }
    for (const input of checkInputs.values()) {
      if (!Object.hasOwn(CHECK_LABELS, input.value)) return [input, "Choose one of the four check judgments."];
    }
    return null;
  }

  function showFormError(message, field, focus) {
    elements["form-error"].textContent = `No changes saved. ${message}`;
    elements["form-error"].hidden = false;
    if (field) field.setCustomValidity(message);
    if (focus) (field || elements["form-error"]).focus();
  }

  function renderEditor() {
    const topic = selectedTopic();
    const judgment = session.topics[topic.id];
    clearFormErrors();
    elements["editor-heading"].textContent = topic.title;
    elements["topic-context"].replaceChildren(
      node("p", "", topic.applicability),
      node("p", "coverage-context-meta", `Draft topic · ${topic.gapIds.join(", ")} · ${topic.domainIds.map((id) => domains.find((domain) => domain.id === id).name).join("; ")}`),
      node("h3", "", "Official sources for topic context"),
      node("p", "", "These sources give context. They are not verified proof for every check, a compliance determination or professional approval."),
    );
    const sources = node("ul", "coverage-source-links");
    for (const id of topic.sourceIds) {
      const source = sourceIndex.get(id);
      const item = node("li");
      item.append(sourceLink(source), node("small", "coverage-context-meta", `Source consulted: ${source.reviewedOn} · not professional content approval`));
      sources.append(item);
    }
    elements["topic-context"].append(sources);

    elements.applicability.value = judgment.applicability;
    elements.rationale.value = judgment.rationale;
    elements.owner.replaceChildren(option("", "Owner role not assigned"), ...topic.ownerRoles.map((role) => option(role, role)));
    elements.owner.value = judgment.ownerRole;
    elements["critical-gap"].value = judgment.criticalGap;
    elements["next-action"].value = judgment.nextAction;
    const checkNodes = [];
    checkInputs = new Map();
    for (const check of topic.checks) {
      const fieldset = node("fieldset", "coverage-check");
      fieldset.append(node("legend", "", check.phaseId.charAt(0).toUpperCase() + check.phaseId.slice(1)));
      fieldset.append(node("p", "coverage-check-body", check.prompt));
      fieldset.append(node("p", "coverage-check-evidence", `Evidence to examine: ${check.evidence}`));
      fieldset.append(node("p", "coverage-check-action", `Management action: ${check.action}`));
      const label = node("label", "", "Your check judgment");
      const select = node("select");
      select.id = `coverage-check-${check.phaseId}`;
      select.name = check.id;
      select.dataset.checkId = check.id;
      label.htmlFor = select.id;
      select.append(...Object.entries(CHECK_LABELS).map(([value, text]) => option(value, text)));
      select.value = judgment.checks[check.id];
      checkInputs.set(check.id, select);
      fieldset.append(label, select);
      const tools = node("ul", "coverage-tools");
      for (const tool of check.tools) tools.append(node("li", "", `${tool.name}: ${tool.use}`));
      fieldset.append(node("h4", "", "Implementation aids"), tools);
      const entries = node("ul", "coverage-core-links");
      for (const id of check.entryIds) {
        const entry = entryIndex.get(id);
        if (!entry) throw new Error("Missing reviewed core entry.");
        const phaseTitle = entry.phaseId.charAt(0).toUpperCase() + entry.phaseId.slice(1);
        const link = node("a", "", `${phaseTitle} · ${entry.id}: ${entry.text} (opens a new tab)`);
        link.href = `index.html?domain=${encodeURIComponent(entry.domainId)}&phase=${entry.phaseId}&q=${encodeURIComponent(entry.id)}#matrix-explorer`;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        const item = node("li");
        item.append(link);
        entries.append(item);
      }
      fieldset.append(node("h4", "", "Related reviewed core entries"),
        node("p", "coverage-context-meta", "Related entries may span lifecycle phases. These are context links, not verified requirement-to-control mappings."), entries);
      checkNodes.push(fieldset);
    }
    elements.checks.replaceChildren(
      node("p", "", "Check counts include only explicitly applicable topics. Evidence available records your assertion; it has not been independently verified."),
      ...checkNodes,
    );
    updateApplicabilityFields();
  }

  function renderTopics() {
    const focusedId = document.activeElement?.dataset?.topicId;
    const profile = catalogue.profiles.find((item) => item.id === elements.profile.value);
    const recommended = new Set(profile?.topicIds || []);
    const domainId = elements.domain.value;
    const query = elements.search.value.trim().slice(0, 100).toLocaleLowerCase("en");
    const visible = catalogue.topics.filter((topic) => {
      const searchable = [topic.title, topic.applicability, ...topic.ownerRoles, ...topic.checks.flatMap((check) => [
        check.prompt, check.evidence, check.action, ...check.tools.flatMap((tool) => [tool.name, tool.use]),
      ])].join(" ").toLocaleLowerCase("en");
      return (!domainId || topic.domainIds.includes(domainId)) && (!query || searchable.includes(query));
    }).sort((left, right) => Number(recommended.has(right.id)) - Number(recommended.has(left.id)));
    const items = [];
    for (const topic of visible) {
      const button = node("button", "coverage-topic-button");
      button.type = "button";
      button.dataset.topicId = topic.id;
      if (topic.id === selectedTopicId) button.setAttribute("aria-current", "true");
      button.append(node("span", "coverage-topic-title", topic.title));
      button.append(node("span", "coverage-topic-meta", APPLICABILITY_LABELS[session.topics[topic.id].applicability]));
      if (recommended.has(topic.id)) button.append(node("span", "coverage-topic-badge", "Profile suggestion"));
      button.addEventListener("click", () => selectTopic(topic.id));
      const item = node("li");
      item.append(button);
      items.push(item);
    }
    if (visible.length === 0) items.push(node("li", "coverage-empty", "No topics match these catalogue filters. Your judgments remain in the session."));
    elements.topics.replaceChildren(...items);
    elements["topic-count"].textContent = `${visible.length} of ${catalogue.topics.length} topics shown`;
    elements["profile-note"].textContent = profile
      ? `${profile.description} Suggestions appear first. Every topic remains available; the profile makes no applicability decisions.`
      : "Profiles suggest topics to consider first. They never exclude topics or decide what applies to your organization.";
    if (focusedId) {
      const focused = [...elements.topics.querySelectorAll("button")].find((button) => button.dataset.topicId === focusedId);
      focused?.focus();
    }
  }

  function renderSummary() {
    const summary = model.summarize(session, catalogue);
    const metrics = [
      ["Topics in scope", `${summary.applicableTopics} / ${summary.totalTopics}`, `${summary.undeterminedTopics} undetermined; ${summary.notApplicableTopics} excluded with rationale`],
      ["Judgments recorded", `${summary.assessedChecks} / ${summary.applicableChecks}`, `Applicable-topic checks only; ${summary.notAssessedChecks} not assessed. Catalogue: ${summary.totalChecks} checks.`],
      ["Gaps", String(summary.gaps), "User judgments on applicable topics"],
      ["Partial", String(summary.partial), "User judgments on applicable topics"],
      ["Evidence available", String(summary.evidenceAvailable), "User assertion; not independently verified"],
      ["Critical gaps", String(summary.criticalGaps.length), "Includes applicable and unresolved topics"],
    ];
    elements.stats.replaceChildren(...metrics.map(([title, value, note]) => {
      const item = node("div");
      item.append(node("dt", "", title), node("dd", "", value), node("small", "", note));
      return item;
    }));
    elements["report-text"].textContent = model.buildReport(session, catalogue);
  }

  function renderScenarios() {
    elements.scenarios.replaceChildren(...catalogue.scenarios.map((scenario) => {
      const article = node("article", "coverage-scenario");
      article.append(node("h3", "", scenario.title), node("p", "", scenario.prompt),
        node("p", "", `Discussion evidence: ${scenario.expectedEvidence}`));
      article.append(node("p", "coverage-context-meta", `Related topics: ${scenario.topicIds.map((id) => catalogue.topics.find((topic) => topic.id === id).title).join("; ")}`));
      return article;
    }));
  }

  function saveCurrentTopic({ reportValidity = true, announceSuccess = true } = {}) {
    if (!session || !selectedTopicId) return false;
    clearFormErrors();
    updateApplicabilityFields();
    const fieldError = pendingFieldError();
    if (fieldError) {
      showFormError(fieldError[1], fieldError[0], reportValidity);
      return false;
    }
    if (reportValidity && !elements.form.reportValidity()) return false;
    try {
      if (editorIsDirty()) {
        session = model.updateTopic(session, selectedTopicId, pendingPatch(), catalogue);
        edited = true;
      }
      renderTopics();
      renderSummary();
      if (announceSuccess) announce(`Judgments for ${selectedTopic().title} saved in this page's memory.`);
      return true;
    } catch {
      showFormError("The edit could not be validated. Review the fields and try again; earlier saved judgments are unchanged.", null, reportValidity);
      return false;
    }
  }

  function selectTopic(id) {
    if (id === selectedTopicId) {
      elements["editor-heading"].focus();
      return;
    }
    const savedEdits = editorIsDirty();
    if (savedEdits && !saveCurrentTopic({ announceSuccess: false })) return;
    selectedTopicId = id;
    renderEditor();
    renderTopics();
    elements["editor-heading"].focus();
    announce(`${savedEdits ? "Your previous topic's valid edits were saved in memory. " : ""}${selectedTopic().title} selected. Scope and check judgments are editable below.`);
  }

  function clearMemory() {
    session = null;
    catalogue = null;
    model = null;
    selectedTopicId = null;
    edited = false;
    entryIndex.clear();
    sourceIndex.clear();
    checkInputs.clear();
    for (const id of ["rationale", "critical-gap", "next-action", "search", "profile", "domain", "owner", "applicability"]) {
      if (elements[id]) elements[id].value = "";
    }
    for (const id of ["topics", "topic-context", "checks", "stats", "scenarios"]) elements[id]?.replaceChildren();
    for (const id of ["report-text", "topic-count", "editor-heading", "status", "profile-note", "form-error"]) {
      if (elements[id]) elements[id].textContent = "";
    }
    if (elements.app) {
      elements.app.hidden = true;
      delete elements.app.dataset.ready;
    }
    for (const id of ["save", "reset", "print"]) if (elements[id]) elements[id].disabled = true;
    document.body.dataset.coverageState = "pending";
    document.body.classList.remove("coverage-printing");
  }

  function showFailure() {
    clearMemory();
    if (elements.loading) elements.loading.hidden = true;
    const error = elements.error || node("p");
    error.setAttribute("role", "alert");
    error.hidden = false;
    document.body.dataset.coverageState = "error";
    error.textContent = "The coverage preview could not load its complete, validated catalogue. No judgments have been retained. Reload the complete local preview or return to the core matrix.";
    if (!elements.error) document.body.append(error);
  }

  function bootstrap() {
    try {
      if (Object.values(elements).some((element) => !element)) throw new Error("Incomplete interface.");
      const candidateModel = globalThis.CSMCoverage;
      const candidateCatalogue = globalThis.CSMCoverageCatalogue;
      const shards = globalThis.CSMCoverageShards;
      if (!candidateModel || !["validateCatalogue", "createDocument", "validateDocument", "updateTopic", "summarize", "buildReport"].every((key) => typeof candidateModel[key] === "function")) throw new Error("Missing model.");
      if (!shards || ["governance", "safety", "digital"].some((key) => !shards[key])) throw new Error("Missing catalogue shard.");
      if (typeof domains === "undefined" || !Array.isArray(domains) || typeof actorProfiles === "undefined") throw new Error("Missing core content.");
      if (!completeActorPacks(domains, actorProfiles)) throw new Error("Incomplete core actor content.");
      const coreDomains = domains.map((domain) => ({ ...domain, actors: actorProfiles[domain.id] }));
      const validation = candidateModel.validateCatalogue(candidateCatalogue, coreDomains);
      if (!validation?.valid) throw new Error("Invalid catalogue.");
      const candidateSession = candidateModel.createDocument(candidateCatalogue);
      if (!candidateModel.validateDocument(candidateSession, candidateCatalogue).valid) throw new Error("Invalid new session.");
      const candidateEntries = buildCoreIndex(domains, actorProfiles);
      if (candidateEntries.size !== 495) throw new Error("Incomplete reviewed core entries.");
      for (const topic of candidateCatalogue.topics) {
        for (const check of topic.checks) {
          if (check.entryIds.some((id) => !candidateEntries.has(id))) throw new Error("Invalid core mapping.");
        }
      }
      catalogue = candidateCatalogue;
      model = candidateModel;
      session = candidateSession;
      entryIndex = candidateEntries;
      sourceIndex = new Map(catalogue.sources.map((source) => [source.id, source]));
      selectedTopicId = catalogue.topics[0].id;
      edited = false;
      elements.profile.replaceChildren(option("", "All topics — no profile"), ...catalogue.profiles.map((profile) => option(profile.id, profile.title)));
      elements.domain.replaceChildren(option("", "All core domains"), ...domains.map((domain) => option(domain.id, domain.name)));
      elements.profile.value = "";
      elements.domain.value = "";
      elements.search.value = "";
      elements.search.maxLength = 100;
      elements.rationale.maxLength = 300;
      elements["critical-gap"].maxLength = 500;
      elements["next-action"].maxLength = 500;
      elements["form-error"].tabIndex = -1;
      renderEditor();
      renderTopics();
      renderSummary();
      renderScenarios();
      elements.error.hidden = true;
      elements.loading.hidden = true;
      for (const id of ["save", "reset", "print"]) elements[id].disabled = false;
      elements.app.dataset.ready = "true";
      elements.app.hidden = false;
      document.body.dataset.coverageState = "ready";
      announce("Draft coverage workspace ready. Every topic starts with undetermined scope and no check judgments. Answers stay in this page's memory.");
    } catch {
      showFailure();
    }
  }

  function preparePrint() {
    if (!session) return;
    const validEdits = saveCurrentTopic({ reportValidity: false, announceSuccess: false });
    if (!validEdits) elements["report-text"].textContent = "DRAFT — UNSAVED INVALID EDITS ARE NOT INCLUDED. The report below contains only earlier saved judgments.\n\n" + model.buildReport(session, catalogue);
    document.body.classList.add("coverage-printing");
    const details = elements.report.querySelector("details");
    if (details && printDetailsOpen === null) {
      printDetailsOpen = details.open;
      details.open = true;
    }
  }

  function finishPrint() {
    document.body.classList.remove("coverage-printing");
    const details = elements.report?.querySelector("details");
    if (details && printDetailsOpen !== null) details.open = printDetailsOpen;
    printDetailsOpen = null;
  }

  if (Object.values(elements).every(Boolean)) {
    elements.form.addEventListener("submit", (event) => { event.preventDefault(); saveCurrentTopic(); });
    elements.form.addEventListener("input", () => {
      if (session) {
        clearFormErrors();
        announce("Unsaved topic edits are in memory. Save topic judgments to update the report.");
      }
    });
    elements.applicability.addEventListener("change", updateApplicabilityFields);
    for (const id of ["profile", "domain", "search"]) {
      elements[id].addEventListener(id === "search" ? "input" : "change", () => {
        if (!session) return;
        renderTopics();
        announce(`${elements["topic-count"].textContent}. Catalogue filters do not change your applicability decisions.`);
      });
    }
    elements.reset.addEventListener("click", () => {
      if (!session) return;
      if ((edited || editorIsDirty()) && !window.confirm("Clear every topic judgment, scope rationale, gap and action from this session? This cannot be undone.")) return;
      clearMemory();
      bootstrap();
      elements["editor-heading"].focus();
      announce("Session cleared. Every topic has undetermined scope and no check judgments.");
    });
    elements.print.addEventListener("click", () => {
      if (!saveCurrentTopic({ announceSuccess: false })) return;
      announce("The draft report contains unencrypted organization judgments. Only print or save it to a destination you control.");
      preparePrint();
      try { window.print(); }
      catch { announce("Printing is unavailable. Your saved draft report and judgments remain in this page's memory."); }
      finally { finishPrint(); }
    });
  }
  window.addEventListener("pagehide", () => { finishPrint(); clearMemory(); });
  window.addEventListener("pageshow", (event) => { if (event.persisted) bootstrap(); });
  window.addEventListener("beforeprint", preparePrint);
  window.addEventListener("afterprint", finishPrint);
  window.matchMedia?.("print")?.addEventListener?.("change", (event) => { if (!event.matches) finishPrint(); });
  bootstrap();
})();
