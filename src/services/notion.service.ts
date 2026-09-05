import { Client, isFullPage } from "@notionhq/client";
import type {
	PageObjectResponse,
	RichTextItemResponse,
} from "@notionhq/client/build/src/api-endpoints";

import { notionDataSourceEnv, notionPropertyNames } from "@/config/notion.config";
import { getNotionEnv } from "@/lib/env";
import type { NotionAuthor, NotionCategory, NotionTag } from "@/types/notion";
import type { Post } from "@/types/post";
import type { Project } from "@/types/project";

type NotionProperty = PageObjectResponse["properties"][string];
type NotionPage = PageObjectResponse;

export class NotionServiceError extends Error {
	constructor(message: string, options?: { cause?: unknown }) {
		super(message, options);
		this.name = "NotionServiceError";
	}
}

const firstProperty = (properties: NotionPage["properties"], names: readonly string[]) =>
	names.map((name) => properties[name]).find(Boolean);

const richText = (value: RichTextItemResponse[] | undefined): string =>
	value?.map((item) => item.plain_text).join("") ?? "";

const propertyText = (property: NotionProperty | undefined): string => {
	if (!property) return "";
	if (property.type === "title") return richText(property.title);
	if (property.type === "rich_text") return richText(property.rich_text);
	if (property.type === "select") return property.select?.name ?? "";
	if (property.type === "status") return property.status?.name ?? "";
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
			this.client = new Client({ auth: env.token });
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
			const contentType = collection === "posts" ? "Blog" : collection === "projects" ? "Project" : undefined;

			do {
				const response = await this.getClient().dataSources.query({
					data_source_id: dataSourceId,
					...(cursor ? { start_cursor: cursor } : {}),
					page_size: 100,
					...(contentType
						? { filter: { property: notionPropertyNames.type[0], select: { equals: contentType } } }
						: {}),
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

	private async getContent(pageId: string): Promise<string> {
		try {
			const response = await this.getClient().blocks.children.list({ block_id: pageId, page_size: 100 });
			return response.results
				.map((block) => {
					  if (!("type" in block)) return "";
					  const value = block as unknown as Record<string, { rich_text?: RichTextItemResponse[] }>;
					  return richText(value[block.type]?.rich_text);
				})
				.filter(Boolean)
				.join("\n\n");
		} catch (error) {
			throw new NotionServiceError(`Unable to load content for Notion page ${pageId}`, { cause: error });
		}
	}

	private async mapPost(page: NotionPage, includeContent = false): Promise<Post> {
		const { properties } = page;
		const content = includeContent ? await this.getContent(page.id) : propertyText(firstProperty(properties, notionPropertyNames.content));
		return {
			id: page.id,
			title: propertyText(firstProperty(properties, notionPropertyNames.title)),
			slug: propertyText(firstProperty(properties, notionPropertyNames.slug)),
			excerpt: propertyText(firstProperty(properties, notionPropertyNames.excerpt)),
			content,
			coverImage: imageUrl(firstProperty(properties, notionPropertyNames.coverImage)) ?? (page.cover?.type === "external" ? page.cover.external.url : page.cover?.type === "file" ? page.cover.file.url : null),
			category: propertyText(firstProperty(properties, notionPropertyNames.category)) || null,
			tags: propertyMultiText(firstProperty(properties, notionPropertyNames.tags)),
			publishedAt: propertyDate(firstProperty(properties, notionPropertyNames.publishedAt)),
			updatedAt: page.last_edited_time,
			featured: propertyBoolean(firstProperty(properties, notionPropertyNames.featured)),
			published: propertyBoolean(firstProperty(properties, notionPropertyNames.published)),
			url: page.url,
		};
	}

	async getPosts(): Promise<Post[]> {
		return Promise.all((await this.queryPages("posts")).map((page) => this.mapPost(page)));
	}

	async getPostBySlug(slug: string): Promise<Post | null> {
		const page = (await this.queryPages("posts")).find((item) => propertyText(firstProperty(item.properties, notionPropertyNames.slug)) === slug);
		return page ? this.mapPost(page, true) : null;
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
		return {
			id: page.id,
			title: propertyText(firstProperty(properties, notionPropertyNames.title)),
			slug: propertyText(firstProperty(properties, notionPropertyNames.slug)),
			description: propertyText(firstProperty(properties, notionPropertyNames.description)),
			content: includeContent ? await this.getContent(page.id) : propertyText(firstProperty(properties, notionPropertyNames.content)),
			coverImage: imageUrl(firstProperty(properties, notionPropertyNames.coverImage)),
			category: propertyText(firstProperty(properties, notionPropertyNames.category)) || null,
			tags: propertyMultiText(firstProperty(properties, notionPropertyNames.tags)),
			githubUrl: propertyUrl(firstProperty(properties, notionPropertyNames.githubUrl)),
			liveUrl: propertyUrl(firstProperty(properties, notionPropertyNames.liveUrl)),
			featured: propertyBoolean(firstProperty(properties, notionPropertyNames.featured)),
			published: propertyBoolean(firstProperty(properties, notionPropertyNames.published)),
			createdAt: page.created_time,
			updatedAt: page.last_edited_time,
			url: page.url,
		};
	}
}

export const notionService = new NotionService();
