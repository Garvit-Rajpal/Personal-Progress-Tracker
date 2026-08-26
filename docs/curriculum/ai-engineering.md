# Curriculum — AI Engineering (RAG and Agents, Production Depth)

Source of truth for the advanced AI track (ADR-12). Parsed by
`server/prisma/seedCurriculum.js`.

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

- **Retrieval quality.** pgvector similarity alone is the weakest usable
  retrieval. Hybrid search, reranking and query understanding are where the
  large gains live, and none of them are in the codebase yet.
- **Measurement.** The eval harness scores end-to-end outcomes. It does not
  isolate *retrieval* quality, so a retrieval regression is currently invisible
  until it changes an answer.
- **Agent control.** TrustDesk's pipeline is deterministic code orchestrating
  model calls — a deliberately conservative design and the right one there. A
  genuinely agentic system with planning, tool loops and recovery is a different
  problem and has not been built.

**Pace.** ~2.5 h/week plus a weekend block (`docs/cadence.md`) — roughly one
item per week. This track is **37 items**, so about **eight and a half months**
at baseline pace. The three capstones run in parallel with the weekly items,
not after them, and each is a multi-week piece of work in its own right.

**If time is short, the two phases that carry the most weight are *RAG —
Retrieval Quality* and *Agents — Design and Control*.** Evaluation and
production items matter enormously in the job, but retrieval quality and agent
control are what you can actually demonstrate in an interview and what most
directly improve TrustDesk and LoveTeddy.

**The artifact rule.** Same as the design track. Every item produces running
code, a measured result, or a written finding. An item marked complete with
nothing to show for it is a lie to your own dashboard.

---

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
| Model Context Protocol | AI | Standardised tool and resource exposure. Directly relevant to how you already work, since Claude Code and Cowork are MCP clients. |

### Phase: AI Engineering Capstones
Type: AI
Duration: runs in parallel
Resources: your own repos

| Item | Badge | Description |
|---|---|---|
| Upgrade TrustDesk retrieval, measured end to end | PROJECT | Hybrid retrieval plus reranking behind the existing eval harness. Report the before and after numbers in the repo. The strongest possible interview artifact because the baseline is yours. |
| Build one genuinely agentic system | PROJECT | Planning, tool loop, checkpointing, approval gate, trajectory evals. Something you will actually use, not a demo. |
| Write up one retrieval finding publicly | JOB | A short post with real numbers from your golden set. Measured results from a system you own are rarer and more credible than tutorials. |
