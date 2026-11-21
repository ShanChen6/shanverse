import * as React from "react";
import { SectionHeader } from "@/components/layout/SectionHeader";

import { ProjectCard } from "@/features/home/common/ProjectCard";
import { ROUTES } from "@/constants/routes";
import { getTranslator } from "@/i18n/server";
import type { Project } from "@/types/project";

interface FeaturedProjectsSectionProps {
  projects: Project[];
}

export async function FeaturedProjectsSection({
  projects,
}: FeaturedProjectsSectionProps) {
  if (projects.length === 0) return null;
  const { t } = await getTranslator();
  const [leadProject, ...supportingProjects] = projects;

  return (
    <section aria-labelledby="home-projects-heading" className="space-y-6">
      <SectionHeader titleId="home-projects-heading" title={t("home.featuredProjects")} description={t("home.featuredProjectsDescription")} link={{ href: ROUTES.PROJECTS, label: t("home.viewAllProjects") }} />

      <div className="space-y-6">
        <ProjectCard project={leadProject} variant="featured" />
        {supportingProjects.length > 0 ? (
          <div className="grid grid-fill-last gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {supportingProjects.slice(0, 3).map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
