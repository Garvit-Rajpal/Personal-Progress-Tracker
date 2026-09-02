import type { LucideIcon } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Progress, type ProgressTone } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

type StatCardProps = {
  label: string;
  value: string | number;
  unit?: string;
  sub?: string;
  icon: LucideIcon;
  tone?: ProgressTone;
  /**
   * Optional 0–100 completion. Left undefined today: `LearningTarget.*` is a
   * free-text `String`, and `CLAUDE.md` invariant 4 forbids substituting a
   * hardcoded number. MA-6 makes metric targets numeric — the prop exists so
   * that lands without a rewrite here.
   */
  progress?: number;
};

const TONE_TEXT: Record<ProgressTone, string> = {
  primary: 'text-primary',
  craft: 'text-pillar-craft',
  devai: 'text-pillar-devai',
  fitness: 'text-pillar-fitness',
  finance: 'text-pillar-finance',
  career: 'text-pillar-career',
  health: 'text-pillar-health',
  success: 'text-success',
  warning: 'text-warning'
};

export function StatCard({
  label,
  value,
  unit,
  sub,
  icon: Icon,
  tone = 'primary',
  progress
}: StatCardProps) {
  return (
    <Card>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <Icon className={cn('size-4 shrink-0', TONE_TEXT[tone])} aria-hidden />
        </div>

        <p className="metric flex items-baseline gap-1 text-[1.75rem] font-semibold leading-tight text-foreground">
          {value}
          {unit ? <span className="text-sm font-normal text-muted-foreground">{unit}</span> : null}
        </p>

        {progress !== undefined ? <Progress value={progress} tone={tone} label={label} /> : null}
        {sub ? <p className="text-xs text-muted-foreground">{sub}</p> : null}
      </CardContent>
    </Card>
  );
}
