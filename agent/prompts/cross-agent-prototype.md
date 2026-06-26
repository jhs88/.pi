---
description: Grill → prototype → close the loop across sessions
argument-hint: "<handoff-path>"
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

This workflow spans three sessions: grilling → prototype → close loop.

## Session 1: Grill and Scope
Load `/grill-with-docs` in the main chat. Maintain CONTEXT.md/ADRs via domain-modeling as decisions crystallize. When a technical question needs code validation, create a compact handoff file containing: question, constraints, relevant snippets, success criteria, suggested skills.

## Session 2: Prototype
Launch a foreground prototyper. The handoff path is input `$1`:

```js
Agent({
  subagent_type: "prototyper",
  description: "validate handoff",
  thinking: "medium",
  max_turns: 12,
  prompt: "Read prototype request from handoff file: $1. Build a minimal throwaway prototype that answers the technical question. Return verdict + validated snippets (state machines, schemas, type shapes). If the result is too large, write /tmp/handoff-return-*.md and return that path."
})
```

## Session 3: Close the Loop
Read the prototyper result/return handoff. Summarize validated learnings inline, update design/PRD with prototype snippets, then continue planning.

Output: return handoff path if created, otherwise the inline prototype verdict.
