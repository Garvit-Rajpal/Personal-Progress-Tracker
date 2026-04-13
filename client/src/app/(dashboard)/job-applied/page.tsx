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
  const [editableRows, setEditableRows] = useState<Record<string, EditableJob>>({});

  useEffect(() => {
    if (!hasSeeded.current && !isLoading && jobApplications.length === 0) {
      hasSeeded.current = true;
      initialApplications.forEach((application) => addJobApplication(application));
    }
  }, [isLoading, jobApplications.length, addJobApplication]);

  const applications: JobApplication[] = jobApplications;

  useEffect(() => {
    const nextRows: Record<string, EditableJob> = {};

    applications.forEach((job) => {
      nextRows[job.id] = {
        applicationStatus: job.applicationStatus,
        shortlisted: job.shortlisted,
        interviewStatus: job.interviewStatus || 'N/A',
        statusDetails: job.statusDetails || '',
        ctc: job.ctc || ''
      };
    });

    setEditableRows(nextRows);
  }, [applications]);

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
    setEditableRows((prev) => {
      const current = prev[id];
      if (!current) return prev;

      const next = { ...current, [field]: value } as EditableJob;
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
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Job Applied</h1>
        <p className="text-neutral-400 mt-2">Track your job applications and shortlisted updates.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-neutral-950 border-neutral-800">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-neutral-400">Total Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalApplications}</div>
          </CardContent>
        </Card>

        <Card className="bg-neutral-950 border-neutral-800">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-neutral-400">Shortlisted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{shortlistedCount}</div>
          </CardContent>
        </Card>

        <Card className="bg-neutral-950 border-neutral-800">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-neutral-400">Interview Cleared</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{clearedCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-neutral-950 border-neutral-800">
        <CardHeader>
          <CardTitle>Add New Application</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <Input
              placeholder="Company Name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="bg-neutral-900 border-neutral-700"
            />
            <Input
              placeholder="Application Status"
              value={applicationStatus}
              onChange={(e) => setApplicationStatus(e.target.value)}
              className="bg-neutral-900 border-neutral-700"
            />
            <Input
              placeholder="Shortlisted (Yes / N/A)"
              value={shortlisted}
              onChange={(e) => setShortlisted(e.target.value)}
              className="bg-neutral-900 border-neutral-700"
            />
            <select
              value={interviewStatus}
              onChange={(e) => setInterviewStatus(e.target.value as InterviewStatus)}
              className="h-9 rounded-md border border-neutral-700 bg-neutral-900 px-3 text-sm text-white"
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
                className="bg-neutral-900 border-neutral-700"
              />
            )}
            {interviewStatus === 'Cleared' && (
              <Input
                placeholder="CTC"
                value={ctc}
                onChange={(e) => setCtc(e.target.value)}
                className="bg-neutral-900 border-neutral-700"
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
                  <tr key={job.id} className="border-b border-neutral-900">
                    <td className="py-3 pr-4">{job.companyName}</td>
                    <td className="py-3 pr-4">
                      <Input
                        value={editable.applicationStatus}
                        onChange={(e) => updateEditableRow(job.id, 'applicationStatus', e.target.value)}
                        className="bg-neutral-900 border-neutral-700"
                      />
                    </td>
                    <td className="py-3 pr-4">
                      <Input
                        value={editable.shortlisted}
                        onChange={(e) => updateEditableRow(job.id, 'shortlisted', e.target.value)}
                        className="bg-neutral-900 border-neutral-700"
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
                          className="bg-neutral-900 border-neutral-700"
                        />
                      )}
                    </td>
                    <td className="py-3 pr-4">
                      {editable.interviewStatus === 'Cleared' ? (
                        <Input
                          value={editable.ctc}
                          onChange={(e) => updateEditableRow(job.id, 'ctc', e.target.value)}
                          className="bg-neutral-900 border-neutral-700"
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
