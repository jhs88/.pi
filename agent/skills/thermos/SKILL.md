---
name: thermos
description: Launch two independent QA agents with complementary thermo review rubrics, then synthesize their findings. Use for thermos, double thermo review, or combined correctness and maintainability review.
disable-model-invocation: true
---

# Thermos

Thermos is an optional review skill, not an agent type. It composes two fresh, read-only `qa` runs and does not replace the serial `agent-gauntlet` pipeline.

## Workflow

1. Fix the review base and scope. Gather the complete diff and changed-file contents.
2. Preflight the `Agent` tool's advertised types. Require the exact `qa` entry and stop if it is absent. Never attempt an unknown type because the extension falls back to a mutable `general-purpose` agent even while defaults are hidden.
3. Launch two fresh background `qa` agents together, explicitly setting `Mode: Thermos audit`:
   - correctness pass rubric only: bugs, security, breaking changes, unsafe failure modes, and user-path regressions;
   - quality pass rubric only: maintainability, dependency shape, complexity, duplication, test strength, and robustness.
4. Give both agents the same self-contained diff, paths, repository constraints, fresh parent-run check output, and forbidden side effects. Tell each agent not to apply the other rubric. QA's read-only tool envelope enforces non-mutation.
5. Collect both results with `get_subagent_result({ agent_id, wait: true })` only when synthesis depends on them.
6. Validate file-and-line evidence, deduplicate overlap, preserve disagreements, and report findings before summary.

Use the configured model route unless the user explicitly selects another. Follow the global concurrency policy; if another local workload is contending, run the audits serially.

Thermos is review evidence, not final certification. The parent verifies findings, routes fixes through the owning canonical role, and then runs a fresh QA final gate.
