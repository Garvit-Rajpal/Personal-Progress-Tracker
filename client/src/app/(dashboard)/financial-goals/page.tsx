'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/layout/PageHeader';
import { useFinancialGoals } from '@/hooks/useFinancialGoals';

// ADR-16 — token swap only. MA-10 rebuilds this on the metric engine and
// deletes useFinancialGoals.

type FinancialFormProps = {
  initialGoals: string;
  initialLearningNotes: string;
  onSave: (payload: { goals: string; learningNotes: string }) => void;
  isSaving: boolean;
};

function FinancialForm({
  initialGoals,
  initialLearningNotes,
  onSave,
  isSaving
}: FinancialFormProps) {
  const [goals, setGoals] = useState(initialGoals);
  const [learningNotes, setLearningNotes] = useState(initialLearningNotes);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Financial plan</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="financial-goals" className="text-xs text-muted-foreground">
            Financial goals
          </Label>
          <Textarea
            id="financial-goals"
            value={goals}
            onChange={(e) => setGoals(e.target.value)}
            placeholder={`Example:\n- Save ₹X per month\n- Build emergency fund`}
            maxLength={1000}
            className="min-h-36"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="finance-notes" className="text-xs text-muted-foreground">
            Finance learning notes
          </Label>
          <Textarea
            id="finance-notes"
            value={learningNotes}
            onChange={(e) => setLearningNotes(e.target.value)}
            placeholder="Notes from books, videos or courses…"
            maxLength={1200}
            className="min-h-36"
          />
        </div>

        <div className="flex justify-end">
          <Button onClick={() => onSave({ goals, learningNotes })} disabled={isSaving}>
            {isSaving ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function FinancialGoalsPage() {
  const { financialGoals, isLoading, updateFinancialGoals, isUpdating } = useFinancialGoals();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Financial goals"
        description="Track your financial goals and key finance learnings in one place."
      />

      <FinancialForm
        key={`${financialGoals?.goals || 'default'}|${financialGoals?.learningNotes || 'default'}`}
        initialGoals={financialGoals?.goals || ''}
        initialLearningNotes={financialGoals?.learningNotes || ''}
        onSave={({ goals, learningNotes }) =>
          updateFinancialGoals({ goals: goals.trim(), learningNotes: learningNotes.trim() })
        }
        isSaving={isUpdating || isLoading}
      />
    </div>
  );
}
