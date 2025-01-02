"use client";

import { ReactNode, Suspense } from "react";
import { HydrationBoundary, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { getQueryClient } from "../lib/get-query-client";
import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import { SessionProvider as AppSessionProvider } from "@/components/session/session-provider";

function LoadingState() {
  return (
    <div className="flex items-center justify-center h-screen w-full bg-gray-100/70">
      <div className="flex flex-col items-center gap-6">
        <div className="flex items-center justify-center">
          <div className="relative mr-4">
            <div className="absolute inset-0 animate-[pulse_2s_ease-in-out_infinite]">
              <span className="block h-12 w-12 rounded-full bg-primary/20" />
            </div>
            <div className="relative animate-bounce">
              <span className="font-bold text-2xl bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                FC
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2 animate-in fade-in-0 duration-700">
          <p className="text-sm text-muted-foreground animate-pulse">
            Carregando...
          </p>
        </div>
      </div>
    </div>
  );
}

export function Providers({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <NextAuthSessionProvider>
      <QueryClientProvider client={queryClient}>
        <Suspense fallback={<LoadingState />}>
          <HydrationBoundary>
            <AppSessionProvider>{children}</AppSessionProvider>
          </HydrationBoundary>
        </Suspense>
        {process.env.NODE_ENV === "development" && <ReactQueryDevtools />}
      </QueryClientProvider>
    </NextAuthSessionProvider>
  );
}
