# HLD v2 — Personal Progress Tracker

> There is no HLD v1 document; V1 was built without one. §1 reconstructs V1
> as-built so this file is self-contained. Everything from §2 onward is the V2
> design and is binding.

---

## 1. V1 as-built

### 1.1 What exists

| Domain | Models | Surface |
|---|---|---|
| Auth | `User`, `Session` | JWT access token + httpOnly refresh cookie, axios interceptor refresh |
| Roadmap | `RoadmapPhase` (FS/AI/BOTH) → `RoadmapItem` (CORE/AI/PROJECT/JOB) → `UserProgress` | `/roadmap`, seeded from `prisma/seed.js` |
| DSA | `DSAQuestion`, `DailyDSASet`, `UserDSAProgress` | `/dsa`, Striver SDE Sheet, 191 questions, notes + solved flag |
| Time | `DailyTimeLog` (`dsaHours`, `devAiHours`, two worklog texts) | `/daily-time` |
| Targets | `LearningTarget` (three free-text fields) | `/learning-targets` |
| Planning | `NextDayPlan` (one text blob) | `/next-day-plan` |
| Jobs | `JobApplication` (+ `interviewStatus`, `statusDetails`, `ctc`) | `/job-applied` |
| Ideas | `ProjectIdea` | `/project-ideas` |
| Fitness | `FitnessGoal` (one `goals` text blob) | `/fitness` |
| Finance | `FinancialGoal` (`goals` + `learningNotes` text blobs) | `/financial-goals` |
| Streaks | `User.streak`, `streakFreezeDays`, `streakAwardedWeeks` | shown on dashboard |
| Analytics | none — computed | `GET /api/analytics/overview` |
| Roadmap links | `UserRoadmapLink`, `RoadmapLinkKind` | user-managed resource links on `/roadmap` |
| Bootstrap | none | `BootstrapService.ensureSeedData()` on server start |

Layering is clean and consistent: `routes → controllers → services`, with Prisma
confined to services, and one TanStack Query hook per domain on the client. V2
extends this pattern rather than replacing it.

### 1.2 What is actually wrong with V1

These are the findings V2 exists to fix. They are stated plainly because the
plan is only as good as its diagnosis.

1. **Fitness and Finance are placeholders wearing a page.** Each is a single
   free-text `goals` column on a one-row-per-user table. There is no metric, no
   date, no history, and therefore nothing to chart, trend, or review. You
   cannot tell whether last month was better than this one.
2. **Health does not exist.** There is no model for sleep, weight, energy, or
   anything else that is health rather than training.
3. **The roadmap has no system-design content at all.** `seed.js` is a six-phase
   AI-engineering syllabus. HLD and LLD — a stated V2 goal — have zero coverage.
4. **Targets are hardcoded, and hardcoded wrong.** `dsa.service.ts` builds each
   day's set with `sortedQuestions.slice(0, 3)`. Three problems a day does not
   fit a 1–2 h/day budget that also has to cover system design and AI
   engineering. The app currently sets its owner up to fail its own streak.
5. **"Today" is computed in the wrong timezone.** `new Date(); setHours(0,0,0,0)`
   resolves to *server-local* midnight. In the Docker container that is UTC, so
   for a user in IST the day rolls over at 05:30 local. Every daily set, daily
   time log and streak calculation is wrong for five and a half hours a day.
6. **Time tracking has exactly two buckets** (`dsaHours`, `devAiHours`). There is
   nowhere to log system-design study, AI-engineering work, or LoveTeddy build
   time as distinct categories — which are precisely the things V2 must measure.
7. **There are no tests.** Not one, on either side.
8. **There is no `CLAUDE.md`, no `docs/`, no ADR log, no progress file** —
   despite TrustDesk and LoveTeddy both having mature versions of exactly that.
9. **The bootstrap seed guard blocks curriculum updates.**
   `BootstrapService.ensureSeedData()` seeds only when
   `roadmapPhase.count() === 0`. Once any phase exists the guard closes
   permanently, so a new or edited syllabus can never reach the database through
   normal startup. This directly obstructs ADR-12 and is fixed in MB-2.

---

## 2. V2 goals and non-goals

### Goals

- **G1** Make the life pillars real: fitness, health and finance get structured,
  dated, chartable data instead of text blobs.
- **G2** Make the career pillars trackable: LoveTeddy delivery, system design
  (HLD + LLD), and AI engineering depth become first-class tracked programs.
- **G3** Calibrate the whole system to the true budget of 1–2 h/day, so the
  numbers the app shows are ones a real week can actually produce.
- **G4** Give the repo the same documentation discipline TrustDesk and LoveTeddy
  already have, and make it self-sustaining (`CLAUDE.md` §Documentation).
- **G5** Close the loop: a weekly review the app generates, which becomes a file
  in `docs/reviews/`, which informs the next week's targets.

### Non-goals for V2

Stated so they do not creep in.

- **NG1** No multi-user product surface. No org model, no billing, no invites.
  V2 stays multi-tenant-*ready* (ADR-9) without paying for tenancy it does not use.
- **NG2** No bank, broker, or health-device integrations. All entry is manual.
  Integrations are a V3 conversation and a very different privacy problem.
- **NG3** No full finance ledger. No transactions, categories, or budgets. V2
  tracks a handful of decided metrics (savings rate, net worth, runway), not
  double-entry bookkeeping.
- **NG4** No LLM features inside the tracker. Tempting, and out of scope. The AI
  engineering *learning* is tracked here; it is not practised here.
- **NG5** No mobile app.

---

## 3. The pillar model

V2 organises everything under six pillars, in two groups.

**Life pillars** — Fitness, Health, Finance.
**Career pillars** — Craft (DSA + system design + AI engineering), Delivery
(LoveTeddy and other shipping projects), Opportunity (job applications).

The insight driving the architecture: *fitness, health and finance are the same
shape.* Each is "a set of named numbers, measured on dates, moving toward
targets." Weight, sleep hours, steps, workouts per week, savings rate, net worth
and monthly burn differ in meaning but not in structure. Building three bespoke
subsystems for one shape would triple the code and give the app three
incompatible chart implementations.

So V2 builds **one time-series engine** and configures it per pillar (ADR-1).
Career pillars keep their existing bespoke models, because they genuinely are
different shapes — a roadmap item is not a measurement.

---

## 4. Target architecture

```
                        ┌──────────────────────────────┐
                        │   Weekly Review (MA-11)      │
                        │  reads every pillar, writes  │
                        │  docs/reviews/YYYY-Www.md    │
                        └───────────────┬──────────────┘
                                        │
        ┌───────────────────────────────┼───────────────────────────────┐
        │                               │                               │
┌───────▼────────┐            ┌─────────▼─────────┐          ┌──────────▼─────────┐
│  LIFE PILLARS  │            │  CRAFT            │          │  DELIVERY /        │
│                │            │                   │          │  OPPORTUNITY       │
│ Fitness        │            │ RoadmapPhase      │          │ Project            │
│ Health         │            │  └ RoadmapItem    │          │  └ ProjectMilestone│
│ Finance        │            │     └ UserProgress│          │ ProjectIdea        │
│                │            │                   │          │ JobApplication     │
│  ┌──────────┐  │            │ DSAQuestion       │          │                    │
│  │  Metric  │  │            │  └ DailyDSASet    │          │                    │
│  │MetricEntry│ │            │  └ UserDSAProgress│          │                    │
│  │  Goal    │  │            │                   │          │                    │
│  └──────────┘  │            │                   │          │                    │
│  shared engine │            │                   │          │                    │
└────────────────┘            └───────────────────┘          └────────────────────┘
        │                               │                               │
        └───────────────────────────────┼───────────────────────────────┘
                                        │
                            ┌───────────▼───────────┐
                            │  TimeBlock            │
                            │  one row per          │
                            │  (day, category)      │
                            └───────────────────────┘
```

`TimeBlock` cuts across everything: it is how "where did my 1–2 hours actually
go" gets answered, and it is the only place the career pillars and the calendar
meet.

---

## 5. Architecture decision records

### ADR-1 — One shared time-series engine for the life pillars

**Context.** Fitness, health and finance all need named numbers recorded on
dates against targets. V1 gave two of them a text blob each and gave health
nothing.

**Decision.** Introduce `Metric` (the definition of a tracked number: key,
label, unit, direction, cadence, target) and `MetricEntry` (one dated value).
Both carry a `pillar` enum. All three life pillars are configurations of this
engine. One chart component, one entry form, one aggregation service serves all
three.

**Alternatives rejected.**
- *Three bespoke subsystems* (`FitnessLog`, `HealthLog`, `FinanceLog`) — roughly
  three times the code and three chart implementations to keep in sync, for no
  modelling benefit.
- *A fully generic EAV store across every pillar including career* — collapses
  roadmap items and job applications into untyped key-value rows and loses the
  type safety that makes the existing code pleasant to work in.

**Consequences.** Accepted cost: a metric's value is a `Float`, so anything
non-numeric (a mood word, a workout type) does not fit and must either become a
number or live in the entry's `note`. This is a deliberate narrowing — V2 tracks
what it can trend. Accepted benefit: adding a new tracked number later is a seed
row, not a migration.

### ADR-2 — Retire the `FitnessGoal` / `FinancialGoal` singletons in favour of `Goal`

**Context.** Both are one-row-per-user tables holding newline-separated text.

**Decision.** Add a `Goal` model (pillar, title, optional linked `metricId`,
target value, start/due dates, status). The migration parses each existing blob
line-by-line into individual `Goal` rows with `status = ACTIVE` and no target,
then drops the two singleton tables.

**Alternatives rejected.** *Keep the blobs alongside the new model* — guarantees
two sources of truth for "what am I aiming at" and they will diverge within a month.

**Consequences.** The migration is lossy in one direction: a line like "Increase
monthly savings by 10%" becomes a titled goal with no machine-readable target.
That is acceptable — the user re-attaches targets through the UI once, and the
migration must not attempt to parse intent out of prose.

### ADR-3 — Health and Fitness are separate pillars over one engine

**Context.** They are related but not the same: training load is something you
do, sleep and weight are something that happens to you, and conflating them
makes the dashboard incoherent.

**Decision.** `PillarType.FITNESS` and `PillarType.HEALTH` are distinct values.
They share the engine from ADR-1 and appear as separate pages and separate
dashboard cards.

**Consequences.** Two nav items instead of one. Worth it — the weekly review can
say "training held, sleep collapsed", which is the observation that actually
changes behaviour.

### ADR-4 — Day boundaries are computed in the user's timezone

**Context.** V1's `new Date(); setHours(0,0,0,0)` is server-local, i.e. UTC in
Docker. For IST this is wrong by 5h30m every day: between 00:00 and 05:30 IST
the app believes it is still yesterday.

**Decision.** A single helper `startOfUserDay(date, tz)` in
`server/src/utils/time.ts`, driven by `USER_TIMEZONE` (default `Asia/Kolkata`).
Every service that resolves "today" or a date range calls it. No service
constructs a day boundary inline.

**Alternatives rejected.** *Set `TZ=Asia/Kolkata` on the container* — fixes the
symptom, hides the bug, and breaks the moment the app has a second user in a
second timezone. It also makes the fault invisible to tests.

**Consequences.** This is a behaviour change on existing data: some historical
`DailyTimeLog` and `DailyDSASet` rows are stamped to the wrong date. V2 does not
attempt to rewrite history — the fix applies going forward and the discontinuity
is noted in `docs/PROGRESS.md`.

### ADR-5 — `DailyTimeLog` generalises into `TimeBlock`

**Context.** Two hardcoded float columns (`dsaHours`, `devAiHours`) cannot
represent system-design study, AI-engineering work, or LoveTeddy build time
separately — which is exactly what V2 needs to measure.

**Decision.** `TimeBlock { userId, date, category: TimeCategory, hours, note }`,
unique on `(userId, date, category)`. `TimeCategory` covers `DSA`,
`SYSTEM_DESIGN`, `AI_ENGINEERING`, `PROJECT_BUILD`, `JOB_SEARCH`, `FITNESS`,
`OTHER`. The migration expands each `DailyTimeLog` row into up to two
`TimeBlock` rows (`DSA`, `AI_ENGINEERING`), carrying the matching worklog text
into `note`, then drops `DailyTimeLog`.

**Consequences.** Existing analytics queries that read `log.dsaHours` must be
rewritten as grouped aggregations. This is contained to
`analytics.service.ts` and `dailyTimeLog.service.ts`.

### ADR-6 — Learning tracks reuse `Roadmap`; projects are tracked at outcome level

**Context.** Two temptations: build a bespoke "courses" subsystem for system
design, and mirror LoveTeddy's task list inside the tracker.

**Decision.** (a) System design and AI engineering are seeded as
`RoadmapPhase` / `RoadmapItem` rows. `PhaseType` gains `DESIGN`; `BadgeType`
gains `DESIGN` and `THEORY`. No new learning models. (b) A new `Project` /
`ProjectMilestone` pair tracks LoveTeddy at the level of shipped milestones,
hours and status, with `repoUrl` / `liveUrl` links out.

**Rationale for (b).** LoveTeddy already has `docs/BRAIN.md`,
`docs/PROJECT_PROGRESS.md`, `docs/DECISIONS.md` and per-feature docs. Duplicating
that here would create a second, immediately-stale copy. The tracker's job is to
answer "did I ship, and what did it cost me", not to be a second issue tracker.

**Consequences.** Milestones are entered manually. Accepted — the entry cost is
minutes per week and the alternative is a sync problem.

### ADR-7 — Targets are configuration, not constants

**Context.** `dsa.service.ts` hardcodes `slice(0, 3)`. `LearningTarget` holds
three free-text fields that nothing reads programmatically.

**Decision.** `LearningTarget` becomes structured and numeric:
`dailyDsaTarget: Int`, plus weekly hour targets per `TimeCategory`.
`getTodaySet()` reads `dailyDsaTarget`. Per `docs/cadence.md` the seeded default
is **1**, not 3.

**Consequences.** The three free-text columns are dropped; their content moves
into `Goal` rows for the CRAFT pillar via the same migration as ADR-2.

### ADR-8 — Per-pillar analytics plus a composite weekly review

**Context.** One `getOverview()` returns a fixed shape. Adding six pillars to it
produces an unmaintainable god-endpoint.

**Decision.** `GET /api/analytics/pillar/:pillar` returns a uniform rollup for
any pillar. `GET /api/analytics/week?weekOf=` returns the composite weekly
review. `GET /api/analytics/overview` is kept, reimplemented on top of the new
sources, so the existing dashboard keeps working during the migration.

**Consequences.** More endpoints, each small and independently testable.

### ADR-9 — Multi-tenant-ready seams, no tenancy machinery

**Context.** V3/V4 may become a product. Building tenancy now is waste; building
something that *forbids* tenancy later is worse.

**Decision.** Every new table carries `userId` and every query filters on it —
including ones where it is currently redundant. No table may hold a row that
belongs to "the app" rather than to a user. `DSAQuestion` and `RoadmapPhase`
remain deliberately global as shared catalogue content; that is the only
exception and it is the correct one, since catalogue rows are shared *by design*.

**Consequences.** Some redundant `where: { userId }` clauses today. That is the
cheapest insurance in the plan.

### ADR-10 — Tests arrive in Milestone 0, before any feature work

**Context.** Zero tests, and V2 performs three destructive data migrations
(ADR-2, ADR-5, ADR-7). Migrating live personal data with no test safety net is
how you lose a year of history.

**Decision.** M0 stands up vitest + supertest against a dedicated
`DATABASE_URL_TEST`, with the migration paths themselves under test using
fixtures that reproduce the current production shape. No Milestone A work starts
until M0 is green.

**Consequences.** M0 delivers no visible feature. That is the correct trade and
it is not negotiable.

### ADR-11 — Documentation is part of the Definition of Done

**Context.** TrustDesk and LoveTeddy both carry disciplined docs. This repo has
none, and its whole purpose is making progress legible.

**Decision.** The four-part completion rule in `CLAUDE.md` §Documentation:
tests green, `PROGRESS.md` updated, ADR written if a decision was made, feature
doc created or amended. A milestone claimed complete without all four is
reopened.

### ADR-12 — Curriculum markdown is the source of truth; the database is a projection

**Context.** V1's syllabus lives inside `seed.js` as a JavaScript array, which
makes it invisible to review and awkward to edit.

**Decision.** `docs/curriculum/*.md` hold the syllabus in tables. Seed scripts
parse those tables. Changing the syllabus means editing markdown and re-seeding;
the seed is idempotent and keyed on item title within a phase.

**Consequences.** A parsing step in the seed script, and a format contract for
the tables (`docs/LLD_v2.md` §6). In exchange the syllabus is reviewable in a
diff and readable without running anything.

**Interaction with `BootstrapService` (finding 9).** The existing
`count() === 0` guard must become a content check — seed when the parsed
curriculum differs from what is stored, not when the table is empty. Otherwise
every future curriculum edit silently fails to apply on a database that already
has phases, which is every database except a brand-new one. Keep the seed
idempotent and safe to run on every boot; that is what makes the guard
unnecessary rather than merely relaxed.

---

## 6. Milestone map

| Milestone | Theme | Ships |
|---|---|---|
| **M0** | Foundation | Test harness, timezone helper, docs scaffolding, `.env.example`. No user-visible change. |
| **A** | Life pillars real | `Metric` / `MetricEntry` / `Goal` engine, Fitness + Health + Finance pages with charts, `TimeBlock`, per-pillar analytics, Weekly Review. |
| **B** | Career pillars | System-design and AI-engineering tracks seeded, structured `LearningTarget`, DSA target calibration, `Project` / `ProjectMilestone` with LoveTeddy loaded, Craft dashboard. |

Detailed ordered steps with acceptance criteria: `docs/LLD_v2.md` §7.

---

## 7. Risks

| Risk | Severity | Mitigation |
|---|---|---|
| Destructive migrations lose real personal history | High | ADR-10 — migrations under test before they run; take a `pg_dump` first (M0-5) |
| Scope creep into integrations or LLM features | High | NG2 and NG4 are explicit; reject at review |
| The app becomes another thing to maintain instead of a thing that helps | High | `docs/cadence.md` caps entry effort at ~5 min/day; if a pillar costs more than it returns, cut it in V3 rather than automate it |
| Six pillars produce a dashboard nobody reads | Medium | Weekly Review is the primary surface, not the dashboard |
| Timezone fix creates a visible discontinuity in old charts | Low | Documented in `PROGRESS.md`; no retroactive rewrite (ADR-4) |

---

## 8. Toward V3

Not committed, recorded so V2 does not accidentally block it. Multi-user
onboarding, integrations (health devices, account aggregators), an LLM weekly-review
narrator, and a public shareable progress page. ADR-9 keeps the first open; NG2
and NG4 keep the rest out of V2's way.
