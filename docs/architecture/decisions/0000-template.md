# ADR-0000 — Template

Copy this file to `NNNN-kebab-case-slug.md` (next free number in this
directory) and fill every section. One decision per ADR. See
[`agents/adr.md`](../../../../development-environment/agents/adr.md)
for the rules that govern ADRs across the Wibx Platform.

Domain-local ADRs apply to the internal structure of `Contracts` only.
Decisions that cross domains or change a published contract are
platform-wide and live under
`development-environment/docs/architecture/decisions/` instead.

| Field  | Value |
|--------|-------|
| Status | Proposed / Accepted / Superseded by ADR-NNNN |
| Date   | YYYY-MM-DD |
| Scope  | Domain: Contracts |

## Context

The forces at play: the problem, the constraints, the requirement
that makes a decision necessary. Facts only — no decision yet.

## Options considered

Each realistic option with its trade-offs. The option that was
rejected is as informative to a future reader as the one chosen.

## Decision

The decision taken, stated plainly. One decision per ADR.

## Consequences

What becomes easier, what becomes harder, what new follow-up work
the decision creates. Both the positive and the negative. Each
actionable step becomes a tracked follow-up in this domain's
`DEVLOG.md` per rule A3 in
[`agents/adr.md`](../../../../development-environment/agents/adr.md).
