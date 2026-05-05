---
description: Test-writer creates tests for a feature, then code-reviewer reviews the test quality
---
Use the subagent tool with the chain parameter to execute this workflow:

1. First, use the "test-writer" agent to write tests for: $@
2. Then, use the "code-reviewer" agent to review the tests from the previous step (use {previous} placeholder) for quality and coverage

Execute this as a chain, passing output between steps via {previous}.
