import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";

import { Client, isFullBlock, isFullPage } from "@notionhq/client";
import type {
  BlockObjectResponse,
  PageObjectResponse,
  RichTextItemResponse,
} from "@notionhq/client/build/src/api-endpoints";

type NotionProperty = PageObjectResponse["properties"][string];

const WORDS_PER_MINUTE = 200;
const CONCURRENCY = 2;
const TEXT_BLOCK_TYPES = new Set([
  "paragraph",
  "heading_1",
  "heading_2",
  "heading_3",
  "bulleted_list_item",
  "numbered_list_item",
  "to_do",
  "quote",
  "callout",
  "code",
  "toggle",
]);

function loadLocalEnvironment() {
  for (const filename of [".env.local", ".env"]) {
    if (existsSync(filename)) loadEnvFile(filename);
  }
}

function firstProperty(
  properties: PageObjectResponse["properties"],
  names: readonly string[],
) {
  for (const name of names) {
    const property = properties[name];
    if (property) return { name, property };
  }
  return null;
}

function propertyBoolean(property: NotionProperty | undefined): boolean {
  if (!property) return false;
  if (property.type === "checkbox") return property.checkbox;
  return (
    property.type === "formula" &&
    property.formula.type === "boolean" &&
    property.formula.boolean === true
  );
}

function propertyNumber(property: NotionProperty | undefined): number | null {
  if (!property) return null;
  if (property.type === "number") return property.number;
  if (property.type === "formula" && property.formula.type === "number") {
    return property.formula.number;
  }
  return null;
}

function richTextValue(items: RichTextItemResponse[] | undefined): string {
  return items?.map((item) => item.plain_text).join("") ?? "";
}

function blockText(block: BlockObjectResponse): string {
  if (!TEXT_BLOCK_TYPES.has(block.type)) return "";

  const data = (block as unknown as Record<string, unknown>)[block.type] as
    | { rich_text?: RichTextItemResponse[] }
    | undefined;
  return richTextValue(data?.rich_text);
}

function calculateReadingTime(text: string): number {
  const normalized = text.replace(/\s+/gu, " ").trim();
  const wordCount = normalized ? normalized.split(" ").length : 0;
  return Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));
}

async function readBlockText(client: Client, blockId: string): Promise<string[]> {
  const text: string[] = [];
  let cursor: string | undefined;

  do {
    const response = await client.blocks.children.list({
      block_id: blockId,
      page_size: 100,
      ...(cursor ? { start_cursor: cursor } : {}),
    });

    for (const result of response.results) {
      if (!isFullBlock(result)) continue;
      const value = blockText(result);
      if (value.trim()) text.push(value);
      if (result.has_children) {
        text.push(...(await readBlockText(client, result.id)));
      }
    }

    cursor =
      response.has_more && response.next_cursor
        ? response.next_cursor
        : undefined;
  } while (cursor);

  return text;
}

async function resolvePostsDataSourceId(client: Client): Promise<string> {
  const configuredId =
    process.env.NOTION_POSTS_DATA_SOURCE_ID ?? process.env.NOTION_DATABASE_ID;
  if (!configuredId) {
    throw new Error(
      "NOTION_POSTS_DATA_SOURCE_ID or NOTION_DATABASE_ID is required.",
    );
  }

  try {
    const database = await client.databases.retrieve({
      database_id: configuredId,
    });
    if (
      database.object === "database" &&
      "data_sources" in database &&
      database.data_sources.length > 0
    ) {
      return database.data_sources[0].id;
    }
  } catch {
    // The configured value may already be a data source ID.
  }

  return configuredId;
}

async function queryAllPosts(
  client: Client,
  dataSourceId: string,
): Promise<PageObjectResponse[]> {
  const pages: PageObjectResponse[] = [];
  let cursor: string | undefined;

  do {
    const response = await client.dataSources.query({
      data_source_id: dataSourceId,
      page_size: 100,
      ...(cursor ? { start_cursor: cursor } : {}),
    });
    pages.push(
      ...response.results.filter(
        (result): result is PageObjectResponse => isFullPage(result),
      ),
    );
    cursor =
      response.has_more && response.next_cursor
        ? response.next_cursor
        : undefined;
  } while (cursor);

  return pages;
}

async function runWithConcurrency<T>(
  items: T[],
  worker: (item: T, index: number) => Promise<void>,
) {
  let nextIndex = 0;
  const workers = Array.from(
    { length: Math.min(CONCURRENCY, items.length) },
    async () => {
      while (nextIndex < items.length) {
        const index = nextIndex;
        nextIndex += 1;
        await worker(items[index], index);
      }
    },
  );
  await Promise.all(workers);
}

async function main() {
  loadLocalEnvironment();
  const token = process.env.NOTION_TOKEN;
  if (!token) throw new Error("NOTION_TOKEN is required.");

  const { notionPropertyNames } = await import("../src/config/notion.config");
  const client = new Client({
    auth: token,
    timeoutMs: 15_000,
    retry: { maxRetries: 3, maxRetryDelayMs: 2_000 },
    logger: () => undefined,
  });
  const dryRun = process.argv.includes("--dry-run");
  const dataSourceId = await resolvePostsDataSourceId(client);
  const pages = await queryAllPosts(client, dataSourceId);
  const publishedPages = pages.filter((page) => {
    const published = firstProperty(
      page.properties,
      notionPropertyNames.published,
    );
    return propertyBoolean(published?.property);
  });
  const summary = {
    scanned: publishedPages.length,
    updated: 0,
    unchanged: 0,
    failed: 0,
  };

  console.log(
    `[sync:reading-time] ${dryRun ? "Dry run" : "Update"} started for ${summary.scanned} published posts.`,
  );

  await runWithConcurrency(publishedPages, async (page, index) => {
    try {
      const readingTime = firstProperty(
        page.properties,
        notionPropertyNames.readingTime,
      );
      if (!readingTime || readingTime.property.type !== "number") {
        throw new Error("Reading Time must be a Number property.");
      }

      const text = (await readBlockText(client, page.id)).join("\n");
      const nextValue = calculateReadingTime(text);
      const currentValue = propertyNumber(readingTime.property);

      if (currentValue === nextValue) {
        summary.unchanged += 1;
        return;
      }

      if (!dryRun) {
        await client.pages.update({
          page_id: page.id,
          properties: {
            [readingTime.name]: { number: nextValue },
          },
        });
      }
      summary.updated += 1;
    } catch (error) {
      summary.failed += 1;
      const errorName = error instanceof Error ? error.name : "UnknownError";
      console.error(
        `[sync:reading-time] Post ${index + 1} failed (${errorName}).`,
      );
    }
  });

  console.log("[sync:reading-time] Summary");
  console.log(`scanned: ${summary.scanned}`);
  console.log(`updated: ${summary.updated}`);
  console.log(`unchanged: ${summary.unchanged}`);
  console.log(`failed: ${summary.failed}`);

  if (summary.failed > 0) process.exitCode = 1;
}

main().catch((error: unknown) => {
  const errorName = error instanceof Error ? error.name : "UnknownError";
  console.error(`[sync:reading-time] Fatal error (${errorName}).`);
  process.exitCode = 1;
});
