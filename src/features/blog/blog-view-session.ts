type ViewSnapshot = {
  views: number | null;
  status: "loading" | "ready" | "error";
};

const INITIAL_SNAPSHOT: ViewSnapshot = { views: null, status: "loading" };

// One session belongs to one mounted article, so effect replays share requests
// without retaining slugs globally or suppressing later visits to the article.
export function createBlogViewSession(slug: string, fetcher: typeof fetch = fetch) {
  let snapshot = INITIAL_SNAPSHOT;
  let readRequest: Promise<void> | null = null;
  let countRequest: Promise<void> | null = null;
  const listeners = new Set<() => void>();

  const update = (next: ViewSnapshot) => {
    snapshot = next;
    listeners.forEach((listener) => listener());
  };

  const request = async (method: "GET" | "POST") => {
    const response = await fetcher(`/api/blog/${encodeURIComponent(slug)}/views`, {
      method,
      credentials: "same-origin",
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    const data: unknown = await response.json();
    if (
      !response.ok ||
      !data ||
      typeof data !== "object" ||
      !("views" in data) ||
      typeof data.views !== "number" ||
      !Number.isSafeInteger(data.views) ||
      data.views < 0 ||
      !("counted" in data) ||
      typeof data.counted !== "boolean"
    ) {
      throw new Error("Views are unavailable");
    }
    return data.views;
  };

  return {
    getSnapshot: () => snapshot,
    getServerSnapshot: () => INITIAL_SNAPSHOT,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    load: () => {
      readRequest ??= request("GET").then(
        (views) => {
          // A slow initial read must never replace the newer POST result.
          if (!countRequest) update({ views, status: "ready" });
        },
        () => {
          if (!countRequest) update({ ...snapshot, status: "error" });
        },
      );
      return readRequest;
    },
    count: () => {
      countRequest ??= request("POST").then(
        (views) => update({ views, status: "ready" }),
        () => update({ ...snapshot, status: "error" }),
      );
      return countRequest;
    },
  };
}
