'use client';

import Link from 'next/link';
import { ArrowRight, Flame, Snowflake } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  WEEK_COMPLETE_DAYS,
  countQualifyingDays,
  isWeekComplete,
  type TrendDay
} from '@/lib/cadence';

type TodayHeroProps = {
  dsaToday: number;
  devAiToday: number;
  weekDsa: number;
  weekDevAi: number;
  weekTrend: TrendDay[];
  streak: number;
  freezeDays: number;
  nextUp?: string | null;
};

const formatHours = (value: number) => `${value.toFixed(1)}h`;

/**
 * The band the dashboard opens on — docs/design.md §1: the page has to answer
 * "am I on track today" before anything else.
 *
 * Deliberately shows **no target denominator**. `LearningTarget.*` is
 * free-text, and `CLAUDE.md` invariant 4 forbids inventing a number to divide
 * by. The week bar measures *days logged*, which is a cadence rule
 * (docs/cadence.md §6) rather than a personal target, so it is legitimate.
 */
export function TodayHero({
  dsaToday,
  devAiToday,
  weekDsa,
  weekDevAi,
  weekTrend,
  streak,
  freezeDays,
  nextUp
}: TodayHeroProps) {
  const totalToday = dsaToday + devAiToday;
  const totalWeek = weekDsa + weekDevAi;
  const daysLogged = countQualifyingDays(weekTrend);
  const weekComplete = isWeekComplete(weekTrend);

  const today = new Date();
  const dateLabel = new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  }).format(today);

  return (
    <Card>
      <CardContent className="space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">{dateLabel}</p>
            <p className="metric text-[2.25rem] font-semibold leading-none text-foreground">
              {formatHours(totalToday)}
              <span className="ml-2 text-sm font-normal text-muted-foreground">logged today</span>
            </p>
          </div>

          {/* docs/cadence.md §6 — "the daily streak is a nudge, not the
              score", so it sits as a quiet chip rather than the headline. */}
          <div className="flex items-center gap-2">
            <Badge tone={streak > 0 ? 'warning' : 'neutral'}>
              <Flame aria-hidden />
              {streak} day streak
            </Badge>
            {freezeDays > 0 ? (
              <Badge tone="neutral">
                <Snowflake aria-hidden />
                {freezeDays} freeze
              </Badge>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
          <span className="text-muted-foreground">
            DSA <span className="metric font-medium text-pillar-craft">{formatHours(dsaToday)}</span>
          </span>
          <span className="text-muted-foreground">
            Dev + AI{' '}
            <span className="metric font-medium text-pillar-devai">{formatHours(devAiToday)}</span>
          </span>
        </div>

        <Separator />

        <div className="space-y-2">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-sm font-medium text-foreground">This week</p>
            <p className="text-xs text-muted-foreground">
              <span className="metric font-medium text-foreground">{formatHours(totalWeek)}</span>
              {' · '}
              <span className="metric">{daysLogged}</span> of {weekTrend.length || 7} days logged
            </p>
          </div>

          <Progress
            value={(daysLogged / WEEK_COMPLETE_DAYS) * 100}
            tone={weekComplete ? 'success' : 'primary'}
            label="Days logged this week"
          />

          <p className="text-xs text-muted-foreground">
            {weekComplete
              ? `Week complete — ${daysLogged} qualifying days.`
              : `${WEEK_COMPLETE_DAYS - daysLogged} more ${
                  WEEK_COMPLETE_DAYS - daysLogged === 1 ? 'day' : 'days'
                } to complete the week.`}
          </p>
        </div>

        {nextUp ? (
          <>
            <Separator />
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Next up</p>
              <Link
                href="/next-day-plan"
                className="group flex items-start gap-1.5 text-sm text-foreground transition-colors hover:text-primary"
              >
                <span className="line-clamp-2">{nextUp}</span>
                <ArrowRight
                  aria-hidden
                  className="mt-0.5 size-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary"
                />
              </Link>
            </div>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}
