import * as React from "react";
import Link from "next/link";

import { cn } from "@/lib/cn";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
  separator?: React.ReactNode;
}

export function Breadcrumb({
  items,
  className,
  separator = <span aria-hidden="true">/</span>,
}: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn("text-sm", className)}>
      <ol className="flex flex-wrap items-center gap-2 text-foreground-secondary">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li
              key={`${item.label}-${index}`}
              className="inline-flex items-center gap-2"
            >
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="hover:text-foreground transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={cn(
                    isLast
                      ? "font-medium text-foreground"
                      : "text-foreground-secondary",
                  )}
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </span>
              )}

              {!isLast ? (
                <span className="text-muted" aria-hidden="true">
                  {separator}
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
