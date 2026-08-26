# Personal Progress Tracker — Build Progress

Living doc. Read this first to resume work without re-reading every source file.
Only **active or incomplete** work lives here; completed detail moves into the
feature doc under `docs/features/`. Updated at the end of every milestone
(`CLAUDE.md` §Documentation, rule 1).

_Last updated: 2026-08-25 — V2 planned, no implementation started._

---

## Status

**V1 shipped.** Roadmap, DSA (Striver 191), daily time logs, learning targets,
next-day plan, job applications, project ideas, user-managed roadmap links, a
bootstrap auto-seed on server start, and free-text fitness and finance pages.
No tests. No docs before this one.

**Uncommitted work merged in on 2026-08-25.** A second copy of this repo in
`~/Downloads` held 813 insertions and 371 deletions on top of `efab170` that
existed nowhere else — `UserRoadmapLink` plus its service, controller, routes
and migration, `BootstrapService`, and a full visual pass across every dashboard
page. It was merged into this working tree and verified byte-identical. **It is
still uncommitted and unpushed — commit it before starting M0-1.**

**V2 planned, not started.** 33 steps across three milestones — see
`docs/LLD_v2.md` §7. Nothing is implemented yet.

**Test count: 0.** This is the first number that has to change.

---

## Next up

1. **M0-1 — stand up the test harness.** vitest + supertest, `tests/setupEnv.ts`
   forcing `DATABASE_URL_TEST`, `npm test` scripts. Nothing else starts until
   this is green, because three destructive migrations are coming and there is
   currently no safety net at all (ADR-10).

2. **M0-2 — the timezone helper.** `startOfUserDay` in `src/utils/time.ts`. This
   is a live bug, not a refactor: `dsa.service.ts` computes "today" as
   server-local midnight, which is UTC in Docker, so between 00:00 and 05:30 IST
   the app is a day behind. Unit tests must cover that window specifically.

3. **M0-3 through M0-6** — propagate the helper, standardise the API envelope,
   add the backup script, and get service-level tests around the existing auth,
   dsa and roadmap services.

---

## Milestone status

### Milestone 0 — Foundation

| # | Milestone | Status |
|---|---|---|
| M0-1 | Test harness (vitest + supertest, test DB isolation) | ⬜ not started |
| M0-2 | Timezone helper + `USER_TIMEZONE` + `.env.example` | ⬜ not started |
| M0-3 | Replace all inline day-boundary calculations | ⬜ not started |
| M0-4 | API envelope, error codes, zod validation middleware | ⬜ not started |
| M0-5 | Backup script + docs scaffolding | ⬜ not started |
| M0-6 | Service tests for existing auth / dsa / roadmap | ⬜ not started |

### Milestone A — Life pillars become real

| # | Milestone | Status |
|---|---|---|
| MA-1 | Metric / MetricEntry / Goal models + migration | ⬜ not started |
| MA-2 | `metric.service.ts` + tests | ⬜ not started |
| MA-3 | `goal.service.ts` + tests | ⬜ not started |
| MA-4 | **Destructive** — blobs to Goal rows, drop singletons | ⬜ not started |
| MA-5 | Metrics + Goals API | ⬜ not started |
| MA-6 | Seed default metrics per pillar | ⬜ not started |
| MA-7 | Shared pillar hooks and components | ⬜ not started |
| MA-8 | `/fitness` rebuilt on the engine | ⬜ not started |
| MA-9 | `/health` new page + sidebar | ⬜ not started |
| MA-10 | `/financial-goals` rebuilt | ⬜ not started |
| MA-11 | **Destructive** — TimeBlock, `/daily-time` rebuilt | ⬜ not started |
| MA-12 | Pillar + weekly analytics, `/weekly-review`, markdown export | ⬜ not started |

### Milestone B — Career pillars

| # | Milestone | Status |
|---|---|---|
| MB-1 | Extend PhaseType / BadgeType | ⬜ not started |
| MB-2 | Curriculum markdown parser + idempotent seed | ⬜ not started |
| MB-3 | Seed system-design curriculum | ⬜ not started |
| MB-4 | Seed AI-engineering curriculum | ⬜ not started |
| MB-5 | **Destructive** — structured LearningTarget | ⬜ not started |
| MB-6 | DSA set size follows configured target | ⬜ not started |
| MB-7 | `/roadmap` grouped and filtered by track | ⬜ not started |
| MB-8 | Project + ProjectMilestone models | ⬜ not started |
| MB-9 | `project.service.ts` + API | ⬜ not started |
| MB-10 | `/projects` page, LoveTeddy seeded | ⬜ not started |
| MB-11 | ProjectIdea graduation flow | ⬜ not started |
| MB-12 | TimeBlock linked to Project | ⬜ not started |
| MB-13 | Craft dashboard card | ⬜ not started |
| MB-14 | Job pipeline analytics | ⬜ not started |
| MB-15 | Weekly review across all six pillars + docs pass | ⬜ not started |

---

## Known issues carried into V2

| Issue | Where | Fixed by |
|---|---|---|
| "Today" computed in server timezone, wrong for 5h30m daily in IST | `dsa.service.ts`, `dailyTimeLog.service.ts`, `analytics.service.ts` | M0-2, M0-3 |
| Daily DSA set hardcoded to 3 questions, incompatible with the real budget | `dsa.service.ts` `slice(0, 3)` | MB-6 |
| Fitness and Finance are free-text blobs with no history | `fitnessGoal.service.ts`, `financialGoal.service.ts` | MA-4, MA-8, MA-10 |
| Health has no model at all | — | MA-9 |
| Zero tests | everywhere | M0-1, M0-6 |
| `server/package.json` has no scripts beyond a failing `test` stub | `server/package.json` | M0-1 |
| Bootstrap seed guard closes permanently once one phase exists, so syllabus edits never apply | `bootstrap.service.ts` | MB-2 |
| 813 lines of merged work still uncommitted and unpushed | working tree | commit before M0-1 |

## Repo history note

On 2026-08-25 the local working tree was found corrupted — 93 of 121 tracked
files missing, several truncated to zero bytes, and `.git` missing its config
and most objects. Restored from the GitHub remote at `efab170`; the corrupt
original was moved to `.git-broken-backup/` and should be deleted once you are
satisfied. Nothing was lost, because the remote was ahead of the local HEAD.
Worth remembering: this repo's local git state is not a reliable source of truth.
