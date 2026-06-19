---
description: PRD → prototype → issues full workflow
argument-hint: "<goal>"
disable-model-invocation: true
---

<!--
Skills loaded by phase:
  Phase 1 (grill)      → /grill-with-docs               — relentless interview; maintains CONTEXT.md + ADRs via domain-modeling
  Phase 2 (design)     → plan subagent                        — synthesize requirements into design spec with user stories
  Phase 3 (PRD)        → /to-prd                            — publish PRD from design spec to issue tracker
  Phase 4 (prototype)  → prototyper subagent                  — throwaway code to validate design; produce decision-rich snippets
  Phase 5 (domain)     → /domain-modeling                   — update CONTEXT.md after prototype learnings crystallize
  Phase 6 (issues)     → /to-issues                           — break PRD into vertical slice issues linked to parent

Human reviews prototype before updating PRD.
Deep-module vocabulary: module, interface, depth, seam, adapter, leverage, locality.
-->

**YOU ARE THE ORCHESTRATOR.** Do NOT do this work yourself. Delegate every step to subagents using the `subagent` tool with `chain` parameter.

**Handoff rule:** Every subagent must load the handoff skill, use `handoff_write` to save to a `/tmp/` path, then return ONLY the file path. Do NOT create files in project root.

**Active participation:** Present findings concisely (3-5 bullets max). Ask ONE clear question at a time. Don't dump massive summaries.

Execute using **handoff files** between steps — human reviews prototype before updating PRD:

1. **grill** → load `/grill-with-docs` skill in main chat
2. **plan** → handoff file (design spec with user stories)
3. Human reviews, appends clarifications
4. **/to-prd** — publish initial PRD from design spec
5. **prototyper** → reads design handoff, builds prototype, writes findings to new handoff
6. Human reviews prototype handoff, appends verdict + which snippets merge into PRD
7. Main agent updates published PRD with approved snippets
8. **/domain-modeling** — update CONTEXT.md glossary with any new terms from prototype learnings
9. **/to-issues** — break work into vertical slice issues linked to parent PRD

```
subagent chain:
  - agent: plan
    task: $1 — Synthesize requirements into a design spec with extensive user stories and implementation decisions. Use handoff skill and `handoff_write` tool to save findings. Return ONLY the handoff file path.
  - agent: prototyper
    task: Read design spec from handoff file: {previous}. Build prototype to validate it. Output findings, verdict, and any decision-rich snippets (state machines, schemas, type shapes) that should go into the PRD. Use handoff skill and `handoff_write` tool to save findings. Return ONLY the handoff file path.
```

**Before chain (orchestrator):** Load `/grill-with-docs` skill. Grill the user relentlessly — walk the design tree, sharpen fuzzy language, maintain CONTEXT.md via domain-modeling. When grilling is complete, proceed to subagent chain.

**Between plan and prototyper:** Read design handoff, summarize key decisions inline. Ask: any clarifications before publishing PRD? Append notes to handoff file → use `/to-prd` skill to publish initial PRD (capture parent issue number).

**After prototyper:** Read prototype handoff, summarize verdict and decision-rich snippets inline. Ask: which snippets should merge into the PRD? Which should be dropped? Append your choices to handoff file → main agent updates published PRD.

**Then** load `/domain-modeling` skill to update CONTEXT.md glossary with any new terms that crystallized during prototyping.

**Finally** use `/to-issues` skill to break work into vertical slice issues linked to the parent PRD issue.

**Output:** Parent PRD issue number + list of child issue numbers + final handoff path.
