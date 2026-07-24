# Pi Config

This repository curates a portable, human-controlled Pi environment: extensions, prompts, skills, agents, themes, and model aliases that remain understandable and selectively composable.

## Language

**Extension**:
A Pi capability packaged as code and loaded into the interactive agent runtime.
_Avoid_: Plugin, add-on

**Ad hoc delegation**:
A directly requested, role-based child-agent run used for a bounded task without a multi-phase graph.
_Avoid_: Workflow

**Workflow**:
An explicitly requested, phased orchestration graph that can fan work out and combine structured results.
_Avoid_: Automatic delegation, ultracode

**Workflow child**:
An isolated agent session created by a workflow and prohibited from recursively invoking orchestration.
_Avoid_: Nested orchestrator
