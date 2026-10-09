# Code navigation

Use outlines and structural search before reading whole files. The objective is to find the smallest source region that can answer the current question.

Inspired by [markerikson/opencode-config-example](https://github.com/markerikson/opencode-config-example/blob/main/config/AGENTS.md).

## Tool selection

| Need | Tool | Approach |
|---|---|---|
| Directory overview | `mcp__grepika__toc` | Inspect the target tree before choosing files |
| Natural-language or regex search | `mcp__grepika__search` | Locate symbols, concepts, and exact text |
| File structure | `mcp__grepika__outline` → `mcp__grepika__get` | Read the outline, then a targeted range |
| Symbol definitions | `mcp__tilth__tilth_search` | Prefer definition-first navigation |
| Callers of a symbol | `mcp__tilth__tilth_search kind:callers` | Trace incoming dependencies |
| Dependency impact | Discover `mcp__tilth__tilth_deps` in codemode | Inspect blast radius before mutation |
| File reads | built-in `read` | Read the required lines |

## Default sequence

1. **Orient.** Inspect the target directory with `mcp__grepika__toc`.
2. **Find.** Locate symbols or concepts with Grepika or Tilth search.
3. **Outline.** Inspect file or symbol structure.
4. **Read surgically.** Fetch only the relevant section.
5. **Trace impact.** Inspect callers and dependencies before editing.
6. **Verify.** Re-read changed regions and run the repository's actual checks.

## Tool visibility

Native MCP is explicitly enabled through `+builtin:mcp`. The personal `agent/mcp.json` keeps six Grepika and Tilth navigation tools directly visible through `toolExposure` overrides. Other navigation operations use `codemode`; Firecrawl uses `codemode`, so its tools are discovered on demand rather than listed in the codemode description.

In a parent session, discover tools with `searchTools(query, { namespace })`, inspect `describeTool(name)` or `ALL_TOOLS`, then call `tools.<name>(args)` using the offered schema. Check `isError` in MCP results before using their content. See the [navigation skill](../agent/skills/code-navigation/SKILL.md) for examples.

The child profiles are intentionally narrower. `scout` loads only `builtin:mcp` and allows six explicit read-only navigation tools, with no shell, write, edit, codemode, or tool discovery. `build` and `docs` use the same navigation allowlist alongside their existing built-ins; `docs` has no shell. Their `tools:` entries select native navigation through `ext:builtin:mcp/<native-tool-name>`, not plain tool names. The six gauntlet roles keep extensions disabled. Installation and the explicit SDK compatibility-patch command are in the [README](../README.md#setup).

Tool availability is a runtime fact. Inspect the active tool catalog rather than assuming that an MCP server, extension, or profile exposes every operation described here.

## Context hygiene

- Read structure before content.
- Keep the question and evidence contract explicit.
- Prefer one precise source range over several complete files.
- Treat cached or indexed output as navigation evidence; read canonical source before making a material claim.
- Pass compact paths, symbols, and outcomes across fresh contexts instead of entire exploratory transcripts.
- After mutation, verify the actual diff and executable behavior rather than relying on the editing agent's summary.
