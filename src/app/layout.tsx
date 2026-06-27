import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";
import { db } from "@/lib/db";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const DEFAULTS = {
  metaTitle: "Ganiyu Al-Hassan Oluwaseyi — Software Engineer & Creative Designer",
  metaDescription:
    "Portfolio of Ganiyu Al-Hassan Oluwaseyi — Software Engineering Student, Web Developer, UI/UX Designer, Graphic Designer & Branding Specialist. Crafting elegant digital experiences.",
  keywords:
    "Ganiyu Al-Hassan, Software Engineer, Web Developer, UI/UX Designer, Graphic Designer, Branding, Portfolio",
  heroName: "Ganiyu Al-Hassan Oluwaseyi",
  phone: "(+225) 05 03 67 14 80",
  email: "seyiganiyu5@gmail.com",
  linkedin: "https://linkedin.com/in/al-hassan-ganiyu-9910b3410",
  whatsapp: "https://wa.me/2250503671480",
  avatarUrl: "",
  siteUrl: "",
  googleVerification: "",
  ogImage: "",
} as const;

/** Load all settings from the DB, falling back to DEFAULTS. */
async function loadSettings(): Promise<Record<string, string>> {
  try {
    const rows = await db.setting.findMany();
    const map: Record<string, string> = { ...DEFAULTS };
    for (const r of rows) map[r.key] = r.value;
    return map;
  } catch {
    return { ...DEFAULTS };
  }
}

/** Normalize a site URL to a clean origin with no trailing slash. */
function normalizeOrigin(url: string): string | null {
  if (!url) return null;
  try {
    const u = new URL(url.trim());
    return `${u.protocol}//${u.host}`;
  } catch {
    return null;
  }
}

// Dynamic metadata, driven by the admin SEO panel (DB settings).
export async function generateMetadata(): Promise<Metadata> {
  const s = await loadSettings();
  const siteUrl = normalizeOrigin(s.siteUrl);
  const title = s.metaTitle || DEFAULTS.metaTitle;
  const description = s.metaDescription || DEFAULTS.metaDescription;
  const keywords = (s.keywords || DEFAULTS.keywords)
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
  const ogImage = s.ogImage || s.avatarUrl || undefined;
  const canonical = siteUrl ? `${siteUrl}/` : undefined;

  const verification: Record<string, string> = {};
  if (s.googleVerification) {
    verification.google = s.googleVerification;
  }

  return {
    metadataBase: siteUrl ? new URL(siteUrl) : undefined,
    title,
    description,
    keywords,
    authors: [{ name: s.heroName || DEFAULTS.heroName }],
    creator: s.heroName || DEFAULTS.heroName,
    applicationName: s.heroName || DEFAULTS.heroName,
    // Canonical URL — tells Google the preferred version of the page.
    alternates: {
      canonical: canonical || "/",
      languages: {
        en: "/",
        fr: "/",
      },
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: canonical,
      siteName: s.heroName || DEFAULTS.heroName,
      locale: "en_US",
      images: ogImage
        ? [
            {
              url: ogImage,
              width: 1200,
              height: 630,
              alt: s.heroName || "Portfolio",
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
      creator: "@ganiyu_alhassan",
    },
    manifest: "/manifest.json",
appleWebApp: {
  capable: true,
  statusBarStyle: "black-translucent",
  title: "GAO Portfolio",
},
icons: {
  icon: [
    { url: "/icon.svg", type: "image/svg+xml" },
    { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
  ],
  apple: [
    { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
  ],
},
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    // Google Search Console ownership verification
    verification,
    category: "portfolio",
  };
}

/** JSON-LD structured data — helps Google understand this is a Person + their website. */
function buildJsonLd(s: Record<string, string>, siteUrl: string | null) {
  const name = s.heroName || DEFAULTS.heroName;
  const url = siteUrl ? `${siteUrl}/` : "/";
  const sameAs = [
    s.linkedin || DEFAULTS.linkedin,
    s.whatsapp ? `https://wa.me/${s.whatsapp.replace(/.*wa\.me\//, "")}` : null,
  ].filter(Boolean) as string[];

  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    url,
    image: s.avatarUrl || undefined,
    email: `mailto:${s.email || DEFAULTS.email}`,
    telephone: s.phone || DEFAULTS.phone,
    jobTitle: "Software Engineer & Creative Designer",
    description: s.metaDescription || DEFAULTS.metaDescription,
    knowsAbout: (s.keywords || DEFAULTS.keywords)
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean),
    sameAs,
    address: {
      "@type": "PostalAddress",
      addressCountry: "CI",
      addressRegion: "Abidjan",
    },
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: `${name} — Portfolio`,
    url,
    author: { "@type": "Person", name },
    description: s.metaDescription || DEFAULTS.metaDescription,
    inLanguage: ["en", "fr"],
  };

  return { person, website };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const s = await loadSettings();
  const siteUrl = normalizeOrigin(s.siteUrl);
  const jsonLd = buildJsonLd(s, siteUrl);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* JSON-LD structured data for Google rich results */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd.person) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd.website) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground overflow-x-hidden`}
      >
        <Providers>
          {children}
          <Toaster />
          <SonnerToaster />
        </Providers>
      </body>
    </html>
  );
}
