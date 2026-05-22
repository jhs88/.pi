---
description: Run exploration and prototyping in parallel. Use when you have multiple design options to test quickly.
---

**YOU ARE THE ORCHESTRATOR.** Do NOT do this work yourself. Delegate every step to subagents using the `subagent` tool with `parallel` parameter.

**Handoff rule:** Every subagent must run `mktemp -t handoff-XXXXXX.md` first, write to that temp path, then return ONLY the file path. Do NOT create files in project root.

Execute as **parallel** agents, then synthesize:

1. **scout** — Explore codebase area (read-only)
2. **prototyper** — Build prototype for Option A
3. **prototyper** — Build prototype for Option B (different task)

```
subagent parallel:
  - agent: scout
    task: {{area_to_explore}} — Explore this area. Output compressed findings on current architecture and friction points.
  - agent: prototyper
    task: {{option_a_description}} — Build a prototype for this approach. Output findings and verdict.
  - agent: prototyper
    task: {{option_b_description}} — Build a prototype for this alternative approach. Output findings and verdict.
```

**Then** use a human or integrator to compare the parallel results and decide which direction to take.

**Output:** Comparison of options with recommendations.
