"use client";

import React, { useState } from "react";
import Image from "next/image";

const ERROR_IMG_SRC =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%23e8e6e1' width='200' height='200'/%3E%3Ctext fill='%236b6b6b' font-family='sans-serif' font-size='14' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3EImage unavailable%3C/text%3E%3C/svg%3E";

export function ImageWithFallback({
  src,
  alt,
  className,
  style,
  width = 400,
  height = 400,
  ...rest
}: React.ComponentProps<typeof Image>) {
  const [didError, setDidError] = useState(false);

  if (didError || !src) {
    return (
      <Image
        src={ERROR_IMG_SRC}
        alt={alt || "Error loading image"}
        width={width}
        height={height}
        className={className}
        style={style}
        unoptimized
        {...rest}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      style={style}
      onError={() => setDidError(true)}
      {...rest}
    />
  );
}
