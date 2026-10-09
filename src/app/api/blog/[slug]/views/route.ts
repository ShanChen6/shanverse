import { createViewCountHandlers } from "@/features/blog/view-count-api";
import { getViews, incrView } from "@/features/blog/view-count";
import { isPublishedPostSlug } from "@/features/blog/published-slugs";
import { allowViewRequest } from "@/features/blog/view-rate-limit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const { GET, POST } = createViewCountHandlers({
  allowRequest: allowViewRequest,
  isPublishedPostSlug,
  getViews,
  incrView,
});
