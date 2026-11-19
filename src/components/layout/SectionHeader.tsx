import * as React from "react";
import { ArrowRight } from "lucide-react";

import { LocalizedLink as Link } from "@/components/i18n/LocalizedLink";
import { cn } from "@/lib/cn";

type SectionHeaderProps = {
  title: React.ReactNode;
  titleId?: string;
  /** Optional "view all" link on the right of the title. */
  link?: { href: string; label: React.ReactNode };
  className?: string;
};

/** Shared section heading: one row with the H2 on the left and an optional link on the right. */
export function SectionHeader({ title, titleId, link, className }: SectionHeaderProps) {
  return (
    <div className={cn("flex items-baseline justify-between gap-4", className)}>
      <h2 id={titleId} className="text-xl font-bold tracking-tight sm:text-2xl">{title}</h2>
      {link ? (
        <Link
          href={link.href}
          className="inline-flex shrink-0 items-center gap-1 rounded-sm text-sm font-medium text-primary hover:underline focus-visible:ring-2 focus-visible:ring-primary"
        >
          {link.label} <ArrowRight aria-hidden="true" className="size-3.5" />
        </Link>
      ) : null}
    </div>
  );
}
