---
description: Full code review chain — scout finds changes, architect analyzes structure, reviewer checks quality. Use for comprehensive pre-merge reviews.
---
Use the subagent tool with the chain parameter to execute this workflow:

1. First, use the "scout" agent to find all recently changed files and their modifications (use git diff) for: $@
2. Then, use the "architect" agent to analyze whether the changes maintain good module depth and seams (use {previous} placeholder)
3. Finally, use the "code-reviewer" agent to do a thorough quality and security review of the findings (use {previous} placeholder)

Execute this as a chain: scout → architect → code-reviewer. Each step builds on the previous one's structured output.
