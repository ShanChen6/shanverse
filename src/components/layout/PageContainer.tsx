import * as React from "react";

import { cn } from "@/lib/cn";

const WIDTH = {
  default: "max-w-6xl",
  wide: "max-w-7xl",
  narrow: "max-w-4xl",
} as const;

/** Vertical rhythm between the blocks of a page. */
const RHYTHM = {
  default: "space-y-10 lg:space-y-12",
  loose: "space-y-12 lg:space-y-16",
  game: "space-y-8",
} as const;

type PageContainerProps = React.HTMLAttributes<HTMLElement> & {
  as?: "div" | "section" | "article";
  width?: keyof typeof WIDTH;
  rhythm?: keyof typeof RHYTHM;
};

/** Page wrapper: one width, side padding and vertical rhythm for every screen. */
export function PageContainer({ as: Tag = "div", width = "default", rhythm = "default", className, ...props }: PageContainerProps) {
  return <Tag className={cn("mx-auto px-4 py-8 sm:px-6 sm:py-12", WIDTH[width], RHYTHM[rhythm], className)} {...props} />;
}
