import * as React from "react";
import { CodeXml } from "lucide-react";
import Badge from "@/components/ui/badge";
import { skillGroups } from "../data/about.data";

export function SkillsSection() {
  return (
    <section aria-labelledby="skills-heading" className="space-y-6">
      <div><p className="text-xs font-semibold uppercase tracking-widest text-primary">Toolkit</p><h2 id="skills-heading" className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Kỹ năng và công nghệ đang phát triển</h2><p className="mt-3 max-w-2xl text-foreground-secondary">Những công cụ mình đang sử dụng và tiếp tục tìm hiểu qua Shanverse cùng các dự án cá nhân.</p></div>
      <div className="grid gap-5 sm:grid-cols-2">
        {skillGroups.map((group) => <article key={group.title} className="h-full rounded-2xl border border-border bg-surface p-6"><h3 className="flex items-center gap-2 font-semibold"><CodeXml aria-hidden="true" className="size-4 text-primary" /> {group.title}</h3><div className="mt-4 flex flex-wrap gap-2">{group.skills.map((skill) => <Badge key={skill} variant="outline" className="bg-background">{skill}</Badge>)}</div></article>)}
      </div>
    </section>
  );
}
