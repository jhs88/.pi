---
description: Route huge or foggy work through the canonical Wayfinder flow
argument-hint: "<goal>"
disable-model-invocation: true
---

Use this wrapper only when the route is unclear, too large for one practical context window, or needs research/prototypes before a spec. The canonical workflow is:

`wayfinder → to-spec → to-tickets → implement → code-review → human review`

Delegate the current invocation to the `wayfinder` skill and follow that skill exactly. Do not recreate its orchestration here.

Rules:
- Facts are discovered; decisions are human-owned.
- Confirm the tracker and publication scope before writing tracker artifacts unless the user explicitly supplied them and asked to publish.
- When given a loose goal, chart the map and stop. Do not resolve a ticket in the charting session.
- When given an existing map, claim and resolve at most one unblocked frontier ticket in this session.
- Preserve native child and blocking relationships where the tracker supports them.
- Decision tickets may research, grill, prototype, or perform a prerequisite task; they do not implement the destination.
- Use a fresh context window for each ticket. Do not carry an entire map into every worker.
- Do not advance to `to-spec` until the map is complete.
- Do not advance from an approved spec to `to-tickets` without human approval.
- Do not commit, push, or open a PR without explicit instruction.

Output only the artifact and status for this invocation: map or ticket name/link, decision recorded if any, remaining blockers, and the next frontier ticket. Do not execute later workflow phases in the same session.
