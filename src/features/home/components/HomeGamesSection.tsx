import * as React from "react";
import { ArrowRight, Gamepad2 } from "lucide-react";

import { LocalizedLink as Link } from "@/components/i18n/LocalizedLink";
import { ROUTES } from "@/constants/routes";
import { GamePreview } from "@/features/games/components/GamePreview";
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
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
            <Gamepad2 aria-hidden="true" className="size-3.5" /> {t("games.homeEyebrow")}
          </p>
          <h2 id="home-games-heading" className="text-2xl font-bold tracking-tight">
            {t("games.homeTitle")}
          </h2>
          <p className="mt-1 text-sm text-foreground-secondary">{t("games.homeDescription")}</p>
        </div>
        <Link
          href={ROUTES.GAMES}
          className="inline-flex items-center gap-1 rounded-sm text-sm font-medium text-primary hover:underline focus-visible:ring-2 focus-visible:ring-primary"
        >
          {t("games.viewAll")} <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {games.map((game) => {
          const title = t(game.titleKey);
          return (
            <Link
              key={game.slug}
              href={game.href}
              aria-label={t("games.playGame", { title })}
              className="brand-card-border group flex items-center gap-4 overflow-hidden rounded-2xl border border-border bg-surface-elevated p-3 transition-shadow hover:shadow-md focus-visible:ring-2 focus-visible:ring-primary sm:flex-col sm:items-stretch sm:gap-0 sm:p-0"
            >
              <div className="home-game-preview flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-linear-to-br from-primary/15 via-surface to-background sm:size-auto sm:h-44 sm:rounded-none sm:border-b sm:border-border sm:p-4">
                <div className="w-60 shrink-0 origin-center scale-[0.4] transition-transform duration-300 group-hover:scale-[0.42] sm:scale-[0.58] sm:group-hover:scale-[0.61] motion-reduce:transition-none">
                  <GamePreview slug={game.slug} />
                </div>
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
