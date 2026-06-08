---
description: Explore + prototype options in parallel
argument-hint: "<area> <option-A> <option-B>"
---

**YOU ARE THE ORCHESTRATOR.** Do NOT do this work yourself. Delegate every step to subagents using the `subagent` tool with `parallel` parameter.

**Handoff rule:** Every subagent must run `mktemp -t handoff-XXXXXX.md` first, write to that temp path, then return ONLY the file path. Do NOT create files in project root.

Execute as **parallel** agents, then synthesize:

1. **explore** — Explore codebase area (read-only)
2. **prototyper** — Build prototype for Option A
3. **prototyper** — Build prototype for Option B (different task)

```
subagent parallel:
  - agent: explore
    task: $1 — Explore this area. Output compressed findings on current architecture and friction points.
  - agent: prototyper
    task: $2 — Build a prototype for this approach. Output findings and verdict.
  - agent: prototyper
    task: $3 — Build a prototype for this alternative approach. Output findings and verdict.
```

**After parallel run:** Read all handoff files. Present a side-by-side comparison inline (don't just list paths). Summarize: what each option did well, where each struggled, key tradeoffs. Ask: which direction should we take? Then either continue chain to integrator or present recommendation.

**Output:** Side-by-side comparison table + user decision + next steps.
