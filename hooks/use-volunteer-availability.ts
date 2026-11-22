"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usePollingQuery } from "./use-polling-query";
import { queryKeys } from "@/lib/query/query-keys";
import type { VolunteerProfile } from "@/db/schema/volunteers";

export function useVolunteerAvailability() {
  const queryClient = useQueryClient();

  // Poll volunteer profile every 12 seconds
  const profileQuery = usePollingQuery<VolunteerProfile>(
    queryKeys.volunteers.profile(),
    async () => {
      const res = await fetch("/api/volunteers/profile");
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error?.message || "Failed to load volunteer profile");
      }
      const raw = json.data;
      if (raw && typeof raw === "object" && "profile" in raw && raw.profile) {
        return raw.profile as VolunteerProfile;
      }
      return raw as VolunteerProfile;
    },
    {
      pollingIntervalMs: 12 * 1000,
    }
  );

  // Mutation to toggle or set availability status (available ↔ offline)
  const toggleMutation = useMutation({
    mutationFn: async (targetStatus: "available" | "offline") => {
      const res = await fetch("/api/volunteers/availability", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ availabilityStatus: targetStatus }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error?.message || "Failed to update availability");
      }
      const raw = json.data;
      if (raw && typeof raw === "object" && "profile" in raw && raw.profile) {
        return raw.profile as VolunteerProfile;
      }
      return raw as VolunteerProfile;
    },
    onMutate: async (targetStatus) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: queryKeys.volunteers.profile() });
      const previous = queryClient.getQueryData<VolunteerProfile>(
        queryKeys.volunteers.profile()
      );

      if (previous) {
        queryClient.setQueryData<VolunteerProfile>(queryKeys.volunteers.profile(), {
          ...previous,
          availabilityStatus: targetStatus,
        });
      }

      return { previous };
    },
    onSuccess: (updatedProfile) => {
      if (updatedProfile) {
        queryClient.setQueryData(queryKeys.volunteers.profile(), updatedProfile);
      }
    },
    onError: (_err, _target, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          queryKeys.volunteers.profile(),
          context.previous
        );
      }
    },
    onSettled: () => {
      // Invalidate relevant keys immediately after mutation
      queryClient.invalidateQueries({ queryKey: queryKeys.volunteers.profile() });
      queryClient.invalidateQueries({ queryKey: queryKeys.volunteers.availability() });
      queryClient.invalidateQueries({ queryKey: queryKeys.map.all });
    },
  });

  return {
    profile: profileQuery.data ?? null,
    isLoading: profileQuery.isLoading,
    isError: profileQuery.isError,
    isStale: profileQuery.isStaleData,
    lastUpdated: profileQuery.lastUpdated,
    timeAgoText: profileQuery.timeAgoText,
    refetch: profileQuery.refetch,
    toggleAvailability: toggleMutation.mutateAsync,
    isToggling: toggleMutation.isPending,
  };
}
