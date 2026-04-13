'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useProjectIdeas } from '@/hooks/useProjectIdeas';

type ProjectIdea = {
  ideaName: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  researchReferences: string;
  expectedTimeToBuild: string;
  startDate: string;
  dueDate: string;
};

export default function ProjectIdeasPage() {
  const { projectIdeas, isLoading, addProjectIdea, isAdding } = useProjectIdeas();

  const [ideaName, setIdeaName] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [researchReferences, setResearchReferences] = useState('');
  const [expectedTimeToBuild, setExpectedTimeToBuild] = useState('');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');

  const addIdea = () => {
    const trimmedIdeaName = ideaName.trim();
    const trimmedDescription = description.trim();
    const trimmedPriority = priority;
    const trimmedResearchReferences = researchReferences.trim();
    const trimmedExpectedTimeToBuild = expectedTimeToBuild.trim();

    if (
      !trimmedIdeaName ||
      !trimmedDescription ||
      !trimmedPriority ||
      !trimmedResearchReferences ||
      !trimmedExpectedTimeToBuild ||
      !startDate ||
      !dueDate
    ) {
      return;
    }

    addProjectIdea({
      ideaName: trimmedIdeaName,
      description: trimmedDescription,
      priority: trimmedPriority,
      researchReferences: trimmedResearchReferences,
      expectedTimeToBuild: trimmedExpectedTimeToBuild,
      startDate,
      dueDate,
    });

    setIdeaName('');
    setDescription('');
    setPriority('Medium');
    setResearchReferences('');
    setExpectedTimeToBuild('');
    setStartDate('');
    setDueDate('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Project Ideas</h1>
        <p className="text-neutral-400 mt-2">Capture and prioritize ideas with timeline and references.</p>
      </div>

      <Card className="bg-neutral-950 border-neutral-800">
        <CardHeader>
          <CardTitle>Add Project Idea</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <Input
              placeholder="Idea Name"
              value={ideaName}
              onChange={(e) => setIdeaName(e.target.value)}
              className="bg-neutral-900 border-neutral-700"
            />
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as 'Low' | 'Medium' | 'High')}
              className="h-8 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-2.5 text-sm text-white outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
            <Input
              placeholder="Expected Time (e.g. 15 hours)"
              value={expectedTimeToBuild}
              onChange={(e) => setExpectedTimeToBuild(e.target.value)}
              className="bg-neutral-900 border-neutral-700"
            />
            <Input
              placeholder="Research References"
              value={researchReferences}
              onChange={(e) => setResearchReferences(e.target.value)}
              className="bg-neutral-900 border-neutral-700 md:col-span-2 lg:col-span-3"
            />
            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-24 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-2.5 py-2 text-sm text-white placeholder:text-neutral-500 outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:col-span-2 lg:col-span-3"
            />
            <div>
              <label className="text-xs text-neutral-400 mb-1 block">Start Date</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-neutral-900 border-neutral-700"
              />
            </div>
            <div>
              <label className="text-xs text-neutral-400 mb-1 block">Due Date</label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="bg-neutral-900 border-neutral-700"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={addIdea} className="w-full" disabled={isAdding}>
                {isAdding ? 'Adding...' : 'Add Idea'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-neutral-950 border-neutral-800">
        <CardHeader>
          <CardTitle>Ideas Table</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm min-w-275">
              <thead>
                <tr className="border-b border-neutral-800 text-left text-neutral-400">
                  <th className="py-3 pr-4 font-medium">Idea Name</th>
                  <th className="py-3 pr-4 font-medium">Description</th>
                  <th className="py-3 pr-4 font-medium">Priority</th>
                  <th className="py-3 pr-4 font-medium">Research References</th>
                  <th className="py-3 pr-4 font-medium">Expected Time to Build</th>
                  <th className="py-3 pr-4 font-medium">Start Date</th>
                  <th className="py-3 pr-4 font-medium">Due Date</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-neutral-500">
                      Loading ideas...
                    </td>
                  </tr>
                ) : projectIdeas.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-neutral-500">
                      No ideas added yet.
                    </td>
                  </tr>
                ) : (
                  projectIdeas.map((idea: ProjectIdea, index: number) => (
                    <tr key={`${idea.ideaName}-${index}`} className="border-b border-neutral-900 align-top">
                      <td className="py-3 pr-4 font-medium">{idea.ideaName}</td>
                      <td className="py-3 pr-4 text-neutral-300 max-w-xs whitespace-pre-wrap">{idea.description}</td>
                      <td className="py-3 pr-4">{idea.priority}</td>
                      <td className="py-3 pr-4 text-neutral-300">{idea.researchReferences}</td>
                      <td className="py-3 pr-4">{idea.expectedTimeToBuild}</td>
                      <td className="py-3 pr-4">{new Date(idea.startDate).toISOString().slice(0, 10)}</td>
                      <td className="py-3 pr-4">{new Date(idea.dueDate).toISOString().slice(0, 10)}</td>
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
