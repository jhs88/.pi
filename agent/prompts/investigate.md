---
description: Scout finds relevant code, then diagnose analyzes it for bugs or issues
---
Use the subagent tool with the chain parameter to execute this workflow:

1. First, use the "scout" agent to find all code relevant to: $@
2. Then, use the "diagnose" agent to analyze the findings from the previous step (use {previous} placeholder) and produce ranked hypotheses about the issue

Execute this as a chain, passing output between steps via {previous}.
