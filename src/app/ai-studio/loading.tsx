import { Skeleton } from "@/components/ui/skeleton";

export default function AIStudioLoading() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12 flex flex-col items-center">
          <Skeleton className="h-10 sm:h-12 w-48 mb-3" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>

        <div className="grid grid-cols-2 gap-2 mb-8">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="border border-border bg-card p-6 space-y-4">
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-44 w-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <div className="grid grid-cols-3 gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            </div>
            <Skeleton className="h-11 w-full" />
          </div>

          <div className="border border-border bg-card p-6 flex flex-col items-center justify-center min-h-[380px] space-y-4">
            <Skeleton className="w-16 h-16 rounded-full" />
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
      </div>
    </div>
  );
}
