import type { Metadata } from "next";
import { getProjects } from "@/lib/data";
import { CATEGORIES } from "@/lib/media";
import type { ProjectCategory } from "@/lib/types";
import { WorkView } from "@/components/site/work-view";

export const metadata: Metadata = {
  title: "Work",
  description: "Websites, brand identities, graphic design and drawings.",
};

export default async function WorkPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const active = CATEGORIES.includes(category as ProjectCategory) ? (category as ProjectCategory) : null;
  const projects = await getProjects();
  return <WorkView projects={projects} active={active} />;
}
