import { cn } from "@/lib/utils";

/**
 * The breakthrough cursor: a cursor pushing up through a broken bar.
 * Brand rule: gold cursor on dark, fully onyx on light backgrounds.
 */
export function Logomark({ className, title }: { className?: string; title?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      className={cn("shrink-0", className)}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <path d="M8 50H33V62H8Z M78 50H112V62H91Z" className="fill-foreground" />
      <path
        d="M40 20V88L58 72L70 100L80 96L68 68L90 68Z"
        className="fill-foreground dark:fill-primary"
      />
    </svg>
  );
}
