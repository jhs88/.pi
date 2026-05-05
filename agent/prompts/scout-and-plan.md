---
description: Scout explores the codebase, then doc-writer creates a structured plan or PRD from findings
---
Use the subagent tool with the chain parameter to execute this workflow:

1. First, use the "scout" agent to find all code relevant to: $@
2. Then, use the "doc-writer" agent to create a structured implementation plan for "$@" using the context from the previous step (use {previous} placeholder)

Execute this as a chain, passing output between steps via {previous}. Do NOT implement — just return the plan.
