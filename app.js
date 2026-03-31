const state = {
  activeDomain: domains[0].id,
  view: "all"
};

const page = document.querySelector(".page");
const matrixGrid = document.getElementById("matrixGrid");
const referenceGrid = document.getElementById("referenceGrid");
const resultCount = document.getElementById("resultCount");
const domainFilters = document.getElementById("domainFilters");
const activeDomainPanel = document.getElementById("activeDomain");
const viewButtons = document.querySelectorAll("[data-view-mode]");

function createElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) {
    element.className = className;
  }
  if (text) {
    element.textContent = text;
  }
  return element;
}

function getActiveDomain() {
  return domains.find((domain) => domain.id === state.activeDomain) ?? domains[0];
}

function setActiveDomain(domainId, { focus = false } = {}) {
  if (!domains.some((domain) => domain.id === domainId)) {
    return;
  }

  state.activeDomain = domainId;
  renderFilters();
  renderMatrix();
  renderReferences();

  if (focus) {
    const activeTab = domainFilters.querySelector(`[data-domain-id="${domainId}"]`);
    activeTab?.focus();
  }
}

function renderFilters() {
  domainFilters.replaceChildren();

  domains.forEach((domain) => {
    const button = createElement("button", "chip", domain.name);
    button.type = "button";
    button.dataset.domainId = domain.id;
    button.id = `tab-${domain.id}`;
    button.setAttribute("role", "tab");
    button.setAttribute("aria-controls", "matrixGrid");
    button.setAttribute("aria-selected", String(domain.id === state.activeDomain));
    button.tabIndex = domain.id === state.activeDomain ? 0 : -1;

    if (domain.id === state.activeDomain) {
      button.classList.add("is-active");
    }

    button.addEventListener("click", () => {
      setActiveDomain(domain.id);
    });

    button.addEventListener("keydown", (event) => {
      const currentIndex = domains.findIndex((item) => item.id === domain.id);
      let nextIndex = currentIndex;

      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        nextIndex = (currentIndex + 1) % domains.length;
      } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        nextIndex = (currentIndex - 1 + domains.length) % domains.length;
      } else if (event.key === "Home") {
        nextIndex = 0;
      } else if (event.key === "End") {
        nextIndex = domains.length - 1;
      } else if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        setActiveDomain(domain.id, { focus: true });
        return;
      } else {
        return;
      }

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

  items.forEach((item) => {
    const listItem = createElement("li", "", item);
    list.append(listItem);
  });

  card.append(heading, list);
  return card;
}

function createActiveDomainPanel(domain) {
  const references = referencesByDomain[domain.id] ?? [];
  const profile = domain.profile ?? {};
  const label = createElement("p", "section-label", "Active matrix");
  const title = createElement("h3", "domain-name", domain.name);
  const mission = createElement("p", "active-domain__lead", profile.mission);
  const focus = createElement("p", "domain-focus", domain.focus);
  const sourceContext = createElement("p", "phase-summary", domain.sourceContext);
  const meta = createElement("div", "active-domain__meta");
  const briefGrid = createElement("div", "domain-brief-grid");
  const lifecycle = createElement("span", "", `${phases.length} lifecycle columns`);
  const sources = createElement("span", "", `${references.length} official sources`);
  const structure = createElement("span", "", "ATT&CK-style stacked entries in every column");
  const anchor = createElement("a", "domain-ref", "Jump to source pack");

  anchor.href = "#references";

  if (profile.protects) {
    briefGrid.append(
      createDetailCard("What This Domain Protects", profile.protects),
      createDetailCard("Likely Owners", profile.owners),
      createDetailCard("Failure Starts When", profile.failureModes),
      createDetailCard("Leadership Questions", profile.assuranceQuestions)
    );
  }

  meta.append(lifecycle, sources, structure);
  activeDomainPanel.replaceChildren(label, title, mission, focus, sourceContext, meta, briefGrid, anchor);
}

function createReferenceCard(domain) {
  const references = referencesByDomain[domain.id] ?? [];
  const card = createElement("article", "reference-card");
  card.id = `ref-${domain.id}`;

  const meta = createElement("div", "reference-card__meta");
  const metaCopy = createElement("div");
  const title = createElement("h3", "domain-name", domain.name);
  const focus = createElement("p", "domain-focus", domain.focus);
  const sourceContext = createElement("p", "reference-context", domain.sourceContext);
  const count = createElement(
    "span",
    "reference-count",
    `${references.length} source${references.length === 1 ? "" : "s"}`
  );

  metaCopy.append(title, focus, sourceContext);
  meta.append(metaCopy, count);

  const list = createElement("ul", "source-list");

  references.forEach((reference) => {
    const item = createElement("li");
    const topline = createElement("div", "source-topline");
    const org = createElement("span", "source-org", reference.org);
    const type = createElement("span", "source-type", reference.type);
    const link = createElement("a", "source-link", reference.title);
    const note = createElement("p", "source-note", reference.note);

    link.href = reference.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";

    topline.append(org, type);
    item.append(topline, link, note);
    list.append(item);
  });

  card.append(meta, list);
  return card;
}

function createMatrixTile(kind, label, text) {
  const tile = createElement("article", `matrix-tile matrix-tile--${kind}`);
  const tileLabel = createElement("p", "matrix-tile__label", label);
  const tileText = createElement("p", "matrix-tile__text", text);

  tile.dataset.kind = kind;
  tile.append(tileLabel, tileText);

  return tile;
}

function createPhaseDetailCard(domain, phase) {
  const cellData = domain.cells[phase.id];
  const actors = domain.actors?.[phase.id] ?? [];
  const card = createElement("article", "phase-detail");
  const header = createElement("div", "phase-detail__header");
  const kicker = createElement("p", "phase-kicker", "Lifecycle column");
  const title = createElement("h3", "phase-title", phase.title);
  const summary = createElement("p", "phase-summary", domain.phaseFraming?.[phase.id] ?? phase.summary);
  const counts = createElement(
    "p",
    "phase-detail__meta",
    `${actors.length} actors • ${cellData.threats.length} risks • ${cellData.controls.length} mitigations`
  );
  const stack = createElement("div", "phase-stack");

  actors.forEach((item) => {
    stack.append(createMatrixTile("actors", "Possible actor", item));
  });

  cellData.threats.forEach((item) => {
    stack.append(createMatrixTile("risks", "Detailed risk", item));
  });

  cellData.controls.forEach((item) => {
    stack.append(createMatrixTile("mitigations", "Mitigation", item));
  });

  header.append(kicker, title, summary, counts);
  card.append(header, stack);

  return card;
}

function renderMatrix() {
  const domain = getActiveDomain();
  const references = referencesByDomain[domain.id] ?? [];
  const entryCount = phases.reduce((total, phase) => {
    const cellData = domain.cells[phase.id];
    const actors = domain.actors?.[phase.id] ?? [];

    return total + actors.length + cellData.threats.length + cellData.controls.length;
  }, 0);

  createActiveDomainPanel(domain);
  matrixGrid.replaceChildren(...phases.map((phase) => createPhaseDetailCard(domain, phase)));
  resultCount.textContent = `Showing ${entryCount} ATT&CK-style entries across ${phases.length} lifecycle columns for ${domain.name}.`;
}

function renderReferences() {
  referenceGrid.replaceChildren();
  referenceGrid.append(createReferenceCard(getActiveDomain()));
}

function setView(view) {
  state.view = view;
  page.dataset.view = view;

  viewButtons.forEach((button) => {
    const isActive = button.dataset.viewMode === view;
    button.setAttribute("role", "radio");
    button.setAttribute("aria-checked", String(isActive));
    button.classList.toggle("is-active", isActive);
  });
}

viewButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setView(button.dataset.viewMode);
  });
});

setView(state.view);
renderFilters();
renderMatrix();
renderReferences();
