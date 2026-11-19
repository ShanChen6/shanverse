import * as React from "react";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { ArrowRight } from "lucide-react";

import { LocalizedLink as Link } from "@/components/i18n/LocalizedLink";
import { ROUTES } from "@/constants/routes";
import { GameThumbnail } from "@/features/games/components/GameThumbnail";
import { homeGames } from "@/features/games/games.config";
import { getTranslator } from "@/i18n/server";

/**
 * A light teaser for the Games section. Previews are static markup, so the
 * home page loads no game code; the games themselves live under /games.
 */
export async function HomeGamesSection() {
  const { t } = await getTranslator();
  const games = homeGames(3);
  if (!games.length) return null;

  return (
    <section aria-labelledby="home-games-heading" className="space-y-6">
      <SectionHeader titleId="home-games-heading" title={t("games.homeTitle")} description={t("games.homeDescription")} link={{ href: ROUTES.GAMES, label: t("games.viewAll") }} />

      <div className="grid gap-4 sm:grid-cols-3">
        {games.map((game) => {
          const title = t(game.titleKey);
          return (
            <Link
              key={game.slug}
              href={game.href}
              aria-label={t("games.playGame", { title })}
              className="brand-card-border group flex items-center gap-4 overflow-hidden rounded-card p-3 focus-visible:ring-2 focus-visible:ring-primary sm:flex-col sm:items-stretch sm:gap-0 sm:p-0"
            >
              <div className="relative aspect-video w-32 shrink-0 overflow-hidden rounded-control bg-surface sm:w-auto sm:rounded-none sm:border-b sm:border-border">
                <GameThumbnail slug={game.slug} sizes="(min-width: 640px) 480px, 128px" />
              </div>
              <div className="min-w-0 flex-1 sm:p-4">
                <p className="font-semibold tracking-tight">{title}</p>
                <p className="mt-1 line-clamp-2 text-sm text-foreground-secondary">{t(game.descriptionKey)}</p>
                <p className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                  {t("games.play")} <ArrowRight aria-hidden="true" className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
