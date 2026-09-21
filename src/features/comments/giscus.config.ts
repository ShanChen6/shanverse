export type GiscusConfig = {
  repo: `${string}/${string}`;
  repoId: string;
  category: string;
  categoryId: string;
};

type GiscusEnvironment = {
  enabled?: string;
  repo?: string;
  repoId?: string;
  category?: string;
  categoryId?: string;
};

export type GiscusConfigResult =
  | { enabled: false; config: null; reason: "disabled" | "invalid" }
  | { enabled: true; config: GiscusConfig; reason: null };

export function validateGiscusConfig(
  environment: GiscusEnvironment,
): GiscusConfigResult {
  if (environment.enabled?.trim().toLowerCase() !== "true") {
    return { enabled: false, config: null, reason: "disabled" };
  }

  const repo = environment.repo?.trim() ?? "";
  const repoId = environment.repoId?.trim() ?? "";
  const category = environment.category?.trim() ?? "";
  const categoryId = environment.categoryId?.trim() ?? "";
  const validRepo = /^[^/\s]+\/[^/\s]+$/u.test(repo);

  if (!validRepo || !repoId || !category || !categoryId) {
    return { enabled: false, config: null, reason: "invalid" };
  }

  return {
    enabled: true,
    config: {
      repo: repo as `${string}/${string}`,
      repoId,
      category,
      categoryId,
    },
    reason: null,
  };
}

export const giscusConfig = validateGiscusConfig({
  enabled: process.env.NEXT_PUBLIC_GISCUS_ENABLED,
  repo: process.env.NEXT_PUBLIC_GISCUS_REPO,
  repoId: process.env.NEXT_PUBLIC_GISCUS_REPO_ID,
  category: process.env.NEXT_PUBLIC_GISCUS_CATEGORY,
  categoryId: process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID,
});
