---
description: Design → prototype → integrate full workflow
argument-hint: "<goal>"
disable-model-invocation: true
---

<!--
Skills loaded by phase:
  Phase 1 (grill)      → /grill-with-docs               — relentless interview; maintains CONTEXT.md + ADRs via domain-modeling
  Phase 2 (design)     → plan subagent                        — synthesize requirements into design spec
  Phase 3 (prototype)  → prototyper subagent                  — throwaway code to validate design
  Phase 4 (integrate)  → integrator subagent                  — fold prototype into production or delete

No human gates in this variant — straight chain.
Deep-module vocabulary: module, interface, depth, seam, adapter, leverage, locality.
-->

**YOU ARE THE ORCHESTRATOR.** Do NOT do this work yourself. Delegate every step to subagents using the `subagent` tool with `chain` parameter.

**Handoff rule:** Every subagent must load the handoff skill, use `handoff_write` to save to a `/tmp/` path, then return ONLY the file path. Do NOT create files in project root.

Execute as a chain — grill first, then delegate to plan → prototyper → integrator:

1. **grill** → load `/grill-with-docs` skill in main chat
2. **plan** → design spec (handoff file)
3. **prototyper** → throwaway prototype to validate design (handoff file)
4. **integrator** → fold into production or delete (final handoff)

```
subagent chain:
  - agent: plan
    task: $1 — Synthesize requirements into a design spec. Use handoff skill and `handoff_write` tool to save structured findings. Return ONLY the handoff file path.
  - agent: prototyper
    task: Read design spec from handoff file: {previous}. Build prototype to validate it. Output handoff notes for the integrator.
  - agent: integrator
    task: Review prototype findings from handoff file: {previous}. Fold into production code or delete prototype. Use handoff skill and `handoff_write` tool to create summary. Return the handoff document path.
```

**Before chain (orchestrator):** Load `/grill-with-docs` skill. Grill the user relentlessly — walk the design tree, sharpen fuzzy language, maintain CONTEXT.md via domain-modeling. When grilling is complete, proceed to subagent chain without human gates.

**Output:** Final handoff document path and summary of what was built/decided.
