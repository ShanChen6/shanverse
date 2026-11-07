import type { NotionContentBlock } from "@/types/notion";

export type ProjectHighlight = { value: string; label: string };

export type Project = {
	id: string;
	title: string;
	slug: string;
	description: string;
	/** One-line version of the description, shown on cards. */
	summary: string | null;
	/** Key numbers, e.g. "98 | Lighthouse score". */
	highlights: ProjectHighlight[];
	/** When the project was made (a Notion date property), as opposed to when the page was created. */
	date: string | null;
	/** Manual position: smaller comes first. */
	order: number | null;
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
