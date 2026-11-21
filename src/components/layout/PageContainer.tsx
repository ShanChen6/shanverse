import * as React from "react";

import { cn } from "@/lib/cn";

/** `default` is the 1440px site width; `medium` (1152px) suits a form page; `narrow` is for long-form reading. */
const WIDTH = {
  default: "max-w-page",
  medium: "max-w-6xl",
  narrow: "max-w-4xl",
} as const;

/** Vertical rhythm between the blocks of a page. */
const RHYTHM = {
  default: "space-y-8 lg:space-y-10",
  loose: "space-y-10 lg:space-y-12",
  game: "space-y-6",
} as const;

type PageContainerProps = React.HTMLAttributes<HTMLElement> & {
  as?: "div" | "section" | "article";
  width?: keyof typeof WIDTH;
  rhythm?: keyof typeof RHYTHM;
};

/** Page wrapper: one width, side padding and vertical rhythm for every screen. */
export function PageContainer({ as: Tag = "div", width = "default", rhythm = "default", className, ...props }: PageContainerProps) {
  return <Tag className={cn("mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8", WIDTH[width], RHYTHM[rhythm], className)} {...props} />;
}
