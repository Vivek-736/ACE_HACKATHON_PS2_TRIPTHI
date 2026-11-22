import { QueryClient } from "@tanstack/react-query";

export function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data is considered fresh for 10 seconds
        staleTime: 10 * 1000,
        // Active queries poll every 12 seconds
        refetchInterval: 12 * 1000,
        // Instantly refetch when the user returns to the tab
        refetchOnWindowFocus: true,
        // Avoid excessive retries on error
        retry: 2,
        // Prevent background polling from hammering the network when tab is hidden
        refetchIntervalInBackground: false,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient(): QueryClient {
  if (typeof window === "undefined") {
    // Server: always create a new QueryClient
    return makeQueryClient();
  } else {
    // Browser: create once and reuse
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}
