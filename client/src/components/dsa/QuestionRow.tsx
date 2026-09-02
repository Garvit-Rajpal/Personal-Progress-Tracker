import { Check, ExternalLink } from 'lucide-react';

import { Badge, type BadgeTone } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

/** ADR-16 — difficulty resolves to a status tone; the label always shows. */
const DIFFICULTY: Record<string, BadgeTone> = {
  EASY: 'success',
  MEDIUM: 'warning',
  HARD: 'danger'
};

export function QuestionRow({
  question,
  isCompleted,
  onToggle,
  onSelect,
  isSelected
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  question: any;
  isCompleted: boolean;
  onToggle: () => void;
  onSelect: () => void;
  isSelected: boolean;
}) {
  return (
    // The row is a div because it contains its own controls — a nested button
    // and a link cannot live inside a button. The selectable surface is the
    // title button, so everything here is still keyboard reachable.
    <div
      className={cn(
        'flex items-center gap-3 rounded-md border px-3 py-2 transition-colors duration-120',
        isCompleted
          ? 'border-success/30 bg-success/5'
          : isSelected
            ? 'border-primary bg-accent'
            : 'border-border bg-card hover:border-border-strong'
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={isCompleted}
        aria-label={`Mark ${question.title} as ${isCompleted ? 'unsolved' : 'solved'}`}
        className={cn(
          'grid size-4 shrink-0 place-items-center rounded border transition-colors duration-120',
          isCompleted
            ? 'border-success bg-success text-background'
            : 'border-border-strong hover:border-success'
        )}
      >
        {isCompleted ? <Check className="size-3" strokeWidth={3} aria-hidden /> : null}
      </button>

      <button
        type="button"
        onClick={onSelect}
        className={cn(
          'min-w-0 flex-1 truncate text-left text-sm',
          isCompleted ? 'text-muted-foreground line-through' : 'text-foreground'
        )}
      >
        {question.title}
      </button>

      {question.link ? (
        <a
          href={question.link}
          target="_blank"
          rel="noreferrer"
          aria-label={`Open ${question.title} in a new tab`}
          className="shrink-0 text-muted-foreground transition-colors hover:text-primary"
        >
          <ExternalLink size={14} aria-hidden />
        </a>
      ) : null}

      <Badge tone={DIFFICULTY[question.difficulty] ?? 'neutral'} className="shrink-0">
        {question.difficulty}
      </Badge>
    </div>
  );
}
