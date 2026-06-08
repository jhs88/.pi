---
description: Design → prototype → integrate full workflow
argument-hint: "<goal>"
---

**YOU ARE THE ORCHESTRATOR.** Do NOT do this work yourself. Delegate every step to subagents using the `subagent` tool with `chain` parameter.

**Handoff rule:** Every subagent must load the handoff skill, use `handoff_write` to save to a `/tmp/` path, then return ONLY the file path. Do NOT create files in project root.

1. **designer** — Synthesize requirements, produce design spec
2. **prototyper** — Build throwaway prototype to validate the design
3. **integrator** — Fold prototype into production or delete, create handoff doc

```
subagent chain:
  - agent: plan
    task: $1
  - agent: prototyper
    task: Review the design spec from {previous}. Build a prototype to validate it. Output handoff notes for the integrator.
  - agent: integrator
    task: Review prototype findings from {previous}. Fold into production code or delete prototype. Use handoff skill and `handoff_write` tool to create summary. Return the handoff document path.
```

**Output:** Final handoff document path and summary of what was built/decided.
