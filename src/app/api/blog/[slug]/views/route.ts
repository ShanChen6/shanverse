import { createViewCountHandlers } from "@/features/blog/view-count-api";
import { getViews, incrView } from "@/features/blog/view-count";
import { notionService } from "@/services/notion.service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const { GET, POST } = createViewCountHandlers({
  isPublishedPostSlug: (slug) => notionService.isPublishedPostSlug(slug),
  getViews,
  incrView,
});
