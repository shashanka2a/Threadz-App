import { Skeleton } from "@/components/ui/skeleton";

export default function ProductDetailLoading() {
  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      {/* Breadcrumb Skeleton */}
      <div className="flex items-center gap-2 mb-6">
        <Skeleton className="h-4 w-12" />
        <span className="text-muted-foreground">/</span>
        <Skeleton className="h-4 w-20" />
        <span className="text-muted-foreground">/</span>
        <Skeleton className="h-4 w-32" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Gallery Image Skeleton */}
        <div>
          <Skeleton className="relative aspect-[3/4] w-full" />
        </div>

        {/* Product Info Skeleton */}
        <div className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-9 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>

          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-5 w-16" />
          </div>

          <Skeleton className="h-4 w-32" />

          {/* Color Selector Skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-36" />
            <div className="flex gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="w-14 h-14 rounded" />
              ))}
            </div>
          </div>

          {/* Size Selector Skeleton */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="flex gap-3">
              {["S", "M", "L", "XL", "XXL"].map((size) => (
                <Skeleton key={size} className="w-14 h-10" />
              ))}
            </div>
          </div>

          {/* Add to Cart Button Skeleton */}
          <Skeleton className="h-12 w-full" />

          {/* Feature Badges Skeleton */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>

          {/* Pincode Checker Skeleton */}
          <Skeleton className="h-20 w-full" />

          {/* Specs Card Skeleton */}
          <Skeleton className="h-44 w-full" />
        </div>
      </div>
    </div>
  );
}
