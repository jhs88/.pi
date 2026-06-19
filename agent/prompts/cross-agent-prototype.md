---
description: Grill → prototype → close the loop across sessions
argument-hint: "<handoff-path>"
disable-model-invocation: true
---

<!--
Skills loaded by phase:
  Session 1 (grill)    → /grill-with-docs               — relentless interview; maintains CONTEXT.md + ADRs via domain-modeling
  Session 2 (prototype)→ /prototype                     — throwaway code to answer the technical question from grilling
  Handoff format       → /handoff                       — compact conversation to markdown with "suggested skills" section

Deep-module vocabulary: module, interface, depth, seam, adapter, leverage, locality.
-->

**YOU ARE THE ORCHESTRATOR.** Do NOT do this work yourself. Delegate to subagents using the `subagent` tool.

This workflow spans THREE sessions: grilling → prototype → close loop.

## Session 1: Grill and Scope

Load `/grill-with-docs` skill in the main chat to grill requirements relentlessly. Maintain CONTEXT.md glossary and ADRs inline via domain-modeling as decisions crystallize.

When a technical question arises that needs code validation, load `/handoff` skill to create a handoff file for the prototype session:

```
Use /handoff skill — include "suggested skills" section recommending /prototype (logic branch).
Save to `/tmp/handoff-prototype-*.md`.
Return the handoff file path.
```

## Session 2: Prototype (new session)

Start fresh with the handoff file path. Load `/prototype` skill and delegate to prototyper:

```
subagent chain:
  - agent: prototyper
    task: Read prototype request from handoff file: $1. Load /prototype skill — build minimal throwaway prototype to answer the technical question. Output verdict + validated snippets (state machines, schemas, type shapes) that encode decisions more precisely than prose. Use /handoff skill and `handoff_write` tool to create RETURN document at `/tmp/handoff-return-*.md`. Return ONLY the return handoff path.
```

## Session 3: Close the Loop (back to original session)

Pass the return handoff file back to your grilling/planning session:

```
Read return handoff → summarize validated learnings inline → update design spec/PRD with prototype snippets → continue planning
```

**Output:** Return handoff file path to pass back to original session.
