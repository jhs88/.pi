---
description: Design → prototype → integrate full workflow
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

Straight chain: grill in main chat, then plan → prototyper → integrator.

1. Main chat: load `/grill-with-docs`; resolve core requirements and constraints.
2. Launch plan:

```text
Agent fields:
  subagent_type: plan
  description: design spec
  thinking: high
  max_turns: 10
  prompt: |
    Goal: $1
    Grilled requirements: <insert notes>
    Synthesize a design spec with constraints, success criteria, domain model, module design, open questions, and prototyper instructions.
```

3. Launch prototyper with the plan result pasted explicitly:

```text
Agent fields:
  subagent_type: prototyper
  description: validate design
  thinking: medium
  max_turns: 12
  prompt: |
    Design spec:
    <paste plan result>

    Build a throwaway prototype to validate the riskiest assumption. Return verdict, files, command, and decision-rich snippets.
```

4. Launch integrator with plan + prototype result pasted explicitly:

```text
Agent fields:
  subagent_type: integrator
  description: integrate result
  thinking: high
  max_turns: 14
  prompt: |
    Design spec:
    <paste plan result>

    Prototype result:
    <paste prototype result>

    Fold validated pieces into production or delete prototype. Verify and report.
```

Output: final summary, changed files, verification, ADR/CONTEXT updates if any.
