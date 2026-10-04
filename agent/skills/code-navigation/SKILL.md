---
name: code-navigation
description: Full tool reference for codebase navigation. Use when you need detailed guidance on grepika/tilth/cachebro usage, blast-radius checks, or workflow patterns
---

# Code navigation and file reading

Full tool reference for navigating codebases. APPEND_SYSTEM.md has the quick-reference table; this skill provides detailed usage, workflows, and edge cases.

Native MCP reads personal servers from `~/.pi/agent/mcp.json`. Eight navigation tools are direct; remaining navigation tools use `codemode`, and Firecrawl uses `codemode`. Names follow `mcp__<server>__<server-offered-tool>`. Use `/mcp` for status and exposure.

`scout`, `build`, and `docs` allow only the eight direct navigation tools alongside their profile-specific built-ins. They have no codemode or tool discovery capability. When an operation below is unavailable, use the allowed built-ins or report the gap to the parent; a documented tool is not an authorization grant.

## Grepika as the default exploration tool

Use grepika first for all code exploration and reading.

### Direct tools

- `mcp__grepika__toc` gives a directory tree overview.
- `mcp__grepika__search` finds regex or natural-language code patterns. The `--root` setting in `mcp.json` enables automatic indexing.
- `mcp__grepika__outline` extracts file structure. Use it before reading code.
- `mcp__grepika__get` with `start_line` and `end_line` reads targeted sections. Always provide a line range for large files.

### Codemode discovery

In a parent session, discover less common tools and inspect their schemas before calling:

```js
text(await searchTools("references context", { namespace: "mcp__grepika" }));
text(await describeTool("mcp__grepika__refs"));
```

`mcp__grepika__context` shows code around a search match; `mcp__grepika__refs` finds references. Call `tools.<name>(args)` using the offered schema. `ALL_TOOLS` lists callable tools. MCP calls return full `CallToolResult` objects: check `isError`, then inspect `content` or `structuredContent`.

### Core workflow

```
mcp__grepika__outline → identify symbols of interest → mcp__grepika__get with line range → read only what's needed
```

Repeat as necessary. This keeps context lean.

## Tilth for structural and definition queries

When you need to know _where something is defined_ or _what calls what_, prefer tilth over grepika.

### Direct tools

- `mcp__tilth__tilth_read` reads small files whole and outlines large files with drillable line ranges.
- `mcp__tilth__tilth_search` finds symbol definitions, shows surrounding structure, and resolves callees inline.
  - Use `scope` param to limit to a subdirectory
  - Multi-symbol: pass comma-separated names to trace across files in one call
  - Callers: `kind: callers` finds all call sites using tree-sitter structural matching

### Codemode tools

- `mcp__tilth__tilth_deps` reports imports and consumers of a file's exports. Use it before breaking changes.
- `mcp__tilth__tilth_write` batches file mutations using hashline anchors or explicit overwrite and append modes.

Discover the offered dependency tool and schema rather than assuming a CLI spelling or argument shape:

```js
text(await searchTools("dependencies blast radius", { namespace: "mcp__tilth" }));
text(await describeTool("mcp__tilth__tilth_deps"));
```

Only Tilth search and read are direct. Other Tilth operations require codemode discovery and `tools.<name>(args)`.

### When to choose Tilth over Grepika

- You want the **definition** of a symbol, not just occurrences of a string
- You need **callers** of a function (structural, not text grep)
- You want to trace **multiple symbols** across files in one call

## Non-code files

- **Config, JSON, small files.** Use `mcp__cachebro__read_file` or `mcp__cachebro__read_files`; these files are usually small enough to read whole.
- **Markdown/docs:** Don't blindly read whole file. Scan headers with `rg "^#{1,3} "` first, then read targeted sections with offset/limit. Only full-read if small or genuinely needed.
- **Fallback:** If cachebro reports stale cache or truncates reads, use the built-in `Read` tool directly.
- **Workspace safety:** Cachebro's `CACHEBRO_DIR` points at the user cache directory. Its database must not appear under the active workspace.

## Decision table

| Question                          | Tool                                     | Why                             |
| --------------------------------- | ---------------------------------------- | ------------------------------- |
| "Find files about X topic"        | grepika search                           | NL relevance ranking            |
| "Where is Y defined?"             | tilth search                             | Definition-first structural     |
| "What calls Z?"                   | tilth search (callers)                   | Tree-sitter structural matching |
| Regex/text pattern match          | `mcp__grepika__search` (grep mode)             | Fast text search                |
| "What would break if I change X?" | Discover `mcp__tilth__tilth_deps` in codemode | Blast-radius analysis           |

## Anti-patterns

- **Reading entire large files.** Outline first, then fetch the required range.
- **Treating an empty Grepika result as proof.** Verify the configured index is ready, then retry or read canonical source.
- **Omitting line ranges on `mcp__grepika__get`.** This wastes context on large files.
- **Using text search when you need definitions.** Text search also finds usages, imports, and comments. Use Tilth for definitions.
- **Reading code files with Cachebro.** Cachebro is for config, JSON, and small non-code files. Use Grepika or Tilth for code.
