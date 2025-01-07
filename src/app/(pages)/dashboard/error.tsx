"use client";

import { ErrorBoundary } from "@/components/error/error-boundary";

interface ErrorProps {
  error: Error;
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  return <ErrorBoundary error={error} reset={reset} />;
}
