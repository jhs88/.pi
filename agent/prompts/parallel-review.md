---
description: Run multiple analysis agents in parallel on different areas of the codebase. Use when you want a broad review across multiple modules at once.
---
Use the subagent tool with the parallel parameter to execute these tasks simultaneously (max 2 concurrent):

1. Use the "code-reviewer" agent to review code quality and security for: $@
2. Use the "architect" agent to find architectural friction and deepening opportunities in the same area

Run both agents in parallel using the parallel mode. They will each return structured findings independently.
