import * as React from "react";
import { CodeXml } from "lucide-react";
import Badge from "@/components/ui/badge";
import { getTranslator } from "@/i18n/server";
import { skillGroups } from "../data/about.data";

export async function SkillsSection() {
  const { t } = await getTranslator();
  return (
    <section aria-labelledby="skills-heading" className="space-y-6">
      <div><p className="text-xs font-semibold uppercase tracking-widest text-primary">{t("about.skillsEyebrow")}</p><h2 id="skills-heading" className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">{t("about.skillsTitle")}</h2><p className="mt-3 max-w-2xl text-foreground-secondary">{t("about.skillsDescription")}</p></div>
      <div className="grid gap-5 sm:grid-cols-2">
        {skillGroups.map((group) => <article key={group.key} className="h-full rounded-2xl border border-border bg-surface p-6"><h3 className="flex items-center gap-2 font-semibold"><CodeXml aria-hidden="true" className="size-4 text-primary" /> {t(`about.skillGroups.${group.key}`)}</h3><div className="mt-4 flex flex-wrap gap-2">{group.skills.map((skill) => <Badge key={skill} variant="outline" className="bg-background">{skill}</Badge>)}</div></article>)}
      </div>
    </section>
  );
}
