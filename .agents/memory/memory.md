# Memory index for Contracts

This file is the index of the domain memory for `Contracts`. The domain memory captures durable knowledge that is specific to this domain — design decisions, bug history, operational caveats, follow-up work — and is mandatory reading for any agent (human or AI) about to touch this repository or any cross-boundary code that depends on it.

The platform-wide orientation lives in `development-environment/agents/`. The reading order, the relationship between memory layers, and the rules that govern this file are documented in [`ONBOARDING.md`](../../development-environment/agents/ONBOARDING.md) and in [`working_norms.md`](../../development-environment/agents/working_norms.md) (rules 24 and 25).

Add one line per memory file under this directory. Keep entries short — one sentence describing what the file covers — and let the file itself carry the depth.

## Index

<!-- Add entries below, one per memory file. Example:
- [topic-name](./topic-name.md) — One-sentence summary of what this file covers.
-->

## External dependencies

Which sibling modules this domain consumes through their published `<domain>-lib` clients, and what each dependency is used for. New cross-boundary integrations are added here at design time; runtime details stay in the relevant memory files.

<!-- Example:
- `cpm-lib` — user identity resolution, wallet provisioning, partner-link lookup.
- `fin-lib` — atomic financial transaction registration.
-->

## Open follow-ups

Tracked items derived from ADRs (per `adr.md` rule A3) and from DEVLOG entries that have not been resolved yet. Each item names the ADR or DEVLOG date that originated it, and the disposition (Implement / Defer with trigger / Drop with reason).

<!-- Example:
- ADR-0012 step 3 — Implement the per-partner dispatcher cap. Trigger: enable when partner X exceeds the baseline throughput.
-->

## Bug history of note

Production-pinned lessons that future readers must know about: incidents that caused real damage, latent defects that nearly did, and the discipline that resulted. One entry per incident; cross-reference the fix commit.

<!-- Example:
- 2026-05-15 — TypeORM silently omitted `undefined` from a WHERE clause, allowing a stale process to match the wrong wallet. See commit <sha> and `<topic>.md`.
-->

## Design decisions in flight

Decisions that are being discussed but not yet recorded as ADRs. Once decided, they are migrated to an ADR per `adr.md` rule A1 and removed from this section.

<!-- Example:
- Whether to split the dispatcher into N partner-specific workers or keep it monolithic. Owner: <name>. Target ADR: domain ADR-NNNN.
-->
