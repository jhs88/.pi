# Managed Pi tooling smoke test

Use this after updating the Pi configuration or managed package. This configuration revision requires the opt-in subagent adapter; keep the previous skills on runtimes where it is disabled.

## Prepare

```bash
git pull --ff-only
pi install git:github.com/jhs88/pi-tooling  # first install only
pi update --extensions
```

After a package reinstall, apply the explicit native MCP child compatibility patch described in the [README](../README.md#native-mcp-migration), then `/reload` or restart Pi. The README also provides offline configuration and profile checks; the checks below intentionally exercise live tools.

The managed Firecrawl extension uses the process environment first, then ignored `agent/.env`. Copy `agent/.env.example` to `agent/.env` when Pi-local configuration is needed. `FIRECRAWL_API_KEY` remains optional. Native Firecrawl MCP separately uses the self-hosted URL in `agent/mcp.json`.

## Start and discover

1. Start Pi with `PI_TOOLING_SUBAGENTS_COMPAT=1` in its process environment. Confirm the companion adapter is installed and the host supports it before loading the renamed skills.
2. Confirm the tools include `fd`, `rg`, `ask_user`, `search`, `scrape`, `crawl`, `workflow`, `bg_start`, `bg_status`, `bg_list`, and `bg_kill`.
3. Confirm `subagent`, `subagent_result`, and `subagent_steer` are active. Confirm optional `subagent_workflow` appears only when enabled upstream.
4. Confirm the old `questionnaire` tool is absent.

## Focused checks

- **File search:** ask Pi to use `fd` to list TypeScript files under `~/.pi/agent/git/github.com/jhs88/pi-tooling`, then use `rg` to find `FIRECRAWL_API_URL`. Confirm results are bounded and paths are correct.
- **Ask User:** explicitly request an `ask_user` question with 2–5 options. Check arrow keys, number selection, custom text, and Escape dismissal.
- **Firecrawl:** search the web, scrape one result, and run a small bounded crawl. Confirm traffic reaches only the configured self-hosted endpoint. Temporarily unset the URL and confirm the tools fail clearly rather than contacting Firecrawl Cloud.
- **Background completion:** start `sleep 3; printf 'BG_OK\n'`, inspect it with `bg_list`/`bg_status` and `/ps`, and confirm one completion follow-up appears.
- **Background termination:** start a long command that spawns a child, call `bg_kill`, and confirm the process tree exits. Confirm no stdin control is offered.
- **Workflow:** explicitly invoke `workflow` with a two-child bounded script. Confirm at most three children can run, artifacts appear under `agent/workflows/`, and the result/failure is surfaced.
- **Child isolation:** in a workflow child, confirm `workflow`, `subagent`, `subagent_result`, `subagent_steer`, `subagent_workflow`, `ask_user`, and all `bg_*` tools are unavailable.
- **Delegation:** run a small read-only foreground `subagent` task. Confirm live progress, the final result, and cancellation. Explicit background requests must fail before spawning a child.
- **Session cleanup:** start a long background terminal, switch or end the session, and confirm it is terminated.

## Report useful failures

Include the tool name, exact error, relevant `agent/logs/background-terminals/` tail, workflow run ID under `agent/workflows/`, and whether the failure occurred before or after the first model response. Do not include credentials.
