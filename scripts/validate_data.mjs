import fs from "node:fs";
import vm from "node:vm";

const sourceFiles = [
  "matrix-domains.js",
  "matrix-actors.js",
  "matrix-briefs.js",
  "matrix-references.js"
];

const source = sourceFiles
  .map((file) => fs.readFileSync(new URL(`../${file}`, import.meta.url), "utf8"))
  .join("\n") + "\n;globalThis.__matrix = { phases, domains, referencesByDomain };";

const context = vm.createContext({});
vm.runInContext(source, context, { filename: "matrix-data.bundle.js", timeout: 5_000 });

const { phases, domains, referencesByDomain } = context.__matrix;
const errors = [];

if (phases.length !== 5) errors.push(`Expected 5 lifecycle phases, found ${phases.length}.`);
if (domains.length !== 9) errors.push(`Expected 9 security domains, found ${domains.length}.`);

const phaseIds = new Set(phases.map((phase) => phase.id));
const domainIds = new Set(domains.map((domain) => domain.id));
if (phaseIds.size !== phases.length) errors.push("Lifecycle phase IDs must be unique.");
if (domainIds.size !== domains.length) errors.push("Security domain IDs must be unique.");

for (const domain of domains) {
  if (!domain.name || !domain.focus || !domain.sourceContext) errors.push(`${domain.id} is missing required metadata.`);
  for (const phase of phases) {
    const cell = domain.cells?.[phase.id];
    if (!cell) {
      errors.push(`${domain.id} is missing ${phase.id} cell data.`);
      continue;
    }
    if (!Array.isArray(cell.threats) || cell.threats.length === 0) errors.push(`${domain.id}/${phase.id} has no risks.`);
    if (!Array.isArray(cell.controls) || cell.controls.length === 0) errors.push(`${domain.id}/${phase.id} has no mitigations.`);
    if (!Array.isArray(domain.actors?.[phase.id]) || domain.actors[phase.id].length === 0) errors.push(`${domain.id}/${phase.id} has no actors or failure sources.`);
  }

  const profile = domain.profile;
  for (const key of ["mission", "protects", "owners", "failureModes", "assuranceQuestions"]) {
    if (!profile?.[key] || (Array.isArray(profile[key]) && profile[key].length === 0)) errors.push(`${domain.id} profile is missing ${key}.`);
  }

  const references = referencesByDomain[domain.id];
  if (!Array.isArray(references) || references.length === 0) {
    errors.push(`${domain.id} has no source mappings.`);
  } else {
    for (const reference of references) {
      if (!reference.org || !reference.title || !reference.type || !reference.note) errors.push(`${domain.id} has an incomplete source mapping.`);
      if (!reference.url?.startsWith("https://")) errors.push(`${domain.id} source must use HTTPS: ${reference.url ?? "missing URL"}`);
    }
  }
}

const totalReferences = Object.values(referencesByDomain).reduce((total, references) => total + references.length, 0);
if (totalReferences !== 46) errors.push(`Expected 46 source mappings, found ${totalReferences}.`);

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}

console.log(`DATA VALIDATION PASSED — ${domains.length} domains, ${phases.length} phases, ${totalReferences} source mappings.`);
