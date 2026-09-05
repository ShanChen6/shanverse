import React from "react";
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

export default async function NotionPreviewPage() {
  const results = await Promise.allSettled([
    notionService.getPosts(),
    notionService.getCategories(),
    notionService.getTags(),
    notionService.getProjects(),
    notionService.getAuthors(),
  ]);

  const cards = [
    toResult<Post>(
      "Posts",
      results[0],
      (post) => post.title || "Untitled post",
    ),
    toResult<NotionCategory>(
      "Categories",
      results[1],
      (category) => category.name || "Untitled category",
    ),
    toResult<NotionTag>(
      "Tags",
      results[2],
      (tag) => tag.name || "Untitled tag",
    ),
    toResult<Project>(
      "Projects",
      results[3],
      (project) => project.title || "Untitled project",
    ),
    toResult<NotionAuthor>(
      "Authors",
      results[4],
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

        <footer className={styles.footer}>
          <span>Server-rendered</span>
          <span aria-hidden="true">·</span>
          <span>Secrets are never displayed</span>
        </footer>
      </div>
    </main>
  );
}
