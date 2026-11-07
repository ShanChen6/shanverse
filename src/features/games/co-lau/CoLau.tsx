"use client";

import * as React from "react";
import { ExternalLink } from "lucide-react";
import { useTheme } from "next-themes";

import { Skeleton } from "@/components/ui/skeleton";
import { useI18n } from "@/i18n/client";

import { GameToolbar } from "../components/GameToolbar";

import { buildEmbedSrc, parseBaseUrl, readHeightMessage } from "./embed";

const BASE_URL = parseBaseUrl(process.env.NEXT_PUBLIC_CO_LAU_URL);
// Used until the game reports its real height.
const INITIAL_HEIGHT = 720;
// After this long without the frame loading, point to the new-tab link.
const SLOW_MS = 8000;

/** Cờ Lau, embedded from its own deployment. */
export function CoLau() {
  const { t } = useI18n();
  const { resolvedTheme } = useTheme();
  const frameRef = React.useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = React.useState(INITIAL_HEIGHT);
  const [loaded, setLoaded] = React.useState(false);
  const [slow, setSlow] = React.useState(false);
  // The theme is read once: changing the src later would reload the game and lose the match in play.
  const [theme, setTheme] = React.useState<"light" | "dark" | null>(null);

  React.useEffect(() => {
    if (theme || !resolvedTheme) return;
    setTheme(resolvedTheme === "light" ? "light" : "dark");
  }, [theme, resolvedTheme]);

  React.useEffect(() => {
    if (!theme || loaded) return;
    const timer = window.setTimeout(() => setSlow(true), SLOW_MS);
    return () => window.clearTimeout(timer);
  }, [theme, loaded]);

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
      <div className="relative overflow-hidden rounded-2xl border border-border bg-surface" style={{ height }}>
        {src && <iframe ref={frameRef} src={src} title={t("games.clFrameTitle")} onLoad={() => setLoaded(true)} className="block size-full border-0" loading="lazy" referrerPolicy="strict-origin-when-cross-origin" />}
        {!loaded ? (
          <div role="status" className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-surface p-6 text-center">
            <Skeleton aria-hidden="true" className="h-40 w-full max-w-sm rounded-2xl" />
            <p className="text-sm text-foreground-secondary">{slow ? t("games.clSlow") : t("games.clLoading")}</p>
          </div>
        ) : null}
      </div>
      {src && (
        <GameToolbar className="justify-center">
          <a href={src} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-primary hover:underline focus-visible:ring-2 focus-visible:ring-primary">
            {t("games.clOpenNewTab")} <ExternalLink aria-hidden="true" className="size-3.5" />
          </a>
        </GameToolbar>
      )}
    </div>
  );
}
