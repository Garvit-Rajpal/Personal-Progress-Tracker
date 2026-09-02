import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

import { QuestionRow } from './QuestionRow';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

export function TopicCard({
  topic,
  questions,
  userProgress,
  onToggle,
  onSelect,
  selectedId,
  index
}: {
  topic: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  questions: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  userProgress: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onToggle: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSelect: any;
  selectedId?: string;
  index: number;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const totalItems = questions.length;
  const completedItems = questions.filter(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (q: any) => userProgress.find((p) => p.questionId === q.id)?.solved
  ).length;
  const pct = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
  const isActive = completedItems > 0 && completedItems < totalItems;

  return (
    <div className="rounded-lg border border-border bg-card">
      <button
        type="button"
        onClick={() => setIsCollapsed(!isCollapsed)}
        aria-expanded={!isCollapsed}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        <span className="grid size-7 shrink-0 place-items-center rounded-md bg-muted text-xs font-semibold text-muted-foreground">
          {index + 1}
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-foreground">{topic}</span>
            {isActive ? <Badge tone="warning">Active</Badge> : null}
          </span>
          <span className="metric mt-0.5 block text-xs text-muted-foreground">
            {completedItems}/{totalItems} solved
          </span>
        </span>

        <ChevronDown
          aria-hidden
          className={cn(
            'size-4 shrink-0 text-muted-foreground transition-transform duration-180',
            isCollapsed && '-rotate-90'
          )}
        />
      </button>

      <div className="px-4 pb-2">
        <Progress value={pct} tone={pct === 100 ? 'success' : 'craft'} label={topic} />
      </div>

      {!isCollapsed ? (
        <div className="space-y-1.5 border-t border-border p-4">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {questions.map((q: any) => {
            const isCompleted = !!userProgress.find((p) => p.questionId === q.id)?.solved;
            return (
              <QuestionRow
                key={q.id}
                question={q}
                isCompleted={isCompleted}
                isSelected={selectedId === q.id}
                onSelect={() => onSelect(q)}
                onToggle={() => onToggle({ questionId: q.id, solved: !isCompleted })}
              />
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
