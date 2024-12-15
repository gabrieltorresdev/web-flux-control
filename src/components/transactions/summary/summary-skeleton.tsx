"use client";

import { memo } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function SummarySkeletonComponent() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={`summary-skeleton-${index}`} className="p-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-9 w-9 rounded-full" />
          </div>
          <Skeleton className="h-8 w-32 mt-4" />
        </Card>
      ))}
    </div>
  );
}

export const SummarySkeleton = memo(SummarySkeletonComponent);