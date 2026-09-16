export const SOCIAL_PLATFORMS = [
  "GitHub",
  "LinkedIn",
  "Facebook",
  "Instagram",
] as const;

export type SocialLabel = (typeof SOCIAL_PLATFORMS)[number];

export type SocialLink = {
  label: SocialLabel | "Email";
  href: string;
};
