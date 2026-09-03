'use client';

import { useState } from 'react';
import { BookOpen, ChevronDown, Dumbbell, ExternalLink, FileText, Play } from 'lucide-react';

import { Badge, type BadgeTone } from '@/components/ui/badge';
import { resourcesFor, type ResourceKind } from '@/lib/roadmapResources.generated';
import { cn } from '@/lib/utils';

/**
 * ADR-17 — the revision panel under a roadmap item.
 *
 * A sibling of `ItemRow`, never a child: `ItemRow` is a `<button>` and nesting
 * links inside a button is invalid HTML and unreachable by keyboard.
 *
 * The `revise` bullets are the point. They render inline so a topic can be
 * refreshed without leaving the page — `docs/cadence.md` is explicit that the
 * design case is the day with fifteen minutes, and a link to full documentation
 * is not usable on that day.
 *
 * TODO(MB-4): read resources off `item.resources` instead of the generated map.
 */
const KIND: Record<ResourceKind, { icon: typeof BookOpen; label: string; tone: BadgeTone }> = {
  docs: { icon: BookOpen, label: 'Docs', tone: 'craft' },
  video: { icon: Play, label: 'Video', tone: 'devai' },
  drill: { icon: Dumbbell, label: 'Drill', tone: 'career' },
  note: { icon: FileText, label: 'Note', tone: 'neutral' }
};

/** docs/cadence.md — past this, it is not a "bad day" resource. Shown muted. */
const LONG_MINUTES = 30;

/**
 * The revise bullets are authored in markdown, so they carry `code` spans and
 * *emphasis*. Rendering them raw would print the backticks and asterisks. This
 * handles exactly those two — the only inline markup the source file uses —
 * rather than pulling in a markdown renderer for 67 short strings.
 */
function renderInline(text: string) {
  return text.split(/(`[^`]+`|\*[^*]+\*)/g).map((part, i) => {
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return (
        <code
          key={i}
          className="rounded bg-card px-1 py-0.5 font-mono text-[0.9em] text-foreground"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return (
        <em key={i} className="text-foreground not-italic font-medium">
          {part.slice(1, -1)}
        </em>
      );
    }
    return part;
  });
}

function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

export function ItemResources({
  phaseTitle,
  itemTitle
}: {
  phaseTitle?: string;
  itemTitle?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const resources = resourcesFor(phaseTitle, itemTitle);

  if (!resources) return null;

  const { revise, links } = resources;
  const quickest = links
    .filter((l) => l.minutes !== undefined)
    .sort((a, b) => (a.minutes ?? 0) - (b.minutes ?? 0))[0];

  return (
    <div className="pl-7">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="flex w-full items-center gap-1.5 rounded-md px-2 py-1 text-left text-xs text-muted-foreground transition-colors duration-120 hover:text-foreground"
      >
        <ChevronDown
          aria-hidden
          className={cn('size-3 shrink-0 transition-transform duration-180', !isOpen && '-rotate-90')}
        />
        <span className="font-medium">Revise</span>
        <span aria-hidden>·</span>
        <span>
          <span className="metric">{revise.length}</span> notes
        </span>
        <span aria-hidden>·</span>
        <span>
          <span className="metric">{links.length}</span> links
        </span>
        {quickest?.minutes !== undefined ? (
          <span className="ml-auto shrink-0">quickest {formatMinutes(quickest.minutes)}</span>
        ) : null}
      </button>

      {isOpen ? (
        <div className="mb-1 space-y-3 rounded-md border border-border bg-muted/40 px-3 py-2.5">
          <ul className="space-y-1.5">
            {revise.map((bullet) => (
              <li key={bullet} className="flex gap-2 text-xs leading-5 text-muted-foreground">
                <span aria-hidden className="select-none text-border-strong">
                  —
                </span>
                <span>{renderInline(bullet)}</span>
              </li>
            ))}
          </ul>

          <ul className="space-y-1">
            {links.map((link) => {
              const meta = KIND[link.kind];
              const Icon = meta.icon;
              const isLong = (link.minutes ?? 0) >= LONG_MINUTES;

              return (
                <li key={link.url}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-center gap-2 rounded-md border border-transparent px-2 py-1.5 transition-colors duration-120 hover:border-border hover:bg-card"
                  >
                    <Icon aria-hidden className="size-3.5 shrink-0 text-muted-foreground" />
                    <span className="min-w-0 flex-1 truncate text-xs text-foreground">
                      {link.title}
                    </span>
                    {link.minutes !== undefined ? (
                      <Badge tone={isLong ? 'neutral' : meta.tone} outline={isLong}>
                        {formatMinutes(link.minutes)}
                      </Badge>
                    ) : (
                      <Badge tone={meta.tone}>{meta.label}</Badge>
                    )}
                    <ExternalLink
                      aria-hidden
                      className="size-3 shrink-0 text-muted-foreground opacity-0 transition-opacity duration-120 group-hover:opacity-100"
                    />
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
