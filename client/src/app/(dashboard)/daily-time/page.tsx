'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useDailyTimeLogs } from '@/hooks/useDailyTimeLogs';

type DailyTimeLog = {
  id: string | number;
  date: string;
  dsaHours: number;
  devAiHours: number;
  dsaWorkLog?: string | null;
  devAiWorkLog?: string | null;
};

export default function DailyTimePage() {
  const { dailyTimeLogs, isLoading, saveDailyTimeLog, isSaving } = useDailyTimeLogs();
  const todayDate = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const [date, setDate] = useState(todayDate);
  const [dsaHours, setDsaHours] = useState('1');
  const [devAiHours, setDevAiHours] = useState('2');
  const [dsaWorkLog, setDsaWorkLog] = useState('');
  const [devAiWorkLog, setDevAiWorkLog] = useState('');

  const addOrUpdateLog = () => {
    const parsedDsaHours = Number(dsaHours);
    const parsedDevAiHours = Number(devAiHours);

    if (!date || Number.isNaN(parsedDsaHours) || Number.isNaN(parsedDevAiHours)) {
      return;
    }

    saveDailyTimeLog({
      date,
      dsaHours: parsedDsaHours,
      devAiHours: parsedDevAiHours,
      dsaWorkLog,
      devAiWorkLog
    });
  };

  return (
    <div className="relative space-y-6 max-w-6xl mx-auto overflow-hidden">
      <div className="pointer-events-none absolute -right-10 top-0 h-48 w-48 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="pointer-events-none absolute left-16 top-24 h-64 w-64 rounded-full bg-emerald-400/5 blur-3xl" />
      <div className="relative rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.95),rgba(17,24,39,0.8))] p-6 shadow-[0_30px_90px_-50px_rgba(0,0,0,0.9)] backdrop-blur-xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-200">
          <span className="h-2 w-2 rounded-full bg-cyan-300" />
          Daily habit tracking
        </div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">Daily Time Log</h1>
        <p className="mt-2 max-w-2xl text-neutral-300">Record your actual daily hours for DSA and Dev + AI learning.</p>
      </div>

      <Card className="border-white/10 bg-white/[0.04]">
        <CardHeader>
          <CardTitle>Add or Update Daily Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-neutral-900/90 border-white/10" />
            <div className="space-y-2">
              <p className="text-xs text-neutral-400 font-medium">DSA</p>
              <Input
                type="number"
                min="0"
                step="0.5"
                placeholder="Hours"
                value={dsaHours}
                onChange={(e) => setDsaHours(e.target.value)}
                className="bg-neutral-900/90 border-white/10"
              />
              <Input
                type="text"
                maxLength={300}
                placeholder="Optional: what did you practice?"
                value={dsaWorkLog}
                onChange={(e) => setDsaWorkLog(e.target.value)}
                className="bg-neutral-900/90 border-white/10"
              />
            </div>
            <div className="space-y-2">
              <p className="text-xs text-neutral-400 font-medium">Dev + AI</p>
              <Input
                type="number"
                min="0"
                step="0.5"
                placeholder="Hours"
                value={devAiHours}
                onChange={(e) => setDevAiHours(e.target.value)}
                className="bg-neutral-900/90 border-white/10"
              />
              <Input
                type="text"
                maxLength={300}
                placeholder="Optional: what did you build/learn?"
                value={devAiWorkLog}
                onChange={(e) => setDevAiWorkLog(e.target.value)}
                className="bg-neutral-900/90 border-white/10"
              />
            </div>
            <Button onClick={addOrUpdateLog} disabled={isSaving} className="w-full md:col-span-3">
              {isSaving ? 'Saving...' : 'Save Log'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-white/[0.04]">
        <CardHeader>
          <CardTitle>Time Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-neutral-400">
                  <th className="py-3 pr-4 font-medium">Date</th>
                  <th className="py-3 pr-4 font-medium">DSA Hours</th>
                  <th className="py-3 pr-4 font-medium">DSA Work Log</th>
                  <th className="py-3 pr-4 font-medium">Dev + AI Hours</th>
                  <th className="py-3 pr-4 font-medium">Dev + AI Work Log</th>
                  <th className="py-3 pr-4 font-medium">Total Hours</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-neutral-500">Loading logs...</td>
                  </tr>
                ) : dailyTimeLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-neutral-500">No time logs added yet.</td>
                  </tr>
                ) : (
                  dailyTimeLogs.map((log: DailyTimeLog) => (
                    <tr key={log.id} className="border-b border-white/5 transition-colors hover:bg-white/[0.03]">
                      <td className="py-3 pr-4 text-neutral-100">{new Date(log.date).toISOString().slice(0, 10)}</td>
                      <td className="py-3 pr-4 text-cyan-200">{log.dsaHours}</td>
                      <td className="py-3 pr-4 text-neutral-300">{log.dsaWorkLog || '-'}</td>
                      <td className="py-3 pr-4 text-emerald-200">{log.devAiHours}</td>
                      <td className="py-3 pr-4 text-neutral-300">{log.devAiWorkLog || '-'}</td>
                      <td className="py-3 pr-4 font-medium text-white">{(Number(log.dsaHours) + Number(log.devAiHours)).toFixed(1)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
