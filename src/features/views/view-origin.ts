type ViewOriginInput = {
  origin: string | null;
  requestUrl: string;
  host: string | null;
  forwardedHost: string | null;
  forwardedProto: string | null;
  siteUrl?: string;
  environment: "development" | "production" | "test";
};

function parsedOrigin(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol)) return null;
    return url.origin;
  } catch {
    return null;
  }
}

function originForHost(protocol: string, host: string | null): string | null {
  if (!host || /[\s/?#]/u.test(host)) return null;
  return parsedOrigin(`${protocol}//${host}`);
}

export function isAllowedViewOrigin(input: ViewOriginInput): boolean {
  const origin = parsedOrigin(input.origin);
  if (!origin) return false;

  const siteOrigin = parsedOrigin(input.siteUrl);
  if (input.environment === "production") {
    return Boolean(siteOrigin && origin === siteOrigin);
  }

  const request = new URL(input.requestUrl);
  const protocol = input.forwardedProto === "http" ? "http:" : input.forwardedProto === "https" ? "https:" : request.protocol;
  const allowed = new Set<string>([request.origin]);
  const hostOrigin = originForHost(protocol, input.host);
  const forwardedOrigin = originForHost(protocol, input.forwardedHost);
  if (hostOrigin) allowed.add(hostOrigin);
  if (forwardedOrigin) allowed.add(forwardedOrigin);
  if (siteOrigin) allowed.add(siteOrigin);
  return allowed.has(origin);
}
