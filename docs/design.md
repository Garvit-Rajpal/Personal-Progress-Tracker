# Design — Personal Progress Tracker

Source of truth for the client's visual language (ADR-16). Every colour,
spacing value, radius and component variant in `client/` is calibrated to this
file. **If a colour in the code disagrees with a colour here, the code is
wrong** — the same contract `docs/cadence.md` holds over the numbers.

The rule that makes this enforceable: **no raw colour literal may appear in
`client/src/` outside `globals.css`.** `client/scripts/check-tokens.mjs` fails
the build if one does.

---

## 1. Why this document exists

V1 shipped three competing visual languages — a glass landing page, a dashboard
whose hero block was copy-pasted into seven files, and a brutalist `/roadmap`
and `/dsa` pair that injected `<style>` tags carrying
`body { background-color:#0a0a0f !important }`. The token layer defined by
shadcn was present and roughly 95% unused: `dark:` appeared seven times in the
entire client, against **547 hardcoded colour literals across 25 files**.

The visible symptom was "the dashboard looks basic and very dark". The actual
cause was that there was no system — only 25 files each making local colour
decisions, and no light theme could exist because there was nothing central to
switch.

This is a **data application**. Someone opens it to find out whether they are
on track, and the answer has to be readable at a glance and trustworthy. That
sets the visual priorities, in order:

1. **Legibility of numbers** over decoration.
2. **A calm surface**, so a bad week does not look like an error state.
3. **One accent**, used to mean "this is actionable", never as garnish.
4. **Motion that confirms, never entertains.**

Anti-goals, stated so they stop coming back: no glassmorphism, no blur orbs, no
gradient text, no cards that lift under the cursor, no animated counters.

---

## 2. Token architecture

Three tiers. Components may only ever reference tier 2 and tier 3.

| Tier | What it is | May a component use it? |
|---|---|---|
| 1 — Primitive | Raw `oklch()` values | **No.** Only in `globals.css` |
| 2 — Semantic | `--background`, `--card`, `--muted-foreground`, `--primary`, `--border` | Yes |
| 3 — Domain | `--pillar-*`, `--chart-*`, `--success` / `--warning` / `--danger` | Yes |

Everything is `oklch(L C H)`. Lightness is perceptual, so a fixed L reads as
the same lightness across hues — which is what lets the six pillar colours sit
next to each other in a chart legend without one of them shouting.

### The rule most dual-theme palettes get wrong

**An accent is not the same colour in both themes.** A hue that reaches 4.5:1
against white is far too dark to read against a near-black background. Every
chromatic token below is therefore declared **twice**, with a different
lightness, and the two values are chosen so their contrast against their own
background matches. Only the neutrals are mirrored.

---

## 3. Colour

Contrast ratios are against that theme's `--background`, computed with the WCAG
2.1 formula.

### 3.1 Neutrals — light

| Token | Value | Role | Contrast |
|---|---|---|---|
| `--background` | `oklch(0.985 0.002 265)` | app canvas | — |
| `--card` | `oklch(1 0 0)` | card / panel surface | — |
| `--muted` | `oklch(0.965 0.004 265)` | inset wells, table stripes | — |
| `--foreground` | `oklch(0.21 0.021 265)` | body text, metric figures | 15.6:1 |
| `--muted-foreground` | `oklch(0.545 0.025 265)` | labels, captions, axes | 4.75:1 |
| `--border` | `oklch(0.905 0.006 265)` | decorative separators | 1.3:1 |
| `--border-strong` | `oklch(0.66 0.015 265)` | input and control outlines | 3.1:1 |

### 3.2 Neutrals — dark

| Token | Value | Role | Contrast |
|---|---|---|---|
| `--background` | `oklch(0.175 0.014 265)` | app canvas | — |
| `--card` | `oklch(0.215 0.016 265)` | card / panel surface | — |
| `--muted` | `oklch(0.26 0.017 265)` | inset wells | — |
| `--foreground` | `oklch(0.96 0.005 265)` | body text, metric figures | 15.1:1 |
| `--muted-foreground` | `oklch(0.70 0.018 265)` | labels, captions, axes | 7.1:1 |
| `--border` | `oklch(0.30 0.016 265)` | decorative separators | — |
| `--border-strong` | `oklch(0.42 0.02 265)` | input and control outlines | 3.2:1 |

Dark mode is a **deep slate, not black**, and elevation is expressed by a
*lighter* surface rather than a heavier shadow — shadows are close to invisible
on a dark canvas, so V1's `shadow-[0_24px_80px_-48px_rgba(0,0,0,0.9)]` bought
nothing but paint cost.

`--border` is opaque in both themes. V1 used `oklch(1 0 0 / 10%)`, which
composites differently over every surface it crosses, so the same border read
as three different greys on one screen.

### 3.3 Accent

| Token | Light | Dark |
|---|---|---|
| `--primary` | `oklch(0.52 0.19 275)` | `oklch(0.70 0.15 275)` |
| `--primary-foreground` | `oklch(0.99 0.002 265)` | `oklch(0.18 0.03 275)` |
| `--ring` | = `--primary` | = `--primary` |

Indigo, one accent only. White-on-primary is 5.5:1 in light; dark-on-primary is
7.0:1 in dark. Note the foreground **flips** — in dark mode the accent is light
enough that it needs dark text on top.

### 3.4 Pillar and chart ramp

Six hues, one per pillar in `docs/HLD_v2.md` §3. `--chart-1…6` alias these in
order, so a chart series and its pillar's badge are always the same colour.

| Token | Pillar | Light | Dark |
|---|---|---|---|
| `--pillar-craft` | DSA / craft | `oklch(0.52 0.19 275)` | `oklch(0.72 0.15 275)` |
| `--pillar-devai` | Dev + AI | `oklch(0.52 0.21 305)` | `oklch(0.73 0.16 305)` |
| `--pillar-fitness` | Fitness | `oklch(0.52 0.13 160)` | `oklch(0.75 0.14 160)` |
| `--pillar-finance` | Finance | `oklch(0.55 0.13 75)` | `oklch(0.78 0.14 80)` |
| `--pillar-career` | Career | `oklch(0.53 0.11 230)` | `oklch(0.74 0.11 230)` |
| `--pillar-health` | Health | `oklch(0.55 0.19 15) ` | `oklch(0.72 0.15 15)` |

All six clear 4.5:1 against their own background, so they are safe for badge
text as well as chart strokes. Hues are spaced ≥45° apart except craft/devai
(30°), which are adjacent on purpose — they are the two halves of one learning
block and read as siblings.

V1 used a four-colour array for the donut, so a fifth category silently reused
the first colour. Six tokens cover every pillar.

### 3.5 Status

| Token | Light | Dark |
|---|---|---|
| `--success` | `oklch(0.52 0.13 155)` | `oklch(0.75 0.14 155)` |
| `--warning` | `oklch(0.55 0.13 75)` | `oklch(0.78 0.14 80)` |
| `--danger` | `oklch(0.53 0.20 25)` | `oklch(0.70 0.17 20)` |

Reserved for state. A red number means something is wrong; it never means
"this is the fitness pillar".

---

## 4. Typography

Geist Sans for everything, Geist Mono for identifiers and code. Both were
already loaded in `layout.tsx` but never applied — `@theme` declared
`--font-sans: var(--font-sans)`, a self-reference that resolves to nothing, so
V1 rendered in the browser default sans throughout.

| Role | Size / line-height | Weight | Tracking |
|---|---|---|---|
| Metric — hero | `2.25rem / 1.1` | 600 | `-0.02em` |
| Metric — tile | `1.75rem / 1.15` | 600 | `-0.02em` |
| Page title | `1.5rem / 1.25` | 600 | `-0.015em` |
| Section title | `1rem / 1.4` | 600 | — |
| Body | `0.875rem / 1.6` | 400 | — |
| Label / caption | `0.75rem / 1.4` | 500 | `0.01em` |

**Every number renders with `font-variant-numeric: tabular-nums`.** Proportional
digits change width as values tick, so a column of figures visibly shifts on
each refetch. This is applied via a `.metric` class, not per component.

Labels are sentence case, never uppercase-with-letterspacing. Units (`h`, `%`,
`days`) are `--muted-foreground` at the body size next to a `--foreground`
figure, so the number reads first.

---

## 5. Space, radius, elevation

Spacing is Tailwind's 4px scale. Card padding `1.25rem`, grid gap `1rem`,
section gap `2rem`. Page content caps at `max-w-6xl`.

Radius derives from `--radius: 0.625rem` through the existing computed scale in
`@theme`. Cards use `--radius-xl`, controls `--radius-md`, badges and pills
full. V1's ad-hoc `rounded-[2rem]` hero is gone.

Elevation has three levels and no more:

| Level | Light | Dark |
|---|---|---|
| Flat | `--background` | `--background` |
| Raised (card) | `--card` + `--border` + a 1px hairline shadow | `--card` + `--border`, no shadow |
| Overlay | `--card` + a soft shadow | `--card` + `--border-strong` |

---

## 6. Motion

A budget, not a palette.

- **120ms** for colour and background changes, **180ms** for anything that
  moves. Nothing exceeds 180ms.
- `ease-out` on entry, `ease-in` on exit.
- Only `opacity` and `transform` are animated. Never `height`, `width`, `top`
  or `box-shadow`.
- Cards do not move on hover. V1's `hover:-translate-y-0.5` on every card made
  a dense dashboard feel unstable under the cursor.
- Numbers do not count up. The value is the information; animating it delays it.
- `@media (prefers-reduced-motion: reduce)` sets every duration to `0.01ms`
  globally in `globals.css`. Components do not each opt in.

---

## 7. Components

| Component | Variants | Notes |
|---|---|---|
| `Button` | default, outline, secondary, ghost, destructive, link | `default` is flat `--primary`. The V1 cyan→emerald gradient is retired |
| `Card` | default, sm | No hover lift, no backdrop blur |
| `StatCard` | tone per pillar | label · figure · unit · sub-line · icon. Optional `target` prop, unused until MA-6 |
| `Badge` | six pillar tones + three status tones | Always carries a text label |
| `Progress` | default, tone | |
| `Skeleton` | — | Matches the real element's geometry, never a generic bar |
| `EmptyState` | — | Icon, one line, one action. Never a bare sentence |
| `PageHeader` | — | title, description, actions. Replaces the 7× hero block |
| `Input` `Textarea` `Select` `Label` | — | `--border-strong` outline, `--ring` focus |
| `ThemeToggle` | — | Light / Dark / System |

---

## 8. Charts

Recharts, one rule that removes all the theme plumbing:

**Pass CSS variables straight into SVG attributes.** `stroke="var(--chart-1)"`
and `fill="var(--pillar-craft)"` resolve natively in SVG and re-evaluate when
`.dark` toggles — so charts re-theme with no `useTheme()` hook, no JS colour
map and no re-render.

- Axes and grid: `--border` for lines, `--muted-foreground` for tick text.
- Tooltip `contentStyle` takes `--card`, `--border` and `--foreground`. V1
  hardcoded `backgroundColor: '#000'`, which is a black box on a white page.
- Series colours come from the pillar ramp in pillar order, never from an
  index-modulo array.
- Grid lines are the lightest legible weight. Data outranks scaffolding.
- Charts get an explicit `height`; V1 set `h-75` — not a real Tailwind
  utility — on the card body instead.

---

## 9. Accessibility floor

Not aspirational. A change that breaks one of these is a bug.

1. **4.5:1** for body text and any figure below 24px; **3:1** for large text
   and for the boundary of every interactive control.
2. **Colour never carries meaning alone.** Every pillar badge has a text label;
   every status has an icon or word beside the colour.
3. **Focus is always visible** — a 2px `--ring` offset ring. Never
   `outline: none` without a replacement.
4. Interactive targets are **≥44px** on touch, ≥32px with a pointer.
5. `prefers-reduced-motion` is honoured globally.
6. `color-scheme` is declared per theme so native date pickers, scrollbars and
   autofill follow. This is why V1's `<input type="date">` rendered as a dark
   widget regardless of page.

---

## 10. Theme runtime

Three states — `light`, `dark`, `system` — persisted in `localStorage` under
`ppt-theme`. Default is `system`.

An **inline, synchronous script in `<head>`** resolves the theme and sets
`.dark` on `documentElement` before first paint. It must stay inline and
blocking: any deferred or component-level alternative paints the wrong theme
for a frame first. `next-themes` was rejected — see ADR-16.

While in `system`, a `matchMedia` listener follows OS changes live without a
reload.

---

## 11. Known gaps

| Gap | Owner |
|---|---|
| Targets render without a denominator — `LearningTarget.*` is `String`, and `CLAUDE.md` invariant 4 forbids a hardcoded number. `StatCard` already accepts `target` | MA-6 |
| `lib/cadence.ts` holds the 5-of-7 week rule client-side; it belongs in the weekly-review endpoint | MA-12 |
| `/fitness`, `/financial-goals`, `/daily-time` got a token swap only, no redesign — they are rebuilt on the metric engine | MA-8, MA-10, MA-11 |
| The dashboard has a reserved slot for Weekly Review, the surface HLD §7 names as primary | MA-12 |
| No client tests; the token guard is a lint check, not a test suite | out of V2 scope (`CLAUDE.md` §Stack) |
