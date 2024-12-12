import { memo } from "react";
import { Skeleton } from "@/components/ui/skeleton";

function TransactionSkeletonComponent() {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between p-3 pt-0">
        <Skeleton className="h-4 w-36 self-end" />
        <Skeleton className="w-6 h-6 rounded-full" />
      </div>
      <div className="flex flex-col gap-3">
        {Array.from({
          length: 2,
        }).map((_, index) => (
          <div
            key={`transaction-skeleton-${index}`}
            className="flex items-center gap-3 p-3"
          >
            <Skeleton className="w-8 h-8 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-4 w-52 mb-2" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export const TransactionSkeleton = memo(TransactionSkeletonComponent);
