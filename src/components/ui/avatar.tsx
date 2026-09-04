import * as React from "react";
import { cn } from "@/lib/cn";
export type AvatarProps = React.ComponentProps<"div"> & {
  src?: string;
  alt?: string;
  fallback?: React.ReactNode;
};

export function Avatar({
  src,
  alt,
  fallback,
  className,
  ...props
}: AvatarProps) {
  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center overflow-hidden rounded-full",
        className,
      )}
      {...props}
    >
      {src ? (
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      ) : (
        fallback
      )}
    </div>
  );
}

export type AvatarImageProps = React.ComponentProps<"img">;

export const AvatarImage = React.forwardRef<HTMLImageElement, AvatarImageProps>(
  ({ className, ...props }, ref) => {
    return (
      <img
        ref={ref}
        className={cn("h-full w-full object-cover", className)}
        {...props}
      />
    );
  },
);
AvatarImage.displayName = "AvatarImage";

export type AvatarFallbackProps = React.ComponentProps<"div">;

export function AvatarFallback({ className, ...props }: AvatarFallbackProps) {
  return (
    <div
      className={cn(
        "h-full w-full flex items-center justify-center",
        className,
      )}
      {...props}
    />
  );
}
AvatarFallback.displayName = "AvatarFallback";
