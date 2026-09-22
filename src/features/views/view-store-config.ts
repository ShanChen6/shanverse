export type ViewStoreEnvironment = {
  url?: string;
  token?: string;
};

export function hasViewStoreConfig(environment: ViewStoreEnvironment): boolean {
  return Boolean(environment.url?.trim() && environment.token?.trim());
}
