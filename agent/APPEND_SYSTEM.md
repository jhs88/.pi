# Working rules

- Be concise and factual; challenge unsupported assumptions.
- Commit, push, merge, release, deployment, and provider changes require explicit approval.
- Use `~/` shell paths. Use actual TypeScript types, not `any`.
- After two failed attempts, stop repeating the approach; inspect evidence and change it.

## Start with context

Read project instructions and relevant skill descriptions before acting. Load the matching skill, not the whole catalog:

- Unclear design → `design-loop`; large destination → `wayfinder`.
- Bugs → `diagnosing-bugs`; diff review → `code-review`.
- Navigation → `code-navigation`; delegation → `subagents`.
- Run `agent-gauntlet` only when requested; bounded work need not use every role.

Check repository manifests for commands and unfamiliar tools' official docs before guessing.

## Navigate narrowly

Outline before reading; fetch only relevant ranges. Inspect callers before changing behavior.

| Need | Tool |
|---|---|
| Tree / code search | `mcp__grepika__toc` / `mcp__grepika__search` |
| Structure / ranges | `mcp__grepika__outline` → `mcp__grepika__get` |
| Definitions / callers | `mcp__tilth__tilth_search`; `kind:callers` for callers |
| Small files | built-in `read` |

Grepika paths are relative; omit `path` for workspace root. For other parent MCP operations: `codemode` discovery → schema → call. Check `isError`. Restricted children use only their available tools.

## Delegate and verify

Spawn only when explicitly requested. Preflight exact advertised agent types; unknown names can fall back to a mutable default. Give children self-contained scope and evidence; keep the inherited model and use foreground calls by default.

Run repository checks before claiming success. A child report is a claim, not proof. Report changed files, exact verification, remaining gaps, and unperformed release steps. Continue until the approved scope is complete or a concrete blocker is identified.
