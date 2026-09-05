export type Post = {
	id: string;
	title: string;
	slug: string;
	excerpt: string;
	content: string;
	coverImage: string | null;
	category: string | null;
	tags: string[];
	publishedAt: string | null;
	updatedAt: string;
	featured: boolean;
	published: boolean;
	url: string;
};
