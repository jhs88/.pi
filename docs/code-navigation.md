# Code navigation

Use outlines and structural search before reading whole files. The objective is to find the smallest source region that can answer the current question.

Inspired by [markerikson/opencode-config-example](https://github.com/markerikson/opencode-config-example/blob/main/config/AGENTS.md).

## Tool selection

| Need | Tool | Approach |
|---|---|---|
| Directory overview | `grepika_toc` | Inspect the target tree before choosing files |
| Natural-language or regex search | `grepika_search` | Locate symbols, concepts, and exact text |
| File structure | `grepika_outline` → `grepika_get` | Read the outline, then a targeted range |
| Symbol definitions | `tilth_tilth_search` | Prefer definition-first navigation |
| Callers of a symbol | `tilth_tilth_search kind:callers` | Trace incoming dependencies |
| Dependency impact | `mcp({ server: "tilth", tool: "tilth_deps" })` | Inspect blast radius before mutation |
| Cached file reads | `cachebro_read_file` / `cachebro_read_files` | Avoid retransmitting unchanged content |

## Default sequence

1. **Orient.** Inspect the target directory with `grepika_toc`.
2. **Find.** Locate symbols or concepts with Grepika or Tilth search.
3. **Outline.** Inspect file or symbol structure.
4. **Read surgically.** Fetch only the relevant section.
5. **Trace impact.** Inspect callers and dependencies before editing.
6. **Verify.** Re-read changed regions and run the repository's actual checks.

## Tool visibility

The parent configuration keeps common navigation tools directly visible and leaves less common operations behind the generic MCP gateway to reduce tool-list context.

| Direct in the general configuration | Gateway-only in the general configuration |
|---|---|
| `grepika_toc` | `mcp({ server: "grepika", tool: "context" })` |
| `grepika_outline` | `mcp({ server: "grepika", tool: "refs" })` |
| `grepika_search` | `mcp({ server: "grepika", tool: "stats" })` |
| `grepika_get` | `mcp({ server: "grepika", tool: "diff" })` |
| `tilth_tilth_search` | `mcp({ server: "tilth", tool: "tilth_deps" })` and other configured Tilth operations |
| `tilth_tilth_read` | `mcp({ server: "tilth", tool: "tilth_write" })` for mutation |

The `scout` profile is intentionally narrower. It loads only `pi-mcp-adapter` and `session-name`, exposes eight explicit read-only Cachebro, Grepika, and Tilth tools, and has no generic MCP gateway, shell, write, or edit capability.

Tool availability is a runtime fact. Inspect the active tool catalog rather than assuming that an MCP server, extension, or profile exposes every operation described here.

## Context hygiene

- Read structure before content.
- Keep the question and evidence contract explicit.
- Prefer one precise source range over several complete files.
- Treat cached or indexed output as navigation evidence; read canonical source before making a material claim.
- Pass compact paths, symbols, and outcomes across fresh contexts instead of entire exploratory transcripts.
- After mutation, verify the actual diff and executable behavior rather than relying on the editing agent's summary.
