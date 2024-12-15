"use client";

import { memo } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function TransactionListSkeletonComponent() {
  return (
    <div>
      {Array.from({ length: 2 }).map((_, groupIndex) => (
        <div key={`group-skeleton-${groupIndex}`} className="mb-6">
          <div className="flex items-center justify-between px-3 pb-1.5">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-6 w-6 rounded-full" />
          </div>
          
          {Array.from({ length: 3 }).map((_, itemIndex) => (
            <div
              key={`transaction-skeleton-${groupIndex}-${itemIndex}`}
              className="flex items-center gap-3 p-3"
            >
              <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
              <div className="flex-1">
                <Skeleton className="h-5 w-2/3 mb-2" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-24" />
                  <div className="w-1 h-1 rounded-full bg-gray-300" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
              <Skeleton className="h-6 w-24" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export const TransactionListSkeleton = memo(TransactionListSkeletonComponent);