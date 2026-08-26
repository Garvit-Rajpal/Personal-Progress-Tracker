# Decision log

Every non-obvious decision gets an entry (`CLAUDE.md` §Documentation, rule 2).
Reference the ADR number in a code comment at the site of the decision.

## Format

```
### ADR-N — <short title>
**Date:** YYYY-MM-DD  **Status:** proposed | accepted | superseded by ADR-M
**Context.** What forced a choice.
**Decision.** What was chosen.
**Alternatives rejected.** What else was considered, and why not.
**Consequences.** What this costs, including what it makes harder.
```

The "alternatives rejected" and the cost half of "consequences" are the parts
worth writing. An ADR that only records what was chosen is a changelog entry.

## V2 ADRs

ADR-1 through ADR-12 are written in full in `docs/HLD_v2.md` §5. Index:

| ADR | Title | Status |
|---|---|---|
| ADR-1 | One shared time-series engine for the life pillars | accepted |
| ADR-2 | Retire FitnessGoal / FinancialGoal singletons in favour of Goal | accepted |
| ADR-3 | Health and Fitness are separate pillars over one engine | accepted |
| ADR-4 | Day boundaries computed in the user's timezone | accepted |
| ADR-5 | DailyTimeLog generalises into TimeBlock | accepted |
| ADR-6 | Learning tracks reuse Roadmap; projects tracked at outcome level | accepted |
| ADR-7 | Targets are configuration, not constants | accepted |
| ADR-8 | Per-pillar analytics plus a composite weekly review | accepted |
| ADR-9 | Multi-tenant-ready seams, no tenancy machinery | accepted |
| ADR-10 | Tests arrive in Milestone 0, before any feature work | accepted |
| ADR-11 | Documentation is part of the Definition of Done | accepted |
| ADR-12 | Curriculum markdown is the source of truth, the DB a projection | accepted |

New decisions made during implementation start at **ADR-13** and are appended
below in full.

---
