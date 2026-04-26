import { Skeleton } from "@/components/ui/Skeleton";

export default function GradesLoading() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-2">
        <Skeleton className="h-7 w-36" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
      </div>
      <div className="rounded-2xl border border-surface-200 bg-white p-6">
        <Skeleton className="h-40 w-full" />
      </div>
    </div>
  );
}
