# Global Rules

Standard behaviors that pi should always follow.

## Quick Reference — Critical Rules

- **Never auto-commit** — always wait for explicit user instruction
- **Use `~/` paths** — never expand to full platform paths in bash commands
- **No sycophancy** — no "You're absolutely right!", no empty validation
- **No `any` types** — always use actual TypeScript types
- **Escalate after 2 failures** — stop, analyze, try a different approach
- **Minimize context** — read outlines first, then targeted sections

## Tool Rules

**Principle: minimize context consumption.** Read outlines first, then targeted sections. Be surgical.

| Need | Tool |
|---|---|
| Directory overview | `mcp__grepika__toc` |
| Symbol definitions / callers | `mcp__tilth__tilth_search` (use `kind:callers` for caller tracing) |
| File structure | `mcp__grepika__outline` → `mcp__grepika__get` (read only needed lines) |
| Code search (NL/regex) | `mcp__grepika__search` |
| File reads | built-in `read` |

### Quick Decision

- "Find files about X topic" → **grepika** (NL search)
- "Where is Y defined?" → **tilth** (structural)
- "What calls Z?" → **tilth** (callers)
- Regex/text pattern → **grepika** (grep mode)

### Non-Code Files

- Config, JSON, small files: built-in `read`
- Markdown/docs: scan headers with `rg` first, read targeted sections

Native MCP names use `mcp__<server>__<offered-tool>`. In parent sessions, discover other operations through `codemode`: `searchTools(query, { namespace })` → `describeTool(name)` → `tools.<name>(args)`. Check MCP results for `isError`. Restricted children have only their explicit navigation allowlist; use the available built-in tools when discovery is absent.

**Load `code-navigation` for tool schemas and discovery workflows.**

**Grepika:** uses relative paths only (no absolute paths). Omit `path` to search workspace root.
