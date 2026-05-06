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

### 7 Agents (~/.pi/agent/agents/) — all on qwen3.6-35b-a3b

┌───────────────┬──────────────────────────────────────────┐
│ Agent │ What it does │
├───────────────┼──────────────────────────────────────────┤
│ scout │ Codebase recon → structured findings │
├───────────────┼──────────────────────────────────────────┤
│ triage │ Classify issues into category + state │
├───────────────┼──────────────────────────────────────────┤
│ doc-writer │ PRDs, tickets, docs from context │
├───────────────┼──────────────────────────────────────────┤
│ test-writer │ TDD red-green-refactor tests │
├───────────────┼──────────────────────────────────────────┤
│ diagnose │ Bug diagnosis with ranked hypotheses │
├───────────────┼──────────────────────────────────────────┤
│ code-reviewer │ Quality/security/maintainability review │
├───────────────┼──────────────────────────────────────────┤
│ architect │ Find refactoring/deepening opportunities │
├───────────────┼──────────────────────────────────────────┤
│ explainer │ High-level explanation of code areas │
└───────────────┴──────────────────────────────────────────┘

## Custom Prompts

### 6 Workflow Prompts (~/.pi/agent/prompts/) — chain multiple agents

┌──────────────────────────────┬─────────────────────────────┐
│ Command │ Chain │
├──────────────────────────────┼─────────────────────────────┤
│ /scout-and-plan <query> │ scout → doc-writer │
├──────────────────────────────┼─────────────────────────────┤
│ /investigate <query> │ scout → diagnose │
├──────────────────────────────┼─────────────────────────────┤
│ /review <query> │ scout → code-reviewer │
├──────────────────────────────┼─────────────────────────────┤
│ /explore-and-explain <query> │ scout → explainer │
├──────────────────────────────┼─────────────────────────────┤
│ /architect-review <query> │ scout → architect │
├──────────────────────────────┼─────────────────────────────┤
│ /test-and-review <query> │ test-writer → code-reviewer │
└──────────────────────────────┴─────────────────────────────┘

## How it all works together

### Quick single agent

│ "Use triage to classify this bug report: 'app crashes on login'"

### Workflow command

│ /investigate the auth module is leaking memory

### Manual chain (full control)

│ Use a chain: scout finds the payment code → diagnose analyzes it → doc-writer creates a PRD for fixes

### Parallel (independent tasks)

│ Run 3 agents in parallel: scout on auth, scout on payments, triage on this bug report
