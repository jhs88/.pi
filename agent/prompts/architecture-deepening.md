---
description: Find and execute architectural improvements
argument-hint: "<area>"
disable-model-invocation: true
---

<!--
Skills loaded by phase:
  Phase 1 (explore)    → /improve-codebase-architecture  — explore codebase, generate HTML report of deepening candidates
  Phase 2 (grill)      → /grill-with-docs               — walk design tree for chosen candidate; maintains CONTEXT.md + ADRs via domain-modeling
  Phase 3 (build)      → integrator subagent             — implement chosen refactor

Deep-module vocabulary: module, interface, depth, seam, adapter, leverage, locality.
-->

**YOU ARE THE ORCHESTRATOR.** Do NOT do this work yourself. Delegate every step to subagents using the `subagent` tool with `chain` parameter.

**Handoff rule:** Every subagent must load the handoff skill, use `handoff_write` to save to a `/tmp/` path, then return ONLY the file path. Do NOT create files in project root.

**Active participation:** Present findings concisely (3-5 bullets max). Ask ONE clear question at a time. Don't dump massive summaries.

Execute using **handoff files** between steps — human picks which candidate to implement:

1. **explore** → handoff file (HTML report of deepening candidates)
2. Human reviews HTML report, appends choice
3. **grill loop** → load `/grill-with-docs` skill to walk design tree for chosen candidate
4. Human approves grilling decisions
5. **integrator** → reads final handoff, implements chosen refactor

```
subagent chain:
  - agent: explore
    task: $1 — Load the /improve-codebase-architecture skill. Explore this area and produce an HTML report of deepening candidates. Use handoff skill and `handoff_write` tool to save the report path. Return ONLY the handoff file path.
  - agent: integrator
    task: Read deepening candidate choice from handoff file: {previous}. Human has appended their choice and grilling notes. Implement the chosen refactor. Use handoff skill and `handoff_write` tool for final summary. Update CONTEXT.md or create ADR if needed. Return handoff file path.
```

**Between explore and human review:** Open the HTML report, summarize top 3 candidates inline (Files/Problem/Benefits). Ask: which candidate should we grill? Append choice to handoff file, then continue chain.

**Grilling loop (orchestrator does this directly):** After human picks a candidate, load `/grill-with-docs` skill to walk the design tree — constraints, dependencies, shape of the deepened module, what sits behind the seam, what tests survive. Keep CONTEXT.md and ADRs updated inline via domain-modeling. When grilling is complete, write grilling decisions to the handoff file.

**After integrator:** Summarize final changes and any ADRs created. Return handoff document path.

**Output:** Final handoff document path with architectural changes and ADR (if created).
