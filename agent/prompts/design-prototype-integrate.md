---
description: Full design-to-integration workflow. Use when building a new feature from scratch or validating a major design decision.
---

Execute this as a **chain** of 3 agents:

1. **designer** — Grill user on requirements, produce design spec
2. **prototyper** — Build throwaway prototype to validate the design
3. **integrator** — Fold prototype into production or delete, create handoff doc

```
subagent chain:
  - agent: designer
    task: {{user_goal}}
  - agent: prototyper
    task: Review the design spec from {previous}. Build a prototype to validate it. Output handoff notes for the integrator.
  - agent: integrator
    task: Review prototype findings from {previous}. Fold into production code or delete prototype. Use handoff skill to create summary. Return the handoff document path.
```

**Output:** Final handoff document path and summary of what was built/decided.
