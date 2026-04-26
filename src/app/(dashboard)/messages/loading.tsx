import { CardSkeleton, Skeleton } from "@/components/ui/Skeleton";

export default function MessagesLoading() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-36" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-36" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
