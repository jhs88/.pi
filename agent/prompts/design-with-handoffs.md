---
description: Design with human gates between steps
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

Human-gated chain: grill → plan → human review → prototyper → human review → integrator.

1. Main chat: load `/grill-with-docs` + `/domain-modeling`; sharpen requirements.
2. Launch `plan`:

```text
Agent fields:
  subagent_type: plan
  description: design spec
  thinking: high
  max_turns: 10
  prompt: |
    Goal: $1
    Grilled notes: <paste notes>
    Produce design spec and explicit prototyper instructions.
```

3. Summarize plan in 3-5 bullets. Ask: does this match intent? Capture clarifications.
4. Launch `prototyper` with plan + user notes pasted into prompt.
5. Summarize verdict. Ask: integrate, iterate, or stop?
6. If approved, launch `integrator` with design, prototype result, and user decision pasted into prompt.

Output: final decision trail, changed files, verification, and any artifact paths.
