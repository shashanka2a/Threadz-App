"use client";

import { cn } from "./utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={cn("bg-muted/70 animate-shimmer rounded-sm", className)}
      {...props}
    />
  );
}

export { Skeleton };

