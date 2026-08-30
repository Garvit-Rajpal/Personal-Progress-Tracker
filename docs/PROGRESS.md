# Personal Progress Tracker — Build Progress

Living doc. Read this first to resume work without re-reading every source file.
Only **active or incomplete** work lives here; completed detail moves into the
feature doc under `docs/features/`. Updated at the end of every milestone
(`CLAUDE.md` §Documentation, rule 1).

_Last updated: 2026-08-26 — Milestone 0 complete, 180 tests green._

---

## Status

**V1 shipped.** Roadmap, DSA (Striver 191), daily time logs, learning targets,
next-day plan, job applications, project ideas, user-managed roadmap links, a
bootstrap auto-seed on server start, and free-text fitness and finance pages.

**Milestone 0 complete — 2026-08-26.** The safety net exists. Full detail is in
`docs/features/foundation.md`; the short version:

- **180 tests**, up from 0. vitest + supertest, server only.
- The suite cannot reach the dev database *by construction* — a pure guard with
  no fallback value, confirmed at runtime by asking postgres
  `SELECT current_database()`.
- The 5h30m-per-day timezone bug is fixed and cannot silently return: a
  read-the-whole-tree test fails if `.setHours(`, `.setDate(` or
  `getTimezoneOffset(` reappears in `src/` outside the time helper (ADR-4).
- `{ data }` / `{ error: { code, message, details } }` is live on `/api/auth`
  and on every 401, with zod validation at the controller boundary (ADR-14).
- `scripts/backup.sh` takes a `pg_dump` and `--verify` proves it restores.

**Two ADRs written during M0.** ADR-13 — the app, the Prisma client and the
process entrypoint are three modules, because V1's layering made the service
layer literally untestable. ADR-14 — the response envelope is adopted per route
family rather than all at once.

**Milestone A not started.** 27 steps remain across A and B (`docs/LLD_v2.md` §7).

---

## Next up

Milestone 0 is closed. **Milestone A starts at MA-1.**

1. **MA-1 — the metric engine schema.** `PillarType`, `MetricDirection`,
   `MetricCadence`, `GoalStatus` enums plus `Metric`, `MetricEntry` and `Goal`
   as migration 1. Additive, so no backup required yet.

2. **MA-2 / MA-3 — `metric.service.ts` and `goal.service.ts`, tests first.**
   Upsert-by-date, `CONFLICT` on a duplicate `(userId, key)`, goal status
   transitions. `ApiError` and the full code vocabulary already exist from
   M0-4 — including `IMMUTABLE_HISTORY`, which is defined and unused, waiting
   for MA-2 to enforce invariant 3.

3. **MA-4 — the first destructive migration.** Blobs to `Goal` rows, then drop
   `FitnessGoal` and `FinancialGoal`. **Run
   `scripts/backup.sh --label pre-MA-4 --verify` first.** This is the point
   where that script stops being theoretical.

Before starting anything: `cd server && npm test` must report **180 passing**.
If it does not, fix that before writing a line of Milestone A.

---

## Discontinuities and things worth knowing

**The timezone bug never reproduced on the dev machine.** The host is already
`Asia/Kolkata`, so V1's `setHours(0, 0, 0, 0)` returned the right answer
locally. It only breaks inside `ppt_server`, which runs `TZ=UTC` — confirmed
directly. That is almost certainly why V1 shipped with it. The M0-2 tests
therefore simulate the UTC container explicitly instead of calling `setHours`,
so they fail on any machine, in any zone.

**ADR-4's "visible discontinuity in old charts" risk turned out to be
theoretical.** When M0-3 landed, the dev database held 1 user, 1 `DailyDSASet`
(2026-07-10) and **zero** rows in `DailyTimeLog`, `UserDSAProgress` and
`UserProgress`. There is essentially no history for the day-boundary change to
be discontinuous with. Re-check this before MA-4, which is the migration where
data volume actually matters.

**`docker-compose up --build` could not reach the registry** during the M0
session — `node:20-alpine` metadata timed out. Cached images are fine and
`docker-compose up -d` brings the stack up normally. Not a repo fault, but
worth knowing before reading a build failure as broken code.

**The client's host `node_modules` is stale.** It runs in Docker; typecheck it
with `docker exec ppt_client npx tsc --noEmit`, not from the host.

---

## Milestone status

### Milestone 0 — Foundation

| # | Milestone | Status |
|---|---|---|
| M0-1 | Test harness (vitest + supertest, test DB isolation) | ✅ done |
| M0-2 | Timezone helper + `USER_TIMEZONE` + `.env.example` | ✅ done |
| M0-3 | Replace all inline day-boundary calculations | ✅ done |
| M0-4 | API envelope, error codes, zod validation middleware | ✅ done — `/api/auth` + all 401s (ADR-14) |
| M0-5 | Backup script + docs scaffolding | ✅ done |
| M0-6 | Service tests for existing auth / dsa / roadmap | ✅ done |

**Milestone 0 complete.** Tests green (180) · `PROGRESS.md` updated · ADR-13 and
ADR-14 written · `docs/features/foundation.md` created. All four parts of
`CLAUDE.md`'s completion rule hold.

Test breakdown:

| Suite | Tests |
|---|---|
| `tests/unit/time.test.ts` | 38 |
| `tests/unit/repoScaffolding.test.ts` | 29 |
| `tests/unit/testDatabaseIsolation.test.ts` | 9 |
| `tests/unit/noInlineDayBoundaries.test.ts` | 7 |
| `tests/service/dayBoundary.service.test.ts` | 22 |
| `tests/service/auth.service.test.ts` | 18 |
| `tests/service/dsa.service.test.ts` | 16 |
| `tests/service/roadmap.service.test.ts` | 13 |
| `tests/service/harness.test.ts` | 4 |
| `tests/integration/authEnvelope.test.ts` | 22 |
| `tests/integration/health.test.ts` | 2 |
| **Total** | **180** |

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
| ~~"Today" computed in server timezone, wrong for 5h30m daily~~ | — | **fixed — M0-2 / M0-3** |
| ~~Zero tests~~ | — | **fixed — 180 tests as of M0-6** |
| ~~`server/package.json` has no scripts beyond a failing stub~~ | — | **fixed — M0-1** |
| ~~813 lines of merged work uncommitted~~ | — | **committed as `d03304b`** |
| Eleven route families still return V1's bare response shape | `src/controllers/*` | ADR-14 — MA-5, MA-11, MB-15 |
| Daily DSA set hardcoded to 3 questions | `dsa.service.ts` `slice(0, 3)` | MB-6 |
| Fitness and Finance are free-text blobs with no history | `fitnessGoal.service.ts`, `financialGoal.service.ts` | MA-4, MA-8, MA-10 |
| Health has no model at all | — | MA-9 |
| Bootstrap seed guard closes permanently once one phase exists, so syllabus edits never apply; also `execFileSync`s during startup | `bootstrap.service.ts` | MB-2 |
| `DailyDSASet` is global — keyed on `date` alone, no `userId`. The one V1 table that breaks invariant 1 | `prisma/schema.prisma` | **unscheduled** — harmless while single-user, blocks V3 |
| `prisma/seed.js` clears roadmap data before seeding, which cascades `UserProgress` away | `prisma/seed.js` | MB-2 — the re-seed idempotency test in `roadmap.service.test.ts` pins the failure mode |
| No client tests | `client/` | out of V2 scope by decision (`CLAUDE.md` §Stack) |

## Repo history note

On 2026-08-25 the local working tree was found corrupted — 93 of 121 tracked
files missing, several truncated to zero bytes, and `.git` missing its config
and most objects. Restored from the GitHub remote at `efab170`; the corrupt
original was moved to `.git-broken-backup/` and should be deleted once you are
satisfied. Nothing was lost, because the remote was ahead of the local HEAD.
Worth remembering: this repo's local git state is not a reliable source of truth.
