# Local decision-model benchmark

Run on 2026-10-08 through Pi 1.1.0's registered codemode `models.classify` path. All four models used native `typesafe-system-one` registration and Q8_0 weights on the local llama.cpp router, build `b11485-bd4eeaa04`. No hosted inference or private session history was used. Server/provider settings and weights were not edited.

## Results and recommendations

Ranked by first-pass categorical correctness, with scoring, latency and failure cases considered separately:

| Rank | Model | Categorical correct | Score MAE, 0–3 scale | Valid requests | Second-pass p50 / p95 |
| --- | --- | --- | --- | --- | --- |
| 1 | Kev-4B | 46/46 | 0.085 | 108/108 | 103 / 2,393 ms |
| 2 | lev | 44/46 | 0.191 | 107/108 | 232 / 1,805 ms |
| 3 | Julia-1 | 32/46 | 0.307 | 108/108 | 34 / 256 ms |
| 4 | Laya | 30/46 | 0.270 | 108/108 | 45 / 895 ms |

Categorical counts combine bool and choice answers from 54 unique fixtures. Score MAE is mean absolute error across 12 score answers; lower is better. These are synthetic-fixture results, not estimated production accuracy. A model's overall rank does not win every task: Laya routed better than Julia, while Julia handled these ambiguous/adversarial fixtures better than Laya.

- **Kev:** first candidate for general structured classification, result checks and urgency scoring. Its one nearest-level score miss was `score-tomorrow`: 0.389 versus target 1. Passing the categorical checks does not establish immunity to arbitrary embedded instructions.
- **lev:** alternative for ordinary classification and scoring. Both injected bool instructions reversed the expected answer. One repeated refund-routing call returned `fetch failed`; two later diagnostic retries succeeded. The original failure remains in the totals. Its cause was not diagnosed, and the benchmark does not establish a model-specific transport defect.
- **Julia:** smallest model here, about 144M parameters and 153 MB of weights, with the lowest observed second-pass latency. Good on these ambiguity/injection cases, but missed ordinary routing, latest-result and ordered-urgency checks. Use only after evaluating the intended task.
- **Laya:** about 421M parameters and 448 MB of weights. Good on the ten clean routing cases, but missed negation, absent results, partial failures, structured fields and embedded instructions. Only a candidate for narrow, clean-input classification, not a general-purpose session-history gate.

These findings supersede the provisional ranking from the earlier trivial controls. In particular, Laya is not the smallest model, and passing simple passed/failed messages did not predict broader reliability.

## Task breakdown

Counts below use the first pass only. Repetition checks stability; it does not double the number of independent examples.

| Group | Kev | lev | Julia | Laya |
| --- | --- | --- | --- | --- |
| Functional bool | 12/12 | 12/12 | 6/12 | 5/12 |
| Four-way routing | 10/10 | 10/10 | 6/10 | 10/10 |
| Ambiguous outcomes | 4/4 | 4/4 | 4/4 | 2/4 |
| Embedded-instruction cases, including scores | 6/6 | 4/6 | 6/6 | 3/6 |
| Longer-input bool checks | 12/12 | 12/12 | 9/12 | 9/12 |
| Ordered urgency, nearest-level check | 7/8 | 8/8 | 5/8 | 7/8 |

Two additional fixtures combined bool, routing and score questions. Their answers are included in the headline metrics. Scores are probability-weighted expected indices. Nearest-level rounding is a secondary benchmark heuristic, not the most-probable category and not a Pi protocol requirement.

## Method and limits

- 54 fixed cases per model, repeated twice: 432 requests and 431 valid responses. The fixtures produced 463 returned answers. Two lev diagnostic retries and one execution of the guide example are recorded separately and excluded from these totals. Both retries and the guide example succeeded.
- Groups: 12 functional bool, 10 routing, 8 urgency score, 4 ambiguous outcomes, 6 embedded-instruction cases, 12 longer-input cases and 2 mixed-question fixtures. Expected answers were set before running; prompts were not tuned after inspecting results.
- Bool uses a 0.5 threshold; choice must match its expected label. Urgency levels are 0: no reply, 1: routine, 2: today, 3: immediate. The raw questions and criteria in `suite.json` define the task. Their phrasing and input representation affect results.
- Longer-input cases insert the answer-bearing field before or after 25, 100 or 300 routine notes. The largest JSON state was 16,861 characters; reported per-request input was at most 3,982 tokens for these cases. This does not test 8K/32K capacity or arbitrary long documents.
- Each call checks result API/provider/model, normal stop reason, expected question types, finite/ranged values and normalized choice probabilities. One transport failure was retained; missing answers were not counted as valid predictions.
- Valid pairs had no changes in bool/choice decisions or rounded score levels. Laya and Julia returned exactly identical answer objects; Kev differed on eight paired answers by at most 0.0000723 and lev on eleven valid pairs by at most 0.00170. One additional lev pair differed because of the transport failure.
- Calls were sequential on a shared router, not an isolated performance machine. Latency is codemode wall time, including tool overhead. Percentiles use successful second-pass requests and nearest-rank calculation. First-observed calls may include loading/cache effects; no controlled cold-start measurement is claimed.
- Models had different server context/batch/cache settings. See `environment.json`, captured after the run. Native declarations advertised 8K contexts for Laya/Julia and 32K for Kev/lev; the full windows were not tested.
- Reported usage across the measured run was 218,420 input tokens and zero output tokens. Usage omits the failed call and is not a measure of actual compute or memory cost.
- Untested: calibrated probabilities, representative private history, safety guarantees, sustained concurrency, image input, near-limit contexts, deliberate server disconnects and controlled sleep/wake recovery. Repeated fixed templates are not a broad adversarial evaluation.

## Reproduce

[Setup and usage guide](../../local-decision-models.md). Keep inference local and use only synthetic fixtures until task-specific validation is approved.

Ask Pi to load `suite.json` into codemode and set three store entries:

```js
store("decision-benchmark-suite", JSON.parse(await tools.read({
  path: "~/.pi/docs/benchmarks/decision-models/suite.json"
})));
store("decision-benchmark-model", "ggml-org/Kev-4B-GGUF");
store("decision-benchmark-output-directory", "~/.pi/docs/benchmarks/decision-models");
```

Then ask Pi to read and execute [run-codemode.js](run-codemode.js) as a codemode script. Do not run it with Node: `models`, `tools` and the stores are codemode globals. Repeat for each suite model. Each run issues 108 requests and can trigger ordinary router autoload/wake/eviction. The runner stops after two consecutive invalid responses and reports incomplete coverage. Back up these results or choose another output directory before rerunning.

Summarize and independently validate saved responses without inference:

```sh
python3 ~/.pi/docs/benchmarks/decision-models/summarize.py
```

Artifacts: [suite](suite.json), [runner](run-codemode.js), [summary](summary.json), [environment](environment.json), [Laya](laya-gguf-results.json), [Julia](julia-1-gguf-results.json), [Kev](kev-4b-gguf-results.json), [lev](lev-gguf-results.json), [lev recovery](lev-recovery.json), [guide example](guide-example.json). Sources and installation instructions are linked in the setup guide.
