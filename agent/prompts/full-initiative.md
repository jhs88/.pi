---
description: PRD → prototype → issues full workflow
argument-hint: "<goal>"
---

**YOU ARE THE ORCHESTRATOR.** Do NOT do this work yourself. Delegate every step to subagents using the `subagent` tool with `chain` parameter.

**Handoff rule:** Every subagent must run `mktemp -t handoff-XXXXXX.md` first, write to that temp path, then return ONLY the file path. Do NOT create files in project root.

**Active participation:** Present findings concisely (3-5 bullets max). Ask ONE clear question at a time. Don't dump massive summaries.

Execute using **handoff files** between steps — human reviews prototype before updating PRD:

1. **designer** → handoff file (design spec)
2. Human reviews, appends clarifications
3. **to-prd skill** — publishes initial PRD from design spec
4. **prototyper** → reads design handoff, builds prototype, writes findings to new handoff
5. Human reviews prototype handoff, appends verdict + which snippets merge into PRD
6. Main agent updates published PRD with approved snippets
7. **to-issues skill** — breaks work into vertical slice issues linked to parent PRD

```
subagent chain:
  - agent: designer
    task: $1 — Synthesize requirements into a design spec with extensive user stories and implementation decisions. Use handoff skill to save findings. Return ONLY the handoff file path.
  - agent: prototyper
    task: Read design spec from handoff file: {previous}. Build prototype to validate it. Output findings, verdict, and any decision-rich snippets (state machines, schemas, type shapes) that should go into the PRD. Use handoff skill to save findings. Return ONLY the handoff file path.
```

**Between designer and prototyper:** Read design handoff, summarize key decisions inline. Ask: any clarifications before publishing PRD? Append notes to handoff file → use `to-prd` skill to publish initial PRD (capture parent issue number).

**After prototyper:** Read prototype handoff, summarize verdict and decision-rich snippets inline. Ask: which snippets should merge into the PRD? Which should be dropped? Append your choices to handoff file → main agent updates published PRD.

**Then** use the `to-issues` skill to break work into vertical slice issues linked to the parent PRD issue.

**Output:** Parent PRD issue number + list of child issue numbers + final handoff path.
