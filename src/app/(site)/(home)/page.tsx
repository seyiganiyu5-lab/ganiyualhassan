import { getSelectedProjects, getSettings, getTestimonials } from "@/lib/data";
import { HomeView } from "@/components/site/home-view";

export default async function HomePage() {
  const [s, projects, testimonials] = await Promise.all([
    getSettings(),
    getSelectedProjects(6),
    getTestimonials(),
  ]);
  return <HomeView name={s.heroName} avatarUrl={s.avatarUrl} projects={projects} testimonials={testimonials} />;
}
