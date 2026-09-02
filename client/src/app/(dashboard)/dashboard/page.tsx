'use client';

import Link from 'next/link';
import {
  BookOpen,
  CalendarClock,
  Clock3,
  Flame,
  HeartPulse,
  Target,
  Wallet
} from 'lucide-react';

import { useAnalytics } from '@/hooks/useAnalytics';
import { useLearningTargets } from '@/hooks/useLearningTargets';
import { useNextDayPlan } from '@/hooks/useNextDayPlan';
import { useFitnessGoals } from '@/hooks/useFitnessGoals';
import { useFinancialGoals } from '@/hooks/useFinancialGoals';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/layout/PageHeader';

import { StatCard } from '@/components/dashboard/StatCard';
import { TodayHero } from '@/components/dashboard/TodayHero';
import { GoalCountdown } from '@/components/dashboard/GoalCountdown';
import { TimeTrendChart } from '@/components/dashboard/TimeTrendChart';
import { SkillDistribution } from '@/components/dashboard/SkillDistribution';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import type { TrendDay } from '@/lib/cadence';

type CategoryStat = { type: string; count: number | string };

export default function DashboardPage() {
  const { data, isLoading } = useAnalytics();
  const { learningTargets, isLoading: isLoadingTargets } = useLearningTargets();
  const { nextDayPlan, isLoading: isLoadingPlan } = useNextDayPlan();
  const { fitnessGoals, isLoading: isLoadingFitness } = useFitnessGoals();
  const { financialGoals, isLoading: isLoadingFinance } = useFinancialGoals();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Dashboard" description="Where today sits against the week." />
        <DashboardSkeleton />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <PageHeader title="Dashboard" />
        <EmptyState
          icon={Target}
          title="Could not load your analytics"
          description="The server did not return an overview. Check that the API is reachable and refresh."
        />
      </div>
    );
  }

  const { user, roadmapProgress, dsaCompleted, categoryStats, timeTracking } = data;

  const weekTrend: TrendDay[] = timeTracking?.weekTrend ?? [];
  const dsaToday = Number(timeTracking?.today?.dsaHours || 0);
  const devAiToday = Number(timeTracking?.today?.devAiHours || 0);
  const weekDsa = Number(timeTracking?.week?.dsaHours || 0);
  const weekDevAi = Number(timeTracking?.week?.devAiHours || 0);

  const pieData = (categoryStats as CategoryStat[] | undefined)?.map((c) => ({
    name: c.type,
    value: Number(c.count)
  })) ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Where today sits against the week."
      />

      <TodayHero
        dsaToday={dsaToday}
        devAiToday={devAiToday}
        weekDsa={weekDsa}
        weekDevAi={weekDevAi}
        weekTrend={weekTrend}
        streak={user.streak}
        freezeDays={user.streakFreezeDays || 0}
        nextUp={isLoadingPlan ? null : nextDayPlan?.briefPlan}
      />

      {/* Four tiles of identical shape. V1 had five, one of which was a text
          list and another ("Activity Level") could only ever read "Active". */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Current streak"
          value={user.streak}
          unit={user.streak === 1 ? 'day' : 'days'}
          sub={`${user.streakFreezeDays || 0} freeze days available`}
          icon={Flame}
          tone="warning"
        />
        <StatCard
          label="Roadmap"
          value={`${Math.round(roadmapProgress.percentage)}%`}
          sub={`${roadmapProgress.completed} of ${roadmapProgress.total} items`}
          icon={Target}
          tone="career"
          progress={roadmapProgress.percentage}
        />
        <StatCard
          label="DSA solved"
          value={dsaCompleted}
          sub="Problems marked solved"
          icon={BookOpen}
          tone="craft"
        />
        <StatCard
          label="Hours this week"
          value={(weekDsa + weekDevAi).toFixed(1)}
          unit="h"
          sub={`DSA ${weekDsa.toFixed(1)}h · Dev+AI ${weekDevAi.toFixed(1)}h`}
          icon={Clock3}
          tone="devai"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>7-day time trend</CardTitle>
          </CardHeader>
          <CardContent>
            {weekTrend.length > 0 ? (
              <TimeTrendChart data={weekTrend} />
            ) : (
              <EmptyState
                icon={Clock3}
                title="No time logged yet"
                description="Log a day to start building the trend."
                actionLabel="Log time"
                actionHref="/daily-time"
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Skill distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <SkillDistribution data={pieData} />
            ) : (
              <EmptyState
                icon={Target}
                title="Nothing completed yet"
                description="Complete roadmap items to see how your time splits across tracks."
                actionLabel="Open roadmap"
                actionHref="/roadmap"
              />
            )}
          </CardContent>
        </Card>
      </div>

      <GoalCountdown />

      {/* Secondary reference cards. Fitness and Financial are replaced by the
          metric engine at MA-8 / MA-10, so they get no bespoke treatment. */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Goals and notes</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <ReferenceCard
            title="Learning targets"
            href="/learning-targets"
            icon={Target}
            isLoading={isLoadingTargets}
            isEmpty={!learningTargets}
            emptyTitle="No targets saved yet"
            emptyAction="Set targets"
          >
            <dl className="space-y-1.5 text-sm">
              <TargetRow label="Daily DSA" value={learningTargets?.dailyDsaTarget} />
              <TargetRow label="Daily Web Dev + AI" value={learningTargets?.dailyWebDevAiTarget} />
              <TargetRow label="Weekend build" value={learningTargets?.weekendProjectBuildTarget} />
            </dl>
          </ReferenceCard>

          <ReferenceCard
            title="Next day plan"
            href="/next-day-plan"
            icon={CalendarClock}
            isLoading={isLoadingPlan}
            isEmpty={!nextDayPlan?.briefPlan}
            emptyTitle="No plan saved yet"
            emptyAction="Write a plan"
          >
            <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
              {nextDayPlan?.briefPlan}
            </p>
          </ReferenceCard>

          <ReferenceCard
            title="Fitness"
            href="/fitness"
            icon={HeartPulse}
            isLoading={isLoadingFitness}
            isEmpty={!fitnessGoals?.goals}
            emptyTitle="No fitness goals yet"
            emptyAction="Add goals"
          >
            <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
              {fitnessGoals?.goals}
            </p>
          </ReferenceCard>

          <ReferenceCard
            title="Financial goals"
            href="/financial-goals"
            icon={Wallet}
            isLoading={isLoadingFinance}
            isEmpty={!financialGoals?.goals}
            emptyTitle="No financial goals yet"
            emptyAction="Add goals"
          >
            <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
              {financialGoals?.goals}
            </p>
          </ReferenceCard>
        </div>
      </section>
    </div>
  );
}

function TargetRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0 truncate text-right font-medium text-foreground">{value || '—'}</dd>
    </div>
  );
}

type ReferenceCardProps = {
  title: string;
  href: string;
  icon: typeof Target;
  isLoading: boolean;
  isEmpty: boolean;
  emptyTitle: string;
  emptyAction: string;
  children: React.ReactNode;
};

function ReferenceCard({
  title,
  href,
  icon,
  isLoading,
  isEmpty,
  emptyTitle,
  emptyAction,
  children
}: ReferenceCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle className="text-sm">{title}</CardTitle>
        <Link
          href={href}
          className="text-xs font-medium text-primary transition-colors hover:underline"
        >
          Edit
        </Link>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ) : isEmpty ? (
          <EmptyState icon={icon} title={emptyTitle} actionLabel={emptyAction} actionHref={href} />
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}
