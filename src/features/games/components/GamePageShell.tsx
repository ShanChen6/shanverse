import * as React from "react";
import { ArrowLeft, Info } from "lucide-react";

import { LocalizedLink as Link } from "@/components/i18n/LocalizedLink";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { PageContainer } from "@/components/layout/PageContainer";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildAbsoluteUrl } from "@/config/seo.config";
import { ROUTES } from "@/constants/routes";
import { getTranslator } from "@/i18n/server";

import { GameRulesSheet } from "./GameRulesSheet";
import { PlayTracker } from "./PlayTracker";

type GamePageShellProps = {
  path: string;
  title: string;
  intro: string;
  description: string;
  genre: string;
  steps: string[];
  savedNote: string;
  /** Extra content at the end of the "how to play" box, e.g. a list of piece states. */
  rulesExtra?: React.ReactNode;
  children: React.ReactNode;
};

/**
 * Shared layout for a game page.
 * Mobile: a sticky top bar (back + rules sheet) replaces the site header, the title and the game follow.
 * Desktop: breadcrumb and back link, the title, the game, then the "how to play" box.
 */
export async function GamePageShell({ path, title, intro, description, genre, steps, savedNote, rulesExtra, children }: GamePageShellProps) {
  const { locale, t } = await getTranslator();
  const backClass = "inline-flex min-h-10 items-center gap-2 rounded-md text-sm font-medium text-primary hover:underline focus-visible:ring-2 focus-visible:ring-primary";

  return (
    <>
      <PlayTracker slug={path.split("/").filter(Boolean).pop() ?? ""} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "VideoGame",
          name: title,
          description,
          url: buildAbsoluteUrl(`/${locale}${path}`),
          genre,
          gamePlatform: "Web browser",
          applicationCategory: "Game",
          operatingSystem: "Any",
          author: { "@type": "Person", name: "Shanverse" },
        }}
      />

      <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur-md md:hidden">
        <Link href={ROUTES.GAMES} className={backClass}>
          <ArrowLeft aria-hidden="true" className="size-4" /> {t("games.back")}
        </Link>
        <GameRulesSheet steps={steps} savedNote={savedNote} extra={rulesExtra} />
      </div>

      <PageContainer rhythm="game" className="pt-6 sm:pt-12">
        <div className="hidden space-y-4 md:block">
          <Breadcrumb
            items={[
              { label: t("common.home"), href: ROUTES.HOME },
              { label: t("common.games"), href: ROUTES.GAMES },
              { label: title },
            ]}
          />
          <Link href={ROUTES.GAMES} className={backClass}>
            <ArrowLeft aria-hidden="true" className="size-4" /> {t("games.back")}
          </Link>
        </div>

        <section aria-labelledby="game-title" className="space-y-5 sm:space-y-6">
          <header className="space-y-2 text-center">
            <h1 id="game-title" className="brand-gradient-text text-4xl font-extrabold tracking-tight sm:text-5xl">{title}</h1>
            <p className="mx-auto max-w-xl text-sm text-foreground-secondary sm:text-base">{intro}</p>
          </header>
          {children}
        </section>

        <div className="mx-auto hidden max-w-4xl gap-5 md:grid md:grid-cols-[minmax(0,1fr)_16rem]">
          <div className="rounded-card border border-border bg-surface p-5">
            <h2 className="font-semibold">{t("games.howToPlay")}</h2>
            <ol className="mt-4 space-y-3 text-sm leading-relaxed text-foreground-secondary">
              {steps.map((step, index) => (
                <li key={index} className="flex gap-3">
                  <span aria-hidden="true" className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
            {rulesExtra}
          </div>
          <p className="flex h-fit gap-2 rounded-card border border-border bg-surface p-4 text-xs leading-relaxed text-muted">
            <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            {savedNote}
          </p>
        </div>
      </PageContainer>
    </>
  );
}
