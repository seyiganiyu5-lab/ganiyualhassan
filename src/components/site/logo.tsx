import { cn } from "@/lib/utils";

const LEFT_BAR = "M8 50H33V62H8Z";
const RIGHT_BAR = "M78 50H112V62H91Z";
const BROKEN_PIECE = "M33 50H78L91 62H33Z";
const CURSOR = "M40 20V88L58 72L70 100L80 96L68 68L90 68Z";

/**
 * The breakthrough cursor: a cursor pushing up through a broken bar.
 * Brand rule: gold cursor on dark, fully onyx on light backgrounds.
 *
 * `animated` plays the brand motion once: the cursor rises from below,
 * hits the intact bar, the bar splits and the cursor breaks through.
 * Each moving part is its own HTML layer animated with transform/opacity
 * only, so the motion runs on the compositor and stays smooth while the
 * page is still loading (see .mark-anim in globals.css).
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
  const a11y = {
    role: title ? "img" : undefined,
    "aria-label": title,
    "aria-hidden": title ? undefined : true,
  } as const;

  if (animated) {
    const layer = (part: string, d: string, fill: string) => (
      <span className={cn("mark-layer", part)}>
        <svg viewBox="0 0 120 120" className="h-full w-full">
          <path d={d} className={fill} />
        </svg>
      </span>
    );
    return (
      <span {...a11y} className={cn("mark-anim shrink-0", className)}>
        {layer("mark-left", LEFT_BAR, "fill-foreground")}
        {layer("mark-right", RIGHT_BAR, "fill-foreground")}
        {layer("mark-fill", BROKEN_PIECE, "fill-foreground")}
        {layer("mark-cursor", CURSOR, "fill-foreground dark:fill-primary")}
      </span>
    );
  }

  return (
    <svg viewBox="0 0 120 120" className={cn("shrink-0", className)} {...a11y}>
      <path d={`${LEFT_BAR} ${RIGHT_BAR}`} className="fill-foreground" />
      <path d={CURSOR} className="fill-foreground dark:fill-primary" />
    </svg>
  );
}

/** The name set as the wordmark: display face, tight tracking, gold hyphen. */
export function Wordmark({ name, className }: { name: string; className?: string }) {
  const i = name.indexOf("-");
  return (
    <span className={cn("whitespace-nowrap font-display font-semibold tracking-[-0.03em]", className)}>
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
