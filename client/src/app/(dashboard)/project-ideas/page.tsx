'use client';

import { useState } from 'react';
import { Lightbulb } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectField } from '@/components/ui/select';
import { Badge, type BadgeTone } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/layout/PageHeader';
import { useProjectIdeas } from '@/hooks/useProjectIdeas';

type Priority = 'Low' | 'Medium' | 'High';

type ProjectIdea = {
  ideaName: string;
  description: string;
  priority: Priority;
  researchReferences: string;
  expectedTimeToBuild: string;
  startDate: string;
  dueDate: string;
};

const PRIORITY_TONE: Record<Priority, BadgeTone> = {
  Low: 'neutral',
  Medium: 'warning',
  High: 'danger'
};

export default function ProjectIdeasPage() {
  const { projectIdeas, isLoading, addProjectIdea, isAdding } = useProjectIdeas();

  const [ideaName, setIdeaName] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [researchReferences, setResearchReferences] = useState('');
  const [expectedTimeToBuild, setExpectedTimeToBuild] = useState('');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');

  const addIdea = () => {
    const payload = {
      ideaName: ideaName.trim(),
      description: description.trim(),
      priority,
      researchReferences: researchReferences.trim(),
      expectedTimeToBuild: expectedTimeToBuild.trim(),
      startDate,
      dueDate
    };

    if (Object.values(payload).some((value) => !value)) return;

    addProjectIdea(payload);

    setIdeaName('');
    setDescription('');
    setPriority('Medium');
    setResearchReferences('');
    setExpectedTimeToBuild('');
    setStartDate('');
    setDueDate('');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Project ideas"
        description="Capture and prioritise ideas with a timeline and references."
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Add an idea</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="idea-name" className="text-xs text-muted-foreground">
                Idea name
              </Label>
              <Input
                id="idea-name"
                value={ideaName}
                onChange={(e) => setIdeaName(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="idea-priority" className="text-xs text-muted-foreground">
                Priority
              </Label>
              <SelectField>
                <Select
                  id="idea-priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </Select>
              </SelectField>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="idea-time" className="text-xs text-muted-foreground">
                Expected time to build
              </Label>
              <Input
                id="idea-time"
                placeholder="e.g. 15 hours"
                value={expectedTimeToBuild}
                onChange={(e) => setExpectedTimeToBuild(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="idea-start" className="text-xs text-muted-foreground">
                Start date
              </Label>
              <Input
                id="idea-start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="idea-due" className="text-xs text-muted-foreground">
                Due date
              </Label>
              <Input
                id="idea-due"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            <div className="space-y-1.5 lg:col-span-1">
              <Label htmlFor="idea-refs" className="text-xs text-muted-foreground">
                Research references
              </Label>
              <Input
                id="idea-refs"
                value={researchReferences}
                onChange={(e) => setResearchReferences(e.target.value)}
              />
            </div>

            <div className="space-y-1.5 md:col-span-2 lg:col-span-3">
              <Label htmlFor="idea-description" className="text-xs text-muted-foreground">
                Description
              </Label>
              <Textarea
                id="idea-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={addIdea} disabled={isAdding}>
              {isAdding ? 'Adding…' : 'Add idea'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Ideas</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : projectIdeas.length === 0 ? (
            <EmptyState
              icon={Lightbulb}
              title="No ideas yet"
              description="Capture the first one above so it stops living in your head."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[60rem] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground">
                    <th className="py-2 pr-4 font-medium">Idea</th>
                    <th className="py-2 pr-4 font-medium">Description</th>
                    <th className="py-2 pr-4 font-medium">Priority</th>
                    <th className="py-2 pr-4 font-medium">References</th>
                    <th className="py-2 pr-4 font-medium">Est. time</th>
                    <th className="py-2 pr-4 font-medium">Start</th>
                    <th className="py-2 pr-4 font-medium">Due</th>
                  </tr>
                </thead>
                <tbody>
                  {projectIdeas.map((idea: ProjectIdea, index: number) => (
                    <tr
                      key={`${idea.ideaName}-${index}`}
                      className="border-b border-border align-top transition-colors last:border-0 hover:bg-muted/50"
                    >
                      <td className="py-2 pr-4 font-medium text-foreground">{idea.ideaName}</td>
                      <td className="max-w-xs whitespace-pre-wrap py-2 pr-4 text-muted-foreground">
                        {idea.description}
                      </td>
                      <td className="py-2 pr-4">
                        <Badge tone={PRIORITY_TONE[idea.priority] ?? 'neutral'}>
                          {idea.priority}
                        </Badge>
                      </td>
                      <td className="max-w-xs truncate py-2 pr-4 text-muted-foreground">
                        {idea.researchReferences}
                      </td>
                      <td className="py-2 pr-4 text-foreground">{idea.expectedTimeToBuild}</td>
                      <td className="metric py-2 pr-4 text-muted-foreground">
                        {new Date(idea.startDate).toISOString().slice(0, 10)}
                      </td>
                      <td className="metric py-2 pr-4 text-muted-foreground">
                        {new Date(idea.dueDate).toISOString().slice(0, 10)}
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
