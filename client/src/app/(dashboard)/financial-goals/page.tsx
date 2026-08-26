'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useFinancialGoals } from '@/hooks/useFinancialGoals';

type FinancialFormProps = {
  initialGoals: string;
  initialLearningNotes: string;
  onSave: (payload: { goals: string; learningNotes: string }) => void;
  isSaving: boolean;
};

function FinancialForm({ initialGoals, initialLearningNotes, onSave, isSaving }: FinancialFormProps) {
  const [goals, setGoals] = useState(initialGoals);
  const [learningNotes, setLearningNotes] = useState(initialLearningNotes);

  return (
    <Card className="border-white/10 bg-white/[0.04]">
      <CardHeader>
        <CardTitle>Update Financial Plan</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="mb-1 block text-xs text-neutral-400">Financial Goals</label>
          <textarea
            value={goals}
            onChange={(e) => setGoals(e.target.value)}
            placeholder={`Example:\n- Save ₹X per month\n- Build emergency fund`}
            maxLength={1000}
            className="min-h-36 w-full rounded-xl border border-white/10 bg-neutral-900/90 px-3 py-2 text-sm text-white placeholder:text-neutral-500 outline-none focus-visible:border-cyan-400/60 focus-visible:ring-3 focus-visible:ring-cyan-400/15"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs text-neutral-400">Finance Learning Notes</label>
          <textarea
            value={learningNotes}
            onChange={(e) => setLearningNotes(e.target.value)}
            placeholder="Write your learning notes from books, videos, or courses..."
            maxLength={1200}
            className="min-h-36 w-full rounded-xl border border-white/10 bg-neutral-900/90 px-3 py-2 text-sm text-white placeholder:text-neutral-500 outline-none focus-visible:border-cyan-400/60 focus-visible:ring-3 focus-visible:ring-cyan-400/15"
          />
        </div>

        <Button onClick={() => onSave({ goals, learningNotes })} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Financial Goals'}
        </Button>
      </CardContent>
    </Card>
  );
}

export default function FinancialGoalsPage() {
  const { financialGoals, isLoading, updateFinancialGoals, isUpdating } = useFinancialGoals();

  return (
    <div className="relative space-y-6 max-w-5xl mx-auto overflow-hidden">
      <div className="pointer-events-none absolute -top-20 -left-20 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl animate-orb-float" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl animate-orb-float-delayed" />

      <div className="relative z-10 rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.95),rgba(17,24,39,0.8))] p-6 shadow-[0_30px_90px_-50px_rgba(0,0,0,0.9)] backdrop-blur-xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-200">
          <span className="h-2 w-2 rounded-full bg-cyan-300" />
          Money and learning
        </div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">Financial Goals</h1>
        <p className="mt-2 max-w-2xl text-neutral-300">Track your financial goals and your key finance learnings in one place.</p>
      </div>

      <FinancialForm
        key={`${financialGoals?.goals || 'default'}|${financialGoals?.learningNotes || 'default'}`}
        initialGoals={financialGoals?.goals || ''}
        initialLearningNotes={financialGoals?.learningNotes || ''}
        onSave={({ goals, learningNotes }) => updateFinancialGoals({ goals: goals.trim(), learningNotes: learningNotes.trim() })}
        isSaving={isUpdating || isLoading}
      />

      {financialGoals && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="border-white/10 bg-white/[0.04]">
            <CardHeader>
              <CardTitle>Saved Financial Goals</CardTitle>
            </CardHeader>
            <CardContent className="whitespace-pre-wrap text-sm text-neutral-200">
              {financialGoals.goals}
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/[0.04]">
            <CardHeader>
              <CardTitle>Saved Learning Notes</CardTitle>
            </CardHeader>
            <CardContent className="whitespace-pre-wrap text-sm text-neutral-200">
              {financialGoals.learningNotes}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
