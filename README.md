# .pi

Personal Pi configuration with shared skills, bounded agent roles, native MCP, and managed [Pi Tooling](https://github.com/jhs88/pi-tooling) extensions.

## Setup

Use Pi 1.1.0 or newer. Native llama.cpp decision models also require a llama.cpp 0.6.0 or newer router. The subagent compatibility adapter uses the pinned `@tintinweb/pi-subagents@0.22.0` package.

```bash
pi install git:github.com/jhs88/pi-tooling
npx skills add jhs88/skills -g -a pi
```

Review shared library revisions and changes before accepting updates. Pi discovers `~/.agents/skills` automatically; no skill entries in `settings.json` are needed. This repository does not fork the shared procedures. Run `/skill:setup-matt-pocock-skills` in projects that need tracker and documentation setup.

Update managed extensions with `pi update --extensions`. Repository-local extensions in `agent/extensions/` update through this repository.

Subagents 0.22.0 includes native MCP child support upstream. No compatibility source patch is needed. Reload or restart Pi after updating packages. Keep the matching Pi Tooling adapter update installed alongside the new subagents pin.

### Subagent tools

Pi Tooling enables the compatibility adapter by default on supported hosts. No opt-in environment variable is needed for Pi or T3. Set `PI_TOOLING_SUBAGENTS_COMPAT=0` only to disable it. The adapter supports the exact 0.22.0 dependency pin; unreviewed versions retain their original tools instead of aliases.

Delegation uses `subagent`, `subagent_result`, and `subagent_steer`. `subagent_workflow` uses the upstream workflow engine. Pi Tooling no longer supplies a separate `workflow` tool. Inspect runs in `/agents` → Workflows. T3 tool visibility was confirmed on the earlier baseline; the 0.22.0 upgrade has SDK/RPC verification, not a new UI check. See [adapter setup and limitations](https://github.com/jhs88/pi-tooling/blob/main/subagents/README.md).

### MCP and Firecrawl

Personal MCP servers are configured in `agent/mcp.json`. Six navigation tools are directly exposed; other operations and Firecrawl use codemode discovery. Use `/mcp` to inspect exposure. `pi mcp list` connects to servers, so run it only when live access is intended.

Set `FIRECRAWL_API_URL` in the environment that launches Pi, using your self-hosted endpoint. Native MCP resolves `${FIRECRAWL_API_URL}` in `agent/mcp.json`; the managed Firecrawl extension reads the same process variable. Configure it in your shell profile or launcher/service environment and restart that launcher. An unrelated terminal export does not reach an already-running T3 backend. Native MCP does not automatically load `agent/.env`. The managed extension still supports that file as a legacy fallback and has no Firecrawl Cloud fallback.

## Workflows

Pi defaults to `cliproxyapi / gpt-6.1-sol`, thinking `high`, through the existing CLIProxyAPI connection. Children inherit that model unless a review workflow selects another. `design-loop` has been removed.

| Need | Use |
|---|---|
| End-to-end change delivery | `/skill:full-send` or `/skill:full-stop` |
| Uncle Bob-related engineering role/skill pipeline, when requested | `/skill:agent-gauntlet` |
| Large or unclear destination | `/skill:wayfinder` → `/skill:to-spec` → approval → `/skill:to-tickets` |
| Research with a written artifact | `/skill:research` with `build` |
| Read-only reconnaissance | `scout` |
| One implementation uncertainty | `/skill:prototype` with isolated `build` |
| Compare runnable alternatives | `/skill:compare-prototypes` |
| Documentation | `/skill:technical-writing` with `docs` |
| Independent diff review | `/skill:code-review` |
| Existing PR fixes | `/skill:babysit-pr <PR URL>` |
| Finish through a merged PR | `/skill:full-send` |
| Prepare a PR without merging | `/skill:full-stop` |
| GPT-only council review or a Sol review loop | `/skill:council` or `/skill:sol-loop` |
| File a PR, inherit work, or refresh an old PR | `/skill:file-pr`, `/skill:takeover`, `/skill:modernize` |

Load the current skill for its procedure. Some skills write tracker records, ADRs, or domain documents; confirm those targets before execution.

## Agents and boundaries

```text
specifier → coder → cleaner → architect → hardener → qa
```

The gauntlet runs serially with fresh contexts. `specifier`, `architect`, and `qa` are read-only. Implementation roles make bounded changes; architecture decisions remain human-owned. QA verifies parent-supplied, fresh acceptance evidence. Missing checks are unavailable, never passed.

The flexible profiles are `scout` for read-only navigation, `build` for bounded file and shell work, and `docs` for no-shell documentation. Skills supply the procedure; profiles supply permissions.

- Preflight the exact advertised agent types. Unknown names can fall back to a mutable default agent; never probe by dispatching them.
- Children receive self-contained tasks and inherit the parent model unless an override is requested.
- Ordinary delegation retains its configured concurrency limit. Workflows use upstream scheduling without a separate three-child cap. Pause when local resources are contended. Upstream workflows run in the background.
- `scout` exposes only six read-only navigation tools. `build` and `docs` share that navigation allowlist; `docs` has no shell. Gauntlet roles disable extensions.
- Native child tools require `ext:builtin:mcp/<native-tool-name>` selectors and the extension loaded. Parent codemode discovery does not grant child capabilities.
- Handoffs include scope, changed files, exact commands and outcomes, unresolved risks, and the next owner. A prior `PASS` is a claim to verify.
- Full-send authorizes its end-to-end PR work, including commit, push, rebase, review replies, and merge after its gate passes. Full-stop includes preparation but never merging. Unrelated releases, deployments, and provider changes remain separate.

Local procedures in `agent/skills/` are `agent-gauntlet`, `code-navigation`, `compare-prototypes`, `subagents`, and `tilth`. Shared PR and writing skills load directly from the global library. Repository attribution remains in [third-party notices](docs/third-party-notices.md). Selected extensions originate from [davis7dotsh/my-pi-setup@797eaf6](https://github.com/davis7dotsh/my-pi-setup/tree/797eaf6d6f178759cf7aabde927ef15c91346e7e).

## Guides

- [Workflow selection](docs/matt-pocock-skills.md)
- [Shared PR workflows and verification](docs/tstack-skills.md)
- [Gauntlet rationale](docs/uncle-bob-agent-gauntlet.md)
- [Code navigation](docs/code-navigation.md)
- [Local decision models: install, configure, and choose](docs/local-decision-models.md)
