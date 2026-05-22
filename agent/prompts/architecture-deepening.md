---
description: Find and execute architectural improvements. Use when refactoring shallow modules, improving testability, or increasing AI-navigability.
---

Execute as a **chain** of 3 agents:

1. **scout** — Explore codebase, find shallow modules and friction points
2. **architect** — Identify deepening opportunities, present candidates for human review
3. **integrator** — Implement the chosen deepening, document with handoff

```
subagent chain:
  - agent: scout
    task: {{area_to_explore}} — Explore this area of the codebase. Look for shallow modules, tightly-coupled code, untested areas. Output compressed findings.
  - agent: architect
    task: Review scout findings from {previous}. Identify deepening opportunities. Present candidates to user (Files, Problem, Solution, Benefits). Wait for user to pick one. Output the chosen candidate details.
  - agent: integrator
    task: Review the chosen deepening opportunity from {previous}. Implement the refactor. Use handoff skill to document changes. Update CONTEXT.md or create ADR if needed.
```

**Output:** Handoff document path and summary of architectural changes made.
