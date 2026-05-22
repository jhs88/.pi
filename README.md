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

## extensions

They are pulled directly from the examples in `pi-mono` repo.
I keep them up to date manually it's easier.

## Recommended Skills

pi can read from `~/.agents/skills`, `~/.pi/skills`, `$(cwd)/.pi/skills` we don't include them here.

It's recommended to install Matt's awesome skills here:

```bash
npx skills@latest add mattpocock/skills
```

## Recommended Resources

[A Philosophy of Software Design](https://milkov.tech/assets/psd.pdf) - Book related to his skills

## Custom Agents

### 9 Agents (~/.pi/agent/agents/) — all on qwen3.6-35b-a3b

**Core Workflow (3 agents at a time due to hardware constraints):**

| Agent | What it does |
|-------|--------------------------------------------------|
| scout | Codebase recon → structured findings |
| designer | Grill requirements → design spec |
| prototyper | Build throwaway prototypes to validate |
| integrator | Fold prototype into production or delete |

**Specialized Agents:**

| Agent | What it does |
|-------|--------------------------------------------------|
| diagnose | Bug diagnosis with ranked hypotheses |
| triage | Classify issues into category + state |
| code-reviewer | Quality/security/maintainability review |
| coder | Legacy general-purpose task executor |
| meta-agent | Create new agents/skills |

## Custom Prompts

### 8 Workflow Prompts (~/.pi/agent/prompts/) — chain multiple agents

**Tracking: Handoff Only**

| Command | Chain |
|---------------------------|---------------------------|
| `/quick-prototype` | prototyper → integrator |
| `/parallel-explore-build` | scout + 2× prototyper (parallel) |

**Tracking: Issues**

| Command | Chain |
|-------------------------------|---------------------------------------------|
| `/design-and-track` | designer → prototyper → integrator → to-issues |
| `/design-prototype-integrate` | designer → prototyper → integrator (no auto-tracking) |

**Tracking: PRD + Issues**

| Command | Chain |
|-------------------------------|--------------------------------------------------|
| `/full-initiative` | designer → to-prd → prototyper → update PRD → to-issues |

**Tracking: ADR Only**

| Command | Chain |
|----------------------------------|---------------------------------------------|
| `/architecture-deepening` | scout → architect → integrator |

**Legacy Workflows:**

| Command | Chain |
|---------------------------|---------------------------|
| `/investigate <query>` | scout → diagnose |
| `/review <query>` | scout → code-reviewer |

## How it all works together

### Quick single agent

```
"Use triage to classify this bug report: 'app crashes on login'"
```

### Full workflow - design to production

```
/design-prototype-integrate "Build a caching layer for the API"
```

### Quick prototype - skip design phase

```
/quick-prototype "Try using Redis vs in-memory cache"
```

### Architecture review

```
/architecture-deepening "src/api/routes"
```

### Parallel exploration - test multiple options

```
/parallel-explore-build "Compare GraphQL vs REST for this feature"
```

### Manual chain (full control)

```
Use a chain: scout finds the payment code → diagnose analyzes it → integrator implements fixes
```

### Parallel (independent tasks)

```
Run 3 agents in parallel: scout on auth, scout on payments, triage on this bug report
```

## Agent Handoff Pattern

Workflows pass data between agents via `{previous}`:

1. **Agent 1** produces structured output (design spec, prototype findings, etc.)
2. **Agent 2** receives `{previous}` as context, adds its own layer
3. **Agent 3** receives `{previous}`, makes decisions, uses `handoff` skill to create summary

**Handoff documents** are created with the `handoff` skill and saved to temp paths. Pass these paths to future sessions to continue work.
