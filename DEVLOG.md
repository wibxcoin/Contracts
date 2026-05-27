# Contracts — DEVLOG

Append-only, dated record of architectural decisions, phase wraps, lessons learned, and open follow-ups for the `Contracts` repository. New entries go on top — most recent first.

The README of this repository documents the system in its present state. This DEVLOG documents the journey: when each decision was taken, why, what alternatives were considered, what was reversed, and what follow-up work the decision created. The shape of each entry is fixed by [`documentation.md`](../development-environment/agents/documentation.md) in the platform agent files.

After every architectural decision:

1. Revise the README sections so they reflect the new state.
2. Record the decision as an ADR under `./docs/architecture/decisions/` per [`adr.md`](../development-environment/agents/adr.md) rule A1.
3. Append a dated entry to this DEVLOG citing the ADR number.
4. Convert every actionable step in the ADR into a tracked follow-up under "Open follow-ups" in the relevant entry, per `adr.md` rule A3.

## Entry shape

```markdown
## YYYY-MM-DD — <short topic>

<one-paragraph context: what work was happening; why this decision came up>

### Decisions

| Topic | Decision | Rationale |
|---|---|---|
| ... | ... | ... |

### Open follow-ups

- ...
```

<!-- Add new entries below this line. Most recent first. -->
