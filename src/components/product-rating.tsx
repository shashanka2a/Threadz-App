import { Star, StarHalf } from "lucide-react";
import { cn } from "@/components/ui/utils";

type ProductRatingProps = {
  size?: "sm" | "md";
  showValue?: boolean;
  className?: string;
};

const RATING = 4.5;

export function ProductRating({
  size = "sm",
  showValue = true,
  className,
}: ProductRatingProps) {
  const starClass = size === "sm" ? "w-3 h-3" : "w-4 h-4";
  const textClass = size === "sm" ? "text-xs" : "text-sm";

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4].map((star) => (
          <Star key={star} className={cn(starClass, "fill-yellow-500 text-yellow-500")} />
        ))}
        <StarHalf className={cn(starClass, "fill-yellow-500 text-yellow-500")} />
      </div>
      {showValue && (
        <span className={cn(textClass, "text-neutral-600 tabular-nums")}>
          {RATING} avg
        </span>
      )}
    </div>
  );
}
