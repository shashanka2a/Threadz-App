import { Skeleton } from "@/components/ui/skeleton";

export default function RootLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section Skeleton */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="text-center max-w-4xl mx-auto flex flex-col items-center">
          <Skeleton className="h-14 sm:h-20 w-3/4 max-w-xl mb-4" />
          <Skeleton className="h-10 sm:h-14 w-1/2 max-w-md mb-6" />
          <Skeleton className="h-5 w-full max-w-lg mb-2" />
          <Skeleton className="h-5 w-4/5 max-w-md mb-8" />
          <div className="flex gap-4 justify-center flex-wrap">
            <Skeleton className="h-12 w-36" />
            <Skeleton className="h-12 w-36" />
          </div>
        </div>
      </section>

      {/* Featured Collection Skeleton */}
      <section className="container mx-auto px-4 py-16">
        <div className="mb-8">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="border border-border bg-card p-0">
              <Skeleton className="aspect-square w-full" />
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/3" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-4 w-14" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
