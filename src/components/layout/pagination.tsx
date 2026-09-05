import * as React from "react";
import Link from "next/link";

import { cn } from "@/lib/cn";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  hrefBuilder: (page: number) => string;
  className?: string;
}

function buildPages(
  currentPage: number,
  totalPages: number,
): Array<number | "dots"> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: Array<number | "dots"> = [1];
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  if (start > 2) pages.push("dots");
  for (let page = start; page <= end; page += 1) pages.push(page);
  if (end < totalPages - 1) pages.push("dots");

  pages.push(totalPages);
  return pages;
}

export function Pagination({
  currentPage,
  totalPages,
  hrefBuilder,
  className,
}: PaginationProps) {
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);
  const pages = buildPages(safeCurrentPage, totalPages);
  const canGoPrev = safeCurrentPage > 1;
  const canGoNext = safeCurrentPage < totalPages;

  return (
    <nav
      aria-label="Pagination"
      className={cn("flex items-center gap-2", className)}
    >
      <Link
        href={hrefBuilder(Math.max(1, safeCurrentPage - 1))}
        aria-disabled={!canGoPrev}
        className={cn(
          "rounded-md border border-border px-3 py-2 text-sm transition-colors",
          canGoPrev
            ? "hover:bg-surface text-foreground"
            : "pointer-events-none text-muted opacity-60",
        )}
      >
        Prev
      </Link>

      <ul className="flex items-center gap-1">
        {pages.map((page, index) => {
          if (page === "dots") {
            return (
              <li key={`dots-${index}`} className="px-2 text-muted">
                ...
              </li>
            );
          }

          const isActive = page === safeCurrentPage;

          return (
            <li key={page}>
              <Link
                href={hrefBuilder(page)}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "inline-flex min-w-9 items-center justify-center rounded-md border px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "border-primary bg-primary text-white"
                    : "border-border text-foreground hover:bg-surface",
                )}
              >
                {page}
              </Link>
            </li>
          );
        })}
      </ul>

      <Link
        href={hrefBuilder(Math.min(totalPages, safeCurrentPage + 1))}
        aria-disabled={!canGoNext}
        className={cn(
          "rounded-md border border-border px-3 py-2 text-sm transition-colors",
          canGoNext
            ? "hover:bg-surface text-foreground"
            : "pointer-events-none text-muted opacity-60",
        )}
      >
        Next
      </Link>
    </nav>
  );
}
