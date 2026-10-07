---
name: subagents
description: Use Pi subagents for isolated delegation when the user explicitly requests them or when independent research or implementation work benefits from bounded parallel execution.
---

# Subagents

Use `subagent` for delegation, `subagent_result` to retrieve results, and `subagent_steer` to redirect a child. Inspect each tool's advertised schema before calling it. Keep `subagent_workflow` separate from Pi Tooling's explicitly requested `workflow` tool.

Each child is headless, has its own context window, and cannot infer the parent conversation. Give every child a self-contained prompt with relevant paths, constraints, known evidence, forbidden actions, and the expected report or artifact.

## Spawn

Before any call, inspect the `subagent` tool's advertised types and require the exact intended name. The configured defaults are hidden, not fail-closed: an unknown or misspelled type falls back to a mutable `general-purpose` agent. Stop when the intended type is absent; never probe by dispatching an unknown name.

Call `subagent` with:

- `subagent_type`: the exact preflighted configured agent type;
- `prompt`: the complete task briefing;
- `description`: a short three-to-five-word UI label;
- `run_in_background: false` for visible foreground delegation. Use background execution only when the advertised tool explicitly supports it.

Omit `model` and `thinking` to inherit the parent unless the user requests an override. When overriding, use a model currently reported by `pi --list-models`; do not invent aliases or modify provider configuration.

## Parallel and background work

- Run no more than three children concurrently in this configuration.
- Issue independent calls together only when the host supports concurrent execution; otherwise run children serially.
- Foreground calls wait for completion. Continue parent work after spawning only when supported background execution returns a live child ID; do not poll immediately.
- Use `subagent_result` with `wait: true` only when a child's result is required for the next step. Cancelling the wait does not cancel the child.
- Results and completion notifications return to the parent automatically.

## Inspect, steer, and stop

- Use `subagent_result` to inspect status or retrieve a completed result.
- Use `subagent_steer` to redirect a running child after its current tool call.
- Use `/agents` to inspect, enter, steer, or stop runs interactively.
- Treat interrupted, stopped, or incomplete output as partial evidence, not successful completion.

## Boundaries

- Do not ask children to spawn subagents or workflows.
- Do not delegate tasks that require user interaction; the parent owns questions and approvals.
- Keep workflow orchestration separate: use the Pi Tooling `workflow` tool only when the user explicitly requests a workflow run.
- Verify child claims before reporting external writes, commits, uploads, or other side effects as complete.

## Provenance

Selectively adapted at the repository owner's direction from `davis7dotsh/my-pi-setup@797eaf6d6f178759cf7aabde927ef15c91346e7e`, `skills/subagents/SKILL.md`. The upstream repository had no detected license. This local adaptation replaces Ben's incompatible `subagent_*` and external-harness guidance with the installed MIT-licensed `@tintinweb/pi-subagents` contract and this configuration's three-child policy.
