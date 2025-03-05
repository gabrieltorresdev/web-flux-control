"use client";

import { ErrorBoundary } from "@/shared/components/error/error-boundary";

interface ErrorProps {
  error: Error;
  reset: () => void;
}

export default function Error({ error }: ErrorProps) {
  return <ErrorBoundary error={error} />;
}
