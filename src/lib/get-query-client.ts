import {
  QueryClient,
  defaultShouldDehydrateQuery,
  isServer,
} from "@tanstack/react-query";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        gcTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: 1,
      },
      mutations: {
        retry: 1,
        onError: (error: unknown) => {
          console.error("Mutation error:", error);
        },
      },
      dehydrate: {
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient() {
  if (isServer) {
    return makeQueryClient();
  } else {
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

export const queryKeys = {
  transactions: {
    all: ["transactions"] as const,
    list: (params: Record<string, unknown>) =>
      ["transactions", params] as const,
    detail: (id: string) => ["transactions", id] as const,
    summary: (params: Record<string, unknown>) =>
      ["transactions", "summary", params] as const,
  },
  categories: {
    all: ["categories"] as const,
    list: (params?: Record<string, unknown>) => ["categories", params] as const,
    detail: (id: string) => ["categories", id] as const,
  },
} as const;
