import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { ProjectCard } from "@/components/common/ProjectCard";
import { ROUTES } from "@/constants/routes";
import type { Project } from "@/types/project";

interface FeaturedProjectsSectionProps {
  projects: Project[];
}

export function FeaturedProjectsSection({
  projects,
}: FeaturedProjectsSectionProps) {
  if (projects.length === 0) return null;

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            Selected Work
          </p>
          <h2 className="text-2xl font-bold tracking-tight">
            Featured Projects
          </h2>
        </div>
        <Link
          href={ROUTES.PROJECTS}
          className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1"
        >
          View all Projects <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </section>
  );
}
