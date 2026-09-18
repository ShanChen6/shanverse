import * as React from "react";
import { LocalizedLink as Link } from "@/components/i18n/LocalizedLink";
import { ArrowRight } from "lucide-react";

import { ProjectCard } from "@/features/home/common/ProjectCard";
import { ROUTES } from "@/constants/routes";
import type { Project } from "@/types/project";

interface FeaturedProjectsSectionProps {
  projects: Project[];
}

export function FeaturedProjectsSection({
  projects,
}: FeaturedProjectsSectionProps) {
  if (projects.length === 0) return null;
  const [leadProject, ...supportingProjects] = projects;

  return (
    <section className="space-y-6">
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            Selected Work
          </p>
          <h2 className="text-2xl font-bold tracking-tight">
            Featured Projects
          </h2>
          <p className="mt-1 text-sm text-foreground-secondary">
            Products and technical experiments built with care.
          </p>
        </div>
        <Link
          href={ROUTES.PROJECTS}
          className="inline-flex items-center gap-1 rounded-sm text-sm font-medium text-primary hover:underline focus-visible:ring-2 focus-visible:ring-primary"
        >
          View all Projects <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="space-y-6">
        <ProjectCard project={leadProject} variant="featured" />
        {supportingProjects.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2">
            {supportingProjects.slice(0, 2).map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
