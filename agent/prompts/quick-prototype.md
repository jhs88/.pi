---
description: Skip design, jump straight to prototyping
argument-hint: "<idea>"
---

**YOU ARE THE ORCHESTRATOR.** Do NOT do this work yourself. Delegate every step to subagents using the `subagent` tool with `chain` parameter.

**Handoff rule:** Every subagent must load the handoff skill, use `handoff_write` to save to a `/tmp/` path, then return ONLY the file path. Do NOT create files in project root.

**Active participation:** Present findings concisely (3-5 bullets max). Ask ONE clear question at a time. Don't dump massive summaries.

Execute as a **chain** of 2 agents:

1. **prototyper** — Build prototype based on user input
2. **integrator** — Handle the results (fold/delete/create ADR)

```
subagent chain:
  - agent: prototyper
    task: $1 — Build a prototype to explore this. Decide if it's a logic prototype (terminal app) or UI prototype (multiple variants) based on the question. Output handoff notes for the integrator.
  - agent: integrator
    task: Review prototype findings from {previous}. Fold into production code or delete prototype. Use handoff skill and `handoff_write` tool to create summary. Return the handoff document path.
```

**After prototyper:** Read the handoff file, summarize verdict inline (go/no-go, what worked/didn't). Ask: fold into production or delete? Then continue chain to integrator.

**Output:** Final handoff document path and verdict on the design.
