"use client";

import * as React from "react";
import { MessageCircle } from "lucide-react";
import { useTheme } from "next-themes";

import { useI18n } from "@/i18n/client";
import { giscusConfig } from "../giscus.config";

const Giscus = React.lazy(() => import("@giscus/react"));

function CommentsFallback() {
  return (
    <div
      role="status"
      aria-label="Loading comments"
      className="h-40 animate-pulse rounded-2xl border border-border bg-surface motion-reduce:animate-none"
    />
  );
}

export function BlogComments() {
  const { locale, t } = useI18n();
  const { resolvedTheme } = useTheme();
  const containerRef = React.useRef<HTMLElement>(null);
  const [shouldLoad, setShouldLoad] = React.useState(false);

  React.useEffect(() => {
    if (giscusConfig.enabled || process.env.NODE_ENV !== "development") return;
    const message =
      giscusConfig.reason === "disabled"
        ? "Giscus comments are disabled."
        : "Giscus comments are enabled but the public configuration is incomplete.";
    console.warn(`[Giscus] ${message}`);
  }, []);

  React.useEffect(() => {
    if (!giscusConfig.enabled || shouldLoad || !containerRef.current) return;
    if (!("IntersectionObserver" in window)) {
      setShouldLoad(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShouldLoad(true);
        observer.disconnect();
      },
      { rootMargin: "600px 0px" },
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [shouldLoad]);

  if (!giscusConfig.enabled) return null;

  return (
    <section
      ref={containerRef}
      aria-labelledby="blog-comments-heading"
      className="mx-auto w-full max-w-4xl min-w-0 space-y-5 border-t border-border pt-10"
    >
      <div className="flex items-center gap-2">
        <MessageCircle aria-hidden="true" className="size-5 text-primary" />
        <h2 id="blog-comments-heading" className="text-2xl font-semibold tracking-tight">
          {t("blog.comments")}
        </h2>
      </div>
      <div className="min-h-40 min-w-0 overflow-x-hidden">
        {shouldLoad ? (
          <React.Suspense fallback={<CommentsFallback />}>
            <Giscus
              id="blog-comments"
              repo={giscusConfig.config.repo}
              repoId={giscusConfig.config.repoId}
              category={giscusConfig.config.category}
              categoryId={giscusConfig.config.categoryId}
              mapping="pathname"
              strict="1"
              reactionsEnabled="1"
              emitMetadata="0"
              inputPosition="top"
              theme={resolvedTheme === "dark" ? "dark" : "light"}
              lang={locale === "vi" ? "vi" : "en"}
              loading="lazy"
            />
          </React.Suspense>
        ) : (
          <CommentsFallback />
        )}
      </div>
    </section>
  );
}
