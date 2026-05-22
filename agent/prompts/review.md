---
description: Scout finds changed or relevant files, then code-reviewer reviews them for quality and security. Use for PR reviews or code quality checks.
---
Execute as a **chain** of 2 agents:

1. **scout** — Find recently changed files and key modifications
2. **code-reviewer** — Review code quality, security, and maintainability

```
subagent chain:
  - agent: scout
    task: Find all recently changed files and their modifications (use git diff) for: {{area_or_pr}}
  - agent: code-reviewer
    task: Review the code findings from {previous} for quality, security, and maintainability issues.
```

**Output:** Structured review with issues categorized by severity and suggested fixes.
