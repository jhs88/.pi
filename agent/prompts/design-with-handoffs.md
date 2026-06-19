---
description: Design with handoff files between steps
argument-hint: "<goal>"
disable-model-invocation: true
---

<!--
Skills loaded by phase:
  Phase 1 (grill)      → /grill-with-docs + /domain-modeling — relentless interview; maintain CONTEXT.md glossary + ADRs inline
  Phase 2 (design)     → plan subagent                        — synthesize requirements into design spec
  Phase 3 (prototype)  → prototyper subagent                  — throwaway code to validate design
  Phase 4 (integrate)  → integrator subagent                  — fold prototype into production or delete

Human reviews handoff between each step.
Deep-module vocabulary: module, interface, depth, seam, adapter, leverage, locality.
-->

**YOU ARE THE ORCHESTRATOR.** Do NOT do this work yourself. Delegate every step to subagents using the `subagent` tool with `chain` parameter.

**Handoff rule:** Every subagent must load the handoff skill, use `handoff_write` to save to a `/tmp/` path, then return ONLY the file path. Do NOT create files in project root.

**Active participation:** Present findings concisely (3-5 bullets max). Ask ONE clear question at a time. Don't dump massive summaries.

Execute as a **chain** using handoff files between steps — human reviews after each phase:

1. **grill** → load `/grill-with-docs` + `/domain-modeling` in main chat
2. **plan** → writes design spec to handoff file
3. Human reviews handoff, appends clarifications/decisions
4. **prototyper** → reads updated handoff, builds prototype, writes findings to new handoff
5. Human reviews prototype handoff, appends verdict
6. **integrator** → reads final handoff, folds into production or deletes

```
subagent chain:
  - agent: plan
    task: $1 — Synthesize requirements into design spec. Use handoff skill and `handoff_write` tool to save structured findings. Return ONLY the handoff file path.
  - agent: prototyper
    task: Read design spec from handoff file: {previous}. Build prototype to validate it. Use handoff skill and `handoff_write` tool to save findings. Return ONLY the handoff file path.
  - agent: integrator
    task: Read prototype findings from handoff file: {previous}. Fold into production or delete. Use handoff skill and `handoff_write` tool for final summary. Return handoff file path.
```

**Before chain (orchestrator):** Load `/grill-with-docs` + `/domain-modeling` skills. Grill the user relentlessly — walk the design tree, sharpen fuzzy language, update CONTEXT.md glossary inline. When grilling is complete, proceed to subagent chain.

**After plan:** Summarize design spec and open questions. Ask: does this match your intent? Append clarifications to handoff file, then continue chain.

**After prototyper:** Summarize verdict (go/no-go), what worked/didn't. Ask: proceed with integration or iterate? Append decision to handoff file, then continue chain.

**Output:** Final handoff document path with complete decision trail.
