type ViewportEnvironment = {
  window: Pick<EventTarget, "addEventListener" | "removeEventListener"> & {
    innerWidth: number;
    innerHeight: number;
    IntersectionObserver?: typeof IntersectionObserver;
  };
  document: Pick<EventTarget, "addEventListener" | "removeEventListener"> & {
    visibilityState: DocumentVisibilityState;
  };
  setTimeout?: typeof setTimeout;
  clearTimeout?: typeof clearTimeout;
};

// A brief scroll-through or a bot toggling IntersectionObserver should not
// count as a read; require the content to stay visible for a dwell period.
export const VIEW_DWELL_MS = 3_000;

export function observeBlogContent(
  content: HTMLElement,
  onVisible: () => void,
  environment: ViewportEnvironment = { window, document },
  dwellMs = VIEW_DWELL_MS,
): () => void {
  const viewport = environment.window;
  const page = environment.document;
  const schedule = environment.setTimeout ?? setTimeout;
  const cancel = environment.clearTimeout ?? clearTimeout;
  let active = true;
  let observed = false;
  let intersecting = false;
  let dwellTimer: ReturnType<typeof setTimeout> | null = null;

  const clearDwell = () => {
    if (dwellTimer === null) return;
    cancel(dwellTimer);
    dwellTimer = null;
  };

  const countIfVisible = () => {
    if (!active || observed) return;
    if (!intersecting || page.visibilityState === "hidden") {
      clearDwell();
      return;
    }
    if (dwellTimer !== null) return;
    dwellTimer = schedule(() => {
      dwellTimer = null;
      if (!active || observed || !intersecting || page.visibilityState === "hidden") return;
      observed = true;
      observer?.disconnect();
      onVisible();
    }, dwellMs);
  };
  const checkBounds = () => {
    const rect = content.getBoundingClientRect();
    intersecting = rect.bottom > 0 && rect.top < viewport.innerHeight &&
      rect.right > 0 && rect.left < viewport.innerWidth && rect.width > 0 && rect.height > 0;
    countIfVisible();
  };
  // A positive threshold also emits after an edge-touching, zero-area entry.
  const observer = viewport.IntersectionObserver
    ? new viewport.IntersectionObserver(([entry]) => {
        intersecting = entry.isIntersecting &&
          entry.intersectionRect.width > 0 && entry.intersectionRect.height > 0;
        countIfVisible();
      }, { threshold: [0, Number.EPSILON] })
    : null;

  if (observer) {
    observer.observe(content);
  } else {
    viewport.addEventListener("scroll", checkBounds, { passive: true });
    viewport.addEventListener("resize", checkBounds);
    checkBounds();
  }
  page.addEventListener("visibilitychange", checkBounds);

  return () => {
    active = false;
    clearDwell();
    observer?.disconnect();
    viewport.removeEventListener("scroll", checkBounds);
    viewport.removeEventListener("resize", checkBounds);
    page.removeEventListener("visibilitychange", checkBounds);
  };
}
