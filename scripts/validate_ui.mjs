import fs from "node:fs";
import vm from "node:vm";

const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
const app = fs.readFileSync(new URL("../app.js", import.meta.url), "utf8");
const css = fs.readFileSync(new URL("../styles.css", import.meta.url), "utf8");
const assessmentCss = fs.readFileSync(new URL("../assessment.css", import.meta.url), "utf8");
const sources = fs.readFileSync(new URL("../matrix-references.js", import.meta.url), "utf8");

const errors = [];
const requireMatch = (value, pattern, message) => {
  if (!pattern.test(value)) errors.push(message);
};
const forbidMatch = (value, pattern, message) => {
  if (pattern.test(value)) errors.push(message);
};
const getHexToken = (value, tokenName) => {
  const match = value.match(new RegExp(`--${tokenName}:\\s*(#[0-9a-f]{6})\\s*;`, "i"));
  return match?.[1] ?? "";
};
const relativeLuminance = (hex) => {
  const channels = hex
    .slice(1)
    .match(/../g)
    .map((channel) => Number.parseInt(channel, 16) / 255)
    .map((channel) =>
      channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
    );
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
};
const contrastRatio = (first, second) => {
  const firstLuminance = relativeLuminance(first);
  const secondLuminance = relativeLuminance(second);
  return (
    (Math.max(firstLuminance, secondLuminance) + 0.05) /
    (Math.min(firstLuminance, secondLuminance) + 0.05)
  );
};
const getEffectiveBaseBorder = (value, selector) => {
  let effectiveBorder = "";
  for (const rule of value.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selectors = rule[1].split(",").map((item) => item.trim());
    if (!selectors.includes(selector)) continue;
    for (const declaration of rule[2].matchAll(/(?:^|;)\s*(border-color|border)\s*:\s*([^;]+)/g)) {
      effectiveBorder = declaration[2].trim();
    }
  }
  return effectiveBorder;
};

requireMatch(html, /id="source-pack"/, "The original-source section needs the stable #source-pack anchor.");
requireMatch(html, /id="source-pack"[^>]*tabindex="-1"/, "The source-pack landmark must accept programmatic focus after an internal jump.");
requireMatch(html, /id="matrix-explorer"[^>]*tabindex="-1"/, "The matrix explorer must accept focus after compact navigation closes.");
requireMatch(html, /id="domainKeyboardHint"/, "The domain tablist needs a persistent keyboard hint.");
requireMatch(html, /id="domainNavStatus"/, "The mobile domain rail needs a position status.");
requireMatch(html, /id="previousDomain"/, "The mobile domain rail needs a previous-domain control.");
requireMatch(html, /id="nextDomain"/, "The mobile domain rail needs a next-domain control.");
requireMatch(html, /Threat sources/, "The public layer name must be “Threat sources”.");
requireMatch(html, /Evidence-led synthesis/, "The evidence claim must describe a synthesis, not proof.");
requireMatch(html, /<html[^>]*class="no-js"/, "The document must default to an explicit no-JavaScript state.");
requireMatch(html, /id="sourceMappingCount">59</, "The source count must remain useful before JavaScript runs.");
requireMatch(
  html,
  /<noscript>[\s\S]*href="framework\.html"[\s\S]*href="SOURCE-LIBRARY\.md"[\s\S]*<\/noscript>/,
  "The no-JavaScript fallback must link to the framework and complete source library."
);
requireMatch(
  html,
  /id="matrixDataError"[^>]*role="alert"[^>]*hidden/,
  "The explorer needs a hidden alert that can replace an invalid or incomplete matrix."
);
requireMatch(html, /class="[^"]*app-interactive/, "Dynamic matrix controls must be identifiable for atomic hiding.");

requireMatch(app, /phaseEvidenceByDomain/, "The UI must consume explicit phase-level source mappings.");
requireMatch(app, /relationship/, "The UI must respect the declared evidence relationship.");
requireMatch(app, /source-\$\{domain\.id\}-\$\{reference\.id\}/, "Rendered source rows need stable domain-scoped IDs.");
requireMatch(app, /item\.tabIndex\s*=\s*-1/, "Source rows must accept programmatic focus after contextual evidence jumps.");
requireMatch(app, /formatSourceLabel/, "Phase quick links need a non-duplicative editorial source label.");
requireMatch(app, /createSourceFact\("Edition",\s*reference\.editionNote\)/, "The source record must expose edition and currency notes.");
requireMatch(app, /noopener noreferrer/, "Original-source links need opener and referrer isolation.");
forbidMatch(app, /ArrowRight" \|\| event\.key === "ArrowDown"[\s\S]{0,180}setActiveDomain/, "Horizontal domain tabs must not intercept ArrowUp or ArrowDown.");
requireMatch(app, /function validateBootstrapData\(/, "Bootstrap must validate every required data surface before rendering.");
requireMatch(app, /typeof phases === "undefined"[\s\S]*typeof domains === "undefined"/, "Bootstrap must safely detect missing data scripts.");
forbidMatch(app, /const expectedDomainIds\s*=/, "Runtime bootstrap must not duplicate and drift from the canonical domain contract enforced by the data gate.");
requireMatch(app, /dataset\.appState\s*=\s*"error"/, "Invalid data must switch the page to its atomic error state.");
requireMatch(app, /entry\.reviewState\s*===\s*"reviewed"/, "Only explicitly reviewed matrix records may pass the runtime bootstrap.");
forbidMatch(app, /typeof entry === "string"/, "The UI must not retain the legacy string-entry contract.");
forbidMatch(app, /entry\.id\s*\?\?/, "The UI must not synthesize a position-based fallback for stable entry IDs.");
requireMatch(app, /function safeDecodeFragment\([\s\S]*try[\s\S]*decodeURIComponent[\s\S]*catch/, "Malformed URL fragments must be decoded without throwing.");
requireMatch(app, /writeCanonicalHistory\(window\.history,\s*\{/, "URL synchronization must use the tested history-state writer.");
requireMatch(
  app,
  /returnFocusSelector:\s*historyReturnFocusSelector\s*\?\?\s*`#tab-\$\{previousDomainId\}`/,
  "Domain history must preserve the previous active tab as the Back focus target."
);
requireMatch(
  app,
  /returnFocusSelector:\s*`#view-\$\{previousView\}`/,
  "Decision-layer history must preserve the previous radio as the Back focus target."
);
requireMatch(
  app,
  /normalizeHistoryFocusSelector\(event\.state\?\.focusSelector\)\s*\?\?\s*getDefaultHistoryFocusSelector\(\)/,
  "History restoration must provide a canonical focus fallback for initial or legacy entries."
);
requireMatch(app, /setView\(state\.view, \{ sync: false \}\);\s*syncUrl\(\);/, "Initial state must be canonicalized after the first complete render.");
requireMatch(app, /event\.state\?\.focusSelector/, "History restoration must preserve the initiating control's focus target.");
requireMatch(
  app,
  /restoredFragment === "matrix-explorer" \|\| restoredFragment === "source-pack"[\s\S]{0,180}focusFragmentTarget\(restoredFragment\)/,
  "Back and Forward must restore focus to canonical static fragment targets instead of overriding it with a tab."
);
requireMatch(app, /function focusAfterMobileDomainChange\(/, "Mobile domain boundary navigation must transfer focus to an enabled control.");
requireMatch(
  app,
  /mobileNav\?\.addEventListener\("click"[\s\S]*if \(!link\) return;\s*mobileNav\.open\s*=\s*false;\s*const href/,
  "Every activated mobile navigation link must close the disclosure, including external destinations."
);
requireMatch(app, /mobileNav\.open\s*=\s*false[\s\S]{0,180}focusFragmentTarget/, "Compact navigation must move focus to its revealed same-page destination.");
requireMatch(
  app,
  /selectedOverlay\?\.scope\.domainIds\.includes\(state\.activeDomain\)[\s\S]{0,320}No pilot annotations are mapped to the active domain/,
  "The overlay live region must distinguish pilot coverage from domains outside the pilot."
);

requireMatch(sources, /const phaseEvidenceByDomain\s*=/, "The data model needs phaseEvidenceByDomain.");
requireMatch(sources, /relationship:\s*"context"/, "Phase evidence must explicitly declare a contextual relationship.");
requireMatch(sources, /verifiedOn:\s*"2026-08-29"/, "Sources need a visible verification date.");

forbidMatch(css, /body\s*\{[^}]*\bmin-width\s*:/s, "body min-width causes horizontal overflow at 320px.");
requireMatch(css, /@media\s*\([^)]*max-width:\s*599px/, "The compact domain rail needs a dedicated sub-600px layout.");
requireMatch(css, /:focus-within/, "Source rows need a focus-within state.");
requireMatch(css, /\.evidence-section:focus-visible\s*\{[^}]*outline:/s, "Keyboard focus on the evidence landmark must remain visible.");
requireMatch(css, /prefers-reduced-motion:\s*reduce[\s\S]*transform:\s*none/, "Reduced motion must remove hover transforms.");
requireMatch(css, /\.no-js[\s\S]*\.app-interactive[\s\S]*display:\s*none\s*!important/, "No-JavaScript mode must hide dead dynamic controls.");
requireMatch(css, /\[data-app-state="error"\][\s\S]*\.app-interactive[\s\S]*display:\s*none\s*!important/, "The data-error state must hide every partial matrix surface.");
requireMatch(css, /@media print[\s\S]*\.hero \*[\s\S]*\.page-hero \*[\s\S]*color:\s*#000000\s*!important/, "Print styles must override light hero text on white paper.");
requireMatch(css, /\.evidence-section__footer a\s*\{[^}]*min-height:\s*2\.75rem/s, "Evidence footer links must expose 44px touch targets.");
requireMatch(css, /\.site-footer nav a\s*\{[^}]*min-height:\s*2\.75rem/s, "Footer navigation links must expose 44px touch targets.");
requireMatch(css, /\.view-switch__button\s*\{[^}]*min-width:\s*2\.75rem[^}]*min-height:\s*2\.75rem/s, "Compact decision-layer controls must remain at least 44px in both dimensions.");

requireMatch(css, /--control-border:\s*#[0-9a-f]{6}\s*;/i, "The design system needs a semantic field/control border token.");
requireMatch(
  css,
  /\.control-panel--overlay select\s*\{[^}]*border:\s*1px solid var\(--control-border\)/s,
  "The overlay select must use the accessible control-border token."
);
requireMatch(
  css,
  /\.search-field input\s*\{[^}]*border:\s*1px solid var\(--control-border\)/s,
  "The matrix search field must use the accessible control-border token."
);
requireMatch(css, /\.text-button\s*\{[^}]*border:\s*1px solid var\(--control-border\)/s, "Text-button boundaries must use the accessible control-border token.");
requireMatch(css, /\.chip,[\s\S]{0,80}\.view-switch__button\s*\{[^}]*border:\s*1px solid var\(--control-border\)/s, "Domain chips must use the accessible control-border token.");
requireMatch(css, /\.view-switch\s*\{[^}]*border:\s*1px solid var\(--control-border\)/s, "The decision-layer control group must use the accessible control-border token.");
forbidMatch(
  css,
  /\.view-switch__button\s*\{[^}]*border(?:-color)?:\s*transparent/s,
  "Decision-layer buttons must not override their accessible border with a transparent value."
);
if (!getEffectiveBaseBorder(css, ".view-switch__button").includes("var(--control-border)")) {
  errors.push("The effective base border for decision-layer buttons must remain the accessible control-border token.");
}
requireMatch(css, /\.domain-mobile-nav button\s*\{[^}]*border:\s*1px solid var\(--control-border\)/s, "Mobile domain controls must use the accessible control-border token.");
requireMatch(
  assessmentCss,
  /\.assessment-editor select,[\s\S]{0,180}\.assessment-save input\s*\{[^}]*border:\s*1px solid var\(--control-border\)/s,
  "Assessment selects, text fields, textareas, passphrases and file input must use the accessible control-border token."
);
requireMatch(
  assessmentCss,
  /\.comparison-loader input\s*\{[^}]*border:\s*1px solid var\(--control-border\)/s,
  "Comparison passphrase and file inputs must use the accessible control-border token."
);
requireMatch(
  assessmentCss,
  /\.board-decision-text textarea\s*\{[^}]*border:\s*1px solid var\(--control-border\)/s,
  "Board-decision textareas must use the accessible control-border token."
);
requireMatch(assessmentCss, /\.assessment-cell-button\s*\{[^}]*border:\s*1px solid var\(--control-border\)/s, "Assessment heatmap controls must use the accessible control-border token.");
requireMatch(
  assessmentCss,
  /\.assessment-actions \.button--secondary\s*\{[^}]*border-color:\s*var\(--control-border\)/s,
  "Assessment secondary-action boundaries must use the accessible control-border token."
);
requireMatch(
  assessmentCss,
  /\.assessment-comparison \.button--secondary\s*\{[^}]*border-color:\s*var\(--control-border\)/s,
  "Comparison secondary-action boundaries must use the accessible control-border token."
);

const controlBorder = getHexToken(css, "control-border");
const fieldBackgrounds = [getHexToken(css, "surface"), getHexToken(css, "surface-soft")];
if (controlBorder && fieldBackgrounds.every(Boolean)) {
  for (const background of fieldBackgrounds) {
    const ratio = contrastRatio(controlBorder, background);
    if (ratio < 3) {
      errors.push(
        `The control border ${controlBorder} has only ${ratio.toFixed(2)}:1 contrast against ${background}; 3:1 is required.`
      );
    }
  }
} else {
  errors.push("Control-border contrast cannot be computed from the canonical six-digit design tokens.");
}

const focusBlue = getHexToken(css, "blue");
if (focusBlue && fieldBackgrounds.every(Boolean)) {
  for (const background of fieldBackgrounds) {
    const ratio = contrastRatio(focusBlue, background);
    if (ratio < 3) {
      errors.push(
        `The focus color ${focusBlue} has only ${ratio.toFixed(2)}:1 contrast against ${background}; 3:1 must be preserved.`
      );
    }
  }
} else {
  errors.push("Focus-ring contrast cannot be computed from the canonical six-digit design tokens.");
}

const missingDataRuntime = {
  removedNoJsClass: false,
  body: { dataset: { appState: "pending" } },
  error: { hidden: true }
};
try {
  vm.runInNewContext(app, {
    document: {
      documentElement: {
        classList: {
          remove(className) {
            if (className === "no-js") missingDataRuntime.removedNoJsClass = true;
          }
        }
      },
      body: missingDataRuntime.body,
      getElementById(id) {
        return id === "matrixDataError" ? missingDataRuntime.error : null;
      }
    }
  });
} catch (error) {
  errors.push(`Missing data must resolve to the safe error state without throwing (${error.message}).`);
}
if (!missingDataRuntime.removedNoJsClass) errors.push("JavaScript startup must leave the static no-JavaScript state.");
if (missingDataRuntime.body.dataset.appState !== "error") errors.push("Missing data must set the atomic app error state.");
if (missingDataRuntime.error.hidden) errors.push("Missing data must reveal the accessible error message.");

if (errors.length) {
  console.error("UI CONTRACT VALIDATION FAILED");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log("UI CONTRACT VALIDATION PASSED");
console.log("- Stable source navigation and contextual evidence contract present");
console.log("- Compact-domain, overflow and reduced-motion safeguards present");
console.log("- Atomic bootstrap, history focus and no-JavaScript fallback present");
