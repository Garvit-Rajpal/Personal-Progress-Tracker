import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * A styled native <select> — ADR-16. Deliberately native rather than a
 * headless listbox: it is keyboard- and screen-reader-correct for free, and
 * `docs/cadence.md` §5 caps logging a full day at two minutes, which a native
 * control on mobile serves better than a custom popover.
 */
function Select({ className, children, ...props }: React.ComponentProps<"select">) {
  return (
    <select
      data-slot="select"
      className={cn(
        "h-9 w-full appearance-none rounded-md border border-border-strong bg-card bg-[length:1rem] bg-[right_0.6rem_center] bg-no-repeat py-1 pl-3 pr-8 text-sm text-foreground transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/25 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        // Chevron drawn with currentColor so it follows the theme. An inline
        // SVG data URI cannot read a CSS variable, so `mask` is used instead
        // of `background-image` (docs/design.md §2 — no literals outside CSS).
        "[background-image:none]",
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
}

/** Wraps a Select so the chevron can be drawn as a themed overlay. */
function SelectField({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("relative", className)} {...props}>
      {children}
      <svg
        aria-hidden
        viewBox="0 0 16 16"
        className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m4 6 4 4 4-4" />
      </svg>
    </div>
  )
}

export { Select, SelectField }
