import "server-only";

export type ContactConfig = {
  email: string | null;
  location: string | null;
  socials: Array<{
    label: "GitHub" | "LinkedIn" | "Facebook";
    href: string;
  }>;
};

function email(value: string | undefined) {
  const normalized = value?.trim();
  return normalized && /^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(normalized)
    ? normalized
    : null;
}

function webUrl(value: string | undefined) {
  if (!value?.trim()) return null;
  try {
    const url = new URL(value.trim());
    return ["http:", "https:"].includes(url.protocol) ? url.toString() : null;
  } catch {
    return null;
  }
}

export function getContactConfig(): ContactConfig {
  const candidates = [
    { label: "GitHub" as const, href: webUrl(process.env.CONTACT_GITHUB_URL) },
    { label: "LinkedIn" as const, href: webUrl(process.env.CONTACT_LINKEDIN_URL) },
    { label: "Facebook" as const, href: webUrl(process.env.CONTACT_FACEBOOK_URL) },
  ];

  return {
    email: email(process.env.CONTACT_EMAIL),
    location: process.env.CONTACT_LOCATION?.trim() || null,
    socials: candidates.flatMap(({ label, href }) =>
      href ? [{ label, href }] : [],
    ),
  };
}
