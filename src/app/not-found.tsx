import * as React from "react";
import { LocalizedLink as Link } from "@/components/i18n/LocalizedLink";
import { BookOpen, FolderKanban, Home } from "lucide-react";

import { LandingLayout } from "@/components/layout/LandingLayout";
import { TianwuLost } from "@/components/mascot/TianwuScenes";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { getTranslator } from "@/i18n/server";

export default async function NotFound() {
  const { t } = await getTranslator();
  return (
    <LandingLayout>
      <div className="container mx-auto grid min-h-[60vh] max-w-5xl items-center gap-10 px-4 py-16 sm:py-20 md:grid-cols-2">
        <TianwuLost className="order-first md:order-last" />
        <div className="space-y-5 text-center md:text-left">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">{t("mascot.lostEyebrow")}</p>
          <h1 className="text-balance text-3xl font-extrabold tracking-tight sm:text-4xl">{t("mascot.lostTitle")}</h1>
          <p className="text-pretty text-xl font-medium leading-relaxed">“{t("mascot.lostLine")}”</p>
          <p className="text-pretty leading-relaxed text-foreground-secondary">{t("mascot.lostHint")}</p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 md:justify-start">
            <Button asChild variant="default" size="lg">
              <Link href={ROUTES.HOME}>
                <Home className="mr-2 h-4 w-4" /> {t("errors.backHome")}
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href={ROUTES.BLOG}>
                <BookOpen className="mr-2 h-4 w-4" /> {t("errors.browseBlog")}
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href={ROUTES.PROJECTS}>
                <FolderKanban className="mr-2 h-4 w-4" /> {t("common.viewProjects")}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </LandingLayout>
  );
}
