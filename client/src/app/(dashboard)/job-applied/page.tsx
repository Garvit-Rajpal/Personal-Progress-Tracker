'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectField } from '@/components/ui/select';
import { PageHeader } from '@/components/layout/PageHeader';
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
    <div className="space-y-6">
      <PageHeader
        title="Job applied"
        description="Track applications, shortlists and interview outcomes."
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: 'Total applications', value: totalApplications },
          { label: 'Shortlisted', value: shortlistedCount },
          { label: 'Interviews cleared', value: clearedCount }
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
              <p className="metric text-[1.75rem] font-semibold leading-tight text-foreground">
                {stat.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Add an application</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <Input
              placeholder="Company Name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
            <Input
              placeholder="Application Status"
              value={applicationStatus}
              onChange={(e) => setApplicationStatus(e.target.value)}
            />
            <Input
              placeholder="Shortlisted (Yes / N/A)"
              value={shortlisted}
              onChange={(e) => setShortlisted(e.target.value)}
            />
            <SelectField>
              <Select
                aria-label="Interview status"
                value={interviewStatus}
                onChange={(e) => setInterviewStatus(e.target.value as InterviewStatus)}
              >
                <option value="N/A">N/A</option>
                <option value="InProgress">In progress</option>
                <option value="Cleared">Cleared</option>
                <option value="Failed">Failed</option>
              </Select>
            </SelectField>
            {interviewStatus !== 'N/A' && (
              <Input
                placeholder="Status details"
                value={statusDetails}
                onChange={(e) => setStatusDetails(e.target.value)}
              />
            )}
            {interviewStatus === 'Cleared' && (
              <Input
                placeholder="CTC"
                value={ctc}
                onChange={(e) => setCtc(e.target.value)}
              />
            )}
            <Button onClick={addApplication} className="w-full" disabled={isAdding}>
              {isAdding ? 'Adding...' : 'Add'}
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
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
                    <tr key={job.id} className="border-b border-border align-top transition-colors last:border-0 hover:bg-muted/50">
                    <td className="py-3 pr-4 font-medium text-foreground">{job.companyName}</td>
                    <td className="py-3 pr-4">
                      <Input
                        value={editable.applicationStatus}
                        onChange={(e) => updateEditableRow(job.id, 'applicationStatus', e.target.value)}
                      />
                    </td>
                    <td className="py-3 pr-4">
                      <Input
                        value={editable.shortlisted}
                        onChange={(e) => updateEditableRow(job.id, 'shortlisted', e.target.value)}
                      />
                    </td>
                    <td className="py-3 pr-4">
                      <SelectField className="min-w-32">
                        <Select
                          aria-label={`Interview status for ${job.companyName}`}
                          value={editable.interviewStatus}
                          onChange={(e) => updateEditableRow(job.id, 'interviewStatus', e.target.value)}
                        >
                          <option value="N/A">N/A</option>
                          <option value="InProgress">In progress</option>
                          <option value="Cleared">Cleared</option>
                          <option value="Failed">Failed</option>
                        </Select>
                      </SelectField>
                    </td>
                    <td className="py-3 pr-4">
                      {editable.interviewStatus === 'N/A' ? (
                        <span className="text-xs text-muted-foreground">Not required</span>
                      ) : (
                        <Input
                          value={editable.statusDetails}
                          onChange={(e) => updateEditableRow(job.id, 'statusDetails', e.target.value)}
                        />
                      )}
                    </td>
                    <td className="py-3 pr-4">
                      {editable.interviewStatus === 'Cleared' ? (
                        <Input
                          value={editable.ctc}
                          onChange={(e) => updateEditableRow(job.id, 'ctc', e.target.value)}
                        />
                      ) : (
                        <span className="text-xs text-muted-foreground">N/A</span>
                      )}
                    </td>
                    <td className="py-3 pr-4">
                      <Badge
                        tone={editable.shortlisted.toLowerCase() === 'yes' ? 'success' : 'neutral'}
                      >
                        {editable.shortlisted}
                      </Badge>
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
