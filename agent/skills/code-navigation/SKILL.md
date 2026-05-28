# Code Navigation & File Reading

Full tool reference for navigating codebases. APPEND_SYSTEM.md has the quick-reference table; this skill provides detailed usage, workflows, and edge cases.

## Grepika — Default Exploration Tool

Use grepika first for all code exploration and reading.

### Direct Tools (always visible)

- `grepika_toc` — directory tree overview
- `grepika_search` — find code patterns (regex or natural language). **Requires index** — run `mcp({ server: "grepika", tool: "index" })` first if results are empty/stale.
- `grepika_outline` — extract file structure (functions, classes, types). **Always do this before reading code.**
- `grepika_get` with `start_line`/`end_line` — read targeted sections. Use outline results to pick exact line ranges. **Never omit line range on large files.**

### Gateway Tools (via `mcp()`)

- `mcp({ server: "grepika", tool: "context" })` — see surrounding code at a search match location
- `mcp({ server: "grepika", tool: "refs" })` — find all references to a symbol/identifier
- `mcp({ server: "grepika", tool: "index" })` — rebuild search index. Use `force=true` for full rebuild.

### Core Workflow

```
grepika_outline → identify symbols of interest → grepika_get with line range → read only what's needed
```

Repeat as necessary. This keeps context lean.

## Tilth — Structural / Definition Queries

When you need to know _where something is defined_ or _what calls what_, prefer tilth over grepika.

### Direct Tools (always visible)

- `tilth_tilth_read` — smart file reading. Small files shown whole, large files auto-outlined with drillable line ranges.
- `tilth_tilth_search` — definition-first search. Finds where symbols are **defined** (not just string matches), shows surrounding structure, resolves callees inline.
  - Use `scope` param to limit to a subdirectory
  - Multi-symbol: pass comma-separated names to trace across files in one call
  - Callers: `kind: callers` finds all call sites using tree-sitter structural matching
- `tilth_tilth_edit` — batch edit files using hashline anchors from tilth_read output.

### Gateway Tools (via `mcp()`)

- `mcp({ server: "tilth", tool: "deps" })` — blast-radius check. What a file imports and what uses its exports. **Use before breaking changes.**

### When to Choose Tilth Over Grepika

- You want the **definition** of a symbol, not just occurrences of a string
- You need **callers** of a function (structural, not text grep)
- You want to trace **multiple symbols** across files in one call

## Non-Code Files

- **Config, JSON, small files:** `cachebro_read_file` / `cachebro_read_files` — typically small enough for full reads
- **Markdown/docs:** Don't blindly read whole file. Scan headers with `rg "^#{1,3} "` first, then read targeted sections with offset/limit. Only full-read if small or genuinely needed.
- **Fallback:** If cachebro reports stale cache or truncates reads, use the built-in `Read` tool directly.

## Decision Flowchart

| Question                          | Tool                       | Why                             |
| --------------------------------- | -------------------------- | ------------------------------- |
| "Find files about X topic"        | grepika search             | NL relevance ranking            |
| "Where is Y defined?"             | tilth search               | Definition-first structural     |
| "What calls Z?"                   | tilth search (callers)     | Tree-sitter structural matching |
| Regex/text pattern match          | `grepika_search` (grep mode)  | Fast text search                |
| "What would break if I change X?" | `mcp({ server: "tilth", tool: "deps" })` | Blast-radius analysis           |

## Anti-Patterns

- **Reading entire large files** — always outline first, then targeted get
- **Using grepika search without index** — results will be empty. Run `grepika_index` first.
- **Omitting line ranges on grepika_get** — wastes context on large files
- **Using grep/text search when you need definitions** — will find usages, imports, comments. Use tilth for definitions.
- **Reading code files with cachebro** — cachebro is for config/JSON/small non-code files. Use grepika/tilth for code.
