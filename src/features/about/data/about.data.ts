import {
  Accessibility,
  Blocks,
  BookOpen,
  Code2,
  Compass,
  RefreshCw,
  Search,
  Share2,
  UserRound,
  type LucideIcon,
} from "lucide-react";

// Visible text lives in i18n/messages/*/about.ts; these lists only fix the
// order, the message keys and the icons.
export type SkillGroup = {
  key: "frontend" | "backend" | "tools" | "focus";
  skills: string[];
};
export type PrincipleKey = "understand" | "systematic" | "experience" | "improve";
export type ValueKey = "learning" | "userFirst" | "cleanCode" | "sharing";
export type JourneyKey = "university" | "frontend" | "products" | "shanverse";

export const skillGroups: SkillGroup[] = [
  {
    key: "frontend",
    skills: ["HTML", "CSS", "JavaScript", "TypeScript", "React", "Next.js", "Tailwind CSS", "Responsive Design"],
  },
  {
    key: "backend",
    skills: ["Node.js", "NestJS", "REST API", "Notion API"],
  },
  {
    key: "tools",
    skills: ["Git", "GitHub", "VS Code", "Vercel"],
  },
  {
    key: "focus",
    skills: ["UI/UX", "Accessibility", "Performance", "Design Systems", "Web Security"],
  },
];

export const productPrinciples: { key: PrincipleKey; icon: LucideIcon }[] = [
  { key: "understand", icon: Search },
  { key: "systematic", icon: Blocks },
  { key: "experience", icon: Accessibility },
  { key: "improve", icon: RefreshCw },
];

export const journey: { key: JourneyKey; hasOrganization?: true }[] = [
  { key: "university", hasOrganization: true },
  { key: "frontend" },
  { key: "products" },
  { key: "shanverse" },
];

export const values: { key: ValueKey; icon: LucideIcon }[] = [
  { key: "learning", icon: BookOpen },
  { key: "userFirst", icon: UserRound },
  { key: "cleanCode", icon: Code2 },
  { key: "sharing", icon: Share2 },
];

export const sectionIcon = Compass;
