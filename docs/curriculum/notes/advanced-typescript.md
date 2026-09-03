# Revision note — Advanced TypeScript

For `TypeScript & Modern Web Foundation :: TypeScript — strict mode & advanced types`.

**Read this in ~15 minutes.** It is a refresher, not a tutorial — it assumes you
have done the item once and want the shape back before a PR or an interview.
Resources for learning it the first time are in `roadmap-resources.md`.

Examples are drawn from this repo where possible, because a revision note about
someone else's `Animal | Dog` example is a revision note you will not reread.

---

## 1. The one idea

**Make the illegal state unrepresentable.** Everything below is a technique for
that one goal. If a type change does not remove a state your code previously had
to defend against at runtime, it is decoration.

The test: after the change, can you delete a runtime check? If not, ask what the
type bought.

---

## 2. Discriminated unions — the highest-value pattern

A union of object types sharing a literal-typed field. That field is the tag the
compiler narrows on.

```ts
type LinkKind = 'DEFAULT' | 'CUSTOM';

type RoadmapLink =
  | { kind: 'DEFAULT'; title: string; url: string; seededAt: Date }
  | { kind: 'CUSTOM'; title: string; url: string; notes: string | null };

function describe(link: RoadmapLink) {
  switch (link.kind) {
    case 'DEFAULT':
      return link.seededAt.toISOString(); // `notes` is not in scope here
    case 'CUSTOM':
      return link.notes ?? 'no notes';    // `seededAt` is not in scope here
  }
}
```

**Why it beats optional fields.** The alternative — one type with
`seededAt?: Date` and `notes?: string` — permits both fields, neither field, and
the wrong field for the kind. Three illegal states, each of which becomes a
defensive `if` somewhere. The union permits exactly two states.

**Where this repo needs it.** `client/src/app/(dashboard)/roadmap/page.tsx`
carries six `// eslint-disable-next-line @typescript-eslint/no-explicit-any`
comments, and `PhaseCard.tsx` and `ItemRow.tsx` take `phase: any`,
`item: any`, `userProgress: any[]`. Across the client there are **24 such
escapes in 7 files**, all of them in `/roadmap` and `/dsa`. Every one is a
shape the server already knows precisely. That is the exercise.

### Exhaustiveness — the part that pays rent

```ts
function assertNever(value: never): never {
  throw new Error(`Unhandled variant: ${JSON.stringify(value)}`);
}

function toneFor(badge: BadgeType) {
  switch (badge) {
    case 'CORE':    return 'craft';
    case 'AI':      return 'devai';
    case 'PROJECT': return 'career';
    case 'JOB':     return 'finance';
    case 'DESIGN':  return 'health';
    case 'THEORY':  return 'neutral';
    default:        return assertNever(badge);
  }
}
```

Add a variant to the Prisma `BadgeType` enum and this **fails at compile time**,
naming the file. Without it you ship a silent fallback.

This matters here specifically: `CLAUDE.md` says enums live in Prisma and are
re-exported to the client, and MB-1 extends `PhaseType` and `BadgeType`. The
current `ItemRow.tsx` uses `BADGE[item.badge] ?? BADGE.CORE` — a `Record<string, …>`
lookup with a fallback, which will silently render a new `DESIGN` badge as
"Core" rather than failing. Typing the map as
`Record<BadgeType, {...}>` turns that into a build error instead.

---

## 3. `satisfies` — check without widening

The problem `satisfies` solves, in one pair of examples:

```ts
// Annotation: checked, but the value's precision is thrown away.
const NAV: Record<string, { href: string }> = { roadmap: { href: '/roadmap' } };
NAV.typo.href;          // no error — the index signature permits any key

// `satisfies`: checked AND the literal keys survive.
const NAV2 = { roadmap: { href: '/roadmap' } } satisfies Record<string, { href: string }>;
NAV2.typo;              // Error: Property 'typo' does not exist
NAV2.roadmap.href;      // string
```

**Rule of thumb.** Use `satisfies` for configuration objects you will read keys
off — nav maps, token maps, badge/tone maps, seed data. Use a plain annotation
for values you only pass along. `as` is neither: it silences the compiler rather
than consulting it.

**`as const` vs `satisfies`.** `as const` freezes the value to its narrowest
literal type but checks nothing. `satisfies` checks against a contract but does
not freeze. They compose — `{...} as const satisfies Config` — and that
combination is usually what you want for a lookup table.

---

## 4. Generics — when, not how

The rule that saves the most time: **a generic is for relating two things.** If
a type parameter appears exactly once in a signature, it should almost certainly
be a plain parameter or `unknown`.

```ts
// Pointless — T appears once. This is just `(x: unknown) => void`.
function log<T>(value: T): void {}

// Earns it — the return type is tied to the input.
function firstOr<T>(items: T[], fallback: T): T {
  return items[0] ?? fallback;
}

// Earns it — the key relates to the value.
function pluck<T, K extends keyof T>(items: T[], key: K): T[K][] {
  return items.map((item) => item[key]);
}
```

`K extends keyof T` is the single most useful constraint in application code.
It is what makes `pluck(progress, 'completed')` return `boolean[]` and
`pluck(progress, 'typo')` a compile error.

---

## 5. Narrowing you should recognise on sight

| Guard | Narrows |
|---|---|
| `typeof x === 'string'` | primitives only |
| `Array.isArray(x)` | `T[]` out of `T \| T[]` |
| `'notes' in link` | by property presence — the fallback when there is no tag |
| `x !== null` / truthiness | nullability. Beware `0` and `''` |
| `x.kind === 'CUSTOM'` | discriminated union — prefer this to `in` |

**Custom type predicates** — for when a runtime check is not one the compiler
understands:

```ts
function isCompleted(p: UserProgress): p is UserProgress & { completedAt: Date } {
  return p.completed && p.completedAt !== null;
}
```

The cost is real and worth naming: the compiler **trusts the predicate without
verifying it**. A wrong `x is T` is an unchecked cast wearing a nicer hat. Keep
the body trivially obvious, or use zod at the boundary instead — which is what
this repo already does at its controllers, and the better default.

---

## 6. Utility types worth knowing cold

`Pick` / `Omit` / `Partial` / `Required` / `Readonly` / `Record<K, V>` /
`ReturnType<F>` / `Awaited<T>` / `NonNullable<T>` / `Parameters<F>`.

The two that come up in interviews and get fumbled:

```ts
// Distributive: unions are mapped member-by-member.
type Nullable<T> = T | null;
type A = Nullable<string | number>;        // string | null | number | null

// Conditional types distribute over naked type parameters — often surprising.
type ToArray<T> = T extends unknown ? T[] : never;
type B = ToArray<string | number>;         // string[] | number[]   (not (string|number)[])
```

To **stop** distribution, wrap both sides in a tuple: `[T] extends [unknown] ? T[] : never`.

**Derive, do not restate.** The rule for this repo: types come from Prisma's
generated client and flow outward. `Awaited<ReturnType<typeof RoadmapService.getAll>>`
is a type that cannot drift from the service. A hand-written interface next to
it can, and will.

---

## 7. `strict` — what each flag actually catches

The repo is already `strict: true`. Worth knowing what that bundles:

- `strictNullChecks` — the one that matters. `null` and `undefined` stop being
  members of every type.
- `noImplicitAny` — an un-annotated parameter is an error. Note this does *not*
  catch an **explicit** `any`, which is why the client accumulated 7+ of them
  behind eslint-disable comments.
- `strictFunctionTypes` — parameter positions checked contravariantly.
- `strictPropertyInitialization` — a class field must be assigned in the constructor.

Two that `strict` does **not** include and are worth adding:

- `noUncheckedIndexedAccess` — makes `arr[0]` return `T | undefined`, which is
  the truth. Noisy to adopt, and it catches real bugs.
- `exactOptionalPropertyTypes` — distinguishes "absent" from "present and
  `undefined`". Matters when writing to Prisma, where the two mean different
  things.

---

## 8. The five-minute version

1. Illegal states unrepresentable. Delete a runtime check or the type earned nothing.
2. Discriminated union over optional fields.
3. `assertNever` in every `default` over a union — it is how enum changes fail loudly.
4. `satisfies` for config you read keys off; annotation for values you pass along; `as` almost never.
5. A type parameter used once is not a generic.
6. `K extends keyof T` is the workhorse constraint.
7. Derive types from Prisma; do not restate them.
8. A type predicate is an unchecked assertion — prefer zod at the boundary.
9. `strict` does not catch explicit `any`. Grep for it.

---

## 9. Where to apply it in this repo

Ordered by value, and all of it real work rather than exercise:

1. **`client/src/hooks/use<Domain>.ts`** — the root cause. Not one `useQuery`
   in the client passes a type argument, so every `queryFn` returning
   `res.data` from axios is inferred `any`, and that `any` flows into every
   component that consumes the hook. The 24 eslint-disable comments are the
   symptom; this is the disease. Fixing it removes the most `any` per line
   edited, so do it first.
2. **`roadmap/page.tsx`, `PhaseCard.tsx`, `ItemRow.tsx`** — 12 of the 24
   escapes. The `phase`/`item`/`userProgress` shapes are exactly Prisma's
   models. The `/dsa` trio is the other 12, and the same fix applies.
3. **`Record<BadgeType, …>` on the badge and phase-type maps** — makes MB-1's
   enum extension a compile error instead of a silent "Core" badge.
4. **A shared `ApiResponse<T>` union** for the ADR-14 envelope:
   `{ data: T } | { error: { code: ErrorCode; message: string; details?: unknown } }`.
   The auth pages rendered an error *object* as a React child before D0 — that
   bug is unrepresentable once the envelope is a discriminated union.

Item 4 is the one to do first if you only do one. It converts a class of bug
this repo has already shipped once into a build failure.
