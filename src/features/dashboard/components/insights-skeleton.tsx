'use client';

import { cn } from '@/shared/utils';
import { Skeleton } from '@/shared/components/ui/skeleton';

export function InsightsSkeleton() {
  return (
    <div className="space-y-3">
      {/* Mobile Carousel Skeleton */}
      <div className="sm:hidden">
        <div className="relative -mx-4">
          <div className="overflow-hidden">
            <div className="flex touch-pan-y pl-4">
              {[1, 2].map((index) => (
                <div key={index} className="flex-[0_0_90%] min-w-0 relative pr-4">
                  <div className="relative overflow-hidden pl-12 pr-4 py-3 min-h-[5rem] h-full rounded-lg border">
                    <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center bg-muted/5">
                      <Skeleton className="h-5 w-5 rounded-full" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-4/5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Carousel Indicators */}
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
            {[1, 2].map((index) => (
              <Skeleton
                key={index}
                className={cn(
                  "h-0.5 rounded-full",
                  index === 1 ? "w-8" : "w-4"
                )}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Desktop Grid Skeleton */}
      <div className="hidden sm:grid gap-3 sm:grid-cols-2">
        {[1, 2].map((index) => (
          <div
            key={index}
            className="relative overflow-hidden pl-12 pr-4 py-3 min-h-[5rem] h-full rounded-lg border"
          >
            <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center bg-muted/5">
              <Skeleton className="h-5 w-5 rounded-full" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-6 w-6 rounded" />
              </div>
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-4/5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 