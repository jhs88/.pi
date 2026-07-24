---
name: subagents
description: Use Pi subagents for isolated delegation when the user explicitly requests them or when independent research or implementation work benefits from bounded parallel execution.
---

# Subagents

This configuration uses [`@tintinweb/pi-subagents`](https://github.com/tintinweb/pi-subagents), exposed through `Agent`, `get_subagent_result`, and `steer_subagent`. It does not use Ben Davis's `subagent_spawn` harness or his Claude Code/Codex harness adapters.

Each child is headless, has its own context window, and cannot infer the parent conversation. Give every child a self-contained prompt with relevant paths, constraints, known evidence, forbidden actions, and the expected report or artifact.

## Spawn

Call `Agent` with:

- `subagent_type`: an available built-in or configured agent type;
- `prompt`: the complete task briefing;
- `description`: a short three-to-five-word UI label;
- `run_in_background: true` when the parent can continue useful work independently.

Omit `model` and `thinking` to inherit the parent unless the user requests an override. When overriding, use a model currently reported by `pi --list-models`; do not invent aliases or modify provider configuration.

## Parallel and background work

- Run no more than three children concurrently in this configuration.
- For genuine parallelism, issue independent background `Agent` calls together rather than sequentially.
- Continue useful parent work after spawning; do not poll immediately.
- Use `get_subagent_result` with `wait: true` only when a child's result is required for the next step. Cancelling the wait does not cancel the child.
- Results and completion notifications return to the parent automatically.

## Inspect, steer, and stop

- Use `get_subagent_result` to inspect status or retrieve a completed result.
- Use `steer_subagent` to redirect a running child after its current tool call.
- Use `/agents` to inspect, enter, steer, or stop runs interactively.
- Treat interrupted, stopped, or incomplete output as partial evidence, not successful completion.

## Boundaries

- Do not ask children to spawn subagents or workflows.
- Do not delegate tasks that require user interaction; the parent owns questions and approvals.
- Keep workflow orchestration separate: use the Pi Tooling `workflow` tool only when the user explicitly requests a workflow run.
- Verify child claims before reporting external writes, commits, uploads, or other side effects as complete.

## Provenance

Selectively adapted at the repository owner's direction from `davis7dotsh/my-pi-setup@797eaf6d6f178759cf7aabde927ef15c91346e7e`, `skills/subagents/SKILL.md`. The upstream repository had no detected license. This local adaptation replaces Ben's incompatible `subagent_*` and external-harness guidance with the installed MIT-licensed `@tintinweb/pi-subagents` contract and this configuration's three-child policy.
