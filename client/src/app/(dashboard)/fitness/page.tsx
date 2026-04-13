'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useFitnessGoals } from '@/hooks/useFitnessGoals';

export default function FitnessPage() {
  const { fitnessGoals, isLoading, updateFitnessGoals, isUpdating } = useFitnessGoals();
  const [goals, setGoals] = useState('');

  useEffect(() => {
    if (fitnessGoals?.goals) {
      setGoals(fitnessGoals.goals);
    }
  }, [fitnessGoals]);

  const saveGoals = () => {
    const trimmedGoals = goals.trim();
    if (!trimmedGoals) return;
    updateFitnessGoals({ goals: trimmedGoals });
  };

  return (
    <div className="relative space-y-6 max-w-5xl mx-auto overflow-hidden">
      <div className="pointer-events-none absolute -top-20 -left-20 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl animate-orb-float" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl animate-orb-float-delayed" />

      <div className="relative z-10">
        <h1 className="text-3xl font-bold">Fitness Goals</h1>
        <p className="text-neutral-400 mt-2">Plan your gym and health goals, and keep them visible on your dashboard.</p>
      </div>

      <Card className="relative z-10 bg-neutral-950/95 border-neutral-800">
        <CardHeader>
          <CardTitle>Set Your Fitness Goals</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <textarea
            value={goals}
            onChange={(e) => setGoals(e.target.value)}
            placeholder="Example:\n- Push/Pull/Legs x2\n- 10k steps daily\n- 8h sleep consistency"
            maxLength={800}
            className="min-h-48 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white placeholder:text-neutral-500 outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
          <Button onClick={saveGoals} disabled={isUpdating || isLoading}>
            {isUpdating ? 'Saving...' : 'Save Fitness Goals'}
          </Button>
        </CardContent>
      </Card>

      {fitnessGoals?.goals && (
        <Card className="relative z-10 bg-neutral-950/95 border-neutral-800">
          <CardHeader>
            <CardTitle>Saved Goals</CardTitle>
          </CardHeader>
          <CardContent className="whitespace-pre-wrap text-sm text-neutral-200">
            {fitnessGoals.goals}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
