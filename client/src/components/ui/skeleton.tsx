import { cn } from "@/lib/utils"

/**
 * ADR-16. docs/design.md §7: a skeleton matches the real element's geometry,
 * never a generic bar — a placeholder that does not predict the layout makes
 * the page jump when data lands.
 */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

export { Skeleton }
