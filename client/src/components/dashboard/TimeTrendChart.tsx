'use client';

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

import type { TrendDay } from '@/lib/cadence';

/**
 * docs/design.md §8 — CSS variables are passed straight into SVG attributes.
 * SVG resolves `var(--chart-1)` natively and re-evaluates when `.dark`
 * toggles, so the chart re-themes with no `useTheme()` read and no re-render.
 *
 * V1 hardcoded `stroke="#3b82f6"` and a tooltip on `backgroundColor: '#000'`,
 * which is a black box on a white page.
 */
const TOOLTIP_STYLE = {
  backgroundColor: 'var(--card)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-md)',
  color: 'var(--foreground)',
  fontSize: '0.75rem'
} as const;

export function TimeTrendChart({ data }: { data: TrendDay[] }) {
  const chartData = data.map((entry) => ({
    ...entry,
    // `date` is already a user-timezone calendar key from the server (ADR-4).
    day: entry.date.slice(5)
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="fillCraft" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.25} />
            <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="fillDevai" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.25} />
            <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0} />
          </linearGradient>
        </defs>

        <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="day"
          stroke="var(--border)"
          tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="var(--border)"
          tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          width={40}
          unit="h"
        />
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          labelStyle={{ color: 'var(--muted-foreground)' }}
          cursor={{ stroke: 'var(--border-strong)', strokeWidth: 1 }}
          formatter={(value) => `${Number(value ?? 0).toFixed(1)}h`}
        />
        <Legend
          iconType="plainline"
          wrapperStyle={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}
        />
        <Area
          type="monotone"
          dataKey="dsaHours"
          name="DSA"
          stroke="var(--chart-1)"
          strokeWidth={2}
          fill="url(#fillCraft)"
        />
        <Area
          type="monotone"
          dataKey="devAiHours"
          name="Dev + AI"
          stroke="var(--chart-2)"
          strokeWidth={2}
          fill="url(#fillDevai)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export { TOOLTIP_STYLE };
