"use client";

import * as React from "react";
import { LocalizedLink as Link } from "@/components/i18n/LocalizedLink";
import { AlertTriangle, ArrowLeft, RefreshCw } from "lucide-react";

import { LandingLayout } from "@/components/layout/LandingLayout";
import { ROUTES } from "@/constants/routes";

export default function ProjectDetailError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <LandingLayout>
      <main className="mx-auto flex max-w-3xl flex-1 items-center px-4 py-20 sm:px-6">
        <section role="alert" className="w-full rounded-3xl border border-border bg-surface px-6 py-14 text-center">
          <AlertTriangle aria-hidden="true" className="mx-auto size-10 text-primary" />
          <h1 className="mt-5 text-2xl font-semibold">Chưa thể tải dự án này</h1>
          <p className="mx-auto mt-3 max-w-lg leading-relaxed text-foreground-secondary">Kết nối dữ liệu đang tạm gián đoạn. Vui lòng thử lại sau ít phút.</p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <button type="button" onClick={reset} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white hover:opacity-90 focus-visible:ring-2 focus-visible:ring-primary"><RefreshCw aria-hidden="true" className="size-4" /> Thử lại</button>
            <Link href={ROUTES.PROJECTS} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-border bg-background px-5 py-3 text-sm font-semibold hover:border-primary/50 hover:text-primary focus-visible:ring-2 focus-visible:ring-primary"><ArrowLeft aria-hidden="true" className="size-4" /> Quay lại Projects</Link>
          </div>
        </section>
      </main>
    </LandingLayout>
  );
}
