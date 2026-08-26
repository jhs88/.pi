---
name: code-navigation
description: Full tool reference for codebase navigation. Use when you need detailed guidance on grepika/tilth/cachebro usage, blast-radius checks, or workflow patterns
---

# Code navigation and file reading

Full tool reference for navigating codebases. APPEND_SYSTEM.md has the quick-reference table; this skill provides detailed usage, workflows, and edge cases.

## Grepika as the default exploration tool

Use grepika first for all code exploration and reading.

### Direct tools

- `grepika_toc` gives a directory tree overview.
- `grepika_search` finds regex or natural-language code patterns. The `--root` setting in `mcp.json` enables automatic indexing.
- `grepika_outline` extracts file structure. Use it before reading code.
- `grepika_get` with `start_line` and `end_line` reads targeted sections. Always provide a line range for large files.

### Gateway tools

- `mcp({ server: "grepika", tool: "context" })` shows code around a search match.
- `mcp({ server: "grepika", tool: "refs" })` finds references to a symbol or identifier.

### Core workflow

```
grepika_outline → identify symbols of interest → grepika_get with line range → read only what's needed
```

Repeat as necessary. This keeps context lean.

## Tilth for structural and definition queries

When you need to know _where something is defined_ or _what calls what_, prefer tilth over grepika.

### Direct tools

- `tilth_tilth_read` reads small files whole and outlines large files with drillable line ranges.
- `tilth_tilth_search` finds symbol definitions, shows surrounding structure, and resolves callees inline.
  - Use `scope` param to limit to a subdirectory
  - Multi-symbol: pass comma-separated names to trace across files in one call
  - Callers: `kind: callers` finds all call sites using tree-sitter structural matching

### Gateway tools

- `mcp({ server: "tilth", tool: "tilth_deps" })` reports imports and consumers of a file's exports. Use it before breaking changes.
- `mcp({ server: "tilth", tool: "tilth_write" })` batches file mutations using hashline anchors or explicit overwrite and append modes.

### When to choose Tilth over Grepika

- You want the **definition** of a symbol, not just occurrences of a string
- You need **callers** of a function (structural, not text grep)
- You want to trace **multiple symbols** across files in one call

## Non-code files

- **Config, JSON, small files.** Use `cachebro_read_file` or `cachebro_read_files`; these files are usually small enough to read whole.
- **Markdown/docs:** Don't blindly read whole file. Scan headers with `rg "^#{1,3} "` first, then read targeted sections with offset/limit. Only full-read if small or genuinely needed.
- **Fallback:** If cachebro reports stale cache or truncates reads, use the built-in `Read` tool directly.

## Decision table

| Question                          | Tool                                     | Why                             |
| --------------------------------- | ---------------------------------------- | ------------------------------- |
| "Find files about X topic"        | grepika search                           | NL relevance ranking            |
| "Where is Y defined?"             | tilth search                             | Definition-first structural     |
| "What calls Z?"                   | tilth search (callers)                   | Tree-sitter structural matching |
| Regex/text pattern match          | `grepika_search` (grep mode)             | Fast text search                |
| "What would break if I change X?" | `mcp({ server: "tilth", tool: "tilth_deps" })` | Blast-radius analysis           |

## Anti-patterns

- **Reading entire large files.** Outline first, then fetch the required range.
- **Treating an empty Grepika result as proof.** Verify the configured index is ready, then retry or read canonical source.
- **Omitting line ranges on `grepika_get`.** This wastes context on large files.
- **Using text search when you need definitions.** Text search also finds usages, imports, and comments. Use Tilth for definitions.
- **Reading code files with Cachebro.** Cachebro is for config, JSON, and small non-code files. Use Grepika or Tilth for code.
