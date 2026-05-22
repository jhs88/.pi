---
description: Full initiative workflow — PRD first, then prototype validates, then issues. Use for big multi-phase work that needs formal tracking.
---

Execute as a **chain** of 5 steps:

1. **designer** — Grill requirements, produce design spec
2. **to-prd skill** — Publish initial PRD to issue tracker (apply `ready-for-agent` label)
3. **prototyper** — Validate the design with a throwaway prototype
4. **Update PRD** — Add prototype snippets/learnings back into the published PRD
5. **to-issues skill** — Break validated work into vertical slice issues linked to parent PRD

```
subagent chain:
  - agent: designer
    task: {{user_goal}} — Grill requirements, produce design spec with extensive user stories and implementation decisions. Output handoff notes for PRD creation.
```

**Then** use the `to-prd` skill to publish the initial PRD. Capture the parent issue number.

```
subagent chain:
  - agent: prototyper
    task: Review design spec from {previous}. Build prototype to validate it. Output findings, verdict, and any decision-rich snippets (state machines, schemas, type shapes) that should go into the PRD.
```

**Then** update the published PRD with prototype findings/snippets.

**Then** use the `to-issues` skill to break work into vertical slice issues linked to the parent PRD issue.

**Output:** Parent PRD issue number + list of child issue numbers.
