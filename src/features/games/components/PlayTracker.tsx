"use client";

import * as React from "react";

import { markPlayed } from "../play-history";

/** Records that a game page was opened. Renders nothing. */
export function PlayTracker({ slug }: { slug: string }) {
  React.useEffect(() => {
    markPlayed(slug);
  }, [slug]);
  return null;
}
