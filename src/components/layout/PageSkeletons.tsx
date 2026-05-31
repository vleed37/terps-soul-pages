import { Skeleton } from "@/components/ui/skeleton";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[60vh] bg-[color:var(--cream)] px-6 py-16 md:px-12">
      <div className="mx-auto max-w-7xl space-y-10">{children}</div>
    </div>
  );
}

function Header() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-10 w-2/3 max-w-xl" />
      <Skeleton className="h-4 w-1/2 max-w-md" />
    </div>
  );
}

export function GridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <Shell>
      <Header />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-[3/4] w-full rounded-md" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    </Shell>
  );
}

export function ListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <Shell>
      <Header />
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-md" />
        ))}
      </div>
    </Shell>
  );
}

export function MapSkeleton() {
  return (
    <Shell>
      <Header />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.5fr]">
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-md" />
          ))}
        </div>
        <Skeleton className="h-[500px] w-full rounded-md" />
      </div>
    </Shell>
  );
}

export function DashboardSkeleton() {
  return (
    <Shell>
      <Header />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-md" />
        ))}
      </div>
      <Skeleton className="h-64 w-full rounded-md" />
    </Shell>
  );
}