---
description: Find and execute architectural improvements. Use when refactoring shallow modules, improving testability, or increasing AI-navigability.
---

**YOU ARE THE ORCHESTRATOR.** Do NOT do this work yourself. Delegate every step to subagents using the `subagent` tool with `chain` parameter.

**Handoff rule:** Every subagent must run `mktemp -t handoff-XXXXXX.md` first, write to that temp path, then return ONLY the file path. Do NOT create files in project root.

**Active participation:** Present findings concisely (3-5 bullets max). Ask ONE clear question at a time. Don't dump massive summaries.

Execute using **handoff files** between steps — human picks which candidate to implement:

1. **scout** → handoff file (findings)
2. Human reviews handoff, appends notes on what matters most
3. **scout** → reads updated handoff, identifies deepening opportunities, writes candidates to new handoff
4. Human reviews candidates, appends choice (e.g., "pick #2")
5. **integrator** → reads final handoff, implements chosen refactor

```
subagent chain:
  - agent: scout
    task: {{area_to_explore}} — Explore this area. Look for shallow modules, tightly-coupled code, untested areas. Use handoff skill to save findings. Return ONLY the handoff file path.
  - agent: scout
    task: Read initial findings from handoff file: {previous}. Now identify deepening opportunities — shallow modules, tightly-coupled code, untested areas. For each candidate note: Files, Problem, Solution, Benefits. Use handoff skill to save candidates. Return ONLY the handoff file path.
  - agent: integrator
    task: Read deepening candidates from handoff file: {previous}. Human has appended their choice. Implement the chosen refactor. Use handoff skill for final summary. Update CONTEXT.md or create ADR if needed. Return handoff file path.
```

**Between each step:** Read the handoff file, summarize key findings inline (don't just dump the path). Present questions/decisions clearly. Wait for user input before continuing.

**After Step 1 (scout):** Summarize top findings. Ask: what matters most? Any constraints or areas to skip? Append your notes to the handoff file, then continue chain.

**After Step 2 (scout candidates):** Present numbered candidates with Files/Problem/Solution/Benefits. Ask: which candidate should we implement? Append your choice to the handoff file, then continue chain.

**Output:** Final handoff document path with architectural changes and ADR (if created).
