# Curriculum notes — the resource layer

Reference material and revision notes for roadmap items. Prose for a human;
`docs/curriculum/*.md` remains the machine-readable source of truth (ADR-12).

## Why this is a subdirectory and not another curriculum file

`server/tests/unit/curriculumFormat.test.ts` asserts that
`docs/curriculum/` contains **exactly** `ai-engineering.md` and
`system-design.md`. That test is right to be strict — the file list is part of
the seed contract. `fs.readdirSync` is not recursive and the list is filtered
to `.md`, so a `notes/` directory sits inside `docs/curriculum/` without
tripping it. Adding a seventh top-level curriculum file would have.

## What lives here

| File | What it is |
|---|---|
| `roadmap-resources.md` | One resource block per live roadmap item, keyed by `Phase :: Item`. The projection source for ADR-17. |
| `roadmap-optimisation.md` | Proposed changes to the roadmap itself. **Proposals, not applied** — see the file for why. |
| `advanced-typescript.md` | Revision note. The template every other note follows. |

## The rules this layer follows

1. **Every link was opened before it was written down.** No URL here is
   recalled from memory. Each block carries the date it was last checked.
   A link that 404s is a bug in this file, not a broken resource.
2. **Two resources per item is the target, four is the ceiling.** At
   `docs/cadence.md` pace an item gets ~2.5 h. A ten-link reading list for a
   two-and-a-half-hour slot is a way of not doing the item.
3. **One of them is short.** The revision link exists so a topic can be
   refreshed on a bad day in under fifteen minutes, which is the day this
   tracker is actually calibrated for.
4. **Video is for intuition, docs are for correctness.** Where they disagree,
   the docs win. Videos age faster and are dated here for that reason.
5. **A revision note is written after doing the item, not before.**
   It records what you actually got wrong. `advanced-typescript.md` is the
   exception — written first, as the format's worked example.

## Keying

Resource blocks are keyed `Phase title :: Item title`, matching exactly the
`(phaseId, title)` pair the seed upserts on (`docs/LLD_v2.md` §6). A typo in
a key means the resources silently fail to attach at MB-4, so the key is
copied from `server/prisma/seed.js`, never retyped.
