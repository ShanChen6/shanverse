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

export type NotionRichText = {
	plainText: string;
	href: string | null;
	annotations: {
		bold: boolean;
		italic: boolean;
		strikethrough: boolean;
		underline: boolean;
		code: boolean;
		color: string;
	};
};

export type NotionIcon =
	| { type: "emoji"; value: string }
	| { type: "file" | "external"; url: string };

export type NotionContentBlock = {
	id: string;
	type: string;
	richText: NotionRichText[];
	children: NotionContentBlock[];
	color?: string;
	checked?: boolean;
	code?: string;
	language?: string;
	caption?: NotionRichText[];
	url?: string;
	source?: "file" | "external";
	icon?: NotionIcon | null;
};
