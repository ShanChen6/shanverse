import * as React from "react";

import { LandingLayout } from "@/components/layout/LandingLayout";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectDetailLoading() {
  return (
    <LandingLayout>
      <div aria-busy="true" aria-label="Đang tải dự án" className="mx-auto max-w-7xl space-y-10 px-4 py-8 sm:px-6 sm:py-12">
        <header className="mx-auto max-w-5xl space-y-6">
          <Skeleton className="h-5 w-64 max-w-full" />
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-8 w-28 rounded-full" />
          <Skeleton className="h-14 w-4/5" />
          <Skeleton className="h-6 w-full max-w-3xl" />
          <div className="flex gap-2"><Skeleton className="h-8 w-24 rounded-full" /><Skeleton className="h-8 w-28 rounded-full" /></div>
          <Skeleton className="h-14 w-full" />
        </header>
        <Skeleton className="mx-auto aspect-[16/8] w-full max-w-6xl rounded-3xl" />
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,800px)_260px]">
          <div className="space-y-5"><Skeleton className="h-40 w-full rounded-2xl" /><Skeleton className="h-8 w-2/3" /><Skeleton className="h-28 w-full" /><Skeleton className="h-8 w-1/2" /><Skeleton className="h-40 w-full" /></div>
          <Skeleton className="hidden h-72 rounded-2xl lg:block" />
        </div>
      </div>
    </LandingLayout>
  );
}
