import * as React from "react";
import type { Metadata } from "next";
import { ArrowRight, Gamepad2, Lightbulb } from "lucide-react";

import { LocalizedLink as Link } from "@/components/i18n/LocalizedLink";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import Badge from "@/components/ui/badge";
import { buildPageMetadata } from "@/config/seo.config";
import { ROUTES } from "@/constants/routes";
import { GamePreview } from "@/features/games/components/GamePreview";
import { GAMES } from "@/features/games/games.config";
import { getTranslator } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getTranslator();
  return buildPageMetadata({
    locale,
    path: ROUTES.GAMES,
    title: t("metadata.gamesTitle"),
    description: t("metadata.gamesDescription"),
    keywords: ["Shanverse", "mini game", "2048", "minesweeper", "typing test", "memory game", "snake", "browser game"],
  });
}

export default async function GamesPage() {
  const { t } = await getTranslator();

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 py-8 sm:px-6 sm:py-12 lg:space-y-12">
      <Breadcrumb items={[{ label: t("common.home"), href: ROUTES.HOME }, { label: t("common.games") }]} />

      <header className="relative overflow-hidden rounded-3xl border border-border bg-linear-to-br from-primary/10 via-surface to-background p-6 sm:p-10 lg:p-12">
        <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-24 size-80 rounded-full border border-primary/10 sm:size-96" />
        <div className="relative max-w-3xl space-y-6">
          <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/70 px-3 py-1.5 text-xs font-medium uppercase tracking-widest text-primary">
            <Gamepad2 aria-hidden="true" className="size-4" /> {t("games.eyebrow")}
          </p>
          <h1 className="text-balance text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">{t("games.title")}</h1>
          <p className="max-w-2xl text-pretty leading-relaxed text-foreground-secondary sm:text-lg">{t("games.description")}</p>
        </div>
      </header>

      <section aria-label={t("games.listLabel")} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {GAMES.map((game) => {
          const title = t(game.titleKey);
          return (
            <article key={game.slug} className="brand-card-border group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface-elevated transition-shadow hover:shadow-md">
              <Link
                href={game.href}
                aria-label={t("games.playGame", { title })}
                className="block border-b border-border bg-linear-to-br from-primary/15 via-surface to-background p-6 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
              >
                <div className="flex h-64 items-center justify-center transition-transform duration-300 group-hover:scale-[1.02] motion-reduce:transition-none">
                  <GamePreview slug={game.slug} />
                </div>
              </Link>
              <div className="flex flex-1 flex-col gap-3 p-5 sm:p-6">
                <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
                <p className="flex-1 text-sm leading-relaxed text-foreground-secondary">{t(game.descriptionKey)}</p>
                <div className="flex flex-wrap gap-2">
                  {game.tagKeys.map((key) => (
                    <Badge key={key} variant="outline">{t(key)}</Badge>
                  ))}
                </div>
                <Link
                  href={game.href}
                  className="mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  {t("games.play")} <ArrowRight aria-hidden="true" className="size-4" />
                </Link>
              </div>
            </article>
          );
        })}

        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-surface p-6 text-center text-sm text-foreground-secondary">
          <Lightbulb aria-hidden="true" className="size-6 text-primary" />
          <p className="max-w-56">{t("games.comingSoon")}</p>
          <Link href={ROUTES.CONTACT} className="font-semibold text-primary hover:underline focus-visible:ring-2 focus-visible:ring-primary">
            {t("common.contactMe")}
          </Link>
        </div>
      </section>
    </div>
  );
}
