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
