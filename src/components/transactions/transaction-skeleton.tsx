"use client";

import React, { memo } from "react";

function TransactionSkeletonComponent() {
  return (
    <div className="flex items-center gap-2 p-3 bg-white animate-pulse">
      <div className="w-10 h-10 rounded-full bg-gray-200" />
      <div className="flex-1">
        <div className="h-4 w-2/3 bg-gray-200 rounded mb-2" />
        <div className="h-3 w-1/3 bg-gray-200 rounded" />
      </div>
      <div className="h-4 w-24 bg-gray-200 rounded" />
    </div>
  );
}

export const TransactionSkeleton = memo(TransactionSkeletonComponent);
