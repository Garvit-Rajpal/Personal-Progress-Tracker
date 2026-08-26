'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useFitnessGoals } from '@/hooks/useFitnessGoals';

type FitnessFormProps = {
  initialGoals: string;
  onSave: (goals: string) => void;
  isSaving: boolean;
};

function FitnessForm({ initialGoals, onSave, isSaving }: FitnessFormProps) {
  const [goals, setGoals] = useState(initialGoals);

  return (
    <Card className="border-white/10 bg-white/[0.04]">
      <CardHeader>
        <CardTitle>Set Your Fitness Goals</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <textarea
          value={goals}
          onChange={(e) => setGoals(e.target.value)}
          placeholder={`Example:\n- Push/Pull/Legs x2\n- 10k steps daily\n- 8h sleep consistency`}
          maxLength={800}
          className="min-h-48 w-full rounded-xl border border-white/10 bg-neutral-900/90 px-3 py-2 text-sm text-white placeholder:text-neutral-500 outline-none focus-visible:border-cyan-400/60 focus-visible:ring-3 focus-visible:ring-cyan-400/15"
        />
        <Button onClick={() => onSave(goals)} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Fitness Goals'}
        </Button>
      </CardContent>
    </Card>
  );
}

export default function FitnessPage() {
  const { fitnessGoals, isLoading, updateFitnessGoals, isUpdating } = useFitnessGoals();

  return (
    <div className="relative space-y-6 max-w-5xl mx-auto overflow-hidden">
      <div className="pointer-events-none absolute -top-20 -left-20 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl animate-orb-float" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl animate-orb-float-delayed" />

      <div className="relative z-10 rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.95),rgba(17,24,39,0.8))] p-6 shadow-[0_30px_90px_-50px_rgba(0,0,0,0.9)] backdrop-blur-xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-200">
          <span className="h-2 w-2 rounded-full bg-cyan-300" />
          Health and recovery
        </div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">Fitness Goals</h1>
        <p className="mt-2 max-w-2xl text-neutral-300">Plan your gym and health goals, and keep them visible on your dashboard.</p>
      </div>

      <FitnessForm
        key={fitnessGoals?.goals || 'empty'}
        initialGoals={fitnessGoals?.goals || ''}
        onSave={(nextGoals) => updateFitnessGoals({ goals: nextGoals.trim() })}
        isSaving={isUpdating || isLoading}
      />

      {fitnessGoals?.goals && (
        <Card className="relative z-10 border-white/10 bg-white/[0.04]">
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
