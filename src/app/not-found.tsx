import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <p className="font-mono text-sm text-muted-foreground">404</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Page not found</h1>
      <p className="mt-3 max-w-sm text-muted-foreground">
        This page doesn&rsquo;t exist or has moved. / Cette page n&rsquo;existe pas.
      </p>
      <div className="mt-8 flex items-center gap-3 text-sm">
        <Link
          href="/"
          className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-5 font-medium text-primary-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Home
        </Link>
        <Link
          href="/work"
          className="inline-flex h-10 items-center rounded-full border border-border px-5 font-medium hover:border-foreground/40"
        >
          Work
        </Link>
      </div>
    </div>
  );
}
