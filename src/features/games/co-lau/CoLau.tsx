"use client";

import * as React from "react";
import { ExternalLink } from "lucide-react";
import { useTheme } from "next-themes";

import { useI18n } from "@/i18n/client";

import { buildEmbedSrc, parseBaseUrl, readHeightMessage } from "./embed";

const BASE_URL = parseBaseUrl(process.env.NEXT_PUBLIC_CO_LAU_URL);
// Used until the game reports its real height.
const INITIAL_HEIGHT = 720;

/** Cờ Lau, embedded from its own deployment. */
export function CoLau() {
  const { t } = useI18n();
  const { resolvedTheme } = useTheme();
  const frameRef = React.useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = React.useState(INITIAL_HEIGHT);
  // The theme is read once: changing the src later would reload the game and lose the match in play.
  const [theme, setTheme] = React.useState<"light" | "dark" | null>(null);

  React.useEffect(() => {
    if (theme || !resolvedTheme) return;
    setTheme(resolvedTheme === "light" ? "light" : "dark");
  }, [theme, resolvedTheme]);

  React.useEffect(() => {
    if (!BASE_URL) return;
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== BASE_URL.origin || event.source !== frameRef.current?.contentWindow) return;
      const next = readHeightMessage(event.data);
      if (next !== null) setHeight(next);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  if (!BASE_URL) {
    return <p className="mx-auto max-w-xl rounded-2xl border border-border bg-surface p-6 text-center text-sm text-foreground-secondary">{t("games.clUnavailable")}</p>;
  }

  const src = theme ? buildEmbedSrc(BASE_URL, theme) : null;

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-2xl border border-border bg-surface" style={{ height }}>
        {src && <iframe ref={frameRef} src={src} title={t("games.clFrameTitle")} className="block size-full border-0" loading="lazy" referrerPolicy="strict-origin-when-cross-origin" />}
      </div>
      {src && (
        <p className="text-center text-xs">
          <a href={src} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-primary hover:underline focus-visible:ring-2 focus-visible:ring-primary">
            {t("games.clOpenNewTab")} <ExternalLink aria-hidden="true" className="size-3.5" />
          </a>
        </p>
      )}
    </div>
  );
}
