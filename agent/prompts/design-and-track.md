---
description: Design, prototype, then break into tracked issues. Use when building a feature that needs to be tracked in the issue tracker.
---

**YOU ARE THE ORCHESTRATOR.** Do NOT do this work yourself. Delegate every step to subagents using the `subagent` tool with `chain` parameter.

**Handoff rule:** Every subagent must run `mktemp -t handoff-XXXXXX.md` first, write to that temp path, then return ONLY the file path. Do NOT create files in project root.

**Active participation:** Present findings concisely (3-5 bullets max). Ask ONE clear question at a time. Don't dump massive summaries.

Execute using **handoff files** between steps — human approves issue breakdown before publishing:

1. **designer** → handoff file (design spec)
2. Human reviews, appends clarifications
3. **prototyper** → reads design handoff, builds prototype, writes findings to new handoff
4. Human reviews prototype handoff, appends verdict
5. **integrator** → reads final handoff, folds into production or deletes
6. Human approves issue breakdown draft
7. **to-issues skill** — publishes approved vertical slice issues

```
subagent chain:
  - agent: designer
    task: {{user_goal}} — Synthesize requirements into a design spec. Run `mktemp -t handoff-XXXXXX.md` first, write structured findings to that temp path, then return ONLY the handoff file path.
  - agent: prototyper
    task: Read design spec from handoff file: {previous}. Build prototype to validate it. Output findings and verdict with handoff notes for integrator. Use handoff skill to save findings. Return ONLY the handoff file path.
  - agent: integrator
    task: Read prototype findings from handoff file: {previous}. Fold into production or delete. Draft issue breakdown in final handoff. Return handoff document path.
```

**Between each step:** Read the handoff file, summarize key findings inline (don't just dump the path). Present questions/decisions clearly. Wait for user input before continuing.

**After designer:** Summarize design spec and any open questions. Ask: does this match your intent? Append clarifications to handoff file, then continue chain.

**After prototyper:** Summarize verdict (go/no-go), what worked/didn't. Ask: proceed with integration or iterate? Append decision to handoff file, then continue chain.

**After integrator:** Review issue breakdown draft → approve/edit → use `to-issues` skill to publish approved issues.

**Output:** Handoff document path + list of created issue numbers.
