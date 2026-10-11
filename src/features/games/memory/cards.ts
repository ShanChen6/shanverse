// Card faces for the memory game: technologies Shanverse writes about.
// Each face is a short monogram on the technology's familiar colour, not a
// copy of its logo, so the deck stays light and has its own look.

export type TechCard = {
  id: string;
  name: string;
  /** One to three characters shown big on the card. */
  mark: string;
  background: string;
  foreground: string;
};

export const TECH_CARDS: TechCard[] = [
  { id: "react", name: "React", mark: "⚛", background: "#20232a", foreground: "#61dafb" },
  { id: "nextjs", name: "Next.js", mark: "N", background: "#0b0b0b", foreground: "#ffffff" },
  { id: "typescript", name: "TypeScript", mark: "TS", background: "#3178c6", foreground: "#ffffff" },
  { id: "javascript", name: "JavaScript", mark: "JS", background: "#f7df1e", foreground: "#1b1b1b" },
  { id: "tailwind", name: "Tailwind CSS", mark: "Tw", background: "#0f172a", foreground: "#38bdf8" },
  { id: "nodejs", name: "Node.js", mark: "Nd", background: "#215732", foreground: "#8cc84b" },
  { id: "notion", name: "Notion", mark: "N", background: "#ffffff", foreground: "#111111" },
  { id: "git", name: "Git", mark: "git", background: "#f05032", foreground: "#ffffff" },
  { id: "redis", name: "Redis", mark: "Rd", background: "#a41e11", foreground: "#ffffff" },
  { id: "postgres", name: "PostgreSQL", mark: "Pg", background: "#336791", foreground: "#ffffff" },
  { id: "docker", name: "Docker", mark: "Dk", background: "#1d63ed", foreground: "#ffffff" },
  { id: "html", name: "HTML", mark: "<>", background: "#e34f26", foreground: "#ffffff" },
  { id: "css", name: "CSS", mark: "{}", background: "#663399", foreground: "#ffffff" },
  { id: "graphql", name: "GraphQL", mark: "GQ", background: "#e10098", foreground: "#ffffff" },
  { id: "vite", name: "Vite", mark: "⚡", background: "#2a1f5c", foreground: "#ffd62e" },
  { id: "python", name: "Python", mark: "Py", background: "#306998", foreground: "#ffd43b" },
];

export const TECH_CARD_BY_ID = new Map(TECH_CARDS.map((card) => [card.id, card]));
