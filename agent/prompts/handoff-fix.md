---
description: Handoff a bug investigation to a worker for fixing. Scout finds the code, diagnose analyzes it, worker implements the fix. Use when you have a bug report and want it investigated and fixed end-to-end.
---
Use the subagent tool with the chain parameter to execute this workflow:

1. First, use the "scout" agent to find all code relevant to the issue: $@
2. Then, use the "diagnose" agent to analyze the findings and produce ranked hypotheses (use {previous} placeholder)
3. Finally, use the "worker" agent to implement a fix based on the diagnosis from the previous step (use {previous} placeholder)

Execute this as a chain: scout → diagnose → worker. The worker has write/edit/bash access and will make the actual fix.
