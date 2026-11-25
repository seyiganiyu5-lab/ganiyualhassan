import { Skeleton, SkeletonLines } from "@/components/ui/skeleton";

/** Shown while a page loads: grey blocks shaped like the page, with a sheen. */
function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div role="status" aria-live="polite" className="container-site pt-16 sm:pt-24">
      <span className="sr-only">Loading…</span>
      {children}
    </div>
  );
}

function CardGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2">
      {Array.from({ length: count }, (_, i) => (
        <div key={i}>
          <Skeleton className="aspect-[4/3] w-full rounded-lg" />
          <div className="mt-3 flex items-center justify-between gap-4">
            <Skeleton className="h-4 w-2/5" />
            <Skeleton className="h-4 w-10" />
          </div>
          <Skeleton className="mt-2 h-3.5 w-1/4" />
        </div>
      ))}
    </div>
  );
}

export function HomeSkeleton() {
  return (
    <Shell>
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1fr_20rem]">
        <div className="order-2 lg:order-1">
          <Skeleton className="h-7 w-40 rounded-full" />
          <Skeleton className="mt-6 h-11 w-4/5 sm:h-14" />
          <Skeleton className="mt-3 h-11 w-3/5 sm:h-14" />
          <SkeletonLines lines={2} className="mt-6 max-w-lg" />
          <div className="mt-8 flex gap-3">
            <Skeleton className="h-11 w-36 rounded-full" />
            <Skeleton className="h-11 w-32 rounded-full" />
          </div>
        </div>
        <Skeleton className="order-1 mx-auto aspect-[3/4] w-64 rounded-2xl lg:order-2 lg:w-full" />
      </div>
      <Skeleton className="mt-20 h-3 w-28" />
      <div className="mt-6">
        <CardGrid count={2} />
      </div>
    </Shell>
  );
}

export function WorkSkeleton() {
  return (
    <Shell>
      <Skeleton className="h-10 w-40 sm:h-12" />
      <SkeletonLines lines={2} className="mt-5 max-w-xl" />
      <div className="mt-10 flex flex-wrap gap-2">
        {[16, 20, 24, 18].map((w) => (
          <Skeleton key={w} className="h-8 rounded-full" style={{ width: `${w * 4}px` }} />
        ))}
      </div>
      <div className="mt-10">
        <CardGrid count={4} />
      </div>
    </Shell>
  );
}

export function ProjectSkeleton() {
  return (
    <Shell>
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-8 h-10 w-2/3 sm:h-12" />
      <div className="mt-5 flex flex-wrap gap-3">
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-28 rounded-full" />
      </div>
      <Skeleton className="mt-10 aspect-video w-full rounded-xl" />
      <SkeletonLines lines={4} className="mt-10 max-w-2xl" />
    </Shell>
  );
}

export function AboutSkeleton() {
  return (
    <Shell>
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_18rem]">
        <div>
          <Skeleton className="h-10 w-36 sm:h-12" />
          <SkeletonLines lines={4} className="mt-8 max-w-2xl" />
          <SkeletonLines lines={3} className="mt-5 max-w-2xl" />
          <Skeleton className="mt-10 h-11 w-40 rounded-full" />
        </div>
        <Skeleton className="aspect-[4/5] w-full max-w-xs rounded-2xl" />
      </div>
      {[0, 1].map((s) => (
        <div key={s} className="mt-24">
          <Skeleton className="h-3 w-24" />
          <div className="mt-6 grid grid-cols-1 gap-x-10 sm:grid-cols-2">
            {[0, 1].map((i) => (
              <div key={i} className="border-t border-border py-5">
                <Skeleton className="h-4 w-1/2" />
                <SkeletonLines lines={2} className="mt-3" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </Shell>
  );
}

export function ContactSkeleton() {
  return (
    <Shell>
      <Skeleton className="h-10 w-40 sm:h-12" />
      <SkeletonLines lines={1} className="mt-5 max-w-xl" />
      <div className="mt-14 grid grid-cols-1 gap-16 lg:grid-cols-2">
        <div>
          <Skeleton className="h-3 w-32" />
          <div className="mt-5 space-y-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-4 border-t border-border pt-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="mt-2 h-4 w-48" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-11 w-full rounded-lg" />
          <Skeleton className="h-11 w-full rounded-lg" />
          <Skeleton className="h-11 w-full rounded-lg" />
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="h-11 w-36 rounded-full" />
        </div>
      </div>
    </Shell>
  );
}
