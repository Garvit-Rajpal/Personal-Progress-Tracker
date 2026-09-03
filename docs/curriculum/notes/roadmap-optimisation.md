# Roadmap optimisation — proposals

**Status: proposals. Nothing here has been applied.** Two reasons, both hard:

1. `server/prisma/seed.js` opens with `await prisma.roadmapPhase.deleteMany()`
   and `UserProgress` cascades from `RoadmapItem`. Editing and re-running it
   destroys completion history — the exact class of bug ADR-15 was written
   about, in the one table where it has not happened yet. `CLAUDE.md` says
   plainly: do not run it against a database with roadmap progress.
2. Rewriting the seeded syllabus **is MB-2's job**, and the milestone order is
   strict. Doing it here would be substituting my own plan for the one in
   `docs/LLD_v2.md`.

So this file is the input to MB-2/MB-4, written now while the analysis is fresh.
Each proposal says what it costs and what to do instead if it is rejected.

---

## The arithmetic first, because it changes what "optimise" means

Counted from the files on 2026-09-03:

| Source | Phases | Items |
|---|---|---|
| `server/prisma/seed.js` (live on `/roadmap` today) | 6 | 33 |
| `docs/curriculum/ai-engineering.md` (owed to MB-4) | 8 | 50 |
| `docs/curriculum/system-design.md` (owed to MB-3) | 7 | 51 |
| **Total once Milestone B closes** | **21** | **134** |

At `docs/cadence.md`'s baseline of one curriculum item per week, 134 items is
**about two and a half years.** The roadmap page will present it as one list
with a single "Overall progress" bar, currently reading `n / 134`.

That is the real optimisation problem. It is not that the topics are wrong —
they are mostly good. It is that the roadmap is on course to become a
134-item flat list whose progress bar moves 0.7% a week, which is the shape of
tracker people stop opening. Everything below serves that.

### A stale number in `docs/cadence.md`

`docs/cadence.md` §3 still reads:

| Track | Volume | At baseline pace | Elapsed |
|---|---|---|---|
| AI engineering | 37 items | 1/week | ~37 weeks |

`ai-engineering.md` has been 50 items since the 2026 revision. cadence.md's own
opening rule is that a number disagreeing with it means the *code* is wrong —
but here cadence.md is the stale party, and its §3 table also omits the 33 live
roadmap items entirely. Two consequences worth acting on:

- AI engineering is ~50 weeks, not ~37. It is now level with system design as
  the longest pole, not comfortably behind it.
- **Fix cadence.md §3 in the same pass as MB-4**, or the plan's headline
  arithmetic stays wrong in the one file that exists to keep it right.

---

## §1 — Item-level duplication between the V1 seed and the AI curriculum

**This is the finding with teeth.** MB-4's acceptance criterion in
`docs/LLD_v2.md` §7 is *"No duplicate items created against the V1 seed"*, and
`curriculumFormat.test.ts` enforces it — but **only at phase-title level**:

```
describe('phase titles do not collide with the V1 seed (MB-4)', ...)
```

There is no item-level guard, and the seed upserts on `(phaseId, title)`, so
items in *differently-named phases* never collide by construction. They will
simply both exist. At least **13 of the 24 AI-flavoured V1 items** have a
curriculum counterpart:

| V1 seed item | Curriculum counterpart | Overlap |
|---|---|---|
| Chunking strategies | Chunk boundary experiments, measured | Same topic; curriculum version demands a number |
| Embeddings & vector databases | Hybrid retrieval with reciprocal rank fusion | V1 lists "hybrid search (BM25 + vector)" as an aside |
| RAG evaluation | Faithfulness and groundedness scoring, + the whole *RAG — Evaluation and Operations* phase | V1 compresses 6 items into 1 |
| Build a RAG app | Upgrade TrustDesk retrieval, measured end to end | Same artifact, different framing |
| Tool / function calling design | Tool schema ergonomics | Near-identical |
| Memory systems | Memory architectures | **Near-identical, different word** |
| Agent reliability & evals | Trajectory evaluation; Layered guardrails for agentic output; Failure recovery | V1 compresses 3+ into 1 |
| Build an agent | Build one genuinely agentic system | Same |
| LLM observability & tracing | Tracing and debugging agent runs; OpenTelemetry GenAI conventions | Curriculum is strictly better |
| Cost & latency optimization | Cost and latency budgets; Model routing and tiering | Curriculum adds the budget discipline |
| Structured outputs & Zod validation | Structured output at scale | Curriculum is the production version |
| Agent architecture patterns | When not to build an agent; Explicit state machines; Multi-agent handoff | V1 compresses 3 into 1 |
| LangGraph stateful workflows | Checkpointing and resumability; Human-in-the-loop approval gates | Overlapping |

**What happens if nothing is done.** `/roadmap` shows *Memory systems* and
*Memory architectures* as two separate, separately-tickable rows. Progress
becomes uninterpretable — you cannot tell whether 60/134 means you have covered
60 topics or 45 topics twice.

**Proposal 1a — recommended.** Treat the V1 AI phases as **superseded** by the
curriculum rather than complementary. At MB-4, retire the 13 overlapping V1
items and keep the curriculum version, which is in every case the more specific
and more measurable of the pair. This is what `ai-engineering.md` already claims
is true when it says *"Every phase and item title here is deliberately distinct
so the seed cannot collide"* — that claim holds for phase titles and is
optimistic about items.

**Cost, stated honestly.** Retiring a V1 item means deleting a `RoadmapItem`,
which cascades its `UserProgress`. If any of the 13 is already ticked, that tick
is lost unless MB-2 migrates it onto the curriculum counterpart first. So this
needs a mapping table in the migration, not a `deleteMany`. **Check the ticked
set before doing it** — if none of the 13 is complete, the migration is trivial.

**Proposal 1b — if 1a is rejected.** Add an item-title collision test alongside
the existing phase-title one, so at minimum the overlap is *visible* and
deliberate rather than discovered on the page. This is cheap and should happen
regardless of whether 1a does.

---

## §2 — `LangChain / LlamaIndex` is the weakest item on the board

The item as written — *"Document loaders, retrievers, chains. Know the
abstractions"* — is 2023 framing. Against it:

- `ai-engineering.md` never makes a framework an item. Not once in 50.
- Anthropic's *Building effective agents* reports that the most successful
  implementations avoided complex frameworks in favour of composable patterns.
- LangChain's own docs moved hosts this year (`langchain-ai.github.io/langgraph`
  → `docs.langchain.com`), which is a fair proxy for how fast the surface moves
  relative to the concepts underneath.

**Proposal 2.** Keep the item, rewrite the description from *"know the
abstractions"* to a teardown: read one retriever's source, re-implement it in
~40 lines, and write down what the framework was buying. Same slot, same week,
and it survives the framework going out of fashion. `roadmap-resources.md`
already writes the item up this way.

Do **not** simply delete it — LangChain/LangGraph literacy is still a real
line on job postings, and TrustDesk does not currently demonstrate it.

---

## §3 — Two capstones ask you to rebuild what you already have

*Build a RAG app* (phase 3) and *Capstone: full AI-powered product* (phase 6)
both describe building, from scratch, something TrustDesk already is: pgvector
retrieval, zod-enforced structured output, layered guardrails, an eval harness
with permanent adversarial cases, model-tier adapters, 604 tests.

`ai-engineering.md` already saw this and made its capstone *"Upgrade TrustDesk
retrieval, measured end to end — the strongest possible interview artifact
because the baseline is yours."*

**Proposal 3.** Redefine both V1 capstones as upgrades to existing systems with
before-and-after numbers, rather than greenfield builds. This reclaims roughly
**six to eight weeks** at baseline pace — the largest single time saving
available anywhere in this analysis — and produces the stronger portfolio
artifact, because a measured delta on a system you own cannot be faked and a
weekend demo can.

The counter-argument, which is real: a from-scratch build teaches things an
upgrade does not, and there is value in having a second system. If that
argument wins, take it for **one** of the two, not both.

---

## §4 — What the live roadmap is missing, and why it is already handled

The three largest gaps in the 33 live items are context engineering, MCP, and
evaluation as a first-class discipline rather than one bullet. All three arrive
with MB-4 — `ai-engineering.md` has a 6-item *Context Engineering* phase, a
5-item MCP phase, and a 6-item evaluation phase.

**So the fix for §4 is to ship MB-3 and MB-4, not to edit anything.** Noted here
only so the gap is not "discovered" again later and patched into `seed.js`,
which would deepen the invariant-8 violation MB-2 exists to remove.

One thing genuinely absent from all 134 items and worth adding at MB-4:
**a CI pipeline for this repo.** `CLAUDE.md` requires `npm test` green before
any commit and there is no automation enforcing it — 292 tests protected by
memory alone. It belongs in *Production, Deployment & Job-Ready :: Docker +
CI/CD*, whose description currently stops at "GitHub Actions pipeline, deploy to
Railway or Fly.io" without naming this repo's own suite as the thing to run.

---

## §5 — Presentation, which may matter more than any content change

134 items behind one progress bar is the failure mode. MB-7 (*"`/roadmap` groups
and filters by track"*) is the planned fix and it is the right one. Three
additions worth folding into it:

1. **Default to the interview-critical subset.** Both curriculum files define
   one — 28 items for AI, 24 for design. Together with DSA that is a ~6-month
   plan that fits the stated goal, versus a 2.5-year plan that does not.
   Make the subset the default view and the full list the opt-in, rather than
   the reverse. This is a UI default, and it is the highest-leverage change in
   this document.
2. **Progress per track, not one global bar.** A 0.7%-a-week global bar is
   demotivating in a way that is purely an artifact of presentation.
   `docs/cadence.md` §6 already made this argument for the dashboard streak.
3. **Surface the resources.** Per ADR-17, `roadmap-resources.md` projects into
   `RoadmapItem.resources`. An item with a 15-minute revision link attached is
   an item that can be *touched* on a bad day, and `docs/cadence.md` is explicit
   that bad days are the design case.

---

## Summary — what to do, in order

| # | Proposal | When | Cost |
|---|---|---|---|
| 1b | Item-title collision test | MB-2, cheap, do regardless | ~20 lines of test |
| 1a | Retire the 13 overlapping V1 items, migrating any ticks | MB-4 | A mapping table in the migration |
| 3 | Redefine the two capstones as measured upgrades | MB-4 | None — saves 6–8 weeks |
| 2 | Rewrite the LangChain item as a teardown | MB-4 | None — description only |
| 5.1 | Default `/roadmap` to the interview-critical subset | MB-7 | A filter default |
| 5.2 | Per-track progress bars | MB-7 | Already in MB-7's scope |
| — | Fix `docs/cadence.md` §3 (37 → 50 items; add the live 33) | With MB-4 | Doc edit |
| — | Name this repo's own CI in the Docker + CI/CD item | MB-4 | Description only |

Nothing in this list is urgent enough to reorder a milestone. All of it is
cheaper to decide now than to discover on a 134-row page.
