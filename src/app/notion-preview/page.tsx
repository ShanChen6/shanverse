import React from "react";
import Link from "next/link";
import styles from "./page.module.css";

import { notionService } from "@/services/notion.service";
import type { NotionAuthor, NotionCategory, NotionTag } from "@/types/notion";
import type { Post } from "@/types/post";
import type { Project } from "@/types/project";

export const dynamic = "force-dynamic";

type CollectionResult = {
  label: string;
  status: "connected" | "empty" | "error";
  count: number;
  sample: string;
  error?: string;
};

type PostDetailResult = {
  status: "connected" | "not-found" | "skipped" | "error";
  slug: string;
  post: Post | null;
  error?: string;
};

const toResult = <T,>(
  label: string,
  result: PromiseSettledResult<T[]>,
  getSample: (item: T) => string,
): CollectionResult => {
  if (result.status === "rejected") {
    return {
      label,
      status: "error",
      count: 0,
      sample: "No data returned",
      error:
        result.reason instanceof Error
          ? result.reason.message
          : "Unknown Notion error",
    };
  }

  const items = result.value;
  return {
    label,
    status: items.length > 0 ? "connected" : "empty",
    count: items.length,
    sample:
      items.length > 0 ? getSample(items[0]) : "No rows in this collection",
  };
};

const StatusPill = ({ status }: { status: CollectionResult["status"] }) => (
  <span
    className={`${styles.status} ${styles[`status${status[0].toUpperCase()}${status.slice(1)}`]}`}
  >
    {status === "connected"
      ? "Connected"
      : status === "empty"
        ? "Connected, empty"
        : "Error"}
  </span>
);

const PreviewCard = ({ result }: { result: CollectionResult }) => (
  <article className={styles.card}>
    <div className={styles.cardHeader}>
      <h2>{result.label}</h2>
      <StatusPill status={result.status} />
    </div>
    <p className={styles.count}>{result.count} records</p>
    <p className={styles.sample}>{result.sample}</p>
    {result.error ? <p className={styles.error}>{result.error}</p> : null}
  </article>
);

const PostDetailCard = ({ result }: { result: PostDetailResult }) => (
  <article className={styles.detailCard}>
    <div className={styles.cardHeader}>
      <h2>Post detail</h2>
      <span
        className={`${styles.status} ${styles[`status${result.status[0].toUpperCase()}${result.status.slice(1).replace("-", "")}`]}`}
      >
        {result.status === "connected"
          ? "Found"
          : result.status === "not-found"
            ? "Not found"
            : result.status === "skipped"
              ? "Skipped"
              : "Error"}
      </span>
    </div>
    <p className={styles.detailSlug}>
      Slug: {result.slug || "No slug selected"}
    </p>
    {result.post ? (
      <div className={styles.detailContent}>
        <h3>{result.post.title || "Untitled post"}</h3>
        <p>{result.post.excerpt || "No excerpt returned"}</p>
        <div className={styles.metaRow}>
          <span>{result.post.category || "Uncategorized"}</span>
          <span>{result.post.published ? "Published" : "Draft"}</span>
          <span>{result.post.tags.length} tags</span>
        </div>
        <div className={styles.postBody}>
          {result.post.content || "No content returned"}
        </div>
      </div>
    ) : null}
    {result.error ? <p className={styles.error}>{result.error}</p> : null}
  </article>
);

const PostList = ({
  posts,
  selectedSlug,
}: {
  posts: Post[];
  selectedSlug: string;
}) => (
  <div className={styles.postList}>
    <div className={styles.listHeader}>
      <div>
        <p className={styles.eyebrow}>From Notion</p>
        <h2 className={styles.sectionTitle}>Post list</h2>
      </div>
      <span className={styles.listCount}>{posts.length} posts</span>
    </div>
    {posts.length > 0 ? (
      <div className={styles.postItems}>
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/notion-preview?slug=${encodeURIComponent(post.slug)}`}
            className={`${styles.postItem} ${post.slug === selectedSlug ? styles.postItemActive : ""}`}
          >
            <span className={styles.postItemTitle}>
              {post.title || "Untitled post"}
            </span>
            <span className={styles.postItemMeta}>
              {post.slug || "No slug"}
            </span>
          </Link>
        ))}
      </div>
    ) : (
      <p className={styles.emptyState}>No posts returned from Notion.</p>
    )}
  </div>
);

type NotionPreviewPageProps = {
  searchParams: Promise<{ slug?: string }>;
};

export default async function NotionPreviewPage({
  searchParams,
}: NotionPreviewPageProps) {
  const { slug: requestedSlug = "" } = await searchParams;
  const postsResult = await notionService.getPosts().then(
    (posts) => ({ status: "fulfilled" as const, value: posts }),
    (reason) => ({ status: "rejected" as const, reason }),
  );
  const selectedSlug =
    requestedSlug ||
    (postsResult.status === "fulfilled"
      ? postsResult.value[0]?.slug || ""
      : "");
  const postDetailResult: PostDetailResult = selectedSlug
    ? await notionService.getPostBySlug(selectedSlug).then(
        (post) => ({
          status: post ? ("connected" as const) : ("not-found" as const),
          slug: selectedSlug,
          post,
        }),
        (reason) => ({
          status: "error" as const,
          slug: selectedSlug,
          post: null,
          error:
            reason instanceof Error ? reason.message : "Unknown Notion error",
        }),
      )
    : {
        status: postsResult.status === "rejected" ? "error" : "skipped",
        slug: "",
        post: null,
        ...(postsResult.status === "rejected"
          ? {
              error:
                postsResult.reason instanceof Error
                  ? postsResult.reason.message
                  : "Unknown Notion error",
            }
          : {}),
      };

  const results = await Promise.allSettled([
    notionService.getCategories(),
    notionService.getTags(),
    notionService.getProjects(),
    notionService.getAuthors(),
  ]);

  const cards = [
    toResult<Post>(
      "Posts",
      postsResult,
      (post) => post.title || "Untitled post",
    ),
    toResult<NotionCategory>(
      "Categories",
      results[0],
      (category) => category.name || "Untitled category",
    ),
    toResult<NotionTag>(
      "Tags",
      results[1],
      (tag) => tag.name || "Untitled tag",
    ),
    toResult<Project>(
      "Projects",
      results[2],
      (project) => project.title || "Untitled project",
    ),
    toResult<NotionAuthor>(
      "Authors",
      results[3],
      (author) => author.name || "Untitled author",
    ),
  ];
  const hasError = cards.some((card) => card.status === "error");
  const connectedCount = cards.filter((card) => card.status !== "error").length;

  return (
    <main className={styles.preview}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>CMS integration check</p>
          <h1>Notion API Preview</h1>
          <p className={styles.intro}>
            Live server-side check of the normalized data returned by the Notion
            service.
          </p>
          <div
            className={`${styles.summary} ${hasError ? styles.summaryError : ""}`}
          >
            <span className={styles.summaryDot} />
            {hasError
              ? `${connectedCount}/${cards.length} collections responded`
              : "Notion API is reachable"}
          </div>
        </header>

        <section className={styles.grid} aria-label="Notion collection status">
          {cards.map((card) => (
            <PreviewCard key={card.label} result={card} />
          ))}
        </section>

        <section
          className={styles.detailSection}
          aria-label="Post list and detail preview"
        >
          <div className={styles.previewHeading}>
            <p className={styles.eyebrow}>Live content preview</p>
            <h2 className={styles.sectionTitle}>Get post list and detail</h2>
            <p className={styles.sectionIntro}>
              Select a post to call <code>getPostBySlug()</code>. The detail
              panel renders the normalized content from Notion.
            </p>
          </div>
          <div className={styles.postPreviewGrid}>
            <PostList
              posts={
                postsResult.status === "fulfilled" ? postsResult.value : []
              }
              selectedSlug={selectedSlug}
            />
            <PostDetailCard result={postDetailResult} />
          </div>
        </section>

        <footer className={styles.footer}>
          <span>Server-rendered</span>
          <span aria-hidden="true">·</span>
          <span>Secrets are never displayed</span>
        </footer>
      </div>
    </main>
  );
}
