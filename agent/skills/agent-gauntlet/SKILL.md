---
name: agent-gauntlet
description: Run a fresh-context Specifier→Coder→Cleaner→Architect→Hardener→QA engineering gauntlet with executable gates and human-owned architecture.
disable-model-invocation: true
---

# Agent Gauntlet

Use this skill for implementation that benefits from independent role boundaries. The parent orchestrates; children do not spawn children.

## Intake

1. Record the goal, writable repository, reference-only sources, preserved behavior, forbidden side effects, and acceptance checks.
2. Preflight the `Agent` tool's advertised types. Require the exact names `specifier`, `coder`, `cleaner`, `architect`, `hardener`, and `qa`; stop before mutation if any is absent. Unknown types can fall back to a general agent and therefore are never attempted.
3. Keep model/provider selection inherited. None of the six role files pins a model, so an unavailable model cannot silently reroute a role. Use one foreground child at a time unless the user explicitly authorizes another policy.
4. Discover verification commands from the repository. A missing gate is `UNAVAILABLE`, never a pass.

## Serial pipeline

Launch each role through `Agent` with `inherit_context` left at its configured `false` value. Every prompt is self-contained: goal, paths, approved decisions, current artifact or diff, exact prior evidence, forbidden actions, and expected handoff.

1. `specifier` — produce the behavioral contract. Stop for the human on `BLOCKED`.
2. `coder` — implement the smallest approved slice.
3. `cleaner` — simplify without changing behavior.
4. `architect` — read-only audit against human-approved boundaries. The parent executes architecture checks and supplies their output; the parent/user owns strategic decisions.
5. `hardener` — run deeper available gates and make bounded evidence-driven fixes.
6. Before QA, the parent reruns every required acceptance and regression command and captures exact fresh output. Launch `qa` with `Mode: gauntlet acceptance` and that evidence for an independent, mechanically read-only acceptance gate.

Use foreground calls so a stage starts only after its predecessor's handoff is inspected. Pass a compact handoff rather than the parent transcript. Preserve transcript paths as evidence when supplied by the subagent extension.

## Failure routing

- Specification ambiguity → fresh `specifier`, then human if still blocked.
- Behavior or regression defect → fresh `coder`.
- Local complexity defect → fresh `cleaner`.
- Approved-boundary violation → `architect` diagnoses, the parent chooses `coder` or `cleaner` to repair, then a fresh `architect` verifies; strategic choice → human.
- Robustness, test-strength, security, coverage, complexity, or mutation weakness → fresh `hardener` unless implementation owns the defect.
- QA never fixes its own finding; route it to the named owner.

After a fix, rerun that role and every downstream gate. Allow one automatic repair loop per failed stage; a second failure returns to the human with evidence.

## Completion

Complete only when QA returns `PASS` and the parent independently checks:

- every changed file is in scope;
- every required command has a fresh exact outcome supplied to QA;
- unavailable gates are named;
- architecture decisions were human-approved;
- no forbidden side effect occurred;
- the final diff matches the specification.

Report changed files, commands, transcripts, unresolved risks, and unperformed release actions. A completed gauntlet does not authorize commit, push, merge, publish, or deploy.
