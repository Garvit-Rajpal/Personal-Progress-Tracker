'use client';
import { useState, useMemo } from 'react';
import { ExternalLink, NotebookPen } from 'lucide-react';

import { useDSA } from '@/hooks/useDSA';
import { TopicCard } from '@/components/dsa/TopicCard';
import { NoteEditor } from '@/components/dsa/NoteEditor';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';

export default function DSAPage() {
  const {
    allQuestions,
    progress,
    isLoading,
    toggleSolved,
    saveNotes,
    isSavingNotes,
    canonicalSheetLink
  } = useDSA();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);

  // ADR-16 — the injected <style> block (Google Fonts @import plus
  // `body { background-color:#0a0a0f !important }`) is gone; it made light
  // mode impossible on this route.

  const groupedQuestions = useMemo(() => {
    if (!allQuestions || !Array.isArray(allQuestions)) return {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return allQuestions.reduce((acc: any, q: any) => {
      if (!acc[q.topic]) acc[q.topic] = [];
      acc[q.topic].push(q);
      return acc;
    }, {});
  }, [allQuestions]);

  const topics = useMemo(() => Object.keys(groupedQuestions), [groupedQuestions]);

  const selectedProgress = selectedQuestion
    ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
      progress.find((p: any) => p.questionId === selectedQuestion.id)
    : null;

  const totalItems = allQuestions.length;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const completedItems = progress.filter((p: any) => p.solved).length;
  const progressPct = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Daily DSA"
        description="Striver's SDE sheet. Tick problems as you solve them and keep notes alongside."
        actions={
          canonicalSheetLink ? (
            <a
              href={canonicalSheetLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-primary transition-colors hover:underline"
            >
              Official sheet
              <ExternalLink className="size-3.5" aria-hidden />
            </a>
          ) : null
        }
      />

      <Card>
        <CardContent className="space-y-2">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-sm font-medium text-foreground">Overall progress</p>
            <p className="metric text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{completedItems}</span> / {totalItems}{' '}
              solved
            </p>
          </div>
          <Progress
            value={progressPct}
            tone={progressPct === 100 ? 'success' : 'craft'}
            label="Overall DSA progress"
          />
        </CardContent>
      </Card>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1 space-y-3">
          {isLoading ? (
            <>
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </>
          ) : topics.length > 0 ? (
            topics.map((topic: string, index: number) => (
              <TopicCard
                key={topic}
                topic={topic}
                questions={groupedQuestions[topic]}
                userProgress={progress}
                onToggle={toggleSolved}
                onSelect={setSelectedQuestion}
                selectedId={selectedQuestion?.id}
                index={index}
              />
            ))
          ) : (
            <EmptyState
              icon={NotebookPen}
              title="No questions found"
              description="The Striver sheet seeds on server start. If this is empty, re-run the seed script."
            />
          )}
        </div>

        <div className="w-full shrink-0 lg:sticky lg:top-20 lg:w-[380px]">
          <Card>
            <CardContent>
              {selectedQuestion ? (
                <NoteEditor
                  question={selectedQuestion}
                  initialNotes={selectedProgress?.notes || ''}
                  onSave={(notes: string) =>
                    saveNotes({ questionId: selectedQuestion.id, notes })
                  }
                  isSaving={isSavingNotes}
                />
              ) : (
                <EmptyState
                  icon={NotebookPen}
                  title="No question selected"
                  description="Pick a problem from the list to add notes and complexities."
                  className="border-0"
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
