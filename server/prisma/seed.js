const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const phasesData = [
  {
    title: "TypeScript & Modern Web Foundation",
    type: "FS",
    duration: "2–3 weeks",
    resources: "typescript-lang.org, javascript.info, MDN Web Docs",
    items: [
      { title: "TypeScript — strict mode & advanced types", description: "Generics, utility types, discriminated unions, satisfies operator. Essential for typed LLM response schemas.", badge: "CORE" },
      { title: "Async patterns mastery", description: "Promises, async/await, streaming responses, AbortController — critical for LLM streaming UIs.", badge: "CORE" },
      { title: "Git & collaboration", description: "Feature branching, squash commits, PR review etiquette. Non-negotiable for any eng role.", badge: "JOB" },
    ]
  },
  {
    title: "LLM Fundamentals & API Layer",
    type: "AI",
    duration: "2–3 weeks",
    resources: "Anthropic docs, OpenAI docs, Simon Willison's blog, 'Building LLMs' by Chip Huyen",
    items: [
      { title: "How LLMs actually work", description: "Transformers, tokenization, context windows, temperature, top-p, logprobs — understand the knobs you're turning.", badge: "AI" },
      { title: "Prompt engineering depth", description: "System prompts, few-shot, chain-of-thought, structured output (JSON mode), prompt injection defense.", badge: "AI" },
      { title: "LLM API integration", description: "OpenAI / Anthropic SDK, streaming responses, function calling / tool use, handling rate limits & retries.", badge: "CORE" },
      { title: "Structured outputs & Zod validation", description: "Parse LLM JSON responses safely. Use Instructor or Zod schemas to enforce output shape.", badge: "AI" },
    ]
  },
  {
    title: "RAG Systems & Vector Search",
    type: "AI",
    duration: "3–4 weeks",
    resources: "LangChain docs, LlamaIndex docs, Pinecone / Qdrant docs, Greg Kamradt on YouTube",
    items: [
      { title: "RAG architecture end-to-end", description: "Ingestion → chunking → embedding → vector store → retrieval → augmented generation. Know every step.", badge: "AI" },
      { title: "Chunking strategies", description: "Fixed-size, semantic, recursive, document-aware. Chunking quality is the #1 factor in RAG performance.", badge: "AI" },
      { title: "Embeddings & vector databases", description: "OpenAI / Cohere embeddings, cosine similarity, Pinecone / Qdrant / pgvector (Postgres). Hybrid search (BM25 + vector).", badge: "AI" },
      { title: "LangChain / LlamaIndex", description: "Document loaders, retrievers, chains. Know the abstractions but also understand what's happening underneath.", badge: "AI" },
      { title: "RAG evaluation", description: "RAGAS metrics: faithfulness, answer relevancy, context precision. Learn to measure before you ship.", badge: "AI" },
      { title: "Build a RAG app", description: "Ingest a real document corpus, expose a chat interface, evaluate retrieval quality. Deploy it.", badge: "PROJECT" },
    ]
  },
  {
    title: "AI Agents & LangGraph",
    type: "AI",
    duration: "3–4 weeks",
    resources: "LangGraph docs, Harrison Chase talks, Andrew Ng's agentic design patterns essay",
    items: [
      { title: "Agent architecture patterns", description: "ReAct, Plan-and-Execute, Reflection, multi-agent. Understand tradeoffs — agents aren't always the answer.", badge: "AI" },
      { title: "Tool / function calling design", description: "Write clean tool schemas, handle tool errors gracefully, design for LLM discoverability.", badge: "AI" },
      { title: "LangGraph stateful workflows", description: "Nodes, edges, state schemas, conditional branching, human-in-the-loop, persistence. This is the current production standard.", badge: "AI" },
      { title: "Memory systems", description: "Short-term (conversation buffer), long-term (vector store or DB), entity memory. Know when to use each.", badge: "AI" },
      { title: "Agent reliability & evals", description: "Agents fail in weird ways. Learn to add guardrails, fallbacks, structured logging, and LLM-as-judge evaluation.", badge: "AI" },
      { title: "Build an agent", description: "A useful multi-tool agent (e.g. research assistant, code reviewer, data analyst). LangGraph-powered, with a real UI.", badge: "PROJECT" },
    ]
  },
  {
    title: "Full-Stack Frontend for AI Apps",
    type: "BOTH",
    duration: "3–4 weeks",
    resources: "react.dev, Next.js docs (nextjs.org), Vercel AI SDK docs",
    items: [
      { title: "React + Next.js App Router", description: "Server components, streaming, route handlers — essential for LLM streaming UIs. This is the hiring standard.", badge: "CORE" },
      { title: "Vercel AI SDK", description: "useChat, useCompletion, streaming text, tool call rendering. The best DX for AI-powered Next.js apps.", badge: "AI" },
      { title: "Streaming UI patterns", description: "Incremental rendering, loading skeletons, partial hydration for LLM outputs. Users hate waiting for full responses.", badge: 'CORE' },
      { title: "Chat UI architecture", description: "Message threading, optimistic updates, conversation persistence, multi-turn context management.", badge: "CORE" },
      { title: "Auth + multi-tenancy basics", description: "NextAuth or Clerk, protecting API routes, user-scoped data. Every AI app needs this.", badge: "CORE" },
      { title: "Build a full AI product UI", description: "Polish the frontend for one of your AI projects. Add auth, history, settings. This is what gets you hired.", badge: "PROJECT" },
    ]
  },
  {
    title: "Production, Deployment & Job-Ready",
    type: "BOTH",
    duration: "4–5 weeks",
    resources: "LangSmith docs, Helicone, Railway / Fly.io, Levels.fyi, YC job board",
    items: [
      { title: "LLM observability & tracing", description: "LangSmith or Helicone for tracing chains/agents. You cannot debug what you can't observe.", badge: "AI" },
      { title: "Cost & latency optimization", description: "Model routing (cheap vs powerful), prompt caching, batching, async queues for heavy workloads.", badge: "AI" },
      { title: "Backend API for AI apps", description: "Node/Hono or FastAPI (Python), secure LLM proxy, rate limiting per user, streaming endpoints.", badge: "CORE" },
      { title: "Docker + CI/CD", description: "Containerize your stack, GitHub Actions pipeline, deploy to Railway or Fly.io.", badge: "CORE" },
      { title: "Capstone: full AI-powered product", description: "End-to-end app: Next.js frontend + LangGraph agent backend + RAG + auth + deployed. Your hero portfolio piece.", badge: "PROJECT" },
      { title: "System design for AI systems", description: "How to design a scalable RAG pipeline, agent orchestration at scale, async job queues, fallback strategies.", badge: "JOB" },
      { title: "Target roles & resume", description: "AI Engineer, Full-Stack + AI, LLM Application Engineer. Frame your projects with metrics. Link live demos.", badge: "JOB" },
      { title: "Mock interviews × 5", description: "Mix of system design (design a RAG system), coding (DSA basics), and project deep-dives.", badge: "JOB" },
    ]
  }
];

async function main() {
  console.log('Clearing existing roadmap data...');
  await prisma.roadmapPhase.deleteMany();

  for (let i = 0; i < phasesData.length; i++) {
    const phase = phasesData[i];
    console.log('Creating phase: ' + phase.title);
    
    await prisma.roadmapPhase.create({
      data: {
        title: phase.title,
        type: phase.type,
        duration: phase.duration,
        order: i,
        resources: JSON.stringify(phase.resources),
        items: {
          create: phase.items.map((item, index) => ({
            title: item.title,
            description: item.description,
            badge: item.badge,
            order: index
          }))
        }
      }
    });
  }
  console.log('Seeding finished!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
