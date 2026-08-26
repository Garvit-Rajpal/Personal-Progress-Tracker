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
    <div className="relative space-y-6 max-w-7xl mx-auto overflow-hidden">
      <div className="pointer-events-none absolute -right-10 top-0 h-48 w-48 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="pointer-events-none absolute left-14 top-24 h-64 w-64 rounded-full bg-emerald-400/5 blur-3xl" />
      <div className="relative rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.95),rgba(17,24,39,0.8))] p-6 shadow-[0_30px_90px_-50px_rgba(0,0,0,0.9)] backdrop-blur-xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-200">
          <span className="h-2 w-2 rounded-full bg-cyan-300" />
          Idea backlog
        </div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">Project Ideas</h1>
        <p className="mt-2 max-w-2xl text-neutral-300">Capture and prioritize ideas with timeline and references.</p>
      </div>

      <Card className="border-white/10 bg-white/[0.04]">
        <CardHeader>
          <CardTitle>Add Project Idea</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <Input
              placeholder="Idea Name"
              value={ideaName}
              onChange={(e) => setIdeaName(e.target.value)}
              className="bg-neutral-900/90 border-white/10"
            />
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as 'Low' | 'Medium' | 'High')}
              className="h-8 w-full rounded-lg border border-white/10 bg-neutral-900/90 px-2.5 text-sm text-white outline-none focus-visible:border-cyan-400/60 focus-visible:ring-3 focus-visible:ring-cyan-400/15"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
            <Input
              placeholder="Expected Time (e.g. 15 hours)"
              value={expectedTimeToBuild}
              onChange={(e) => setExpectedTimeToBuild(e.target.value)}
              className="bg-neutral-900/90 border-white/10"
            />
            <Input
              placeholder="Research References"
              value={researchReferences}
              onChange={(e) => setResearchReferences(e.target.value)}
              className="bg-neutral-900/90 border-white/10 md:col-span-2 lg:col-span-3"
            />
            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-24 w-full rounded-lg border border-white/10 bg-neutral-900/90 px-2.5 py-2 text-sm text-white placeholder:text-neutral-500 outline-none focus-visible:border-cyan-400/60 focus-visible:ring-3 focus-visible:ring-cyan-400/15 md:col-span-2 lg:col-span-3"
            />
            <div>
              <label className="text-xs text-neutral-400 mb-1 block">Start Date</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-neutral-900/90 border-white/10"
              />
            </div>
            <div>
              <label className="text-xs text-neutral-400 mb-1 block">Due Date</label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="bg-neutral-900/90 border-white/10"
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

      <Card className="border-white/10 bg-white/[0.04]">
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
                    <tr key={`${idea.ideaName}-${index}`} className="border-b border-white/5 align-top transition-colors hover:bg-white/[0.03]">
                      <td className="py-3 pr-4 font-medium text-neutral-100">{idea.ideaName}</td>
                      <td className="py-3 pr-4 text-neutral-300 max-w-xs whitespace-pre-wrap">{idea.description}</td>
                      <td className="py-3 pr-4 text-neutral-100">{idea.priority}</td>
                      <td className="py-3 pr-4 text-neutral-300">{idea.researchReferences}</td>
                      <td className="py-3 pr-4 text-neutral-100">{idea.expectedTimeToBuild}</td>
                      <td className="py-3 pr-4 text-neutral-100">{new Date(idea.startDate).toISOString().slice(0, 10)}</td>
                      <td className="py-3 pr-4 text-neutral-100">{new Date(idea.dueDate).toISOString().slice(0, 10)}</td>
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
