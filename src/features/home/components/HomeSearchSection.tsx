"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { ROUTES } from "@/constants/routes";
import type { NotionCategory } from "@/types/notion";

interface HomeSearchSectionProps {
  categories: NotionCategory[];
}

export function HomeSearchSection({ categories }: HomeSearchSectionProps) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [activeCategory, setActiveCategory] = React.useState<string | null>(
    null,
  );

  const goToBlog = (params: { q?: string; category?: string }) => {
    const search = new URLSearchParams();
    if (params.q) search.set("q", params.q);
    if (params.category) search.set("category", params.category);
    const queryString = search.toString();
    router.push(queryString ? `${ROUTES.BLOG}?${queryString}` : ROUTES.BLOG);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    goToBlog({
      q: query.trim() || undefined,
      category: activeCategory ?? undefined,
    });
  };

  const handleCategoryClick = (slug: string | null) => {
    setActiveCategory(slug);
    goToBlog({ q: query.trim() || undefined, category: slug ?? undefined });
  };

  return (
    <section className="space-y-5">
      <form
        onSubmit={handleSubmit}
        className="mx-auto flex max-w-xl items-center gap-2"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search articles..."
            className="pl-9"
          />
        </div>
        <Button type="submit">Go →</Button>
      </form>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => handleCategoryClick(null)}
          className={cn(
            "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
            activeCategory === null
              ? "border-transparent bg-primary text-white"
              : "border-border text-foreground-secondary hover:border-primary/50 hover:text-primary",
          )}
        >
          All
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => handleCategoryClick(category.slug)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              activeCategory === category.slug
                ? "border-transparent bg-primary text-white"
                : "border-border text-foreground-secondary hover:border-primary/50 hover:text-primary",
            )}
          >
            {category.name}
          </button>
        ))}
      </div>
    </section>
  );
}
