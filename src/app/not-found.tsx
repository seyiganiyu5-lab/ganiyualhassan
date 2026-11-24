import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logomark } from "@/components/site/logo";

export default function NotFound() {
  return (
    <div className="relative isolate flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 text-center">
      <div aria-hidden className="hero-grid-bg absolute inset-0 -z-10" />
      <Logomark animated className="mx-auto h-24 w-24 sm:h-28 sm:w-28" />
      <p className="eyebrow mt-8">Error 404</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
        This page broke through
        <br />
        somewhere else.
      </h1>
      <p className="mt-4 max-w-md text-muted-foreground">
        It doesn&rsquo;t exist or has moved.
        <br />
        <span lang="fr">Cette page n&rsquo;existe pas ou a été déplacée.</span>
      </p>
      <div className="mt-10 flex items-center gap-3 text-sm">
        <Link
          href="/"
          className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-6 font-medium text-primary-foreground shadow-[0_10px_30px_-12px] shadow-primary/60 transition-opacity hover:opacity-90"
        >
          <ArrowLeft className="h-4 w-4" />
          Home
        </Link>
        <Link
          href="/work"
          className="inline-flex h-11 items-center rounded-full border border-border px-6 font-medium transition-colors hover:border-foreground/40"
        >
          Work
        </Link>
      </div>
    </div>
  );
}
