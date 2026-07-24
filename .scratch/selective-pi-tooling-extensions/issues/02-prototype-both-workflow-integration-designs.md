# Prototype both workflow integration designs

Type: prototype
Status: open
Blocked by: 10

## Question

How do two rough implementations compare in behavior, safety, complexity, observability, and compatibility: (A) Ben's independent in-process workflow child sessions adapted to our recursion guards and three-agent cap, and (B) a workflow DSL/runner adapted over `@tintinweb/pi-subagents`?

The prototype must not modify production extension loading. It should leave disposable artifacts and focused test results for human comparison.
