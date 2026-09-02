import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * docs/design.md §7 — the skeleton mirrors the real layout's geometry so the
 * page does not jump when data lands. V1 rendered the string
 * "Loading analytics...", which gave no hint of the shape to come.
 */
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-5">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-2">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-9 w-48" />
            </div>
            <Skeleton className="h-6 w-28 rounded-full" />
          </div>
          <Skeleton className="h-4 w-56" />
          <Skeleton className="h-1.5 w-full rounded-full" />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="size-4 rounded" />
              </div>
              <Skeleton className="h-7 w-16" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardContent className="space-y-3 pt-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-[260px] w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-3 pt-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-[200px] w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
