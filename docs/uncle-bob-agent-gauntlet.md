# Gauntlet rationale

This Pi configuration adapts ideas from [Matt Pocock's interview with Robert C. Martin](https://www.youtube.com/watch?v=zcLPGC-tvgk) and the later [SwarmForge six-pack](https://github.com/unclebob/swarm-forge/tree/8e83a09a41a7970edf8107f074cc41c12b953a08). The exact six-role Pi setup is our adaptation, not a prescription from the interview.

```text
specifier → coder → cleaner → architect → hardener → qa
```

| Role | Responsibility | Authority |
|---|---|---|
| `specifier` | Define observable acceptance and verification commands | Read-only |
| `coder` | Implement the smallest approved behavior with tests | Bounded edits |
| `cleaner` | Simplify without changing behavior | Bounded edits |
| `architect` | Check human-approved boundaries | Read-only; no strategic redesign |
| `hardener` | Expose weak tests, edge cases, and robustness failures | Bounded tests and fixes |
| `qa` | Verify the contract against fresh parent-run evidence | Read-only; never fixes its findings |

Separate contexts are useful when responsibility, authority, or required evidence changes. Another persona alone does not justify a stage. The spoken interview describes five tactical roles; the later SwarmForge pipeline adds Architect.

## Evidence and failure routing

Use repository-declared tests, typechecks, dependency rules, and applicable coverage, complexity, or mutation checks. No universal threshold substitutes for an appropriate oracle. Coverage proves execution, not useful assertions; mutation testing does not establish complete requirements; fresh review does not guarantee independence.

Each handoff references the approved contract, complete diff, exact command output, and unresolved risks. A previous `PASS` is a claim to verify. The parent reruns checks immediately before QA; missing evidence blocks acceptance.

The parent routes ambiguous behavior to Specifier, implementation defects to Coder, local complexity to Cleaner, and robustness failures to Hardener. Architect diagnoses boundary violations; the human approves strategic changes. After repair, rerun the owning stage and downstream gates.

## When to use it

Use `agent-gauntlet` for consequential changes that justify six serial contexts and repeated verification. Use `build`, `scout`, `docs`, or a prototype for smaller work. Prefer short feedback cycles over speculative long plans.

Humans own product meaning, architecture, risk, and approval to commit, push, merge, release, or deploy. The gauntlet gathers evidence; it does not grant that authority. The executable procedure remains in [the skill](../agent/skills/agent-gauntlet/SKILL.md).
