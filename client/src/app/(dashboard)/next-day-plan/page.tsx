'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNextDayPlan } from '@/hooks/useNextDayPlan';

export default function NextDayPlanPage() {
  const { nextDayPlan, isLoading, saveNextDayPlan, isSaving } = useNextDayPlan();
  const [briefPlan, setBriefPlan] = useState('');

  useEffect(() => {
    if (nextDayPlan?.briefPlan) {
      setBriefPlan(nextDayPlan.briefPlan);
    }
  }, [nextDayPlan]);

  const savePlan = () => {
    const trimmedPlan = briefPlan.trim();
    if (!trimmedPlan) return;

    saveNextDayPlan({ briefPlan: trimmedPlan });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Next Day Plan</h1>
        <p className="text-neutral-400 mt-2">Write a brief plan for tomorrow and keep it visible on the dashboard.</p>
      </div>

      <Card className="bg-neutral-950 border-neutral-800">
        <CardHeader>
          <CardTitle>Edit Plan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <textarea
            value={briefPlan}
            onChange={(e) => setBriefPlan(e.target.value)}
            placeholder="Write a brief plan for tomorrow..."
            maxLength={400}
            className="min-h-40 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white placeholder:text-neutral-500 outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
          <Button onClick={savePlan} disabled={isSaving || isLoading}>
            {isSaving ? 'Saving...' : 'Save Plan'}
          </Button>
        </CardContent>
      </Card>

      {nextDayPlan?.briefPlan && (
        <Card className="bg-neutral-950 border-neutral-800">
          <CardHeader>
            <CardTitle>Saved Plan</CardTitle>
          </CardHeader>
          <CardContent className="whitespace-pre-wrap text-sm text-neutral-200">
            {nextDayPlan.briefPlan}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
