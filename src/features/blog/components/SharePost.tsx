"use client";

import * as React from "react";
import { Check, Copy, Share2 } from "lucide-react";

import { createSocialShareUrls, sharePost } from "@/features/blog/share-post";
import { useI18n } from "@/i18n/client";

type SharePostProps = {
  title: string;
  description: string;
  canonicalUrl: string;
  slug?: string;
};

type Feedback = "idle" | "shared" | "copied" | "error";

export function SharePost({ title, description, canonicalUrl }: SharePostProps) {
  const { t } = useI18n();
  const [feedback, setFeedback] = React.useState<Feedback>("idle");
  const resetTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const socialUrls = React.useMemo(
    () => createSocialShareUrls({ title, canonicalUrl }),
    [canonicalUrl, title],
  );

  const showFeedback = React.useCallback((next: Feedback) => {
    if (resetTimerRef.current !== null) clearTimeout(resetTimerRef.current);
    setFeedback(next);
    if (next !== "idle") {
      resetTimerRef.current = setTimeout(() => {
        resetTimerRef.current = null;
        setFeedback("idle");
      }, 2400);
    }
  }, []);

  React.useEffect(
    () => () => {
      if (resetTimerRef.current !== null) clearTimeout(resetTimerRef.current);
    },
    [],
  );

  const copyCanonicalUrl = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(canonicalUrl);
      showFeedback("copied");
    } catch {
      showFeedback("error");
    }
  }, [canonicalUrl, showFeedback]);

  const handleShare = React.useCallback(async () => {
    showFeedback("idle");
    const result = await sharePost(
      { title, text: description, url: canonicalUrl },
      {
        share: navigator.share?.bind(navigator),
        writeText: navigator.clipboard?.writeText.bind(navigator.clipboard),
      },
    );
    if (result === "shared") showFeedback("shared");
    if (result === "copied") showFeedback("copied");
    if (result === "failed") showFeedback("error");
  }, [canonicalUrl, description, showFeedback, title]);

  const controlClassName =
    "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-border bg-surface px-3 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary focus-visible:ring-2 focus-visible:ring-primary";

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={handleShare} aria-label={t("blog.share")} className={controlClassName}>
          <Share2 aria-hidden="true" className="size-4" />
          {t("blog.share")}
        </button>
        <button type="button" onClick={copyCanonicalUrl} aria-label={t("blog.copyLink")} className={controlClassName}>
          {feedback === "copied" ? <Check aria-hidden="true" className="size-4" /> : <Copy aria-hidden="true" className="size-4" />}
          {feedback === "copied" ? t("blog.copied") : t("blog.copyLink")}
        </button>
        <a href={socialUrls.facebook} target="_blank" rel="noopener noreferrer" aria-label={t("blog.shareOnFacebook")} className={controlClassName}>
          <span aria-hidden="true" className="font-semibold">f</span>
          <span className="sr-only sm:not-sr-only">Facebook</span>
        </a>
        <a href={socialUrls.linkedIn} target="_blank" rel="noopener noreferrer" aria-label={t("blog.shareOnLinkedIn")} className={controlClassName}>
          <span aria-hidden="true" className="text-xs font-semibold">in</span>
          <span className="sr-only sm:not-sr-only">LinkedIn</span>
        </a>
        <a href={socialUrls.x} target="_blank" rel="noopener noreferrer" aria-label={t("blog.shareOnX")} className={controlClassName}>
          <span aria-hidden="true" className="text-sm font-semibold">X</span>
          <span className="sr-only sm:not-sr-only">X</span>
        </a>
      </div>
      <p role="status" aria-live="polite" className={`min-h-5 text-sm ${feedback === "error" ? "text-danger" : "text-success"}`}>
        {feedback === "shared"
          ? t("blog.shared")
          : feedback === "copied"
            ? t("blog.copied")
            : feedback === "error"
              ? t("blog.shareFailed")
              : ""}
      </p>
    </div>
  );
}
