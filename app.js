const validViews = new Set(["all", "actors", "risks", "mitigations"]);
const internationalSourceOrgs = new Set([
  "IFC",
  "IFRC",
  "ILO",
  "ISO",
  "OECD",
  "UNDRR",
  "UNGC",
  "UNODC",
  "WHO",
  "World Bank"
]);
const phaseCodes = {
  identify: "I",
  protect: "P",
  detect: "D",
  respond: "R",
  recover: "RC"
};
const kindCodes = {
  actors: "A",
  risks: "R",
  mitigations: "M"
};
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const urlState = new URLSearchParams(window.location.search);
const requestedDomain = urlState.get("domain");
const requestedView = urlState.get("view");

const state = {
  activeDomain: domains.some((domain) => domain.id === requestedDomain) ? requestedDomain : domains[0].id,
  view: validViews.has(requestedView) ? requestedView : "all",
  query: (urlState.get("q") ?? "").trim()
};

const page = document.body;
const matrixGrid = document.getElementById("matrixGrid");
const referenceGrid = document.getElementById("referenceGrid");
const resultCount = document.getElementById("resultCount");
const domainFilters = document.getElementById("domainFilters");
const activeDomainPanel = document.getElementById("activeDomain");
const viewButtons = [...document.querySelectorAll("[data-view-mode]")];
const searchInput = document.getElementById("matrixSearch");
const clearSearchButton = document.getElementById("clearSearch");
const emptyState = document.getElementById("emptyState");
const copyLinkButton = document.getElementById("copyLink");
const copyStatus = document.getElementById("copyStatus");

function createElement(tag, className = "", text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined && text !== null) element.textContent = text;
  return element;
}

function normalize(value) {
  return value.toLocaleLowerCase("en").normalize("NFKD");
}

function matchesQuery(...values) {
  if (!state.query) return true;
  const query = normalize(state.query);
  return values.some((value) => normalize(value ?? "").includes(query));
}

function getActiveDomain() {
  return domains.find((domain) => domain.id === state.activeDomain) ?? domains[0];
}

function getVisibleKinds() {
  return state.view === "all" ? new Set(["actors", "risks", "mitigations"]) : new Set([state.view]);
}

function getSourceScope(org) {
  if (internationalSourceOrgs.has(org)) return "International";
  if (org === "ENISA") return "European Union";
  return "United States guidance";
}

function syncUrl({ push = false } = {}) {
  const params = new URLSearchParams();
  if (state.activeDomain !== domains[0].id) params.set("domain", state.activeDomain);
  if (state.view !== "all") params.set("view", state.view);
  if (state.query) params.set("q", state.query);
  const queryString = params.toString();
  const nextUrl = `${window.location.pathname}${queryString ? `?${queryString}` : ""}${window.location.hash}`;
  window.history[push ? "pushState" : "replaceState"](null, "", nextUrl);
}

function revealActiveDomainTab(behavior = "auto") {
  const activeTab = domainFilters.querySelector(`[data-domain-id="${state.activeDomain}"]`);
  if (!activeTab || domainFilters.scrollWidth <= domainFilters.clientWidth) return;
  const left = activeTab.offsetLeft - (domainFilters.clientWidth - activeTab.offsetWidth) / 2;
  domainFilters.scrollTo({ left: Math.max(0, left), behavior });
}

function setActiveDomain(domainId, { focus = false, sync = true } = {}) {
  if (!domains.some((domain) => domain.id === domainId)) return;

  state.activeDomain = domainId;
  renderFilters();
  renderActiveDomain();
  renderMatrix();
  renderReferences();
  if (sync) syncUrl({ push: true });

  const activeTab = domainFilters.querySelector(`[data-domain-id="${domainId}"]`);
  revealActiveDomainTab(prefersReducedMotion.matches ? "auto" : "smooth");
  if (focus) activeTab?.focus();
}

function renderFilters() {
  domainFilters.replaceChildren();

  domains.forEach((domain, index) => {
    const button = createElement("button", "chip");
    const number = createElement("span", "chip__number", String(index + 1).padStart(2, "0"));
    const label = createElement("span", "chip__label", domain.name);
    const isActive = domain.id === state.activeDomain;

    button.type = "button";
    button.dataset.domainId = domain.id;
    button.id = `tab-${domain.id}`;
    button.setAttribute("role", "tab");
    button.setAttribute("aria-controls", "matrixGrid");
    button.setAttribute("aria-selected", String(isActive));
    button.tabIndex = isActive ? 0 : -1;
    button.classList.toggle("is-active", isActive);
    button.append(number, label);

    button.addEventListener("click", () => setActiveDomain(domain.id, { focus: document.activeElement === button }));
    button.addEventListener("keydown", (event) => {
      let nextIndex = index;
      if (event.key === "ArrowRight" || event.key === "ArrowDown") nextIndex = (index + 1) % domains.length;
      else if (event.key === "ArrowLeft" || event.key === "ArrowUp") nextIndex = (index - 1 + domains.length) % domains.length;
      else if (event.key === "Home") nextIndex = 0;
      else if (event.key === "End") nextIndex = domains.length - 1;
      else return;

      event.preventDefault();
      setActiveDomain(domains[nextIndex].id, { focus: true });
    });

    domainFilters.append(button);
  });
}

function createDetailCard(title, items) {
  const card = createElement("section", "domain-brief");
  const heading = createElement("h4", "domain-brief__title", title);
  const list = createElement("ul", "domain-brief__list");
  items.forEach((item) => list.append(createElement("li", "", item)));
  card.append(heading, list);
  return card;
}

function renderActiveDomain() {
  const domain = getActiveDomain();
  const profile = domain.profile ?? {};
  const references = referencesByDomain[domain.id] ?? [];
  const header = createElement("div", "active-domain__header");
  const headingGroup = createElement("div");
  const label = createElement("p", "section-label", "Active domain");
  const title = createElement("h3", "domain-name", domain.name);
  const mission = createElement("p", "active-domain__lead", profile.mission ?? domain.focus);
  const sourceContext = createElement("p", "active-domain__context", domain.sourceContext);
  const meta = createElement("div", "active-domain__meta");

  meta.append(
    createElement("span", "", `${phases.length} lifecycle phases`),
    createElement("span", "", `${references.length} primary sources`),
    createElement("span", "", "3 decision layers")
  );
  headingGroup.append(label, title, mission, sourceContext, meta);
  header.append(headingGroup);

  const details = createElement("details", "domain-details");
  const summary = createElement("summary", "", "Domain briefing and leadership questions");
  const briefGrid = createElement("div", "domain-brief-grid");

  if (profile.protects) {
    briefGrid.append(
      createDetailCard("What this protects", profile.protects),
      createDetailCard("Accountable owners", profile.owners),
      createDetailCard("Failure starts when", profile.failureModes),
      createDetailCard("Leadership questions", profile.assuranceQuestions)
    );
  }

  details.append(summary, briefGrid);
  activeDomainPanel.replaceChildren(header, details);
}

function createReferenceCard(domain) {
  const references = referencesByDomain[domain.id] ?? [];
  const card = createElement("article", "reference-card");
  const header = createElement("div", "reference-card__header");
  const copy = createElement("div");
  const label = createElement("p", "section-label", "Active source pack");
  const title = createElement("h3", "domain-name", domain.name);
  const context = createElement("p", "reference-context", domain.sourceContext);
  const count = createElement("span", "reference-count", `${references.length} sources`);
  const list = createElement("ol", "source-list");

  copy.append(label, title, context);
  header.append(copy, count);

  references.forEach((reference) => {
    const item = createElement("li");
    const number = createElement("span", "source-number", String(list.children.length + 1).padStart(2, "0"));
    const content = createElement("div");
    const topline = createElement("div", "source-topline");
    const org = createElement("span", "source-org", reference.org);
    const type = createElement("span", "source-type", reference.type);
    const scope = createElement("span", "source-scope", getSourceScope(reference.org));
    const link = createElement("a", "source-link", reference.title);
    const note = createElement("p", "source-note", reference.note);

    link.href = reference.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.append(createElement("span", "source-arrow", "↗"));
    link.append(createElement("span", "sr-only", " (opens in a new tab)"));
    topline.append(org, type, scope);
    content.append(topline, link, note);
    item.append(number, content);
    list.append(item);
  });

  card.append(header, list);
  return card;
}

function createMatrixTile(kind, label, text, code) {
  const tile = createElement("li", `matrix-tile matrix-tile--${kind}`);
  const topline = createElement("div", "matrix-tile__topline");
  const tileLabel = createElement("p", "matrix-tile__label", label);
  const tileCode = createElement("span", "matrix-tile__code", code);

  topline.append(tileLabel, tileCode);
  tile.id = code.toLocaleLowerCase("en");
  tile.dataset.kind = kind;
  tile.append(
    topline,
    createElement("p", "matrix-tile__text", text)
  );
  return tile;
}

function createPhaseDetailCard(domain, phase) {
  const cellData = domain.cells[phase.id];
  const actors = domain.actors?.[phase.id] ?? [];
  const card = createElement("article", "phase-detail");
  const header = createElement("header", "phase-detail__header");
  const phaseNumber = String(phases.findIndex((item) => item.id === phase.id) + 1).padStart(2, "0");
  const domainNumber = String(domains.findIndex((item) => item.id === domain.id) + 1).padStart(2, "0");
  const phaseCode = phaseCodes[phase.id];
  const kicker = createElement("p", "phase-kicker", `${phaseNumber} / ${String(phases.length).padStart(2, "0")}`);
  const title = createElement("h3", "phase-title", phase.title);
  const summary = createElement("p", "phase-summary", domain.phaseFraming?.[phase.id] ?? phase.summary);
  const stack = createElement("ul", "phase-stack");
  const visibleKinds = getVisibleKinds();

  const entries = [
    ...actors.map((text, index) => ({ kind: "actors", label: "Actor or failure source", text, index })),
    ...cellData.threats.map((text, index) => ({ kind: "risks", label: "Detailed risk", text, index })),
    ...cellData.controls.map((text, index) => ({ kind: "mitigations", label: "Mitigation", text, index }))
  ].filter((entry) => visibleKinds.has(entry.kind) && matchesQuery(entry.label, entry.text, phase.title, domain.name));

  entries.forEach((entry) => {
    const entryNumber = String(entry.index + 1).padStart(2, "0");
    const code = `CSM-D${domainNumber}-${phaseCode}-${kindCodes[entry.kind]}${entryNumber}`;
    stack.append(createMatrixTile(entry.kind, entry.label, entry.text, code));
  });
  if (!entries.length) stack.append(createElement("li", "phase-empty", "No matching entries in this phase."));

  const counts = createElement("p", "phase-detail__meta", `${entries.length} ${entries.length === 1 ? "entry" : "entries"}`);
  header.append(kicker, title, summary, counts);
  card.append(header, stack);
  card.dataset.entryCount = String(entries.length);
  return card;
}

function renderMatrix() {
  const domain = getActiveDomain();
  const cards = phases.map((phase) => createPhaseDetailCard(domain, phase));
  const entryCount = cards.reduce((total, card) => total + Number(card.dataset.entryCount), 0);

  matrixGrid.replaceChildren(...cards);
  matrixGrid.setAttribute("aria-labelledby", `tab-${domain.id}`);
  emptyState.hidden = entryCount !== 0;
  matrixGrid.hidden = entryCount === 0;

  const layerLabel = state.view === "all" ? "all decision layers" : state.view === "actors" ? "actors and failure sources" : state.view;
  const searchLabel = state.query ? ` matching “${state.query}”` : "";
  resultCount.textContent = `${entryCount} ${entryCount === 1 ? "entry" : "entries"}${searchLabel} · ${layerLabel} · ${domain.name}`;
}

function renderReferences() {
  referenceGrid.replaceChildren(createReferenceCard(getActiveDomain()));
}

function setView(view, { focus = false, sync = true } = {}) {
  if (!validViews.has(view)) return;
  state.view = view;
  page.dataset.view = view;

  viewButtons.forEach((button) => {
    const isActive = button.dataset.viewMode === view;
    button.setAttribute("aria-checked", String(isActive));
    button.tabIndex = isActive ? 0 : -1;
    button.classList.toggle("is-active", isActive);
    if (focus && isActive) button.focus();
  });

  renderMatrix();
  if (sync) syncUrl({ push: true });
}

function updateSearch(value) {
  state.query = value.trim();
  clearSearchButton.hidden = !state.query;
  renderMatrix();
  syncUrl();
}

async function copyCurrentView() {
  const url = window.location.href;
  try {
    await navigator.clipboard.writeText(url);
    copyStatus.textContent = "Link copied to clipboard.";
    copyLinkButton.textContent = "Copied";
  } catch {
    copyStatus.textContent = "Copy failed. Select the address from your browser.";
    copyLinkButton.textContent = "Copy unavailable";
  }

  window.setTimeout(() => {
    copyLinkButton.textContent = "Copy this view";
  }, 1800);
}

viewButtons.forEach((button, index) => {
  button.addEventListener("click", () => setView(button.dataset.viewMode));
  button.addEventListener("keydown", (event) => {
    let nextIndex = index;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") nextIndex = (index + 1) % viewButtons.length;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") nextIndex = (index - 1 + viewButtons.length) % viewButtons.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = viewButtons.length - 1;
    else return;

    event.preventDefault();
    setView(viewButtons[nextIndex].dataset.viewMode, { focus: true });
  });
});

searchInput.value = state.query;
clearSearchButton.hidden = !state.query;
searchInput.addEventListener("input", (event) => updateSearch(event.target.value));
clearSearchButton.addEventListener("click", () => {
  searchInput.value = "";
  updateSearch("");
  searchInput.focus();
});
copyLinkButton.addEventListener("click", copyCurrentView);

window.addEventListener("popstate", () => {
  const params = new URLSearchParams(window.location.search);
  const domain = params.get("domain");
  const view = params.get("view");

  state.activeDomain = domains.some((item) => item.id === domain) ? domain : domains[0].id;
  state.view = validViews.has(view) ? view : "all";
  state.query = (params.get("q") ?? "").trim();
  searchInput.value = state.query;
  clearSearchButton.hidden = !state.query;

  renderFilters();
  window.requestAnimationFrame(() => revealActiveDomainTab());
  renderActiveDomain();
  renderReferences();
  setView(state.view, { sync: false });
});

renderFilters();
window.requestAnimationFrame(() => revealActiveDomainTab());
renderActiveDomain();
renderReferences();
setView(state.view, { sync: false });
