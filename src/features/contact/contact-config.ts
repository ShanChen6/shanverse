import "server-only";

import { getSocialLinks } from "@/config/social.config";
import type { SocialLink } from "@/constants/social";

type ContactSocialLink = SocialLink & {
  label: Exclude<SocialLink["label"], "Email">;
};

export type ContactConfig = {
  email: string | null;
  location: string | null;
  socials: ContactSocialLink[];
};

function email(value: string | undefined) {
  const normalized = value?.trim();
  return normalized && /^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(normalized)
    ? normalized
    : null;
}

export function getContactConfig(): ContactConfig {
  const socials = getSocialLinks().filter(
    (link): link is ContactSocialLink => link.label !== "Email",
  );

  return {
    email: email(process.env.CONTACT_EMAIL),
    location: process.env.CONTACT_LOCATION?.trim() || null,
    socials,
  };
}
