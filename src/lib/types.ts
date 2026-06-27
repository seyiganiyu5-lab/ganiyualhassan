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
  createdAt: string;
}

export type ProjectCategory = Project["category"];
