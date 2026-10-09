"use client";

import * as React from "react";
import { LocalizedLink as Link } from "@/components/i18n/LocalizedLink";
import { AlertTriangle, ArrowLeft, RefreshCw } from "lucide-react";

import { ROUTES } from "@/constants/routes";
import { useI18n } from "@/i18n/client";

export default function ProjectDetailError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { t } = useI18n();
  return (
    <main className="mx-auto flex max-w-3xl flex-1 items-center px-4 py-20 sm:px-6">
        <section role="alert" className="w-full rounded-3xl border border-border bg-surface px-6 py-14 text-center">
          <AlertTriangle aria-hidden="true" className="mx-auto size-10 text-primary" />
          <h1 className="mt-5 text-2xl font-semibold">{t("errors.projectLoadTitle")}</h1>
          <p className="mx-auto mt-3 max-w-lg leading-relaxed text-foreground-secondary">{t("errors.dataUnavailable")}</p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <button type="button" onClick={reset} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white hover:opacity-90 focus-visible:ring-2 focus-visible:ring-primary"><RefreshCw aria-hidden="true" className="size-4" /> {t("common.retry")}</button>
            <Link href={ROUTES.PROJECTS} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-border bg-background px-5 py-3 text-sm font-semibold hover:border-primary/50 hover:text-primary focus-visible:ring-2 focus-visible:ring-primary"><ArrowLeft aria-hidden="true" className="size-4" /> {t("projects.back")}</Link>
          </div>
        </section>
    </main>
  );
}
