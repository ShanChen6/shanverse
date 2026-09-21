export type SharePostPayload = {
  title: string;
  text: string;
  url: string;
};

type ShareCapabilities = {
  share?: (payload: SharePostPayload) => Promise<void>;
  writeText?: (value: string) => Promise<void>;
};

export type SharePostResult = "shared" | "copied" | "cancelled" | "failed";

function isAbortError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    error.name === "AbortError"
  );
}

export async function sharePost(
  payload: SharePostPayload,
  capabilities: ShareCapabilities,
): Promise<SharePostResult> {
  if (capabilities.share) {
    try {
      await capabilities.share(payload);
      return "shared";
    } catch (error) {
      if (isAbortError(error)) return "cancelled";
    }
  }

  if (!capabilities.writeText) return "failed";
  try {
    await capabilities.writeText(payload.url);
    return "copied";
  } catch {
    return "failed";
  }
}

export function createSocialShareUrls({
  title,
  canonicalUrl,
}: {
  title: string;
  canonicalUrl: string;
}) {
  const encodedUrl = encodeURIComponent(canonicalUrl);
  const encodedTitle = encodeURIComponent(title);
  return {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedIn: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    x: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
  };
}
