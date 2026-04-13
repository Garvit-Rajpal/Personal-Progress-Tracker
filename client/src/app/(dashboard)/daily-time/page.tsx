'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useDailyTimeLogs } from '@/hooks/useDailyTimeLogs';

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
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Daily Time Log</h1>
        <p className="text-neutral-400 mt-2">Record your actual daily hours for DSA and Dev + AI learning.</p>
      </div>

      <Card className="bg-neutral-950 border-neutral-800">
        <CardHeader>
          <CardTitle>Add or Update Daily Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-neutral-900 border-neutral-700" />
            <div className="space-y-2">
              <p className="text-xs text-neutral-400 font-medium">DSA</p>
              <Input
                type="number"
                min="0"
                step="0.5"
                placeholder="Hours"
                value={dsaHours}
                onChange={(e) => setDsaHours(e.target.value)}
                className="bg-neutral-900 border-neutral-700"
              />
              <Input
                type="text"
                maxLength={300}
                placeholder="Optional: what did you practice?"
                value={dsaWorkLog}
                onChange={(e) => setDsaWorkLog(e.target.value)}
                className="bg-neutral-900 border-neutral-700"
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
                className="bg-neutral-900 border-neutral-700"
              />
              <Input
                type="text"
                maxLength={300}
                placeholder="Optional: what did you build/learn?"
                value={devAiWorkLog}
                onChange={(e) => setDevAiWorkLog(e.target.value)}
                className="bg-neutral-900 border-neutral-700"
              />
            </div>
            <Button onClick={addOrUpdateLog} disabled={isSaving} className="w-full md:col-span-3">
              {isSaving ? 'Saving...' : 'Save Log'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-neutral-950 border-neutral-800">
        <CardHeader>
          <CardTitle>Time Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-neutral-800 text-left text-neutral-400">
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
                    <td colSpan={6} className="py-6 text-center text-neutral-500">No time logs added yet.</td>
                  </tr>
                ) : (
                  dailyTimeLogs.map((log: any) => (
                    <tr key={log.id} className="border-b border-neutral-900">
                      <td className="py-3 pr-4">{new Date(log.date).toISOString().slice(0, 10)}</td>
                      <td className="py-3 pr-4">{log.dsaHours}</td>
                      <td className="py-3 pr-4 text-neutral-300">{log.dsaWorkLog || '-'}</td>
                      <td className="py-3 pr-4">{log.devAiHours}</td>
                      <td className="py-3 pr-4 text-neutral-300">{log.devAiWorkLog || '-'}</td>
                      <td className="py-3 pr-4">{(Number(log.dsaHours) + Number(log.devAiHours)).toFixed(1)}</td>
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
