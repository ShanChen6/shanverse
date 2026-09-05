import * as React from "react";
import Link from "next/link";
import { Code2, ExternalLink, Layers, Star } from "lucide-react";

import { LandingLayout } from "@/components/layout/LandingLayout";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Badge from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Pagination } from "@/components/layout/pagination";
import { ROUTES } from "@/constants/routes";

// Placeholder project list
const sampleProjects = [
  {
    id: "shanverse-web",
    slug: "shanverse-web",
    title: "Shanverse Personal Site & UI Kit",
    description:
      "Trang cá nhân tích hợp thư viện UI component token-first, Next.js 16 và Tailwind CSS v4.",
    tags: ["Next.js 16", "React 19", "Tailwind CSS v4", "TypeScript"],
    category: "Web",
    featured: true,
    githubUrl: "https://github.com",
    liveUrl: "https://shanverse.com",
  },
  {
    id: "signal-app",
    slug: "signal-app",
    title: "Signal Trading & Portfolio Tracker",
    description:
      "Ứng dụng theo dõi tín hiệu đầu tư và danh mục chứng khoán thời gian thực.",
    tags: ["React Native", "Expo v57", "TypeScript", "WebSocket"],
    category: "Mobile",
    featured: true,
    githubUrl: "https://github.com",
    liveUrl: "https://signal-app.com",
  },
  {
    id: "agentic-workflow-tool",
    slug: "agentic-workflow-tool",
    title: "VS Code Agentic Workflow Extension",
    description:
      "Công cụ tự động hóa quy trình phát triển phần mềm với AI subagent và custom skills.",
    tags: ["VS Code Extension", "Node.js", "AI Agent"],
    category: "AI",
    featured: false,
    githubUrl: "https://github.com",
    liveUrl: "",
  },
];

export default function ProjectsPage() {
  return (
    <LandingLayout>
      <div className="container mx-auto px-4 py-10 space-y-12">
        {/* Header & Breadcrumb */}
        <header className="space-y-4 border-b border-border pb-8">
          <Breadcrumb
            items={[
              { label: "Home", href: ROUTES.HOME },
              { label: "Projects" },
            ]}
          />
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                Projects Showcase
              </h1>
              <p className="mt-2 text-foreground-secondary max-w-xl">
                Danh sách các dự án thực tế, sản phẩm thử nghiệm và đóng góp mã
                nguồn mở.
              </p>
            </div>

            {/* Filter Search Input Placeholder */}
            <div className="w-full md:w-72">
              <Input placeholder="Tìm kiếm dự án..." className="w-full" />
            </div>
          </div>
        </header>

        {/* Category Pills Placeholder */}
        <section
          id="project-categories"
          className="flex flex-wrap items-center gap-2"
        >
          <Button size="sm" variant="default">
            All Projects
          </Button>
          <Button size="sm" variant="outline">
            Web App
          </Button>
          <Button size="sm" variant="outline">
            Mobile App
          </Button>
          <Button size="sm" variant="outline">
            AI & Automation
          </Button>
          <Button size="sm" variant="outline">
            Open Source
          </Button>
        </section>

        {/* FEATURED PROJECTS SECTION */}
        <section id="featured-projects" className="space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" /> Featured Projects
            </h2>
            <Badge variant="secondary">Nổi bật</Badge>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {sampleProjects
              .filter((p) => p.featured)
              .map((project) => (
                <Card
                  key={project.id}
                  className="flex flex-col justify-between hover:border-primary/50 transition-colors"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <Badge variant="outline">{project.category}</Badge>
                      <span className="text-xs text-muted-foreground font-mono">
                        Featured
                      </span>
                    </div>
                    <CardTitle className="text-xl">
                      <Link
                        href={ROUTES.PROJECT_DETAIL(project.slug)}
                        className="hover:text-primary transition-colors"
                      >
                        {project.title}
                      </Link>
                    </CardTitle>
                    <CardDescription>{project.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-1.5">
                      {project.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-[11px]"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="flex items-center justify-between border-t border-border pt-4">
                    <div className="flex items-center gap-2">
                      {project.githubUrl ? (
                        <Button asChild size="sm" variant="ghost">
                          <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <Code2 className="h-4 w-4 mr-1" /> Repository
                          </a>
                        </Button>
                      ) : null}
                      {project.liveUrl ? (
                        <Button asChild size="sm" variant="outline">
                          <a
                            href={project.liveUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <ExternalLink className="h-4 w-4 mr-1" /> Live Demo
                          </a>
                        </Button>
                      ) : null}
                    </div>
                    <Button asChild size="sm" variant="default">
                      <Link href={ROUTES.PROJECT_DETAIL(project.slug)}>
                        Chi tiết →
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
          </div>
        </section>

        {/* ALL PROJECTS GRID SECTION */}
        <section id="all-projects" className="space-y-6">
          <div className="border-b border-border pb-2">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" /> Tất cả dự án
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sampleProjects.map((project) => (
              <Card key={project.id} className="flex flex-col justify-between">
                <CardHeader>
                  <Badge variant="outline" className="w-fit mb-2">
                    {project.category}
                  </Badge>
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
                <CardFooter className="flex items-center justify-between border-t border-border pt-3">
                  <div className="flex flex-wrap gap-1">
                    {project.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] text-muted-foreground font-mono"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <Button asChild size="sm" variant="ghost">
                    <Link href={ROUTES.PROJECT_DETAIL(project.slug)}>
                      Xem →
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Pagination Placeholder */}
          <div className="flex justify-center pt-6">
            <Pagination
              currentPage={1}
              totalPages={3}
              hrefBuilder={(p) => `#page-${p}`}
            />
          </div>
        </section>
      </div>
    </LandingLayout>
  );
}
