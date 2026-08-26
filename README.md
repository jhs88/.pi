# .pi

pi-mono stuff I've found useful

## Design philosophy

- **Human decisions and agent execution are separate layers.** Wayfinder, grilling, research, prototypes, specifications, and tickets establish intent. The six-role gauntlet executes an approved artifact.
- **Named gauntlet agents are authority boundaries.** Each child starts fresh, owns one responsibility, and emits a compact handoff.
- **Flexible agents are capability profiles.** `scout`, `build`, and `docs` define tools and context. Active skills define the procedure.
- **Skills are the source of truth for reusable work.** Research, prototyping, testing, review, and technical writing do not need one agent type each.
- **Humans own strategy and irreversible actions.** Architecture direction, commit, push, release, and provider routing require explicit human decisions.
- **Executable evidence beats confidence.** A missing repository gate is unavailable, never passed.

### Human decision layer

```text
small or bounded: grilling / design-loop / prototype
large or foggy:   wayfinder → to-spec → to-tickets
```

The parent session owns questions and approval gates. Full research uses the shared `research` skill with a fresh `build`, because that procedure must write a cited Markdown artifact. Read-only source gathering can use `scout` and return evidence to the parent. High-fidelity uncertainty uses `prototype` with a disposable `build` worktree. `/skill:compare-prototypes` runs one scout and two isolated prototypes when two concrete approaches need direct comparison.

### Agent execution layer

```text
specifier → coder → cleaner → architect → hardener → QA
```

Use `/skill:agent-gauntlet` for the strict implementation pipeline. Every role starts with fresh context. The parent passes only the approved contract, artifact references, and exact evidence. Failures return to a fresh owning role, and downstream gates run again.

### Flexible capability profiles

Use `scout`, `build`, and `docs` directly only when a strict six-stage pass is unnecessary:

- `scout` is mechanically read-only and inherits the active review, navigation, or source-gathering procedure.
- `build` is the extension-enabled mutation and command envelope for an active implementation, research, prototype, test, or integration skill.
- `docs` is a no-shell editor with Pstack `technical-writing` and `unslop` preloaded.

Extension defaults stay hidden to avoid duplicate `Explore`, `Plan`, and `general-purpose` entries. This setting is not fail-closed: the installed extension maps an unknown type to a mutable `general-purpose` fallback. Every workflow therefore preflights exact advertised types before dispatch and stops on a missing name.

### Shared Strix operating policy

- Run at most three local subagents concurrently.
- Pause automated work when Hermes, Honcho, or another local workload is contending for Strix resources.
- Route a task to Codex Spark only deliberately and for that task. Never use it as a silent fallback.
- Keep automatic subagent scheduling disabled by default.

### Tracking levels

| Level | Artifact |
|-------|----------|
| Handoff only | Temp file or subagent transcript |
| Issues | Issue tracker |
| Spec and issues | Approved specification with implementation tickets |
| ADR | `docs/adr/` for durable architectural decisions |

The active skill chooses the smallest durable artifact that preserves the decision.

---

## Quick start

### Run the complete implementation gauntlet

```text
/skill:agent-gauntlet "Add a bounded cache to the existing API adapter"
```

The parent runs six fresh roles serially. Repository commands define the gates. Missing commands remain unavailable.

### Resolve decisions before implementation

For work that fits one session:

```text
/skill:design-loop "Choose and implement bounded cache behavior"
```

For a large or foggy destination:

```text
/skill:wayfinder "Choose the caching behavior and boundaries"
# Resolve the map, publish an approved spec or tickets, then run agent-gauntlet.
```

Use `/skill:grill-with-docs`, `/skill:research`, `/skill:prototype`, `/skill:to-spec`, and `/skill:to-tickets` directly when one procedure is enough.

### Compare runnable alternatives

```text
/skill:compare-prototypes "Compare an in-memory cache with Redis"
```

The parent launches a read-only scout and two isolated build prototypes, verifies both, and returns the choice to the human. Prototype code does not enter production automatically.

### Write technical documentation

Load `/skill:technical-writing`, then use a fresh `docs` agent for a no-shell editing pass. The agent also preloads `/skill:unslop`.

### Run an independent branch review

```text
/skill:thermos
```

Thermos launches two independent, read-only QA passes with complementary correctness and maintainability rubrics. It does not replace final acceptance QA.

### Migrate legacy commands

The prompt files were removed. Use these direct replacements:

| Removed command | Replacement |
|-----------------|-------------|
| `/design-loop` | `/skill:design-loop` |
| `/parallel-explore-build` | `/skill:compare-prototypes` |
| `/quick-prototype` | `/skill:prototype` |
| `/initiative-map` | `/skill:wayfinder` |

---

## Workflow selection

Choose the shortest flow that preserves the required decision and verification boundaries:

| Situation | Use |
|-----------|-----|
| Clear consequential implementation | `/skill:agent-gauntlet` |
| Bounded human-gated design and implementation | `/skill:design-loop` |
| Foggy multi-session decision | `/skill:wayfinder`, then an approved specification or tickets |
| Primary-source research artifact | `/skill:research` with `build` |
| Read-only source or repository reconnaissance | `scout` with a self-contained evidence contract |
| One high-fidelity uncertainty | `/skill:prototype` with an isolated `build` agent |
| Two concrete runnable alternatives | `/skill:compare-prototypes` |
| Technical documentation | `/skill:technical-writing` with `docs` |
| Independent diff audit | `/skill:thermos` or `/skill:code-review` |

Matt Pocock's shared skills remain upstream-managed and immutable in this repository. Pstack `technical-writing` and `unslop` are pinned, MIT-licensed local copies with provenance retained beside each skill.

---

## Custom agents

Custom agents live under `~/.pi/agent/agents/`. The extension's `general-purpose`, `Explore`, and `Plan` defaults are hidden, not fail-closed; workflows preflight exact advertised names because an unknown type falls back to mutable `general-purpose`. Nine explicit types are available: six strict gauntlet roles and three flexible capability profiles. Every child inherits the parent model and starts with `inherit_context: false`.

### Gauntlet authority roles

| Agent | Authority |
|-------|-----------|
| `specifier` | Read-only behavioral contract and acceptance commands |
| `coder` | Smallest behavior-complete implementation |
| `cleaner` | Behavior-preserving local simplification |
| `architect` | Read-only audit of human-approved boundaries |
| `hardener` | Deeper tests, robustness, security, coverage, complexity, and mutation gates |
| `qa` | Independent, mechanically read-only final acceptance of parent-supplied evidence |

### Flexible capability profiles

| Agent | Capability |
|-------|------------|
| `scout` | Low-thinking, mechanically read-only analysis with direct Cachebro, Grepika, and Tilth navigation plus compressed handoff output |
| `build` | Extension-enabled file and shell operations for the active skill or bounded parent procedure |
| `docs` | No-shell documentation editing with Pstack `technical-writing` and `unslop` preloaded |

A flexible profile does not own a methodology. The parent loads the applicable skill and passes a self-contained task. For example, a complete research artifact is `research` plus writable `build`; read-only reconnaissance uses `scout`; prototyping is `prototype` plus an isolated `build`; documentation is `technical-writing` plus `docs`.

The serial gauntlet uses one child at a time. Skills may use bounded parallel work subject to `subagents.json` and the shared-local-resource policy.

### Local skills

| Skill | Purpose |
|-------|---------|
| `agent-gauntlet` | Serial six-role implementation and failure routing |
| `design-loop` | One-session human-gated design, optional prototype, implementation, and review |
| `compare-prototypes` | Parallel scout and two isolated runnable alternatives before a human choice |
| `thermos` | Parallel complementary QA branch audits |
| `thermo-nuclear-review` | Strict correctness, security, and regression audit rubric |
| `thermo-nuclear-code-quality-review` | Strict maintainability and implementation-quality audit rubric |
| `technical-writing` | Pstack's layered Diátaxis, Google, STE, and Global English standard |
| `unslop` | Pstack's AI-writing-tell removal and human-voice pass |
| `subagents` | `@tintinweb/pi-subagents` usage and boundaries |
| `code-navigation` | Navigation-tool reference |
| `tilth` | Structural diff and blast-radius analysis |

Shared Matt Pocock skills remain under `~/.agents/skills` and are loaded by name. They are not copied or edited here.

---

## Code Navigation Strategy

**Primary principle: minimize context consumption.** Read outlines first, then targeted sections. Be surgical.

Inspired by [markerikson/opencode-config-example](https://github.com/markerikson/opencode-config-example/blob/main/config/AGENTS.md).

### Tool Quick Reference

| Need | Tool | Approach |
|------|------|----------|
| Directory overview | `grepika_toc` | Tree structure of a directory |
| Find code (NL/regex) | `grepika_search` | Natural language or regex search across indexed codebase |
| File structure | `grepika_outline` → `grepika_get` | Outline first, then read the section you need |
| Symbol definitions | `tilth_tilth_search` | Definition-first symbol lookup |
| What calls X? | `tilth_tilth_search kind:callers` | Caller tracing |
| Blast-radius before changes | `tilth_tilth_deps` | Dependency impact (via mcp gateway) |
| Cached file reads | `cachebro_read_file` / `read_files` | Fast re-reads, skips unchanged content |

### Tool Visibility (context hygiene)

To prevent context pollution, only core navigation tools are exposed as **direct tools** in `mcp.json`. The rest are available via the `mcp()` gateway call but don't appear in the default tool list.

| Direct (always visible) | Gateway-only (available on demand) |
|------------------------|-----------------------------------|
| `grepika_toc` | `grepika_context`, `refs`, `stats` |
| `grepika_outline` | `grepika_diff` |
| `grepika_search` | |
| `grepika_get` | |
| `tilth_tilth_search` | `tilth_tilth_files`, `deps` |
| `tilth_tilth_read` | `tilth_tilth_diff`, `edit` |

### Workflow Pattern

1. **Orient** — `grepika_toc` on the target directory
2. **Find** — `grepika_search` or `tilth_tilth_search` to locate symbols/files
3. **Outline** — `grepika_outline` or `tilth_tilth_read` to see structure
4. **Read surgically** — `grepika_get` with line range, or `cachebro_read_file`
5. **Verify** — re-read changed sections, run tests

---

## Agent Handoffs

Every role starts fresh. The parent passes a compact, self-contained handoff rather than inherited conversation history.

Required fields:

- status (`PASS`, `FAIL`, or `BLOCKED`);
- approved scope and relevant paths;
- files changed, if any;
- exact commands and outcomes;
- unresolved risks or unavailable gates;
- next role or focused human decision.

Large evidence can live in a disposable `/tmp` handoff file or a subagent transcript; pass the path and a concise index. Repository specifications and tracker decisions remain canonical and are referenced rather than copied.

A downstream role treats upstream `PASS` as a claim to verify. The parent reruns required commands immediately before QA; QA independently audits the files, artifacts, and fresh command evidence without shell or write tools. The parent then audits the final diff before any release action.

---

## Extensions & Skills

### Extensions

Configuration-local extensions in this repository are adapted from the examples in `pi-mono` and maintained manually.

Credit: selected extensions are adapted from [davis7dotsh/my-pi-setup@797eaf6](https://github.com/davis7dotsh/my-pi-setup/tree/797eaf6d6f178759cf7aabde927ef15c91346e7e), with local compatibility, routing, and security changes. They are distributed as the managed [`jhs88/pi-tooling`](https://github.com/jhs88/pi-tooling) Git package.

Install it once with:

```bash
pi install git:github.com/jhs88/pi-tooling
```

`pi update --extensions` and `pi update --all` update the managed checkout and rerun its production dependency install whenever its commit changes. Do not copy the package into `agent/extensions`; auto-discovered extension directories do not receive Pi's package installation lifecycle.

Self-hosted Firecrawl reads `FIRECRAWL_API_URL` and optional `FIRECRAWL_API_KEY` from the process environment, then ignored `agent/.env`. Copy `agent/.env.example` when Pi-local configuration is needed. There is no Firecrawl Cloud fallback.

### Recommended skills

Pi reads user skills from `~/.pi/agent/skills` and `~/.agents/skills`, plus project skills from `$(cwd)/.pi/skills` and trusted ancestor `.agents/skills` directories. It's recommended to install Matt's skills:

```bash
npx skills@latest add mattpocock/skills
```

### Recommended Resources

- [A Philosophy of Software Design](https://milkov.tech/assets/psd.pdf) — book related to his skills
