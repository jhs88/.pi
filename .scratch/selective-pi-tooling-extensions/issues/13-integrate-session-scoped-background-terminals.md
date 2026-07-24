# Integrate session-scoped background terminals

Type: task
Status: open
Blocked by: 10, 11

## Question

Implement and verify the adapted upstream background-terminal system for long-running non-interactive commands: start, status, list, and process-tree kill tools; explicit deterministic shell selection; no stdin; atomic concurrency limits; bounded model delivery; private quota-bounded spill logs with stale-startup cleanup; best-effort redaction; coalesced completion follow-ups; running-state UI and an accurately labelled retained-tail `/ps`; idempotent process-exit safety; and deterministic teardown on normal session transitions. Prove POSIX tree termination and document Windows and SIGKILL/power-loss limits unless real Windows verification is available.
