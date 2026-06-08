"use client";

import Image from "next/image";
import { cn } from "@/components/ui/utils";

interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

export function ProductImage({
  src,
  alt,
  className,
  sizes = "(max-width: 768px) 100vw, 25vw",
  priority = false,
}: ProductImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={cn("object-cover", className)}
    />
  );
}
