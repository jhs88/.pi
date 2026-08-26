---
description: Explore and compare options in parallel
argument-hint: "<area> <option-A> <option-B>"
disable-model-invocation: true
---

Use this when two concrete approaches should be compared before choosing.

Rules:
- Use background `Agent` calls in one message.
- Prompts are self-contained; assume `inherit_context: false`.
- Verify files if prototypes write code.
- Ask one human gate question before integration.

Launch in parallel:

```js
Agent({
  subagent_type: "scout",
  description: "explore area",
  run_in_background: true,
  prompt: "$1 — Explore this area. Return compressed facts: current architecture, seams, friction points, key files, and first verification command."
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

After completion: inspect touched files if any, compare options, recommend one, then ask: choose A, choose B, iterate, or stop?
