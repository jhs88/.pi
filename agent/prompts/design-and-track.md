---
description: Design, prototype, then break into tracked issues. Use when building a feature that needs to be tracked in the issue tracker.
---

Execute as a **chain** of 4 steps:

1. **designer** — Grill requirements, produce design spec
2. **prototyper** — Validate the design with a throwaway prototype
3. **integrator** — Fold prototype into production or delete
4. **to-issues skill** — Break validated work into vertical slice issues

```
subagent chain:
  - agent: designer
    task: {{user_goal}} — Grill requirements, produce design spec. Output handoff notes for prototyper.
  - agent: prototyper
    task: Review design spec from {previous}. Build prototype to validate it. Output findings and verdict with handoff notes for integrator.
  - agent: integrator
    task: Review prototype findings from {previous}. Fold into production or delete. Use handoff skill. Return handoff document path.
```

**Then** use the `to-issues` skill to break the validated work into vertical slice issues on the issue tracker. Pass the integrator's output as context.

**Output:** Handoff document path + list of created issue numbers.
