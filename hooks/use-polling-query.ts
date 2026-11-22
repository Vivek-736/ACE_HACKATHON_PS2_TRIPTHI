"use client";

import { useEffect, useState } from "react";
import {
  useQuery,
  type QueryKey,
  type UseQueryOptions,
  type UseQueryResult,
} from "@tanstack/react-query";

interface UsePollingQueryOptions<TData, TError>
  extends Omit<UseQueryOptions<TData, TError, TData, QueryKey>, "queryKey" | "queryFn"> {
  pollingIntervalMs?: number;
  pauseWhenHidden?: boolean;
}

export function usePollingQuery<TData = unknown, TError = Error>(
  key: QueryKey,
  fetcher: () => Promise<TData>,
  options: UsePollingQueryOptions<TData, TError> = {}
): UseQueryResult<TData, TError> & {
  lastUpdated: Date | null;
  isStaleData: boolean;
  timeAgoText: string;
} {
  const {
    pollingIntervalMs = 12 * 1000,
    pauseWhenHidden = true,
    ...restOptions
  } = options;

  const [isTabVisible, setIsTabVisible] = useState(
    typeof document !== "undefined" ? document.visibilityState === "visible" : true
  );
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Smart Visibility Detection: pause polling when tab is hidden
  useEffect(() => {
    if (typeof document === "undefined") return;

    const handleVisibilityChange = () => {
      setIsTabVisible(document.visibilityState === "visible");
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Compute effective refetch interval
  const effectiveRefetchInterval =
    pauseWhenHidden && !isTabVisible ? false : pollingIntervalMs;

  const query = useQuery({
    queryKey: key,
    queryFn: async () => {
      const data = await fetcher();
      setLastUpdated(new Date());
      return data;
    },
    refetchInterval: effectiveRefetchInterval,
    refetchOnWindowFocus: true,
    staleTime: 8 * 1000,
    ...restOptions,
  });

  // Calculate friendly "time ago" string
  const [timeAgoText, setTimeAgoText] = useState("Just now");

  useEffect(() => {
    if (!lastUpdated) return;

    const interval = setInterval(() => {
      const seconds = Math.floor((Date.now() - lastUpdated.getTime()) / 1000);
      if (seconds < 5) {
        setTimeAgoText("Just now");
      } else if (seconds < 60) {
        setTimeAgoText(`${seconds}s ago`);
      } else {
        const mins = Math.floor(seconds / 60);
        setTimeAgoText(`${mins}m ago`);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [lastUpdated]);

  const isStaleData =
    !!lastUpdated && Date.now() - lastUpdated.getTime() > 25 * 1000;

  return {
    ...query,
    lastUpdated,
    isStaleData,
    timeAgoText,
  };
}
