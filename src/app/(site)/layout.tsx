import { getSettings } from "@/lib/data";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";

// Content is managed from the admin panel, so always render fresh.
export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const s = await getSettings();
  return (
    <div className="flex min-h-screen flex-col">
      <Header name={s.heroName} />
      <main className="flex-1">{children}</main>
      <Footer name={s.heroName} email={s.email} linkedin={s.linkedin} whatsapp={s.whatsapp} />
    </div>
  );
}
