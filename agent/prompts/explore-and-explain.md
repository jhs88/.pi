---
description: Scout explores a code area, then explainer produces a high-level explanation of how it works
---
Use the subagent tool with the chain parameter to execute this workflow:

1. First, use the "scout" agent to explore the codebase area relevant to: $@
2. Then, use the "explainer" agent to explain what this area does and how it fits into the bigger picture, using the findings from the previous step (use {previous} placeholder)

Execute this as a chain, passing output between steps via {previous}.
