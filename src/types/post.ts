import type { NotionContentBlock } from "@/types/notion";

export type Post = {
	id: string;
	title: string;
	slug: string;
	excerpt: string;
	content: string;
	contentBlocks?: NotionContentBlock[];
	thumbnailImage: string | null;
	coverImage: string | null;
	category: string | null;
	tags: string[];
	authorName: string | null;
	authorAvatar: string | null;
	createdAt: string;
	publishedAt: string | null;
	updatedAt: string;
	featured: boolean;
	published: boolean;
	url: string;
};
