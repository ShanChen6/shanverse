import * as React from "react";

import { Skeleton } from "@/components/ui/skeleton";

function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface">
      <Skeleton className="aspect-video w-full rounded-none" />
      <div className="space-y-4 p-5 sm:p-6">
        <div className="flex gap-2"><Skeleton className="h-6 w-20 rounded-full" /><Skeleton className="h-6 w-16 rounded-full" /></div>
        <Skeleton className="h-7 w-5/6" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-3/4" />
        <div className="flex items-center justify-between border-t border-border pt-4"><Skeleton className="h-5 w-28" /><Skeleton className="h-5 w-20" /></div>
      </div>
    </div>
  );
}

export function ListPageSkeleton({ label }: { label: string }) {
  return (
    <div role="status" aria-busy="true" className="mx-auto w-full max-w-6xl space-y-10 px-4 py-8 sm:px-6 sm:py-12">
      <span className="sr-only">{label}</span>
      <div aria-hidden="true" className="space-y-10">
        <Skeleton className="h-5 w-52 max-w-full" />
        <div className="space-y-5 rounded-3xl border border-border p-6 sm:p-10"><Skeleton className="h-7 w-44 rounded-full" /><Skeleton className="h-12 w-4/5" /><Skeleton className="h-5 w-full max-w-2xl" /></div>
        <Skeleton className="h-12 w-full" />
        <div className="flex gap-2 overflow-hidden"><Skeleton className="h-10 w-20 shrink-0 rounded-full" /><Skeleton className="h-10 w-28 shrink-0 rounded-full" /><Skeleton className="h-10 w-24 shrink-0 rounded-full" /></div>
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_16rem]"><div className="grid min-w-0 gap-6 sm:grid-cols-2"><CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton /></div><Skeleton className="hidden h-72 rounded-2xl lg:block" /></div>
      </div>
    </div>
  );
}

export function DetailPageSkeleton({ label }: { label: string }) {
  return (
    <div role="status" aria-busy="true" className="mx-auto w-full max-w-7xl space-y-10 px-4 py-8 sm:px-6 sm:py-12">
      <span className="sr-only">{label}</span>
      <div aria-hidden="true" className="space-y-10">
        <header className="mx-auto max-w-5xl space-y-5"><Skeleton className="h-5 w-64 max-w-full" /><Skeleton className="h-8 w-28 rounded-full" /><Skeleton className="h-14 w-4/5" /><Skeleton className="h-6 w-full max-w-3xl" /><Skeleton className="h-12 w-full" /></header>
        <Skeleton className="mx-auto aspect-video w-full max-w-6xl rounded-3xl" />
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,800px)_260px]"><div className="min-w-0 space-y-5"><Skeleton className="h-8 w-2/3" /><Skeleton className="h-28 w-full" /><Skeleton className="h-8 w-1/2" /><Skeleton className="h-40 w-full" /></div><Skeleton className="hidden h-72 rounded-2xl lg:block" /></div>
      </div>
    </div>
  );
}
