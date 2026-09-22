"use client";

import * as React from "react";
import { Eye } from "lucide-react";

import { useI18n } from "@/i18n/client";
import {
  claimSessionView,
  confirmSessionView,
  releaseSessionView,
  VIEW_SESSION_PREFIX,
  type SessionStorageLike,
} from "../view-session";
import {
  VIEW_OBSERVER_OPTIONS,
  VIEW_SENTINEL_SELECTOR,
} from "../view-observer";

const CONFIRM_VIEW_AFTER_MS = 1_500;

type ViewResponse = {
  ok: boolean;
  count: number | null;
  incremented: boolean;
  available: boolean;
  error?: string;
  status: number;
};

function diagnostic(event: string, details?: Record<string, unknown>): void {
  if (process.env.NODE_ENV !== "development") return;
  console.debug(`[view-counter] ${event}`, details ?? {});
}

function getSessionStorage(): SessionStorageLike | null {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

async function readResponse(response: Response): Promise<ViewResponse> {
  let value: unknown;
  try {
    value = await response.json();
  } catch {
    value = null;
  }
  const body =
    value && typeof value === "object"
      ? (value as Record<string, unknown>)
      : {};
  return {
    ok: response.ok && body.ok === true,
    count:
      typeof body.count === "number" && Number.isFinite(body.count)
        ? body.count
        : null,
    incremented: body.incremented === true,
    available: body.available !== false,
    error: typeof body.error === "string" ? body.error : undefined,
    status: response.status,
  };
}

export function PostViewCount({ slug }: { slug: string }) {
  const { locale, t } = useI18n();
  const [count, setCount] = React.useState<number | null>(null);
  const postStartedRef = React.useRef(false);

  React.useEffect(() => {
    const controller = new AbortController();
    void fetch(`/api/posts/${encodeURIComponent(slug)}/views`, {
      cache: "no-store",
      credentials: "same-origin",
      signal: controller.signal,
    })
      .then(readResponse)
      .then((result) => {
        diagnostic("GET response", {
          status: result.status,
          available: result.available,
          error: result.error,
        });
        if (result.ok && result.count != null) setCount(result.count);
      })
      .catch(() => diagnostic("GET request aborted or unavailable"));
    return () => controller.abort();
  }, [slug]);

  React.useEffect(() => {
    postStartedRef.current = false;
    const sentinel =
      document.querySelector<HTMLElement>(VIEW_SENTINEL_SELECTOR);
    diagnostic("sentinel found", { found: Boolean(sentinel) });
    if (!sentinel) {
      diagnostic("sentinel not found");
      return;
    }

    let sentinelReached = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let controller: AbortController | undefined;
    let claimed = false;
    let completed = false;
    let storage: SessionStorageLike | null = null;

    const sendIncrement = () => {
      timer = undefined;
      diagnostic("document visibility", {
        visibilityState: document.visibilityState,
      });
      if (document.visibilityState !== "visible") return;

      storage = getSessionStorage();
      let markerExists = false;
      try {
        markerExists = Boolean(
          storage?.getItem(`${VIEW_SESSION_PREFIX}${slug}`),
        );
        claimed = claimSessionView(storage, slug);
      } catch {
        storage = null;
        claimed = claimSessionView(null, slug);
      }
      diagnostic("session marker exists", { exists: markerExists });
      if (!claimed || postStartedRef.current) return;

      postStartedRef.current = true;
      controller = new AbortController();
      void fetch(`/api/posts/${encodeURIComponent(slug)}/views`, {
        method: "POST",
        cache: "no-store",
        credentials: "same-origin",
        headers: { "content-type": "application/json" },
        signal: controller.signal,
      })
        .then(readResponse)
        .then((result) => {
          diagnostic("POST status", {
            status: result.status,
            incremented: result.incremented,
            error: result.error,
          });
          if (!result.ok || !result.incremented || result.count == null) {
            releaseSessionView(slug);
            claimed = false;
            postStartedRef.current = false;
            return;
          }
          confirmSessionView(storage, slug);
          completed = true;
          setCount(result.count);
        })
        .catch(() => {
          diagnostic("POST failed", { error: "REQUEST_FAILED" });
          releaseSessionView(slug);
          claimed = false;
          postStartedRef.current = false;
        });
    };

    const startConfirmationTimer = () => {
      if (
        timer ||
        postStartedRef.current ||
        document.visibilityState !== "visible"
      ) {
        return;
      }
      diagnostic("timer started", { delayMs: CONFIRM_VIEW_AFTER_MS });
      timer = setTimeout(sendIncrement, CONFIRM_VIEW_AFTER_MS);
    };

    const handleVisibilityChange = () => {
      diagnostic("document visibility", {
        visibilityState: document.visibilityState,
      });
      if (document.visibilityState !== "visible") {
        if (timer) {
          clearTimeout(timer);
          timer = undefined;
        }
        return;
      }
      if (sentinelReached) startConfirmationTimer();
    };

    const observer = new IntersectionObserver(([entry]) => {
      diagnostic("observer intersecting", {
        intersecting: Boolean(entry?.isIntersecting),
      });
      if (!entry?.isIntersecting || timer || postStartedRef.current) return;
      sentinelReached = true;
      observer.disconnect();
      startConfirmationTimer();
    }, VIEW_OBSERVER_OPTIONS);

    document.addEventListener("visibilitychange", handleVisibilityChange);
    observer.observe(sentinel);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (timer) clearTimeout(timer);
      controller?.abort();
      if (claimed && !completed) releaseSessionView(slug);
    };
  }, [slug]);

  const formatted =
    count == null
      ? null
      : new Intl.NumberFormat(locale === "vi" ? "vi-VN" : "en-US").format(count);

  return (
    <span className="inline-flex min-w-24 items-center gap-2" aria-live="off">
      <Eye aria-hidden="true" className="size-4" />
      {formatted == null ? (
        <span
          aria-hidden="true"
          className="h-4 w-16 animate-pulse rounded bg-border motion-reduce:animate-none"
        />
      ) : (
        t(count === 1 ? "views.one" : "views.other", { count: formatted })
      )}
    </span>
  );
}
