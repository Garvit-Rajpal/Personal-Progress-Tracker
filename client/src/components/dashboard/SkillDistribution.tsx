'use client';

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

import { TOOLTIP_STYLE } from './TimeTrendChart';

export type CategoryDatum = { name: string; value: number };

/**
 * Six series tokens, in pillar order — docs/design.md §3.4. V1 used a
 * four-colour hex array, so a fifth category silently reused the first
 * colour and read as a duplicate slice.
 */
const SERIES = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
  'var(--chart-6)'
];

export function SkillDistribution({ data }: { data: CategoryDatum[] }) {
  const total = data.reduce((sum, entry) => sum + entry.value, 0);

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <ResponsiveContainer width="100%" height={200} className="max-w-[220px]">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={58}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
            stroke="var(--card)"
            strokeWidth={2}
          >
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={SERIES[index % SERIES.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ color: 'var(--muted-foreground)' }} />
        </PieChart>
      </ResponsiveContainer>

      {/* docs/design.md §9.2 — the legend carries the label, so the colour is
          reinforcement rather than the only encoding. */}
      <ul className="min-w-0 flex-1 space-y-1.5">
        {data.map((entry, index) => (
          <li key={entry.name} className="flex items-center gap-2 text-sm">
            <span
              aria-hidden
              className="size-2 shrink-0 rounded-full"
              style={{ backgroundColor: SERIES[index % SERIES.length] }}
            />
            <span className="min-w-0 flex-1 truncate text-muted-foreground">{entry.name}</span>
            <span className="metric font-medium text-foreground">{entry.value}</span>
            <span className="metric w-10 text-right text-xs text-muted-foreground">
              {total > 0 ? `${Math.round((entry.value / total) * 100)}%` : '—'}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
