# .pi

A Pi configuration for human-directed software design, skill-driven bounded work, and a fresh-context six-role implementation gauntlet.

## Architecture

```text
Human decision layer
wayfinder / grilling / research / prototype / to-spec / to-tickets
                              ↓ approved artifact
Agent execution layer
specifier → coder → cleaner → architect → hardener → QA
                              ↓ evidence
Thermos / human review / explicit release decision
```

Three rules organize the system:

- **Humans own strategy and irreversible actions.** Product meaning, architectural direction, commit, push, release, and provider routing require explicit human decisions.
- **Skills own reusable procedures.** Research, prototyping, diagnosis, review, testing, and writing are methodologies rather than permanent agent identities.
- **Agents own bounded authority.** Fresh roles and capability profiles define tools, context, and responsibility.

Background and composition guides:

- [Composing Matt Pocock's skills](docs/matt-pocock-skills.md)
- [The Uncle Bob agent gauntlet](docs/uncle-bob-agent-gauntlet.md)
- [Code navigation](docs/code-navigation.md)

## Choose a workflow

Use the shortest flow that preserves the required decision and verification boundaries:

| Situation | Use |
|---|---|
| Clear consequential implementation | `/skill:agent-gauntlet` |
| Bounded human-gated design and implementation | `/skill:design-loop` |
| Foggy multi-session destination | `/skill:wayfinder` → `/skill:to-spec` → approval → `/skill:to-tickets` |
| Primary-source research artifact | `/skill:research` with writable `build` |
| Read-only source or repository reconnaissance | `scout` with a self-contained evidence contract |
| One high-fidelity uncertainty | `/skill:prototype` with an isolated `build` |
| Two runnable alternatives | `/skill:compare-prototypes` |
| Technical documentation | `/skill:technical-writing` with `docs` |
| Independent diff audit | `/skill:thermos` or `/skill:code-review` |

### Complete implementation gauntlet

```text
/skill:agent-gauntlet "Add a bounded cache to the existing API adapter"
```

The parent runs six roles serially with fresh context. Repository commands define the gates. A missing command is unavailable, never passed.

### Resolve decisions first

For work that fits one session:

```text
/skill:design-loop "Choose and implement bounded cache behavior"
```

For a large or foggy destination:

```text
/skill:wayfinder "Choose the caching behavior and boundaries"
# Resolve the map, run to-spec, approve the specification, then run to-tickets.
```

Use `/skill:grill-with-docs`, `/skill:research`, `/skill:prototype`, `/skill:to-spec`, and `/skill:to-tickets` directly when one procedure is enough.

Some decision-layer skills write durable project state. `grill-with-docs` updates domain documents and ADRs. `wayfinder`, `to-spec`, `to-tickets`, and `triage` can create or update tracker records. Inspect the active skill and target before approving those writes.

### Compare alternatives

```text
/skill:compare-prototypes "Compare an in-memory cache with Redis"
```

The parent launches a read-only Scout and two isolated Build prototypes, verifies both, and returns the choice to the human. Prototype code does not enter production automatically.

### Review a branch

```text
/skill:thermos
```

Thermos launches two fresh, read-only QA passes with complementary correctness and maintainability rubrics. It is optional review evidence, not final acceptance certification.

### Babysit an existing PR

```text
/skill:babysit-pr <PR URL>
```

The shared [babysit-pr skill](agent/skills/babysit-pr/SKILL.md) handles scoped CI and review fixes. Its [review-agent triage policy](agent/skills/babysit-pr/references/bot-triage.md) treats findings as claims to verify. Reject clearly refuted findings independently with a recorded reason; ask Joe about uncertain or consequential tradeoffs. Commit and push require authorization for the run. Merging is out of scope.

Pi discovers the skill in `agent/skills/`; `enableSkillCommands: true` explicitly enables `/skill:babysit-pr`. Start a fresh Pi session after installation. Default-profile Hermes on this host loads the same canonical directory through `~/.hermes/skills/github/babysit-pr`. Other hosts and profiles need their own installation.

## Agents

Nine explicit custom types are available. Every child starts fresh and inherits the parent model.

### Gauntlet authority roles

| Agent | Authority |
|---|---|
| `specifier` | Read-only behavioral contract and acceptance commands |
| `coder` | Smallest behavior-complete implementation |
| `cleaner` | Behavior-preserving local simplification |
| `architect` | Read-only audit of human-approved boundaries |
| `hardener` | Deeper tests, robustness, security, coverage, complexity, and mutation gates |
| `qa` | Mechanically read-only final acceptance of parent-supplied evidence |

### Flexible capability profiles

| Agent | Capability |
|---|---|
| `scout` | Low-thinking, mechanically workspace-read-only analysis with explicit Cachebro, Grepika, and Tilth navigation tools; Cachebro state lives in the user cache directory |
| `build` | Extension-enabled file and shell operations for the active bounded procedure |
| `docs` | No-shell editing with Pstack `technical-writing` and `unslop` preloaded |

A flexible profile does not own a methodology. The parent loads the applicable skill and supplies a self-contained task. For example:

- complete research artifact: `research` plus writable `build`;
- read-only reconnaissance: `scout`;
- disposable experiment: `prototype` plus isolated `build`;
- documentation: `technical-writing` plus `docs`.

## Safety boundaries

Extension defaults remain hidden to avoid duplicate `Explore`, `Plan`, and `general-purpose` entries. Hidden is not fail-closed: the installed subagent extension maps an unknown type to a mutable `general-purpose` fallback.

Every workflow therefore:

1. inspects the `Agent` tool's advertised types;
2. requires the exact intended names;
3. stops before dispatch when a name is missing;
4. never probes an unknown or misspelled type.

`scout` loads only `pi-mcp-adapter` and `session-name`. Its tool list contains explicit read-only operations and omits shell, write, edit, and the generic MCP gateway.

The serial gauntlet uses one child at a time. Other skills may use bounded parallel work subject to `agent/subagents.json` and the shared local-resource policy:

- run no more than three local children concurrently;
- pause automated work when another local workload is contending;
- use external overflow only when explicitly selected for that task;
- keep automatic subagent scheduling disabled by default.

## Handoffs and evidence

The parent passes compact artifacts rather than inherited conversation history. A useful handoff identifies:

- status: `PASS`, `FAIL`, or `BLOCKED`;
- approved scope and relevant paths;
- files changed, if any;
- exact commands and outcomes;
- unresolved risks and unavailable gates;
- next owning role or focused human decision.

Large disposable evidence can live under `/tmp` or in a subagent transcript. Repository specifications, issues, tests, and ADRs remain canonical and are referenced rather than copied.

A downstream `PASS` is a claim to verify. The parent reruns required checks immediately before QA, and QA remains read-only. Completing a workflow does not authorize commit, push, merge, publish, or deployment.

## Local skills

Repository-local skills include:

| Skill | Purpose |
|---|---|
| `agent-gauntlet` | Serial six-role implementation and failure routing |
| `design-loop` | One-session human-gated design, optional prototype, implementation, and review |
| `compare-prototypes` | Scout plus two isolated runnable alternatives before a human choice |
| `thermos` | Complementary read-only QA branch audits |
| `technical-writing` | Pstack's layered Diátaxis, Google, STE, and Global English standard |
| `unslop` | Pstack's AI-writing-tell removal and human-voice pass |
| `subagents` | `@tintinweb/pi-subagents` usage and safety boundaries |
| `code-navigation` | Navigation-tool reference |
| `tilth` | Structural diff and blast-radius analysis |

Shared Matt Pocock skills remain under `~/.agents/skills` and are loaded by name. They are not copied or edited in this repository. See [the composition guide](docs/matt-pocock-skills.md).

## Installation and updates

`agent/mcp-cache.json` is generated local state and remains ignored. After changing `agent/mcp.json`, start Pi once to refresh stale direct-tool metadata, then restart Pi before using the affected direct tools.

### Pi Tooling extensions

Managed file search, Firecrawl, interaction, background terminal, and workflow extensions are distributed through the [`jhs88/pi-tooling`](https://github.com/jhs88/pi-tooling) Git package:

```bash
pi install git:github.com/jhs88/pi-tooling
```

`pi update --extensions` and `pi update --all` update the managed checkout and rerun its production dependency installation when needed. Do not copy the package into `agent/extensions`; auto-discovered extension directories do not receive Pi's package lifecycle.

The tracked files already under `agent/extensions/` are repository-local extensions. Update them through this repository, not through the managed-package commands above.

Selected extensions are adapted from [davis7dotsh/my-pi-setup@797eaf6](https://github.com/davis7dotsh/my-pi-setup/tree/797eaf6d6f178759cf7aabde927ef15c91346e7e), with local compatibility, routing, and security changes.

### Shared skills

Pi reads shared skills from `~/.agents/skills`, user-local skills from `~/.pi/agent/skills`, and project skills from supported project discovery paths.

Install Matt Pocock's shared set with:

```bash
npx skills@latest add mattpocock/skills -g
```

This resolves current upstream content. Review the upstream revision, selected roster, and installed diff before accepting an install or update.

Run `/skill:setup-matt-pocock-skills` once in a project that has not configured its issue tracker, triage labels, and documentation layout.

Pstack `technical-writing` and `unslop` are pinned MIT-licensed local copies. Their provenance is retained beside each skill.

### Firecrawl

Self-hosted Firecrawl reads `FIRECRAWL_API_URL` and optional `FIRECRAWL_API_KEY` from the process environment, then ignored `agent/.env`. Copy `agent/.env.example` when Pi-local configuration is needed. There is no Firecrawl Cloud fallback.

## Legacy command migration

The old prompt files were removed. Use these replacements:

| Removed command | Replacement |
|---|---|
| `/design-loop` | `/skill:design-loop` |
| `/parallel-explore-build` | `/skill:compare-prototypes` |
| `/quick-prototype` | `/skill:prototype` |
| `/initiative-map` | `/skill:wayfinder` |

## Further reading

- [Managed Pi tooling smoke test](docs/pi-tooling-smoke-test.md)
- [A Philosophy of Software Design](https://milkov.tech/assets/psd.pdf)
- [Matt Pocock's skills](https://github.com/mattpocock/skills)
- [Uncle Bob and Matt Pocock interview](https://www.youtube.com/watch?v=zcLPGC-tvgk)
- [SwarmForge](https://github.com/unclebob/swarm-forge)
