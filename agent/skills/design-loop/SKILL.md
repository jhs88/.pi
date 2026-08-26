---
name: design-loop
description: Use for one-session human-gated design, optional prototyping, implementation, and review.
disable-model-invocation: true
---

# Design loop

Use this when the goal is small enough for one parent session but still needs a human decision before implementation. Use `wayfinder` when the route spans several sessions or the open decisions cannot fit in one practical context.

The parent owns every user question and gate. Children start fresh, receive self-contained prompts, and never decide for the human.

Before the first `Agent` call, preflight the tool's advertised types and require every type this run will use: `build` for an optional prototype or small flexible implementation, plus all six gauntlet types when implementation will invoke `agent-gauntlet`. Stop if a required name is absent. Never attempt an unknown type: this extension falls back to a mutable `general-purpose` agent even while defaults are hidden.

## Shape the decision

1. Load `grill-with-docs` and `domain-modeling` when available.
2. Inspect repository facts before asking for human knowledge.
3. Resolve the unblocked decision frontier using the loaded skill's current interaction rules.
4. State the intended behavior, constraints, accepted seams, and executable checks.
5. Ask the human to confirm the design or identify the blocking decision.

Complete this phase only when the human approves the design. For a durable specification or ticket set, use `to-spec` and `to-tickets` rather than duplicating their formats here.

## Raise fidelity when needed

If behavior, state, or appearance is still hard to judge in prose:

1. Load `prototype`.
2. Launch a fresh `build` agent in a disposable worktree or clearly marked throwaway path. Pass the question, approved constraints, active prototype procedure, runnable-command requirement, and forbidden release actions.
3. Inspect the returned artifact and run command independently.
4. Ask the human to choose integrate, iterate, or stop.

A prototype answers one question. It does not authorize production integration.

## Implement the approved result

Use `agent-gauntlet` for consequential production changes or when independent stage gates matter. Use a bounded fresh `build` agent only for a smaller flexible change. In either case, pass the approved contract and exact repository checks. Commit, push, publish, and deploy remain separate permissions.

If a prototype was approved, production code reimplements the validated decision. Keep the prototype only where the `prototype` skill requires a primary-source branch or context pointer.

## Review and close

Run `code-review` or `thermos` when its independent review value matches the change. The parent verifies artifacts and commands before reporting completion.

Return the decision trail, changed files, exact verification, review findings, unresolved risks, and unperformed release actions.
