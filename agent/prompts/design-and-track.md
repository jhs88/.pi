---
description: Design, prototype, then break into tracked issues
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

Human-gated chain ending in issue creation:

1. Main chat: load `/grill-with-docs` + `/domain-modeling`; resolve requirements.
2. Launch `plan`:

```text
Agent fields:
  subagent_type: plan
  description: design spec
  thinking: high
  max_turns: 10
  prompt: |
    Goal: $1
    Grilled requirements: <notes>
    Produce design spec, success criteria, and issue-slice hints.
```

3. Review plan with human; paste clarifications into prototyper prompt.
4. Launch `prototyper` with the approved design; ask for verdict and issue-slice implications.
5. Review prototype verdict with human; decide integrate/iterate/stop.
6. Launch `integrator` if approved; paste plan + prototype + user decision.
7. Main chat: load `/to-issues`; turn approved design/integration summary into vertical-slice issues.

Output: issue-ready summary + links/IDs after `/to-issues` runs.
