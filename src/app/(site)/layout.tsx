import { getProjects, getSettings } from "@/lib/data";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { Intro, introBootScript } from "@/components/site/intro";
import { BackToTop } from "@/components/site/back-to-top";
import { CommandMenu } from "@/components/site/command-menu";
import { ScrollProgress } from "@/components/site/scroll-progress";

// Content is managed from the admin panel, so always render fresh.
export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [s, projects] = await Promise.all([getSettings(), getProjects()]);
  const menuProjects = projects.map((p) => ({ id: p.id, title: p.title, category: p.category }));

  return (
    <CommandMenu projects={menuProjects} email={s.email} cvUrl={s.cvUrl}>
      {/* Must run before first paint so the intro never flashes for returning visitors. */}
      <script dangerouslySetInnerHTML={{ __html: introBootScript }} />
      <Intro name={s.heroName} />
      <ScrollProgress />
      <div className="flex min-h-screen flex-col">
        <Header name={s.heroName} />
        <main className="flex-1">{children}</main>
        <Footer name={s.heroName} email={s.email} linkedin={s.linkedin} whatsapp={s.whatsapp} />
      </div>
      <BackToTop />
    </CommandMenu>
  );
}
