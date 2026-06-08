# .pi

pi-mono stuff I've found useful

## Design Philosophy

- **Agents = primitives.** Do one thing. Don't hard-wire PRD/issues into them.
- **Prompts = composition.** Decide flow and tracking based on situation.

### Tracking Levels

| Level | Artifact |
|-------|----------|
| Handoff only | Temp file (quick experiments) |
| Issues | Issue tracker (features with scope) |
| PRD + Issues | Issue tracker parent + children (big initiatives) |
| ADR | `docs/adr/` (architectural decisions) |

The workflow prompt decides which level applies.

---

## Quick Start

### Single agent

```
"Use triage to classify this bug report: 'app crashes on login'"
```

### Full workflow - design to production

```
/design-prototype-integrate "Build a caching layer for the API"
# → argument becomes $1 inside the template
```

### Quick prototype - skip design phase

```
/quick-prototype "Try using Redis vs in-memory cache"
```

### Architecture review

```
/architecture-deepening "src/api/routes"
```

### Parallel exploration - 3 arguments for 3 agents

```
/parallel-explore-build "auth module" "switch to GraphQL" "keep REST but add tRPC"
# → $1 = area, $2 = option A, $3 = option B
```

### Manual chain (full control)

```
Use a chain: explore finds the payment code → diagnose analyzes it → integrator implements fixes
```

### Parallel (independent tasks)

```
Run 3 agents in parallel: explore on auth, explore on payments, triage on this bug report
```

---

## Custom Agents

### 14 Agents (~/.pi/agent/agents/) — qwen3.6-27b-mtp for bigger tasks, qwen3.6-35b-a3b-mtp for fast tasks

**Core Workflow (max 3 running simultaneously due to hardware):**

| Agent | Model | What it does |
|-------|-------|--------------------------------------------------|
| explore | 27b-mtp | Codebase recon → structured findings (bigger model) |
| scout | 35b-a3b-mtp | Codebase recon → structured findings (faster model) |
| plan | 35b-a3b-mtp | Synthesize requirements → design spec (+ questions for human) |
| prototyper | 35b-a3b-mtp | Build throwaway prototypes to validate |
| integrator | 35b-a3b-mtp | Fold prototype into production or delete |

**Build Agent:**

| Agent | Model | What it does |
|-------|-------|--------------------------------------------------|
| build | 27b-mtp | Default primary agent with all tools (bigger model) |

**Specialized Agents:**

| Agent | Model | What it does |
|-------|-------|--------------------------------------------------|
| reviewer | 35b-a3b-mtp | Quality/security/maintainability review |
| test | 35b-a3b-mtp | Writing/debugging tests, improving coverage |
| docs | 35b-a3b-mtp | Library/API documentation writing |
| diagnose | 35b-a3b-mtp | Bug diagnosis loop (loads diagnose skill) |
| triage | 35b-a3b-mtp | Issue classification/prioritization (loads triage skill) |
| thermo-nuclear-code-quality-review-subagent | 35b-a3b-mtp | Harsh maintainability audit (loads thermo-nuclear-code-quality-review skill) |
| thermo-nuclear-review-subagent | 35b-a3b-mtp | Branch audit: bugs, security, breaking changes (loads thermo-nuclear-review skill) |
| meta-agent | 35b-a3b-mtp | Create new agents/skills |

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
| tilth | local | Structural diff/blast-radius analysis |
| to-prd | ~/.agents/skills/to-prd | PRD publishing |

---

## Custom Prompts

### 8 Workflow Prompts (~/.pi/agent/prompts/) — chain multiple agents

Arguments you type after the command become positional variables (`$1`, `$2`…) inside the template. See `argument-hint` in each prompt's frontmatter for expected inputs.

**Tracking: Handoff Only**

| Command | Chain |
|---------------------------|---------------------------|
| `/quick-prototype` | prototyper → integrator |
| `/parallel-explore-build` | explore + 2× prototyper (parallel) |

**Tracking: Issues**

| Command | Chain |
|-------------------------------|---------------------------------------------|
| `/design-and-track` | plan → human review → prototyper → human review → integrator → approve issues → to-issues |
| `/design-with-handoffs` | plan → human review → prototyper → human review → integrator |
| `/design-prototype-integrate` | plan → prototyper → integrator (no auto-tracking) |

**Tracking: PRD + Issues**

| Command | Chain |
|-------------------------------|--------------------------------------------------|
| `/full-initiative` | plan → human review → publish PRD → prototyper → human review → update PRD → to-issues |

**Cross-Agent (spans sessions)**

| Command | Chain |
|-------------------------------|--------------------------------------------------|
| `/cross-agent-prototype` | Grill session → prototype session → return learnings to grill session |

**On-Demand Composition:**

Simple 2-step chains compose directly in chat — no prompt needed:

```
explore finds the auth code → diagnose analyzes it
explore finds changed files → reviewer reviews them
```

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

Workflows pass data between agents via `{previous}`:

1. **Agent 1** produces structured output (design spec, prototype findings, etc.)
2. **Agent 2** receives `{previous}` as context, adds its own layer
3. **Agent 3** receives `{previous}`, makes decisions, uses `handoff` skill to create summary

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

Pulled directly from the examples in `pi-mono` repo. Kept up to date manually — it's easier.

Credit: several extensions are inspired by [davis7dotsh/my-pi-setup](https://github.com/davis7dotsh/my-pi-setup).

### Recommended Skills

pi reads from `~/.agents/skills`, `~/.pi/skills`, and `$(cwd)/.pi/skills`. It's recommended to install Matt's skills:

```bash
npx skills@latest add mattpocock/skills
```

### Recommended Resources

- [A Philosophy of Software Design](https://milkov.tech/assets/psd.pdf) — book related to his skills
