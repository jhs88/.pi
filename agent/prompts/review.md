---
description: Scout finds changed or relevant files, then code-reviewer reviews them for quality and security
---
Use the subagent tool with the chain parameter to execute this workflow:

1. First, use the "scout" agent to find all recently changed files and their key modifications (use git diff) for: $@
2. Then, use the "code-reviewer" agent to review the code found in the previous step (use {previous} placeholder)

Execute this as a chain, passing output between steps via {previous}.
