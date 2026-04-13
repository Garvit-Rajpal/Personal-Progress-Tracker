'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useFinancialGoals } from '@/hooks/useFinancialGoals';

export default function FinancialGoalsPage() {
  const { financialGoals, isLoading, updateFinancialGoals, isUpdating } = useFinancialGoals();
  const [goals, setGoals] = useState('');
  const [learningNotes, setLearningNotes] = useState('');

  useEffect(() => {
    if (financialGoals) {
      setGoals(financialGoals.goals || '');
      setLearningNotes(financialGoals.learningNotes || '');
    }
  }, [financialGoals]);

  const saveFinancialGoals = () => {
    const trimmedGoals = goals.trim();
    const trimmedNotes = learningNotes.trim();
    if (!trimmedGoals || !trimmedNotes) return;

    updateFinancialGoals({
      goals: trimmedGoals,
      learningNotes: trimmedNotes
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Financial Goals</h1>
        <p className="text-neutral-400 mt-2">Track your financial goals and your key finance learnings in one place.</p>
      </div>

      <Card className="bg-neutral-950 border-neutral-800">
        <CardHeader>
          <CardTitle>Update Financial Plan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="mb-1 block text-xs text-neutral-400">Financial Goals</label>
            <textarea
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              placeholder="Example:\n- Save ₹X per month\n- Build emergency fund"
              maxLength={1000}
              className="min-h-36 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white placeholder:text-neutral-500 outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-neutral-400">Finance Learning Notes</label>
            <textarea
              value={learningNotes}
              onChange={(e) => setLearningNotes(e.target.value)}
              placeholder="Write your learning notes from books, videos, or courses..."
              maxLength={1200}
              className="min-h-36 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white placeholder:text-neutral-500 outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </div>

          <Button onClick={saveFinancialGoals} disabled={isUpdating || isLoading}>
            {isUpdating ? 'Saving...' : 'Save Financial Goals'}
          </Button>
        </CardContent>
      </Card>

      {financialGoals && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="bg-neutral-950 border-neutral-800">
            <CardHeader>
              <CardTitle>Saved Financial Goals</CardTitle>
            </CardHeader>
            <CardContent className="whitespace-pre-wrap text-sm text-neutral-200">
              {financialGoals.goals}
            </CardContent>
          </Card>

          <Card className="bg-neutral-950 border-neutral-800">
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
