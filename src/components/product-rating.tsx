import { Star, StarHalf } from "lucide-react";
import { cn } from "@/components/ui/utils";

type ProductRatingProps = {
  size?: "sm" | "md";
  showValue?: boolean;
  className?: string;
  rating?: number;
};

const DEFAULT_RATING = 4.5;

export function ProductRating({
  size = "sm",
  showValue = true,
  className,
  rating = DEFAULT_RATING,
}: ProductRatingProps) {
  const starClass = size === "sm" ? "w-3 h-3" : "w-4 h-4";
  const textClass = size === "sm" ? "text-xs" : "text-sm";

  return (
    <div
      className={cn("flex items-center gap-1.5", className)}
      role="img"
      aria-label={`Customer rating: ${rating} out of 5 stars`}
    >
      <div className="flex items-center gap-0.5" aria-hidden="true">
        {[1, 2, 3, 4].map((star) => (
          <Star key={star} className={cn(starClass, "fill-amber-400 text-amber-400")} />
        ))}
        <StarHalf className={cn(starClass, "fill-amber-400 text-amber-400")} />
      </div>
      {showValue && (
        <span className={cn(textClass, "text-muted-foreground tabular-nums")}>
          {rating} avg
        </span>
      )}
    </div>
  );
}

