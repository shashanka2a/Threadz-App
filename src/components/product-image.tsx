"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/components/ui/utils";

interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

const FALLBACK_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect fill='%23e8e6e1' width='400' height='400'/%3E%3Ctext fill='%236b6b6b' font-family='sans-serif' font-size='14' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3ETHREADZ%3C/text%3E%3C/svg%3E";

export function ProductImage({
  src,
  alt,
  className,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw",
  priority = false,
}: ProductImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const imageSrc = hasError || !src ? FALLBACK_IMAGE : src;

  return (
    <div className="relative w-full h-full overflow-hidden bg-muted/40">
      {/* Shimmer Placeholder while image is loading */}
      {isLoading && (
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-muted/60 animate-shimmer pointer-events-none z-10 transition-opacity duration-300"
        />
      )}

      <Image
        src={imageSrc}
        alt={alt || "Product image"}
        fill
        sizes={sizes}
        priority={priority}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setHasError(true);
          setIsLoading(false);
        }}
        className={cn(
          "object-cover transition-all duration-500 ease-out",
          isLoading
            ? "scale-[1.02] blur-sm opacity-0"
            : "scale-100 blur-0 opacity-100",
          className
        )}
      />
    </div>
  );
}

