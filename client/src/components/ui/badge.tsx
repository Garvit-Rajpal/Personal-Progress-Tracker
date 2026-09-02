import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * ADR-16 — replaces the hex maps in roadmap/ and dsa/ (`#e8ff47`, `#c47bff`,
 * `#47c8ff`, `#ff6b6b`).
 *
 * docs/design.md §9.2: a badge always carries a text label. Colour never
 * carries meaning on its own, so these tones are reinforcement, not encoding.
 */
const badgeVariants = cva(
  "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap [&_svg]:size-3 [&_svg]:shrink-0",
  {
    variants: {
      tone: {
        neutral: "bg-muted text-muted-foreground",
        craft: "bg-pillar-craft/12 text-pillar-craft",
        devai: "bg-pillar-devai/12 text-pillar-devai",
        fitness: "bg-pillar-fitness/12 text-pillar-fitness",
        finance: "bg-pillar-finance/12 text-pillar-finance",
        career: "bg-pillar-career/12 text-pillar-career",
        health: "bg-pillar-health/12 text-pillar-health",
        success: "bg-success/12 text-success",
        warning: "bg-warning/12 text-warning",
        danger: "bg-danger/12 text-danger",
      },
      outline: {
        true: "ring-1 ring-current/25",
        false: "",
      },
    },
    defaultVariants: { tone: "neutral", outline: false },
  }
)

export type BadgeTone = NonNullable<VariantProps<typeof badgeVariants>["tone"]>

function Badge({
  className,
  tone,
  outline,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ tone, outline, className }))}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
