import { buildAbsoluteUrl, SEO_CONFIG } from "@/config/seo.config";
import { getCachedBlogPosts } from "@/features/blog/blog-data";
import { publishedPosts } from "@/features/blog/blog-query";

export const revalidate = 300;

const escapeXml = (value: string) => value.replace(/[<>&"']/gu, (character) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" })[character] ?? character);
const validDate = (value: string | null) => { const date = new Date(value || 0); return Number.isNaN(date.getTime()) ? null : date; };

export async function GET() {
  try {
    const posts = publishedPosts(await getCachedBlogPosts());
    const latest = posts.map((post) => validDate(post.publishedAt ?? post.createdAt)).filter((date): date is Date => Boolean(date)).sort((a, b) => b.getTime() - a.getTime())[0];
    const items = posts.map((post) => {
      const link = buildAbsoluteUrl(`/vi/blog/${encodeURIComponent(post.slug)}`);
      const date = validDate(post.publishedAt ?? post.createdAt);
      const categories = [post.category, ...post.tags].filter(Boolean).map((category) => `<category>${escapeXml(String(category))}</category>`).join("");
      return `<item><title>${escapeXml(post.title)}</title><link>${escapeXml(link)}</link><guid isPermaLink="true">${escapeXml(link)}</guid><description>${escapeXml(post.excerpt)}</description>${date ? `<pubDate>${date.toUTCString()}</pubDate>` : ""}${post.authorName ? `<author>${escapeXml(post.authorName)}</author>` : ""}${categories}</item>`;
    }).join("");
    const body = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>${escapeXml(SEO_CONFIG.siteName)} Blog</title><description>${escapeXml(SEO_CONFIG.defaultDescription)}</description><link>${escapeXml(buildAbsoluteUrl("/vi/blog"))}</link><language>vi-VN</language><atom:link href="${escapeXml(buildAbsoluteUrl("/rss.xml"))}" rel="self" type="application/rss+xml"/>${latest ? `<lastBuildDate>${latest.toUTCString()}</lastBuildDate>` : ""}${items}</channel></rss>`;
    return new Response(body, { headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } });
  } catch {
    return new Response("RSS feed is temporarily unavailable.", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });
  }
}
