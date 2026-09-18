"use client";

import * as React from "react";
import { LocalizedLink as Link } from "@/components/i18n/LocalizedLink";
import { AlertCircle } from "lucide-react";
import { ROUTES } from "@/constants/routes";

export default function BlogPostError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center"><AlertCircle aria-hidden="true" className="mb-5 size-10 text-primary" /><h1 className="text-3xl font-semibold">We couldn&apos;t load this article</h1><p className="mt-3 text-foreground-secondary">The content service may be temporarily unavailable. Try again, or return to the blog.</p><div className="mt-7 flex flex-wrap justify-center gap-3"><button type="button" onClick={reset} className="rounded-lg bg-primary px-5 py-2.5 font-medium text-white focus-visible:ring-2 focus-visible:ring-primary">Try again</button><Link href={ROUTES.BLOG} className="rounded-lg border border-border bg-surface px-5 py-2.5 font-medium hover:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary">Back to blog</Link></div></main>;
}
