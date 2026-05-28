## Tool Rules

**Principle: minimize context consumption.** Read outlines first, then targeted sections. Be surgical.

| Need                         | Tool                                                         |
| ---------------------------- | ------------------------------------------------------------ |
| Directory overview           | `grepika_toc`                                                |
| Symbol definitions / callers | `tilth_tilth_search` (use `kind:callers` for caller tracing) |
| File structure               | `grepika_outline` → `grepika_get` (read only needed lines)   |
| Code search (NL/regex)       | `grepika_search`                                             |
| Cached file reads            | `cachebro_read_file` / `cachebro_read_files`                 |

**Workflow:** Orient (`toc`) → Find (`search`) → Outline (`outline`) → Read surgically (`get` with range) → Verify.

### Quick Decision

- "Find files about X topic" → **grepika** (NL search)
- "Where is Y defined?" → **tilth** (structural)
- "What calls Z?" → **tilth** (callers)
- Regex/text pattern → **grepika** (grep mode)

### Non-Code Files

- Config, JSON, small files: `cachebro_read_file` / `cachebro_read_files`
- Markdown/docs: scan headers with `rg` first, read targeted sections
- Fallback if cachebro misbehaves: built-in `Read` tool

**Load `code-navigation` skill for full tool reference and workflow patterns.**
