import type { NotionCollection } from "@/types/notion";

export const notionPropertyNames = {
	title: ["Title", "Name", "title", "name"],
	slug: ["Slug", "slug"],
	excerpt: ["Excerpt", "Summary", "excerpt", "summary"],
	description: ["Description", "description"],
	content: ["Content", "content"],
	coverImage: ["Cover", "Thumbnail", "Image", "cover", "thumbnail", "image"],
	category: ["Category", "category"],
	tags: ["Tags", "Tag", "tags", "tag"],
	type: ["Type", "type"],
	publishedAt: ["Published Date", "Publish Date", "Date", "publishedAt"],
	published: ["Published", "published"],
	featured: ["Featured", "featured"],
	githubUrl: ["GitHub", "Github", "githubUrl"],
	liveUrl: ["Live URL", "Website", "liveUrl"],
	bio: ["Bio", "Biography", "bio", "biography"],
	avatar: ["Avatar", "Profile Image", "avatar", "profileImage"],
} as const;

export const notionDataSourceEnv: Record<NotionCollection, string | undefined> = {
	posts: process.env.NOTION_POSTS_DATA_SOURCE_ID,
	categories: process.env.NOTION_CATEGORIES_DATA_SOURCE_ID,
	tags: process.env.NOTION_TAGS_DATA_SOURCE_ID,
	projects: process.env.NOTION_PROJECTS_DATA_SOURCE_ID,
	authors: process.env.NOTION_AUTHORS_DATA_SOURCE_ID,
};
