'use client';
import { useEffect, useState } from 'react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { Activity, BookOpen, Target, Zap } from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend
} from 'recharts';
import { useLearningTargets } from '@/hooks/useLearningTargets';
import { useNextDayPlan } from '@/hooks/useNextDayPlan';
import { useFitnessGoals } from '@/hooks/useFitnessGoals';
import { useFinancialGoals } from '@/hooks/useFinancialGoals';

type CategoryStat = {
  type: string;
  count: number | string;
};

type PieDatum = {
  name: string;
  value: number;
};

const GOAL_DATE_STORAGE_KEY = 'dashboard-goal-date';
const DEFAULT_GOAL_DATE = '2026-06-21';

const formatGoalDateLabel = (goalDate: string) => {
  const parsedDate = new Date(`${goalDate}T23:59:59`);

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Invalid date';
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(parsedDate);
};

export default function DashboardPage() {
  const { data, isLoading } = useAnalytics();
  const { learningTargets, isLoading: isLoadingTargets } = useLearningTargets();
  const { nextDayPlan, isLoading: isLoadingPlan } = useNextDayPlan();
  const { fitnessGoals, isLoading: isLoadingFitness } = useFitnessGoals();
  const { financialGoals, isLoading: isLoadingFinance } = useFinancialGoals();
  const [goalDate, setGoalDate] = useState(() => {
    if (typeof window === 'undefined') {
      return DEFAULT_GOAL_DATE;
    }

    return window.localStorage.getItem(GOAL_DATE_STORAGE_KEY) || DEFAULT_GOAL_DATE;
  });
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    window.localStorage.setItem(GOAL_DATE_STORAGE_KEY, goalDate);
  }, [goalDate]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 60 * 1000);

    return () => window.clearInterval(timer);
  }, []);

  if (isLoading) {
    return <div className="text-neutral-400">Loading analytics...</div>;
  }

  if (!data) {
    return <div className="text-neutral-400">Failed to load analytics.</div>;
  }

  const { user, roadmapProgress, dsaCompleted, categoryStats, timeTracking } = data;
  
  const pieData = (categoryStats as CategoryStat[] | undefined)?.map((c) => ({
    name: c.type,
    value: Number(c.count)
  })) || [] as PieDatum[];

  const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f97316'];
  const parsedGoalDate = new Date(`${goalDate}T23:59:59`);
  const daysLeft = Number.isNaN(parsedGoalDate.getTime())
    ? 0
    : Math.max(0, Math.ceil((parsedGoalDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  const isGoalReached = daysLeft === 0;
  const timeTrendData = (timeTracking?.weekTrend || []).map(
    (entry: { date: string; dsaHours: number; devAiHours: number; totalHours: number }) => ({
      ...entry,
      day: entry.date.slice(5)
    })
  );

  return (
    <div className="relative space-y-8 max-w-6xl mx-auto overflow-hidden">
      <div className="pointer-events-none absolute -right-16 top-0 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="pointer-events-none absolute left-24 top-24 h-72 w-72 rounded-full bg-emerald-400/5 blur-3xl" />
      <div className="relative rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.95),rgba(17,24,39,0.8))] p-6 shadow-[0_30px_90px_-50px_rgba(0,0,0,0.9)] backdrop-blur-xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-200">
          <span className="h-2 w-2 rounded-full bg-cyan-300" />
          Live overview
        </div>
        <div className="mt-4">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Dashboard</h1>
          <p className="mt-2 max-w-2xl text-neutral-300">Your learning progress and activity overview, with the most important metrics surfaced first.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="border-white/10 bg-white/4">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-400">Current Streak</CardTitle>
            <Zap className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{user.streak} <span className="text-lg text-neutral-500 font-normal">days</span></div>
            <p className="text-xs text-neutral-500 mt-1">Freeze days available: {user.streakFreezeDays || 0}</p>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/4">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-400">Roadmap Progress</CardTitle>
            <Target className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{Math.round(roadmapProgress.percentage)}%</div>
            <p className="text-xs text-neutral-500 mt-1">{roadmapProgress.completed} of {roadmapProgress.total} items</p>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/4">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-400">DSA Solved</CardTitle>
            <BookOpen className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{dsaCompleted}</div>
            <p className="text-xs text-neutral-500 mt-1">Total problems solved</p>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/4">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-400">Activity Level</CardTitle>
            <Activity className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{user.lastActive ? 'Active' : 'New'}</div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-400">Time Logged</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-neutral-500">Today</p>
            <div className="mt-1 text-sm text-neutral-200">DSA: {Number(timeTracking?.today?.dsaHours || 0).toFixed(1)}h</div>
            <div className="text-sm text-neutral-200">Dev+AI: {Number(timeTracking?.today?.devAiHours || 0).toFixed(1)}h</div>
            <p className="mt-2 text-xs text-neutral-500">This week</p>
            <div className="mt-1 text-sm text-neutral-200">DSA: {Number(timeTracking?.week?.dsaHours || 0).toFixed(1)}h</div>
            <div className="text-sm text-neutral-200">Dev+AI: {Number(timeTracking?.week?.devAiHours || 0).toFixed(1)}h</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card className="xl:col-span-2 border-white/10 bg-[linear-gradient(180deg,rgba(14,116,144,0.28),rgba(15,23,42,0.92))]">
          <CardHeader>
            <CardTitle>Goal Countdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-3xl font-bold text-cyan-200">
              {isGoalReached ? 'Goal Date Reached' : `${daysLeft} days left`}
            </div>
            <div className="space-y-3 text-sm text-neutral-200">
              <div className="grid gap-2 md:grid-cols-[1fr_auto] md:items-end">
                <div className="space-y-1">
                  <label className="text-xs text-neutral-400">Target date</label>
                  <Input
                    type="date"
                    value={goalDate}
                    onChange={(e) => setGoalDate(e.target.value)}
                    className="bg-neutral-900/90 border-white/10"
                  />
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  className="border border-white/10 bg-white/5 text-neutral-100 hover:bg-white/10"
                  onClick={() => setGoalDate(DEFAULT_GOAL_DATE)}
                >
                  Reset to 21 June 2026
                </Button>
              </div>
              <p>Target Date: {formatGoalDateLabel(goalDate)}</p>
              <p>Primary Target: Crack a company role (preferably remote).</p>
              <p>Product Target: Build a production-ready SaaS web app.</p>
              <p className="text-xs text-neutral-500">Changes save automatically in your browser.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/4">
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle>Learning Targets</CardTitle>
            <Link href="/learning-targets" className="text-sm text-cyan-200 hover:text-emerald-300 underline underline-offset-4 transition-colors">
              Edit
            </Link>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-neutral-200">
            {isLoadingTargets ? (
              <p className="text-neutral-500">Loading targets...</p>
            ) : learningTargets ? (
              <>
                <p><span className="text-neutral-500">Daily DSA:</span> {learningTargets.dailyDsaTarget}</p>
                <p><span className="text-neutral-500">Daily Web Dev + AI:</span> {learningTargets.dailyWebDevAiTarget}</p>
                <p><span className="text-neutral-500">Weekend Project Build:</span> {learningTargets.weekendProjectBuildTarget}</p>
              </>
            ) : (
              <p className="text-neutral-500">No targets saved yet.</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/4">
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle>Next Day Plan</CardTitle>
            <Link href="/next-day-plan" className="text-sm text-cyan-200 hover:text-emerald-300 underline underline-offset-4 transition-colors">
              Edit
            </Link>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-neutral-200">
            {isLoadingPlan ? (
              <p className="text-neutral-500">Loading plan...</p>
            ) : nextDayPlan?.briefPlan ? (
              <div className="rounded-lg border border-neutral-800 bg-neutral-900/60 p-3 whitespace-pre-wrap">
                {nextDayPlan.briefPlan}
              </div>
            ) : (
              <p className="text-neutral-500">No plan saved yet.</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/4">
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle>Fitness Goals</CardTitle>
            <Link href="/fitness" className="text-sm text-cyan-200 hover:text-emerald-300 underline underline-offset-4 transition-colors">
              Edit
            </Link>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-neutral-200">
            {isLoadingFitness ? (
              <p className="text-neutral-500">Loading fitness goals...</p>
            ) : fitnessGoals?.goals ? (
              <div className="rounded-lg border border-neutral-800 bg-neutral-900/60 p-3 whitespace-pre-wrap">
                {fitnessGoals.goals}
              </div>
            ) : (
              <p className="text-neutral-500">No fitness goals saved yet.</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/4">
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle>Financial Goals & Notes</CardTitle>
            <Link href="/financial-goals" className="text-sm text-cyan-200 hover:text-emerald-300 underline underline-offset-4 transition-colors">
              Edit
            </Link>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-neutral-200">
            {isLoadingFinance ? (
              <p className="text-neutral-500">Loading financial goals...</p>
            ) : financialGoals ? (
              <>
                <p><span className="text-neutral-500">Goals:</span></p>
                <div className="rounded-lg border border-neutral-800 bg-neutral-900/60 p-3 whitespace-pre-wrap">
                  {financialGoals.goals}
                </div>
                <p><span className="text-neutral-500">Learning Notes:</span></p>
                <div className="rounded-lg border border-neutral-800 bg-neutral-900/60 p-3 whitespace-pre-wrap">
                  {financialGoals.learningNotes}
                </div>
              </>
            ) : (
              <p className="text-neutral-500">No financial goals saved yet.</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/4">
          <CardHeader>
            <CardTitle>Skill Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-75">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#000', borderColor: '#333', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-neutral-500">
                Complete modules to see your skill distribution.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/4 xl:col-span-1">
          <CardHeader>
            <CardTitle>7-Day Time Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-75">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                <XAxis dataKey="day" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: '#000', borderColor: '#333', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend />
                <Line type="monotone" dataKey="dsaHours" stroke="#3b82f6" strokeWidth={2} dot={false} name="DSA" />
                <Line type="monotone" dataKey="devAiHours" stroke="#8b5cf6" strokeWidth={2} dot={false} name="Dev + AI" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
