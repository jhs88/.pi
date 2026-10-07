# .pi

Personal Pi configuration with shared skills, bounded agent roles, native MCP, and managed [Pi Tooling](https://github.com/jhs88/pi-tooling) extensions.

## Setup

Use a native-MCP-capable Pi host. The subagent compatibility adapter is tested with Pi 1.0.3 and the pinned `@tintinweb/pi-subagents@0.19.0` package.

```bash
pi install git:github.com/jhs88/pi-tooling
npx skills@latest add mattpocock/skills -g
```

Review upstream skill revisions and changes before accepting updates. Shared Matt Pocock skills live in `~/.agents/skills`; this repository does not fork them. Run `/skill:setup-matt-pocock-skills` in projects that need tracker and documentation setup.

Update managed extensions with `pi update --extensions`. Repository-local extensions in `agent/extensions/` update through this repository.

After installing or reinstalling packages, apply the native MCP child compatibility patch from your companion Pi Tooling checkout, then reload or restart Pi:

```bash
npm --prefix ~/pi-tooling run compat:subagents
```

### Subagent tools

These delegation skills require the opt-in compatibility adapter. Set `PI_TOOLING_SUBAGENTS_COMPAT=1` in the environment of the process launching Pi. For T3, that environment must reach the backend that starts Pi.

Verify `subagent`, `subagent_result`, and `subagent_steer` are advertised before using the skills. Optional `subagent_workflow` follows upstream availability and is separate from Pi Tooling's `workflow`.

Keep the previous skill revision on runtimes where the adapter is disabled. Test in an isolated configuration first. See [adapter setup and limitations](https://github.com/jhs88/pi-tooling/blob/main/subagents/README.md). Actual T3 rendering still needs a work-computer test.

### MCP and Firecrawl

Personal MCP servers are configured in `agent/mcp.json`. Six navigation tools are directly exposed; other operations and Firecrawl use codemode discovery. Use `/mcp` to inspect exposure. `pi mcp list` connects to servers, so run it only when live access is intended.

Set `FIRECRAWL_API_URL` in the environment that launches Pi, using your self-hosted endpoint. Native MCP resolves `${FIRECRAWL_API_URL}` in `agent/mcp.json`; the managed Firecrawl extension reads the same process variable. Configure it in your shell profile or launcher/service environment and restart that launcher. An unrelated terminal export does not reach an already-running T3 backend. Native MCP does not automatically load `agent/.env`. The managed extension still supports that file as a legacy fallback and has no Firecrawl Cloud fallback.

## Workflows

| Need | Use |
|---|---|
| Bounded design and implementation | `/skill:design-loop` |
| Consequential implementation | `/skill:agent-gauntlet` |
| Large or unclear destination | `/skill:wayfinder` → `/skill:to-spec` → approval → `/skill:to-tickets` |
| Research with a written artifact | `/skill:research` with `build` |
| Read-only reconnaissance | `scout` |
| One implementation uncertainty | `/skill:prototype` with isolated `build` |
| Compare runnable alternatives | `/skill:compare-prototypes` |
| Documentation | `/skill:technical-writing` with `docs` |
| Independent diff review | `/skill:code-review` |
| Existing PR fixes | `/skill:babysit-pr <PR URL>` |

Load the current skill for its procedure. Some skills write tracker records, ADRs, or domain documents; confirm those targets before execution.

## Agents and boundaries

```text
specifier → coder → cleaner → architect → hardener → qa
```

The gauntlet runs serially with fresh contexts. `specifier`, `architect`, and `qa` are read-only. Implementation roles make bounded changes; architecture decisions remain human-owned. QA verifies parent-supplied, fresh acceptance evidence. Missing checks are unavailable, never passed.

The flexible profiles are `scout` for read-only navigation, `build` for bounded file and shell work, and `docs` for no-shell documentation. Skills supply the procedure; profiles supply permissions.

- Preflight the exact advertised agent types. Unknown names can fall back to a mutable default agent; never probe by dispatching them.
- Children receive self-contained tasks and inherit the parent model unless an override is requested.
- Run no more than three children concurrently and pause when local resources are contended. Use foreground delegation unless the advertised tool supports background execution.
- `scout` exposes only six read-only navigation tools. `build` and `docs` share that navigation allowlist; `docs` has no shell. Gauntlet roles disable extensions.
- Native child tools require `ext:builtin:mcp/<native-tool-name>` selectors and the extension loaded. Parent codemode discovery does not grant child capabilities.
- Handoffs include scope, changed files, exact commands and outcomes, unresolved risks, and the next owner. A prior `PASS` is a claim to verify.
- Commit, push, merge, release, deployment, and provider changes require explicit approval.

Local skill procedures live in `agent/skills/`. Pstack `technical-writing` and `unslop` retain their pinned provenance and licenses. Selected extensions originate from [davis7dotsh/my-pi-setup@797eaf6](https://github.com/davis7dotsh/my-pi-setup/tree/797eaf6d6f178759cf7aabde927ef15c91346e7e).

## Guides

- [Workflow selection](docs/matt-pocock-skills.md)
- [Gauntlet rationale](docs/uncle-bob-agent-gauntlet.md)
- [Code navigation](docs/code-navigation.md)
- [Live smoke checks](docs/pi-tooling-smoke-test.md)
