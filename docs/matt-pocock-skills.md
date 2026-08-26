# Composing Matt Pocock's skills

This guide explains how the shared Matt Pocock skills fit together in this Pi configuration. It is a routing and composition guide, not a copy of the skills themselves.

The exact procedure for each skill remains canonical in:

```text
~/.agents/skills/<skill>/SKILL.md
```

Those shared files are upstream-managed and immutable here. When this guide and a current skill disagree, follow the skill.

Upstream: [mattpocock/skills](https://github.com/mattpocock/skills)

## The operating idea

The skills are small and composable. They do not try to own the entire software process. The human keeps control, selects the next useful procedure, and approves consequential decisions.

Four recurring concerns organize the set:

1. **Alignment.** Grill the idea until the agent and human mean the same thing.
2. **Shared language.** Record domain terms and durable decisions so later sessions need less explanation.
3. **Feedback.** Give implementation a loop that goes visibly red and green.
4. **Design.** Keep interfaces deep, dependencies intentional, and architecture under active care.

Choose the shortest path that preserves decision quality. A small known change does not need an initiative map. A foggy multi-session destination should not be improvised from one giant prompt.

## Start with the router when uncertain

Use `/skill:ask-matt` when the correct entry point is not obvious. It routes among the user-invoked skills without replacing human judgment.

The main routes are:

| Situation | Start with | Expected next boundary |
|---|---|---|
| Large or foggy destination | `/skill:wayfinder` | Resolve decisions, then `/skill:to-spec` → approval → `/skill:to-tickets` |
| Bounded design that needs discussion | `/skill:grill-with-docs` | Record vocabulary and decisions, then prototype or implement |
| One high-fidelity uncertainty | `/skill:prototype` | Inspect the disposable evidence and make a human decision |
| Incoming issue, or external PR when tracker config enables PR triage | `/skill:triage` | Produce an agent-ready brief or request missing information |
| Existing architecture needs attention | `/skill:improve-codebase-architecture` | Choose one deepening candidate and grill it |
| Hard bug or regression | `/skill:diagnosing-bugs` | Build a red feedback loop, isolate the cause, then fix it |
| Existing conversation is already resolved | `/skill:to-spec` | Human approval, then `/skill:to-tickets` if needed |
| Approved spec or plan needs slicing | `/skill:to-tickets` | Implement tracer-bullet tickets in dependency order |
| Another session must continue | `/skill:handoff` | Pass a compact artifact rather than the whole conversation |

These routes are not all read-only. `grill-with-docs` updates project vocabulary and ADRs. `wayfinder`, `to-spec`, and `to-tickets` publish tracker artifacts. `triage` can comment, label, or close records after the skill's human gate. Confirm the configured tracker and proposed writes before acting.

## The main delivery paths

### Large or foggy work

```text
wayfinder
  → resolve one frontier decision at a time
  → to-spec
  → human approval
  → to-tickets
  → implementation
  → code-review
  → human review
```

Wayfinder maps decision work. It does not implement the destination. When the map clears, run `to-spec` to collapse the linked decisions into one buildable plan, obtain human approval, then run `to-tickets`. Skip that sequence only when the effort proved genuinely small.

`to-spec` synthesizes decisions already made; it is not another interview. `to-tickets` turns an approved artifact into vertical tracer bullets with explicit blocking edges.

For consequential implementation in this repository, the tickets can feed `/skill:agent-gauntlet` rather than asking one long-lived context to specify, implement, review, and certify itself.

### Small but consequential work

```text
grill-with-docs
  → optional prototype
  → implementation
  → code-review
  → human review
```

Use grilling for decisions that can be expressed and resolved in conversation. Use a prototype when the answer depends on seeing behavior rather than describing it.

Examples of conversational questions:

- URL and API shape;
- module ownership;
- naming and domain terms;
- persistence boundaries;
- compatibility policy.

Examples that usually need executable evidence:

- UI feel and layout;
- complex interaction state;
- animation and timing;
- unfamiliar library behavior;
- performance or integration uncertainty.

The dividing question is practical: **can a reliable answer be stated before touching the real behavior?** If not, prototype the uncertainty.

### Bugs and regressions

```text
triage, when the report is still unclassified
  → diagnosing-bugs
  → build a feedback loop that goes red on this bug
  → reproduce and minimise
  → hypothesise and instrument
  → fix with a regression test
  → code-review
```

`diagnosing-bugs` owns diagnosis. `tdd` supplies the red-green-refactor discipline at a chosen seam. Do not replace diagnosis with speculative patches that happen to make one symptom disappear.

### Architecture health

```text
improve-codebase-architecture
  → select one candidate
  → grill-with-docs
  → domain-modeling / codebase-design as needed
  → approved implementation
```

`improve-codebase-architecture` is a survey, not an automatic rewrite. `domain-modeling` sharpens the project's language and durable decisions. `codebase-design` supplies the deep-module vocabulary: substantial behavior behind a small interface, placed at a clean and testable seam.

Run architecture work as a feedback loop. Improve one boundary, observe the result, and then choose the next candidate. Do not turn the survey into a project-wide rescue plan that implementation evidence has not tested.

## Artifacts and phase boundaries

Use the smallest durable artifact that will carry the decision across the next boundary:

| Need | Artifact |
|---|---|
| Short disposable experiment | Temporary handoff or prototype |
| Bounded tracked work | Issue or ticket |
| Multi-ticket destination | Approved specification and linked tickets |
| Durable architectural reason | ADR |
| Shared project vocabulary | `CONTEXT.md` or the configured domain document |
| Fresh session continuation | Handoff document |

Save decisions before clearing context. Do not duplicate an issue, specification, or ADR inside a handoff; reference the canonical artifact and add only what the next session cannot recover cheaply.

A fresh context is useful when the domain, incentive, or responsibility changes. A short two-step chain can remain together when all context is still relevant. Longer workflows, human approval gates, and independent review benefit from a fresh session or bounded agent.

## User-invoked and model-invoked skills

The upstream collection distinguishes orchestration from reusable discipline:

- **User-invoked skills** choose or run a workflow, such as `ask-matt`, `wayfinder`, `grill-with-docs`, `to-spec`, `to-tickets`, and `implement`.
- **Model-invoked skills** supply a procedure when the task fits, such as `prototype`, `research`, `tdd`, `diagnosing-bugs`, `domain-modeling`, `codebase-design`, and `code-review`.

This is an invocation boundary, not a ranking. The reusable disciplines are often called from inside a human-directed flow.

## How the skills use Pi capability profiles

The profile supplies permissions and fresh context. The skill supplies methodology.

| Procedure | Pi profile |
|---|---|
| Read-only repository or source reconnaissance | `scout` |
| Research that must write a cited Markdown artifact | `build` with `/skill:research` active |
| Disposable prototype | isolated `build` with `/skill:prototype` active |
| Bounded implementation or test work outside the strict gauntlet | `build` |
| Technical documentation | `docs` with `/skill:technical-writing` |
| Strict consequential implementation | `/skill:agent-gauntlet` and its six named roles |

Do not create a permanent agent identity for every skill. The same fresh `build` envelope can execute research, prototyping, implementation, integration, or testing when the parent supplies the active procedure and a self-contained task.

## Human gates

The human retains authority over:

- the destination and product meaning;
- unresolved strategic architecture;
- prototype selection;
- specification approval;
- scope and risk acceptance;
- commit, push, merge, release, and deployment.

A skill can organize evidence for those decisions. It does not inherit the authority to make them irreversible.

Repository policy overrides an upstream workflow's default side effects. In this repository, implementation and review stop before commit unless the human explicitly authorizes it.

## Installation and setup

Install or update the shared skills through their upstream mechanism:

```bash
npx skills@latest add mattpocock/skills -g
```

Run `/skill:setup-matt-pocock-skills` once per project when its issue tracker, triage labels, or documentation layout have not been configured.

Pi reads shared skills from `~/.agents/skills`, user-local skills from `~/.pi/agent/skills`, and project skills from the supported project discovery paths. This repository keeps Matt's shared set outside the repository so upstream updates do not create local forks.

## What this guide deliberately leaves out

It does not duplicate:

- exact step sequences from individual skills;
- current frontmatter or invocation mechanics;
- every skill in the upstream catalog;
- removed local prompt chains or legacy agent names.

That information would become a stale cache. Use this guide to choose a route, then load the current skill for execution.
