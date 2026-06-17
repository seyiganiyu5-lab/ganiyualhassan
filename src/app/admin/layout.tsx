import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard — Ganiyu Al-Hassan Oluwaseyi",
  description: "Secure admin dashboard for managing portfolio content.",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
