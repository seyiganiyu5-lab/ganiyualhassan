"use client";

import { ArrowUpRight } from "lucide-react";
import { useT } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";
import type { Testimonial } from "@/lib/types";
import { Reveal } from "./motion";

/**
 * Quotes from clients and colleagues. Hidden entirely until at least one is
 * added in the admin. One quote is shown large; two or more form a grid.
 */
export function Testimonials({ items }: { items: Testimonial[] }) {
  const t = useT();
  if (items.length === 0) return null;
  const single = items.length === 1;

  return (
    <section aria-labelledby="testimonials" className="container-site mt-28">
      <Reveal>
        <h2 id="testimonials" className="eyebrow mb-8">
          {t.site.home.testimonials}
        </h2>
      </Reveal>
      <div
        className={cn(
          "grid grid-cols-1 gap-5",
          !single && "md:grid-cols-2",
          items.length >= 3 && "lg:grid-cols-3"
        )}
      >
        {items.map((item, i) => (
          <Reveal key={item.id} delay={(i % 3) * 0.08} className="h-full">
            <figure
              className={cn(
                "flex h-full flex-col rounded-2xl border border-border bg-card p-6 sm:p-8",
                single && "sm:p-12"
              )}
            >
              <QuoteMark />
              <blockquote
                className={cn(
                  "mt-5 flex-1 whitespace-pre-line leading-relaxed",
                  single ? "font-display text-xl tracking-tight sm:text-2xl" : "text-[15px]"
                )}
              >
                {item.quote}
              </blockquote>
              <figcaption className="mt-8 flex items-center gap-3 border-t border-border pt-5">
                <Avatar item={item} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    {item.link ? (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex items-center gap-1 hover:underline"
                      >
                        {item.name}
                        <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                      </a>
                    ) : (
                      item.name
                    )}
                  </p>
                  {(item.role || item.company) && (
                    <p className="truncate text-xs text-muted-foreground">
                      {[item.role, item.company].filter(Boolean).join(" · ")}
                    </p>
                  )}
                </div>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/** Two gold blocks — the brand's take on an opening quote mark. */
function QuoteMark() {
  return (
    <svg aria-hidden viewBox="0 0 40 28" className="h-6 w-auto fill-primary">
      <path d="M0 14L8 0H16L10 14H16V28H0Z M22 14L30 0H38L32 14H38V28H22Z" />
    </svg>
  );
}

function Avatar({ item }: { item: Testimonial }) {
  if (item.photoUrl) {
    return (
      <img
        src={item.photoUrl}
        alt=""
        loading="lazy"
        className="h-10 w-10 shrink-0 rounded-full bg-muted object-cover"
      />
    );
  }
  const initials = item.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
  return (
    <span
      aria-hidden
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted font-mono text-xs font-medium text-brand-ink"
    >
      {initials}
    </span>
  );
}
