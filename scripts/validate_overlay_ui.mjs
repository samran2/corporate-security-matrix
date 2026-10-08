import fs from "node:fs";

const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
const app = fs.readFileSync(new URL("../app.js", import.meta.url), "utf8");
const css = fs.readFileSync(new URL("../styles.css", import.meta.url), "utf8");
const overlayGuide = fs.readFileSync(new URL("../OVERLAY-EU-FI.md", import.meta.url), "utf8");
const overlayValidator = fs.readFileSync(new URL("./validate_overlays.mjs", import.meta.url), "utf8");

const errors = [];
const requireMatch = (value, pattern, message) => {
  if (!pattern.test(value)) errors.push(message);
};
const forbidMatch = (value, pattern, message) => {
  if (pattern.test(value)) errors.push(message);
};
const readStringSet = (source, identifier) => {
  const declaration = new RegExp(`const ${identifier} = new Set\\(\\[([\\s\\S]*?)\\]\\);`).exec(source);
  if (!declaration) {
    errors.push(`Could not read ${identifier} for runtime/validator parity.`);
    return [];
  }
  return [...declaration[1].matchAll(/"([^"]+)"/g)].map((match) => match[1]);
};

const overlayScriptIndex = html.indexOf('<script src="matrix-overlays.js"></script>');
const appScriptIndex = html.indexOf('<script src="app.js"></script>');
if (overlayScriptIndex < 0 || appScriptIndex < 0 || overlayScriptIndex > appScriptIndex) {
  errors.push("matrix-overlays.js must load as a first-party script before app.js.");
}

requireMatch(html, /<label[^>]*for="overlaySelect"[^>]*>[^<]+<\/label>/, "The overlay selector needs a visible label.");
requireMatch(html, /<select[^>]*id="overlaySelect"[^>]*aria-describedby="overlayHelp"/, "The overlay selector needs stable help text.");
requireMatch(html, /<option value="">No jurisdiction overlay<\/option>/, "The selector must provide an explicit no-overlay default.");
requireMatch(html, /<option value="eu-fi">EU \+ Finland pilot<\/option>/, "The selector must expose only the allowlisted EU–Finland pilot.");
requireMatch(
  html,
  /id="overlayContext"[^>]*aria-labelledby="overlayContextTitle"[^>]*hidden/,
  "The overlay context panel must be labelled and hidden by default."
);

requireMatch(app, /const ALLOWED_OVERLAY_IDS = new Set\(\["eu-fi"\]\)/, "Overlay URL values need an explicit allowlist.");
requireMatch(app, /urlState\.get\("overlay"\)/, "Initial state must read the public overlay URL parameter.");
requireMatch(app, /params\.set\("overlay", state\.overlay\)/, "URL synchronization must preserve an allowlisted overlay.");
requireMatch(app, /function renderOverlayContext\(/, "The selected overlay needs a dedicated context renderer.");
requireMatch(app, /overlayContext\.replaceChildren\(/, "Overlay content must be replaced atomically.");
requireMatch(app, /function getSafeOfficialOverlayUrl\(/, "Official overlay links need a runtime URL allowlist.");
const runtimeHosts = readStringSet(app, "ALLOWED_OVERLAY_SOURCE_HOSTS");
const validatorHosts = readStringSet(overlayValidator, "ALLOWED_SOURCE_HOSTS");
if (
  runtimeHosts.length !== new Set(runtimeHosts).size ||
  validatorHosts.length !== new Set(validatorHosts).size ||
  runtimeHosts.length !== validatorHosts.length ||
  runtimeHosts.some((host) => !validatorHosts.includes(host))
) {
  errors.push("Runtime and strict-validator overlay source-host allowlists must match exactly without duplicates.");
}
requireMatch(app, /overlaySelect\.addEventListener\("change"/, "The accessible selector must update overlay state.");
requireMatch(app, /function canonicalizeFragment\(/, "URL fragments need an explicit canonicalization boundary.");
requireMatch(app, /currentFragment === null/, "Malformed percent-encoded fragments must be removed.");
requireMatch(app, /rel\s*=\s*"noopener noreferrer"/, "Official source links need opener and referrer isolation.");
forbidMatch(app, /\.innerHTML\s*=|insertAdjacentHTML/, "Overlay data must never be rendered through HTML injection sinks.");
forbidMatch(app, /\bfetch\s*\(|XMLHttpRequest|WebSocket/, "The overlay UI must not add runtime network requests.");
forbidMatch(app, /localStorage|sessionStorage|indexedDB/i, "The overlay UI must not add browser persistence.");

requireMatch(
  overlayGuide,
  /UI loads `matrix-overlays\.js`[\s\S]*`overlay=eu-fi` URL parameter/,
  "The overlay guide must describe the current public UI and its allowlisted URL state."
);
forbidMatch(
  overlayGuide,
  /current public UI does not load|future UI integration point/i,
  "The overlay guide must not describe the shipped integration as future work."
);

requireMatch(css, /\.overlay-context\s*\{/, "The overlay context panel needs project-native styling.");
requireMatch(css, /\.overlay-annotation\s*\{/, "Overlay annotations need a stable visual container.");
requireMatch(
  css,
  /\.control-panel--overlay\s+select\s*\{[^}]*min-height:\s*2\.75rem/s,
  "The overlay selector must expose a 44px minimum touch target."
);
requireMatch(
  css,
  /\.control-panel--overlay\s+select:focus-visible\s*\{[^}]*outline:/s,
  "The overlay selector needs an explicit visible keyboard-focus treatment."
);
requireMatch(css, /@media\s*\([^)]*max-width:\s*599px[\s\S]*\.overlay-context/, "The overlay panel needs a compact mobile layout.");
requireMatch(
  css,
  /@media print[\s\S]*\.overlay-context[\s\S]*\.overlay-annotation[\s\S]*break-inside:\s*avoid/,
  "The selected overlay context and its annotations must remain usable in print."
);

if (errors.length) {
  console.error("OVERLAY UI CONTRACT VALIDATION FAILED");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log("OVERLAY UI CONTRACT VALIDATION PASSED");
console.log("- First-party overlay loading and allowlisted URL state present");
console.log("- Accessible selector, contextual rendering and safe official links present");
console.log("- No runtime network, persistence or HTML injection sinks introduced");
