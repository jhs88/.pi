# Issue tracker: Local Markdown

Issues and specs for this repo live as Markdown files in `.scratch/`.

## Conventions

- One feature or effort per directory: `.scratch/<feature-slug>/`
- A spec, when present, is `.scratch/<feature-slug>/spec.md`
- Implementation issues are one file per ticket at `.scratch/<feature-slug>/issues/<NN>-<slug>.md`, numbered from `01`
- Triage state is recorded as a `Status:` line near the top of each issue file
- Comments and conversation history append under `## Comments`

## Publishing and fetching

- To publish to the issue tracker, create the appropriate Markdown file under `.scratch/<feature-slug>/`.
- To fetch a ticket, read the referenced path or numbered issue file.

## Wayfinding operations

- **Map:** `.scratch/<effort>/map.md`
- **Child ticket:** `.scratch/<effort>/issues/NN-<slug>.md`
- Each child carries `Type:` (`research`, `prototype`, `grilling`, or `task`) and `Status:` (`open`, `claimed`, or `resolved`).
- **Blocking:** `Blocked by: NN, NN`; a ticket is unblocked when every listed ticket is resolved.
- **Frontier:** open, unblocked, unclaimed tickets; lowest number wins.
- **Claim:** set `Status: claimed` before working the ticket.
- **Resolve:** append the resolution under `## Answer`, set `Status: resolved`, then append a gist and relative link under the map's `## Decisions so far`.
