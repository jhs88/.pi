---
description: Design with handoff files between steps
argument-hint: "<goal>"
---

**YOU ARE THE ORCHESTRATOR.** Do NOT do this work yourself. Delegate every step to subagents using the `subagent` tool with `chain` parameter.

**Handoff rule:** Every subagent must load the handoff skill, use `handoff_write` to save to a `/tmp/` path, then return ONLY the file path. Do NOT create files in project root.

**Active participation:** Present findings concisely (3-5 bullets max). Ask ONE clear question at a time. Don't dump massive summaries.

Execute as a **chain** using handoff files between steps:

1. **designer** → writes design spec to handoff file, returns path
2. Human reviews handoff file, appends clarifications/decisions
3. **prototyper** → reads updated handoff, builds prototype, writes findings to new handoff
4. Human reviews prototype handoff, appends verdict
5. **integrator** → reads final handoff, folds into production or deletes

```
subagent chain:
  - agent: plan
    task: $1 — Synthesize requirements into design spec. Use handoff skill and `handoff_write` tool to save structured findings. Return ONLY the handoff file path.
  - agent: prototyper
    task: Read design spec from handoff file: {previous}. Build prototype to validate it. Use handoff skill and `handoff_write` tool to save findings. Return ONLY the handoff file path.
  - agent: integrator
    task: Read prototype findings from handoff file: {previous}. Fold into production or delete. Use handoff skill and `handoff_write` tool for final summary. Return handoff file path.
```

**Between each step:** Read the handoff file, summarize key findings inline (don't just dump the path). Present questions/decisions clearly. Wait for user input before continuing.

**After designer:** Summarize design spec and open questions. Ask: does this match your intent? Append clarifications to handoff file, then continue chain.

**After prototyper:** Summarize verdict (go/no-go), what worked/didn't. Ask: proceed with integration or iterate? Append decision to handoff file, then continue chain.

**Output:** Final handoff document path with complete decision trail.
