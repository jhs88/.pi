# .pi

pi-mono stuff I've found useful

## Design Philosophy

- **Agents = primitives.** Do one thing. Don't hard-wire PRD/issues into them.
- **Prompts = composition.** Decide flow and tracking based on situation.
- **Wayfinder tickets resolve decisions.** They do not implement the destination.
- **Implementation tickets deliver vertical slices.** Create them from an approved spec with `to-tickets`.
- **Humans own irreversible actions.** Pi does not commit, push, or open a PR without explicit instruction.

### Canonical large-work flow

```text
wayfinder → to-spec → to-tickets → implement → code-review → human review
```

Use `wayfinder` when the route is foggy or larger than one practical context window. Small, clear work can start with `grill-with-docs` or proceed directly to implementation. A Wayfinder map charts decision work; after the map is complete, `to-spec` synthesizes the decisions and `to-tickets` creates implementation-sized tracer bullets.

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

### Large or foggy work (canonical path)

```
/wayfinder "Build a caching layer for the API"
# → chart and resolve decision tickets, then:
#   to-spec → human approval → to-tickets
#   implement each ticket in a fresh context → code-review → human review
```

### Small, clear work

```
/grill-with-docs "Add a bounded cache to the existing API adapter"
# → grill the design with domain context, then implement directly when the route is clear
```

### Custom prompts (wrappers around Matt's flow)

```
/design-and-track "Build a caching layer for the API"
# → adds issue tracking on top of plan → prototype → integrate

/quick-prototype "Try using Redis vs in-memory cache"
# → skips design, straight to prototype + integrate

/architecture-deepening "src/api/routes"
# → wrapper around improve-codebase-architecture skill
```

### On-ramps

```
"Use triage to classify this bug report: 'app crashes on login'"
```

---

## Matt's Main Flow

Choose the shortest path that preserves decision quality. Custom prompts below are wrappers that add tracking, human gates, or parallelism.

### Core Path

```
/wayfinder "Describe a large or foggy feature"
  → resolve one frontier decision ticket per session
  → to-spec
  → human approval
  → to-tickets
  → implement each ticket in a fresh context
  → code-review
  → human review

/grill-with-docs "Describe a small, clear feature"
  → prototype if a high-fidelity decision needs evidence
  → implement directly when the route is clear
```

### On-ramps into the flow

| Entry Point | When | Skill |
|-------------|------|-------|
| `/triage` | Bug reports, incoming issues | `triage` skill |
| `/improve-codebase-architecture` | Architecture review → feeds into grill-with-docs | `improve-codebase-architecture` skill |

### Codebase Health Loop

```
/improve-codebase-architecture "src/api"
  → identifies architectural debt
  → findings feed back into /grill-with-docs for next feature
```

---

## Custom Prompts

Wrappers around Matt's flow. They add tracking levels, human gates, or parallelism that the base flow doesn't enforce automatically.

Arguments you type after the command become positional variables (`$1`, `$2`…) inside the template. See `argument-hint` in each prompt's frontmatter for expected inputs.

### When to use which

| Situation | Use | Why |
|-----------|-----|-----|
| Standard feature work | `/grill-with-docs` directly | Canonical flow, no wrapper overhead |
| Parallel exploration | `/parallel-explore-build` | Our only unique prompt — 3 agents exploring options simultaneously |
| Human gates mid-chain | `/design-with-handoffs` or `/full-initiative` | Stop for review before each phase |
| Quick experiment | `/quick-prototype` | Skip design, validate fast |
| Architecture review | `/architecture-deepening` | Wrapper around `improve-codebase-architecture` skill |

### Tracking Levels (mapped to Matt's skills)

**Handoff Only — wraps `prototype` + `integrator` skills**

| Command | Chain | Wraps |
|---------------------------|---------------------------|-------|
| `/quick-prototype` | prototyper → integrator | `prototype` skill |
| `/parallel-explore-build` | explore + 2× prototyper (parallel) | `prototype` skill (unique — no Matt equivalent) |

**Issues — wraps `plan`, `prototype`, `integrator`, `to-tickets` skills**

| Command | Chain | Wraps |
|-------------------------------|---------------------------------------------|-------|
| `/design-and-track` | plan → human review → prototyper → human review → integrator → approve issues → to-tickets | `to-spec` + `to-tickets` skills |
| `/design-with-handoffs` | plan → human review → prototyper → human review → integrator | `handoff` skill |
| `/design-prototype-integrate` | plan → prototyper → integrator (no auto-tracking) | — |

**Spec + Issues — wraps `to-spec` + `to-tickets` skills**

| Command | Chain | Wraps |
|-------------------------------|--------------------------------------------------|-------|
| `/full-initiative` | plan → human review → publish spec → prototyper → human review → update spec → to-tickets | `to-spec` + `to-tickets` skills |

**Cross-Agent (spans sessions)**

| Command | Chain | Wraps |
|-------------------------------|--------------------------------------------------|-------|
| `/cross-agent-prototype` | Grill session → prototype session → return learnings to grill session | `handoff` skill |

**On-Demand Composition:**

Simple 2-step chains compose directly in chat — no prompt needed:

```
explore finds the auth code → diagnose analyzes it
explore finds changed files → reviewer reviews them
```

---

## Custom Agents

Custom agents live under `~/.pi/agent/agents/`. They are thin, task-specific wrappers with bounded tools and thinking levels. They inherit the parent model unless a caller deliberately selects a task-scoped model; do not silently reroute them.

Run no more than three background agents simultaneously. The subagent manager queues additional background work until a slot opens.

| Agent | What it does |
|-------|--------------|
| build | Standard development work with full file and shell tools |
| scout | Fast codebase reconnaissance and compressed handoffs |
| plan | Requirements grilling and design-spec synthesis |
| prototyper | Throwaway prototypes that validate high-fidelity decisions |
| integrator | Fold validated prototype findings into production or delete them |
| reviewer | Quality, security, and maintainability review |
| test | Write and debug tests and improve coverage |
| docs | Technical and API documentation |
| thermo-nuclear-code-quality-review-subagent | Harsh maintainability audit |
| thermo-nuclear-review-subagent | Branch audit for bugs, security, and breaking changes |

**Skills (~/.pi/agent/skills/):**

| Skill | Source | Purpose |
|-------|--------|---------|
| diagnose | ~/.agents/skills/diagnose | Disciplined bug diagnosis workflow |
| prototype | ~/.agents/skills/prototype | Throwaway prototype building |
| triage | ~/.agents/skills/triage | Issue classification state machine |
| thermo-nuclear-review | ~/.agents/skills/thermo-nuclear-review | Security/correctness audit rubric |
| thermo-nuclear-code-quality-review | ~/.agents/skills/thermo-nuclear-code-quality-review | Maintainability audit rubric |
| thermos | ~/.agents/skills/thermos | Combined thermo review orchestrator |
| handoff | ~/.agents/skills/handoff | Session handoff documentation |
| grill-with-docs | ~/.agents/skills/grill-with-docs | Design grilling with domain docs |
| improve-codebase-architecture | ~/.agents/skills/improve-codebase-architecture | Architecture deepening |
| code-navigation | local | Tool reference and navigation patterns |
| subagents | local | Bounded delegation guidance for `@tintinweb/pi-subagents` |
| tilth | local | Structural diff/blast-radius analysis |
| to-spec | ~/.agents/skills/to-spec | Spec publishing |
| to-tickets | ~/.agents/skills/to-tickets | Tracer-bullet implementation tickets |

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

## Agent Handoff Pattern

Workflows pass data between agents via `{previous}` and the `handoff` skill format from Matt's skills.

1. **Agent 1** produces structured output (design spec, prototype findings, etc.)
2. **Agent 2** receives `{previous}` as context, adds its own layer
3. **Agent 3** receives `{previous}`, makes decisions, uses `handoff` skill to create summary

### handoff Skill Format

The `handoff` skill (from Matt's skills) provides the canonical structure for session-to-session communication:

- **Context**: What was done in this session
- **Decisions**: Key choices made
- **Next Steps**: What the next agent should do
- **Suggested Skills**: Which skills the next agent should load

### Questions for Human Pattern

Subagents can't interact directly. If a subagent needs clarification, it outputs `## Questions for Human` in its result. The main agent grills you with those questions, then passes answers back to continue the chain.

### Handoff File as Communication Channel

Handoff files act as **write-once, read-when-needed** communication between main and subagents:

1. Subagent writes findings → returns file path only (not content)
2. Main agent holds path in context (keeps tokens low)
3. Human reviews handoff on demand when needed
4. Human appends decisions to the same file
5. Next subagent reads updated handoff file

This avoids stuffing giant summaries into `{previous}` that aren't needed until later.

### Context Hygiene

| Principle | Why |
|-----------|-----|
| Keep sessions pure | Models degrade with irrelevant tokens ("dumb zone") |
| Handoffs are disposable | Save to `/tmp`, not codebase — bridges, not docs |
| Include purpose + suggested skills | Next agent knows how to behave immediately |
| Close the loop | Prototype findings flow back to inform planning/PRDs |
| Don't duplicate artifacts | Reference existing issues/docs by path, don't re-copy them |

### Grilling Best Practices

| Do | Don't |
|----|-------|
| Lead the conversation — keep agent on track | Sit passively and answer 200 questions |
| Save decisions to PRD/handoff BEFORE clearing context | Clear context first, lose valuable decisions |
| Break large scopes into sub-scopes before grilling | Grill at massive scope (hits ~120k "dumb zone") |
| Use low-fidelity questions for conversation | Try to grill high-fidelity questions (use prototype instead) |

### Question Fidelity

| Low-Fidelity (grillable via chat) | High-Fidelity (needs prototype) |
|----------------------------------|--------------------------------|
| URL routing choices | UI "feel" and layout |
| API contract shape | Complex form interactions |
| Module boundaries | State machine edge cases |
| Naming conventions | Animation timing/flow |

**Rule:** If you can't explain the answer in 2 sentences, it's high-fidelity → use `/cross-agent-prototype`.

### When to Chain vs Start Fresh

| Use chain | Use fresh session |
|-----------|-------------------|
| 2-3 steps max | Long workflows (>3 steps) |
| Context stays relevant | Different domain/task |
| No human review needed | Need human decision point |

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
