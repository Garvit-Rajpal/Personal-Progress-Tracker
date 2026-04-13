'use client';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

export default function DashboardPage() {
  const { data, isLoading } = useAnalytics();
  const { learningTargets, isLoading: isLoadingTargets } = useLearningTargets();
  const { nextDayPlan, isLoading: isLoadingPlan } = useNextDayPlan();
  const { fitnessGoals, isLoading: isLoadingFitness } = useFitnessGoals();
  const { financialGoals, isLoading: isLoadingFinance } = useFinancialGoals();

  if (isLoading) {
    return <div className="text-neutral-400">Loading analytics...</div>;
  }

  if (!data) {
    return <div className="text-neutral-400">Failed to load analytics.</div>;
  }

  const { user, roadmapProgress, dsaCompleted, categoryStats, timeTracking } = data;
  
  const pieData = categoryStats?.map((c: any) => ({
    name: c.type,
    value: Number(c.count)
  })) || [];

  const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f97316'];
  const goalDate = new Date('2026-06-21T23:59:59');
  const now = new Date();
  const daysLeft = Math.max(0, Math.ceil((goalDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  const isGoalReached = daysLeft === 0;
  const timeTrendData = (timeTracking?.weekTrend || []).map(
    (entry: { date: string; dsaHours: number; devAiHours: number; totalHours: number }) => ({
      ...entry,
      day: entry.date.slice(5)
    })
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-neutral-400 mt-2">Your learning progress and activity overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-neutral-950 border-neutral-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-400">Current Streak</CardTitle>
            <Zap className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{user.streak} <span className="text-lg text-neutral-500 font-normal">days</span></div>
            <p className="text-xs text-neutral-500 mt-1">Freeze days available: {user.streakFreezeDays || 0}</p>
          </CardContent>
        </Card>

        <Card className="bg-neutral-950 border-neutral-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-400">Roadmap Progress</CardTitle>
            <Target className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{Math.round(roadmapProgress.percentage)}%</div>
            <p className="text-xs text-neutral-500 mt-1">{roadmapProgress.completed} of {roadmapProgress.total} items</p>
          </CardContent>
        </Card>

        <Card className="bg-neutral-950 border-neutral-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-400">DSA Solved</CardTitle>
            <BookOpen className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{dsaCompleted}</div>
            <p className="text-xs text-neutral-500 mt-1">Total problems solved</p>
          </CardContent>
        </Card>

        <Card className="bg-neutral-950 border-neutral-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-400">Activity Level</CardTitle>
            <Activity className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{user.lastActive ? 'Active' : 'New'}</div>
          </CardContent>
        </Card>

        <Card className="bg-neutral-950 border-neutral-800">
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

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card className="bg-neutral-950 border-neutral-800 xl:col-span-2">
          <CardHeader>
            <CardTitle>June 21 Goal Countdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-3xl font-bold text-[#47c8ff]">
              {isGoalReached ? 'Goal Date Reached' : `${daysLeft} days left`}
            </div>
            <div className="text-sm text-neutral-300 space-y-1">
              <p>Target Date: 21 June 2026</p>
              <p>Primary Target: Crack a company role (preferably remote).</p>
              <p>Product Target: Build a production-ready SaaS web app.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-neutral-950 border-neutral-800">
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle>Learning Targets</CardTitle>
            <Link href="/learning-targets" className="text-sm text-[#47c8ff] hover:text-[#47ff9a] underline underline-offset-4">
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

        <Card className="bg-neutral-950 border-neutral-800">
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle>Next Day Plan</CardTitle>
            <Link href="/next-day-plan" className="text-sm text-[#47c8ff] hover:text-[#47ff9a] underline underline-offset-4">
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

        <Card className="bg-neutral-950 border-neutral-800">
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle>Fitness Goals</CardTitle>
            <Link href="/fitness" className="text-sm text-[#47c8ff] hover:text-[#47ff9a] underline underline-offset-4">
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

        <Card className="bg-neutral-950 border-neutral-800">
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle>Financial Goals & Notes</CardTitle>
            <Link href="/financial-goals" className="text-sm text-[#47c8ff] hover:text-[#47ff9a] underline underline-offset-4">
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

        <Card className="bg-neutral-950 border-neutral-800">
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
                    {pieData.map((entry: any, index: number) => (
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

        <Card className="bg-neutral-950 border-neutral-800 xl:col-span-1">
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
