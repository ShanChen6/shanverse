import "server-only";

import { Client, isFullPage, isNotionClientError } from "@notionhq/client";
import type {
	BlockObjectResponse,
	PageObjectResponse,
	RichTextItemResponse,
} from "@notionhq/client/build/src/api-endpoints";

import { notionDataSourceEnv, notionPropertyNames } from "@/config/notion.config";
import { getNotionEnv } from "@/lib/env";
import type { NotionAuthor, NotionCategory, NotionContentBlock, NotionIcon, NotionRichText, NotionTag } from "@/types/notion";
import type { Post } from "@/types/post";
import type { Project } from "@/types/project";

type NotionProperty = PageObjectResponse["properties"][string];
type NotionPage = PageObjectResponse;

export class NotionServiceError extends Error {
	constructor(message: string, options?: { cause?: unknown }) {
		const causeCode = isNotionClientError(options?.cause) ? ` (${options.cause.code})` : "";
		super(`${message}${causeCode}`, options);
		this.name = "NotionServiceError";
	}
}

const firstProperty = (properties: NotionPage["properties"], names: readonly string[]) =>
	names.map((name) => properties[name]).find(Boolean);

const richText = (value: RichTextItemResponse[] | undefined): string =>
	value?.map((item) => item.plain_text).join("") ?? "";

const mapRichText = (items: RichTextItemResponse[] | undefined): NotionRichText[] =>
	(items ?? []).map((item) => ({
		plainText: item.plain_text,
		href: item.href,
		annotations: item.annotations,
	}));

const blocksToText = (blocks: NotionContentBlock[]): string =>
	blocks
		.flatMap((block) => [block.richText.map((item) => item.plainText).join(""), blocksToText(block.children)])
		.filter(Boolean)
		.join("\n\n");

const blockIcon = (icon: { type?: string; emoji?: string; external?: { url?: string }; file?: { url?: string } } | undefined): NotionIcon | null => {
	if (icon?.type === "emoji" && icon.emoji) return { type: "emoji", value: icon.emoji };
	if (icon?.type === "external" && icon.external?.url) return { type: "external", url: icon.external.url };
	if (icon?.type === "file" && icon.file?.url) return { type: "file", url: icon.file.url };
	return null;
};

const propertyText = (property: NotionProperty | undefined): string => {
	if (!property) return "";
	if (property.type === "title") return richText(property.title);
	if (property.type === "rich_text") return richText(property.rich_text);
	if (property.type === "select") return property.select?.name ?? "";
	if (property.type === "status") return property.status?.name ?? "";
	if (property.type === "multi_select") return property.multi_select.map((item) => item.name).join(", ");
	if (property.type === "people") return property.people.map((person) => ("name" in person ? person.name ?? "" : "")).filter(Boolean).join(", ");
	if (property.type === "url") return property.url ?? "";
	if (property.type === "email") return property.email ?? "";
	if (property.type === "formula" && property.formula.type === "string") return property.formula.string ?? "";
	return "";
};

const propertyBoolean = (property: NotionProperty | undefined): boolean => {
	if (!property) return false;
	if (property.type === "checkbox") return property.checkbox;
	if (property.type === "formula" && property.formula.type === "boolean") return property.formula.boolean ?? false;
	return ["true", "published", "yes"].includes(propertyText(property).toLowerCase());
};

const propertyDate = (property: NotionProperty | undefined): string | null => {
	if (!property) return null;
	if (property.type === "date") return property.date?.start ?? null;
	if (property.type === "created_time") return property.created_time;
	return propertyText(property) || null;
};

const propertyMultiText = (property: NotionProperty | undefined): string[] => {
	if (!property) return [];
	if (property.type === "multi_select") return property.multi_select.map((item) => item.name);
	if (property.type === "relation") return property.relation.map((item) => item.id);
	const value = propertyText(property);
	return value ? value.split(",").map((item) => item.trim()).filter(Boolean) : [];
};

const propertyUrl = (property: NotionProperty | undefined): string | null => propertyText(property) || null;

const pageIcon = (page: NotionPage): string | null => {
	if (!page.icon) return null;
	if (page.icon.type === "emoji") return page.icon.emoji;
	if (page.icon.type === "external") return page.icon.external.url;
	if (page.icon.type === "file") return page.icon.file.url;
	return null;
};

const imageUrl = (property: NotionProperty | undefined): string | null => {
	if (!property) return null;
	if (property.type === "url") return property.url;
	if (property.type === "files") {
		const file = property.files[0];
		if (!file) return null;
		return file.type === "external" ? file.external.url : file.file.url;
	}
	return propertyText(property) || null;
};

const personAvatar = (property: NotionProperty | undefined): string | null => {
	if (!property || property.type !== "people") return null;
	const person = property.people[0];
	return person && "avatar_url" in person ? person.avatar_url ?? null : null;
};

export class NotionService {
	private client: Client | undefined;
	private databaseId: string | undefined;
	private readonly dataSourceIds = new Map<string, string>();

	constructor() {
		for (const [collection, id] of Object.entries(notionDataSourceEnv)) if (id) this.dataSourceIds.set(collection, id);
	}

	private getClient(): Client {
		if (!this.client || !this.databaseId) {
			const env = getNotionEnv();
			this.client = new Client({
				auth: env.token,
				timeoutMs: 15_000,
				retry: { maxRetries: 1, maxRetryDelayMs: 2_000 },
				// Callers handle failures; never log SDK request or response details.
				logger: () => undefined,
			});
			this.databaseId = env.databaseId;
		}
		return this.client;
	}

	private async getDataSourceId(collection: keyof typeof notionDataSourceEnv): Promise<string> {
		const configuredId = this.dataSourceIds.get(collection);
		if (configuredId) {
			try {
				const database = await this.getClient().databases.retrieve({ database_id: configuredId });
				if (database.object === "database" && "data_sources" in database && database.data_sources.length > 0) {
					const dataSourceId = database.data_sources[0].id;
					this.dataSourceIds.set(collection, dataSourceId);
					return dataSourceId;
				}
			} catch {
				// The configured value may already be a data source ID.
			}
			return configuredId;
		}

		try {
			const database = await this.getClient().databases.retrieve({ database_id: this.databaseId as string });
			if (database.object !== "database" || !("data_sources" in database) || database.data_sources.length === 0) {
				throw new NotionServiceError(`No data source found for ${collection}`);
			}
			const dataSourceId = database.data_sources[0].id;
			this.dataSourceIds.set(collection, dataSourceId);
			return dataSourceId;
		} catch (error) {
			if (error instanceof NotionServiceError) throw error;
			throw new NotionServiceError(`Unable to resolve Notion data source for ${collection}`, { cause: error });
		}
	}

	private async queryPages(collection: keyof typeof notionDataSourceEnv): Promise<NotionPage[]> {
		try {
			const dataSourceId = await this.getDataSourceId(collection);
			const pages: NotionPage[] = [];
			let cursor: string | undefined;

			do {
				const response = await this.getClient().dataSources.query({
					data_source_id: dataSourceId,
					...(cursor ? { start_cursor: cursor } : {}),
					page_size: 100,
				});
				pages.push(...response.results.filter((page): page is NotionPage => page.object === "page" && isFullPage(page)));
				cursor = response.has_more && response.next_cursor ? response.next_cursor : undefined;
			} while (cursor);

			return pages;
		} catch (error) {
			if (error instanceof NotionServiceError) throw error;
			throw new NotionServiceError(`Unable to query Notion ${collection}`, { cause: error });
		}
	}

	private async getContent(blockId: string): Promise<NotionContentBlock[]> {
		try {
			const blocks: BlockObjectResponse[] = [];
			let cursor: string | undefined;
			do {
				const response = await this.getClient().blocks.children.list({
					block_id: blockId,
					page_size: 100,
					...(cursor ? { start_cursor: cursor } : {}),
				});
				blocks.push(...response.results.filter((block): block is BlockObjectResponse => "type" in block));
				cursor = response.has_more && response.next_cursor ? response.next_cursor : undefined;
			} while (cursor);

			return Promise.all(blocks.map(async (block) => {
				const value = block as unknown as Record<string, unknown>;
				const data = (value[block.type] ?? {}) as Record<string, unknown>;
				const rawRichText = (data.rich_text ?? []) as RichTextItemResponse[];
				const rawCaption = (data.caption ?? []) as RichTextItemResponse[];
				const source = data.type === "external" || data.type === "file" ? data.type : undefined;
				const file = source === "external"
					? (data.external as { url?: string } | undefined)?.url
					: source === "file"
						? (data.file as { url?: string } | undefined)?.url
						: undefined;
				const icon = data.icon as { type?: string; emoji?: string; external?: { url?: string }; file?: { url?: string } } | undefined;
				return {
					id: block.id,
					type: block.type,
					richText: mapRichText(rawRichText),
					children: block.has_children ? await this.getContent(block.id) : [],
					...(typeof data.color === "string" ? { color: data.color } : {}),
					...(typeof data.checked === "boolean" ? { checked: data.checked } : {}),
					...(block.type === "code" ? { code: richText(rawRichText) } : {}),
					...(typeof data.language === "string" ? { language: data.language } : {}),
					...(rawCaption.length ? { caption: mapRichText(rawCaption) } : {}),
					...(typeof data.url === "string" ? { url: data.url } : file ? { url: file } : {}),
					...(source ? { source } : {}),
					...(icon ? { icon: blockIcon(icon) } : {}),
				} satisfies NotionContentBlock;
			}));
		} catch (error) {
			throw new NotionServiceError("Unable to load Notion page content", { cause: error });
		}
	}

	private async mapPost(
		page: NotionPage,
		includeContent = false,
		authorLookup?: Map<string, NotionAuthor>,
		categoryLookup?: Map<string, string>,
		tagLookup?: Map<string, string>,
	): Promise<Post> {
		const { properties } = page;
		const authorProperty = firstProperty(properties, notionPropertyNames.author);
		const authorRelationId = authorProperty?.type === "relation" ? authorProperty.relation[0]?.id : undefined;
		const relatedAuthor = authorRelationId ? authorLookup?.get(authorRelationId) : undefined;
		const categoryProperty = firstProperty(properties, notionPropertyNames.category);
		const categoryRelationId = categoryProperty?.type === "relation" ? categoryProperty.relation[0]?.id : undefined;
		const tagProperty = firstProperty(properties, notionPropertyNames.tags);
		const rawTags = propertyMultiText(tagProperty);
		const description = propertyText(firstProperty(properties, notionPropertyNames.description));
		const contentBlocks = includeContent ? await this.getContent(page.id) : undefined;
		const content = contentBlocks ? blocksToText(contentBlocks) : propertyText(firstProperty(properties, notionPropertyNames.content));
		return {
			id: page.id,
			title: propertyText(firstProperty(properties, notionPropertyNames.title)),
			slug: propertyText(firstProperty(properties, notionPropertyNames.slug)),
			excerpt: description || propertyText(firstProperty(properties, notionPropertyNames.excerpt)),
			content,
			...(contentBlocks ? { contentBlocks } : {}),
			thumbnailImage: imageUrl(firstProperty(properties, notionPropertyNames.thumbnailImage)),
			coverImage: imageUrl(firstProperty(properties, notionPropertyNames.coverImage)) ?? (page.cover?.type === "external" ? page.cover.external.url : page.cover?.type === "file" ? page.cover.file.url : null),
			category: categoryRelationId ? categoryLookup?.get(categoryRelationId) ?? null : propertyText(categoryProperty) || null,
			tags: tagProperty?.type === "relation"
				? rawTags.flatMap((id) => {
					const name = tagLookup?.get(id);
					return name ? [name] : [];
				})
				: rawTags,
			authorName: relatedAuthor?.name ?? (propertyText(authorProperty) || null),
			authorAvatar: relatedAuthor?.avatar ?? personAvatar(authorProperty),
			createdAt: page.created_time,
			publishedAt: propertyDate(firstProperty(properties, notionPropertyNames.publishedAt)),
			updatedAt: page.last_edited_time,
			featured: propertyBoolean(firstProperty(properties, notionPropertyNames.featured)),
			published: propertyBoolean(firstProperty(properties, notionPropertyNames.published)),
			url: page.url,
		};
	}

	async getPosts(): Promise<Post[]> {
		const [pages, authors, categories, tags] = await Promise.all([
			this.queryPages("posts"),
			this.getAuthors().catch(() => [] as NotionAuthor[]),
			this.getCategories().catch(() => [] as NotionCategory[]),
			this.getTags().catch(() => [] as NotionTag[]),
		]);
		const authorLookup = new Map(authors.map((author) => [author.id, author]));
		const categoryLookup = new Map(categories.map((category) => [category.id, category.name]));
		const tagLookup = new Map(tags.map((tag) => [tag.id, tag.name]));
		return Promise.all(pages.map((page) => this.mapPost(page, false, authorLookup, categoryLookup, tagLookup)));
	}

	async getPostBySlug(slug: string): Promise<Post | null> {
		const page = (await this.queryPages("posts")).find((item) => propertyText(firstProperty(item.properties, notionPropertyNames.slug)) === slug);
		if (!page) return null;
		const [authors, categories, tags] = await Promise.all([
			this.getAuthors().catch(() => [] as NotionAuthor[]),
			this.getCategories().catch(() => [] as NotionCategory[]),
			this.getTags().catch(() => [] as NotionTag[]),
		]);
		return this.mapPost(
			page,
			true,
			new Map(authors.map((author) => [author.id, author])),
			new Map(categories.map((category) => [category.id, category.name])),
			new Map(tags.map((tag) => [tag.id, tag.name])),
		);
	}

	async getFeaturedPosts(): Promise<Post[]> {
		return Promise.all(
			(await this.queryPages("posts"))
				.filter((page) => propertyBoolean(firstProperty(page.properties, notionPropertyNames.featured)))
				.map((page) => this.mapPost(page)),
		);
	}

	async getCategories(): Promise<NotionCategory[]> {
		return (await this.queryPages("categories")).map((page) => ({ id: page.id, name: propertyText(firstProperty(page.properties, notionPropertyNames.title)), slug: propertyText(firstProperty(page.properties, notionPropertyNames.slug)), description: propertyText(firstProperty(page.properties, notionPropertyNames.description)), icon: pageIcon(page), url: page.url }));
	}

	async getTags(): Promise<NotionTag[]> {
		return (await this.queryPages("tags")).map((page) => ({ id: page.id, name: propertyText(firstProperty(page.properties, notionPropertyNames.title)), slug: propertyText(firstProperty(page.properties, notionPropertyNames.slug)), description: propertyText(firstProperty(page.properties, notionPropertyNames.description)), icon: pageIcon(page), url: page.url }));
	}

	async getAuthors(): Promise<NotionAuthor[]> {
		return (await this.queryPages("authors")).map((page) => ({
			id: page.id,
			name: propertyText(firstProperty(page.properties, notionPropertyNames.title)),
			bio: propertyText(firstProperty(page.properties, notionPropertyNames.bio)),
			avatar: imageUrl(firstProperty(page.properties, notionPropertyNames.avatar)) ?? pageIcon(page),
			url: page.url,
		}));
	}

	async getProjects(): Promise<Project[]> {
		return Promise.all((await this.queryPages("projects")).map((page) => this.mapProject(page)));
	}

	async getProjectBySlug(slug: string): Promise<Project | null> {
		const page = (await this.queryPages("projects")).find((item) => propertyText(firstProperty(item.properties, notionPropertyNames.slug)) === slug);
		return page ? this.mapProject(page, true) : null;
	}

	private async mapProject(page: NotionPage, includeContent = false): Promise<Project> {
		const { properties } = page;
		const contentBlocks = includeContent ? await this.getContent(page.id) : undefined;
		return {
			id: page.id,
			title: propertyText(firstProperty(properties, notionPropertyNames.title)),
			slug: propertyText(firstProperty(properties, notionPropertyNames.slug)),
			description: propertyText(firstProperty(properties, notionPropertyNames.description)),
			content: contentBlocks ? blocksToText(contentBlocks) : propertyText(firstProperty(properties, notionPropertyNames.content)),
			...(contentBlocks ? { contentBlocks } : {}),
			thumbnailImage: imageUrl(firstProperty(properties, notionPropertyNames.thumbnailImage)),
			coverImage: imageUrl(firstProperty(properties, notionPropertyNames.coverImage)) ?? (page.cover?.type === "external" ? page.cover.external.url : page.cover?.type === "file" ? page.cover.file.url : null),
			techStack: propertyMultiText(firstProperty(properties, notionPropertyNames.techStack)),
			tags: propertyMultiText(firstProperty(properties, notionPropertyNames.tags)),
			githubUrl: propertyUrl(firstProperty(properties, notionPropertyNames.githubUrl)),
			liveUrl: propertyUrl(firstProperty(properties, notionPropertyNames.liveUrl)),
			role: propertyText(firstProperty(properties, notionPropertyNames.role)) || null,
			timeline: propertyText(firstProperty(properties, notionPropertyNames.timeline)) || null,
			status: propertyText(firstProperty(properties, notionPropertyNames.status)) || null,
			featured: propertyBoolean(firstProperty(properties, notionPropertyNames.featured)),
			published: propertyBoolean(firstProperty(properties, notionPropertyNames.published)),
			createdAt: page.created_time,
			updatedAt: page.last_edited_time,
			url: page.url,
		};
	}
}

export const notionService = new NotionService();
