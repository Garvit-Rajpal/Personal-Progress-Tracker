# Curriculum — AI Engineering (Context, Retrieval, Agents, Production Depth)

Source of truth for the advanced AI track (ADR-12). Parsed by
`server/prisma/seedCurriculum.js`.

_Revised 2026-08-30 against the current job market. See_ _"What the 2026 revision changed" below for what moved and why._

---

## Relationship to the V1 seed

`server/prisma/seed.js` already seeds six phases covering LLM fundamentals,
prompt engineering, RAG basics, agent basics with LangGraph, AI frontends, and
production readiness. **This file does not replace those.** Every phase and item
title here is deliberately distinct so the seed cannot collide (LLD_v2 MB-4).

The V1 phases teach the shape of RAG and agents. These phases teach the parts
that decide whether a RAG system or an agent is actually good — retrieval
quality, evaluation, and failure behaviour. That is the difference between
having built one and being able to be trusted with one.

## Where this starts from

TrustDesk already shipped, in production-grade form: a `ModelAdapter` with
mock/local/hosted tiers, layered guardrails that fail closed and preserve the
rejected draft on the trace, an eval runner with permanent adversarial cases
(eval_005/006/007), pgvector similarity ingestion, and zod-enforced structured
output. A `MockModelAdapter` means no test ever calls a live model.

That is a stronger starting point than most people have. It means the honest
gaps are narrower and more specific:

- **Context engineering.** The named discipline of 2026 and the one with no
  coverage at all in either repo. Deciding what enters the context window,
  what stays, what gets compacted and what gets dropped. Most agent failures
  are context failures, not model failures, and this is now what interview
  loops actually probe.
- **Retrieval quality.** pgvector similarity alone is the weakest usable
  retrieval. Hybrid search, reranking and query understanding are where the
  large gains live, and none of them are in the codebase yet.
- **Measurement.** The eval harness scores end-to-end outcomes. It does not
  isolate *retrieval* quality, so a retrieval regression is currently invisible
  until it changes an answer. "Eval literacy" is the phrase the market uses
  for this and it is priced accordingly.
- **Agent control.** TrustDesk's pipeline is deterministic code orchestrating
  model calls — a deliberately conservative design and the right one there. A
  genuinely agentic system with planning, tool loops and recovery is a different
  problem and has not been built.
- **Tool infrastructure.** MCP went from one interesting protocol to the
  default way tools and retrieval sources are wired to clients. Being an MCP
  *user* is now assumed; being able to build and secure a server is not.

## What the 2026 market is actually hiring for

Four shifts worth planning against, rather than a list of trendy words:

1. **The title "prompt engineer" is gone.** Postings now read AI engineer,
   applied AI engineer, agent engineer, and increasingly context engineer.
   Prompt craft is assumed and is not the skill being bought.
2. **Production over research.** Hiring shifted decisively toward people who
   can deploy, measure and operate AI systems rather than train models. The
   PhD filter has largely been replaced by a portfolio filter — which favours
   someone with two shipped repos and real numbers.
3. **Eval literacy is the priced skill.** Golden datasets, LLM-as-judge with a
   calibrated rubric, and regression gates in CI. It is what separates a demo
   from a product, and it is what a good interviewer digs into.
4. **Context engineering replaced prompt engineering as the hard part.**
   Retrieval design, state management, tool catalog design, context budgeting,
   and measuring whether a context change actually helped.

Note what this does *not* say: nothing here rewards knowing more model names.
Every one of those four is measurable engineering, which is the good news —
it is the kind of thing this track can actually produce evidence for.

**Pace.** ~2.5 h/week plus a weekend block (`docs/cadence.md`) — roughly one
item per week. This track is **50 items** — 46 weekly items plus 4 capstones
that run in parallel — so about **ten and a half months** at baseline pace. It
was 37 items and roughly eight months before the 2026 revision. Adding context
engineering and MCP made it longer, and rounding that away would be exactly the
dishonesty `docs/cadence.md` exists to prevent.

**The interview-critical subset, if time is short — and it will be.** Take three
whole phases and five named items:

| Take | Items |
|---|---|
| *Context Engineering* | 6 |
| *RAG — Retrieval Quality* | 8 |
| *Agents — Design and Control* | 9 |
| Faithfulness and groundedness scoring; A regression harness that runs in CI | 2 |
| Trajectory evaluation; LLM-as-judge with a real rubric; Adversarial and prompt-injection testing | 3 |
| **Subset total** | **28** |

That is about **six and a half months** at baseline pace, and it covers what
2026 loops actually test — the five named items are precisely what "eval
literacy" means in a job description. The remaining 22 items are depth you can
add while employed. Per `docs/cadence.md`, if something must give in a given
month, cut from this track before cutting DSA — but cut from the remaining 22,
never from the subset.

**The artifact rule.** Same as the design track. Every item produces running
code, a measured result, or a written finding. An item marked complete with
nothing to show for it is a lie to your own dashboard.

---

### Phase: Context Engineering
Type: AI
Duration: 6 weeks
Resources: Anthropic effective context engineering writeup, Anthropic Building effective agents, long-context degradation literature, your own TrustDesk traces

| Item | Badge | Description |
|---|---|---|
| Context budgeting as an explicit design step | AI | Decide what the token budget is spent on before writing the prompt: system rules, tools, retrieved documents, history, scratchpad. Write the budget down. Most teams discover theirs by accident after it breaks. |
| Compaction and summarisation strategies | AI | When to summarise history, what to keep verbatim, and what a lossy compaction costs you three turns later. Measure task success before and after rather than trusting that shorter is safe. |
| Progressive disclosure of tools | AI | A model given forty tools chooses worse than one given six. Load tool definitions by phase or by relevance and measure the selection accuracy change. Directly informs the MCP server work later. |
| Long-context degradation, measured | THEORY | Accuracy does not stay flat as the window fills, and the fall-off is not where intuition puts it. Run a needle-style probe on your own corpus and find where your own quality actually drops. |
| Conversation state: persist, drop, replay | AI | Which turns are durable state and which are transcript noise. Where this overlaps agent checkpointing and where it does not. |
| Context failure taxonomy | THEORY | Categorise failures as missing context, poisoned context, distracting context, or context the model saw and ignored. Each has a different fix, and conflating them is how teams tune prompts for weeks against a retrieval bug. |

### Phase: RAG — Retrieval Quality
Type: AI
Duration: 6 weeks
Resources: Anthropic contextual retrieval writeup, Jason Liu on RAG, pgvector docs, BM25 and reciprocal rank fusion literature

| Item | Badge | Description |
|---|---|---|
| Build a retrieval golden set first | AI | Fifty real queries with known-correct documents, before changing any retrieval code. Without this every later item is guesswork. Use TrustDesk's KB as the corpus. |
| Measure retrieval in isolation | AI | Recall at k, MRR, nDCG on the golden set. Establish the baseline number for the current pgvector similarity search. Everything after this is measured against it. |
| Hybrid retrieval with reciprocal rank fusion | AI | Combine BM25 or Postgres full-text with vector similarity. Usually the single largest quality jump available. Measure it against the baseline. |
| Cross-encoder reranking | AI | Retrieve wide, rerank narrow. Understand the latency and cost it adds and decide whether the measured gain justifies it. |
| Query understanding | AI | Rewriting, expansion, and decomposition of multi-part questions. Where retrieval fails for reasons that have nothing to do with the index. |
| Contextual chunk enrichment | AI | Prepend document-level context to each chunk before embedding. Measure against the plain-chunk baseline rather than assuming the improvement. |
| Metadata filtering and access-scoped retrieval | AI | Tenant-scoped, role-scoped and recency-scoped retrieval. In a multi-tenant system this is a correctness and security requirement, not a feature. |
| Retrieval failure taxonomy | THEORY | Categorise every miss in the golden set: absent from corpus, present but not retrieved, retrieved but not used, retrieved and misread. Each category has a different fix and conflating them wastes weeks. |

### Phase: RAG — Evaluation and Operations
Type: AI
Duration: 5 weeks
Resources: RAGAS docs, Chip Huyen AI Engineering, LangSmith or Helicone docs

| Item | Badge | Description |
|---|---|---|
| Faithfulness and groundedness scoring | AI | Detect answers unsupported by retrieved context. The failure mode users actually punish, and the one end-to-end scoring hides. |
| A regression harness that runs in CI | AI | Retrieval and answer quality checked on every change, the way TrustDesk's adversarial evals already are. Quality that is not in CI decays. |
| Incremental indexing and freshness | AI | Update and delete without a full re-index. Handling a document that changed after it was embedded. |
| Chunk boundary experiments, measured | AI | Fixed, recursive, semantic and document-aware chunking compared on your golden set. Report a number, not a preference. |
| Cost and latency budgets | AI | Cost per query and p95 latency as explicit budgets. Which quality gains are affordable and which are not. |
| Semantic and exact-match caching | AI | Cache at the embedding, retrieval and answer layers. Where each is safe and where each silently serves stale results. |

### Phase: Agents — Design and Control
Type: AI
Duration: 6 weeks
Resources: Anthropic Building effective agents, LangGraph docs, Model Context Protocol docs

| Item | Badge | Description |
|---|---|---|
| When not to build an agent | THEORY | Deterministic pipelines, single model calls, and workflows beat agents for most problems. TrustDesk chose a pipeline deliberately. Be able to defend that class of choice. |
| Tool schema ergonomics | AI | Naming, descriptions, argument shapes and error messages written for a model reader. The highest-leverage and most neglected part of agent quality. |
| Explicit state machines over free-running loops | AI | Model the agent as states and transitions rather than a while loop with a prompt. Directly reuses the State pattern from the design track. |
| Checkpointing and resumability | AI | Persist agent state so a run survives a crash or a pause. The difference between a demo and something that can be trusted with real work. |
| Human-in-the-loop approval gates | AI | Extend TrustDesk's approval model to an agentic context, keeping its rule that the model proposes and deterministic code disposes. |
| Permissions and sandboxing | AI | What a tool is allowed to touch, enforced outside the model. An agent with unbounded tool access is a vulnerability with a chat interface. |
| Idempotency and replay for tool calls | AI | Tool calls retry. Generalise TrustDesk's idempotency-key invariant so a retried side effect cannot double-charge or double-send. |
| Multi-agent handoff, and its cost | AI | Supervisor and specialist topologies, context handoff, and the coordination overhead that usually makes a single well-tooled agent the better answer. |
| Memory architectures | AI | Working, episodic and semantic memory as distinct problems with distinct storage. When retrieval is the right memory and when it is not. |

### Phase: Agents — Evaluation and Reliability
Type: AI
Duration: 4 weeks
Resources: LangSmith tracing docs, LLM-as-judge literature, OWASP LLM Top 10

| Item | Badge | Description |
|---|---|---|
| Trajectory evaluation | AI | Score the path, not just the final answer. An agent that reaches the right result through six wrong tool calls is not working. |
| LLM-as-judge with a real rubric | AI | Written criteria, calibrated against your own labels on a sample. An uncalibrated judge is a random number generator with good grammar. |
| Adversarial and prompt-injection testing | AI | Extend TrustDesk's adversarial eval cases to tool-using agents, including injection carried inside retrieved documents. |
| Layered guardrails for agentic output | AI | Generalise the L1 and L3 layering you already built. Fail closed, substitute deterministically, keep the rejected output on the trace. |
| Tracing and debugging agent runs | AI | Full run traces with tool inputs and outputs. You cannot debug what you cannot observe, and agents fail in ways logs alone will not show. |
| Failure recovery and graceful degradation | AI | Fallback models, tool timeouts, partial results, and knowing when to stop and ask rather than continue and guess. |

### Phase: LLM Systems in Production
Type: AI
Duration: 4 weeks
Resources: Chip Huyen AI Engineering, provider pricing and rate-limit docs, Model Context Protocol docs

| Item | Badge | Description |
|---|---|---|
| Model routing and tiering | AI | Cheap model for easy cases, expensive for hard ones, with a measured quality floor. Extends TrustDesk's existing tier adapter into a routing decision. |
| Prompt versioning and rollout | AI | Prompts are deployed artifacts. Version them, diff them, roll them back, and know which version produced any given trace. |
| Offline evaluation to online metrics | AI | Connecting benchmark scores to what users actually do. Where offline eval reliably misleads. |
| Structured output at scale | AI | Schema enforcement, retry on parse failure, and partial-parse strategies for streaming. Extends the zod work already in both repos. |
| OpenTelemetry GenAI semantic conventions | AI | The CNCF-backed standard schema for LLM telemetry: spans for inference calls, tool invocations and agent steps, with token, cost and latency attributes. Vendor-neutral, so instrumenting once outlives your choice of dashboard. Still marked experimental — know which parts are stable before betting on them. |
| Streaming, cancellation and partial failure | AI | What happens when a user navigates away mid-stream, a tool call fails after 200 tokens have been shown, or a guardrail rejects an answer already half-rendered. The failure modes that only exist because the answer arrives incrementally. |

### Phase: Model Context Protocol and Tool Infrastructure
Type: AI
Duration: 4 weeks
Resources: Model Context Protocol specification, MCP TypeScript SDK, OWASP LLM Top 10

| Item | Badge | Description |
|---|---|---|
| MCP as a protocol, not a library | THEORY | JSON-RPC 2.0, the client/server split, and why a standard transport for tools matters more than any individual tool. Being able to explain the protocol is what separates a user from an engineer here. |
| Tools, resources and prompts as distinct primitives | AI | Three different things that all look like "give the model something". Which to reach for, and what choosing wrong costs in context budget. |
| Build an MCP server over TrustDesk | PROJECT | Expose its knowledge base as resources and its guarded actions as tools. The strongest kind of portfolio item: a real protocol over a real system you already own. |
| Transports, auth and deployment | AI | stdio versus HTTP, session handling, and authenticating a server that is no longer running on the user's own machine. Where most MCP tutorials stop and production starts. |
| MCP server security | THEORY | A tool description is untrusted input to a model. Injection through tool metadata, over-broad scopes, confused-deputy access, and why the permission boundary belongs outside the model. Extends the agent permissions work. |

### Phase: AI Engineering Capstones
Type: AI
Duration: runs in parallel
Resources: your own repos

| Item | Badge | Description |
|---|---|---|
| Upgrade TrustDesk retrieval, measured end to end | PROJECT | Hybrid retrieval plus reranking behind the existing eval harness. Report the before and after numbers in the repo. The strongest possible interview artifact because the baseline is yours. |
| Build one genuinely agentic system | PROJECT | Planning, tool loop, checkpointing, approval gate, trajectory evals. Something you will actually use, not a demo. |
| Write up one retrieval finding publicly | JOB | A short post with real numbers from your golden set. Measured results from a system you own are rarer and more credible than tutorials. |
| Publish a working MCP server | PROJECT | The TrustDesk server, documented and installable. In 2026 this is the single most legible proof that you build AI infrastructure rather than consume it. |

---

## What the 2026 revision changed

Recorded so the diff is readable and the reasoning survives (ADR-12 makes this
file the source of truth, so its history matters).

**Added — `Context Engineering`, 6 items.** The largest genuine gap. The
discipline barely had a name when this file was first written and is now what
interview loops test. Nothing in either repo covers context budgeting,
compaction, or long-context degradation.

**Added — `Model Context Protocol and Tool Infrastructure`, 5 items.** MCP was
one line in *LLM Systems in Production*, which under-rates it by 2026. That item
is removed and replaced by a phase that goes as far as building and securing a
server, because using MCP clients daily is now table stakes and building one is
not.

**Added — 2 items to `LLM Systems in Production`.** OpenTelemetry GenAI
semantic conventions, because LLM observability standardised and instrumenting
against a vendor-neutral schema is now the sane default. And streaming failure
modes, which the file had only as a parenthetical inside structured output.

**Added — 1 capstone.** Publish the MCP server.

**Rewritten — the framing.** A section on what the market is buying, and an
explicit interview-critical subset (~26 items, ~6 months) so the track stays
usable when a month goes badly.

**Not changed, deliberately.** The retrieval, evaluation and agent-control
phases were already aimed at the right things and mostly got *more* relevant,
not less. Renaming solid items to sound current would be churn, and the
golden-set-first discipline in *RAG — Retrieval Quality* is exactly what "eval
literacy" means in a job description.

**Honest cost.** 37 items to 50; roughly eight months to ten and a half at
baseline pace. `docs/cadence.md` §3 already said the full curriculum does not
fit a 6-12 month window and told you to cut scope deliberately rather than
discover the gap in month seven. That advice now matters more, which is why the
subset above is explicit rather than implied.
