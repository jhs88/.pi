---
description: Scout finds relevant code, then diagnose analyzes it for bugs or issues. Use when debugging or investigating problems.
---
Execute as a **chain** of 2 agents:

1. **scout** — Find all code relevant to the issue
2. **diagnose** — Analyze findings and produce ranked hypotheses

```
subagent chain:
  - agent: scout
    task: Find all code relevant to: {{issue_description}}
  - agent: diagnose
    task: Analyze the scout findings from {previous} and produce ranked hypotheses about the issue.
```

**Output:** Ranked list of hypotheses with confidence levels and suggested next steps.
