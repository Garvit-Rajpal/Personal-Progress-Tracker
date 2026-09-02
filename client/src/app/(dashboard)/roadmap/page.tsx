'use client';
import { useState } from 'react';
import { ExternalLink, Link2, Map as MapIcon } from 'lucide-react';

import { useRoadmap } from '@/hooks/useRoadmap';
import { PhaseCard } from '@/components/roadmap/PhaseCard';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';

export default function RoadmapPage() {
  const { phases, progress, links, isLoading, isLoadingLinks, toggleProgress, createLink } =
    useRoadmap();
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');

  // ADR-16 — V1 injected a <style> block here carrying a Google Fonts @import
  // and `body { background-color:#0a0a0f !important }`. That !important made
  // any theme impossible, and the font import blocked render mid-body.

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const totalItems = phases.reduce((acc: number, p: any) => acc + (p.items?.length || 0), 0);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const completedItems = progress.filter((p: any) => p.completed).length;
  const progressPct = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  const handleResetAll = () => {
    if (confirm('Reset all roadmap progress? This cannot be undone.')) {
      progress
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .filter((p: any) => p.completed)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .forEach((p: any) => toggleProgress({ itemId: p.itemId, completed: false }));
    }
  };

  const handleAddLink = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createLink(
      { title, url, notes },
      {
        onSuccess: () => {
          setTitle('');
          setUrl('');
          setNotes('');
        }
      }
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Roadmap"
        description="A unified full-stack and AI-engineering path. Tick items as you complete them."
        actions={
          phases.length > 0 ? (
            <Button variant="outline" size="sm" onClick={handleResetAll}>
              Reset all
            </Button>
          ) : null
        }
      />

      <Card>
        <CardContent className="space-y-2">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-sm font-medium text-foreground">Overall progress</p>
            <p className="metric text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{completedItems}</span> / {totalItems}{' '}
              complete
            </p>
          </div>
          <Progress
            value={progressPct}
            tone={progressPct === 100 ? 'success' : 'primary'}
            label="Overall roadmap progress"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Your roadmap links</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs leading-6 text-muted-foreground">
            The Striver sheet and the built-in AI roadmap are seeded for every account. Add your own
            roadmap URLs here and they stay linked to you.
          </p>

          <form className="grid gap-3 md:grid-cols-[1.2fr_1.2fr_1.6fr_auto]" onSubmit={handleAddLink}>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Roadmap title"
              aria-label="Roadmap title"
            />
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://… or /roadmap"
              aria-label="Roadmap URL"
            />
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes"
              rows={1}
              aria-label="Notes"
              className="min-h-9 resize-y py-2"
            />
            <Button type="submit">Save link</Button>
          </form>

          {isLoadingLinks ? (
            <div className="grid gap-3 md:grid-cols-2">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : links.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {links.map((link: any) => (
                <a
                  key={link.id}
                  href={link.url}
                  target={link.url.startsWith('http') ? '_blank' : '_self'}
                  rel="noreferrer"
                  className="rounded-md border border-border bg-card p-3 transition-colors duration-120 hover:border-border-strong"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex min-w-0 items-center gap-1.5 text-sm font-medium text-foreground">
                      <span className="truncate">{link.title}</span>
                      {link.url.startsWith('http') ? (
                        <ExternalLink className="size-3 shrink-0 text-muted-foreground" aria-hidden />
                      ) : null}
                    </span>
                    <Badge tone={link.kind === 'DEFAULT' ? 'neutral' : 'devai'}>{link.kind}</Badge>
                  </div>
                  <p className="mt-1 break-all text-xs text-muted-foreground">{link.url}</p>
                  {link.notes ? (
                    <p className="mt-1.5 text-xs leading-5 text-muted-foreground">{link.notes}</p>
                  ) : null}
                </a>
              ))}
            </div>
          ) : (
            <EmptyState icon={Link2} title="No links saved yet" />
          )}
        </CardContent>
      </Card>

      <div className="space-y-3">
        {isLoading ? (
          <>
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </>
        ) : phases.length > 0 ? (
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          phases.map((phase: any, index: number) => (
            <PhaseCard
              key={phase.id}
              index={index}
              phase={phase}
              userProgress={progress}
              onToggle={toggleProgress}
            />
          ))
        ) : (
          <EmptyState
            icon={MapIcon}
            title="No roadmap phases found"
            description="The syllabus seeds on server start. If this is empty, re-run the seed script."
          />
        )}
      </div>
    </div>
  );
}
