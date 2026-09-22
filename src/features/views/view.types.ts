export interface ViewStore {
  get(slug: string): Promise<number>;
  increment(slug: string): Promise<number>;
}

export class ViewStoreUnavailableError extends Error {
  constructor() {
    super("View store is unavailable");
    this.name = "ViewStoreUnavailableError";
  }
}

export class ViewRateLimitError extends Error {
  constructor() {
    super("View increment rate limit exceeded");
    this.name = "ViewRateLimitError";
  }
}
