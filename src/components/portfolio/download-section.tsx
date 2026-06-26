"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileCode, ImageIcon, Package, Check, Loader2 } from "lucide-react";

type Pkg = {
  key: string;
  href: string;
  filename: string;
  title: string;
  size: string;
  desc: string;
  icon: typeof FileCode;
  primary?: boolean;
};

const PACKAGES: Pkg[] = [
  {
    key: "source",
    href: "/ganiyu-portfolio-source.zip",
    filename: "ganiyu-portfolio-source.zip",
    title: "Source Code",
    size: "282 KB",
    desc: "All code, config, database & README. Downloads instantly. Recommended.",
    icon: FileCode,
    primary: true,
  },
  {
    key: "uploads",
    href: "/ganiyu-portfolio-uploads.zip",
    filename: "ganiyu-portfolio-uploads.zip",
    title: "Media Assets",
    size: "9.8 MB",
    desc: "The 37 uploaded images & CV referenced by the database. Unzip into public/uploads/.",
    icon: ImageIcon,
  },
  {
    key: "full",
    href: "/ganiyu-portfolio.zip",
    filename: "ganiyu-portfolio.zip",
    title: "Full Project",
    size: "39 MB",
    desc: "Everything in one archive (source + all 139 media library files). Largest download.",
    icon: Package,
  },
];

export function DownloadSection() {
  const [downloading, setDownloading] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const handleDownload = (pkg: Pkg) => {
    setDownloading(pkg.key);
    setDone(null);
    // Trigger the browser download via a programmatic anchor click.
    // This works inside the preview iframe and also when opened in a new tab.
    const a = document.createElement("a");
    a.href = pkg.href;
    a.download = pkg.filename;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Give the browser a moment to start the download, then flip to a "started" state.
    window.setTimeout(() => {
      setDownloading(null);
      setDone(pkg.key);
      window.setTimeout(() => setDone(null), 4000);
    }, 1200);
  };

  return (
    <section
      id="download"
      className="relative scroll-mt-20 border-t border-border bg-gradient-to-b from-background to-card/40 py-20 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Heading */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#FFC300]/40 bg-[#FFC300]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#FFC300]">
            <Download className="h-3.5 w-3.5" />
            Download
          </span>
          <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
            Get This Project
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Download the full source code to run locally or deploy to Vercel.
            Pick the package that suits you — the source-only download is tiny
            and downloads in a second.
          </p>
        </div>

        {/* Package cards */}
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {PACKAGES.map((pkg) => {
            const Icon = pkg.icon;
            const isBusy = downloading === pkg.key;
            const isDone = done === pkg.key;
            return (
              <Card
                key={pkg.key}
                className={`relative flex flex-col items-start gap-4 p-6 transition-shadow hover:shadow-lg ${
                  pkg.primary ? "ring-2 ring-[#FFC300]" : ""
                }`}
              >
                {pkg.primary && (
                  <span className="absolute -top-3 left-6 rounded-full bg-[#FFC300] px-3 py-0.5 text-xs font-bold text-[#000814] shadow">
                    Recommended
                  </span>
                )}
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FFC300]/15 text-[#FFC300]">
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex w-full items-center justify-between gap-2">
                  <h3 className="text-lg font-bold">{pkg.title}</h3>
                  <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                    {pkg.size}
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {pkg.desc}
                </p>
                <Button
                  onClick={() => handleDownload(pkg)}
                  disabled={isBusy}
                  className={`mt-auto w-full ${
                    pkg.primary
                      ? "bg-[#FFC300] text-[#000814] hover:bg-[#FFC300]/90"
                      : ""
                  }`}
                  variant={pkg.primary ? "default" : "outline"}
                >
                  {isBusy ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Starting…
                    </>
                  ) : isDone ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Download started
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </>
                  )}
                </Button>
              </Card>
            );
          })}
        </div>

        {/* Helper note */}
        <div className="mx-auto mt-10 max-w-3xl rounded-lg border border-border bg-muted/30 p-4 text-center text-xs leading-relaxed text-muted-foreground">
          <strong className="text-foreground">Tip:</strong> If a download does
          not start in the preview, click <em>Open in New Tab</em> above the
          preview panel, then visit{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 text-foreground">
            /download
          </code>{" "}
          or click any package above. The source-only zip (282&nbsp;KB) is the
          most reliable. After downloading, unzip and run{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 text-foreground">
            bun install
          </code>{" "}
          then{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 text-foreground">
            bun run dev
          </code>
          .
        </div>
      </div>
    </section>
  );
}
