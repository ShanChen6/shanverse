export type Project = {
	id: string;
	title: string;
	slug: string;
	description: string;
	content: string;
	thumbnailImage: string | null;
	coverImage: string | null;
	category: string | null;
	tags: string[];
	githubUrl: string | null;
	liveUrl: string | null;
	featured: boolean;
	published: boolean;
	createdAt: string;
	updatedAt: string;
	url: string;
};
