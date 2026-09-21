export type SearchDocumentType = "post" | "project" | "category" | "tag";

export type SearchDocument = {
  id: string;
  type: SearchDocumentType;
  title: string;
  description: string;
  href: string;
  category?: string;
  tags: string[];
  techStack?: string[];
  featured?: boolean;
  timestamp?: number;
};
