import type { Post } from "@/types/post";

function timestamp(post: Post) {
  const value = Date.parse(post.publishedAt ?? post.createdAt);
  return Number.isNaN(value) ? 0 : value;
}

function normalized(value: string | null | undefined) {
  return value?.trim().toLocaleLowerCase("en") ?? "";
}

export function getRelatedPosts(currentPost: Post, allPosts: Post[], limit = 3): Post[] {
  const safeLimit = Math.max(0, Math.floor(limit));
  if (safeLimit === 0) return [];
  const currentCategory = normalized(currentPost.category);
  const currentTags = new Set(currentPost.tags.map(normalized).filter(Boolean));

  return allPosts
    .filter((post) => post.id !== currentPost.id && post.published === true && Boolean(post.title.trim()) && Boolean(post.slug.trim()))
    .map((post) => {
      const categoryScore = currentCategory && normalized(post.category) === currentCategory ? 3 : 0;
      const matchingTags = new Set(post.tags.map(normalized).filter((tag) => currentTags.has(tag))).size;
      return { post, score: categoryScore + matchingTags * 2 };
    })
    .sort((left, right) => right.score - left.score || timestamp(right.post) - timestamp(left.post) || Number(right.post.featured) - Number(left.post.featured) || left.post.slug.localeCompare(right.post.slug, "en") || left.post.id.localeCompare(right.post.id, "en"))
    .slice(0, safeLimit)
    .map(({ post }) => post);
}
