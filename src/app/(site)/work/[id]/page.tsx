import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProjects } from "@/lib/data";
import { coverOf } from "@/lib/media";
import { ProjectView } from "@/components/site/project-view";

type Params = { params: Promise<{ id: string }> };

async function load(id: string) {
  const all = await getProjects();
  const index = all.findIndex((p) => p.id === id);
  if (index === -1) return null;
  const many = all.length > 1;
  const next = many ? all[(index + 1) % all.length] : null;
  const prev = many ? all[(index - 1 + all.length) % all.length] : null;
  return { project: all[index], next, prev };
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const data = await load(id);
  if (!data) return {};
  const { project } = data;
  const cover = coverOf(project.images);
  return {
    title: project.title,
    description: project.description.slice(0, 160),
    openGraph: cover ? { images: [cover] } : undefined,
  };
}

export default async function ProjectPage({ params }: Params) {
  const { id } = await params;
  const data = await load(id);
  if (!data) notFound();
  return <ProjectView project={data.project} next={data.next} prev={data.prev} />;
}
