"use client";

import * as React from "react";
import { Eye } from "lucide-react";

import { createBlogViewSession } from "@/features/blog/blog-view-session";
import { observeBlogContent } from "@/features/blog/observe-blog-content";
import { useI18n } from "@/i18n/client";

const BlogViewsContext = React.createContext<ReturnType<typeof createBlogViewSession> | null>(null);

function useBlogViews() {
  const session = React.useContext(BlogViewsContext);
  if (!session) throw new Error("Blog view components require BlogViewProvider");
  return session;
}

export function BlogViewProvider({ slug, children }: { slug: string; children: React.ReactNode }) {
  const session = React.useMemo(() => createBlogViewSession(slug), [slug]);

  React.useEffect(() => {
    void session.load();
  }, [session]);

  return <BlogViewsContext.Provider value={session}>{children}</BlogViewsContext.Provider>;
}

export function BlogViewCount() {
  const session = useBlogViews();
  const { views, status } = React.useSyncExternalStore(
    session.subscribe,
    session.getSnapshot,
    session.getServerSnapshot,
  );
  const { locale, t } = useI18n();
  const label = t("blog.views", {
    count: views === null ? "—" : new Intl.NumberFormat(locale).format(views),
  });
  const feedback = status === "error"
    ? t("blog.viewsUnavailable")
    : status === "loading"
      ? t("blog.viewsLoading")
      : undefined;

  return (
    <span className="inline-flex items-center gap-2" title={feedback} aria-live="polite">
      <Eye aria-hidden="true" className="size-4" />
      <span aria-hidden={views === null}>{label}</span>
      {feedback ? <span className="sr-only">{feedback}</span> : null}
    </span>
  );
}

export function BlogViewContent({ children }: { children: React.ReactNode }) {
  const session = useBlogViews();
  const contentRef = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    const content = contentRef.current;
    if (!content) return;
    return observeBlogContent(content, () => { void session.count(); });
  }, [session]);

  // This same main element contains the server-rendered content at every width.
  // Keep the attribute used by reading progress/TOC; tracking uses the ref itself.
  return <main ref={contentRef} data-blog-content className="min-w-0">{children}</main>;
}
