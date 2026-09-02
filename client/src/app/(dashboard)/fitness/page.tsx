'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { PageHeader } from '@/components/layout/PageHeader';
import { useFitnessGoals } from '@/hooks/useFitnessGoals';

// ADR-16 — token swap only. MA-8 rebuilds this page on the metric engine and
// deletes useFitnessGoals, so there is no point restructuring it now.

type FitnessFormProps = {
  initialGoals: string;
  onSave: (goals: string) => void;
  isSaving: boolean;
};

function FitnessForm({ initialGoals, onSave, isSaving }: FitnessFormProps) {
  const [goals, setGoals] = useState(initialGoals);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Your fitness goals</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Textarea
          value={goals}
          onChange={(e) => setGoals(e.target.value)}
          placeholder={`Example:\n- Push/Pull/Legs x2\n- 10k steps daily\n- 8h sleep consistency`}
          maxLength={800}
          aria-label="Fitness goals"
          className="min-h-48"
        />
        <div className="flex items-center justify-between gap-3">
          <p className="metric text-xs text-muted-foreground">{goals.length}/800</p>
          <Button onClick={() => onSave(goals)} disabled={isSaving}>
            {isSaving ? 'Saving…' : 'Save goals'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function FitnessPage() {
  const { fitnessGoals, isLoading, updateFitnessGoals, isUpdating } = useFitnessGoals();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fitness"
        description="Plan your gym and health goals, and keep them visible on the dashboard."
      />

      <FitnessForm
        key={fitnessGoals?.goals || 'empty'}
        initialGoals={fitnessGoals?.goals || ''}
        onSave={(nextGoals) => updateFitnessGoals({ goals: nextGoals.trim() })}
        isSaving={isUpdating || isLoading}
      />
    </div>
  );
}
