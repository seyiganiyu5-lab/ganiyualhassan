import { cn } from "@/lib/utils";

/**
 * A placeholder block shaped like the content that is loading.
 * A soft sheen sweeps across it (see .skeleton in globals.css).
 */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="skeleton" aria-hidden className={cn("skeleton rounded-md", className)} {...props} />;
}

/** A few text-like lines, the last one shorter. */
function SkeletonLines({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn("space-y-2.5", className)} aria-hidden>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} className={cn("h-3.5", i === lines - 1 ? "w-3/5" : "w-full")} />
      ))}
    </div>
  );
}

/**
 * Three small blocks that light up in turn: the brand's loading indicator,
 * used in buttons and upload areas instead of a spinning circle.
 * Sized by font-size, coloured by text colour.
 */
function BlockLoader({ className, label = "Loading" }: { className?: string; label?: string }) {
  return (
    <span role="status" aria-label={label} className={cn("block-loader", className)}>
      <span />
      <span />
      <span />
    </span>
  );
}

export { Skeleton, SkeletonLines, BlockLoader };
