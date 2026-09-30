export const SOCIAL_PLATFORMS = [
  "GitHub",
  "Discord",
  "Reddit",
  "Twitter",
  "LinkedIn",
  "YouTube",
  "Facebook",
  "Instagram",
  "TikTok",
] as const;

export type SocialLabel = (typeof SOCIAL_PLATFORMS)[number];

export type SocialLink = {
  label: SocialLabel | "Email";
  href: string;
};
