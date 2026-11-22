"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usePollingQuery } from "./use-polling-query";
import { queryKeys } from "@/lib/query/query-keys";
import type { OrderStatus } from "@/db/schema/orders";

export interface RescueOrderDTO {
  id: string;
  listingId: string;
  receiverId: string;
  volunteerId?: string | null;
  allocatedPortions: number;
  status: OrderStatus;
  pickupOtp?: string;
  deliveryOtp?: string;
  pickupOtpConsumed?: boolean;
  deliveryOtpConsumed?: boolean;
  pickupAttempts?: number;
  deliveryAttempts?: number;
  pickupDeadline: string;
  collectedAt?: string | null;
  deliveredAt?: string | null;
  listingTitle?: string;
  foodCategory?: string;
  dietType?: string;
  donorLocation?: string;
  donorOrganisation?: string;
  receiverOrganisation?: string;
}

export function useActiveOrders(statusFilter?: string) {
  const queryClient = useQueryClient();

  // 1. Polling Query for Orders (every 10-12s)
  const ordersQuery = usePollingQuery<RescueOrderDTO[]>(
    queryKeys.orders.list(statusFilter),
    async () => {
      const url = statusFilter && statusFilter !== "all"
        ? `/api/rescue-orders?status=${statusFilter}`
        : `/api/rescue-orders`;
      const res = await fetch(url);
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error?.message || "Failed to fetch orders");
      }
      return json.data || [];
    },
    {
      pollingIntervalMs: 10 * 1000,
    }
  );

  // Helper to invalidate all related queries upon state transitions
  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.volunteers.profile() });
    queryClient.invalidateQueries({ queryKey: queryKeys.listings.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.map.all });
  };

  // 2. Accept Assignment Mutation
  const acceptMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const res = await fetch(`/api/rescue-orders/${orderId}/accept`, {
        method: "POST",
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error?.message || "Failed to accept rescue assignment");
      }
      return json.data;
    },
    onSuccess: invalidateAll,
  });

  // 3. Decline Assignment Mutation
  const declineMutation = useMutation({
    mutationFn: async ({ orderId, reason }: { orderId: string; reason?: string }) => {
      const res = await fetch(`/api/rescue-orders/${orderId}/decline`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error?.message || "Failed to decline assignment");
      }
      return json.data;
    },
    onSuccess: invalidateAll,
  });

  // 4. Milestone Transition Mutation
  const transitionMutation = useMutation({
    mutationFn: async ({
      orderId,
      status,
      notes,
    }: {
      orderId: string;
      status: OrderStatus;
      notes?: string;
    }) => {
      const res = await fetch(`/api/rescue-orders/${orderId}/transition`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, notes }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error?.message || "Failed to advance milestone");
      }
      return json.data;
    },
    onSuccess: invalidateAll,
  });

  // 5. Verify Pickup OTP Mutation (calls dedicated /pickup/verify)
  const verifyPickupMutation = useMutation({
    mutationFn: async ({ orderId, otp, notes }: { orderId: string; otp: string; notes?: string }) => {
      const res = await fetch(`/api/rescue-orders/${orderId}/pickup/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp, notes }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error?.message || "Invalid pickup verification code");
      }
      return json.data;
    },
    onSuccess: invalidateAll,
  });

  // 6. Verify Delivery OTP Mutation (calls dedicated /delivery/verify)
  const verifyDeliveryMutation = useMutation({
    mutationFn: async ({ orderId, otp, notes }: { orderId: string; otp: string; notes?: string }) => {
      const res = await fetch(`/api/rescue-orders/${orderId}/delivery/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp, notes }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error?.message || "Invalid delivery confirmation code");
      }
      return json.data;
    },
    onSuccess: invalidateAll,
  });

  return {
    orders: ordersQuery.data || [],
    isLoading: ordersQuery.isLoading,
    isError: ordersQuery.isError,
    error: ordersQuery.error,
    isStale: ordersQuery.isStaleData,
    lastUpdated: ordersQuery.lastUpdated,
    timeAgoText: ordersQuery.timeAgoText,
    refetch: ordersQuery.refetch,
    // Mutations
    acceptOrder: acceptMutation.mutateAsync,
    isAccepting: acceptMutation.isPending,
    declineOrder: declineMutation.mutateAsync,
    isDeclining: declineMutation.isPending,
    transitionOrder: transitionMutation.mutateAsync,
    isTransitioning: transitionMutation.isPending,
    verifyPickup: verifyPickupMutation.mutateAsync,
    isVerifyingPickup: verifyPickupMutation.isPending,
    verifyDelivery: verifyDeliveryMutation.mutateAsync,
    isVerifyingDelivery: verifyDeliveryMutation.isPending,
  };
}
