---
description: Map huge/foggy work into spec and tickets
argument-hint: "<goal>"
disable-model-invocation: true
---

Use this when the route is unclear, too large for one agent session, or needs research/prototypes before a spec.

Rules:
- Use `/wayfinder` if available; otherwise maintain the map in the current tracker or a local markdown file.
- Use `Agent` for bounded investigation tickets. Assume `inherit_context: false`.
- Preserve blocking edges explicitly.
- Facts are discovered; decisions are human-owned.
- Do not jump to implementation until the map is resolved and the human confirms the spec direction.

1. Create a map with ticket types:
   - `research` — primary-source reading; use `/research` if available and save cited notes.
   - `grilling` — one human decision needed; ask one question at a time.
   - `prototype` — cheap UI/logic artifact; use `prototyper` and link artifact/verdict.
   - `task` — mechanical setup/provisioning/data-shaping.

2. Work only tickets whose blockers are resolved. Each child prompt includes: goal, known facts, blocker context, expected output, and where to save notes.

3. When all decision-critical tickets close, synthesize route into a spec. Use `/to-spec` if available.

4. Break approved spec into tracer-bullet tickets with blocking edges. Use `/to-tickets` if available.

5. Implement tickets one at a time with `build`, then `reviewer`.

Output: map path/link, resolved decisions, remaining blockers, spec path/link, ticket list, next ready ticket.
