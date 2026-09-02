'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { PageHeader } from '@/components/layout/PageHeader';
import { useNextDayPlan } from '@/hooks/useNextDayPlan';

type PlanFormProps = {
  initialPlan: string;
  onSave: (briefPlan: string) => void;
  isSaving: boolean;
};

function PlanForm({ initialPlan, onSave, isSaving }: PlanFormProps) {
  const [briefPlan, setBriefPlan] = useState(initialPlan);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Tomorrow&apos;s plan</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Textarea
          value={briefPlan}
          onChange={(e) => setBriefPlan(e.target.value)}
          placeholder="One or two lines on what tomorrow's session covers…"
          maxLength={400}
          aria-label="Next day plan"
          className="min-h-40"
        />
        <div className="flex items-center justify-between gap-3">
          <p className="metric text-xs text-muted-foreground">{briefPlan.length}/400</p>
          <Button onClick={() => onSave(briefPlan)} disabled={isSaving}>
            {isSaving ? 'Saving…' : 'Save plan'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function NextDayPlanPage() {
  const { nextDayPlan, isLoading, saveNextDayPlan, isSaving } = useNextDayPlan();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Next day plan"
        description="Write a brief plan for tomorrow. It surfaces as “next up” on the dashboard."
      />

      <PlanForm
        key={nextDayPlan?.briefPlan || 'default'}
        initialPlan={nextDayPlan?.briefPlan || ''}
        onSave={(briefPlan) => saveNextDayPlan({ briefPlan: briefPlan.trim() })}
        isSaving={isSaving || isLoading}
      />
    </div>
  );
}
