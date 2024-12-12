"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function SummaryCardSkeleton() {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-9 w-9 rounded-full" />
      </div>
      <Skeleton className="h-8 w-32 mt-4" />
    </Card>
  );
}
