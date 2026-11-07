import * as React from "react";
import type { Metadata } from "next";
import { ArrowRight, Gamepad2, Hand, Keyboard, Lightbulb, MousePointer2 } from "lucide-react";

import { LocalizedLink as Link } from "@/components/i18n/LocalizedLink";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { PageContainer, PageHeader } from "@/components/layout";
import Badge from "@/components/ui/badge";
import { buildPageMetadata } from "@/config/seo.config";
import { ROUTES } from "@/constants/routes";
import { CATEGORIES, categoriesOf, usedCategories } from "@/features/games/categories";
import { GamePreview } from "@/features/games/components/GamePreview";
import { GamesCatalog } from "@/features/games/components/GamesCatalog";
import { GAMES } from "@/features/games/games.config";
import { getTranslator } from "@/i18n/server";

const CONTROL_ICONS: Record<string, typeof Hand> = {
  "games.tagMouse": MousePointer2,
  "games.tagKeyboard": Keyboard,
  "games.tagTouch": Hand,
};

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getTranslator();
  return buildPageMetadata({
    locale,
    path: ROUTES.GAMES,
    title: t("metadata.gamesTitle"),
    description: t("metadata.gamesDescription"),
    keywords: ["Shanverse", "mini game", "puzzle", "2048", "minesweeper", "sokoban", "typing test", "memory game", "snake", "browser game"],
  });
}

export default async function GamesPage() {
  const { t } = await getTranslator();

  return (
    <PageContainer>
      <Breadcrumb items={[{ label: t("common.home"), href: ROUTES.HOME }, { label: t("common.games") }]} />

      <PageHeader
        compact
        eyebrow={t("games.eyebrow")}
        icon={<Gamepad2 />}
        title={t("games.title")}
        description={t("games.description")}
        actions={<span className="text-sm font-medium text-muted">{t("games.catCount", { n: GAMES.length })}</span>}
      />

      <GamesCatalog
        categories={usedCategories(GAMES).map((category) => ({ id: category.id, label: t(category.labelKey) }))}
        allLabel={t("games.catAll")}
        recentLabel={t("games.recent")}
        chipsLabel={t("games.catChips")}
        countTemplate={t("games.catCount", { n: "{n}" })}
        items={GAMES.map((game) => {
          const title = t(game.titleKey);
          const [main] = categoriesOf(game);
          const label = (id: string) => t(CATEGORIES.find((category) => category.id === id)!.labelKey);
          return {
            slug: game.slug,
            categories: categoriesOf(game),
            card: (
              <article className="brand-card-border group relative flex h-full flex-col overflow-hidden rounded-card border border-border bg-surface-elevated transition-shadow focus-within:ring-2 focus-within:ring-primary hover:shadow-md">
                <div aria-hidden="true" className="border-b border-border bg-linear-to-br from-primary/15 via-surface to-background p-4 sm:p-5">
                  <div className="flex h-40 items-center justify-center transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transition-none sm:h-48">
                    <GamePreview slug={game.slug} />
                  </div>
                </div>
                <div className="flex flex-1 flex-col gap-2 p-4 sm:p-5">
                  <h3 className="text-lg font-semibold tracking-tight">
                    <Link
                      href={game.href}
                      aria-label={t("games.playGame", { title })}
                      className="outline-none after:absolute after:inset-0 after:content-['']"
                    >
                      {title}
                    </Link>
                  </h3>
                  <p className="line-clamp-2 flex-1 text-sm leading-relaxed text-foreground-secondary">{t(game.descriptionKey)}</p>
                  <div className="mt-1 flex items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge>{label(main)}</Badge>
                      <span role="img" aria-label={game.controlKeys.map((key) => t(key)).join(", ")} className="inline-flex items-center gap-1.5 text-muted">
                        {game.controlKeys.map((key) => {
                          const Icon = CONTROL_ICONS[key] ?? Hand;
                          return <Icon key={key} aria-hidden="true" className="size-4" />;
                        })}
                      </span>
                    </div>
                    <span aria-hidden="true" className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
                      {t("games.play")} <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
                    </span>
                  </div>
                </div>
              </article>
            ),
          };
        })}
        trailing={
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-surface p-6 text-center text-sm text-foreground-secondary">
            <Lightbulb aria-hidden="true" className="size-6 text-primary" />
            <p className="max-w-56">{t("games.comingSoon")}</p>
            <Link href={ROUTES.CONTACT} className="font-semibold text-primary hover:underline focus-visible:ring-2 focus-visible:ring-primary">
              {t("common.contactMe")}
            </Link>
          </div>
        }
      />
    </PageContainer>
  );
}
