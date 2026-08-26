# LLD v2 — Personal Progress Tracker

Implementation detail for `docs/HLD_v2.md`. ADR references point there.
§7 is the build order and is binding.

---

## 1. Test strategy

Introduced in M0 (ADR-10). Server first — that is where the destructive
migrations live.

| Layer | Tool | Scope | Rule |
|---|---|---|---|
| Unit | vitest | Pure functions: `startOfUserDay`, streak math, curriculum parser, blob→Goal parser, rollup aggregations | No database. Fast. The majority of tests. |
| Service | vitest | One service against `DATABASE_URL_TEST` | Truncate between tests; never mock Prisma |
| Integration | vitest + supertest | Route → controller → service → DB, including auth | Asserts the `{ data }` / `{ error }` envelope |
| Migration | vitest | Each destructive migration against a fixture reproducing current production shape | Mandatory for MA-4, MA-11, MB-5 |

Rules:
- `tests/setupEnv.ts` forces `DATABASE_URL = DATABASE_URL_TEST`. A test can never
  reach the dev database, by construction rather than by discipline.
- No `.only`, no skipped tests on a completed milestone.
- Every bug found after a milestone closes gets a failing regression test before
  the fix.

---

## 2. Schema deltas

Additive unless marked **DROP**. Full Prisma for the new surface:

```prisma
enum PillarType {
  FITNESS
  HEALTH
  FINANCE
  CRAFT
  DELIVERY
  OPPORTUNITY
}

enum MetricDirection {
  HIGHER_IS_BETTER
  LOWER_IS_BETTER
  TARGET_BAND
}

enum MetricCadence {
  DAILY
  WEEKLY
  MONTHLY
}

enum GoalStatus {
  ACTIVE
  ACHIEVED
  MISSED
  ARCHIVED
}

enum TimeCategory {
  DSA
  SYSTEM_DESIGN
  AI_ENGINEERING
  PROJECT_BUILD
  JOB_SEARCH
  FITNESS
  OTHER
}

enum ProjectStatus {
  IDEA
  BUILDING
  LIVE
  PAUSED
  ARCHIVED
}

enum MilestoneStatus {
  PLANNED
  IN_PROGRESS
  SHIPPED
  DROPPED
}

/// ADR-1. The definition of a tracked number. One row per thing measured.
model Metric {
  id          String          @id @default(uuid())
  userId      String
  pillar      PillarType
  key         String          // stable slug, e.g. "sleep_hours"
  label       String
  unit        String          // "kg", "hours", "steps", "INR", "%"
  direction   MetricDirection
  cadence     MetricCadence
  targetValue Float?
  targetMin   Float?          // TARGET_BAND only
  targetMax   Float?          // TARGET_BAND only
  active      Boolean         @default(true)
  sortOrder   Int             @default(0)
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt

  user    User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  entries MetricEntry[]
  goals   Goal[]

  @@unique([userId, key])
  @@index([userId, pillar, active])
}

/// ADR-1, invariant 3. Append-only: one value per metric per date.
model MetricEntry {
  id        String   @id @default(uuid())
  userId    String
  metricId  String
  date      DateTime @db.Date
  value     Float
  note      String?  @db.Text
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  metric Metric @relation(fields: [metricId], references: [id], onDelete: Cascade)

  @@unique([userId, metricId, date])
  @@index([userId, date])
}

/// ADR-2. Replaces FitnessGoal and FinancialGoal.
model Goal {
  id          String     @id @default(uuid())
  userId      String
  pillar      PillarType
  title       String
  description String?    @db.Text
  metricId    String?    // optional link to the number that proves it
  targetValue Float?
  startDate   DateTime?  @db.Date
  dueDate     DateTime?  @db.Date
  status      GoalStatus @default(ACTIVE)
  priority    Int        @default(0)
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  user   User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  metric Metric? @relation(fields: [metricId], references: [id], onDelete: SetNull)

  @@index([userId, pillar, status])
}

/// ADR-5. Replaces DailyTimeLog.
model TimeBlock {
  id        String       @id @default(uuid())
  userId    String
  date      DateTime     @db.Date
  category  TimeCategory
  hours     Float
  note      String?      @db.Text
  projectId String?      // MB-12
  createdAt DateTime     @default(now())
  updatedAt DateTime     @updatedAt

  user    User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  project Project? @relation(fields: [projectId], references: [id], onDelete: SetNull)

  @@unique([userId, date, category])
  @@index([userId, date])
}

/// ADR-6. Outcome-level tracking only. The project's own repo owns its docs.
model Project {
  id          String        @id @default(uuid())
  userId      String
  name        String
  summary     String?       @db.Text
  status      ProjectStatus @default(BUILDING)
  repoUrl     String?
  liveUrl     String?
  docsPath    String?       // e.g. "Work/LoveTeddy/love-teddy-backend/docs"
  startedAt   DateTime?     @db.Date
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  user       User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  milestones ProjectMilestone[]
  timeBlocks TimeBlock[]

  @@unique([userId, name])
}

model ProjectMilestone {
  id        String          @id @default(uuid())
  userId    String
  projectId String
  title     String
  status    MilestoneStatus @default(PLANNED)
  dueDate   DateTime?       @db.Date
  shippedAt DateTime?       @db.Date
  notes     String?         @db.Text
  sortOrder Int             @default(0)
  createdAt DateTime        @default(now())
  updatedAt DateTime        @updatedAt

  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@index([userId, projectId, status])
}
```

**Amendments to existing models**

```prisma
// ADR-6
enum PhaseType { FS  AI  BOTH  DESIGN }
enum BadgeType { CORE  AI  PROJECT  JOB  DESIGN  THEORY }

// ADR-7 — LearningTarget becomes numeric. Old free-text columns DROP.
model LearningTarget {
  id                    String @id @default(uuid())
  userId                String @unique
  dailyDsaTarget        Int    @default(1)   // cadence.md — NOT 3
  weeklyDsaHours        Float  @default(2.5)
  weeklySystemDesignHours Float @default(2.5)
  weeklyAiEngineeringHours Float @default(2.5)
  weeklyProjectBuildHours Float @default(2.0)
  // DROP: dailyDsaTarget:String, dailyWebDevAiTarget, weekendProjectBuildTarget
}
```

**Dropped:** `FitnessGoal`, `FinancialGoal` (MA-4), `DailyTimeLog` (MA-11), and
the three `LearningTarget` string columns (MB-5). Each drop happens only in the
migration that has first copied the data forward, and each has a migration test.

---

## 3. Migration order

| # | Migration | Destructive | Test required |
|---|---|---|---|
| 1 | `add_metric_engine` | no | service tests |
| 2 | `migrate_goal_blobs_and_drop_singletons` | **yes** | **MA-4** |
| 3 | `add_time_block_and_migrate_daily_time_log` | **yes** | **MA-11** |
| 4 | `extend_phase_and_badge_enums` | no | seed tests |
| 5 | `restructure_learning_target` | **yes** | **MB-5** |
| 6 | `add_project_and_milestones` | no | service tests |

Run `scripts/backup.sh` (M0-5) before any migration marked destructive.

---

## 4. API contracts

Envelope: `{ data }` / `{ error: { code, message, details } }`.
All routes below are behind `authenticate` and scoped to `req.user.id`.

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/metrics?pillar=` | list metric definitions |
| POST | `/api/metrics` | create metric |
| PATCH | `/api/metrics/:id` | update definition / deactivate |
| GET | `/api/metrics/:id/entries?from=&to=` | dated series |
| PUT | `/api/metrics/:id/entries/:date` | upsert one day's value |
| DELETE | `/api/metrics/:id/entries/:date` | remove one entry |
| GET | `/api/goals?pillar=&status=` | list goals |
| POST | `/api/goals` | create |
| PATCH | `/api/goals/:id` | update / change status |
| GET | `/api/time-blocks?from=&to=` | time blocks in range |
| PUT | `/api/time-blocks/:date/:category` | upsert hours for a day+category |
| GET | `/api/projects` | list with milestone counts |
| POST | `/api/projects` | create |
| PATCH | `/api/projects/:id` | update |
| POST | `/api/projects/:id/milestones` | add milestone |
| PATCH | `/api/projects/:id/milestones/:mid` | update / ship |
| POST | `/api/project-ideas/:id/graduate` | ProjectIdea → Project (MB-11) |
| GET | `/api/analytics/pillar/:pillar` | uniform pillar rollup |
| GET | `/api/analytics/week?weekOf=` | composite weekly review |
| GET | `/api/analytics/week/:weekOf/markdown` | review as markdown for `docs/reviews/` |
| GET | `/api/analytics/overview` | existing dashboard, reimplemented (ADR-8) |

**Error codes:** `VALIDATION_FAILED`, `NOT_FOUND`, `UNAUTHORIZED`, `FORBIDDEN`,
`CONFLICT` (unique violation, e.g. duplicate metric key), `IMMUTABLE_HISTORY`
(attempt to mutate an entry outside its own date), `INTERNAL`.

**Pillar rollup shape** — identical for every pillar so one component renders all six:

```ts
{
  pillar: PillarType,
  metrics: Array<{
    key, label, unit, direction,
    latest: { date, value } | null,
    target: number | null,
    series: Array<{ date, value }>,      // range-limited
    trend: { changePct: number | null, direction: 'up'|'down'|'flat' }
  }>,
  goals: { active: number, achieved: number, missed: number },
  hours: { thisWeek: number, lastWeek: number }
}
```

---

## 5. Frontend surface

New hooks in `client/src/hooks/`: `useMetrics.ts`, `useGoals.ts`,
`useTimeBlocks.ts`, `useProjects.ts`, `useWeeklyReview.ts`.
`useFitnessGoals.ts` and `useFinancialGoals.ts` are deleted in MA-8 / MA-10.
`useRoadmap.ts` already carries the roadmap-links query and mutation added in
the uncommitted July work — extend it in MB-7, do not rewrite it.

New shared components in `client/src/components/pillar/`:
`MetricChart.tsx` (Recharts line/bar, target reference line),
`MetricEntryForm.tsx` (one day, all of a pillar's metrics, keyboard-first),
`GoalCard.tsx`, `PillarSummary.tsx`, `TrendBadge.tsx`.

Pages: `/fitness` and `/financial-goals` rebuilt on the engine, `/health` added,
`/daily-time` rebuilt on `TimeBlock`, `/projects` added, `/weekly-review` added.
Sidebar gains **Health**, **Projects**, **Weekly Review** — three entries
alongside the existing ten (the `efab170` commit already added Fitness and
Financial Goals to the eight originally there).

Entry-cost constraint (`docs/cadence.md`): logging a full day across every pillar
must take under two minutes. `MetricEntryForm` therefore renders one pillar's
metrics as a single tab-navigable column with numeric inputs and no modal.

---

## 6. Seed contracts (ADR-12)

Curriculum files hold one table per phase, preceded by an H3 phase heading and a
metadata line. The parser in `server/prisma/seedCurriculum.js` reads exactly this
shape:

```
### Phase: <title>
Type: DESIGN | AI | FS | BOTH
Duration: <string>
Resources: <comma-separated>

| Item | Badge | Description |
|---|---|---|
| <title> | CORE\|AI\|PROJECT\|JOB\|DESIGN\|THEORY | <description> |
```

Idempotency: upsert `RoadmapPhase` on `title`, `RoadmapItem` on
`(phaseId, title)`. `order` is table position. Re-running never duplicates and
never destroys `UserProgress` — this is asserted by a test, because losing
completion history to a re-seed would be the worst possible bug in this repo.

`BootstrapService.ensureSeedData()` must call the curriculum seed on **every**
boot, not only when `roadmapPhase.count() === 0` (HLD_v2 §1.2 finding 9). The
current guard means an edited syllabus never reaches an existing database.
Removing the guard is only safe once the idempotency test above passes — do
these two in the same milestone, in that order. `BootstrapService` also shells
out via `execFileSync`, which blocks the event loop during startup; converting
the seed to a directly-imported function removes both the subprocess and the
`cwd` assumption.

---

## 7. Milestone order

Strict. A milestone is complete only under `CLAUDE.md`'s four-part rule.

### Milestone 0 — Foundation (no user-visible change)

| # | Step | Acceptance |
|---|---|---|
| M0-1 | vitest + supertest, `tests/setupEnv.ts` forcing `DATABASE_URL_TEST`, `npm test` scripts | Smoke test green; a test that tries to reach the dev DB fails loudly |
| M0-2 | `startOfUserDay` / `endOfUserDay` / `weekRange` in `src/utils/time.ts`; `USER_TIMEZONE` env; `.env.example` | Unit tests cover the 00:00–05:30 IST window that V1 gets wrong |
| M0-3 | Replace every inline day-boundary calc in `dsa.service.ts`, `dailyTimeLog.service.ts`, `analytics.service.ts` | No `setHours(0, 0, 0, 0)` remains in `src/`; grep asserted in a test |
| M0-4 | `{ data }` / `{ error }` envelope, error codes, zod validation middleware | Integration tests assert both shapes on one existing route |
| M0-5 | `scripts/backup.sh` (pg_dump), docs scaffolding: `PROGRESS.md`, `DECISIONS.md`, `features/`, `reviews/` | Backup runs and produces a restorable dump |
| M0-6 | Service-layer tests for the existing auth, dsa and roadmap services | The safety net that MA-4 / MA-11 / MB-5 will rely on exists |

### Milestone A — Life pillars become real

| # | Step | Acceptance |
|---|---|---|
| MA-1 | Enums + `Metric` / `MetricEntry` / `Goal` + migration 1 | `prisma migrate dev` clean; schema matches §2 |
| MA-2 | `metric.service.ts` + tests | Upsert-by-date works; duplicate `(userId, key)` returns `CONFLICT` |
| MA-3 | `goal.service.ts` + tests | Status transitions covered |
| MA-4 | **Destructive** migration 2: blobs → `Goal`, drop singletons | Migration test on a fixture with realistic blobs; every non-empty line becomes exactly one Goal |
| MA-5 | Metrics + Goals routes/controllers | Integration tests per §4 |
| MA-6 | Seed default metrics per pillar from `docs/cadence.md` §4 | Idempotent; re-run changes nothing |
| MA-7 | `useMetrics` / `useGoals` + shared pillar components | `MetricChart` renders a target reference line |
| MA-8 | `/fitness` rebuilt; delete `useFitnessGoals.ts` | Chart + entry form + goals; no text blob remains |
| MA-9 | `/health` new page + sidebar entry | Sleep, weight, energy metrics seeded and chartable |
| MA-10 | `/financial-goals` rebuilt; delete `useFinancialGoals.ts` | Savings rate, net worth, monthly burn |
| MA-11 | **Destructive** migration 3: `TimeBlock`; rebuild `/daily-time` | Migration test: each old row expands to ≤2 blocks, worklogs preserved in `note` |
| MA-12 | `/api/analytics/pillar/:pillar`, `/week`, `/week/:weekOf/markdown`; `/weekly-review` page | Markdown export writes a file matching `docs/reviews/` format |

### Milestone B — Career pillars

| # | Step | Acceptance |
|---|---|---|
| MB-1 | Extend `PhaseType` / `BadgeType`; migration 4 | Existing roadmap rows unaffected |
| MB-2 | `seedCurriculum.js` parser per §6; `BootstrapService` guard replaced by a content check and the subprocess removed | Re-seed test proves `UserProgress` survives; an edited syllabus applies on a non-empty database |
| MB-3 | Seed `docs/curriculum/system-design.md` | Phases appear on `/roadmap` under DESIGN |
| MB-4 | Seed `docs/curriculum/ai-engineering.md` (deepens existing AI phases) | No duplicate items created against the V1 seed |
| MB-5 | **Destructive** migration 5: structured `LearningTarget` | Old free-text values land in CRAFT `Goal` rows, nothing silently dropped |
| MB-6 | `dsa.service.getTodaySet()` reads `dailyDsaTarget` | `slice(0, 3)` is gone; test proves set size follows the configured target |
| MB-7 | `/roadmap` groups and filters by track | DESIGN / AI / FS tracks selectable |
| MB-8 | `Project` + `ProjectMilestone`; migration 6 | Schema matches §2 |
| MB-9 | `project.service.ts` + routes + tests | Milestone ship sets `shippedAt` via the timezone helper |
| MB-10 | `/projects` page; seed LoveTeddy with real repo/docs paths | Links out; no duplicated LoveTeddy task list (ADR-6) |
| MB-11 | `POST /project-ideas/:id/graduate` | Idea becomes Project, original marked graduated |
| MB-12 | `TimeBlock.projectId` wired into `/daily-time` | Hours attributable to a project |
| MB-13 | Craft dashboard card: DSA pace, design topics/week, AI-eng hours vs target | Reads only from analytics endpoints |
| MB-14 | Job pipeline analytics using `interviewStatus` / `ctc` | Funnel counts by stage |
| MB-15 | Weekly review covers all six pillars; full docs pass | `PROGRESS.md`, `DECISIONS.md` and every feature doc current |

---

## 8. Definition of done for V2

- All 33 steps green, full suite passing.
- No `setHours(0, 0, 0, 0)` and no hardcoded target anywhere in `src/`.
- `FitnessGoal`, `FinancialGoal`, `DailyTimeLog` gone; their data present in the
  new models.
- Six pillars render from one rollup shape.
- Four consecutive weekly reviews generated into `docs/reviews/` — the real test
  of whether this thing helps, and the input to the V3 decision.
