# Pi tooling feature-branch smoke test

Use this after pulling `feat/pi-tooling-extensions`. The implementation agent intentionally did not launch Pi or local inference.

## Prepare

```bash
git switch feat/pi-tooling-extensions
git pull --ff-only
npm ci --prefix agent/extensions/pi-tooling
```

Firecrawl uses the process environment first, then ignored `agent/.env`, then the global Hermes environment (`$HERMES_HOME/.env` or `~/.hermes/.env`). Copy `agent/.env.example` to `agent/.env` only when a Pi-local override is needed. `FIRECRAWL_API_KEY` remains optional.

## Start and discover

1. Start Pi normally.
2. Confirm the tools include `fd`, `rg`, `ask_user`, `search`, `scrape`, `crawl`, `workflow`, `bg_start`, `bg_status`, `bg_list`, and `bg_kill`.
3. Confirm the existing `Agent`, `get_subagent_result`, and `steer_subagent` tools still exist.
4. Confirm the old `questionnaire` tool is absent.

## Focused checks

- **File search:** ask Pi to use `fd` to list TypeScript files under `agent/extensions/pi-tooling`, then use `rg` to find `FIRECRAWL_API_URL`. Confirm results are bounded and paths are correct.
- **Ask User:** explicitly request an `ask_user` question with 2–5 options. Check arrow keys, number selection, custom text, and Escape dismissal.
- **Firecrawl:** search the web, scrape one result, and run a small bounded crawl. Confirm traffic reaches only the configured self-hosted endpoint. Temporarily unset the URL and confirm the tools fail clearly rather than contacting Firecrawl Cloud.
- **Background completion:** start `sleep 3; printf 'BG_OK\n'`, inspect it with `bg_list`/`bg_status` and `/ps`, and confirm one completion follow-up appears.
- **Background termination:** start a long command that spawns a child, call `bg_kill`, and confirm the process tree exits. Confirm no stdin control is offered.
- **Workflow:** explicitly invoke `workflow` with a two-child bounded script. Confirm at most three children can run, artifacts appear under `agent/workflows/`, and the result/failure is surfaced.
- **Child isolation:** in a workflow child, confirm `workflow`, `Agent`, `get_subagent_result`, `steer_subagent`, `ask_user`, and all `bg_*` tools are unavailable.
- **Existing delegation:** run a small `Agent` delegation and confirm `@tintinweb/pi-subagents` behavior is unchanged.
- **Session cleanup:** start a long background terminal, switch or end the session, and confirm it is terminated.

## Report useful failures

Include the tool name, exact error, relevant `agent/logs/background-terminals/` tail, workflow run ID under `agent/workflows/`, and whether the failure occurred before or after the first model response. Do not include credentials.
