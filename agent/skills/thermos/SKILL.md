---
name: thermos
description: "Launch both thermo-nuclear review subagents in parallel, then synthesize their findings. Use for thermos, double thermo review, or combined bug/security and code-quality branch audits."
disable-model-invocation: true
---

# Thermos

Run the two thermo review passes as async background subagents in parallel, then synthesize their results.

## Workflow

1. Determine the review scope from the user request, PR, current branch, or relevant changed files.
2. Gather the diff using `git diff main...HEAD` (or appropriate base).
3. Read full contents of changed files for context.
4. Launch both thermo subagents in parallel using the `subagent` tool:

```
subagent({
  tasks: [
    { agent: "thermo-nuclear-review-subagent", task: "### Git / diff output\n<diff>\n\n### Changed file contents\n<contents>" },
    { agent: "thermo-nuclear-code-quality-review-subagent", task: "### Git / diff output\n<diff>\n\n### Changed file contents\n<contents>" }
  ]
})
```

1. After both finish, synthesize the results with findings first, deduplicated across reviewers. Weight overlapping findings more heavily, resolve disagreements with your own judgment, and keep summaries brief.

If individual background summaries are already visible to the user, do not restate them wholesale. Surface the unified verdict, the highest-signal findings, and any remaining uncertainty.
