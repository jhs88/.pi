---
description: Scout maps the codebase, then architect finds deepening and refactoring opportunities
---
Use the subagent tool with the chain parameter to execute this workflow:

1. First, use the "scout" agent to map out the modules, dependencies, and architecture of: $@
2. Then, use the "architect" agent to identify architectural friction and deepening opportunities based on the findings from the previous step (use {previous} placeholder)

Execute this as a chain, passing output between steps via {previous}.
