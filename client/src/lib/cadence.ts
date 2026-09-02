/**
 * Cadence constants the client needs to render weekly progress.
 *
 * `docs/cadence.md` is the source of truth for every number here
 * (`CLAUDE.md` invariant 4). They live in one module so there is a single site
 * to police — never inline one of these at a call site.
 *
 * These are *rules*, not user targets. A user's own targets come from their
 * `LearningTarget` row and are never hardcoded anywhere in the client.
 *
 * TODO(MA-12): the week-completion rule belongs in the weekly-review endpoint,
 * not in the client. Delete this module when that ships.
 */

/** docs/cadence.md §6 — "A week is complete at 5 of 7 qualifying days." */
export const WEEK_COMPLETE_DAYS = 5;

/** docs/cadence.md §6 — a day qualifies at 30 minutes logged in any category. */
export const QUALIFYING_DAY_HOURS = 0.5;

export type TrendDay = {
  date: string;
  dsaHours: number;
  devAiHours: number;
  totalHours: number;
};

/** docs/cadence.md §6 — a day counts once 30 min is logged in any category. */
export function isQualifyingDay(day: Pick<TrendDay, 'totalHours'>): boolean {
  return day.totalHours >= QUALIFYING_DAY_HOURS;
}

export function countQualifyingDays(trend: TrendDay[]): number {
  return trend.filter(isQualifyingDay).length;
}

export function isWeekComplete(trend: TrendDay[]): boolean {
  return countQualifyingDays(trend) >= WEEK_COMPLETE_DAYS;
}
