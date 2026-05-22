---
description: Skip design phase, jump straight to prototyping. Use when the design is already clear or the user wants to explore a specific idea quickly.
---

**YOU ARE THE ORCHESTRATOR.** Do NOT do this work yourself. Delegate every step to subagents using the `subagent` tool with `chain` parameter.

**Handoff rule:** Every subagent must run `mktemp -t handoff-XXXXXX.md` first, write to that temp path, then return ONLY the file path. Do NOT create files in project root.

Execute as a **chain** of 2 agents:

1. **prototyper** — Build prototype based on user input
2. **integrator** — Handle the results (fold/delete/create ADR)

```
subagent chain:
  - agent: prototyper
    task: {{user_goal}} — Build a prototype to explore this. Decide if it's a logic prototype (terminal app) or UI prototype (multiple variants) based on the question. Output handoff notes for the integrator.
  - agent: integrator
    task: Review prototype findings from {previous}. Fold into production code or delete prototype. Use handoff skill to create summary. Return the handoff document path.
```

**Output:** Final handoff document path and verdict on the design.
