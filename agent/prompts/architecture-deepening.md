---
description: Find and execute architectural improvements. Use when refactoring shallow modules, improving testability, or increasing AI-navigability.
---

Execute using **handoff files** between steps — human picks which candidate to implement:

1. **scout** → handoff file (findings)
2. Human reviews handoff, appends notes on what matters most
3. **architect** → reads updated handoff, writes candidates to new handoff
4. Human reviews candidates, appends choice (e.g., "pick #2")
5. **integrator** → reads final handoff, implements chosen refactor

```
subagent chain:
  - agent: scout
    task: {{area_to_explore}} — Explore this area. Look for shallow modules, tightly-coupled code, untested areas. Use handoff skill to save findings. Return ONLY the handoff file path.
  - agent: architect
    task: Read scout findings from handoff file: {previous}. Identify deepening opportunities (Files, Problem, Solution, Benefits). Use handoff skill to save candidates. Return ONLY the handoff file path.
  - agent: integrator
    task: Read architect candidates from handoff file: {previous}. Human has appended their choice. Implement the chosen refactor. Use handoff skill for final summary. Update CONTEXT.md or create ADR if needed. Return handoff file path.
```

**Between each step:** Main agent shows you the handoff file path. Review it, append your decision to the file, then continue chain.

**Output:** Final handoff document path with architectural changes and ADR (if created).
