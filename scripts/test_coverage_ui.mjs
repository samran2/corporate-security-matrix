import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";

const root = new URL("../", import.meta.url);
const read = (file) => fs.readFileSync(new URL(file, root), "utf8");
const html = read("coverage.html");
const source = read("coverage.js");
const css = read("coverage.css");
const sharedCss = read("styles.css");
const bundleFiles = [
  "matrix-domains.js",
  "matrix-actors.js",
  "matrix-coverage-governance.js",
  "matrix-coverage-safety.js",
  "matrix-coverage-digital.js",
  "matrix-coverage.js",
  "coverage-model.js",
  "coverage.js",
];

function attributes(text) {
  const result = {};
  for (const match of text.matchAll(/([\w:-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) {
    result[match[1]] = match[2] ?? match[3] ?? match[4] ?? "";
  }
  return result;
}

// This deliberately small DOM runs the real renderer. HTML-writing sinks throw,
// and privacy APIs record use, so a fixture cannot silently permit either leak.
class Element {
  constructor(tag, document) {
    this.tagName = tag.toUpperCase();
    this.ownerDocument = document;
    this.attributes = {};
    this.dataset = new Proxy({}, {
      set: (target, name, value) => {
        target[name] = String(value);
        this.attributes[`data-${String(name).replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`] = String(value);
        return true;
      },
    });
    this.children = [];
    this.listeners = new Map();
    this.hidden = false;
    this.disabled = false;
    this.required = false;
    this._text = "";
    this.classList = {
      add: (...names) => { this.className = [...new Set([...this.className.split(/\s+/), ...names])].filter(Boolean).join(" "); },
      remove: (...names) => { this.className = this.className.split(/\s+/).filter((name) => !names.includes(name)).join(" "); },
      contains: (name) => this.className.split(/\s+/).includes(name),
      toggle: (name, force) => {
        const enabled = force ?? !this.classList.contains(name);
        this.classList[enabled ? "add" : "remove"](name);
        return enabled;
      },
    };
  }
  get id() { return this.attributes.id || ""; }
  set id(value) { this.attributes.id = String(value); }
  get className() { return this.attributes.class || ""; }
  set className(value) { this.attributes.class = String(value); }
  get htmlFor() { return this.attributes.for || ""; }
  set htmlFor(value) { this.attributes.for = String(value); }
  get textContent() { return this._text + this.children.map((child) => child.textContent).join(""); }
  set textContent(value) { this._text = String(value ?? ""); this.children = []; }
  get value() {
    if (this._value !== undefined) return this._value;
    if (this.tagName === "SELECT") return this.options.find((child) => child.selected)?.value ?? this.options[0]?.value ?? "";
    if (this.tagName === "OPTION") return this.attributes.value ?? this.textContent;
    return this.attributes.value || "";
  }
  set value(value) { this._value = String(value); }
  get options() { return this.children.filter((child) => child.tagName === "OPTION"); }
  get elements() { return this.querySelectorAll("input,select,textarea,button"); }
  get innerHTML() { throw new Error("Coverage UI must use safe text and native form fields."); }
  set innerHTML(_value) { throw new Error("Coverage UI must use safe text and native form fields."); }
  set outerHTML(_value) { throw new Error("Coverage UI must use safe text and native form fields."); }
  insertAdjacentHTML() { throw new Error("Coverage UI must use safe text and native form fields."); }
  setAttribute(name, value) {
    this.attributes[name] = String(value);
    if (name.startsWith("data-")) this.dataset[name.slice(5).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())] = String(value);
    if (["hidden", "disabled", "required"].includes(name)) this[name] = true;
    if (name === "maxlength") this.maxLength = Number(value);
  }
  getAttribute(name) { return Object.hasOwn(this.attributes, name) ? this.attributes[name] : null; }
  removeAttribute(name) { delete this.attributes[name]; if (["hidden", "disabled", "required"].includes(name)) this[name] = false; }
  append(...nodes) {
    for (const node of nodes) {
      const child = typeof node === "string" ? this.ownerDocument.createTextNode(node) : node;
      if (child.tagName === "#FRAGMENT") { this.append(...child.children); continue; }
      child.parentElement = this;
      this.children.push(child);
    }
  }
  appendChild(node) { this.append(node); return node; }
  replaceChildren(...nodes) { this._text = ""; this.children = []; this.append(...nodes); }
  remove() { if (this.parentElement) this.parentElement.children = this.parentElement.children.filter((child) => child !== this); }
  matches(selector) {
    const match = selector.trim().match(/^([\w-]+)?(?:#([\w-]+))?(?:\.([\w-]+))?(?:\[([\w-]+)(?:=["']?([^\]"']*)["']?)?\])?$/);
    if (!match) throw new Error(`Unsupported fixture selector: ${selector}`);
    return (!match[1] || this.tagName === match[1].toUpperCase()) &&
      (!match[2] || this.id === match[2]) && (!match[3] || this.classList.contains(match[3])) &&
      (!match[4] || this.getAttribute(match[4]) !== null && (match[5] === undefined || this.getAttribute(match[4]) === match[5]));
  }
  querySelectorAll(selector) {
    const selectors = selector.split(",");
    const result = [];
    const visit = (node) => { for (const child of node.children) { if (selectors.some((item) => child.matches(item))) result.push(child); visit(child); } };
    visit(this);
    return result;
  }
  querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
  closest(selector) { return this.matches(selector) ? this : this.parentElement?.closest(selector) || null; }
  addEventListener(name, handler) { if (!this.listeners.has(name)) this.listeners.set(name, []); this.listeners.get(name).push(handler); }
  dispatch(name, additions = {}) {
    const event = { type: name, target: this, currentTarget: this, defaultPrevented: false, preventDefault() { this.defaultPrevented = true; }, ...additions };
    for (const handler of this.listeners.get(name) || []) handler.call(this, event);
    return event;
  }
  click() { if (!this.disabled) this.dispatch("click"); }
  focus() { this.ownerDocument.activeElement = this; }
  setCustomValidity(message) { this.validationMessage = message; }
  checkValidity() {
    if (this.tagName === "FORM") return this.elements.every((control) => control.disabled || control.checkValidity());
    return !this.validationMessage && (!this.required || this.value.trim().length > 0);
  }
  reportValidity() { return this.checkValidity(); }
}

function fixtureDocument() {
  const document = new Element("document", null);
  document.ownerDocument = document;
  document.createElement = (tag) => new Element(tag, document);
  document.createDocumentFragment = () => new Element("#fragment", document);
  document.createTextNode = (text) => { const node = new Element("#text", document); node.textContent = text; return node; };
  document.getElementById = (id) => document.querySelectorAll(`[id="${id}"]`)[0] || null;
  document.readyState = "complete";
  const stack = [document];
  const voidTags = new Set(["meta", "link", "input", "br", "hr", "img"]);
  for (const token of html.matchAll(/<!--[\s\S]*?-->|<![^>]*>|<\/?[\w-]+\b[^>]*>|[^<]+/g)) {
    const text = token[0];
    if (text.startsWith("<!")) continue;
    if (text.startsWith("</")) { stack.pop(); continue; }
    if (text.startsWith("<")) {
      const tag = text.match(/^<([\w-]+)/)[1];
      const node = document.createElement(tag);
      for (const [name, value] of Object.entries(attributes(text.slice(tag.length + 1, -1)))) node.setAttribute(name, value);
      stack.at(-1).append(node);
      if (!voidTags.has(tag) && !text.endsWith("/>")) stack.push(node);
    } else stack.at(-1).append(document.createTextNode(text));
  }
  document.body = document.querySelector("body");
  document.documentElement = document.querySelector("html");
  return document;
}

function runtime({ omit = [], beforeCatalogue = "", beforeUi = "", printError = false } = {}) {
  const document = fixtureDocument();
  const events = new Map();
  const privacyCalls = [];
  const printSnapshots = [];
  let prints = 0;
  const forbidden = (name) => (..._args) => { privacyCalls.push(name); throw new Error(`Coverage session must not use ${name}.`); };
  Object.defineProperty(document, "cookie", { get: forbidden("document.cookie"), set: forbidden("document.cookie") });
  const context = {
    URL, URLSearchParams, document, console: { log() {}, warn() {}, error() {} },
    location: new Proxy({ href: "https://preview.invalid/coverage.html?answer=private#private", search: "?answer=private", hash: "#private" }, {
      set(_target, key) { forbidden(`location.${String(key)}`)(); },
    }),
    history: { pushState: forbidden("history.pushState"), replaceState: forbidden("history.replaceState") },
    fetch: forbidden("fetch"), XMLHttpRequest: forbidden("XMLHttpRequest"), WebSocket: forbidden("WebSocket"),
    localStorage: new Proxy({}, { get: () => forbidden("localStorage") }),
    sessionStorage: new Proxy({}, { get: () => forbidden("sessionStorage") }),
    indexedDB: new Proxy({}, { get: () => forbidden("indexedDB") }),
    navigator: { sendBeacon: forbidden("sendBeacon"), serviceWorker: { register: forbidden("serviceWorker") } },
    addEventListener(name, handler) { if (!events.has(name)) events.set(name, []); events.get(name).push(handler); },
    print() {
      prints += 1;
      printSnapshots.push({ report: document.getElementById("coverage-report-text").textContent, className: document.body.className });
      if (printError) throw new Error("Print unavailable.");
    },
    confirm: () => true,
    setTimeout: (handler) => { handler(); return 1; }, clearTimeout() {},
    matchMedia: () => ({ matches: true, addEventListener() {}, removeEventListener() {} }),
  };
  context.window = context;
  vm.createContext(context);
  for (const file of bundleFiles) {
    if (file === "matrix-coverage.js" && beforeCatalogue) vm.runInContext(beforeCatalogue, context);
    if (file === "coverage.js" && beforeUi) vm.runInContext(beforeUi, context);
    if (!omit.includes(file)) vm.runInContext(read(file), context, { filename: file, timeout: 5_000 });
  }
  document.dispatch("DOMContentLoaded");
  return {
    document, context, privacyCalls, printSnapshots, get prints() { return prints; },
    byId: (id) => document.getElementById(id),
    emit(name, detail = {}) { for (const handler of events.get(name) || []) handler({ type: name, ...detail }); },
  };
}

function assertClosed(app) {
  assert.equal(app.byId("coverage-app").hidden, true);
  assert.equal(app.byId("coverage-error").hidden, false);
  assert.equal(app.byId("coverage-error").getAttribute("role"), "alert");
  assert(app.byId("coverage-error").textContent.trim());
  assert.equal(app.byId("coverage-topics").querySelectorAll("button").length, 0);
  assert.equal(app.byId("coverage-checks").querySelectorAll("select").length, 0);
  assert.equal(app.byId("coverage-report-text").textContent, "");
  for (const id of ["coverage-save", "coverage-reset", "coverage-print"]) assert.equal(app.byId(id).disabled, true, id);
}

function save(app, patch) {
  for (const [id, value] of Object.entries(patch)) app.byId(id).value = value;
  app.byId("coverage-form").dispatch("submit");
}

test("preview loads only its local, ordered bundled scripts", () => {
  const scripts = [...html.matchAll(/<script\b([^>]*)>/g)].map((match) => attributes(match[1]).src);
  assert.deepEqual(scripts, bundleFiles);
  assert(!/<script\b[^>]*src=["'](?:https?:|\/\/)/i.test(html));
  assert.match(html, /keeps your judgments in memory/i);
  assert.match(html, /current tab only/i);
  assert.match(html, /unencrypted/i);
  assert.match(html, /draft/i);
});

test("canonical startup reveals all topics and blank assessments only after complete validation", () => {
  const app = runtime();
  assert.equal(app.byId("coverage-app").hidden, false);
  assert.equal(app.byId("coverage-error").hidden, true);
  assert.equal(app.byId("coverage-topics").querySelectorAll("button[data-topic-id]").length, 18);
  assert.equal(app.byId("coverage-checks").querySelectorAll("select[data-check-id]").length, 5);
  assert.equal(app.byId("coverage-applicability").value, "undetermined");
  for (const id of ["coverage-rationale", "coverage-critical-gap", "coverage-next-action", "coverage-search", "coverage-owner"]) assert.equal(app.byId(id).value, "", id);
  for (const control of app.byId("coverage-checks").querySelectorAll("select")) assert.equal(control.value, "not-assessed");
  assert.deepEqual(app.privacyCalls, []);
});

for (const file of bundleFiles.slice(0, -1)) {
  test(`missing ${file} fails closed without partial topic controls`, () => assertClosed(runtime({ omit: [file] })));
}

for (const [name, mutation] of [
  ["empty actor pack", "for (const id of Object.keys(actorProfiles)) delete actorProfiles[id];"],
  ["missing actor domain", "delete actorProfiles[domains[0].id];"],
  ["missing actor phase", "delete actorProfiles[domains[0].id].recover;"],
  ["incomplete actor phase", "actorProfiles[domains[0].id].recover.pop();"],
  ["unknown actor domain", "actorProfiles.unexpected = actorProfiles[domains[0].id];"],
  ["unknown actor phase", "actorProfiles[domains[0].id].retire = actorProfiles[domains[0].id].recover;"],
  ["malformed actor ID", "actorProfiles[domains[0].id].recover[0].id = 'CSM-D99-RC-A01';"],
  ["duplicate actor ID", "actorProfiles[domains[0].id].identify[1].id = actorProfiles[domains[0].id].identify[0].id;"],
  ["unreviewed actor", "actorProfiles[domains[0].id].recover[0].reviewState = 'draft';"],
  ["unknown actor field", "actorProfiles[domains[0].id].recover[0].unexpected = true;"],
]) {
  test(`${name} fails closed before exposing the bundled coverage workspace`, () => assertClosed(runtime({ beforeUi: mutation })));
}

test("corrupt content packs, catalogue versions and model functions fail closed", () => {
  for (const options of [
    { beforeCatalogue: "globalThis.CSMCoverageShards.governance.topics = null;" },
    { beforeCatalogue: "globalThis.CSMCoverageShards.safety.sources = null;" },
    { beforeUi: "globalThis.CSMCoverageCatalogue.version = 'unknown';" },
    { beforeUi: "globalThis.CSMCoverageCatalogue.topics[0].checks[0].entryIds = ['unknown'];" },
    { beforeUi: "globalThis.CSMCoverageCatalogue.sources[0].url = 'javascript:alert(1)';" },
    { beforeUi: "globalThis.CSMCoverage = null;" },
    { beforeUi: "globalThis.CSMCoverage = {...globalThis.CSMCoverage, createDocument() { throw new Error('broken model'); }};" },
  ]) assertClosed(runtime(options));
});

test("bundled and typed markup remains literal text in the UI and printable report", () => {
  const payload = '<img src=x onerror="globalThis.injected=true"><script>injected=true</script>';
  const app = runtime({ beforeUi: `globalThis.CSMCoverageCatalogue.topics[0].title = ${JSON.stringify(payload)};` });
  assert.equal(app.byId("coverage-app").hidden, false);
  assert(app.byId("coverage-topics").textContent.includes(payload));
  save(app, { "coverage-applicability": "applicable", "coverage-critical-gap": payload, "coverage-next-action": payload });
  assert(app.byId("coverage-report-text").textContent.includes(payload));
  assert.equal(app.document.querySelectorAll("img").length, 0);
  assert.equal(app.context.injected, undefined);
});

test("overlong typed markup fails atomically without injecting DOM or replacing the saved report", () => {
  const app = runtime();
  const previousReport = app.byId("coverage-report-text").textContent;
  const payload = '<img src=x onerror="globalThis.injected=true">' + "x".repeat(501);
  save(app, { "coverage-applicability": "applicable", "coverage-critical-gap": payload });
  assert.equal(app.byId("coverage-report-text").textContent, previousReport);
  assert.equal(app.document.querySelectorAll("img").length, 0);
  assert.equal(app.context.injected, undefined);
});

test("native labels and field limits match the bounded session schema", () => {
  const app = runtime();
  for (const [id, limit] of [["coverage-rationale", 300], ["coverage-critical-gap", 500], ["coverage-next-action", 500]]) {
    assert.equal(app.byId(id).maxLength, limit, id);
    assert(app.document.querySelector(`label[for="${id}"]`), `${id} needs an accessible label.`);
  }
  for (const id of ["coverage-applicability", "coverage-owner", "coverage-profile", "coverage-domain", "coverage-search"]) {
    assert(app.document.querySelector(`label[for="${id}"]`), `${id} needs an accessible label.`);
  }
  for (const control of app.byId("coverage-checks").querySelectorAll("select")) {
    assert(app.document.querySelector(`label[for="${control.id}"]`), `${control.id} needs an accessible label.`);
  }
  assert.equal(app.byId("coverage-status").getAttribute("aria-live"), "polite");
});

test("invalid pending edits do not partially save or navigate away from the topic", () => {
  const app = runtime();
  save(app, { "coverage-applicability": "applicable", "coverage-next-action": "Accepted action" });
  const previousReport = app.byId("coverage-report-text").textContent;
  const previousHeading = app.byId("coverage-editor-heading").textContent;
  save(app, { "coverage-applicability": "not-applicable", "coverage-rationale": "", "coverage-next-action": "Uncommitted action" });
  assert.equal(app.byId("coverage-report-text").textContent, previousReport);
  app.byId("coverage-topics").querySelectorAll("button[data-topic-id]")[1].click();
  assert.equal(app.byId("coverage-editor-heading").textContent, previousHeading);
  assert.equal(app.byId("coverage-next-action").value, "Uncommitted action");
  save(app, { "coverage-applicability": "applicable", "coverage-next-action": "x".repeat(501) });
  assert.equal(app.byId("coverage-report-text").textContent, previousReport);
});

test("profiles recommend topics without changing applicability decisions", () => {
  const app = runtime();
  const before = app.byId("coverage-report-text").textContent;
  const profile = app.byId("coverage-profile");
  profile.value = "industrial";
  profile.dispatch("change");
  assert.equal(app.byId("coverage-report-text").textContent, before);
  assert.equal(app.byId("coverage-applicability").value, "undetermined");
  assert.equal(app.byId("coverage-topics").querySelectorAll("button[data-topic-id]").length, 18);
});

test("Save, print and reset never send session answers to network, storage or URL history", () => {
  const app = runtime();
  save(app, { "coverage-applicability": "applicable", "coverage-next-action": "Private planning assertion" });
  app.byId("coverage-print").click();
  assert.equal(app.prints, 1);
  assert(app.printSnapshots[0].report.includes("Private planning assertion"));
  assert.match(app.printSnapshots[0].report, /unencrypted/i);
  assert.match(app.printSnapshots[0].className, /coverage-printing/);
  assert(!app.document.body.classList.contains("coverage-printing"));
  for (const link of app.document.querySelectorAll("a")) assert(!String(link.href).includes("Private planning assertion"));
  app.emit("afterprint");
  app.byId("coverage-reset").click();
  assert.equal(app.byId("coverage-next-action").value, "");
  assert(!app.byId("coverage-report-text").textContent.includes("Private planning assertion"));
  assert.deepEqual(app.privacyCalls, []);
  assert.equal(app.context.location.href, "https://preview.invalid/coverage.html?answer=private#private");
  assert(!/\b(?:fetch|XMLHttpRequest|WebSocket|localStorage|sessionStorage|indexedDB|sendBeacon)\b|history\.(?:replaceState|pushState)|serviceWorker/.test(source));
});

test("non-applicability requires a native rationale and disables its check controls", () => {
  const app = runtime();
  const field = app.byId("coverage-applicability");
  field.value = "not-applicable";
  field.dispatch("change");
  assert.equal(app.byId("coverage-rationale").required, true);
  for (const control of app.byId("coverage-checks").querySelectorAll("select")) assert.equal(control.disabled, true);
  const previousReport = app.byId("coverage-report-text").textContent;
  save(app, { "coverage-rationale": "" });
  assert.equal(app.byId("coverage-report-text").textContent, previousReport);
  save(app, { "coverage-rationale": "Outside the reviewed local operating scope" });
  assert(app.byId("coverage-report-text").textContent.includes("Outside the reviewed local operating scope"));
  field.value = "applicable";
  field.dispatch("change");
  assert.equal(app.byId("coverage-rationale").required, false);
  for (const control of app.byId("coverage-checks").querySelectorAll("select")) assert.equal(control.disabled, false);
});

test("valid topic navigation saves pending edits and moves focus to the editor heading", () => {
  const app = runtime();
  app.byId("coverage-next-action").value = "Pending management action";
  const nextTopic = app.byId("coverage-topics").querySelectorAll("button[data-topic-id]")[1];
  const nextId = nextTopic.dataset.topicId;
  nextTopic.click();
  assert.equal(app.document.activeElement, app.byId("coverage-editor-heading"));
  assert.equal(app.byId("coverage-next-action").value, "");
  assert(app.byId("coverage-report-text").textContent.includes("Pending management action"));
  const selected = app.byId("coverage-topics").querySelectorAll("button[data-topic-id]").filter((button) => button.getAttribute("aria-current") === "true");
  assert.equal(selected.length, 1);
  assert.equal(selected[0].dataset.topicId, nextId);
});

test("native beforeprint excludes invalid pending edits and afterprint restores presentation", () => {
  const app = runtime();
  save(app, { "coverage-applicability": "applicable", "coverage-next-action": "Earlier saved action" });
  const invalid = "Uncommitted private action ".repeat(30);
  app.byId("coverage-next-action").value = invalid;
  app.byId("coverage-print").click();
  assert.equal(app.prints, 0, "The print button must not silently discard invalid pending edits.");
  app.emit("beforeprint");
  assert(app.document.body.classList.contains("coverage-printing"));
  assert(app.byId("coverage-report-text").textContent.includes("Earlier saved action"));
  assert(!app.byId("coverage-report-text").textContent.includes(invalid));
  assert.match(app.byId("coverage-report-text").textContent, /unsaved invalid edits are not included/i);
  app.emit("afterprint");
  assert(!app.document.body.classList.contains("coverage-printing"));
});

for (const persisted of [false, true]) {
  test(`pagehide clears saved and unsaved state (persisted=${persisted}), and BFCache return starts blank`, () => {
    const app = runtime();
    save(app, {
      "coverage-applicability": "applicable",
      "coverage-rationale": "Saved private rationale",
      "coverage-owner": app.context.CSMCoverageCatalogue.topics[0].ownerRoles[0],
      "coverage-check-identify": "gap",
      "coverage-next-action": "Saved private action",
    });
    app.byId("coverage-critical-gap").value = "Unsaved private gap";
    app.byId("coverage-search").value = "Private search";
    app.emit("pagehide", { persisted });
    for (const id of ["coverage-rationale", "coverage-critical-gap", "coverage-next-action", "coverage-search", "coverage-owner", "coverage-applicability", "coverage-profile", "coverage-domain"]) assert.equal(app.byId(id).value, "", id);
    assert.equal(app.byId("coverage-report-text").textContent, "");
    assert.equal(app.byId("coverage-topics").querySelectorAll("button").length, 0);
    app.emit("pageshow", { persisted: true });
    assert.equal(app.byId("coverage-app").hidden, false);
    assert.equal(app.byId("coverage-applicability").value, "undetermined");
    for (const control of app.byId("coverage-checks").querySelectorAll("select")) assert.equal(control.value, "not-assessed");
    assert(!app.byId("coverage-report-text").textContent.includes("Saved private action"));
    assert(!app.byId("coverage-report-text").textContent.includes("Saved private rationale"));
    assert(!app.document.body.textContent.includes("Unsaved private gap"));
    assert.deepEqual(app.privacyCalls, []);
  });
}

test("print failure exits temporary print presentation and keeps the session usable", () => {
  const app = runtime({ printError: true });
  assert.doesNotThrow(() => app.byId("coverage-print").click());
  assert.equal(app.prints, 1);
  assert.equal(app.byId("coverage-app").hidden, false);
  assert(!/print/.test(app.document.body.className));
});

test("preview styles include readable native print and reduced-motion paths", () => {
  assert.match(css, /@media\s+print/);
  assert.match(css, /prefers-reduced-motion\s*:\s*reduce/);
  assert.match(sharedCss, /:focus-visible\s*\{[^}]*outline:/);
  assert.match(html, /href="styles\.css"/);
  assert.match(css, /coverage-report/);
  assert.match(html, /sensitive/i);
  assert.match(html, /assertion|unverified|not verified/i);
  assert.match(html, /not.{0,80}(?:certification|compliance)|no.{0,80}(?:certification|compliance)/i);
});
