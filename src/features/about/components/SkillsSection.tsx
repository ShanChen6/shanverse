import * as React from "react";
import Badge from "@/components/ui/badge";
import { getTranslator } from "@/i18n/server";
import { skillGroups } from "../data/about.data";

/** Tools I use, grouped; shown in the About sidebar. */
export async function SkillsSection() {
  const { t } = await getTranslator();
  return (
    <section aria-labelledby="skills-heading" className="space-y-4">
      <h2 id="skills-heading" className="text-lg font-bold tracking-tight">{t("about.skillsTitle")}</h2>
      <dl className="space-y-4">
        {skillGroups.map((group) => (
          <div key={group.key}>
            <dt className="text-sm font-medium text-foreground-secondary">{t(`about.skillGroups.${group.key}`)}</dt>
            <dd className="mt-2 flex flex-wrap gap-1.5">
              {group.skills.map((skill) => <Badge key={skill} variant="outline" className="bg-background">{skill}</Badge>)}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
