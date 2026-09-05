export type NotionCollection =
	| "posts"
	| "categories"
	| "tags"
	| "projects"
	| "authors";

export type NotionSelect = {
	id: string;
	name: string;
	color: string;
};

export type NotionCategory = {
	id: string;
	name: string;
	slug: string;
	description: string;
	icon: string | null;
	url: string;
};

export type NotionTag = {
	id: string;
	name: string;
	slug: string;
	description: string;
	icon: string | null;
	url: string;
};

export type NotionAuthor = {
	id: string;
	name: string;
	bio: string;
	avatar: string | null;
	url: string;
};
