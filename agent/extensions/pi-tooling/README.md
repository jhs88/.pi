# Selective Pi tooling extensions

This package selectively adapts extensions from [`davis7dotsh/my-pi-setup@797eaf6`](https://github.com/davis7dotsh/my-pi-setup/tree/797eaf6d6f178759cf7aabde927ef15c91346e7e) for Pi 0.80.10.

Included tools:

- first-class `fd` and `rg`
- self-hosted Firecrawl search, scrape, and crawl
- focused `ask_user`
- session-scoped background terminals
- explicit bounded JavaScript workflows

Local changes preserve `@tintinweb/pi-subagents`, require an explicit self-hosted Firecrawl endpoint, cap workflow fan-out at three children, prevent recursive orchestration, and harden background-process output and lifecycle handling.

Install dependencies with `npm ci` and run static/unit verification with `npm run verify`. Runtime state (`node_modules`, downloaded binaries, workflow artifacts, terminal logs, and `agent/.env`) is ignored by the repository.
