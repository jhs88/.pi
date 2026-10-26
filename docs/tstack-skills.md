# Tstack skills

Nine one-to-one local adaptations of [Theo Browne's tstack](https://github.com/t3dotgg/tstack),
pinned at `7de017b3fc9d50c03cf3ecb98fb71e0ca65a78bd`. Each retains its upstream
name, intent, and sibling dependencies. Attribution and required notices live
in [third-party notices](third-party-notices.md), outside the skill prompts.
Source hashes and the inventory live in [tstack-manifest.json](tstack-manifest.json).

## Local policy

Keep Theo's workflow wording and review style. Adapt tool names and runtime
integration, not the owner's intent. Full-send is permission to complete its
end-to-end PR workflow, including commits, pushes, review replies, rebases, and
merging after the gate passes. Full-stop does the same preparation but never
merges. Do not re-ask for each step. Production changes and unrelated actions
remain outside the grant, as in upstream. Runtime/system prompts still apply.

Main is always the default branch. Council retains Theo's scored,
repeat-until-satisfied approach, using `gpt-6.1-sol`, `gpt-6-astra`, and
`gpt-6-luna` through the existing GPT subscription connection. Three providers
are not required and non-GPT models are excluded. Sol-loop
retains Theo's single-Sol review loop and round budgets. Do not substitute an
unavailable model or add an extra gauntlet to these workflows.

Pi defaults to `cliproxyapi / gpt-6.1-sol`, thinking `high`, using the
CLIProxyAPI extension's standard provider ID. The previous `llamacpp` alias
has been retired; the proxy endpoint and credentials are unchanged. Pi's
separate `llama.cpp` local-model provider is unrelated. A no-tools, ephemeral
live smoke using the defaults returned `PI_CLIPROXYAPI_OK` with assistant
metadata reporting `cliproxyapi / gpt-6.1-sol`.

For an existing installation using the old alias, set `providerId` to
`cliproxyapi` in the private `agent/cliproxyapi.json` as well. If
`CLIPROXYAPI_PROVIDER_ID` is set in the launching environment, update that
override too. Keep the existing connection details and credentials private.

The separately advertised native `openai-codex` route failed its smoke with an
invalid OAuth refresh token. It is not the selected default and was not repaired
by copying credentials from another runtime.

## Ownership and composition

Canonical sources live under this repository's `agent/skills/`. Default Hermes
links to the same nine directories. Fresh discovery does not refresh existing
chats automatically; use the runtime's supported reload or start a fresh session.

| Skill | Workflow | Local integration |
|---|---|---|
| `full-send` | Finish, prove, Sol-review, file, babysit, merge | Native watcher and question tools; full-send supplies the task authority |
| `full-stop` | Same work, never merge | Native watcher cleanup; retain upstream no-auto-merge rules |
| `council` | Three-model GPT review until delegates agree | Native delegation with Sol, Astra, and Luna |
| `sol-loop` | One Sol reviewer and finding ledger | Native model discovery; inherit verified Sol or use a supported selector |
| `file-pr` | Problem-first title/body and model attribution | Native GitHub tooling and remote readback |
| `takeover` | Finish inherited work while preserving credit | Native tools and remote readback |
| `babysit-pr` | Repair review/CI findings and watch one PR | Included `pr-wait`; native process/notification lifecycle |
| `modernize` | Reassess old PR, then rebase if worthwhile | Retain upstream disposition and lease-protected push rules |
| `leaving-pr-comments` | Theo's model/user note and direct replies | Read back the exact posted comment |

`full-send` calls `sol-loop`, `file-pr`, and `babysit-pr`; `full-stop` follows it
without merging. `takeover` uses `modernize`, PR filing, babysitting, and comment
formatting. The observation-only `pr-watch`, body-writing `pr`, standalone
`code-review`, and issue-driven `github-issue-to-pr` remain separate capabilities.

`design-loop` and its retired source copy have been removed. The
`agent-gauntlet` skill remains an explicitly requested Uncle Bob-related
engineering role/skill pipeline, not a prerequisite for these workflows.

Delegation may follow the active workflow or serve useful independent work;
it does not require a separate request every time. Exact agent-type preflight,
self-contained child prompts, and parent verification remain. Read-only role
tools are unchanged. `subagent_workflow` is the workflow engine; there is no
separate Pi Tooling `workflow` tool. Ordinary Pi concurrency remains three.

Hermes approval settings do not configure Pi. Default Hermes currently has
`approvals.mode: off`, so its command-approval layer does not add shell approval
prompts; this does not disable other tool controls, repository checks, or branch
protection. No Hermes approval settings were changed.

## Skill metadata

Skill frontmatter keeps only `name`, `description`, and runtime behavior flags
such as `disable-model-invocation`. Author/version/license/provenance fields and
repeated provenance footers are omitted. Upstream revisions and hashes stay in
the manifest; attribution stays in [third-party notices](third-party-notices.md).
Codex-only `agents/openai.yaml` descriptors are not installed for Pi or Hermes.
The upstream inventory still tracks those files so future changes are detected.

Existing repository-owned skills already use minimal frontmatter. Their invocation
flags are preserved. Shared Matt Pocock skills were inspected but not edited;
their shared-runtime invocation controls and argument hints remain intact.

## Watcher

The upstream Python `pr-wait` helper is included unchanged and can be invoked
through `python3` with its absolute path. It uses authenticated `gh` reads and
local state for dedupe and single-watcher locking. No scheduler is installed.
Use native T3 watching instead when exposed, preserving the current main-branch
integration. Never run native and script watchers together. Script limitations are documented in
[watcher limitations](../agent/skills/babysit-pr/references/watcher-limitations.md).
A helper event or exit code is not the parent's final merge decision.

## Checking upstream main

Run an explicit read-only upstream check from the repository root:

```sh
python3 scripts/check_tstack_updates.py
# Structured output for automation:
python3 scripts/check_tstack_updates.py --json
```

The checker resolves `refs/heads/main` once in a disposable bare repository,
validates the manifest against the pinned upstream source, and compares that
snapshot with main. It reports new, removed, and modified skills, added/removed/
changed support files, and repository changes such as README or license updates.
It compares upstream to upstream, not our intentionally adapted local wording.
A renamed skill appears as a removal and an addition. A main revision change
still requests review even if only non-skill files changed.

Exit codes are `0` for current, `1` for updates requiring review, and `2` for
failed checks, invalid manifests, unsupported skill entries, or missing evidence.
Network and Git failures are errors, never a clean/current result. Requires
`git`, Python 3.10+, and read access to the public upstream repository.

This command does not execute upstream files, overwrite local adaptations,
advance the manifest pin, commit, or push. Normal tests remain offline.
No scheduled check or notifications are installed. After an update is reviewed
and adapted, update the manifest hashes/inventory, documentation, and tests
together; never advance the pin merely to silence the report.

## Verification and limits

Run offline contract and watcher tests:

```sh
python3 -m unittest discover -s tests -p 'test_tstack*.py' -v
node tests/verify_tstack_pi_loader.mjs
```

These tests exercise packaging, attribution, provenance/support hashes,
reference resolution, Git ignore visibility, invalid input, locking,
deduplication, stable green snapshots, failures, and closed/merged exits.
Fixtures are explicitly synthetic; they do not establish live PR readiness.

Use the installed Pi skill loader to verify discovery without starting an agent.
Verify Default Hermes separately through its catalog and explicit loads. A
read-only watcher smoke on the already-merged https://github.com/jhs88/.pi/pull/13
exited 0 and reported the correct merged state, with scratch-isolated state and
no surviving watcher. This does not prove pending-CI monitoring or merge readiness.
The default Sol model has a successful live response as described above; no
council review or complete end-to-end PR delivery has been run.

## Rollback

Restore the backed-up `babysit-pr/SKILL.md` and prior skill ignore file. Remove
only the eight new Default Hermes links after verifying their destinations,
and park the eight new canonical directories outside skill discovery. Remove
this import's new babysit support files only after checking for subsequent
local changes. Keep `bot-triage.md` and all unrelated state. The backup is
outside skill discovery, so it cannot collide with the installed skill.
