import { Skeleton } from "@/components/ui/skeleton";

export default function MyOrdersLoading() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
      <Skeleton className="h-8 w-32 mb-4" />

      <div className="mb-8">
        <Skeleton className="h-8 w-44 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>

      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="border border-border bg-card p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-border">
              <div className="space-y-1">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-3.5 w-24" />
              </div>
              <Skeleton className="h-6 w-28 rounded-full" />
            </div>

            <div className="flex gap-4 items-center">
              <Skeleton className="w-16 h-16 shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3.5 w-32" />
              </div>
              <Skeleton className="h-5 w-16" />
            </div>

            <div className="pt-2 flex justify-between items-center">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-8 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
