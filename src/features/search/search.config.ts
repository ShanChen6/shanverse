export const MIN_SEARCH_LENGTH = 2;
export const SEARCH_DEBOUNCE_MS = 180;
export const DEFAULT_SEARCH_LIMIT = 8;

export const FUSE_SEARCH_OPTIONS = {
  keys: [
    { name: "title", weight: 0.5 },
    { name: "category", weight: 0.15 },
    { name: "tags", weight: 0.15 },
    { name: "techStack", weight: 0.1 },
    { name: "description", weight: 0.1 },
  ],
  threshold: 0.35,
  ignoreLocation: true,
  ignoreDiacritics: true,
  minMatchCharLength: 2,
  includeScore: true,
  includeMatches: true,
} as const;
