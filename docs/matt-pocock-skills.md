# Workflow selection

Shared Matt Pocock skills are canonical in `~/.agents/skills/<skill>/SKILL.md`. Load the installed skill for its procedure; this guide only helps choose one. Upstream: [mattpocock/skills](https://github.com/mattpocock/skills).

| Situation | Start with | Next boundary |
|---|---|---|
| Unsure which procedure fits | `ask-matt` | Choose a route |
| Large or unclear destination | `wayfinder` | Resolve decisions → `to-spec` → approval → `to-tickets` |
| Bounded design discussion | `grill-with-docs` | Record vocabulary and decisions; prototype or implement |
| Behavior must be observed first | `prototype` | Inspect disposable evidence; human chooses |
| Incoming issue or configured PR triage | `triage` | Produce a brief or request missing information |
| Hard bug | `diagnosing-bugs` | Reproduce → isolate → regression test → fix |
| Architecture needs attention | `improve-codebase-architecture` | Choose one candidate; agree on boundaries |
| Decisions are already resolved | `to-spec` | Approve the specification |
| Approved work needs slicing | `to-tickets` | Implement vertical slices in dependency order |
| Work crosses a session or harness boundary | `handoff` | Pass compact artifacts and canonical references |

For small work, use a bounded implementation followed by `code-review`. Use `agent-gauntlet` when six fresh responsibility boundaries justify their cost. Research that writes an artifact uses `build`; read-only reconnaissance uses `scout`; documentation uses `docs`.

Keep specifications, ADRs, issues, and tests canonical. Handoffs add only scope, current evidence, unresolved risks, and the next decision. Use `tdd`, `domain-modeling`, and `codebase-design` when their specific discipline is needed.

`grill-with-docs`, `wayfinder`, `to-spec`, `to-tickets`, and `triage` can write durable project or tracker state. Confirm their targets and gates. Human approval controls strategic decisions, scope, commits, publication, and deployment. Completing a skill does not grant release authority.

Installation and project setup are in the [README](../README.md#setup). Shared skills stay outside this repository; do not edit them as part of local configuration cleanup.
