# Personal Progress Tracker — Implementation Context for Claude Code

Garvit's personal life-and-career operating system. V1 is built and running.
This file is the standing contract for every change in this repo.

`docs/HLD_v2.md` and `docs/LLD_v2.md` are the V2 design. Those decisions are
already made — implement them, do not re-litigate them. If you believe a
decision is wrong, say so and stop; do not silently substitute your own.

## Read before any work

1. `docs/HLD_v2.md` — V1 as-built, V2 architecture, ADR-1 … ADR-12
2. `docs/LLD_v2.md` — test pyramid, schema deltas, API contracts, and the strict
   milestone order (M0-1 → MB-15). This is the build order. Do not reorder it.
3. `docs/PROGRESS.md` — living build log. What is done, what is next, what is
   broken. Read it first to resume work without re-reading every source file.
4. `docs/cadence.md` — the real time budget (1–2 h/day). Every default,
   target and streak rule in the app must be calibrated to this document, not
   to what looks impressive.
5. `docs/curriculum/system-design.md` and `docs/curriculum/ai-engineering.md` —
   the source of truth for learning-track content. Seed scripts derive from
   these files.
6. `docs/DECISIONS.md` — ADR index.

**Current phase:** Milestone 0 (foundation), `docs/LLD_v2.md` §7.
Order is strict: **M0 → Milestone A → Milestone B.** A milestone must be fully
green before the next one starts.

## Stack

- **Client:** Next.js 16 (App Router), React 19, TypeScript strict, Tailwind v4,
  shadcn / base-ui, TanStack Query, Recharts, axios, lucide-react. Dark theme.
- **Server:** Express 5, TypeScript strict, Prisma 6, PostgreSQL 15, JWT access
  token + httpOnly refresh cookie, zod, helmet.
- **Infra:** Docker Compose — `ppt_postgres` (host 5433), `ppt_server`
  (5001→5000), `ppt_client` (3000).
- **Tests (added in M0):** vitest + supertest on the **server only**. Client
  tests are deliberately out of V2 scope — the risk lives in the server-side
  data migrations, and a half-hearted client suite would cost more than it catches.

## Methodology — TDD, from Milestone 0 onward

The server has **zero tests today**. That is the single biggest risk in this
repo and M0 fixes it before any feature work.

- Red → green → refactor. Write the failing test first for every service-layer
  unit in `docs/LLD_v2.md` §1's pyramid.
- Tests hit `DATABASE_URL_TEST`, never the dev database. Enforce this in the
  test setup file, not by convention.
- A milestone is not done until its tests are green **and** the full existing
  suite is still green. No skipped tests, no `.only`.

## Documentation & progress protocol — non-negotiable

This project must always carry its own written record. A change that works but
is undocumented is **not done**. This is the point of the project, not overhead:
the tracker exists to make progress legible, and the repo has to hold itself to
the same standard.

1. **`docs/PROGRESS.md` is updated at the end of every milestone** — mark the
   milestone row, record the test count, and rewrite the "Next up" section.
   Never let it drift behind the code.
2. **Every non-obvious decision becomes an ADR** appended to
   `docs/DECISIONS.md`: context, the decision, alternatives rejected, and the
   consequence you are accepting. Reference the ADR number in code comments at
   the site of the decision.
3. **Every new feature gets `docs/features/<feature-name>.md`** — what it does,
   the data it owns, its endpoints, and its known gaps. Completed detail moves
   out of PROGRESS.md into the feature doc, so PROGRESS.md only ever holds
   active or incomplete work.
4. **Every week gets `docs/reviews/YYYY-Www.md`**, generated from the app's own
   weekly-review data (Milestone A ships the endpoint that produces it). This is
   the file that closes the loop between the tracker and the repo.
5. **A milestone may only be marked complete when all four hold:** tests green,
   `docs/PROGRESS.md` updated, any new ADR written, and the feature doc created
   or amended. State explicitly in your summary that you did all four.
6. **Schema changes require a migration file.** Never `prisma db push` against a
   database with data in it.

## Non-negotiable invariants

Violating any of these is a bug, not a style preference.

1. **Every persisted row is scoped by `userId`.** No global singleton tables, no
   implicit "current user". V2 is single-user in practice but must stay
   multi-tenant-ready by construction (ADR-9) — this is what keeps V3 possible.
2. **Prisma is imported only inside `src/services/**`.** Controllers and routes
   never touch `prisma` directly. This layering already holds in V1 — preserve it.
3. **Metric history is append-only.** A measurement is a dated entry. Never
   overwrite a previous day's value to represent a change; write a new entry.
4. **No target is hardcoded.** Daily and weekly targets come from the user's
   `LearningTarget` row. The current hardcoded `slice(0, 3)` in
   `dsa.service.ts` is exactly the anti-pattern being removed (ADR-7).
5. **Day boundaries are computed in the user's timezone (Asia/Kolkata), never
   the server's.** V1's `new Date(); setHours(0,0,0,0)` resolves to UTC midnight
   inside the Docker container, so "today" is wrong for 5.5 hours every day.
   Fix once, in a shared helper, and use it everywhere (ADR-4).
6. **Analytics endpoints are read-only.** An aggregation never writes, never
   creates a default row as a side effect of being read.
7. **Seed scripts are idempotent.** Safe to re-run against a populated database.
8. **Curriculum lives in `docs/curriculum/*.md`.** The database is a projection
   of those files. To change the syllabus, edit the markdown and re-seed — never
   hand-edit seeded rows as the mechanism of change.
9. **The tracker never duplicates another project's internal docs.** LoveTeddy
   and TrustDesk own their own `docs/`. This repo tracks them at the outcome
   level (milestones, hours, status) and links out (ADR-6).

## Conventions

- **API envelope:** `{ data }` on success, `{ error: { code, message, details } }`
  on failure. Error codes are listed in `docs/LLD_v2.md` §4.
- **Validation:** zod schemas at the controller boundary. A service may assume
  its input is already shaped; it may not assume it is authorised.
- **Layering:** `routes → controllers → services`. One React Query hook per
  domain in `client/src/hooks/`, named `use<Domain>.ts`.
- **Dates:** `@db.Date` for anything rolled up by day. `DateTime` only where the
  clock time genuinely matters.
- **Enums live in Prisma** and are re-exported to the client through generated
  types — never re-declare an enum's values as string literals in the client.
- **Explain non-obvious decisions in code comments referencing the ADR number.**
  The owner of this repo is learning from this codebase; a comment that says
  *why* is worth more than one that says *what*.

## Commands

- `docker-compose up --build` — full stack
- `docker exec -it ppt_server npx prisma migrate dev --name <name>` — new migration
- `docker exec -it ppt_server node prisma/seed.js` — roadmap syllabus
- `docker exec -it ppt_server node seed-191.js` — Striver 191 DSA questions
- Note: `BootstrapService.ensureSeedData()` already runs `prisma/seed.js` and
  `prisma/seed-dsa.js` automatically on server start, but **only when the tables
  are empty** — see HLD_v2 §1.2 finding 9. Until MB-2 lands, a syllabus change
  needs the manual seed command above.
- `npm test` (server) — full suite; must be green before any commit
- `npm run test:unit` / `npm run test:integration`

## Environment

Server `.env`: `DATABASE_URL`, `DATABASE_URL_TEST`, `JWT_SECRET`,
`JWT_REFRESH_SECRET`, `PORT`, `CLIENT_URL`, `USER_TIMEZONE` (default
`Asia/Kolkata`, added in M0 for invariant 5).
Client `.env.local`: `NEXT_PUBLIC_API_URL`.
Never commit `.env`; keep `.env.example` current.
