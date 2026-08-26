---
name: compare-prototypes
description: Use when two concrete approaches need parallel runnable prototypes and a human choice.
disable-model-invocation: true
---

# Compare prototypes

Use this for two already-defined alternatives whose important difference is easier to judge in running artifacts than prose. Use `codebase-design` design-it-twice when the question is only an interface shape. Use `wayfinder` when the alternatives are not yet concrete.

## Prepare

1. Fix one decision question and two named alternatives.
2. Record shared constraints, the writable repository, disposable paths or worktrees, forbidden effects, and the observations that would distinguish the alternatives.
3. Preflight the `Agent` tool's advertised types. Require exact `scout` and `build` entries; stop if either is absent. Never attempt an unknown type because the extension falls back to a mutable `general-purpose` agent even while defaults are hidden.
4. Load `prototype`. Load `codebase-design` when module interfaces or seams are part of the comparison.

## Run one bounded wave

Launch three background agents together, subject to the configured concurrency limit:

- one fresh `scout` to report current structure, relevant seams, key files, and the smallest verification command;
- one fresh `build` in an isolated worktree to prototype alternative A;
- one fresh `build` in a separate isolated worktree to prototype alternative B.

Each prompt is self-contained. Both builders receive the same question, constraints, evidence bar, active prototype procedure, and output contract. They may not integrate, commit to the canonical branch, push, publish, or spawn more agents.

## Compare

After completion, the parent:

1. inspects both worktrees and runs each advertised command;
2. compares the alternatives against the predeclared observations;
3. separates measured evidence from judgment;
4. records meaningful differences, shared failures, and unverified claims;
5. asks the human to choose A, choose B, iterate, or stop.

The chosen prototype remains evidence, not production code. Hand approved behavior to `design-loop`, `to-spec`, or `agent-gauntlet` for implementation. Clean up disposable worktrees only after preserving any context pointer required by `prototype`.
