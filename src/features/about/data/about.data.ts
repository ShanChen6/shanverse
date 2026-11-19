// Visible text lives in i18n/messages/*/about.ts; these lists only fix the
// order and the message keys.
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

export const productPrinciples: PrincipleKey[] = ["understand", "systematic", "experience", "improve"];

export const journey: { key: JourneyKey; hasOrganization?: true }[] = [
  { key: "university", hasOrganization: true },
  { key: "frontend" },
  { key: "products" },
  { key: "shanverse" },
];

export const values: ValueKey[] = ["learning", "userFirst", "cleanCode", "sharing"];

