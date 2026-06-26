---
description: Skip design, jump straight to prototyping
argument-hint: "<idea>"
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

Execute a two-agent chain with a human gate:

1. Launch prototyper:

```text
Agent fields:
  subagent_type: prototyper
  description: prototype idea
  thinking: medium
  max_turns: 12
  prompt: |
    $1 — Build a throwaway prototype to explore this. Decide whether it is a logic prototype or UI prototype.
    Return verdict, runnable command, changed/created files, and decision-rich snippets for integration.
```

2. Summarize go/no-go and ask: fold into production, iterate, or delete?
3. If approved, launch integrator:

```text
Agent fields:
  subagent_type: integrator
  description: integrate prototype
  thinking: high
  max_turns: 14
  prompt: |
    Prototype result:
    <paste prototyper result>

    Decision: <user decision>
    Fold validated pieces into production or delete prototype. Create ADR/CONTEXT updates only if warranted.
    Return actions taken, verification, and any handoff path.
```

Output final verdict + changed files + verification.
