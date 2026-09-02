# Design system (Milestone D0)

The client's visual layer, rebuilt so that a theme can exist at all. Ships the
token architecture, a light/dark/system runtime, the shared component layer the
pages had been duplicating by hand, and the guard that keeps all three true
(ADR-16). `docs/design.md` is the standing specification; this file records what
was built and what it still owes.

**Status:** complete — 2026-08-30. Client-only: no table, no column, no
migration, no server file touched.

---

## What it does

| Concern | Where | Notes |
|---|---|---|
| Token architecture | `client/src/app/globals.css` | Three tiers; the only file allowed a colour literal |
| Theme runtime | `client/src/lib/theme.ts`, `components/theme/ThemeProvider.tsx` | `light` / `dark` / `system`, persisted as `ppt-theme` |
| No-flash paint | `client/src/app/layout.tsx` | Inline synchronous `<head>` script — see below |
| Theme control | `client/src/components/theme/ThemeToggle.tsx` | Three-way radiogroup in `AppHeader` |
| Shell | `components/layout/{AppHeader,Sidebar,PageHeader,navigation}.tsx` | Sidebar goes off-canvas below `lg` |
| Primitives | `client/src/components/ui/` | 5 re-tokenized, 7 added |
| Dashboard | `client/src/components/dashboard/` | Hero, stat tiles, charts, countdown, skeleton |
| Cadence constants | `client/src/lib/cadence.ts` | The 5-of-7 week rule; deleted at MA-12 |
| Token guard | `client/scripts/check-tokens.mjs` | `npm run check:tokens` |
| Specification | `docs/design.md` | Every oklch value, with its contrast ratio |

## Data it owns

None. D0 adds no table, no column and no migration. The only persisted state is
two `localStorage` keys in the browser: `ppt-theme`, and the pre-existing
`dashboard-goal-date`.

## Endpoints

None added, none changed. The dashboard reads exactly what
`GET /api/analytics/overview` already returned; every new figure on it is
derived client-side from `timeTracking.weekTrend`.

## The token architecture

Three tiers, and a component may only reference the lower two.

| Tier | Example | Component may use it |
|---|---|---|
| Primitive | a raw `oklch()` value | **No** — `globals.css` only |
| Semantic | `--background`, `--card`, `--muted-foreground`, `--border` | Yes |
| Domain | `--pillar-craft`, `--chart-1…6`, `--success` | Yes |

The rule that makes the whole thing hold: **every chromatic token is declared
twice, once per theme.** V1's palette defined `--chart-1…5` identically in both
`:root` and `.dark`, which is the tell that the light values were never looked
at. A hue that clears 4.5:1 on white is unreadable on a near-black canvas, so
`--primary`, the six pillar tokens and the status tokens all shift lightness
between themes, and `--primary-foreground` inverts. Only the neutrals mirror.

Two smaller decisions worth keeping:

- `--border` is **opaque** in both themes. V1 used `oklch(1 0 0 / 10%)`, which
  composites differently over every surface it crosses, so one border read as
  three different greys on a single screen.
- `color-scheme` is declared per theme. Without it the native date picker in
  `/daily-time` and `GoalCountdown` renders as a dark widget on a light page.

## How the theme survives first paint

`THEME_SCRIPT` in `client/src/lib/theme.ts` is injected into `<head>` as raw
text and runs **synchronously, before body paint**. It reads `ppt-theme`,
resolves `system` against `matchMedia`, and writes both `.dark` and
`dataset.theme` onto `documentElement`.

It has to be inline and blocking. Any deferred alternative — including doing
the read in `ThemeProvider`'s effect — paints the wrong theme for one frame,
which is precisely the flash the whole mechanism exists to prevent.

`ThemeProvider` therefore **seeds from the DOM the script already wrote**
(`documentElement.dataset.theme`) rather than re-reading `localStorage`. Two
readers of the same key can disagree; one writer and one reader cannot.

`next-themes` does this same job and was rejected — see ADR-16.

## What was removed

The three findings that made a light theme impossible, rather than merely absent:

1. **`<html className="dark">`** hardcoded in `layout.tsx`.
2. **`bg-neutral-900 text-white`** on the dashboard shell, overriding
   `--background` so the `.dark` palette was never actually rendered.
3. **Two injected `<style dangerouslySetInnerHTML>` blocks**, in `/roadmap` and
   `/dsa`, each containing `body { background-color:#0a0a0f !important }` plus a
   render-blocking Google Fonts `@import` in the middle of the body. The
   `!important` defeated any theme globally, from any route.

Also gone: the `body` radial-gradient wash, the `orb-float` animations, the
card hover-lift, and the cyan→emerald button gradient.

Four latent bugs were fixed on the way through, none of them cosmetic:

| Bug | Effect |
|---|---|
| `--font-sans: var(--font-sans)` — self-referential | Geist never loaded; the app rendered in the browser default sans |
| `bg-white/4` on all five dashboard stat tiles | Not a real Tailwind utility — the tiles had no background at all |
| `@import "shadcn/tailwind.css"` | Resolves to no file in `node_modules`; `shadcn` is a CLI |
| Auth pages read `.response.data.error` directly | `/api/auth` is ADR-14-converted, so that is an **object** — rendering it throws. Now uses the existing `getErrorMessage` |

## The dashboard

Opens on today, per `docs/cadence.md`: hours logged today split by pillar, the
week's total and its days-logged count against the 5-of-7 rule, and the first
line of the next-day plan. The streak is a **chip, not the headline** —
cadence.md §6 is explicit that "the daily streak is a nudge, not the score".

The stat row is four tiles of identical shape, down from five mismatched ones.
*Activity Level* was dropped: it read `lastActive ? 'Active' : 'New'` and so
could never say anything but "Active". *Time Logged* was dropped as a tile
because it was a four-line text list in a row of big numbers; its content is
now the hero.

`GoalCountdown` lost its hardcoded `'2026-06-21'` default, a date that has
since passed — the dashboard's most prominent element had been reading
"Goal Date Reached" permanently. Unset now prompts; a past date says so.

Charts pass `var(--chart-N)` straight into SVG attributes. SVG resolves CSS
variables natively and re-evaluates on class change, so both charts re-theme
with no `useTheme()` read, no colour map and no re-render.

## Known gaps

Carried forward deliberately; each has an owner.

| Gap | Owner |
|---|---|
| No target denominators anywhere — `LearningTarget.*` is `String`, and invariant 4 forbids a hardcoded number. `StatCard` already takes an optional `target` | MA-6 |
| `lib/cadence.ts` duplicates `docs/cadence.md` §6 client-side; it belongs in the weekly-review endpoint | MA-12 |
| `/fitness`, `/financial-goals`, `/daily-time` got a token swap and no redesign — they are rebuilt on the metric engine | MA-8, MA-10, MA-11 |
| The dashboard reserves a slot for Weekly Review, which HLD §7 calls the primary surface | MA-12 |
| `/job-applied` still auto-seeds twelve hardcoded company names on first mount — a write as a side effect of a render | not scheduled |
| Five `set-state-in-effect` lint exemptions, all post-mount reads of external state (localStorage, DOM) | acceptable; `useSyncExternalStore` if they multiply |
| Theming is verified by eye. There is no client test runner | out of V2 scope (`CLAUDE.md` §Stack) |

## Verifying it

```bash
cd client
npm run check:tokens   # zero colour literals outside globals.css
npm run lint           # green
npm run build          # strict TS + Tailwind compile, 14 routes

cd ../server && npm test   # unchanged by D0
```

The guard is worth testing occasionally, since a guard that never fires is
worthless:

```bash
# introduce a literal, confirm it fails, then revert
sed -i '' 's|bg-muted|bg-neutral-800|' src/components/ui/skeleton.tsx
npm run check:tokens   # must exit 1 and name the file and line
git checkout src/components/ui/skeleton.tsx
```

By hand, since there is no client suite:

1. **No flash** — hard-reload `/dashboard` in each of the three theme states.
2. **Both themes on all 13 routes**, watching `/roadmap` and `/dsa` in
   particular; those are the two whose `!important` body colour was removed.
3. **System-follow** — set System, flip the OS appearance, no reload.
4. **Charts in light mode** — both charts and both tooltips must stay legible.
5. **375 / 768 / 1280** — sidebar off-canvas below `lg`, no horizontal scroll.
6. **Reduced motion** — transitions stop.
