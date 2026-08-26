'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useJobApplications } from '@/hooks/useJobApplications';

type InterviewStatus = 'N/A' | 'InProgress' | 'Cleared' | 'Failed';

type JobApplication = {
  id: string;
  companyName: string;
  applicationStatus: string;
  shortlisted: string;
  interviewStatus: InterviewStatus;
  statusDetails?: string | null;
  ctc?: string | null;
};

type SeedJobApplication = {
  companyName: string;
  applicationStatus: string;
  shortlisted: string;
  interviewStatus: InterviewStatus;
};

type EditableJob = {
  applicationStatus: string;
  shortlisted: string;
  interviewStatus: InterviewStatus;
  statusDetails: string;
  ctc: string;
};

const initialApplications: SeedJobApplication[] = [
  { companyName: 'Aadrila Technologies', applicationStatus: 'Applied', shortlisted: 'N/A', interviewStatus: 'N/A' },
  { companyName: 'Travel VIP', applicationStatus: 'Applied', shortlisted: 'N/A', interviewStatus: 'N/A' },
  { companyName: 'BNY', applicationStatus: 'Applied', shortlisted: 'N/A', interviewStatus: 'N/A' },
  { companyName: 'Incubyte', applicationStatus: 'Applied', shortlisted: 'Yes', interviewStatus: 'N/A' },
  { companyName: 'ClanX', applicationStatus: 'Applied', shortlisted: 'N/A', interviewStatus: 'N/A' },
  { companyName: 'CoverStack', applicationStatus: 'Applied', shortlisted: 'N/A', interviewStatus: 'N/A' },
  { companyName: 'vetsez', applicationStatus: 'Applied', shortlisted: 'N/A', interviewStatus: 'N/A' },
  { companyName: 'Blankfactor', applicationStatus: 'Applied', shortlisted: 'N/A', interviewStatus: 'N/A' },
  { companyName: 'Swageazy', applicationStatus: 'Applied', shortlisted: 'N/A', interviewStatus: 'N/A' },
  { companyName: 'Hero Vired', applicationStatus: 'Applied', shortlisted: 'N/A', interviewStatus: 'N/A' },
  { companyName: 'Securityboat', applicationStatus: 'Applied', shortlisted: 'N/A', interviewStatus: 'N/A' },
  { companyName: 'Techbulls', applicationStatus: 'Applied', shortlisted: 'N/A', interviewStatus: 'N/A' },
];

export default function JobAppliedPage() {
  const { jobApplications, isLoading, addJobApplication, isAdding, updateJobApplication, isUpdating } = useJobApplications();
  const hasSeeded = useRef(false);
  const [companyName, setCompanyName] = useState('');
  const [applicationStatus, setApplicationStatus] = useState('Applied');
  const [shortlisted, setShortlisted] = useState('N/A');
  const [interviewStatus, setInterviewStatus] = useState<InterviewStatus>('N/A');
  const [statusDetails, setStatusDetails] = useState('');
  const [ctc, setCtc] = useState('');
  const [rowOverrides, setRowOverrides] = useState<Record<string, Partial<EditableJob>>>({});

  useEffect(() => {
    if (!hasSeeded.current && !isLoading && jobApplications.length === 0) {
      hasSeeded.current = true;
      initialApplications.forEach((application) => addJobApplication(application));
    }
  }, [isLoading, jobApplications.length, addJobApplication]);

  const applications: JobApplication[] = jobApplications;

  const editableRows = useMemo<Record<string, EditableJob>>(() => {
    return applications.reduce<Record<string, EditableJob>>((rows, job) => {
      const overrides = rowOverrides[job.id] || {};

      rows[job.id] = {
        applicationStatus: overrides.applicationStatus ?? job.applicationStatus,
        shortlisted: overrides.shortlisted ?? job.shortlisted,
        interviewStatus: (overrides.interviewStatus as InterviewStatus) ?? job.interviewStatus ?? 'N/A',
        statusDetails: overrides.statusDetails ?? job.statusDetails ?? '',
        ctc: overrides.ctc ?? job.ctc ?? ''
      };

      return rows;
    }, {});
  }, [applications, rowOverrides]);

  const totalApplications = useMemo(() => applications.length, [applications]);
  const shortlistedCount = useMemo(
    () => applications.filter((job) => job.shortlisted.toLowerCase() === 'yes').length,
    [applications]
  );

  const clearedCount = useMemo(
    () => applications.filter((job) => (job.interviewStatus || 'N/A') === 'Cleared').length,
    [applications]
  );

  const updateEditableRow = (id: string, field: keyof EditableJob, value: string) => {
    setRowOverrides((prev) => {
      const current = prev[id] || {};
      const next = { ...current, [field]: value } as Partial<EditableJob>;

      if (field === 'interviewStatus' && value === 'N/A') {
        next.statusDetails = '';
        next.ctc = '';
      }

      if (field === 'interviewStatus' && value !== 'Cleared') {
        next.ctc = '';
      }

      return {
        ...prev,
        [id]: next
      };
    });
  };

  const saveRow = (id: string) => {
    const row = editableRows[id];
    if (!row) return;

    updateJobApplication({
      id,
      applicationStatus: row.applicationStatus,
      shortlisted: row.shortlisted,
      interviewStatus: row.interviewStatus,
      statusDetails: row.statusDetails,
      ctc: row.ctc
    });
  };

  const addApplication = () => {
    const trimmedCompanyName = companyName.trim();
    const trimmedStatus = applicationStatus.trim();
    const trimmedShortlisted = shortlisted.trim();
    const trimmedInterviewStatus = interviewStatus;
    const trimmedDetails = statusDetails.trim();
    const trimmedCtc = ctc.trim();

    if (!trimmedCompanyName || !trimmedStatus || !trimmedShortlisted) {
      return;
    }

    if (trimmedInterviewStatus !== 'N/A' && !trimmedDetails) {
      return;
    }

    if (trimmedInterviewStatus === 'Cleared' && !trimmedCtc) {
      return;
    }

    addJobApplication({
      companyName: trimmedCompanyName,
      applicationStatus: trimmedStatus,
      shortlisted: trimmedShortlisted,
      interviewStatus: trimmedInterviewStatus,
      statusDetails: trimmedInterviewStatus === 'N/A' ? undefined : trimmedDetails,
      ctc: trimmedInterviewStatus === 'Cleared' ? trimmedCtc : undefined
    });

    setCompanyName('');
    setApplicationStatus('Applied');
    setShortlisted('N/A');
    setInterviewStatus('N/A');
    setStatusDetails('');
    setCtc('');
  };

  return (
    <div className="relative space-y-6 max-w-6xl mx-auto overflow-hidden">
      <div className="pointer-events-none absolute -right-10 top-0 h-48 w-48 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="pointer-events-none absolute left-10 top-28 h-64 w-64 rounded-full bg-emerald-400/5 blur-3xl" />
      <div className="relative rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.95),rgba(17,24,39,0.8))] p-6 shadow-[0_30px_90px_-50px_rgba(0,0,0,0.9)] backdrop-blur-xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-200">
          <span className="h-2 w-2 rounded-full bg-cyan-300" />
          Application pipeline
        </div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">Job Applied</h1>
        <p className="mt-2 max-w-2xl text-neutral-300">Track your job applications and shortlisted updates.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-white/10 bg-white/[0.04]">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-neutral-400">Total Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalApplications}</div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/[0.04]">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-neutral-400">Shortlisted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{shortlistedCount}</div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/[0.04]">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-neutral-400">Interview Cleared</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{clearedCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-white/10 bg-white/[0.04]">
        <CardHeader>
          <CardTitle>Add New Application</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <Input
              placeholder="Company Name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="bg-neutral-900/90 border-white/10"
            />
            <Input
              placeholder="Application Status"
              value={applicationStatus}
              onChange={(e) => setApplicationStatus(e.target.value)}
              className="bg-neutral-900/90 border-white/10"
            />
            <Input
              placeholder="Shortlisted (Yes / N/A)"
              value={shortlisted}
              onChange={(e) => setShortlisted(e.target.value)}
              className="bg-neutral-900/90 border-white/10"
            />
            <select
              value={interviewStatus}
              onChange={(e) => setInterviewStatus(e.target.value as InterviewStatus)}
              className="h-9 rounded-md border border-white/10 bg-neutral-900/90 px-3 text-sm text-white"
            >
              <option value="N/A">N/A</option>
              <option value="InProgress">InProgress</option>
              <option value="Cleared">Cleared</option>
              <option value="Failed">Failed</option>
            </select>
            {interviewStatus !== 'N/A' && (
              <Input
                placeholder="Status details"
                value={statusDetails}
                onChange={(e) => setStatusDetails(e.target.value)}
                className="bg-neutral-900/90 border-white/10"
              />
            )}
            {interviewStatus === 'Cleared' && (
              <Input
                placeholder="CTC"
                value={ctc}
                onChange={(e) => setCtc(e.target.value)}
                className="bg-neutral-900/90 border-white/10"
              />
            )}
            <Button onClick={addApplication} className="w-full" disabled={isAdding}>
              {isAdding ? 'Adding...' : 'Add'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-neutral-950 border-neutral-800">
        <CardHeader>
          <CardTitle>Applications Table</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-neutral-800 text-left text-neutral-400">
                  <th className="py-3 pr-4 font-medium">Company Name</th>
                  <th className="py-3 pr-4 font-medium">Application Status</th>
                  <th className="py-3 pr-4 font-medium">Shortlisted</th>
                  <th className="py-3 pr-4 font-medium">Interview Status</th>
                  <th className="py-3 pr-4 font-medium">Details</th>
                  <th className="py-3 pr-4 font-medium">CTC</th>
                  <th className="py-3 pr-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((job) => {
                  const editable = editableRows[job.id];
                  if (!editable) return null;

                  return (
                    <tr key={job.id} className="border-b border-white/5 transition-colors hover:bg-white/[0.03] align-top">
                    <td className="py-3 pr-4 text-neutral-100">{job.companyName}</td>
                    <td className="py-3 pr-4">
                      <Input
                        value={editable.applicationStatus}
                        onChange={(e) => updateEditableRow(job.id, 'applicationStatus', e.target.value)}
                        className="bg-neutral-900/90 border-white/10"
                      />
                    </td>
                    <td className="py-3 pr-4">
                      <Input
                        value={editable.shortlisted}
                        onChange={(e) => updateEditableRow(job.id, 'shortlisted', e.target.value)}
                        className="bg-neutral-900/90 border-white/10"
                      />
                    </td>
                    <td className="py-3 pr-4">
                      <select
                        value={editable.interviewStatus}
                        onChange={(e) => updateEditableRow(job.id, 'interviewStatus', e.target.value)}
                        className="h-9 min-w-30 rounded-md border border-neutral-700 bg-neutral-900 px-3 text-sm text-white"
                      >
                        <option value="N/A">N/A</option>
                        <option value="InProgress">InProgress</option>
                        <option value="Cleared">Cleared</option>
                        <option value="Failed">Failed</option>
                      </select>
                    </td>
                    <td className="py-3 pr-4">
                      {editable.interviewStatus === 'N/A' ? (
                        <span className="text-xs text-neutral-500">Not required</span>
                      ) : (
                        <Input
                          value={editable.statusDetails}
                          onChange={(e) => updateEditableRow(job.id, 'statusDetails', e.target.value)}
                          className="bg-neutral-900/90 border-white/10"
                        />
                      )}
                    </td>
                    <td className="py-3 pr-4">
                      {editable.interviewStatus === 'Cleared' ? (
                        <Input
                          value={editable.ctc}
                          onChange={(e) => updateEditableRow(job.id, 'ctc', e.target.value)}
                          className="bg-neutral-900/90 border-white/10"
                        />
                      ) : (
                        <span className="text-xs text-neutral-500">N/A</span>
                      )}
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={`inline-flex items-center rounded px-2 py-1 text-xs font-medium ${
                          editable.shortlisted.toLowerCase() === 'yes'
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : 'bg-neutral-800 text-neutral-300'
                        }`}
                      >
                        {editable.shortlisted}
                      </span>
                      <Button
                        size="sm"
                        className="ml-2"
                        disabled={isUpdating}
                        onClick={() => saveRow(job.id)}
                      >
                        Save
                      </Button>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
