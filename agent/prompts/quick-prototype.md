---
description: Prototype one concrete uncertainty
argument-hint: "<question-or-idea>"
disable-model-invocation: true
---

Use this when one design question needs a cheap concrete artifact before deciding.

Rules:
- Use `Agent`; do not build it in the parent session.
- Pass a self-contained prompt. Assume `inherit_context: false`.
- Ask one human gate question before integration.
- Verify changed files/tests yourself before reporting success.

1. Launch `prototyper`:

```text
Agent fields:
  subagent_type: prototyper
  description: prototype idea
  prompt: |
    Question: $1
    Build a throwaway logic/UI prototype that answers this question.
    Return: verdict, runnable command, changed/created files, and decision-rich snippets.
```

2. Summarize verdict in 3-5 bullets and ask: integrate, iterate, or delete?

3. If approved, launch `integrator`:

```text
Agent fields:
  subagent_type: integrator
  description: integrate prototype
  prompt: |
    Prototype result:
    <paste result>

    Human decision:
    <paste decision>

    Fold validated pieces into production or delete the prototype. Verify and report changed files.
```

Output: verdict, final action, changed files, verification.
