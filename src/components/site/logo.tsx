import { cn } from "@/lib/utils";

/**
 * The breakthrough cursor: a cursor pushing up through a broken bar.
 * Brand rule: gold cursor on dark, fully onyx on light backgrounds.
 *
 * `animated` plays the brand motion once: the cursor rises from below,
 * hits the intact bar, the bar splits and the cursor breaks through
 * (see .mark-anim in globals.css).
 */
export function Logomark({
  className,
  title,
  animated = false,
}: {
  className?: string;
  title?: string;
  animated?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 120 120"
      className={cn("shrink-0", animated && "mark-anim", className)}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <path d="M8 50H33V62H8Z" className="mark-left fill-foreground" />
      <path d="M78 50H112V62H91Z" className="mark-right fill-foreground" />
      {/* The piece of bar that gets broken; only visible during the animation */}
      {animated && <path d="M33 50H78L91 62H33Z" className="mark-fill fill-foreground" />}
      <path
        d="M40 20V88L58 72L70 100L80 96L68 68L90 68Z"
        className="mark-cursor fill-foreground dark:fill-primary"
      />
    </svg>
  );
}

/** The name set as the wordmark: display face, tight tracking, gold hyphen. */
export function Wordmark({ name, className }: { name: string; className?: string }) {
  const i = name.indexOf("-");
  return (
    <span className={cn("font-display font-semibold tracking-[-0.03em]", className)}>
      {i < 0 ? (
        name
      ) : (
        <>
          {name.slice(0, i)}
          <span className="text-brand-ink">-</span>
          {name.slice(i + 1)}
        </>
      )}
    </span>
  );
}
