# Curriculum — System Design (HLD + LLD)

Source of truth for the DESIGN track (ADR-12). `server/prisma/seedCurriculum.js`
parses the phase blocks below; prose outside them is ignored by the parser.

---

## Where this starts from

This is not a beginner track. It is calibrated to what already exists on disk.

**Already built, in `Code_Work/LLD/`:** Adapter, Builder (three variants — simple,
with director, step builder), Chain of Responsibility, Command, Composite, plus
two machine-coding attempts (DatingApp, NotificationService).

**Already built, in `Capstone_Projects/TrustDesk/`:** a real multi-tenant system
with 29 ADRs across five design iterations — RBAC, layered guardrails, an eval
harness with adversarial cases, idempotency keys, pgvector similarity search,
SSE and WebSocket surfaces, model-tier adapters, and magic-link auth. 604 tests.

So the gaps are specific, and this track targets exactly those:

- **LLD:** the behavioural patterns beyond Command and CoR, and machine-coding
  under time pressure. The patterns already done are marked below and should be
  ticked complete on the first seed rather than re-studied.
- **HLD:** the quantitative half. TrustDesk proves the qualitative half — you can
  make and defend architectural decisions. What is missing is estimation,
  replication and consistency, sharding, and the standard case-study catalogue
  that interviews draw from.

**Mark complete on first seed** (already done, seeded for completeness):
Adapter, Builder, Chain of Responsibility, Command, Composite.

**Pace.** ~2.5 h/week (`docs/cadence.md`), which is one item per week.

**The honest arithmetic.** This track is **51 items**, of which 5 are already
done, leaving 46. At one per week that is **about eleven months** — and the
machine-coding and case-study items are realistically more than a week each, so
treat eleven months as a floor rather than an estimate. Do not compress it by
skipping the artifact rule below; compress it by cutting scope, deliberately,
using the subset that follows.

**If you only have six months** — the interview-critical subset, 24 items:
everything in *Principles Before Patterns*; Factory, Singleton, Decorator and
Proxy from the structural phase; Strategy, Observer and State from the
behavioural phase; Parking Lot, LRU cache and rate limiter, and BookMyShow from
machine coding; the entire *Quantitative Half* phase; URL shortener, news feed,
chat, notification system and payment from the case studies; and all four
interview-practice items. The remainder is depth you will want eventually, not
depth an interview will reach.

**The artifact rule.** An item is complete only when something exists that did
not before: a runnable implementation in `Code_Work/LLD/<Pattern>/`, or a design
document. No artifact, no tick. Reading is not progress.

---

### Phase: LLD — Principles Before Patterns
Type: DESIGN
Duration: 2 weeks
Resources: refactoring.guru, Head First Design Patterns, Clean Code chapters 1-6, your own TrustDesk src/domain

| Item | Badge | Description |
|---|---|---|
| SOLID, applied to code you already wrote | THEORY | Take three files from TrustDesk and name which principle each honours or violates. Principles learned on toy examples do not transfer; principles found in your own code do. |
| Composition over inheritance | THEORY | Where inheritance is genuinely right versus where it is a shortcut that will hurt. Rewrite one inherited hierarchy as composition. |
| Dependency injection without a framework | CORE | Constructor injection, interface boundaries, and why TrustDesk's ModelAdapter is the pattern that makes its tests possible. |
| Designing for testability | CORE | Pure core, imperative shell. Why a function that reads the clock or the database is hard to test, and what to do instead. |

### Phase: LLD — Creational and Structural Patterns
Type: DESIGN
Duration: 4 weeks
Resources: refactoring.guru, Head First Design Patterns, existing Code_Work/LLD implementations

| Item | Badge | Description |
|---|---|---|
| Adapter — already built | DESIGN | Completed in Code_Work/LLD/AdapterDesignPattern. Seeded for completeness; tick on first run. |
| Builder — already built | DESIGN | Completed in three variants in Code_Work/LLD/Builder. Seeded for completeness; tick on first run. |
| Composite — already built | DESIGN | Completed in Code_Work/LLD/CompositeDesignPattern. Seeded for completeness; tick on first run. |
| Factory Method and Abstract Factory | DESIGN | The distinction most people get wrong in interviews. Implement both against one domain so the difference is felt rather than memorised. |
| Singleton, and why it is usually wrong | DESIGN | Implement it, then implement the same need with DI and compare testability. Knowing when not to use a pattern is the senior signal. |
| Decorator | DESIGN | Layered behaviour without subclass explosion. Natural fit for the guardrail layering you already built in TrustDesk. |
| Proxy | DESIGN | Lazy loading, access control, caching proxies. Contrast with Decorator, which is the pair interviewers probe. |
| Facade and Bridge | DESIGN | Simplifying a subsystem versus decoupling abstraction from implementation. One implementation covering both. |
| Flyweight | DESIGN | Memory-conscious object sharing. Rare in web work, common in interview questions. |

### Phase: LLD — Behavioural Patterns
Type: DESIGN
Duration: 4 weeks
Resources: refactoring.guru, Head First Design Patterns

| Item | Badge | Description |
|---|---|---|
| Chain of Responsibility — already built | DESIGN | Completed in Code_Work/LLD/ChainOfResponsibility. Tick on first run. |
| Command — already built | DESIGN | Completed in Code_Work/LLD/CommandDesignPattern. Tick on first run. |
| Strategy | DESIGN | The most useful pattern in day-to-day work. Swap an algorithm at runtime without conditionals spreading through the codebase. |
| Observer | DESIGN | Event notification and its failure modes — leaked subscriptions, ordering assumptions, synchronous cascades. |
| State | DESIGN | Model TrustDesk's ticket lifecycle as an explicit state machine and compare it to the conditional logic that implements it today. |
| Template Method | DESIGN | Fixed algorithm skeleton with variable steps. Contrast with Strategy — the interview follow-up. |
| Iterator and Mediator | DESIGN | Traversal decoupled from structure, and many-to-many collaboration reduced to a hub. |
| Memento and Visitor | DESIGN | Undo or snapshot state, and adding operations to a structure without modifying it. The two least-used, still asked. |

### Phase: LLD — Machine Coding Under Time Pressure
Type: DESIGN
Duration: 6 weeks
Resources: Arpit Bhayani machine coding, existing DatingApp and NotificationService attempts

| Item | Badge | Description |
|---|---|---|
| Parking Lot | PROJECT | The canonical warm-up. 90 minutes, working code, tests, clean interfaces. Time yourself honestly. |
| Elevator system | PROJECT | Scheduling strategy behind an interface. Where State and Strategy meet a real problem. |
| Splitwise | PROJECT | Expense splitting and settlement simplification. The domain modelling is the difficulty, not the algorithm. |
| LRU cache and rate limiter | PROJECT | Two small problems that come up constantly. Implement token bucket and sliding window, not just fixed window. |
| BookMyShow seat booking | PROJECT | Concurrency is the whole question. Two users, one seat, no double booking. |
| Vending machine or ATM | PROJECT | A clean State pattern exercise with real edge cases around change and stock. |
| Notification service — revisit | PROJECT | You have an early version. Redo it with Strategy for channels, Decorator for retry and throttle, and tests. Compare the two. |

### Phase: HLD — The Quantitative Half
Type: DESIGN
Duration: 6 weeks
Resources: Designing Data-Intensive Applications (Kleppmann), System Design Primer (GitHub), Alex Xu System Design Interview vol 1-2

| Item | Badge | Description |
|---|---|---|
| Back-of-envelope estimation | THEORY | QPS, storage growth, bandwidth, and the latency numbers every engineer should know. The single most common gap in otherwise strong candidates. |
| Replication and consistency models | THEORY | Leader-follower, multi-leader, quorums. Strong versus eventual, read-your-writes, monotonic reads. Kleppmann chapter 5. |
| Partitioning and sharding | THEORY | Hash versus range, hotspots, rebalancing, and why the shard key is the decision you cannot undo. |
| Caching strategies and invalidation | THEORY | Cache-aside, write-through, write-behind. TTL versus explicit invalidation, thundering herd, stampede protection. |
| Load balancing and traffic management | THEORY | L4 versus L7, health checks, circuit breakers, backpressure, graceful degradation. |
| Queues and event-driven architecture | THEORY | At-least-once versus exactly-once, idempotent consumers, ordering guarantees, dead-letter queues. You built idempotency keys in TrustDesk — generalise the idea. |
| Rate limiting at scale | THEORY | Distributed counters, the algorithms compared, and where to enforce. TrustDesk enforces per-IP; extend the reasoning to per-tenant and per-key. |
| Storage selection | THEORY | Relational, document, key-value, wide-column, blob, search index. Choosing on access pattern rather than familiarity. |
| Observability and SLOs | THEORY | Metrics, logs, traces. SLI, SLO, error budget. What to alert on and what to merely record. |

### Phase: HLD — Case Studies
Type: DESIGN
Duration: 8 weeks
Resources: Alex Xu System Design Interview, System Design Primer, Gaurav Sen, engineering blogs of the systems being modelled

| Item | Badge | Description |
|---|---|---|
| URL shortener and pastebin | DESIGN | The gentle opener. Key generation, collision handling, read-heavy caching, analytics. Write the design doc even though it feels easy. |
| Distributed rate limiter | DESIGN | Turn the theory item into a full design with capacity numbers and failure behaviour. |
| News feed and timeline | DESIGN | Fan-out on write versus read, the celebrity problem, ranking. The classic tradeoff conversation. |
| Chat system | DESIGN | WebSocket connection management, presence, delivery receipts, offline queues. You have shipped a WebSocket surface in TrustDesk — build from there. |
| Notification system at scale | DESIGN | Multi-channel delivery, retries, deduplication, user preferences, throttling. Direct extension of your LLD notification work. |
| Search and autocomplete | DESIGN | Inverted index, ranking, typeahead latency budgets, index freshness. |
| Payment system | DESIGN | Idempotency, reconciliation, the double-spend problem, audit trails. The system where correctness beats availability. |
| Video streaming or object storage | DESIGN | Chunked upload, transcode pipeline, CDN strategy, cost. The bandwidth-dominated design. |
| Ride hailing or geospatial matching | DESIGN | Geohashing, proximity search, real-time supply and demand matching. |
| Design LoveTeddy at scale | PROJECT | The one that matters most. Take your own live product to a million gifts a month. Media pipeline, share-link read path, payment reconciliation, and where it actually breaks first. Write it as an HLD doc in the LoveTeddy repo. |

### Phase: Design Interview Practice
Type: DESIGN
Duration: ongoing
Resources: pramp, interviewing.io, a peer, or a recorded solo run

| Item | Badge | Description |
|---|---|---|
| Structure a 45-minute HLD round | JOB | Requirements, scale estimate, API sketch, data model, architecture, bottlenecks, tradeoffs. Practise the clock, not just the content. |
| Five recorded mock HLD rounds | JOB | Record yourself, watch it back once. Uncomfortable and the fastest correction available. |
| Three recorded mock LLD or machine-coding rounds | JOB | 60 to 90 minutes, working code, narrated tradeoffs. |
| Build a one-page design template | JOB | Your own reusable structure so the opening five minutes of any round are automatic. |
