import { ProductGridSkeleton, Skeleton } from "@/components/ui/States";

// Shown instantly while a server-rendered page fetches its data.
export default function Loading() {
  return (
    <div className="container-page py-10" role="status" aria-label="Loading">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-4 h-10 w-2/3 max-w-lg" />
      <div className="mt-10"><ProductGridSkeleton count={4} /></div>
    </div>
  );
}
