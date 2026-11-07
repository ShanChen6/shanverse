import * as React from "react";
import type { Metadata } from "next";
import { ArrowRight, Gamepad2, Lightbulb } from "lucide-react";

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

      <PageHeader eyebrow={t("games.eyebrow")} icon={<Gamepad2 />} title={t("games.title")} description={t("games.description")} />

      <GamesCatalog
        categories={usedCategories(GAMES).map((category) => ({ id: category.id, label: t(category.labelKey) }))}
        allLabel={t("games.catAll")}
        chipsLabel={t("games.catChips")}
        countTemplate={t("games.catCount", { n: "{n}" })}
        items={GAMES.map((game) => {
          const title = t(game.titleKey);
          const [main, ...extras] = categoriesOf(game);
          const label = (id: string) => t(CATEGORIES.find((category) => category.id === id)!.labelKey);
          return {
            slug: game.slug,
            categories: categoriesOf(game),
            card: (
              <article className="brand-card-border group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface-elevated transition-shadow hover:shadow-md">
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
                  <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
                  <p className="flex-1 text-sm leading-relaxed text-foreground-secondary">{t(game.descriptionKey)}</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge>{label(main)}</Badge>
                    {extras.map((id) => (
                      <Badge key={id} variant="outline">{label(id)}</Badge>
                    ))}
                    {game.controlKeys.map((key) => (
                      <Badge key={key} variant="secondary">{t(key)}</Badge>
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
