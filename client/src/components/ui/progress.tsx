import { cn } from "@/lib/utils"

const TONE_CLASS = {
  primary: "bg-primary",
  craft: "bg-pillar-craft",
  devai: "bg-pillar-devai",
  fitness: "bg-pillar-fitness",
  finance: "bg-pillar-finance",
  career: "bg-pillar-career",
  health: "bg-pillar-health",
  success: "bg-success",
  warning: "bg-warning",
} as const

export type ProgressTone = keyof typeof TONE_CLASS

type ProgressProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** 0–100. Values outside the range are clamped rather than overflowing. */
  value: number
  tone?: ProgressTone
  label?: string
}

function Progress({
  value,
  tone = "primary",
  label,
  className,
  ...props
}: ProgressProps) {
  const clamped = Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0))

  return (
    <div
      data-slot="progress"
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={cn("h-1.5 w-full overflow-hidden rounded-full bg-muted", className)}
      {...props}
    >
      {/* transform, not width — docs/design.md §6 limits animation to
          opacity and transform. */}
      <div
        className={cn("h-full origin-left rounded-full transition-transform duration-180 ease-out", TONE_CLASS[tone])}
        style={{ transform: `scaleX(${clamped / 100})`, width: "100%" }}
      />
    </div>
  )
}

export { Progress }
