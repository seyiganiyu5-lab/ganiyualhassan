import { getSelectedProjects, getSettings } from "@/lib/data";
import { HomeView } from "@/components/site/home-view";

export default async function HomePage() {
  const [s, projects] = await Promise.all([getSettings(), getSelectedProjects(6)]);
  return <HomeView name={s.heroName} avatarUrl={s.avatarUrl} projects={projects} />;
}
