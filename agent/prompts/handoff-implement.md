---
description: Handoff current context to a worker agent. Compacts findings into an implementation task and delegates execution. Use when you've explored or planned and now want a worker to actually do the work.
---
Use the subagent tool with the chain parameter to execute this workflow:

1. First, use the "scout" agent to gather the current state of all code relevant to: $@
2. Then, use the "doc-writer" agent to create a structured implementation brief from the scout findings (use {previous} placeholder)
3. Finally, use the "worker" agent to implement the plan from the previous step (use {previous} placeholder)

Execute this as a chain: scout → doc-writer → worker. The worker has write/edit/bash access and will actually make the changes.
