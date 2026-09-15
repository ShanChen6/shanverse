import type { NotionContentBlock } from "@/types/notion";

export type Project = {
	id: string;
	title: string;
	slug: string;
	description: string;
	content: string;
	contentBlocks?: NotionContentBlock[];
	thumbnailImage: string | null;
	coverImage: string | null;
	techStack: string[];
	tags: string[];
	githubUrl: string | null;
	liveUrl: string | null;
	role: string | null;
	timeline: string | null;
	status: string | null;
	featured: boolean;
	published: boolean;
	createdAt: string;
	updatedAt: string;
	url: string;
};
