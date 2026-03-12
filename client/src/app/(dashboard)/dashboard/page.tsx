'use client';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, BookOpen, Target, Zap } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RechartsTooltip } from 'recharts';

export default function DashboardPage() {
  const { data, isLoading } = useAnalytics();

  if (isLoading) {
    return <div className="text-neutral-400">Loading analytics...</div>;
  }

  if (!data) {
    return <div className="text-neutral-400">Failed to load analytics.</div>;
  }

  const { user, roadmapProgress, dsaCompleted, categoryStats } = data;
  
  const pieData = categoryStats?.map((c: any) => ({
    name: c.type,
    value: Number(c.count)
  })) || [];

  const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f97316'];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-neutral-400 mt-2">Your learning progress and activity overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-neutral-950 border-neutral-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-400">Current Streak</CardTitle>
            <Zap className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{user.streak} <span className="text-lg text-neutral-500 font-normal">days</span></div>
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-neutral-950 border-neutral-800">
          <CardHeader>
            <CardTitle>Skill Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
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
      </div>
    </div>
  );
}
