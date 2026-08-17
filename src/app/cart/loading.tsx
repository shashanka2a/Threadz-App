import { Skeleton } from "@/components/ui/skeleton";

export default function CartLoading() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <Skeleton className="h-8 w-44 mb-8" />

      {/* Progress Bar Skeleton */}
      <div className="flex justify-center gap-6 mb-8">
        <Skeleton className="h-8 w-20 rounded-full" />
        <Skeleton className="h-8 w-20 rounded-full" />
        <Skeleton className="h-8 w-20 rounded-full" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center mb-6">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-8 w-24" />
          </div>

          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="border border-border bg-card p-4 flex gap-4">
              <Skeleton className="w-24 h-24 shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="flex justify-between">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-5 w-5" />
                </div>
                <Skeleton className="h-4 w-28" />
                <div className="flex justify-between items-center pt-2">
                  <Skeleton className="h-10 w-28" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div>
          <div className="border border-border bg-card p-6 space-y-4">
            <Skeleton className="h-6 w-36 mb-4" />
            <div className="space-y-3">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="flex justify-between pt-2 border-t border-border">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-24" />
              </div>
            </div>
            <Skeleton className="h-12 w-full mt-4" />
          </div>
        </div>
      </div>
    </div>
  );
}
