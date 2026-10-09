// Visible hero copy is localized in i18n/messages/*/home.ts (keys `home.hero*`).
export type HeroData = {
  name: string;
  primaryCta: { href: string };
  secondaryCta: { href: string };
};

export const HOME_HERO: HeroData = {
  name: "ShanDev",
  primaryCta: { href: "/about" },
  secondaryCta: { href: "/contact" },
};

export type HeroCodeProfile = {
  name: string;
  role: string;
  experience: string;
  location: string;
  focus: string;
  coffee: boolean;
  available: boolean;
};

export const HOME_HERO_CODE_PROFILE: HeroCodeProfile = {
  name: "ShanDev",
  role: "Fullstack Developer",
  experience: "3+ years",
  location: "Ha Noi",
  focus: "[Web Performance, AI, Systems]",
  coffee: true,
  available: true,
};

export const HOME_TECH_STACK = [
  "HTML",
  "CSS",
  "JavaScript",
  "TypeScript",
  "React",
  "Next.js",
  "Tailwind CSS",
  "Node.js",
  "NestJS",
  "Git",
  "GitHub",
  "Notion API",
] as const;
