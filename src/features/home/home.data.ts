export type HeroData = {
  badge: string;
  greeting: string;
  name: string;
  typewriterItems: string[];
  description: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
};

export const HOME_HERO: HeroData = {
  badge: "Available for work",
  greeting: "Hi! I'm",
  name: "ShanDev",
  typewriterItems: [
    "a Software Developer",
    "a Full-stack Engineer",
    "a Tech Creator",
  ],
  description:
    "I'm a software engineer building full-stack products and writing about frontend architecture, backend systems, and practical AI workflows. I care about interfaces that stay readable as products grow.",
  primaryCta: { label: "About Me", href: "/about" },
  secondaryCta: { label: "Contact", href: "/contact" },
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
