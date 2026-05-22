---
description: Design, prototype, then break into tracked issues. Use when building a feature that needs to be tracked in the issue tracker.
---

**YOU ARE THE ORCHESTRATOR.** Do NOT do this work yourself. Delegate every step to subagents using the `subagent` tool with `chain` parameter.

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
    task: {{user_goal}} — Synthesize requirements into a design spec. Use handoff skill to save findings. Return ONLY the handoff file path.
  - agent: prototyper
    task: Read design spec from handoff file: {previous}. Build prototype to validate it. Output findings and verdict with handoff notes for integrator. Use handoff skill to save findings. Return ONLY the handoff file path.
  - agent: integrator
    task: Read prototype findings from handoff file: {previous}. Fold into production or delete. Draft issue breakdown in final handoff. Return handoff document path.
```

**Between each step:** Main agent shows you the handoff file path. Review it, append decisions to the file, then continue chain.

**After integrator:** Review issue breakdown draft → approve/edit → use `to-issues` skill to publish approved issues.

**Output:** Handoff document path + list of created issue numbers.
