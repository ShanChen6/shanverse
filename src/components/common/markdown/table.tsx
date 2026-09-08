import * as React from "react";
import { cn } from "@/lib/cn";

export function Table({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "w-full overflow-x-auto rounded-xl border border-border",
        className,
      )}
      {...props}
    />
  );
}

export function TableElement({
  className,
  ...props
}: React.TableHTMLAttributes<HTMLTableElement>) {
  return <table className={cn("w-full text-sm", className)} {...props} />;
}

export function TableHead({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cn("bg-surface", className)} {...props} />;
}

export function TableBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody className={cn("[&_tr:last-child]:border-0", className)} {...props} />
  );
}

export function TableRow({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn("border-b border-border", className)} {...props} />;
}

export function TableHeader({
  className,
  ...props
}: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        "px-4 py-3 text-left align-middle font-semibold text-foreground",
        className,
      )}
      {...props}
    />
  );
}

export function TableCell({
  className,
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cn(
        "px-4 py-3 align-middle text-foreground-secondary",
        className,
      )}
      {...props}
    />
  );
}

export function TableCaption({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableCaptionElement>) {
  return (
    <caption
      className={cn(
        "px-4 py-3 text-left text-caption text-foreground-secondary",
        className,
      )}
      {...props}
    />
  );
}
