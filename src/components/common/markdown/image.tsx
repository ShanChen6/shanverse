import * as React from "react";
import NextImage from "next/image";

import { cn } from "@/lib/cn";

export interface ImageProps {
  src: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
}

export function Image({
  src,
  alt,
  caption,
  width = 1200,
  height = 675,
  className,
  priority,
}: ImageProps) {
  return (
    <figure className={cn("space-y-2", className)}>
      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <NextImage
          src={src}
          alt={alt}
          width={width}
          height={height}
          priority={priority}
          className="h-auto w-full object-cover"
        />
      </div>

      {caption ? (
        <figcaption className="text-center text-caption text-foreground-secondary">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
