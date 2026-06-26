---
description: Explore + prototype options in parallel
argument-hint: "<area> <option-A> <option-B>"
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

Execute as **parallel background agents**, then synthesize:

```js
Agent({
  subagent_type: "explore",
  description: "explore area",
  run_in_background: true,
  prompt: "$1 — Explore this area. Return compressed findings on current architecture, seams, friction points, and files to inspect first."
})
Agent({
  subagent_type: "prototyper",
  description: "prototype option A",
  run_in_background: true,
  prompt: "$2 — Build a throwaway prototype for this approach. Return verdict, runnable command, files changed/created, and decision-rich snippets."
})
Agent({
  subagent_type: "prototyper",
  description: "prototype option B",
  run_in_background: true,
  prompt: "$3 — Build a throwaway prototype for this alternative. Return verdict, runnable command, files changed/created, and decision-rich snippets."
})
```

After all finish: read relevant files if prototypes wrote code, compare results side-by-side, and ask which direction to take. Output a comparison table + recommendation + next step.
