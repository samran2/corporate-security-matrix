#!/usr/bin/env node

import { appendFileSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const MANIFEST = JSON.parse(readFileSync(resolve(SCRIPT_DIR, "site-manifest.json"), "utf8"));
const DEFAULT_ATTEMPTS = 60;
const DEFAULT_INTERVAL_MS = 20_000;
const MAX_ATTEMPTS = 60;
const MAX_RETRY_AFTER_MS = 60_000;
const MAX_API_ERROR_BYTES = 16 * 1024;
const SECONDARY_RATE_LIMIT_WAIT_MS = 60_000;

class GitHubApiError extends Error {
  constructor(message, { retryable, retryAfterMs = 0 }) {
    super(message);
    this.name = "GitHubApiError";
    this.retryable = retryable;
    this.retryAfterMs = retryAfterMs;
  }
}

function fail(message) {
  throw new Error(message);
}

function workflowRunsEndpoint(repository, workflow, sha) {
  const endpoint = new URL(
    `https://api.github.com/repos/${repository}/actions/workflows/${encodeURIComponent(workflow.file)}/runs`,
  );
  endpoint.searchParams.set("branch", "main");
  endpoint.searchParams.set("head_sha", sha);
  endpoint.searchParams.set("event", "push");
  endpoint.searchParams.set("per_page", "20");
  return endpoint;
}

function currentMainRefEndpoint(repository) {
  return new URL(`https://api.github.com/repos/${repository}/git/ref/heads/main`);
}

function parseRetryAfter(value, now) {
  if (!value) return 0;
  const seconds = Number(value);
  if (Number.isFinite(seconds) && seconds >= 0) return seconds * 1000;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? Math.max(0, timestamp - now) : 0;
}

function classifyApiFailure(status, headers, message, now = Date.now()) {
  const remaining = headers.get("x-ratelimit-remaining");
  const resetSeconds = Number(headers.get("x-ratelimit-reset"));
  const retryAfterDelay = parseRetryAfter(headers.get("retry-after"), now);
  const resetDelay = remaining === "0" && Number.isFinite(resetSeconds)
    ? Math.max(0, resetSeconds * 1000 - now)
    : 0;
  const secondaryLimit = status === 403 && /(?:secondary rate limit|abuse detection)/i.test(message);
  const primaryLimit = status === 403 && remaining === "0";
  const explicitRateLimitDelay = status === 403 && retryAfterDelay > 0;
  const rateLimited = status === 429 || secondaryLimit || primaryLimit || explicitRateLimitDelay;
  const retryable = rateLimited || [408, 409, 500, 502, 503, 504].includes(status);
  let retryAfterMs = Math.max(retryAfterDelay, resetDelay);
  if ((secondaryLimit || status === 429) && retryAfterMs === 0) {
    retryAfterMs = SECONDARY_RATE_LIMIT_WAIT_MS;
  }
  return { retryable, retryAfterMs: Math.min(retryAfterMs, MAX_RETRY_AFTER_MS) };
}

function runAttemptEvidenceUrl(repository, run) {
  const runId = Number(run.id);
  const attempt = Number(run.run_attempt);
  if (!Number.isSafeInteger(runId) || runId <= 0 || !Number.isSafeInteger(attempt) || attempt <= 0) {
    fail("GitHub Actions API returned invalid run-attempt evidence.");
  }
  return `https://github.com/${repository}/actions/runs/${runId}/attempts/${attempt}`;
}

function evaluateRuns(workflow, runs, sha) {
  const exactRuns = runs
    .filter((run) => run.head_sha === sha && run.head_branch === "main" && run.event === "push" && run.name === workflow.name)
    .sort((left, right) => {
      const timeOrder = String(right.created_at).localeCompare(String(left.created_at));
      const runOrder = Number(right.id || 0) - Number(left.id || 0);
      const attemptOrder = Number(right.run_attempt || 0) - Number(left.run_attempt || 0);
      return timeOrder || runOrder || attemptOrder;
    });
  const latest = exactRuns[0];
  if (!latest) {
    return { state: "waiting", reason: "exact-SHA push run has not appeared" };
  }
  if (latest.status !== "completed") {
    return { state: "waiting", reason: "run is still in progress" };
  }
  if (
    !Number.isSafeInteger(Number(latest.id)) || Number(latest.id) <= 0 ||
    !Number.isSafeInteger(Number(latest.run_attempt)) || Number(latest.run_attempt) <= 0
  ) {
    return { state: "failed", reason: "run-attempt evidence is invalid", run: latest };
  }
  if (latest.conclusion === "success") {
    return { state: "success", run: latest };
  }
  return {
    state: "failed",
    reason: `latest exact-SHA run concluded ${latest.conclusion || "without a conclusion"}`,
    run: latest,
  };
}

function assert(condition, message) {
  if (!condition) fail(message);
}

async function selfTest() {
  const workflow = { file: "validate.yml", name: "Quality" };
  const sha = "a".repeat(40);
  const otherSha = "b".repeat(40);
  const base = {
    name: workflow.name,
    event: "push",
    head_branch: "main",
    head_sha: sha,
    created_at: "2026-08-29T10:00:00Z",
    run_attempt: 1,
    id: 1,
    html_url: "https://github.com/example/project/actions/runs/1",
  };

  assert(evaluateRuns(workflow, [{ ...base, status: "completed", conclusion: "success" }], sha).state === "success", "exact successful run must pass");
  assert(evaluateRuns(workflow, [{ ...base, head_sha: otherSha, status: "completed", conclusion: "success" }], sha).state === "waiting", "a different SHA must not pass");
  assert(evaluateRuns(workflow, [{ ...base, event: "workflow_dispatch", status: "completed", conclusion: "success" }], sha).state === "waiting", "a non-push run must not pass");
  assert(evaluateRuns(workflow, [{ ...base, head_branch: "feature", status: "completed", conclusion: "success" }], sha).state === "waiting", "a non-main run must not pass");
  assert(evaluateRuns(workflow, [{ ...base, status: "in_progress", conclusion: null }], sha).state === "waiting", "an in-progress run must wait");
  assert(evaluateRuns(workflow, [{ ...base, status: "completed", conclusion: "failure" }], sha).state === "failed", "a failed exact-SHA run must fail closed");
  assert(
    evaluateRuns(workflow, [
      { ...base, status: "completed", conclusion: "success" },
      { ...base, id: 2, created_at: "2026-08-29T10:01:00Z", status: "completed", conclusion: "failure" },
    ], sha).state === "failed",
    "an older success must not mask the latest exact-SHA failure",
  );
  assert(
    evaluateRuns(workflow, [
      { ...base, status: "completed", conclusion: "success" },
      { ...base, id: 2, created_at: "2026-08-29T10:01:00Z", status: "in_progress", conclusion: null },
    ], sha).state === "waiting",
    "an older success must not mask the latest exact-SHA in-progress run",
  );
  assert(
    evaluateRuns(workflow, [
      { ...base, run_attempt: 1, status: "completed", conclusion: "success" },
      { ...base, run_attempt: 2, status: "completed", conclusion: "failure" },
    ], sha).state === "failed",
    "an older successful attempt must not mask the latest failed attempt",
  );
  assert(
    runAttemptEvidenceUrl("example/project", { ...base, run_attempt: 2 }) ===
      "https://github.com/example/project/actions/runs/1/attempts/2",
    "workflow evidence must link to the immutable run attempt",
  );

  const endpoint = workflowRunsEndpoint("example/project", workflow, sha);
  assert(endpoint.searchParams.get("branch") === "main", "the API query must server-filter the main branch");
  assert(endpoint.searchParams.get("head_sha") === sha, "the API query must server-filter the exact SHA");
  assert(endpoint.searchParams.get("event") === "push", "the API query must server-filter push runs");

  const currentMainEnvironment = {
    GITHUB_REPOSITORY: "example/project",
    GITHUB_SHA: sha,
    GITHUB_TOKEN: "test-token",
    GITHUB_REF: "refs/heads/main",
    GITHUB_EVENT_NAME: "push",
  };
  let currentMainRequest;
  await verifyCurrentMainTip({
    environment: currentMainEnvironment,
    request: async (url, options) => {
      currentMainRequest = { url: new URL(url), options };
      return new Response(JSON.stringify({
        ref: "refs/heads/main",
        object: { type: "commit", sha },
      }), { status: 200, headers: { "content-type": "application/json" } });
    },
  });
  assert(
    currentMainRequest.url.href === "https://api.github.com/repos/example/project/git/ref/heads/main",
    "the current-tip gate must query the canonical main ref",
  );
  assert(
    currentMainRequest.options.headers.Authorization === "Bearer test-token",
    "the current-tip gate must authenticate its ref query",
  );
  await verifyCurrentMainTip({
    environment: { ...currentMainEnvironment, GITHUB_EVENT_NAME: "workflow_dispatch" },
    request: async () => new Response(JSON.stringify({
      ref: "refs/heads/main",
      object: { type: "commit", sha },
    }), { status: 200, headers: { "content-type": "application/json" } }),
  });

  let staleMainFailure = "";
  try {
    await verifyCurrentMainTip({
      environment: currentMainEnvironment,
      request: async () => new Response(JSON.stringify({
        ref: "refs/heads/main",
        object: { type: "commit", sha: otherSha },
      }), { status: 200, headers: { "content-type": "application/json" } }),
    });
  } catch (error) {
    staleMainFailure = error.message;
  }
  assert(/stale Pages candidate/i.test(staleMainFailure), "a stale Pages candidate must fail closed");

  let malformedMainFailure = "";
  try {
    await verifyCurrentMainTip({
      environment: currentMainEnvironment,
      request: async () => new Response(JSON.stringify({
        ref: "refs/heads/main",
        object: { type: "tag", sha },
      }), { status: 200, headers: { "content-type": "application/json" } }),
    });
  } catch (error) {
    malformedMainFailure = error.message;
  }
  assert(/invalid main ref/i.test(malformedMainFailure), "a malformed main-ref response must fail closed");

  let deniedMainFailure = "";
  try {
    await verifyCurrentMainTip({
      environment: currentMainEnvironment,
      request: async () => new Response(JSON.stringify({ message: "Resource not accessible by integration" }), {
        status: 403,
        headers: { "content-type": "application/json" },
      }),
    });
  } catch (error) {
    deniedMainFailure = error.message;
  }
  assert(/HTTP 403/i.test(deniedMainFailure), "a denied main-ref request must fail closed");

  let unavailableMainFailure = "";
  try {
    await verifyCurrentMainTip({
      environment: currentMainEnvironment,
      request: async () => { throw new Error("simulated network failure"); },
    });
  } catch (error) {
    unavailableMainFailure = error.message;
  }
  assert(/simulated network failure/i.test(unavailableMainFailure), "an unavailable main-ref request must fail closed");

  for (const [label, overrides, pattern] of [
    ["missing token", { GITHUB_TOKEN: "" }, /GITHUB_TOKEN is required/i],
    ["non-main ref", { GITHUB_REF: "refs/heads/release" }, /restricted to refs\/heads\/main/i],
    ["unsupported event", { GITHUB_EVENT_NAME: "pull_request" }, /push or workflow_dispatch/i],
  ]) {
    let contextFailure = "";
    try {
      await verifyCurrentMainTip({
        environment: { ...currentMainEnvironment, ...overrides },
        request: async () => { throw new Error(`${label} must fail before the API request`); },
      });
    } catch (error) {
      contextFailure = error.message;
    }
    assert(pattern.test(contextFailure), `the current-tip gate must reject ${label}`);
  }

  const rateLimitNow = 2_000_000_000_000;
  const secondaryLimit = classifyApiFailure(
    403,
    new Headers({ "x-ratelimit-remaining": "4999" }),
    "You have exceeded a secondary rate limit.",
    rateLimitNow,
  );
  assert(secondaryLimit.retryable, "a documented secondary-rate-limit 403 must be retryable");
  assert(
    secondaryLimit.retryAfterMs === SECONDARY_RATE_LIMIT_WAIT_MS,
    "a secondary limit without Retry-After must wait for the documented minimum",
  );
  const explicitRetryLimit = classifyApiFailure(
    403,
    new Headers({ "retry-after": "60", "x-ratelimit-remaining": "4999" }),
    "Forbidden",
    rateLimitNow,
  );
  assert(explicitRetryLimit.retryable, "a 403 with Retry-After must be treated as rate limited");
  assert(explicitRetryLimit.retryAfterMs === 60_000, "a 403 Retry-After delay must be honored");
  const primaryReset = classifyApiFailure(
    403,
    new Headers({
      "x-ratelimit-remaining": "0",
      "x-ratelimit-reset": String((rateLimitNow + 30_000) / 1000),
    }),
    "API rate limit exceeded.",
    rateLimitNow,
  );
  assert(primaryReset.retryable, "a primary-rate-limit 403 must be retryable");
  assert(primaryReset.retryAfterMs === 30_000, "x-ratelimit-reset must control the bounded retry delay");

  let requestedEndpoint;
  const productionPathRuns = await fetchRuns(
    "example/project",
    workflow,
    sha,
    "test-token",
    async (url) => {
      requestedEndpoint = new URL(url);
      return new Response(JSON.stringify({
        workflow_runs: [{ ...base, status: "completed", conclusion: "success" }],
      }), { status: 200, headers: { "content-type": "application/json" } });
    },
  );
  assert(requestedEndpoint.searchParams.get("branch") === "main", "fetchRuns must use the server-side main filter");
  assert(productionPathRuns.length === 1, "fetchRuns must parse the production workflow response");

  let productionSecondaryError;
  try {
    await fetchRuns(
      "example/project",
      workflow,
      sha,
      "test-token",
      async () => new Response(
        JSON.stringify({ message: "You have exceeded a secondary rate limit." }),
        { status: 403, headers: { "content-type": "application/json", "x-ratelimit-remaining": "4999" } },
      ),
    );
  } catch (error) {
    productionSecondaryError = error;
  }
  assert(productionSecondaryError instanceof GitHubApiError, "fetchRuns must surface a classified API error");
  assert(productionSecondaryError.retryable, "fetchRuns must retry the official secondary-limit response shape");
  assert(
    productionSecondaryError.retryAfterMs === SECONDARY_RATE_LIMIT_WAIT_MS,
    "fetchRuns must carry the secondary-limit delay into the polling gate",
  );

  let productionRetryAfterError;
  try {
    await fetchRuns(
      "example/project",
      workflow,
      sha,
      "test-token",
      async () => new Response(
        JSON.stringify({ message: "Forbidden" }),
        {
          status: 403,
          headers: {
            "content-type": "application/json",
            "retry-after": "60",
            "x-ratelimit-remaining": "4999",
          },
        },
      ),
    );
  } catch (error) {
    productionRetryAfterError = error;
  }
  assert(productionRetryAfterError instanceof GitHubApiError, "fetchRuns must classify a 403 Retry-After response");
  assert(productionRetryAfterError.retryable, "fetchRuns must retry a 403 carrying Retry-After");
  assert(productionRetryAfterError.retryAfterMs === 60_000, "fetchRuns must honor the 403 Retry-After value");

  const transientCalls = new Map();
  const transientSuccesses = await waitForRequiredRuns({
    repository: "example/project",
    sha,
    token: "test-token",
    attempts: 2,
    intervalMs: 1,
    fetcher: async (_repository, requiredWorkflow) => {
      const calls = (transientCalls.get(requiredWorkflow.file) || 0) + 1;
      transientCalls.set(requiredWorkflow.file, calls);
      if (calls === 1) throw new Error("HTTP 503");
      return [{
        ...base,
        id: requiredWorkflow.file === "validate.yml" ? 11 : 12,
        name: requiredWorkflow.name,
        status: "completed",
        conclusion: "success",
      }];
    },
    delay: async () => {},
    reportProgress: false,
  });
  assert(transientSuccesses.length === MANIFEST.requiredPredeployWorkflows.length, "transient API errors must be retried before success");

  let boundedFailure = "";
  try {
    await waitForRequiredRuns({
      repository: "example/project",
      sha,
      token: "test-token",
      attempts: 2,
      intervalMs: 1,
      fetcher: async () => { throw new Error("HTTP 429"); },
      delay: async () => {},
      reportProgress: false,
    });
  } catch (error) {
    boundedFailure = error.message;
  }
  assert(/Timed out[\s\S]*HTTP 429/.test(boundedFailure), "persistent API errors must fail closed after the bounded retry window");

  let permanentCalls = 0;
  let permanentFailure = "";
  try {
    await waitForRequiredRuns({
      repository: "example/project",
      sha,
      token: "test-token",
      attempts: 3,
      intervalMs: 1,
      fetcher: async () => {
        permanentCalls += 1;
        throw new GitHubApiError("HTTP 401", { retryable: false });
      },
      delay: async () => {},
      reportProgress: false,
    });
  } catch (error) {
    permanentFailure = error.message;
  }
  assert(/HTTP 401/.test(permanentFailure), "permanent API errors must fail immediately");
  assert(permanentCalls === MANIFEST.requiredPredeployWorkflows.length, "permanent API errors must not consume another polling attempt");

  const retryDelays = [];
  const rateCalls = new Map();
  await waitForRequiredRuns({
    repository: "example/project",
    sha,
    token: "test-token",
    attempts: 2,
    intervalMs: 1,
    fetcher: async (_repository, requiredWorkflow) => {
      const calls = (rateCalls.get(requiredWorkflow.file) || 0) + 1;
      rateCalls.set(requiredWorkflow.file, calls);
      if (calls === 1) throw new GitHubApiError("HTTP 429", { retryable: true, retryAfterMs: 3500 });
      return [{ ...base, id: calls, name: requiredWorkflow.name, status: "completed", conclusion: "success" }];
    },
    delay: async (milliseconds) => { retryDelays.push(milliseconds); },
    reportProgress: false,
  });
  assert(retryDelays[0] === 3500, "Retry-After must extend the polling delay within its bounded cap");
  console.log("WORKFLOW SHA GATE SELF-TEST PASSED — 29 cases");
}

function positiveInteger(value, fallback, label) {
  if (value === undefined || value === "") return fallback;
  if (!/^[1-9]\d*$/.test(value)) fail(`${label} must be a positive integer.`);
  return Number(value);
}

async function readBoundedApiError(response) {
  if (!response.body) return "";
  const reader = response.body.getReader();
  const chunks = [];
  let received = 0;
  while (received < MAX_API_ERROR_BYTES) {
    const { value, done } = await reader.read();
    if (done) break;
    const remaining = MAX_API_ERROR_BYTES - received;
    const chunk = Buffer.from(value).subarray(0, remaining);
    chunks.push(chunk);
    received += chunk.byteLength;
    if (value.byteLength > remaining) {
      await reader.cancel();
      break;
    }
  }
  if (received >= MAX_API_ERROR_BYTES) {
    try {
      await reader.cancel();
    } catch {
      // The stream may already be closed after delivering the bounded prefix.
    }
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  try {
    const payload = JSON.parse(raw);
    if (typeof payload.message === "string") {
      return payload.message.replace(/\s+/g, " ").trim().slice(0, 500);
    }
  } catch {
    // GitHub normally returns JSON; retain bounded plain text for diagnostics.
  }
  return raw.replace(/\s+/g, " ").trim().slice(0, 500);
}

async function fetchCurrentMainSha(repository, token, request = fetch) {
  const response = await request(currentMainRefEndpoint(repository), {
    signal: AbortSignal.timeout(20_000),
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "User-Agent": "CorporateSecurityMatrixCurrentMainGate/1.0",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  if (!response.ok) {
    const apiMessage = await readBoundedApiError(response);
    fail(
      `GitHub refs API returned HTTP ${response.status} for refs/heads/main` +
        (apiMessage ? `: ${apiMessage}` : ""),
    );
  }
  const payload = await response.json();
  const currentSha = payload?.object?.sha;
  if (
    payload?.ref !== "refs/heads/main" ||
    payload?.object?.type !== "commit" ||
    !/^[a-f0-9]{40}$/.test(currentSha || "")
  ) {
    fail("GitHub refs API returned an invalid main ref.");
  }
  return currentSha;
}

async function fetchRuns(repository, workflow, sha, token, request = fetch) {
  const endpoint = workflowRunsEndpoint(repository, workflow, sha);
  const response = await request(endpoint, {
    signal: AbortSignal.timeout(20_000),
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "User-Agent": "CorporateSecurityMatrixWorkflowGate/1.0",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  if (!response.ok) {
    const apiMessage = await readBoundedApiError(response);
    const { retryable, retryAfterMs } = classifyApiFailure(
      response.status,
      response.headers,
      apiMessage,
    );
    throw new GitHubApiError(
      `GitHub Actions API returned HTTP ${response.status} for ${workflow.name}` +
        (apiMessage ? `: ${apiMessage}` : ""),
      { retryable, retryAfterMs },
    );
  }
  const payload = await response.json();
  if (!Array.isArray(payload.workflow_runs)) {
    fail(`GitHub Actions API returned an invalid run list for ${workflow.name}.`);
  }
  return payload.workflow_runs;
}

function appendSummary(repository, sha, successes) {
  const summaryPath = process.env.GITHUB_STEP_SUMMARY;
  if (!summaryPath) return;
  const lines = [
    "## Exact-SHA pre-deploy gate",
    "",
    `Pages candidate: \`${sha}\``,
    "",
    "| Required workflow | Exact-SHA push run | Conclusion |",
    "| --- | --- | --- |",
  ];
  for (const { workflow, run } of successes) {
    const attemptUrl = runAttemptEvidenceUrl(repository, run);
    const runLabel = `[${run.id} · attempt ${run.run_attempt}](${attemptUrl})`;
    lines.push(`| ${workflow.name} | ${runLabel} | ${run.conclusion} |`);
  }
  lines.push("");
  appendFileSync(summaryPath, `${lines.join("\n")}\n`, "utf8");
}

async function waitForRequiredRuns({
  repository,
  sha,
  token,
  attempts,
  intervalMs,
  fetcher = fetchRuns,
  delay = (milliseconds) => new Promise((resolveDelay) => setTimeout(resolveDelay, milliseconds)),
  reportProgress = true,
}) {
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const checks = await Promise.all(MANIFEST.requiredPredeployWorkflows.map(async (workflow) => {
      try {
        const runs = await fetcher(repository, workflow, sha, token);
        return { workflow, result: evaluateRuns(workflow, runs, sha) };
      } catch (error) {
        if (error instanceof GitHubApiError && !error.retryable) {
          return {
            workflow,
            result: { state: "failed", reason: `terminal GitHub API error: ${error.message}` },
          };
        }
        return {
          workflow,
          result: {
            state: "waiting",
            reason: `GitHub API unavailable: ${error.message}`,
            retryAfterMs: error instanceof GitHubApiError ? error.retryAfterMs : 0,
          },
        };
      }
    }));
    const failed = checks.find((check) => check.result.state === "failed");
    if (failed) fail(`${failed.workflow.name} failed for ${sha}: ${failed.result.reason}.`);
    if (checks.every((check) => check.result.state === "success")) {
      return checks.map((check) => ({ workflow: check.workflow, run: check.result.run }));
    }
    if (attempt === attempts) {
      const pending = checks
        .filter((check) => check.result.state !== "success")
        .map((check) => `${check.workflow.name}: ${check.result.reason}`)
        .join("; ");
      fail(`Timed out waiting for exact-SHA workflows for ${sha}: ${pending}.`);
    }
    if (reportProgress && (attempt === 1 || attempt % 4 === 0)) {
      console.log(`Waiting for exact-SHA workflow evidence (${attempt}/${attempts})...`);
    }
    const retryAfterMs = Math.max(...checks.map((check) => Number(check.result.retryAfterMs || 0)));
    await delay(Math.max(intervalMs, retryAfterMs));
  }
  fail("Exact-SHA workflow gate reached an unreachable state.");
}

async function verifyWorkflowRuns() {
  const repository = process.env.GITHUB_REPOSITORY || "";
  const sha = process.env.GITHUB_SHA || "";
  const token = process.env.GITHUB_TOKEN || "";
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository)) fail("GITHUB_REPOSITORY is invalid.");
  if (!/^[a-f0-9]{40}$/.test(sha)) fail("GITHUB_SHA must be a full 40-character commit SHA.");
  if (!token) fail("GITHUB_TOKEN is required for the exact-SHA workflow gate.");
  if (process.env.GITHUB_REF !== "refs/heads/main") fail("Pre-deploy verification is restricted to refs/heads/main.");

  const attempts = positiveInteger(process.env.CSM_WORKFLOW_GATE_ATTEMPTS, DEFAULT_ATTEMPTS, "CSM_WORKFLOW_GATE_ATTEMPTS");
  const intervalMs = positiveInteger(process.env.CSM_WORKFLOW_GATE_INTERVAL_MS, DEFAULT_INTERVAL_MS, "CSM_WORKFLOW_GATE_INTERVAL_MS");
  if (attempts > MAX_ATTEMPTS) fail(`CSM_WORKFLOW_GATE_ATTEMPTS cannot exceed ${MAX_ATTEMPTS}.`);
  if (intervalMs > 60_000) fail("CSM_WORKFLOW_GATE_INTERVAL_MS cannot exceed 60000.");

  const successes = await waitForRequiredRuns({ repository, sha, token, attempts, intervalMs });
  appendSummary(repository, sha, successes);
  console.log(`EXACT-SHA WORKFLOW GATE PASSED — ${sha}`);
  for (const { workflow, run } of successes) {
    console.log(`- ${workflow.name}: run ${run.id}, attempt ${run.run_attempt} (${run.conclusion})`);
  }
}

async function verifyCurrentMainTip({ environment = process.env, request = fetch } = {}) {
  const repository = environment.GITHUB_REPOSITORY || "";
  const sha = environment.GITHUB_SHA || "";
  const token = environment.GITHUB_TOKEN || "";
  const eventName = environment.GITHUB_EVENT_NAME || "";
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository)) fail("GITHUB_REPOSITORY is invalid.");
  if (!/^[a-f0-9]{40}$/.test(sha)) fail("GITHUB_SHA must be a full 40-character commit SHA.");
  if (!token) fail("GITHUB_TOKEN is required for the current-main-tip gate.");
  if (environment.GITHUB_REF !== "refs/heads/main") {
    fail("Current-main-tip verification is restricted to refs/heads/main.");
  }
  if (eventName !== "push" && eventName !== "workflow_dispatch") {
    fail("Current-main-tip verification requires a push or workflow_dispatch event.");
  }

  const currentSha = await fetchCurrentMainSha(repository, token, request);
  if (currentSha !== sha) {
    fail(`Stale Pages candidate ${sha}; current refs/heads/main is ${currentSha}.`);
  }
  console.log(`CURRENT MAIN TIP GATE PASSED — ${sha}`);
}

async function main() {
  if (process.argv.length === 3 && process.argv[2] === "--self-test") {
    await selfTest();
    return;
  }
  if (process.argv.length === 3 && process.argv[2] === "--verify-current-main") {
    await verifyCurrentMainTip();
    return;
  }
  if (process.argv.length !== 2) {
    fail("Usage: node scripts/verify_workflow_runs.mjs [--self-test|--verify-current-main]");
  }
  await verifyWorkflowRuns();
}

main().catch((error) => {
  console.error(`WORKFLOW SHA GATE FAILED — ${error.message}`);
  process.exitCode = 1;
});
