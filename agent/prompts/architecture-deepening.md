---
description: Find and execute architectural improvements
argument-hint: "<area>"
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

Flow: explore → human chooses candidate → grill in main chat → integrator.

1. Launch `explore`:

```text
Agent fields:
  subagent_type: explore
  description: find deepening
  thinking: medium
  max_turns: 10
  prompt: |
    $1 — Explore this area for architectural deepening opportunities.
    Use deep-module vocabulary: module, interface, depth, seam, adapter, leverage, locality.
    Return top candidates with files, problem, benefit, risk, and first test to run.
```

2. Summarize top 3 candidates. Ask which candidate to grill.
3. Main chat: load `/grill-with-docs`; walk the design tree for chosen candidate; update CONTEXT.md/ADRs if warranted.
4. Launch `integrator`:

```text
Agent fields:
  subagent_type: integrator
  description: deepen module
  thinking: high
  max_turns: 14
  prompt: |
    Chosen deepening candidate:
    <paste candidate>

    Grilling decisions:
    <paste decisions>

    Implement the approved refactor. Keep diffs minimal, update CONTEXT.md/ADR if warranted, run verification, and report changed files.
```

Output: architectural change summary, verification, ADR/CONTEXT paths if created.
