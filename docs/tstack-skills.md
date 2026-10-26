# Shared PR workflows

The PR workflows come from [jhs88/skills](https://github.com/jhs88/skills), alongside the shared writing and Matt Pocock skills.

```sh
npx skills add jhs88/skills -g -a pi
```

Pi discovers `~/.agents/skills` automatically. No `settings.json` skill entry is needed. Review library changes before accepting updates; edit shared procedures in the library, not this configuration repository.

| Need | Skill |
|---|---|
| Finish through a merged PR | `full-send` |
| Prepare a PR without merging | `full-stop` |
| Three-model GPT review | `council` |
| One Sol reviewer and a finding ledger | `sol-loop` |
| File a PR | `file-pr` |
| Finish inherited work | `takeover` |
| Repair review or CI findings and watch one PR | `babysit-pr` |
| Reassess and refresh an old PR | `modernize` |
| Format review replies | `leaving-pr-comments` |

Load the current skill for its procedure. Full-send authorizes its end-to-end PR workflow after its checks pass; full-stop never merges. Production changes and unrelated actions remain outside that authority. Council discovers the requested GPT models through the runtime's configured connection rather than prescribing a provider ID.

`agent-gauntlet`, `code-navigation`, `compare-prototypes`, `subagents`, and `tilth` remain local in `agent/skills`. Pi loads shared PR and writing skills directly from the global library. Repository attribution remains in [third-party notices](third-party-notices.md); shared source ownership belongs to the library.

## Verification

```sh
PYTHONDONTWRITEBYTECODE=1 python3 -m unittest discover -s tests -p 'test_tstack*.py' -v
node tests/verify_tstack_pi_loader.mjs
```

The Python tests check Pi steering, direct shared installation, and watcher behavior with synthetic PR data. The Node check calls installed Pi discovery and loader functions directly, checks global and local source paths, detects collisions, and verifies manual-invocation flags. It does not start an agent, run inference, or establish live PR readiness. It requires the shared library and the installed Pi release under `agent/install`.
