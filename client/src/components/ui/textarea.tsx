import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * ADR-16 — added in D0 because seven pages inlined a raw <textarea> with a
 * verbatim copy of the same className string. One definition, one place to
 * change.
 */
function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "min-h-24 w-full rounded-md border border-border-strong bg-card px-3 py-2 text-sm leading-6 text-foreground transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/25 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
