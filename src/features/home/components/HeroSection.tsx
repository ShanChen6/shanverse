import * as React from "react";
import Link from "next/link";
import { ArrowRight, LayoutGrid, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import { ROUTES } from "@/constants/routes";

export function HeroSection() {
  return (
    <div className="space-y-6 lg:col-span-7">
      <div className="inline-flex items-center gap-2">
        <Badge variant="secondary" className="px-3 py-1 text-xs">
          <Sparkles className="mr-1.5 h-3.5 w-3.5 text-primary" />
          Shanverse Personal Site
        </Badge>
        <Badge variant="success" className="px-3 py-1 text-xs">
          Next.js 16 Ready
        </Badge>
      </div>

      <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-foreground">
        Engineering notes, AI workflows &{" "}
        <span className="text-primary">Modern Web</span>
      </h1>

      <p className="text-lg text-foreground-secondary leading-relaxed max-w-2xl">
        Welcome to Shanverse — space of Shan Kinh Can. Exploring full-stack
        engineering, clean design systems, and agentic AI workflows.
      </p>

      <div className="flex flex-wrap items-center gap-4 pt-2">
        <Button asChild size="lg" className="gap-2">
          <Link href={ROUTES.TEST}>
            <LayoutGrid className="h-4 w-4" />
            Test Components Gallery
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="#features">
            Learn More <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
