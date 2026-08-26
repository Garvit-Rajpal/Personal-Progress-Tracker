# Cadence — the real time budget

Every default, target and streak rule in this app is calibrated to this file.
If a number in the code disagrees with a number here, the code is wrong
(`CLAUDE.md` invariant 4).

---

## 1. The budget

**1–2 hours per day of focused learning**, outside LoveTeddy build work and the
other ventures. That is the stated constraint and the plan is built on the
*low* end of it.

- **Baseline: 7 h/week.** Plan against this. It survives a bad week.
- **Stretch: 10 h/week.** Good weeks. Never the assumption.

Planning against 14 h/week because "1–2 hours" technically allows it is how
trackers end up showing red every Sunday until their owner stops opening them.

## 2. Weekly allocation

| Track | Baseline | Stretch | Cadence |
|---|---|---|---|
| DSA | 2.0 h | 2.5 h | 1 problem/day, 5 days |
| System design | 2.0 h | 3.0 h | 1 curriculum item/week |
| AI engineering | 2.0 h | 3.0 h | 1 curriculum item/week, weekend block |
| Review and logging | 1.0 h | 1.5 h | ~5 min/day + 30 min weekly review |
| **Total** | **7.0 h** | **10.0 h** | |

LoveTeddy build time is **not** in this table. It is logged as
`PROJECT_BUILD` and reported separately, because it is delivery, not learning,
and mixing the two makes both numbers meaningless.

## 3. What this actually finishes, and when

Stated plainly so the plan is not sold on optimism.

| Track | Volume | At baseline pace | Elapsed |
|---|---|---|---|
| DSA — Striver SDE 191 | 191 questions | 5/week | ~38 weeks |
| System design | 51 items, 5 already done | 1/week | ~46 weeks |
| AI engineering | 37 items | 1/week | ~37 weeks |

Run in parallel, the longest pole is system design at roughly **eleven months**,
and that is a floor — machine-coding and case-study items realistically take
more than a week each.

So the full curriculum does **not** fit a 6–12 month window at 7 h/week. Two
honest responses, and you should pick one rather than discovering the gap in
month seven:

- **Cut scope deliberately.** Both curriculum files define an
  interview-critical subset. Taking those and deferring the rest brings all
  three tracks inside roughly **six to seven months**, which does fit the goal.
- **Or accept the longer timeline** and treat the full track as a two-year depth
  investment, with the subset as the first milestone inside it.

The wrong response is to keep the full scope, plan for nine months, and quietly
fall behind — which is exactly what an uncalibrated tracker encourages.

**The tradeoff you cannot dodge:** three tracks at full pace plus shipping
LoveTeddy does not fit in 1–2 h/day. One of them has to give. The recommended
shape, given the goal is a strong remote role while still building your own
things:

- **DSA and system design are the constant.** They are the two that decay
  fastest without practice and that gate interviews.
- **AI engineering leans on the weekend block**, and is partly paid for by
  LoveTeddy and TrustDesk work, since several curriculum items are upgrades to
  those repos rather than separate study.
- **If something must be cut in a given month, cut AI engineering items, not
  DSA.** DSA is the one that only rebuilds slowly.

## 4. Seeded metric defaults (LLD_v2 MA-6)

| Pillar | Key | Label | Unit | Direction | Cadence | Target |
|---|---|---|---|---|---|---|
| FITNESS | `workouts_per_week` | Workouts | count | HIGHER_IS_BETTER | WEEKLY | 4 |
| FITNESS | `training_minutes` | Training time | minutes | HIGHER_IS_BETTER | DAILY | 30 |
| FITNESS | `steps` | Steps | steps | HIGHER_IS_BETTER | DAILY | 8000 |
| HEALTH | `sleep_hours` | Sleep | hours | TARGET_BAND | DAILY | 7–8 |
| HEALTH | `energy_level` | Energy (1–5) | scale | HIGHER_IS_BETTER | DAILY | 4 |
| HEALTH | `weight_kg` | Weight | kg | TARGET_BAND | DAILY | none — set it yourself |
| FINANCE | `savings_rate` | Savings rate | % | HIGHER_IS_BETTER | MONTHLY | 30 |
| FINANCE | `net_worth` | Net worth | INR | HIGHER_IS_BETTER | MONTHLY | none |
| FINANCE | `monthly_burn` | Monthly burn | INR | LOWER_IS_BETTER | MONTHLY | none |
| FINANCE | `runway_months` | Runway | months | HIGHER_IS_BETTER | MONTHLY | 6 |
| CRAFT | `dsa_problems` | DSA solved | count | HIGHER_IS_BETTER | DAILY | 1 |
| CRAFT | `design_items` | Design items | count | HIGHER_IS_BETTER | WEEKLY | 1 |
| CRAFT | `ai_items` | AI eng items | count | HIGHER_IS_BETTER | WEEKLY | 1 |
| DELIVERY | `milestones_shipped` | Milestones shipped | count | HIGHER_IS_BETTER | WEEKLY | 1 |
| OPPORTUNITY | `applications_sent` | Applications | count | HIGHER_IS_BETTER | WEEKLY | 2 |

Financial and health targets are seeded as neutral defaults. They are yours to
set; the seed must never invent a weight target or a savings figure on your
behalf.

## 5. Entry cost — a hard constraint

**Logging a full day must take under two minutes.** This is a design
requirement on `MetricEntryForm`, not an aspiration.

A tracker that costs ten minutes a day to feed will be abandoned inside a month,
and then the whole project has cost time rather than saved it. If a pillar
cannot be logged in under thirty seconds, reduce its metrics rather than
building a faster form.

## 6. Streaks

`User.streak`, `streakFreezeDays` and `streakAwardedWeeks` already exist. V2
gives them rules that fit the budget:

- **A day counts** if either one DSA problem is solved **or** 30 minutes are
  logged in any CRAFT category. One low unit, reachable on a bad day.
- **Freeze days** are earned one per four consecutive complete weeks, capped at
  three held at once. A freeze is spent automatically on a missed day.
- **Weeks, not days, are the real unit.** A week is complete at 5 of 7 qualifying
  days. The weekly review reports weeks, and the daily streak is a nudge, not
  the score.

Rationale: on a 1–2 h/day budget, a strict daily streak breaks within a fortnight
and the broken streak becomes a reason to stop opening the app. The mechanic
should survive a real life, or it is working against its own purpose.

## 7. The degradation ladder

When a week goes badly, cut in this order and log it rather than quietly
failing:

1. AI engineering curriculum item
2. System design curriculum item
3. Weekly review long-form — keep the numbers, drop the writing
4. DSA — last. Protect this one.

Never cut the daily log itself. A week with poor numbers is data. A week with no
data is a hole, and the whole point of this project is not having holes.
