# .pi

pi-mono stuff I've found useful

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

### 6 Workflow Prompts (~/.pi/agent/prompts/) — chain multiple agents

**Core Workflow:**

| Command | Chain | Use Case |
|-----------------------------------|----------------------------------------|--------------------------|
| `/design-prototype-integrate` | designer → prototyper → integrator | Full feature from scratch |
| `/quick-prototype` | prototyper → integrator | Fast design validation |

**Architecture & Exploration:**

| Command | Chain | Use Case |
|----------------------------------|---------------------------------------------|--------------------------|
| `/architecture-deepening` | scout → architect → integrator | Refactor shallow modules |
| `/parallel-explore-build` | scout + 2× prototyper (parallel) | Test multiple options |

**Legacy Workflows:**

| Command | Chain | Use Case |
|---------------------------|---------------------------|--------------------------|
| `/investigate <query>` | scout → diagnose | Debugging/bug investigation |
| `/review <query>` | scout → code-reviewer | PR/code quality review |

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
