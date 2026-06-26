---
description: PRD → prototype → issues full workflow
argument-hint: "<goal>"
disable-model-invocation: true
---

**YOU ARE THE ORCHESTRATOR.** Do not do this work yourself. Use the `Agent` tool from `@tintinweb/pi-subagents`.

**Agent contract:**
- Every `Agent` call must include `subagent_type`, `description` (3-5 words), and a self-contained `prompt`.
- Default to `inherit_context: false`; paste only the exact context the child needs into `prompt`.
- Use each agent's config defaults (`tools`, `skills`, `thinking`, `max_turns`) unless this workflow explicitly overrides them.
- Sequential handoff is explicit: summarize the prior result, then paste that summary/result into the next agent prompt. Do not use `{previous}`.
- Parallel work: issue multiple `Agent({ ..., run_in_background: true })` calls in one assistant message, then use `get_subagent_result({ agent_id, wait: true, verbose: false })` or completion notifications to gather results.
- Trust but verify: before reporting success, inspect changed files/tests yourself when agents wrote code.

**Active participation:** Present findings concisely (3-5 bullets max). Ask one clear question at gates. Do not dump raw transcripts unless asked.

Full initiative flow: grill → plan → PRD → prototype → domain updates → issues.

1. Main chat: load `/grill-with-docs`; resolve requirements and constraints.
2. Launch `plan`:

```text
Agent fields:
  subagent_type: plan
  description: initiative plan
  thinking: high
  max_turns: 10
  prompt: |
    Goal: $1
    Grilled notes: <notes>
    Produce design spec with user stories, success criteria, risks, and prototype instructions.
```

3. Main chat: load `/to-prd`; publish initial PRD from approved plan.
4. Launch `prototyper` with approved plan + PRD reference pasted into prompt; ask it to validate riskiest assumptions and return decision-rich snippets.
5. Human reviews prototype. If approved, update PRD with accepted snippets.
6. Main chat: load `/domain-modeling`; update CONTEXT.md/ADRs only where decisions crystallized.
7. Main chat: load `/to-issues`; break approved PRD into vertical slices linked to parent PRD.

Output: PRD link, prototype verdict, domain updates, issue links/IDs.
