'use client';

import { useMemo, useState } from 'react';
import { Clock3 } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/layout/PageHeader';
import { useDailyTimeLogs } from '@/hooks/useDailyTimeLogs';

// ADR-16 — token swap only. MA-11 rebuilds this page on TimeBlock.

type DailyTimeLog = {
  id: string | number;
  date: string;
  dsaHours: number;
  devAiHours: number;
  dsaWorkLog?: string | null;
  devAiWorkLog?: string | null;
};

/**
 * The user's calendar date, not UTC. `toISOString().slice(0, 10)` — what V1
 * used — returns yesterday for the first 5h30m of every IST day, which is the
 * client-side twin of the bug ADR-4 fixed on the server.
 */
const localDateKey = () => new Intl.DateTimeFormat('en-CA').format(new Date());

export default function DailyTimePage() {
  const { dailyTimeLogs, isLoading, saveDailyTimeLog, isSaving } = useDailyTimeLogs();
  const todayDate = useMemo(() => localDateKey(), []);

  const [date, setDate] = useState(todayDate);
  // Empty, not '1' and '2'. Prefilled hours get saved unchanged and quietly
  // become fiction (docs/cadence.md §5 — a week with no data is a hole, but a
  // week with invented data is worse).
  const [dsaHours, setDsaHours] = useState('');
  const [devAiHours, setDevAiHours] = useState('');
  const [dsaWorkLog, setDsaWorkLog] = useState('');
  const [devAiWorkLog, setDevAiWorkLog] = useState('');

  const addOrUpdateLog = () => {
    const parsedDsaHours = Number(dsaHours || 0);
    const parsedDevAiHours = Number(devAiHours || 0);

    if (!date || Number.isNaN(parsedDsaHours) || Number.isNaN(parsedDevAiHours)) return;

    saveDailyTimeLog({
      date,
      dsaHours: parsedDsaHours,
      devAiHours: parsedDevAiHours,
      dsaWorkLog,
      devAiWorkLog
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Daily time"
        description="Record actual hours for DSA and Dev + AI. Logging a full day should take under two minutes."
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Log a day</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="log-date" className="text-xs text-muted-foreground">
                Date
              </Label>
              <Input
                id="log-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="dsa-hours" className="text-xs text-muted-foreground">
                DSA hours
              </Label>
              <Input
                id="dsa-hours"
                type="number"
                min="0"
                step="0.5"
                placeholder="0"
                value={dsaHours}
                onChange={(e) => setDsaHours(e.target.value)}
              />
              <Input
                type="text"
                maxLength={300}
                placeholder="What did you practise?"
                aria-label="DSA work log"
                value={dsaWorkLog}
                onChange={(e) => setDsaWorkLog(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="devai-hours" className="text-xs text-muted-foreground">
                Dev + AI hours
              </Label>
              <Input
                id="devai-hours"
                type="number"
                min="0"
                step="0.5"
                placeholder="0"
                value={devAiHours}
                onChange={(e) => setDevAiHours(e.target.value)}
              />
              <Input
                type="text"
                maxLength={300}
                placeholder="What did you build or learn?"
                aria-label="Dev and AI work log"
                value={devAiWorkLog}
                onChange={(e) => setDevAiWorkLog(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={addOrUpdateLog} disabled={isSaving}>
              {isSaving ? 'Saving…' : 'Save log'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">History</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
            </div>
          ) : dailyTimeLogs.length === 0 ? (
            <EmptyState
              icon={Clock3}
              title="No time logged yet"
              description="Save your first day above to start the trend on your dashboard."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground">
                    <th className="py-2 pr-4 font-medium">Date</th>
                    <th className="py-2 pr-4 font-medium">DSA</th>
                    <th className="py-2 pr-4 font-medium">DSA log</th>
                    <th className="py-2 pr-4 font-medium">Dev + AI</th>
                    <th className="py-2 pr-4 font-medium">Dev + AI log</th>
                    <th className="py-2 pr-4 text-right font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {dailyTimeLogs.map((log: DailyTimeLog) => (
                    <tr
                      key={log.id}
                      className="border-b border-border transition-colors last:border-0 hover:bg-muted/50"
                    >
                      {/* `date` is a @db.Date, stored as UTC midnight with the
                          user's calendar date — reading it in UTC is correct. */}
                      <td className="metric py-2 pr-4 text-foreground">
                        {new Date(log.date).toISOString().slice(0, 10)}
                      </td>
                      <td className="metric py-2 pr-4 text-pillar-craft">{log.dsaHours}</td>
                      <td className="max-w-[16rem] truncate py-2 pr-4 text-muted-foreground">
                        {log.dsaWorkLog || '—'}
                      </td>
                      <td className="metric py-2 pr-4 text-pillar-devai">{log.devAiHours}</td>
                      <td className="max-w-[16rem] truncate py-2 pr-4 text-muted-foreground">
                        {log.devAiWorkLog || '—'}
                      </td>
                      <td className="metric py-2 pr-4 text-right font-medium text-foreground">
                        {(Number(log.dsaHours) + Number(log.devAiHours)).toFixed(1)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
