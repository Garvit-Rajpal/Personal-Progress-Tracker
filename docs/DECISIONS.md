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

| ADR | Title | Status |
|---|---|---|
| ADR-13 | App, Prisma client and entrypoint are three modules | accepted |
| ADR-14 | The response envelope is adopted per route family | accepted |
| ADR-15 | DSA catalogue natural key; seeds stop deleting | accepted |
| ADR-16 | Design tokens are the only source of colour; the client is theme-dual | accepted |
| ADR-17 | Item resources: markdown source, generated client module, DB at MB-4 | accepted |

---

### ADR-13 — The express app, the Prisma client and the process entrypoint are three modules
**Date:** 2026-08-26  **Status:** accepted

**Context.** V1 put everything in `server/src/index.ts`: it constructed and
exported the `PrismaClient`, built the express app, and called `start()` at
module scope. All thirteen services did `import { prisma } from '../index'`.

The consequence only becomes visible when you try to write the first test.
Importing *any* service evaluates `index.ts`, which runs `start()`, which calls
`BootstrapService.ensureSeedData()` (shelling out to two seed scripts) and then
binds port 5000. A unit test for `dsa.service.ts` would seed a database and
start a server as a side effect of an import. Two test files would collide on
the port. This is not a style problem — it makes ADR-10's entire premise
unreachable, and M0-1 and M0-6 cannot be done without addressing it.

The `PrismaClient` placement has a second, subtler cost: the client reads
`DATABASE_URL` once, at construction. With construction happening inside the
entrypoint's module body, there is no point at which a test can redirect it to
`DATABASE_URL_TEST` before it is fixed.

**Decision.** Split into three modules with one responsibility each:

- `src/lib/prisma.ts` — constructs and exports the single `PrismaClient`.
  Importable with no side effect beyond opening a lazy connection pool.
- `src/app.ts` — builds the express app: middleware, routes, error handling.
  No `listen()`, no seeding. This is what supertest imports.
- `src/index.ts` — loads env, runs the bootstrap seed, listens.

All thirteen services now import `prisma` from `../lib/prisma`. `CLAUDE.md`
invariant 2 is unchanged and still holds: only `src/services/**` may import it.

**Alternatives rejected.**

- *Guard the entrypoint with `if (require.main === module)`.* One line, and it
  stops the listener. It does not stop `PrismaClient` being constructed before
  `tests/setupEnv.ts` can redirect it, and it leaves `index.ts` importing every
  route module just to hand a service its database handle. It treats the
  symptom while leaving the layering inverted.
- *Inject the client into each service.* Genuinely better for testing in the
  abstract, and genuinely a rewrite of all thirteen services plus every
  controller, in a milestone whose whole point is to add a safety net *before*
  changing behaviour. Deferred; the seam this ADR creates does not block it.
- *Mock Prisma in tests.* Explicitly rejected by `docs/LLD_v2.md` §1 ("never
  mock Prisma"), and rightly — the risk in V2 is what the *database* does
  during three destructive migrations, which a mock cannot tell you.

**Consequences.** One extra import hop, and an entrypoint that no longer shows
the whole app on one screen. `src/index.ts` is now three lines of interesting
code, which reads as thin until you need to add anything to startup.

The real cost is a second place where startup order matters: `dotenv.config()`
must run in `index.ts` *before* `./app` is imported, because route modules
transitively construct the Prisma client. That ordering is load-bearing and
invisible — it is a plain import that must not be sorted. It is commented at
the site.

The benefit is the one M0 exists for: `tests/setupEnv.ts` can rewrite
`DATABASE_URL` before anything reads it, so the test-database guard is
structural rather than a convention people remember.

### ADR-14 — The response envelope is adopted per route family, not all at once
**Date:** 2026-08-26  **Status:** accepted

**Context.** `docs/LLD_v2.md` §4 specifies `{ data }` on success and
`{ error: { code, message, details } }` on failure. V1 has neither: controllers
call `res.json(result)` with the bare payload and `res.status(4xx).json({ error:
someMessage })` on failure, across twelve route families. Every client hook
reads the bare shape.

M0-4's acceptance criterion is "integration tests assert both shapes on one
existing route", which leaves the blast radius as an open question: convert
everything now, or convert incrementally.

**Decision.** Build the envelope machinery once and adopt it per route family
as each domain is touched. M0-4 converts `/api/auth` end to end — routes,
controller, service errors, and the two client call sites — plus the
`authenticate` middleware, since its 401 is shared by every protected route.
The remaining eleven families keep V1's bare shape until the milestone that
rebuilds them (`/api/metrics` and `/api/goals` are born converted in MA-5;
`/api/daily-time-logs` converts when it becomes `/api/time-blocks` in MA-11).

Auth is the family M0-4 converts because it is the only one that exercises
validation, a unique-constraint conflict and a 401 in a single surface, and the
only one whose response fields the client reads by name — so converting it
proves the whole contract including the client half.

Two shapes therefore coexist during Milestone A and part of B. The client's
`getErrorMessage` handles both, so a route's conversion is invisible to the
pages calling it.

**Alternatives rejected.**

- *Convert all twelve families in M0-4.* Touches every controller and every
  client hook in the milestone that is supposed to be building the safety net,
  not spending it. M0-6's service tests would not yet exist to catch a mistake,
  and half the endpoints are being rewritten in A and B anyway — the work would
  be done twice.
- *Wrap responses in middleware so no controller changes.* Attractive, and
  wrong: it cannot distinguish a payload that is already an envelope from one
  that is not, it silently wraps `/health` (which docker-compose reads), and it
  hides the contract in a place nobody reading a controller will look.
- *Version the API (`/api/v2/...`).* Real cost, no benefit — there is one
  client, deployed from the same repo, by one person.

**Consequences.** For the length of Milestone A, "what shape does this endpoint
return" has two answers, and the answer is whichever the route's own tests
assert. That is a genuine cost, paid to avoid a wide untested refactor.

The mitigation is that the cost is self-liquidating: every remaining family is
scheduled for conversion by MB-15, and `docs/features/foundation.md` carries
the list of what is still on the bare shape. `docs/LLD_v2.md` §8's Definition
of Done for V2 should be read as including "all route families on the
envelope" — if that list is not empty at MB-15, V2 is not done.

The password rule added with the auth schemas is a related but separate
narrowing worth recording: registration now requires 12 characters. This is a
single-user system with no MFA, no rate limiting and no lockout, holding a year
of private history behind one password, so length is most of the defence.
Existing accounts are unaffected — only registration validates — and login
deliberately does *not* apply the rule, both because an older password must
still work and because a length complaint on a login form is itself a
disclosure.

### ADR-15 — The DSA catalogue gets a natural key, and its seed stops deleting
**Date:** 2026-08-30  **Status:** accepted

**Context.** The repo shipped two DSA seeders and both were destructive.

`prisma/seed-dsa.js` was an eighteen-question sample — its own comment said
`// Sample subset of Striver's SDE Sheet to seed` — and it opened with
`prisma.dSAQuestion.deleteMany()`. `seed-191.js` loaded the real 191-question
sheet but opened with `deleteMany()` on `userDSAProgress`, `dailyDSASet` *and*
`dSAQuestion`, then fabricated progress with
`insertedQuestions.slice(0, 140).map(... solved: true ...)`.

`BootstrapService.ensureSeedData()` called the **sample**, on every boot,
whenever `DSAQuestion.count() === 0`. It never called the real one.

Because `UserDSAProgress.questionId` is `onDelete: Cascade`, deleting the
catalogue silently deletes the user's solved history. This is not hypothetical:
the dev database was found holding 18 questions across 3 topics and **zero**
progress rows, having previously held the full sheet. The owner believed roughly
144 questions were marked solved.

Two distinct faults, worth separating:

1. **Data loss.** A seed that deletes what it is about to recreate destroys
   everything that references it. `CLAUDE.md` invariant 7 already said "seed
   scripts are idempotent" — it was stated and not enforced, which is the same
   as not stated.
2. **Fabrication.** The 140 solved flags were never a record of anything. They
   were the first 140 rows in insertion order, written with
   `solvedAt: new Date()` and displayed to the user as their own progress. A
   tracker whose entire purpose is making real progress legible cannot invent
   the number it reports.

**Decision.** Three parts.

- **Give `DSAQuestion` its natural key.** `@@unique([topic, title])`, migration
  `20260830150000_dsa_question_natural_key`. This is what makes an upsert
  possible; without it the seeders had no key and delete-and-recreate was the
  path of least resistance.
- **Replace both scripts with `src/services/dsaSeed.service.ts`.** It upserts on
  `(topic, title)`, updates changed rows *in place* by id so identity survives,
  and deletes nothing — including rows in the database but absent from the
  sheet, which are far more likely to be a sheet revision than something worth
  destroying a user's notes over. `prisma/seed-dsa.js` is deleted; `seed-191.js`
  becomes a thin CLI wrapper.
- **No seeder writes `UserDSAProgress`, ever.** Solved state is entered through
  the app. A guard test fails if any seed file calls `create`/`createMany`/
  `upsert`/`updateMany` on that table.

`BootstrapService` now runs the DSA seed unguarded on every boot, because a seed
that cannot destroy anything does not need a guard. That is the shape HLD_v2
§1.2 finding 9 asks for — "keep the seed idempotent and safe to run on every
boot; that is what makes the guard unnecessary rather than merely relaxed" —
applied to the DSA half only.

**This is MB-2 work done out of order, and that is a deliberate deviation.**
`docs/LLD_v2.md` §7 puts it after all of Milestone A. Three reasons it could not
wait: the bug is live and had already destroyed data; the owner reported it
directly and asked for the state to be made durable; and every day it stays
unfixed is another chance for an empty table at boot to replace the sheet again.
MB-2's actual scope — the curriculum markdown parser and the *roadmap* seed — is
untouched and still owed. `bootstrap.service.ts` carries a comment saying so.

**Alternatives rejected.**

- *Just re-run `seed-191.js` and move on.* Restores the questions and leaves
  every landmine armed. It would also have written 140 false solved flags,
  which is the fault this ADR exists to remove.
- *Drop the cascade on `UserDSAProgress.questionId`.* Would orphan progress rows
  pointing at deleted questions, trading data loss for data corruption. The
  cascade is correct; deleting the catalogue is what is wrong.
- *Do the whole of MB-2 now.* The curriculum parser is a genuinely separate
  piece of work with its own format contract (LLD_v2 §6) and its own
  idempotency test. Pulling all of it forward would be a much larger reordering
  than the bug justifies.
- *Wait for MB-2 as the plan says.* Correct process, wrong outcome. Leaving a
  known data-destroying seed in place through all twelve steps of Milestone A,
  on a repo whose owner has already lost history to it once, is not a defensible
  reading of "the order is strict".

**Consequences.** The milestone order now has a documented exception, and MB-2
is smaller than the plan says — a future reader of `docs/LLD_v2.md` §7 will find
part of MB-2 already done and must read this ADR to understand why.

The roadmap seed is deliberately still broken. `prisma/seed.js` still opens with
`Clearing existing roadmap data...` and still cascades `UserProgress` away, and
`BootstrapService` still guards it on `count() === 0` and still shells out via
`execFileSync`. Fixing it needs the curriculum parser that does not exist yet.
Until MB-2 lands, **do not run `prisma/seed.js` against a database with roadmap
progress in it** — the failure mode is pinned by a test in
`tests/service/roadmap.service.test.ts`, so it is documented rather than merely
known.

The unique index is also a real constraint on the sheet: two questions sharing a
topic and title can no longer both exist. The current 191 have no such
collision, and if a future sheet revision does, that is a fact worth being
forced to notice.

And the honest cost to the owner: the 144 solved questions are not recoverable
from anything in this repo. They were never stored here as fact. They have to be
re-entered once, and after that they are safe.

---

### ADR-16 — Design tokens are the only source of colour, and the client is theme-dual

**Date:** 2026-08-30  **Status:** accepted

**Context.** `CLAUDE.md` §Stack said "Dark theme." and the client was built to
match — but not through the theme layer. `layout.tsx` hardcoded
`<html className="dark">`, `(dashboard)/layout.tsx` set
`bg-neutral-900 text-white` directly over `--background`, and the shadcn token
block defined a full light palette that nothing could ever reach.

The measurable state: `dark:` appeared **7 times** across the whole client,
against **547 hardcoded colour literals in 25 files**. The `ui/` primitives were
themselves dark-only — `Card` hardcoded `bg-neutral-900/80` and `text-white/90`.
Three separate visual languages had accumulated: a glass landing page, a
dashboard hero block copy-pasted into seven files, and `/roadmap` and `/dsa`,
which injected `<style dangerouslySetInnerHTML>` blocks containing a Google
Fonts `@import` and `body { background-color:#0a0a0f !important }`.

So "add a light mode" was not a switch that existed and was turned off. There
was no system to switch. Neither `docs/HLD_v2.md` nor `docs/LLD_v2.md` says
anything about theming, visual design or the design system — it is the one
surface V2 planned structurally (LLD §5 names hooks, components and routes) and
never planned visually.

**Decision.** Three things, together, because none of them works alone.

1. **Tokens are the only source of colour.** No raw literal may appear in
   `client/src/` outside `globals.css`. `client/scripts/check-tokens.mjs`
   fails the build if one does — the same guard shape as
   `tests/unit/noInlineDayBoundaries.test.ts`, which is what keeps ADR-4 true
   after M0 closed. Every value is fixed in `docs/design.md`, which is to
   colour what `docs/cadence.md` is to numbers: if the code disagrees with the
   document, the code is wrong.
2. **The client is theme-dual**, defaulting to the OS, with a Light / Dark /
   System toggle persisted under `ppt-theme`. This supersedes "Dark theme." in
   `CLAUDE.md` §Stack, which has been amended to point here.
3. **Chromatic tokens are declared twice**, once per theme. A hue that reaches
   4.5:1 against white is unreadable on a near-black canvas, so `--primary`,
   the six `--pillar-*` tokens and the status tokens all shift lightness
   between themes. Only the neutrals mirror.

The theme is resolved by an inline, synchronous script in `<head>` that sets
`.dark` before first paint.

**Alternatives rejected.**

*Adopt `next-themes`.* It is the obvious choice and it was declined. What it
provides is a `localStorage` read, a `matchMedia` listener and a blocking
script — about fifteen lines, all of which this repo now owns and can read. The
project's purpose is to be a codebase its owner learns from, and a dependency
whose whole job is a mechanism worth understanding is a poor trade here. It
would also have added a package for a problem that was never the hard part; the
hard part was the 547 literals, which no library removes.

*Keep dark-only and just make it prettier.* Cheaper, and it was the literal
request's minimum. Rejected because the symptom ("looks basic and very dark")
and the cause (no working token layer) are different problems, and repainting
25 files with a nicer set of hardcoded greys would leave the next change exactly
as expensive as this one.

*Migrate the shell and dashboard now, the rest later.* Rejected because a
half-themed app is worse than an unthemed one: the toggle would visibly break
`/roadmap` and `/dsa`, which are the two pages that most needed it. The two
injected `!important` body colours in particular are all-or-nothing — they
defeat the theme globally, from any route, for as long as they exist.

*Automate the literal migration with codemods.* The mapping is semantic, not
mechanical: `text-neutral-500` is `--muted-foreground` in one place and
`--border` in another. A codemod would have produced a uniform, wrong answer
quickly.

**Consequences.**

The cost is a 547-literal migration touching 25 files, and every future page
must now pass the token guard — a real constraint on anyone adding a page in a
hurry, and the point.

Three pages (`/fitness`, `/financial-goals`, `/daily-time`) were re-tokenized
but not redesigned, because MA-8, MA-10 and MA-11 rebuild them on the metric
engine. That work is deliberately shallow and will be thrown away.

The dashboard shows **no target denominators**. `LearningTarget.*` is a
free-text `String` and `CLAUDE.md` invariant 4 forbids substituting a hardcoded
number, so hours render as absolute values. `StatCard` already accepts an
optional `target`; MA-6 makes targets numeric and fills it in.

`client/src/lib/cadence.ts` now holds the 5-of-7 week rule client-side. That is
a duplication of `docs/cadence.md` §6 in a second place, accepted so the
dashboard can show week completion before MA-12 ships the endpoint that should
own it. The module is marked for deletion at MA-12.

The token guard is a lint check, not a test suite. It does not reopen the "no
client tests" decision in `CLAUDE.md` §Stack — there is still no client test
runner, and the risk this catches is not behavioural.

Finally, this milestone was inserted ahead of MA-1 at the owner's direction. It
touches only `client/`, adds no table, column or migration, and leaves the
server suite untouched — so it delays Milestone A without reordering it.

---

### ADR-17 — Item resources are a curriculum-notes layer, projected into the database at MB-4

**Date:** 2026-09-03  **Status:** accepted

**Context.** The roadmap tells you *what* to learn and nothing about *where*.
`RoadmapPhase.resources` exists but is a single comma-separated string rendered
as one flat line per phase — `"LangChain docs, LlamaIndex docs, Pinecone /
Qdrant docs, Greg Kamradt on YouTube"` covers six items at once and links to
none of them. `RoadmapItem` has `title`, `description`, `badge`, `order` and no
resource field at all.

That is a real gap against `docs/cadence.md`. The budget is 1–2 h/day, and the
document is explicit that the plan must survive bad days. On a bad day the
difference between an item you can touch and an item you skip is whether there
is a fifteen-minute link attached to it. Phase-level resources cannot provide
that, because they do not tell you which of six links belongs to tonight's item.

Three constraints shaped the answer:

1. **Invariant 8** — curriculum lives in markdown; the database is a projection.
   Resources are curriculum content, so they cannot originate in a seed script
   or be typed into the UI.
2. **`curriculumFormat.test.ts` asserts the exact file list** of
   `docs/curriculum/` — `['ai-engineering.md', 'system-design.md']`. A seventh
   top-level curriculum file breaks the suite, and rightly: the file list is
   part of the seed contract.
3. **Milestone order is strict.** A `RoadmapItem` column is a migration, which
   is Milestone B. The next step is MA-1.

**Decision.** Split the work across the boundary the constraints already draw.

1. **Resources are authored as markdown in `docs/curriculum/notes/`.**
   A subdirectory, not a file: `fs.readdirSync` is not recursive and the list is
   filtered to `.md`, so `notes/` sits inside `docs/curriculum/` without
   touching the asserted file list. Invariant 8 is satisfied — the markdown is
   the source of truth — and no schema, seed or server test changes.

1b. **A generator projects that markdown into the client, so it is usable now.**
   `client/scripts/build-roadmap-resources.mjs` parses the blocks into
   `client/src/lib/roadmapResources.generated.ts`, which `ItemResources.tsx`
   renders under each roadmap item. This is **the same trade `client/src/lib/
   cadence.ts` already makes** — a client module duplicating a docs file until
   the endpoint that should own it ships, and marked for deletion when it does.
   Client-only, like Milestone D0: no table, no column, no migration, no server
   file, so the 292-test suite is untouched and the milestone order holds.
   `npm run check:resources` fails the build if the generated module is stale,
   the same guard shape as `check:tokens`.

1c. **Every item carries inline revision content, not just links.** Each block
   has a `Revise:` list of short bullets that render in the panel itself. This
   is the part that makes the layer worth having: `docs/cadence.md` designs for
   the day with fifteen minutes, and on that day a link to full documentation is
   not a resource. Bullets must be *content* — "fixed → recursive → semantic, in
   rising cost" — never a description of content.
2. **Blocks are keyed `Phase title :: Item title`**, matching exactly the
   `(phaseId, title)` pair the MB-2 seed upserts on (`docs/LLD_v2.md` §6). The
   key is the join. Keys are copied from `server/prisma/seed.js`, never retyped.
3. **`docs/LLD_v2.md` §6's table gains an optional fourth column at MB-2**, and
   `RoadmapItem` gains a nullable `resources Json?` at MB-1. Nullable and
   optional, so every existing curriculum table stays valid unchanged and the
   parser needs no version flag.
4. **Every link is opened before it is written down, and every video duration is
   read from the video**, not estimated. Each file records the date it was last
   checked, and the generator refuses to emit a `video` link with no duration.
   Not a style preference — the checks kept finding real errors:

   - Three stale references in the first draft: LangGraph's docs host moved, the
     OWASP LLM Top 10 migrated to the GenAI Security Project and shipped a 2026
     edition, and the Vercel AI SDK's `useChat` tool-call shape changed in v5.
   - One **dead link** — a Jason Liu talk that no longer resolves.
   - "Hamel on LLM as a Judge" is a **1m21s clip**, described in the first draft
     as a ~45-minute talk. A resource list that misstates length is worse than
     no list: it is the specific failure that makes someone stop opening it.
   - 3Blue1Brown **retitled** chapter 5.
   - The Matt Pocock generics video is 2m17s, not the ~12 minutes estimated.

   Durations render in the app, and anything ≥30 minutes is styled as muted and
   marked `(long)` so a bad-day click is never a surprise.

**Alternatives rejected.**

*Put the links in `RoadmapItem.description`.* Free — no migration, no parser
change, visible immediately. Rejected because the description is prose rendered
in a small muted line under the title, and stuffing four URLs into it makes both
the title and the links unreadable. It also gives resources no independent
structure, so a "revise in 15 minutes" filter — the whole point, per
`docs/cadence.md` — becomes impossible.

*Extend `RoadmapPhase.resources` and leave items alone.* The cheapest option and
the one that changes nothing structurally. Rejected because phase granularity is
the actual defect. Six items sharing one resource string is why the current
field goes unread.

*Reuse `UserRoadmapLink`.* The table exists and already renders on `/roadmap`.
Rejected on invariant 1 and ADR-12: those rows are `userId`-scoped user data,
while curriculum resources are shared, seeded projections of markdown. Putting
syllabus content in a user-owned table would mean every future user re-entering
it by hand, and would make the markdown no longer the source of truth.

*Do the whole thing now — migration, parser, UI.* Rejected as a milestone-order
violation. The server half (column, seed, API) waits for MB-1/MB-2/MB-4. Only
the client half was built, which is precisely the D0 precedent: client-only, no
table, no column, no migration, no server file touched.

*Leave it as markdown only, and read it in an editor.* This was the first
attempt and it was **wrong**. Markdown in the repo is not somewhere you revise;
it is somewhere you archive. Links that are not clickable at the moment of use
are data about links, not links. The owner said so directly, and the correction
is the reason 1b and 1c exist. Worth recording because the failure is a general
one: a resource that is not *at the point of use* is not a resource, however
well written.

**Consequences.**

*The cost.* A generated module is duplicated state. `roadmapResources.generated.ts`
is ~700 lines that exist nowhere in the database, and an edit to the markdown
that is not followed by `npm run build:resources` ships stale content.
`check:resources` catches exactly that and must run in CI once CI exists — which
is itself an item on the roadmap, and currently the only thing enforcing it is
the same discipline that already fails to run `npm test` automatically.

*A second cost.* This creates a hand-maintained key. If MB-2 renames an item —
and §1 of `roadmap-optimisation.md` proposes retiring 13 of them — a resource
block silently orphans. **MB-2 must fail loudly on a resource key that matches
no item**, not skip it. Written here because that test is easy to omit and its
absence is invisible until someone notices a blank panel.

*What it makes harder.* `docs/curriculum/notes/` is prose the parser ignores, so
nothing enforces its shape the way `curriculumFormat.test.ts` enforces the
curriculum files. Until MB-2 reads it, its correctness rests on review alone.
That is accepted deliberately: adding a parser test for a format no code yet
consumes would fix the format before its consumer exists.

*What it buys.* The verification discipline in point 4 caught three stale links
in an afternoon, including one (`OWASP LLM Top 10`, cited three times without a
version in `ai-engineering.md`) that the curriculum file itself now gets wrong.
That is the argument for this layer being a repo artifact under review rather
than a private bookmarks folder.
