---
description: Human-gated design → prototype → integration loop
argument-hint: "<goal>"
disable-model-invocation: true
---

Use this for normal feature/design work that fits in one parent session.

Rules:
- Use `Agent`; do not do child work in the parent session.
- Every child prompt must be self-contained. Assume `inherit_context: false`.
- Facts are discovered from repo/context; decisions belong to the human.
- Ask one decision question at a time. Do not implement until shared understanding is confirmed.
- Verify artifacts yourself before reporting success.

1. Shape the goal in the parent session. Use `/skill:grill-with-docs` and `/skill:domain-modeling` if the repo has those skills available. For architectural deepening, use module/interface/depth/seam/adapter/leverage/locality language.

2. Launch `plan`:

```text
Agent fields:
  subagent_type: plan
  description: design spec
  prompt: |
    Goal: $1
    Requirements/decisions so far:
    <paste notes>

    Produce a compact spec: constraints, success criteria, module design, open questions, and prototype/build instructions.
```

3. Review plan with the human. Ask exactly one gate question: does this match intent, or what single decision blocks progress?

4. If uncertainty remains about behavior or UI, launch `prototyper`; otherwise skip to build/integrator:

```text
Agent fields:
  subagent_type: prototyper
  description: validate design
  prompt: |
    Spec:
    <paste plan result + human clarifications>

    Build a throwaway prototype for the riskiest assumption. Return verdict, command, files, and decision-rich snippets.
```

5. Human gate: integrate, iterate, or stop.

6. Launch `integrator` for prototype-backed work, or `build` for direct implementation:

```text
Agent fields:
  subagent_type: build
  description: implement slice
  prompt: |
    Spec/ticket:
    <paste approved spec or slice>

    Implement the smallest useful slice. Use TDD where practical at agreed seams. Run focused verification and report exact output. No commit/push.
```

7. Launch `reviewer` for read-only review of the diff before final report.

Output: decision trail, changed files, verification, review result, next ticket if any.
