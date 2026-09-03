/**
 * GENERATED FILE — DO NOT EDIT.
 *
 * Source: docs/curriculum/notes/roadmap-resources.md
 * Regenerate: npm run build:resources
 *
 * ADR-17. Curriculum markdown is the source of truth (invariant 8); this is a
 * projection of it, the same way the database will be at MB-4.
 *
 * TODO(MB-4): delete. Resources move onto RoadmapItem.resources.
 */

export type ResourceKind = 'docs' | 'video' | 'drill' | 'note';

export interface RoadmapResourceLink {
  kind: ResourceKind;
  title: string;
  url: string;
  /** Runtime in whole minutes. Present for videos, read from the video itself. */
  minutes?: number;
}

export interface RoadmapItemResources {
  /** Short revision content, rendered inline. Content, not descriptions of content. */
  revise: string[];
  links: RoadmapResourceLink[];
}

/** Keyed `Phase title :: Item title` — the pair the MB-2 seed upserts on. */
export const ROADMAP_RESOURCES: Record<string, RoadmapItemResources> = {
  "TypeScript & Modern Web Foundation :: TypeScript — strict mode & advanced types": {
    revise: [
      "Goal of every type change: make the illegal state unrepresentable. If you cannot delete a runtime check afterwards, the type bought nothing.",
      "Discriminated union beats optional fields. `{kind:'a', x} | {kind:'b', y}` permits 2 states; one type with `x?` and `y?` permits 4.",
      "`assertNever(value: never)` in the `default` branch turns \"someone added an enum member\" from a silent fallback into a build error.",
      "`satisfies` checks without widening — use it for config objects you read keys off. A plain annotation throws away literal keys; `as` silences the compiler instead of asking it.",
      "A type parameter used once is not a generic. `K extends keyof T` is the constraint that earns its keep.",
      "`strict` does not catch an *explicit* `any`. This client has 24 of them behind eslint-disable comments."
    ],
    links: [
      {"kind":"video","title":"What is a \"Discriminated Union\" in TypeScript?","url":"https://www.youtube.com/watch?v=odhEn5cMFMk","minutes":1},
      {"kind":"video","title":"WHEN should I use a Generic?","url":"https://www.youtube.com/watch?v=lMfGp29Ht8c","minutes":2},
      {"kind":"video","title":"The `satisfies` operator, explained","url":"https://www.youtube.com/watch?v=GZlLXgCfyGw","minutes":8},
      {"kind":"note","title":"Full revision note — advanced-typescript.md","url":"https://github.com/Garvit-Rajpal/Personal-Progress-Tracker/blob/main/docs/curriculum/notes/advanced-typescript.md"},
      {"kind":"docs","title":"TS Handbook — Narrowing, `never`, exhaustiveness","url":"https://www.typescriptlang.org/docs/handbook/2/narrowing.html"},
      {"kind":"drill","title":"type-challenges — do the `easy` set, stop there","url":"https://github.com/type-challenges/type-challenges"}
    ]
  },
  "TypeScript & Modern Web Foundation :: Async patterns mastery": {
    revise: [
      "`await` in a loop is sequential. `Promise.all` is parallel but fails fast; `Promise.allSettled` when partial success is acceptable.",
      "An `AbortController` gives one `signal` to many consumers. `controller.abort()` rejects the fetch with a `DOMException` named `AbortError` — catch that specifically, do not swallow every error.",
      "Reading a stream: the loop body only runs when data arrives, so there is a real gap between `abort()` and your `break`. Do not assume cancellation is instant.",
      "`AbortSignal.timeout(ms)` and `AbortSignal.any([...])` remove most hand-rolled timeout code.",
      "SSE is one-way server→client over plain HTTP and auto-reconnects; WebSockets are bidirectional and do not. LLM token streaming wants SSE."
    ],
    links: [
      {"kind":"video","title":"JavaScript Promise in 100 Seconds","url":"https://www.youtube.com/watch?v=RvYYCGs45L4","minutes":2},
      {"kind":"video","title":"Server-Sent Events in under 60 seconds","url":"https://www.youtube.com/watch?v=oZJf-OYSxbg","minutes":1},
      {"kind":"docs","title":"MDN — AbortController","url":"https://developer.mozilla.org/en-US/docs/Web/API/AbortController"},
      {"kind":"docs","title":"MDN — Using readable streams","url":"https://developer.mozilla.org/en-US/docs/Web/API/Streams_API/Using_readable_streams"}
    ]
  },
  "TypeScript & Modern Web Foundation :: Git & collaboration": {
    revise: [
      "A branch is a moving pointer to a commit. Nothing is copied. Once that lands, most Git confusion goes.",
      "`rebase` rewrites history for a linear log; `merge` preserves it. Rebase your own unpushed work, never a shared branch.",
      "Recovery: `git reflog` finds the commit you think you destroyed. Almost nothing is actually lost for 90 days.",
      "`git bisect` finds the breaking commit in log₂(n) steps. For 500 commits that is 9 checkouts.",
      "A good message says *why*. The diff already says what."
    ],
    links: [
      {"kind":"video","title":"Git Explained in 100 Seconds","url":"https://www.youtube.com/watch?v=hwP7WQkmECE","minutes":2},
      {"kind":"docs","title":"Oh Shit, Git!?! — the recovery cheatsheet","url":"https://ohshitgit.com/"},
      {"kind":"docs","title":"Pro Git — branching (ch.3), bisect (7.7)","url":"https://git-scm.com/book/en/v2"}
    ]
  },
  "LLM Fundamentals & API Layer :: How LLMs actually work": {
    revise: [
      "The model predicts one token at a time over the whole context. Everything else is plumbing around that loop.",
      "Attention lets each token read every earlier token; cost is quadratic in sequence length, which is why context windows are expensive rather than merely large.",
      "Temperature flattens the distribution, top-p truncates it. For extraction and structured output use temperature 0 — creativity is not a virtue there.",
      "Tokens are not words. \"Kolkata\" may be several tokens; whitespace and casing change counts. This is why token budgets must be measured rather than estimated from character length.",
      "No good 10-minute version of this exists that is not misleading. The two 3Blue1Brown chapters are the honest short path."
    ],
    links: [
      {"kind":"video","title":"Transformers, the tech behind LLMs — 3Blue1Brown ch.5","url":"https://www.youtube.com/watch?v=wjZofJX0v4M","minutes":27},
      {"kind":"video","title":"Attention in transformers, step-by-step — 3Blue1Brown ch.6","url":"https://www.youtube.com/watch?v=eMlx5fFNoYc","minutes":26},
      {"kind":"video","title":"Let's build the GPT Tokenizer — Karpathy (long)","url":"https://www.youtube.com/watch?v=zduSFxRajkE","minutes":134}
    ]
  },
  "LLM Fundamentals & API Layer :: Prompt engineering depth": {
    revise: [
      "Establish the success criterion and a way to test it *before* touching the prompt. Anthropic's own docs open with this, and it is the whole lesson.",
      "Order that works: clear task → examples → XML-delimited structure → let it think → chain if still failing.",
      "Put instructions before data. A model reading 8k tokens of document then an instruction has already spent its attention.",
      "Delimit untrusted input explicitly. Retrieved documents are untrusted input, and that is where indirect injection arrives.",
      "Prompt craft is assumed in 2026, not the priced skill. Context engineering is. Treat this item as the floor."
    ],
    links: [
      {"kind":"docs","title":"Prompt engineering overview — Claude docs","url":"https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview"},
      {"kind":"docs","title":"Prompting best practices — the living reference","url":"https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices"},
      {"kind":"drill","title":"Interactive prompt engineering tutorial","url":"https://github.com/anthropics/prompt-eng-interactive-tutorial"},
      {"kind":"docs","title":"Effective context engineering for AI agents","url":"https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents"}
    ]
  },
  "LLM Fundamentals & API Layer :: LLM API integration": {
    revise: [
      "Retry on 429 and 5xx with exponential backoff **plus jitter**. Without jitter every client retries in lockstep and you rebuild the spike.",
      "Read the rate-limit headers rather than guessing; budget both requests/min and tokens/min, since you can breach either alone.",
      "Streaming changes error handling: the HTTP status is 200 long before you know the request succeeded. Failures arrive as events mid-stream.",
      "Always set a timeout. A hung request holding a connection is worse than a fast failure.",
      "Never let a provider key reach the client. Proxy through your own server, always."
    ],
    links: [
      {"kind":"docs","title":"Streaming — Claude docs","url":"https://platform.claude.com/docs/en/build-with-claude/streaming"},
      {"kind":"docs","title":"Errors and rate limits","url":"https://platform.claude.com/docs/en/api/errors"},
      {"kind":"docs","title":"Tool use overview","url":"https://platform.claude.com/docs/en/build-with-claude/tool-use/overview"}
    ]
  },
  "LLM Fundamentals & API Layer :: Structured outputs & Zod validation": {
    revise: [
      "Parse, don't validate: one schema at the boundary returns a typed value, and nothing downstream re-checks.",
      "On a parse failure, retry once with the validation error fed back to the model. It fixes most malformed output; a second retry rarely helps.",
      "Keep schemas shallow and name fields descriptively — the field name is a prompt the model reads.",
      "Optional-vs-nullable matters. `z.string().optional()` and `.nullable()` mean different things to Prisma and to the model.",
      "Measure your parse-failure rate. If you do not know it, you cannot tell whether a prompt change helped."
    ],
    links: [
      {"kind":"docs","title":"Structured outputs — Claude docs","url":"https://platform.claude.com/docs/en/build-with-claude/structured-outputs"},
      {"kind":"docs","title":"Zod","url":"https://zod.dev/"}
    ]
  },
  "RAG Systems & Vector Search :: RAG architecture end-to-end": {
    revise: [
      "Pipeline: ingest → chunk → embed → index → retrieve → rerank → assemble context → generate. Any stage can be the bug.",
      "Retrieval failure and generation failure are different problems with different fixes. Score them separately or you will tune prompts against an index bug for weeks.",
      "Contextual retrieval — prepend document-level context to each chunk before embedding — cut retrieval failures by up to 67% in Anthropic's measurements when combined with reranking.",
      "Put retrieved context *before* the question, and cite chunk IDs so groundedness is checkable.",
      "More retrieved context is not better. Irrelevant chunks actively distract the model."
    ],
    links: [
      {"kind":"video","title":"RAG in 10 minutes (beginner-friendly)","url":"https://www.youtube.com/watch?v=gweRh5Xtkq0","minutes":10},
      {"kind":"video","title":"RAG, clearly explained (why it matters)","url":"https://www.youtube.com/watch?v=VioF7v8Mikg","minutes":11},
      {"kind":"docs","title":"Introducing Contextual Retrieval — Anthropic","url":"https://www.anthropic.com/news/contextual-retrieval"}
    ]
  },
  "RAG Systems & Vector Search :: Chunking strategies": {
    revise: [
      "Five levels, rising cost: fixed-size → recursive character → document-aware → semantic (embedding-based) → agentic.",
      "Semantic chunking splits where cosine similarity between adjacent sentences drops below a threshold. Costs an embedding pass over everything.",
      "Overlap of ~10–15% stops mid-sentence splits. More overlap grows the index without improving recall.",
      "Small chunks retrieve precisely but lose context; large chunks do the reverse. Retrieve small, then expand to the parent chunk.",
      "Treat \"chunking is the #1 factor\" as a hypothesis. Clever chunking often loses to hybrid retrieval on cost-adjusted terms. Measure on your own golden set."
    ],
    links: [
      {"kind":"drill","title":"The 5 Levels of Text Splitting — runnable notebook","url":"https://github.com/FullStackRetrieval-com/RetrievalTutorials/blob/main/tutorials/LevelsOfTextSplitting/5_Levels_Of_Text_Splitting.ipynb"}
    ]
  },
  "RAG Systems & Vector Search :: Embeddings & vector databases": {
    revise: [
      "An embedding is a fixed-length vector where distance approximates meaning. Cosine similarity is the usual metric; normalise first and it is just a dot product.",
      "HNSW is a graph index — fast, supports incremental inserts, no need to populate the table first. IVFFlat is cheaper to build but wants the data up front.",
      "Vector search alone is the weakest usable retrieval. It misses exact terms — product codes, error strings, names — which is exactly what BM25 catches.",
      "Hybrid = BM25/`tsvector` + vector, fused with **reciprocal rank fusion**: score = Σ 1/(k + rank), k≈60. No weight tuning, and documents in both lists get boosted for free.",
      "In Postgres: `tsvector` + GIN alongside `vector` + HNSW, ideally as a `GENERATED ALWAYS AS ... STORED` column."
    ],
    links: [
      {"kind":"video","title":"What are vector embeddings?","url":"https://www.youtube.com/watch?v=bGNYyK1L41g","minutes":2},
      {"kind":"video","title":"What are embeddings? (visual breakdown)","url":"https://www.youtube.com/watch?v=03LdHj6miTE","minutes":4},
      {"kind":"video","title":"Hybrid retrieval & reranking: BM25, RRF, cross-encoders","url":"https://www.youtube.com/watch?v=PP49RulTXp8","minutes":10},
      {"kind":"docs","title":"Hybrid search with Postgres and pgvector — Jonathan Katz","url":"https://jkatz05.com/post/postgres/hybrid-search-postgres-pgvector/"},
      {"kind":"docs","title":"pgvector","url":"https://github.com/pgvector/pgvector"}
    ]
  },
  "RAG Systems & Vector Search :: LangChain / LlamaIndex": {
    revise: [
      "Know the four abstractions — document loader, splitter, retriever, chain — and that each is a thin wrapper over something you could write.",
      "Anthropic's finding: the most successful implementations avoided frameworks in favour of simple composable patterns. Use the framework for scaffolding, not architecture.",
      "Frameworks hide the prompt. If you cannot print the exact string sent to the model, you cannot debug it.",
      "Spend this item as a teardown, not a tutorial: read one retriever's source, re-implement it in ~40 lines, write down what the framework was buying.",
      "Staleness signal: anything still linking `langchain-ai.github.io/langgraph` predates the 2026 docs move."
    ],
    links: [
      {"kind":"docs","title":"LangChain overview","url":"https://docs.langchain.com/oss/python/langchain/overview"},
      {"kind":"docs","title":"Building effective agents — the counter-argument","url":"https://www.anthropic.com/engineering/building-effective-agents"}
    ]
  },
  "RAG Systems & Vector Search :: RAG evaluation": {
    revise: [
      "Build the golden set first — ~50 real queries with known-correct documents. Every measurement before this is guesswork.",
      "Retrieval metrics: recall@k (did the right doc appear), MRR (how high), nDCG (rank-weighted). Score retrieval *in isolation* or a retrieval regression stays invisible until it changes an answer.",
      "Generation metrics: faithfulness (is the answer supported by the retrieved context) and answer relevancy. Faithfulness is the one users punish.",
      "An LLM judge must be calibrated against your own labels on a sample. Uncalibrated, it is a random number generator with good grammar.",
      "Get it into CI. Quality that is not gated decays."
    ],
    links: [
      {"kind":"video","title":"Hamel on LLM as a judge (clip)","url":"https://www.youtube.com/watch?v=Nycm3Zz5Jzo","minutes":1},
      {"kind":"docs","title":"Ragas — available metrics","url":"https://docs.ragas.io/en/stable/concepts/metrics/available_metrics/"},
      {"kind":"video","title":"Why AI evals are the hottest new skill (long)","url":"https://www.youtube.com/watch?v=BsWxPI9UM4c","minutes":107}
    ]
  },
  "RAG Systems & Vector Search :: Build a RAG app": {
    revise: [
      "TrustDesk already is this app. Upgrading a system whose baseline you own beats a greenfield demo, because the delta is verifiable.",
      "The loop that matters: look at failures → categorise them → fix the biggest category → re-measure. Repeat. Improvement is not a one-shot redesign.",
      "Categorise every miss: absent from corpus, present but not retrieved, retrieved but not used, retrieved and misread. Each has a different fix.",
      "Ship the numbers in the README. \"Improved retrieval\" is noise; \"recall@5 0.61 → 0.84 on a 50-query golden set\" is the artifact."
    ],
    links: [
      {"kind":"video","title":"Systematically improving RAG applications (long)","url":"https://www.youtube.com/watch?v=RrDBV6odPKo","minutes":69}
    ]
  },
  "AI Agents & LangGraph :: Agent architecture patterns": {
    revise: [
      "Workflow = you wrote the control flow. Agent = the model decides the control flow. Most problems want a workflow, and TrustDesk deliberately is one.",
      "Patterns worth naming: prompt chaining, routing, parallelisation, orchestrator–workers, evaluator–optimiser. Reach for these before an autonomous loop.",
      "ReAct = reason, act, observe, repeat. Simple and still the default; its failure mode is looping without progress, so always cap iterations.",
      "Multi-agent adds coordination overhead that usually loses to one well-tooled agent. Reach for it when contexts genuinely must stay separate.",
      "Being able to defend *not* building an agent is what interviews actually probe."
    ],
    links: [
      {"kind":"video","title":"Agentic AI: workflows vs. agents","url":"https://www.youtube.com/watch?v=Qd6anWv0mv0","minutes":6},
      {"kind":"video","title":"Most devs don't understand what agents are","url":"https://www.youtube.com/watch?v=AtYtuVTZCQU","minutes":8},
      {"kind":"video","title":"How we build effective agents — Barry Zhang, Anthropic","url":"https://www.youtube.com/watch?v=D7_ipDqhtwk","minutes":15},
      {"kind":"docs","title":"Building effective agents — Anthropic","url":"https://www.anthropic.com/engineering/building-effective-agents"}
    ]
  },
  "AI Agents & LangGraph :: Tool / function calling design": {
    revise: [
      "The tool schema is a prompt. Names, descriptions, argument names and error messages are all read by a model.",
      "Six good tools beat forty. Selection accuracy falls as the catalog grows — load tools by phase or relevance.",
      "Error messages should tell the model what to do next: \"date must be YYYY-MM-DD, got 03/09/2026\" beats \"invalid input\".",
      "Make tools idempotent or key them. Tool calls get retried, and a retried side effect must not double-charge or double-send.",
      "Prefer few coarse tools over many fine ones; each extra tool costs context budget and choice accuracy."
    ],
    links: [
      {"kind":"docs","title":"Tool use overview — Claude docs","url":"https://platform.claude.com/docs/en/build-with-claude/tool-use/overview"},
      {"kind":"video","title":"MCP explained in 90 seconds (where tools are heading)","url":"https://www.youtube.com/watch?v=mMWWU4PambM","minutes":2},
      {"kind":"video","title":"How MCP actually works","url":"https://www.youtube.com/watch?v=cGuyrANVi4A","minutes":8}
    ]
  },
  "AI Agents & LangGraph :: LangGraph stateful workflows": {
    revise: [
      "Nodes mutate state, edges route. Conditional edges are where the agent's decisions live.",
      "State is a typed dict with reducers — a reducer decides whether a key is replaced or appended to. Getting this wrong is the usual first bug.",
      "Checkpointing writes state after every node, keyed by thread ID. That is what makes pause, resume and time-travel possible.",
      "Human-in-the-loop is an interrupt on the persistence layer: pause before a risky tool call, wait for a decision, resume from the checkpoint.",
      "If your graph cannot survive a process restart mid-run, you have a demo."
    ],
    links: [
      {"kind":"video","title":"Building effective agents with LangGraph (long)","url":"https://www.youtube.com/watch?v=aHCDrAbH_go","minutes":32},
      {"kind":"docs","title":"LangGraph overview","url":"https://docs.langchain.com/oss/python/langgraph/overview"},
      {"kind":"docs","title":"Human-in-the-loop","url":"https://docs.langchain.com/oss/python/langchain/human-in-the-loop"}
    ]
  },
  "AI Agents & LangGraph :: Memory systems": {
    revise: [
      "Three different problems: working memory (this turn), episodic (what happened before), semantic (facts worth keeping). Do not solve all three with one vector store.",
      "Ask of every turn: durable state, or transcript noise? Only the first is memory.",
      "Summarise-and-compact loses detail you will want three turns later. Measure task success before and after, rather than assuming shorter is safe.",
      "Retrieval is the right memory when the corpus is large and the query is specific. It is the wrong one for \"what did the user just agree to\".",
      "This overlaps *Memory architectures* in the AI curriculum — see the optimisation note before doing both."
    ],
    links: [
      {"kind":"docs","title":"LangGraph persistence and memory","url":"https://docs.langchain.com/oss/python/langgraph/persistence"}
    ]
  },
  "AI Agents & LangGraph :: Agent reliability & evals": {
    revise: [
      "Score the trajectory, not just the answer. An agent reaching the right result through six wrong tool calls is not working.",
      "Guardrails fail closed, substitute deterministically, and keep the rejected output on the trace. That is TrustDesk's L1/L3 pattern generalised.",
      "Prompt injection has held OWASP LLM01 for three editions running. The 2026 emphasis is *indirect* injection — carried inside retrieved documents, which makes your RAG corpus an attack surface.",
      "Enforce permissions outside the model. An agent with unbounded tool access is a vulnerability with a chat interface.",
      "Degrade gracefully: fallback model, tool timeout, partial result, and knowing when to stop and ask rather than continue and guess."
    ],
    links: [
      {"kind":"docs","title":"OWASP GenAI LLM Top 10 (2026)","url":"https://genai.owasp.org/resource/owasp-genai-llm-top-10-2026/"},
      {"kind":"video","title":"Hamel on LLM as a judge (clip)","url":"https://www.youtube.com/watch?v=Nycm3Zz5Jzo","minutes":1}
    ]
  },
  "AI Agents & LangGraph :: Build an agent": {
    revise: [
      "The bar: planning, a tool loop, checkpointing, an approval gate, and trajectory evals. Anything less is a demo.",
      "Build something you will actually use. Agents you do not use are agents whose failure modes you never discover.",
      "Cap the loop. Every autonomous agent needs a maximum iteration count and a cost ceiling.",
      "The interview artifact is a run trace showing recovery from a failed tool call — more than the repo itself."
    ],
    links: [
      {"kind":"docs","title":"Building effective agents — Anthropic","url":"https://www.anthropic.com/engineering/building-effective-agents"}
    ]
  },
  "Full-Stack Frontend for AI Apps :: React + Next.js App Router": {
    revise: [
      "Server Components are the default; `'use client'` marks a boundary, and everything imported below it becomes client code. Most App Router confusion is one misplaced directive.",
      "Server Components can be async and fetch directly. They cannot use hooks, state or event handlers.",
      "Pass serialisable props across the boundary. Functions and class instances do not cross.",
      "`loading.tsx` is a Suspense boundary — that is the whole streaming mechanism.",
      "Caching is the part that bites in production. Know which of fetch cache, full-route cache and router cache you are actually hitting."
    ],
    links: [
      {"kind":"video","title":"React in 100 Seconds","url":"https://www.youtube.com/watch?v=Tn6-PIqc4UM","minutes":2},
      {"kind":"video","title":"Next.js in 100 Seconds + beginner tutorial","url":"https://www.youtube.com/watch?v=Sklc_fQBmcs","minutes":12},
      {"kind":"video","title":"Composition, caching and architecture in modern Next.js","url":"https://www.youtube.com/watch?v=iRGc8KQDyQ8","minutes":30},
      {"kind":"docs","title":"Server and Client Components","url":"https://nextjs.org/docs/app/getting-started/server-and-client-components"}
    ]
  },
  "Full-Stack Frontend for AI Apps :: Vercel AI SDK": {
    revise: [
      "Now at **v7**. Tool invocations are typed parts (`tool-TOOLNAME`), not the generic `toolInvocations` array — most tutorials online still show the pre-v5 shape and will mislead you.",
      "Tool call inputs stream by default, so you can render arguments as they arrive.",
      "`useChat` owns message state; render from its `messages`, never a parallel copy.",
      "The route handler returns a stream response; the hook consumes it. Keep provider keys server-side, always."
    ],
    links: [
      {"kind":"docs","title":"`useChat` reference (v7)","url":"https://ai-sdk.dev/docs/reference/ai-sdk-ui/use-chat"},
      {"kind":"docs","title":"Chatbot guide","url":"https://ai-sdk.dev/docs/ai-sdk-ui/chatbot"}
    ]
  },
  "Full-Stack Frontend for AI Apps :: Streaming UI patterns": {
    revise: [
      "Stream tokens, but commit state in whole units. A half-written row is worse than a slow one.",
      "Show a skeleton with the right *shape*, not a spinner. Layout shift on completion reads as a bug.",
      "Handle: user navigates away mid-stream; tool fails after 200 tokens are on screen; guardrail rejects an answer already half-rendered. These failure modes exist only because the answer arrives incrementally.",
      "Abort on unmount and clean up server-side. An orphaned stream still costs tokens.",
      "Throttle re-renders — one render per token will drop frames on a long answer."
    ],
    links: [
      {"kind":"video","title":"Next.js streaming: SSR, Suspense, skeletons","url":"https://www.youtube.com/watch?v=xTT_Sd_xqh0","minutes":26},
      {"kind":"video","title":"Server-Sent Events in under 60 seconds","url":"https://www.youtube.com/watch?v=oZJf-OYSxbg","minutes":1}
    ]
  },
  "Full-Stack Frontend for AI Apps :: Chat UI architecture": {
    revise: [
      "A message is a list of typed parts (text, tool call, tool result), not a string. Model it that way from day one or retrofit it painfully.",
      "Persist on completion, not per token. Write the user turn immediately so a refresh mid-stream does not lose it.",
      "Optimistic updates need a stable client-generated ID to reconcile against the server's.",
      "Decide what enters the next request's context. The full transcript is the lazy answer and the one that gets expensive.",
      "Same question as *Memory systems*, arriving from the UI side. Answer it once."
    ],
    links: [
      {"kind":"docs","title":"Chatbot guide — AI SDK","url":"https://ai-sdk.dev/docs/ai-sdk-ui/chatbot"}
    ]
  },
  "Full-Stack Frontend for AI Apps :: Auth + multi-tenancy basics": {
    revise: [
      "Every persisted row carries a `userId`, and the scope is applied in the service layer — never trusted from the client. That is this repo's invariant 1.",
      "Short-lived access token in memory, refresh token in an httpOnly cookie. A token in `localStorage` is readable by any XSS.",
      "Authorisation belongs in the service. A controller may validate shape; it may not be the only thing deciding access.",
      "Retrieval must be scoped too. Tenant-scoped and role-scoped filtering is a correctness and security requirement, not a feature.",
      "Nothing new to build here — this repo and TrustDesk are both worked answers. Write the one-page explanation and tick it."
    ],
    links: [
      {"kind":"docs","title":"OWASP GenAI LLM Top 10 (2026) — excessive agency, over-broad scope","url":"https://genai.owasp.org/resource/owasp-genai-llm-top-10-2026/"}
    ]
  },
  "Full-Stack Frontend for AI Apps :: Build a full AI product UI": {
    revise: [
      "Polish means the unglamorous states: empty, loading, error, offline, mobile. They are most of the perceived quality.",
      "Colour from tokens only, both themes — this repo's ADR-16 discipline transfers directly.",
      "Every destructive action gets a confirmation; every async action gets a pending state.",
      "A polished UI over a real system is what converts a portfolio link into a callback."
    ],
    links: [
      {"kind":"note","title":"docs/design.md — this repo's visual contract","url":"https://github.com/Garvit-Rajpal/Personal-Progress-Tracker/blob/main/docs/design.md"}
    ]
  },
  "Production, Deployment & Job-Ready :: LLM observability & tracing": {
    revise: [
      "Trace the whole request as one tree: retrieval, model call, tool calls, guardrails — each a span with tokens, cost and latency.",
      "Log the exact prompt sent and the raw response. Reconstructed prompts hide the bug.",
      "Instrument against OpenTelemetry GenAI semantic conventions, not a vendor SDK — you instrument once and keep it when the dashboard changes. Parts are still experimental; check before betting.",
      "Prefer self-hostable and open source here. Traces next to your own Postgres beat traces in someone else's account.",
      "Sample in production, keep 100% of errors."
    ],
    links: [
      {"kind":"docs","title":"Langfuse — observability and tracing","url":"https://langfuse.com/docs/observability/overview"}
    ]
  },
  "Production, Deployment & Job-Ready :: Cost & latency optimization": {
    revise: [
      "Prompt caching is usually the largest single saving and it is a cache-control field, not an architecture change. Put the stable prefix — system rules, tool defs, few-shots — first.",
      "Route by difficulty: cheap model by default, expensive on escalation, with a measured quality floor.",
      "Batch anything not user-facing.",
      "Write the budget down before optimising: cost per query and p95 latency. Optimising without a budget spends a week saving nothing.",
      "Latency is dominated by output tokens, not input. Shortening the answer beats shortening the prompt."
    ],
    links: [
      {"kind":"docs","title":"Prompt caching","url":"https://platform.claude.com/docs/en/build-with-claude/prompt-caching"},
      {"kind":"docs","title":"Batch processing","url":"https://platform.claude.com/docs/en/build-with-claude/batch-processing"}
    ]
  },
  "Production, Deployment & Job-Ready :: Backend API for AI apps": {
    revise: [
      "The provider key never leaves the server. Proxy every call.",
      "Rate-limit per user, not per IP. Cost is per user and IPs are shared.",
      "Streaming endpoints must clean up on client disconnect, or you pay for tokens nobody reads.",
      "One response envelope everywhere — this repo's `{ data }` / `{ error: { code, message, details } }` (ADR-14).",
      "Layering: routes → controllers → services. Validate shape at the boundary; enforce authorisation in the service."
    ],
    links: [
      {"kind":"note","title":"docs/DECISIONS.md — ADR-14, the response envelope","url":"https://github.com/Garvit-Rajpal/Personal-Progress-Tracker/blob/main/docs/DECISIONS.md"}
    ]
  },
  "Production, Deployment & Job-Ready :: Docker + CI/CD": {
    revise: [
      "Multi-stage build: fat builder stage, thin runtime stage that copies only artifacts. Usually cuts image size by an order of magnitude.",
      "Order layers by change frequency — lockfile and `npm ci` before source — so a code edit does not reinstall dependencies.",
      "Never bake secrets into an image. Layers persist even after a later `rm`.",
      "CI runs what you would run: `npm test`, `lint`, `build`, `check:tokens`. A rule enforced by memory is not enforced.",
      "This repo has three compose services and **no pipeline** — 292 tests protected by discipline alone. That is the artifact for this item."
    ],
    links: [
      {"kind":"video","title":"Docker in 100 Seconds","url":"https://www.youtube.com/watch?v=Gjnup-PuquQ","minutes":2},
      {"kind":"docs","title":"Multi-stage builds","url":"https://docs.docker.com/build/building/multi-stage/"},
      {"kind":"docs","title":"GitHub Actions","url":"https://docs.github.com/en/actions"}
    ]
  },
  "Production, Deployment & Job-Ready :: Capstone: full AI-powered product": {
    revise: [
      "Deployed, with numbers, or it does not count.",
      "An upgrade to a system you own beats a greenfield demo — the baseline is verifiable and the delta is yours.",
      "Ship the eval harness alongside it. \"Here is how I know it works\" is the part most portfolios lack.",
      "Write the README for a reviewer with four minutes: what it does, the architecture in one diagram, the numbers, the known gaps."
    ],
    links: [
      {"kind":"note","title":"Roadmap optimisation — why an upgrade beats a rebuild","url":"https://github.com/Garvit-Rajpal/Personal-Progress-Tracker/blob/main/docs/curriculum/notes/roadmap-optimisation.md"}
    ]
  },
  "Production, Deployment & Job-Ready :: System design for AI systems": {
    revise: [
      "Estimate first: queries/day → QPS, corpus size → index size and memory, tokens/query → cost/month. Numbers before boxes.",
      "Retrieval at scale: shard the index, cache embeddings, and keep re-indexing incremental — full re-index is not an operation you get to do often.",
      "Async job queue for ingestion and long agent runs. Never do embedding work inside a request.",
      "Design the degradation path explicitly: fallback model, stale cache, partial results, and a clear failure message.",
      "The general half — replication, consistency, sharding — belongs to the system design track. This item is only the AI overlay."
    ],
    links: [
      {"kind":"docs","title":"AI Engineering — Chip Huyen","url":"https://huyenchip.com/books/"},
      {"kind":"drill","title":"aie-book — free companion repo","url":"https://github.com/chiphuyen/aie-book"}
    ]
  },
  "Production, Deployment & Job-Ready :: Target roles & resume": {
    revise: [
      "The title \"prompt engineer\" is gone. Postings read AI engineer, applied AI engineer, agent engineer, context engineer. Match the vocabulary of what you built.",
      "Every project line carries a number. \"Improved retrieval\" is noise; \"recall@5 0.61 → 0.84 on a 50-query golden set\" is the point of the golden set.",
      "Lead with shipped systems, not courses. Two real repos beat any certificate.",
      "Link a live demo and the repo. A reviewer gives you about four minutes.",
      "Production-over-research is the 2026 shift: deploy, measure, operate. That is what the portfolio should show."
    ],
    links: [
      {"kind":"note","title":"docs/curriculum/ai-engineering.md — the market read","url":"https://github.com/Garvit-Rajpal/Personal-Progress-Tracker/blob/main/docs/curriculum/ai-engineering.md"}
    ]
  },
  "Production, Deployment & Job-Ready :: Mock interviews × 5": {
    revise: [
      "Split: 2 system design (one general, one \"design a RAG system\"), 1 DSA, 2 project deep-dives on TrustDesk and LoveTeddy.",
      "The deep-dives matter most — they are where a shipped repo beats a certificate, and the only ones you cannot cram for.",
      "In a design round, state assumptions and estimate out loud before drawing. Silence reads as not knowing.",
      "Rehearse the \"why not X\" answers: why a pipeline and not an agent, why pgvector and not a dedicated vector DB.",
      "Write notes after each: the question you fumbled, and the fix. Five mocks with no notes is five hours of vibes."
    ],
    links: [
      {"kind":"note","title":"docs/curriculum/system-design.md — the design track","url":"https://github.com/Garvit-Rajpal/Personal-Progress-Tracker/blob/main/docs/curriculum/system-design.md"}
    ]
  }
};

export function resourcesFor(
  phaseTitle: string | undefined,
  itemTitle: string | undefined
): RoadmapItemResources | undefined {
  if (!phaseTitle || !itemTitle) return undefined;
  return ROADMAP_RESOURCES[`${phaseTitle} :: ${itemTitle}`];
}
