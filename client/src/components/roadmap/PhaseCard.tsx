import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

import { ItemRow } from './ItemRow';
import { Badge, type BadgeTone } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

/** ADR-16 — phase type resolves to a pillar tone, not a hex literal. */
const PHASE_TYPE: Record<string, { tone: BadgeTone; label: string }> = {
  FS: { tone: 'craft', label: 'Full-stack' },
  AI: { tone: 'devai', label: 'AI engineering' },
  BOTH: { tone: 'career', label: 'Both' },
  DESIGN: { tone: 'health', label: 'System design' }
};

export function PhaseCard({
  phase,
  userProgress,
  onToggle,
  index
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  phase: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  userProgress: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onToggle: any;
  index: number;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const totalItems = phase.items?.length || 0;
  const completedItems =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    phase.items?.filter((item: any) => userProgress.find((p) => p.itemId === item.id)?.completed)
      .length || 0;

  const type = PHASE_TYPE[phase.type] ?? PHASE_TYPE.FS;
  const isInProgress = completedItems > 0 && completedItems < totalItems;
  const pct = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

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
            <span className="text-sm font-semibold text-foreground">{phase.title}</span>
            {isInProgress ? <Badge tone="warning">In progress</Badge> : null}
          </span>
          <span className="mt-0.5 block text-xs text-muted-foreground">
            <span className="metric">
              {completedItems}/{totalItems}
            </span>{' '}
            complete · {phase.duration || '2–3 weeks'}
          </span>
        </span>

        <Badge tone={type.tone} outline className="hidden shrink-0 sm:inline-flex">
          {type.label}
        </Badge>

        <ChevronDown
          aria-hidden
          className={cn(
            'size-4 shrink-0 text-muted-foreground transition-transform duration-180',
            isCollapsed && '-rotate-90'
          )}
        />
      </button>

      <div className="px-4 pb-2">
        <Progress value={pct} tone={pct === 100 ? 'success' : 'primary'} label={phase.title} />
      </div>

      {!isCollapsed ? (
        <div className="space-y-3 border-t border-border p-4">
          {phase.resources ? (
            <p className="rounded-md border-l-2 border-border bg-muted/50 px-3 py-2 text-xs leading-6 text-muted-foreground">
              <span className="font-medium text-foreground">Resources: </span>
              {typeof phase.resources === 'string'
                ? phase.resources
                : JSON.stringify(phase.resources)}
            </p>
          ) : null}

          <div className="space-y-1.5">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {phase.items?.map((item: any) => {
              const isCompleted = !!userProgress.find((p) => p.itemId === item.id)?.completed;
              return (
                <ItemRow
                  key={item.id}
                  item={item}
                  isCompleted={isCompleted}
                  onToggle={() => onToggle({ itemId: item.id, completed: !isCompleted })}
                />
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
