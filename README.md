# .pi

pi-mono stuff I've found useful

## Design Philosophy

- **Agents = fresh-context stages.** Each canonical role owns one engineering responsibility and emits a compact evidence handoff.
- **Skills = composition.** `agent-gauntlet` sequences roles; Matt Pocock's shared skills and Thermos remain reusable skills rather than permanent agent wrappers.
- **Humans own strategy and irreversible actions.** Architecture boundaries, commit, push, release, and provider routing require explicit human decisions.
- **Executable evidence beats confidence.** A missing repository gate is reported as unavailable, never treated as a pass.

### Canonical implementation flow

```text
specifier → coder → cleaner → architect → hardener → QA
```

Use `/agent-gauntlet` for a complete serial implementation pass. Every role starts with fresh context; the parent passes only the approved contract, artifact references, and exact evidence. The parent runs fresh acceptance commands before mechanically read-only QA. Failures route to a fresh owning role and all downstream gates rerun.

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
/agent-gauntlet "Add a bounded cache to the existing API adapter"
```

The parent runs the six roles serially. Repository commands define the gates; missing commands are reported rather than invented.

### Decision work before implementation

```text
/wayfinder "Choose the caching behavior and boundaries"
# resolve the map, then run /agent-gauntlet from the approved result
```

Use Matt's `/grill-with-docs`, `/prototype`, `/to-spec`, and `/to-tickets` skills directly when their narrower workflow is a better fit.

### Independent branch review

```text
/thermos
```

Thermos launches two independent, read-only QA passes with complementary correctness and maintainability rubrics, then synthesizes their evidence. It does not replace final QA.

---

## Workflow Selection

Choose the shortest flow that preserves decision quality:

| Situation | Use |
|-----------|-----|
| Clear implementation request | `/agent-gauntlet` |
| Foggy, multi-session decision | `/wayfinder`, then `/agent-gauntlet` |
| Small design question | `/grill-with-docs` |
| High-fidelity uncertainty | `/prototype` |
| Independent diff audit | `/thermos` |

Matt Pocock's shared skills remain upstream-managed and immutable in this repository. The local agents consume those skills where useful; they do not duplicate them.

---

## Custom Agents

Custom agents live under `~/.pi/agent/agents/`. Exactly six canonical roles are enabled. They inherit the parent model and start with `inherit_context: false`; callers do not silently reroute them. Their tool envelopes use Pi built-ins only, avoiding extension-selector ambiguity; the parent keeps the richer navigation extensions.

| Agent | Authority |
|-------|-----------|
| specifier | Read-only behavioral contract and acceptance commands |
| coder | Smallest behavior-complete implementation |
| cleaner | Behavior-preserving local simplification |
| architect | Read-only audit of human-approved boundaries |
| hardener | Deeper tests, robustness, security, coverage, complexity, and mutation gates |
| qa | Independent, mechanically read-only final acceptance of parent-supplied fresh command evidence |

The serial gauntlet uses one child at a time. Other skills may use bounded parallel review, subject to `subagents.json` and the shared-local-resource policy.

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
