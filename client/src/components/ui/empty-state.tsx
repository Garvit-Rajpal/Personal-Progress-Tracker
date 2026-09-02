import type { LucideIcon } from "lucide-react"
import Link from "next/link"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

/**
 * ADR-16. docs/design.md §7: an empty state has an icon, one line and one
 * action — never a bare sentence. V1 rendered "No plan saved yet." as plain
 * muted text, so a new account read as broken rather than ready.
 */
type EmptyStateProps = {
  icon?: LucideIcon
  title: string
  description?: string
  actionLabel?: string
  actionHref?: string
  className?: string
}

function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border px-4 py-8 text-center",
        className
      )}
    >
      {Icon ? <Icon className="size-5 text-muted-foreground" aria-hidden /> : null}
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description ? (
        <p className="max-w-sm text-xs leading-5 text-muted-foreground">{description}</p>
      ) : null}
      {actionLabel && actionHref ? (
        <Button render={<Link href={actionHref} />} size="sm" variant="outline" className="mt-1">
          {actionLabel}
        </Button>
      ) : null}
    </div>
  )
}

export { EmptyState }
