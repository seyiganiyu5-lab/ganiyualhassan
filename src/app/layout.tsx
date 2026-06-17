import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ganiyu Al-Hassan Oluwaseyi — Software Engineer & Creative Designer",
  description:
    "Portfolio of Ganiyu Al-Hassan Oluwaseyi — Software Engineering Student, Web Developer, UI/UX Designer, Graphic Designer & Branding Specialist. Crafting elegant digital experiences.",
  keywords: [
    "Ganiyu Al-Hassan Oluwaseyi",
    "Software Engineer",
    "Web Developer",
    "UI/UX Designer",
    "Graphic Designer",
    "Branding",
    "Portfolio",
    "Cloud Computing",
  ],
  authors: [{ name: "Ganiyu Al-Hassan Oluwaseyi" }],
  openGraph: {
    title: "Ganiyu Al-Hassan Oluwaseyi — Software Engineer & Creative Designer",
    description:
      "Crafting elegant digital experiences at the intersection of design, code, and creativity.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ganiyu Al-Hassan Oluwaseyi — Portfolio",
    description: "Software Engineer & Creative Digital Professional",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
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
