---
description: Design workflow using handoff files as communication channel. Keeps context low by passing file paths instead of full content. Use when you want structured intermediate review points.
---

Execute as a **chain** using handoff files between steps:

1. **designer** → writes design spec to handoff file, returns path
2. Human reviews handoff file, appends clarifications/decisions
3. **prototyper** → reads updated handoff, builds prototype, writes findings to new handoff
4. Human reviews prototype handoff, appends verdict
5. **integrator** → reads final handoff, folds into production or deletes

```
subagent chain:
  - agent: designer
    task: {{user_goal}} — Synthesize requirements into design spec. Use handoff skill to save structured findings. Return ONLY the handoff file path.
  - agent: prototyper
    task: Read design spec from handoff file: {previous}. Build prototype to validate it. Use handoff skill to save findings. Return ONLY the handoff file path.
  - agent: integrator
    task: Read prototype findings from handoff file: {previous}. Fold into production or delete. Use handoff skill for final summary. Return handoff file path.
```

**Between each step:** Main agent shows you the handoff file path. Review it, append decisions/questions to the file, then continue chain with updated file.

**Output:** Final handoff document path with complete decision trail.
