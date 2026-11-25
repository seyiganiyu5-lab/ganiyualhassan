export interface Project {
  id: string;
  title: string;
  description: string;
  category: "website" | "graphic" | "branding" | "drawing";
  technologies: string;
  liveDemo: string | null;
  githubLink: string | null;
  images: string[];
  featured: boolean;
  order: number;
  // Case study
  role: string;
  client: string;
  duration: string;
  challenge: string;
  approach: string;
  outcome: string;
  createdAt: string;
}

export type ProjectCategory = Project["category"];
