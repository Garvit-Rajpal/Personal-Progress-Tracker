'use client';

import { useEffect, useState } from 'react';
import { CalendarDays, Pencil } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const GOAL_DATE_STORAGE_KEY = 'dashboard-goal-date';

/**
 * No default date. V1 hardcoded '2026-06-21', which has since passed, so the
 * card rendered "Goal Date Reached" permanently and the dashboard's most
 * prominent element was stale. An unset goal now asks to be set; a past goal
 * says so plainly.
 */
const formatGoalDate = (goalDate: string) => {
  const parsed = new Date(`${goalDate}T23:59:59`);
  if (Number.isNaN(parsed.getTime())) return null;
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(parsed);
};

export function GoalCountdown() {
  const [goalDate, setGoalDate] = useState('');
  const [editing, setEditing] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // localStorage is not readable during render without a hydration
    // mismatch; the component renders nothing until this lands.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGoalDate(window.localStorage.getItem(GOAL_DATE_STORAGE_KEY) || '');
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (goalDate) window.localStorage.setItem(GOAL_DATE_STORAGE_KEY, goalDate);
    else window.localStorage.removeItem(GOAL_DATE_STORAGE_KEY);
  }, [goalDate, hydrated]);

  // An hour is enough for a day counter; V1 re-rendered every 60s.
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60 * 60 * 1000);
    return () => window.clearInterval(timer);
  }, []);

  const parsed = goalDate ? new Date(`${goalDate}T23:59:59`) : null;
  const isValid = parsed !== null && !Number.isNaN(parsed.getTime());
  const daysLeft = isValid
    ? Math.ceil((parsed.getTime() - now) / (1000 * 60 * 60 * 24))
    : 0;
  const label = isValid ? formatGoalDate(goalDate) : null;

  if (!hydrated) return null;

  return (
    <Card>
      <CardContent className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <CalendarDays className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          <div className="space-y-0.5">
            {!isValid ? (
              <>
                <p className="text-sm font-medium text-foreground">No target date set</p>
                <p className="text-xs text-muted-foreground">
                  Set one to count down to your goal.
                </p>
              </>
            ) : daysLeft > 0 ? (
              <>
                <p className="metric text-lg font-semibold leading-tight text-foreground">
                  {daysLeft} <span className="text-sm font-normal text-muted-foreground">
                    {daysLeft === 1 ? 'day' : 'days'} to target
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </>
            ) : (
              <>
                <p className="text-sm font-medium text-warning">Target date passed</p>
                <p className="text-xs text-muted-foreground">{label} — set a new one.</p>
              </>
            )}
          </div>
        </div>

        {editing ? (
          <div className="flex items-end gap-2">
            <div className="space-y-1">
              <Label htmlFor="goal-date" className="text-xs text-muted-foreground">
                Target date
              </Label>
              <Input
                id="goal-date"
                type="date"
                value={goalDate}
                onChange={(e) => setGoalDate(e.target.value)}
                className="w-40"
              />
            </div>
            <Button size="sm" onClick={() => setEditing(false)}>
              Done
            </Button>
          </div>
        ) : (
          <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
            <Pencil aria-hidden />
            {isValid ? 'Change' : 'Set date'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
