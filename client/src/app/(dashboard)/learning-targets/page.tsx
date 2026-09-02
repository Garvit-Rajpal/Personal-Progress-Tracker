'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/layout/PageHeader';
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

const FIELDS = [
  {
    id: 'daily-dsa',
    label: 'Daily DSA',
    hint: 'docs/cadence.md baseline: 1 problem a day, five days a week.'
  },
  {
    id: 'daily-webdev-ai',
    label: 'Daily web dev + AI',
    hint: 'Baseline is ~2h a week each for system design and AI engineering.'
  },
  {
    id: 'weekend-build',
    label: 'Weekend project build',
    hint: 'Project build time is logged separately from learning.'
  }
] as const;

function LearningTargetsForm({
  initialDailyDsaTarget,
  initialDailyWebDevAiTarget,
  initialWeekendProjectBuildTarget,
  onSave,
  isUpdating
}: LearningTargetsFormProps) {
  const [dailyDsaTarget, setDailyDsaTarget] = useState(initialDailyDsaTarget);
  const [dailyWebDevAiTarget, setDailyWebDevAiTarget] = useState(initialDailyWebDevAiTarget);
  const [weekendProjectBuildTarget, setWeekendProjectBuildTarget] = useState(
    initialWeekendProjectBuildTarget
  );

  const values = [dailyDsaTarget, dailyWebDevAiTarget, weekendProjectBuildTarget];
  const setters = [setDailyDsaTarget, setDailyWebDevAiTarget, setWeekendProjectBuildTarget];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Your targets</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {FIELDS.map((field, index) => (
          <div key={field.id} className="space-y-1.5">
            <Label htmlFor={field.id} className="text-xs text-muted-foreground">
              {field.label}
            </Label>
            <Input
              id={field.id}
              value={values[index]}
              onChange={(e) => setters[index](e.target.value)}
            />
            <p className="text-xs text-muted-foreground">{field.hint}</p>
          </div>
        ))}

        <div className="flex justify-end">
          <Button
            onClick={() =>
              onSave({ dailyDsaTarget, dailyWebDevAiTarget, weekendProjectBuildTarget })
            }
            disabled={isUpdating}
          >
            {isUpdating ? 'Saving…' : 'Save targets'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function LearningTargetsPage() {
  const { learningTargets, isLoading, updateLearningTargets, isUpdating } = useLearningTargets();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Learning targets"
        description="Your own daily and weekend targets. Nothing in the app hardcodes these (CLAUDE.md invariant 4)."
      />

      <LearningTargetsForm
        key={`${learningTargets?.dailyDsaTarget || 'default'}|${learningTargets?.dailyWebDevAiTarget || 'default'}|${learningTargets?.weekendProjectBuildTarget || 'default'}`}
        initialDailyDsaTarget={learningTargets?.dailyDsaTarget || ''}
        initialDailyWebDevAiTarget={learningTargets?.dailyWebDevAiTarget || ''}
        initialWeekendProjectBuildTarget={learningTargets?.weekendProjectBuildTarget || ''}
        onSave={({ dailyDsaTarget, dailyWebDevAiTarget, weekendProjectBuildTarget }) =>
          updateLearningTargets({
            dailyDsaTarget,
            dailyWebDevAiTarget,
            weekendProjectBuildTarget
          })
        }
        isUpdating={isUpdating || isLoading}
      />
    </div>
  );
}
