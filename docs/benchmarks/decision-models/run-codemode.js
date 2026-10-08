// @options: {"timeout_ms": 240000, "max_output_tokens": 5000}
// Seed decision-benchmark-suite, decision-benchmark-model and
// decision-benchmark-output-directory in codemode before running this script.
const suite = load("decision-benchmark-suite");
const id = load("decision-benchmark-model");
const outputDirectory = load("decision-benchmark-output-directory");
if (!suite || !suite.models.includes(id) || !outputDirectory) {
  throw new Error("Load the suite, choose one listed model, and set an output directory first.");
}
const model = await models.getModelOfType("classifier", "llama.cpp", id);
const chat = await models.getModelOfType("chat", "llama.cpp", id);
if (!model || model.api !== "typesafe-system-one" || chat) {
  throw new Error("Native classifier-only registration is required. No inference performed.");
}
const inRange = (value, max = 1) => Number.isFinite(value) && value >= 0 && value <= max;
function validate(result, fixture) {
  const errors = [];
  if (result.stopReason !== "stop") errors.push(`stopReason: ${result.stopReason}; ${result.errorMessage ?? ""}`);
  if (result.api !== "typesafe-system-one") errors.push(`Unexpected API: ${result.api}`);
  if (result.provider !== "llama.cpp" || result.model !== id) errors.push("Model/provider mismatch");
  const answers = result.answers ?? {};
  if (Object.keys(answers).length !== Object.keys(fixture.questions).length) errors.push("Answer count mismatch");
  for (const [key, question] of Object.entries(fixture.questions)) {
    const answer = answers[key];
    if (!answer || answer.type !== question.type) {
      errors.push(`${key}: wrong or missing type`);
      continue;
    }
    if (question.type === "bool" && !inRange(answer.probability)) errors.push(`${key}: invalid probability`);
    if (question.type === "score" && (!inRange(answer.score, question.criteria.length - 1) || !inRange(answer.confidence))) {
      errors.push(`${key}: invalid score/confidence`);
    }
    if (question.type === "choice") {
      const labels = Object.keys(question.criteria);
      const probabilities = answer.probabilities ?? {};
      if (!labels.includes(answer.choice) || !inRange(answer.confidence) ||
          Object.keys(probabilities).length !== labels.length ||
          !labels.every(label => inRange(probabilities[label])) ||
          Math.abs(labels.reduce((sum, label) => sum + (probabilities[label] ?? 0), 0) - 1) > 1e-6) {
        errors.push(`${key}: invalid choice/probabilities/confidence`);
      }
    }
  }
  return errors;
}
const rows = [];
let consecutiveErrors = 0;
let stoppedEarly = false;
for (let repeat = 1; repeat <= suite.repeats; repeat++) {
  for (const fixture of suite.cases) {
    const started = Date.now();
    const result = await models.classify(model, { state: fixture.state, questions: fixture.questions });
    const durationMs = Date.now() - started;
    const errors = validate(result, fixture);
    const checks = [];
    if (!errors.length) {
      for (const [key, expected] of Object.entries(fixture.expected)) {
        const answer = result.answers[key];
        const actual = answer.type === "bool" ? answer.probability > 0.5 : answer.type === "choice" ? answer.choice : answer.score;
        checks.push({ key, type: answer.type, expected, actual,
          correct: answer.type === "score" ? Math.round(actual) === expected : actual === expected,
          absoluteError: answer.type === "score" ? Math.abs(actual - expected) : null });
      }
    }
    rows.push({ caseId: fixture.id, group: fixture.group, repeat, durationMs, errors, checks, result });
    consecutiveErrors = errors.length ? consecutiveErrors + 1 : 0;
    if (consecutiveErrors >= 2) { stoppedEarly = true; break; }
  }
  if (stoppedEarly) break;
}
const run = { suiteVersion: suite.version, model: { id, api: model.api, contextWindow: model.contextWindow },
  startedAt: rows[0]?.result.timestamp ?? null, finishedAt: Date.now(),
  plannedRequests: suite.cases.length * suite.repeats, stoppedEarly, rows };
store(`decision-benchmark-results:${id}`, run);
const slug = id.split("/").at(-1).toLowerCase();
text(await tools.write({ path: `${outputDirectory}/${slug}-results.json`, content: JSON.stringify(run, null, 2) + "\n" }));
text({ id, requests: rows.length, plannedRequests: run.plannedRequests, stoppedEarly,
  validRequests: rows.filter(row => !row.errors.length).length,
  firstRepeatFailures: rows.filter(row => row.repeat === 1 && (row.errors.length || row.checks.some(check => !check.correct)))
    .map(row => ({ caseId: row.caseId, errors: row.errors, checks: row.checks })) });
