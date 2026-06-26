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
4. Launch both thermo subagents in parallel using the `Agent` tool from `@tintinweb/pi-subagents`:

```js
Agent({
  subagent_type: "thermo-nuclear-review-subagent",
  description: "bug security review",
  run_in_background: true,
  thinking: "high",
  max_turns: 10,
  prompt: `### Git / diff output
<diff>

### Changed file contents
<contents>`
})
Agent({
  subagent_type: "thermo-nuclear-code-quality-review-subagent",
  description: "quality review",
  run_in_background: true,
  thinking: "high",
  max_turns: 10,
  prompt: `### Git / diff output
<diff>

### Changed file contents
<contents>`
})
```

5. Use completion notifications or `get_subagent_result({ agent_id, wait: true })` to collect both results.
6. Synthesize the results with findings first, deduplicated across reviewers. Weight overlapping findings more heavily, resolve disagreements with your own judgment, and keep summaries brief.

If individual background summaries are already visible to the user, do not restate them wholesale. Surface the unified verdict, highest-signal findings, and remaining uncertainty.
