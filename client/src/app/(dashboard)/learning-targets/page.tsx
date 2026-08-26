'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLearningTargets } from '@/hooks/useLearningTargets';

type LearningTargetsFormProps = {
  initialDailyDsaTarget: string;
  initialDailyWebDevAiTarget: string;
  initialWeekendProjectBuildTarget: string;
  onSave: (payload: {
    dailyDsaTarget: string;
    dailyWebDevAiTarget: string;
    weekendProjectBuildTarget: string;
  }) => void;
  isUpdating: boolean;
};

function LearningTargetsForm({
  initialDailyDsaTarget,
  initialDailyWebDevAiTarget,
  initialWeekendProjectBuildTarget,
  onSave,
  isUpdating
}: LearningTargetsFormProps) {
  const [dailyDsaTarget, setDailyDsaTarget] = useState(initialDailyDsaTarget);
  const [dailyWebDevAiTarget, setDailyWebDevAiTarget] = useState(initialDailyWebDevAiTarget);
  const [weekendProjectBuildTarget, setWeekendProjectBuildTarget] = useState(initialWeekendProjectBuildTarget);

  return (
    <Card className="border-white/10 bg-white/[0.04]">
      <CardHeader>
        <CardTitle>Update Targets</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 text-sm text-neutral-300">
          <div>
            <label className="mb-1 block text-xs text-neutral-400">Daily DSA</label>
            <Input
              value={dailyDsaTarget}
              onChange={(e) => setDailyDsaTarget(e.target.value)}
              className="bg-neutral-900/90 border-white/10"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-neutral-400">Daily Web Dev + AI Learning</label>
            <Input
              value={dailyWebDevAiTarget}
              onChange={(e) => setDailyWebDevAiTarget(e.target.value)}
              className="bg-neutral-900/90 border-white/10"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-neutral-400">Weekend Project Build</label>
            <Input
              value={weekendProjectBuildTarget}
              onChange={(e) => setWeekendProjectBuildTarget(e.target.value)}
              className="bg-neutral-900/90 border-white/10"
            />
          </div>
          <Button
            onClick={() => onSave({ dailyDsaTarget, dailyWebDevAiTarget, weekendProjectBuildTarget })}
            disabled={isUpdating}
          >
            {isUpdating ? 'Saving...' : 'Save Targets'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function LearningTargetsPage() {
  const { learningTargets, isLoading, updateLearningTargets, isUpdating } = useLearningTargets();

  return (
    <div className="relative space-y-6 max-w-4xl mx-auto overflow-hidden">
      <div className="pointer-events-none absolute -right-12 top-0 h-48 w-48 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="pointer-events-none absolute left-8 top-20 h-64 w-64 rounded-full bg-emerald-400/5 blur-3xl" />
      <div className="relative rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.95),rgba(17,24,39,0.8))] p-6 shadow-[0_30px_90px_-50px_rgba(0,0,0,0.9)] backdrop-blur-xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-200">
          <span className="h-2 w-2 rounded-full bg-cyan-300" />
          Targets and pacing
        </div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">Learning Targets</h1>
        <p className="mt-2 max-w-2xl text-neutral-300">Set your daily and weekend targets here.</p>
      </div>

      <LearningTargetsForm
        key={`${learningTargets?.dailyDsaTarget || 'default'}|${learningTargets?.dailyWebDevAiTarget || 'default'}|${learningTargets?.weekendProjectBuildTarget || 'default'}`}
        initialDailyDsaTarget={learningTargets?.dailyDsaTarget || '1 hour'}
        initialDailyWebDevAiTarget={learningTargets?.dailyWebDevAiTarget || '2-3 hours'}
        initialWeekendProjectBuildTarget={learningTargets?.weekendProjectBuildTarget || '10-12 hours effort'}
        onSave={({ dailyDsaTarget, dailyWebDevAiTarget, weekendProjectBuildTarget }) =>
          updateLearningTargets({ dailyDsaTarget, dailyWebDevAiTarget, weekendProjectBuildTarget })
        }
        isUpdating={isUpdating || isLoading}
      />

      {learningTargets && (
        <Card className="border-white/10 bg-white/[0.04]">
          <CardHeader>
            <CardTitle>Saved Targets</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-neutral-200">
            <p><span className="text-neutral-500">Daily DSA:</span> {learningTargets.dailyDsaTarget}</p>
            <p><span className="text-neutral-500">Daily Web Dev + AI:</span> {learningTargets.dailyWebDevAiTarget}</p>
            <p><span className="text-neutral-500">Weekend Project Build:</span> {learningTargets.weekendProjectBuildTarget}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
