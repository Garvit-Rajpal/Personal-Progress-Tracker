'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLearningTargets } from '@/hooks/useLearningTargets';

export default function LearningTargetsPage() {
  const { learningTargets, isLoading, updateLearningTargets, isUpdating } = useLearningTargets();
  const [dailyDsaTarget, setDailyDsaTarget] = useState('1 hour');
  const [dailyWebDevAiTarget, setDailyWebDevAiTarget] = useState('2-3 hours');
  const [weekendProjectBuildTarget, setWeekendProjectBuildTarget] = useState('10-12 hours effort');

  useEffect(() => {
    if (learningTargets) {
      setDailyDsaTarget(learningTargets.dailyDsaTarget || '1 hour');
      setDailyWebDevAiTarget(learningTargets.dailyWebDevAiTarget || '2-3 hours');
      setWeekendProjectBuildTarget(learningTargets.weekendProjectBuildTarget || '10-12 hours effort');
    }
  }, [learningTargets]);

  const saveLearningTargets = () => {
    updateLearningTargets({
      dailyDsaTarget,
      dailyWebDevAiTarget,
      weekendProjectBuildTarget
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Learning Targets</h1>
        <p className="text-neutral-400 mt-2">Set your daily and weekend targets here.</p>
      </div>

      <Card className="bg-neutral-950 border-neutral-800">
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
                className="bg-neutral-900 border-neutral-700"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-neutral-400">Daily Web Dev + AI Learning</label>
              <Input
                value={dailyWebDevAiTarget}
                onChange={(e) => setDailyWebDevAiTarget(e.target.value)}
                className="bg-neutral-900 border-neutral-700"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-neutral-400">Weekend Project Build</label>
              <Input
                value={weekendProjectBuildTarget}
                onChange={(e) => setWeekendProjectBuildTarget(e.target.value)}
                className="bg-neutral-900 border-neutral-700"
              />
            </div>
            <Button onClick={saveLearningTargets} disabled={isUpdating || isLoading}>
              {isUpdating ? 'Saving...' : 'Save Targets'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {learningTargets && (
        <Card className="bg-neutral-950 border-neutral-800">
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
