import { Skeleton } from "@/components/ui/skeleton";

export default function ShopLoading() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      {/* Title Header */}
      <div className="mb-8 md:mb-12 text-center flex flex-col items-center">
        <Skeleton className="h-10 sm:h-12 w-40 mb-3" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>

      {/* Filter Selects */}
      <div className="mb-8 flex flex-col sm:flex-row flex-wrap gap-4 justify-center">
        <Skeleton className="h-10 w-full sm:w-64" />
        <Skeleton className="h-10 w-full sm:w-64" />
      </div>

      <div className="mb-6 flex justify-center">
        <Skeleton className="h-4 w-36" />
      </div>

      {/* Products Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="border border-border bg-card p-0">
            <Skeleton className="aspect-square w-full" />
            <div className="p-4 space-y-2.5">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-5 w-4/5" />
              <Skeleton className="h-4 w-1/3" />
              <div className="flex items-center gap-2 pt-1">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
