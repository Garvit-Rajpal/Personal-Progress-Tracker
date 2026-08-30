# Foundation (Milestone 0)

The safety net V2's three destructive migrations run inside. Ships nothing a
user can see; everything below exists so that MA-4, MA-11 and MB-5 can rewrite
real personal history without losing it (ADR-10).

**Status:** complete — 2026-08-26. 180 tests.

---

## What it does

| Concern | Where | Notes |
|---|---|---|
| Test harness | `server/vitest.config.ts`, `server/tests/` | vitest + supertest, server only |
| Test-database isolation | `server/tests/testDatabaseUrl.ts`, `tests/setupEnv.ts` | structural, not conventional — see below |
| Day boundaries | `server/src/utils/time.ts` | ADR-4; the fix for the 00:00–05:30 IST bug |
| Response envelope | `server/src/utils/apiError.ts`, `utils/respond.ts`, `middlewares/errorHandler.ts` | ADR-14; live on `/api/auth` only |
| Request validation | `server/src/middlewares/validate.ts`, `src/schemas/` | zod at the controller boundary |
| Module layering | `server/src/lib/prisma.ts`, `src/app.ts`, `src/index.ts` | ADR-13 |
| Backups | `scripts/backup.sh` | `pg_dump` inside `ppt_postgres`; `--verify` restores to prove it |

## Data it owns

None. M0 adds no table, no column and no migration. The only schema-adjacent
change is the new `USER_TIMEZONE` environment variable.

## Endpoints

None added. `/api/auth/register`, `/api/auth/login` and `/api/auth/refresh`
changed **shape** (ADR-14) but not behaviour:

| Route | Before | After |
|---|---|---|
| `POST /api/auth/register` | `201 { accessToken, ... }` | `201 { data: { accessToken, ... } }` |
| `POST /api/auth/login` | `200 { accessToken, ... }` | `200 { data: { ... } }` |
| `POST /api/auth/refresh` | `200 { accessToken, ... }` | `200 { data: { ... } }` |
| any failure on those routes | `4xx { error: "message" }` | `4xx { error: { code, message, details? } }` |
| any protected route, no token | `401 { error: "Unauthorized: No token provided" }` | `401 { error: { code: "UNAUTHORIZED", ... } }` |
| unmatched path | express default HTML | `404 { error: { code: "NOT_FOUND", ... } }` |

`/health` is deliberately **not** enveloped: docker-compose and any uptime check
read it, and it is not part of the client API.

## How the test database is isolated

`docs/LLD_v2.md` §1 requires that a test can never reach the dev database *by
construction*. The guard is a pure function, `resolveTestDatabaseUrl`, which
throws unless all four hold:

1. `DATABASE_URL_TEST` is set and non-blank.
2. It parses as a URL and names a database.
3. It does **not** resolve to the same `host:port:database` as `DATABASE_URL`
   — compared on identity, not string equality, so a differing query string
   does not sneak past.
4. Its database name ends in `_test`.

There is no fallback value anywhere. `tests/setupEnv.ts` applies the guard and
overwrites `DATABASE_URL` before any test module loads, which matters because
`PrismaClient` reads it exactly once at construction (ADR-13).
`scripts/migrate-test-db.js` applies the same guard to prisma CLI runs.

Rules 3 and 4 are belt and braces on purpose: rule 4 still holds if someone
edits `DATABASE_URL` in a way that accidentally makes rule 3 pass.

`tests/service/harness.test.ts` closes the loop by asking postgres itself —
`SELECT current_database()` — because the environment can be right while the
client is wrong.

## The timezone fix

`server/src/utils/time.ts`, driven by `USER_TIMEZONE` (default `Asia/Kolkata`).
No date library; `Intl.DateTimeFormat` with an explicit `timeZone` is in the
runtime and is DST-correct.

The module distinguishes two things that both look like a date, because
conflating them is the same class of bug ADR-4 fixes:

- **date keys** — `userDateKey`, `parseUserDate`, `differenceInDateKeys`,
  `weekRange`. UTC midnight stamped with a user-local calendar date. This is
  what a Prisma `@db.Date` column stores.
- **instants** — `startOfUserDay`, `endOfUserDay`. The moment local midnight
  actually occurs (`2026-08-25T18:30:00Z` for 26 Aug in Kolkata). For bounding
  a `DateTime` column.

Call sites converted in M0-3: `dsa.service.ts`, `dailyTimeLog.service.ts`,
`analytics.service.ts`. `auth.service.ts` also lost a `setDate` — session
expiry is a duration, so it is now an explicit interval rather than calendar
arithmetic in the server's zone.

`tests/unit/noInlineDayBoundaries.test.ts` reads the whole of `src/` and fails
if `.setHours(`, `.setDate(` or `getTimezoneOffset(` reappears outside the time
helper. That guard is what keeps ADR-4 true after M0 closes.

## Known gaps

Carried forward deliberately; each has an owner.

| Gap | Owner |
|---|---|
| Eleven route families still return V1's bare shape (ADR-14) | MA-5, MA-11, MB-15 |
| `dsa.service.ts` still hardcodes `slice(0, 3)` | MB-6 (ADR-7) |
| `BootstrapService` seeds only when a table is empty, so syllabus edits never apply; it also `execFileSync`s during startup | MB-2 (ADR-12) |
| `DailyDSASet` is global, keyed on `date` alone with no `userId` — the one V1 table that breaks invariant 1 | not yet scheduled; harmless while single-user, blocks V3 |
| No client tests | out of V2 scope by decision (`CLAUDE.md` §Stack) |
| Historical rows written before M0-3 keep whatever date V1 gave them | ADR-4 — no retroactive rewrite |

## Verifying it

```bash
cd server
npm test                       # full suite
npm run test:unit              # no database
npm run test:db:migrate        # apply migrations to the test database
../scripts/backup.sh --verify  # dump, restore into a scratch DB, drop it
```

The test database must exist first:

```bash
docker exec ppt_postgres psql -U postgres -c "CREATE DATABASE personal_progress_assistant_test"
```
