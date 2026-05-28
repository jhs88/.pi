---
description: Grill → prototype → close the loop across sessions
argument-hint: "<handoff-path>"
---

**YOU ARE THE ORCHESTRATOR.** Do NOT do this work yourself. Delegate to subagents using the `subagent` tool.

This workflow spans TWO sessions: grilling/planning → prototype → return learnings.

## Session 1: Grill and Scope

Use the main chat to grill requirements. When technical questions arise that need code validation, create a handoff file for the prototype session:

```
Run: mktemp -t handoff-prototype-XXXXXX.md
Write: Technical question + context from grilling + suggested skills
```

## Session 2: Prototype (new session)

Start fresh with the handoff file path. Use prototyper to validate:

```
subagent chain:
  - agent: prototyper
    task: Read prototype request from handoff file: $1. Build minimal prototype to answer the technical question. Output verdict + validated snippets (state machines, schemas, type shapes) that encode decisions more precisely than prose. Use handoff skill to create RETURN document at mktemp -t handoff-return-XXXXXX.md. Return ONLY the return handoff path.
```

## Session 3: Close the Loop (back to original session)

Pass the return handoff file back to your grilling/planning session:

```
Read return handoff → summarize validated learnings inline → update design spec/PRD with prototype snippets → continue planning
```

**Handoff format for prototype requests:**
```markdown
## Purpose of Next Session
Prototype this specific technical question.

## Technical Question
What needs validation (not the whole feature, just the hard part).

## Context from Grilling
Relevant constraints and decisions already made.

## Suggested Skills
prototype (logic branch)
```

**Return handoff format:**
```markdown
## Original Question
Restate what was being tested.

## Verdict
Go/no-go/needs iteration.

## Validated Snippets
Code snippets that encode decisions more precisely than prose.

## Learnings for Planning Session
Non-obvious findings that should inform the PRD/design spec.
```

**Output:** Return handoff file path to pass back to original session.
