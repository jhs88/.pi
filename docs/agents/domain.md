# Domain Docs

This is a single-context repository.

## Before exploring

Read these when present:

- Root `CONTEXT.md`
- Relevant ADRs under `docs/adr/`

If they do not exist, proceed silently. Create them lazily through domain modeling only when terminology or a durable architectural decision is actually resolved.

## Layout

```text
/
├── CONTEXT.md
└── docs/
    └── adr/
```

Use the glossary's canonical vocabulary in issues, specs, tests, and implementation discussions. Surface conflicts with existing ADRs rather than silently overriding them.
