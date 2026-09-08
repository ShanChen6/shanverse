import * as React from "react";
import Link from "next/link";
import { Code2, ExternalLink } from "lucide-react";

import Badge from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ROUTES } from "@/constants/routes";
import type { Project } from "@/types/project";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Card className="flex h-full flex-col overflow-hidden hover:border-primary/50 transition-colors">
      <div className="flex h-36 items-center justify-center bg-linear-to-br from-primary/20 via-primary/10 to-transparent text-muted-foreground">
        {"{ }"}
      </div>
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between gap-2">
          {project.category ? (
            <Badge variant="outline">{project.category}</Badge>
          ) : (
            <span />
          )}
          <Badge
            variant={project.liveUrl ? "success" : "secondary"}
            className="text-[10px]"
          >
            {project.liveUrl ? "Live" : "In Progress"}
          </Badge>
        </div>
        <CardTitle className="text-lg">
          <Link
            href={ROUTES.PROJECT_DETAIL(project.slug)}
            className="hover:text-primary transition-colors"
          >
            {project.title}
          </Link>
        </CardTitle>
        <CardDescription className="line-clamp-2">
          {project.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="mt-auto flex flex-wrap gap-1.5">
        {project.tags.slice(0, 3).map((tag) => (
          <Badge key={tag} variant="secondary" className="text-[10px]">
            {tag}
          </Badge>
        ))}
      </CardContent>
      <CardFooter className="flex items-center gap-3 border-t border-border pt-3">
        {project.githubUrl ? (
          <Button asChild size="sm" variant="ghost">
            <a href={project.githubUrl} target="_blank" rel="noreferrer">
              <Code2 className="h-4 w-4 mr-1" /> Code
            </a>
          </Button>
        ) : null}
        {project.liveUrl ? (
          <Button asChild size="sm" variant="outline">
            <a href={project.liveUrl} target="_blank" rel="noreferrer">
              <ExternalLink className="h-4 w-4 mr-1" /> Live Demo
            </a>
          </Button>
        ) : null}
      </CardFooter>
    </Card>
  );
}
