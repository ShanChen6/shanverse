import type { SocialLink } from "@/constants/social";

function safeWebUrl(value: string | undefined) {
  if (!value?.trim()) return null;
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function safeEmail(value: string | undefined) {
  const email = value?.trim();
  return email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(email) ? email : null;
}

export function getSocialLinks(): SocialLink[] {
  const candidates = [
    { label: "GitHub" as const, value: process.env.CONTACT_GITHUB_URL },
    { label: "LinkedIn" as const, value: process.env.CONTACT_LINKEDIN_URL },
    { label: "Facebook" as const, value: process.env.CONTACT_FACEBOOK_URL },
    { label: "Instagram" as const, value: process.env.CONTACT_INSTAGRAM_URL },
  ];
  const links: SocialLink[] = candidates.flatMap(({ label, value }) => {
    const href = safeWebUrl(value);
    return href ? [{ label, href }] : [];
  });
  const email = safeEmail(process.env.CONTACT_EMAIL);
  if (email) links.push({ label: "Email", href: `mailto:${email}` });
  return links;
}
