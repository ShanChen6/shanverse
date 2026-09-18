import type { NotionCollection } from "@/types/notion";

export const notionPropertyNames = {
	title: ["Title", "Name", "title", "name"],
	slug: ["Slug", "slug"],
	excerpt: ["Excerpt", "Summary", "excerpt", "summary"],
	description: ["Description", "description"],
	content: ["Content", "content"],
	thumbnailImage: ["Thumbnail", "thumbnail", "Thumbnail Image", "thumbnailImage"],
	coverImage: ["Cover", "cover", "Cover Image", "coverImage", "Image", "image"],
	category: ["Category", "category"],
	techStack: ["Tech Stack", "techStack", "技术栈"],
	tags: ["Tags", "Tag", "tags", "tag"],
	author: ["Author", "作者", "author"],
	readingTime: [
		"Reading Time",
		"Read Time",
		"Reading time",
		"readTime",
		"readingTime",
	],
	publishedAt: ["Published Date", "Publish Date", "Date", "publishedAt"],
	published: ["Published", "published"],
	featured: ["Featured", "featured"],
	githubUrl: ["GitHub", "Github", "githubUrl", "GitHub URL"],
	liveUrl: ["Live URL", "Website", "liveUrl", "Demo URL"],
	role: ["Role", "role"],
	timeline: ["Timeline", "timeline"],
	status: ["Status", "status"],
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
