# The Uncle Bob agent gauntlet

This guide explains the engineering philosophy behind this repository's six-role pipeline:

```text
Specifier → Coder → Cleaner → Architect → Hardener → QA
```

It is an adaptation, not a claim that Robert C. Martin prescribed this exact Pi configuration.

## Sources and limits

Primary sources:

- Matt Pocock's interview, ["LIVE: Uncle Bob on Software Fundamentals in the Age of AI"](https://www.youtube.com/watch?v=zcLPGC-tvgk), 56:39.
- Robert C. Martin's later [SwarmForge](https://github.com/unclebob/swarm-forge) documentation, compared at pinned revision [`8e83a09`](https://github.com/unclebob/swarm-forge/tree/8e83a09a41a7970edf8107f074cc41c12b953a08).

Interview timestamps below are approximate because the analysis used an automatic transcript. Claims about the later six-role implementation come from the pinned repository, not the interview. Design conclusions labeled as this repository's choices are adaptations made for Pi.

## The argument in chronological order

### 1. Cheap code exposed expensive cleanup

At [04:25–08:54](https://www.youtube.com/watch?v=zcLPGC-tvgk&t=265s), Martin describes early coding agents as fast but messy. Cleaning their output made the human the bottleneck. He began using agent speed for repetitive quality work that people often skip because it is slow, including CRAP analysis and mutation testing.

The useful unit is therefore not generated code per minute. It is the complete system's ability to produce justified, maintainable behavior.

### 2. Technical debt also degrades the agent

At [10:52–12:10](https://www.youtube.com/watch?v=zcLPGC-tvgk&t=652s), Martin describes agents slowing down, breaking adjacent behavior, circling through repairs, and sometimes giving up as disorder accumulates.

Clean code is not merely a human aesthetic. A focused module reduces how many concepts the next worker must reconstruct. Small interfaces, deliberate dependencies, meaningful names, and strong tests reduce both human and model context load.

### 3. Executable constraints beat giant prompts

At [12:55–17:37](https://www.youtube.com/watch?v=zcLPGC-tvgk&t=775s), long instructions about clean code and TDD become weak "guidelines" as context grows. Martin's response is to shorten the initial prompt and make tools enforce the desired result:

- compile and type-check;
- run unit and acceptance tests;
- inspect coverage and complexity;
- run mutation tests where useful;
- enforce dependency rules;
- execute the real user path.

A deterministic tool is not a correctness oracle by itself. It is a repeatable gate against a rule that a human or system designer chose.

### 4. Narrow, disposable roles reset context and incentives

At [19:17–22:27](https://www.youtube.com/watch?v=zcLPGC-tvgk&t=1157s), Martin describes agents that are born, do one task, and die. The spoken pipeline contains five tactical roles:

```text
Specifier → Coder → Cleaner → Hardener → QA
```

- **Specifier** turns human intent into Gherkin acceptance behavior and a human-view QA procedure.
- **Coder** writes tests and implementation until the acceptance behavior passes.
- **Cleaner** reduces implementation mess and measured complexity without changing behavior.
- **Hardener** uses mutation testing and related checks to expose weak tests.
- **QA** turns the user-level procedure into an executable system check with a deterministic result.

Matt Pocock's simpler version in the same discussion is an implementer followed by a fresh reviewer. His warning is that role count is not the point. A decorative swarm adds cost without producing a new responsibility or new evidence.

### 5. Architecture remains a control problem

At [26:06–31:09](https://www.youtube.com/watch?v=zcLPGC-tvgk&t=1566s), Martin says he still inspects and reorganizes module structure, visualizes dependencies, and encodes allowed dependency directions as executable rules. He had not reduced strategic architecture to a reliable agent procedure.

His later SwarmForge `six-pack` adds a dedicated Architect between Cleaner and Hardener. That repository evidence postdates the interview and shows the system's later formalization:

```text
Specifier → Coder → Cleaner → Architect → Hardender → QA
```

This Pi configuration adopts that separation but narrows its authority. The Architect is read-only and checks human-approved boundaries. It can diagnose a violation; it cannot invent and approve strategic architecture.

### 6. Keep human values; reconsider human rituals

At [32:24–35:21](https://www.youtube.com/watch?v=zcLPGC-tvgk&t=1944s), Martin argues that an agent need not imitate every human TDD keystroke sequence. The values remain:

- observable correctness;
- tests with useful assertions;
- understandable structure;
- manageable complexity;
- deliberate dependencies;
- recoverable failure behavior.

A human ritual should be required only when the ritual itself creates evidence or controls risk. Otherwise, enforce the property that matters.

### 7. Cheap implementation strengthens short feedback cycles

At [36:16–41:41](https://www.youtube.com/watch?v=zcLPGC-tvgk&t=2176s), detailed up-front agent plans repeatedly collapse when implementation exposes mistaken assumptions. Martin returns to small stories, implementation, feedback, architectural reorganization, and another small slice.

Cheap code makes controlled experiments affordable. It does not make customer disruption, migration risk, compatibility, security, or human attention free.

### 8. Strategy and apprenticeship remain human concerns

At [45:51–52:58](https://www.youtube.com/watch?v=zcLPGC-tvgk&t=2751s), Matt characterizes agents as stronger at tactical work than strategy, and Martin agrees that people must continue learning code and architecture. A supervisor needs enough direct experience to recognize thrashing, weak oracles, accidental complexity, and plausible-looking failure.

The human job moves upward, but it does not become vague management. The human owns meaning, risk, architecture, and the decision to advance the system.

## The control-system interpretation

The deepest useful reading is:

```text
probabilistic tactical workers
inside
executable and human-governed control boundaries
```

The workers are disposable. Persistent learning accumulates outside them in:

- acceptance examples and tests;
- architecture and dependency rules;
- regression fixtures;
- thresholds and budgets;
- the orchestration procedure;
- verified outcomes;
- human judgment.

The pipeline spends agent speed on verification that was previously too repetitive or expensive. Each stage has a different incentive and asks a different question of the same artifact.

## Why this Pi pipeline has six roles

| Role | Question | Authority |
|---|---|---|
| `specifier` | What observable behavior would satisfy the approved intent? | Read-only contract and acceptance evidence |
| `coder` | What is the smallest behavior-complete implementation? | Bounded implementation and tests |
| `cleaner` | Can the implementation be made easier to understand without changing behavior? | Behavior-preserving local edits |
| `architect` | Does the result obey the architecture the human approved? | Read-only diagnosis; no strategic redesign |
| `hardener` | What failure, abuse, mutation, or weak assertion still survives? | Bounded robustness and test-strength fixes |
| `qa` | Does the final artifact satisfy the contract using fresh evidence? | Mechanically read-only acceptance |

A role earns a separate context when it changes responsibility, authority, or evidence. Another persona is not enough.

## Artifact-first handoffs

Fresh context discards trajectory and anchoring, but it also discards rationale. The continuity mechanism is the artifact:

- approved behavioral contract;
- code and tests;
- complete diff;
- architecture rules;
- exact command output;
- user-path evidence;
- compact handoff with unresolved risks.

The next role receives only what it needs to perform its responsibility. A prior `PASS` is a claim to verify, not inherited truth.

Fresh context is also not independent proof. Two agents using the same model can share priors, framing, and blind spots. Independent evidence comes from different seams: executable tests, static checks, runtime traces, dependency rules, real-client behavior, and human review.

## Failure routing

The parent, not the failing child, owns orchestration:

- ambiguous behavior returns to a fresh Specifier and then the human if still unresolved;
- implementation defects return to a fresh Coder;
- local complexity returns to a fresh Cleaner;
- boundary violations are diagnosed by Architect, repaired by Coder or Cleaner after a parent decision, and checked by a fresh Architect;
- robustness or test-strength failures return to Hardener;
- QA never fixes its own finding.

After repair, the owning stage and every downstream gate run again. This prevents a worker from certifying its own correction.

## What the gates can and cannot prove

| Gate | Useful evidence | Does not prove |
|---|---|---|
| Unit and acceptance tests | Stated examples behave as asserted | Requirements are complete |
| Coverage | Code paths were executed | Assertions are correct |
| Mutation testing | Tests reject selected code changes | Product behavior is complete or secure |
| Complexity metrics | Measured local complexity is bounded | The design is good |
| Dependency rules | Declared architecture constraints hold | The chosen architecture is right |
| UI or system QA | A real path worked under recorded conditions | Every environment and failure mode works |
| Fresh review | A second context found or rejected issues | Statistical or epistemic independence |

A deterministic gate is only as meaningful as its oracle. Human attention should concentrate on the oracles, architecture, risk, and course corrections the pipeline cannot validate for itself.

## What this repository deliberately did not copy

- **No universal coverage or mutation mandate.** Hardening follows repository support and risk.
- **No arbitrary universal complexity threshold.** Metrics are evidence, not taste encoded as proof.
- **No assumption that specifications are always disposable.** Public contracts, ADRs, migrations, and regulated requirements may need durable rationale.
- **No elimination of human technical review.** Review depth follows risk.
- **No agent-owned strategic architecture.** Architect enforces approved boundaries.
- **No claim that more agents are automatically better.** The generic `scout`, `build`, and `docs` profiles handle bounded work that does not justify the six-stage transaction.
- **No release authority inside the gauntlet.** Commit, push, merge, release, and deployment remain separate human-authorized stages.

## Choosing the gauntlet

Use `/skill:agent-gauntlet` when implementation is consequential enough to justify six fresh responsibility boundaries and repeated gates.

Use a shorter path when:

- the change is disposable;
- one prototype is answering a design question;
- the task is read-only reconnaissance;
- a documentation pass needs no shell;
- the risk does not justify six serial contexts.

The aim is not maximum ceremony. It is enough independent evidence to justify the next irreversible step.
