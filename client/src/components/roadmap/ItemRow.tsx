import { Check } from 'lucide-react';

import { Badge, type BadgeTone } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

/**
 * ADR-16 — the hex map (`#e8ff47`, `#c47bff`, `#47c8ff`, `#ff6b6b`) is gone;
 * badge type now resolves to a pillar tone. docs/design.md §9.2: the label
 * stays, so colour is never the only encoding.
 *
 * Also now a real <button>. V1 put onClick on a div, so no roadmap item was
 * reachable by keyboard.
 */
const BADGE: Record<string, { tone: BadgeTone; label: string }> = {
  CORE: { tone: 'craft', label: 'Core' },
  AI: { tone: 'devai', label: 'AI' },
  PROJECT: { tone: 'career', label: 'Project' },
  JOB: { tone: 'finance', label: 'Job signal' },
  DESIGN: { tone: 'health', label: 'Design' },
  THEORY: { tone: 'neutral', label: 'Theory' }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ItemRow({ item, isCompleted, onToggle }: { item: any; isCompleted: boolean; onToggle: () => void }) {
  const badge = BADGE[item.badge] ?? BADGE.CORE;

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={isCompleted}
      className={cn(
        'flex w-full items-start gap-3 rounded-md border px-3 py-2.5 text-left transition-colors duration-120',
        isCompleted
          ? 'border-success/30 bg-success/5'
          : 'border-border bg-card hover:border-border-strong'
      )}
    >
      <span
        aria-hidden
        className={cn(
          'mt-0.5 grid size-4 shrink-0 place-items-center rounded border transition-colors duration-120',
          isCompleted ? 'border-success bg-success text-background' : 'border-border-strong'
        )}
      >
        {isCompleted ? <Check className="size-3" strokeWidth={3} /> : null}
      </span>

      <span className="min-w-0 flex-1">
        <span
          className={cn(
            'block text-sm font-medium',
            isCompleted ? 'text-muted-foreground line-through' : 'text-foreground'
          )}
        >
          {item.title}
        </span>
        {item.description ? (
          <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">
            {item.description}
          </span>
        ) : null}
      </span>

      <Badge tone={badge.tone} className="mt-0.5 shrink-0">
        {badge.label}
      </Badge>
    </button>
  );
}
