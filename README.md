# .pi

pi-mono stuff I've found useful

## Design Philosophy

- **Two workflows are first-class.** The six-role gauntlet provides a strict evidence pipeline; the legacy agents and prompts remain available for flexible planning, exploration, prototyping, implementation, and review.
- **Agents = fresh-context primitives.** Each child owns one responsibility and emits a compact handoff.
- **Skills and prompts = composition.** Choose the gauntlet or a legacy wrapper explicitly; neither silently replaces the other.
- **Humans own strategy and irreversible actions.** Architecture boundaries, commit, push, release, and provider routing require explicit human decisions.
- **Executable evidence beats confidence.** A missing repository gate is reported as unavailable, never treated as a pass.

### Six-role implementation lane

```text
specifier → coder → cleaner → architect → hardener → QA
```

Use `/skill:agent-gauntlet` for a complete serial implementation pass. Every role starts with fresh context; the parent passes only the approved contract, artifact references, and exact evidence. The parent runs fresh acceptance commands before mechanically read-only QA. Failures route to a fresh owning role and all downstream gates rerun.

### Shared strategic planning lane

```text
wayfinder → to-spec → to-tickets → implement → code-review → human review
```

This Matt-skill pipeline can feed either implementation lane after human approval.

### Legacy custom-agent lane

```text
plan → prototyper → build/integrator → reviewer
```

Use the legacy custom agents (`scout`, `plan`, `prototyper`, `build`, `integrator`, `reviewer`, `test`, and `docs`) and prompts when work benefits from selective exploration, human gates, or a shorter/nonlinear flow. The legacy Thermos wrappers remain available alongside the newer `/skill:thermos` skill.

### Shared Strix operating policy

- Run at most three local subagents concurrently.
- Pause automated work when Hermes, Honcho, or another local workload is contending for Strix resources.
- Route a task to Codex Spark only deliberately and for that task; never use it as a silent fallback.
- Keep automatic subagent scheduling disabled by default.

### Tracking Levels

| Level | Artifact |
|-------|----------|
| Handoff only | Temp file (quick experiments) |
| Issues | Issue tracker (features with scope) |
| Spec + Issues | Issue tracker parent + children (big initiatives) |
| ADR | `docs/adr/` (architectural decisions) |

The workflow prompt decides which level applies.

---

## Quick Start

### Complete implementation gauntlet

```text
/skill:agent-gauntlet "Add a bounded cache to the existing API adapter"
```

The parent runs the six roles serially. Repository commands define the gates; missing commands are reported rather than invented.

### Legacy design and implementation loop

```text
/design-loop "Add a bounded cache to the existing API adapter"
```

This keeps the prior human-gated `plan → prototyper → build/integrator → reviewer` workflow. `/parallel-explore-build`, `/quick-prototype`, and `/initiative-map` remain supported entry points.

### Decision work before implementation

```text
/skill:wayfinder "Choose the caching behavior and boundaries"
# resolve the map, then run /skill:agent-gauntlet from the approved result
```

Use Matt's `/skill:grill-with-docs`, `/skill:prototype`, `/skill:to-spec`, and `/skill:to-tickets` skills directly when their narrower workflow is a better fit.

### Independent branch review

```text
/skill:thermos
```

Thermos launches two independent, read-only QA passes with complementary correctness and maintainability rubrics, then synthesizes their evidence. It does not replace final QA.

---

## Workflow Selection

Choose the shortest flow that preserves decision quality:

| Situation | Use |
|-----------|-----|
| Clear implementation request | `/skill:agent-gauntlet` |
| Foggy, multi-session decision | `/skill:wayfinder`, then `/skill:agent-gauntlet` |
| Human-gated design/prototype loop | `/design-loop` |
| Compare concrete approaches | `/parallel-explore-build` |
| One cheap prototype | `/quick-prototype` |
| Legacy Wayfinder wrapper | `/initiative-map` |
| Small design question | `/skill:grill-with-docs` |
| High-fidelity uncertainty | `/skill:prototype` |
| Independent diff audit | `/skill:thermos` |

Matt Pocock's shared skills remain upstream-managed and immutable in this repository. The local agents consume those skills where useful; they do not duplicate them.

---

## Custom Agents

Custom agents live under `~/.pi/agent/agents/`. The strict six-role lane and the legacy flexible lane are both enabled. All custom agents inherit the parent model and start with `inherit_context: false`; workflow selection is explicit. The strict lane uses Pi built-ins only, while legacy roles retain their established tool/skill envelopes.

**Six-role gauntlet agents:**

| Agent | Authority |
|-------|-----------|
| specifier | Read-only behavioral contract and acceptance commands |
| coder | Smallest behavior-complete implementation |
| cleaner | Behavior-preserving local simplification |
| architect | Read-only audit of human-approved boundaries |
| hardener | Deeper tests, robustness, security, coverage, complexity, and mutation gates |
| qa | Independent, mechanically read-only final acceptance of parent-supplied fresh command evidence |

**Legacy flexible agents:**

| Agent | Purpose |
|-------|---------|
| scout | Compressed codebase reconnaissance |
| plan | Structured design specifications |
| prototyper | Throwaway validation artifacts |
| build | Direct implementation |
| integrator | Promote or remove prototype work |
| reviewer | Read-only code review |
| test | Test development and diagnosis |
| docs | Technical documentation |
| thermo-nuclear-review-subagent | Legacy correctness/security branch audit |
| thermo-nuclear-code-quality-review-subagent | Legacy maintainability audit |

The serial gauntlet uses one child at a time. Legacy prompts may select or parallelize their own agents, subject to `subagents.json` and the shared-local-resource policy.

**Local skills:**

| Skill | Purpose |
|-------|---------|
| agent-gauntlet | Serial six-role implementation and failure routing |
| thermos | Parallel complementary QA branch audits |
| subagents | `@tintinweb/pi-subagents` usage and boundaries |
| code-navigation | Navigation-tool reference |
| tilth | Structural diff and blast-radius analysis |
| unslop | Remove AI writing tells; MIT-licensed Pstack adaptation |

Shared Matt Pocock skills remain under `~/.agents/skills` and are loaded by name from role frontmatter. They are not copied or edited here.

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

### Recommended Skills

pi reads from `~/.agents/skills`, `~/.pi/skills`, and `$(cwd)/.pi/skills`. It's recommended to install Matt's skills:

```bash
npx skills@latest add mattpocock/skills
```

### Recommended Resources

- [A Philosophy of Software Design](https://milkov.tech/assets/psd.pdf) — book related to his skills
