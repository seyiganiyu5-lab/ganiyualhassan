import type { Metadata } from "next";
import { getSettings } from "@/lib/data";
import { ContactView } from "@/components/site/contact-view";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch about a project or collaboration.",
};

export default async function ContactPage() {
  const s = await getSettings();
  return <ContactView email={s.email} phone={s.phone} linkedin={s.linkedin} whatsapp={s.whatsapp} />;
}
