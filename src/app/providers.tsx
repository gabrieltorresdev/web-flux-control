"use client";

import { ReactNode } from "react";
import { HydrationBoundary, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { getQueryClient } from "@/shared/lib/get-query-client";
import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import { SessionProvider as AppSessionProvider } from "@/shared/components/session/session-provider";
import { ThemeProvider } from "next-themes";
import { useThemeStore } from "@/shared/stores/theme-store";

export function Providers({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient();
  const theme = useThemeStore((state) => state.theme);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      value={{
        light: "light",
        dark: "dark",
        system: "system",
      }}
      forcedTheme={theme === "system" ? undefined : theme}
    >
      <NextAuthSessionProvider>
        <QueryClientProvider client={queryClient}>
          <HydrationBoundary>
            <AppSessionProvider>{children}</AppSessionProvider>
          </HydrationBoundary>
          {process.env.NODE_ENV === "development" && (
            <ReactQueryDevtools buttonPosition="bottom-left" />
          )}
        </QueryClientProvider>
      </NextAuthSessionProvider>
    </ThemeProvider>
  );
}
