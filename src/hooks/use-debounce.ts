import { useEffect, useCallback } from "react";

export function useDebounce<T extends unknown[]>(
  callback: (...args: T) => void,
  delay: number,
  dependencies: T
): void {
  const debouncedCallback = useCallback(callback, dependencies);

  useEffect(() => {
    const timeout = setTimeout(() => debouncedCallback(...dependencies), delay);
    return () => clearTimeout(timeout);
  }, [delay, debouncedCallback, ...dependencies]);
}
