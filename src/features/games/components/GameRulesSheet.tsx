"use client";

import * as React from "react";
import { CircleHelp, Info } from "lucide-react";

import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useI18n } from "@/i18n/client";

/** "Rules" button that opens how to play, extra rules and the saved-progress note in a bottom sheet (mobile). */
export function GameRulesSheet({ steps, savedNote, extra, className }: { steps: string[]; savedNote: string; extra?: React.ReactNode; className?: string }) {
  const { t } = useI18n();
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          type="button"
          className={className ?? "inline-flex min-h-10 items-center gap-1.5 rounded-lg px-2 text-sm font-medium text-primary focus-visible:ring-2 focus-visible:ring-primary"}
        >
          <CircleHelp aria-hidden="true" className="size-4" /> {t("games.rulesButton")}
        </button>
      </SheetTrigger>
      <SheetContent side="bottom" className="max-h-[85dvh] overflow-y-auto rounded-t-3xl pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
        <SheetTitle>{t("games.howToPlay")}</SheetTitle>
        <SheetDescription className="sr-only">{t("games.rulesDescription")}</SheetDescription>
        <ol className="mt-4 space-y-3 text-sm leading-relaxed text-foreground-secondary">
          {steps.map((step, index) => (
            <li key={index} className="flex gap-3">
              <span aria-hidden="true" className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{index + 1}</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
        {extra}
        <p className="mt-4 flex gap-2 text-xs leading-relaxed text-muted">
          <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          {savedNote}
        </p>
        <SheetClose asChild>
          <button type="button" className="mt-5 min-h-11 w-full rounded-xl border border-border font-medium focus-visible:ring-2 focus-visible:ring-primary">{t("common.close")}</button>
        </SheetClose>
      </SheetContent>
    </Sheet>
  );
}
