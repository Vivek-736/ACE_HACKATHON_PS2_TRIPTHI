"use client";

import { useState } from "react";
import {
  Award,
  CheckCircle2,
  KeyRound,
  MapPin,
  Navigation,
  RefreshCw,
  Truck,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { buttonVariants } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { LiveStatusIndicator } from "@/components/shared/live-status-indicator";
import { useActiveOrders } from "@/hooks/use-active-orders";
import type { OrderStatus } from "@/db/schema/orders";

interface VolunteerOrderConsoleProps {
  volunteerUserId: string;
  onRefreshStats?: () => void;
}

export function VolunteerOrderConsole({
  volunteerUserId,
  onRefreshStats,
}: VolunteerOrderConsoleProps) {
  // Use TanStack Query Hook with 10s auto-polling, visibility pause, and instant mutation invalidation
  const {
    orders,
    isLoading,
    isError,
    isStale,
    lastUpdated,
    timeAgoText,
    refetch,
    acceptOrder,
    isAccepting,
    declineOrder,
    isDeclining,
    transitionOrder,
    isTransitioning,
    verifyPickup,
    isVerifyingPickup,
    verifyDelivery,
    isVerifyingDelivery,
  } = useActiveOrders("all");

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // OTP Verification Modal State
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otpTargetStatus, setOtpTargetStatus] = useState<"collected" | "delivered">("collected");
  const [otpTargetOrderId, setOtpTargetOrderId] = useState<string | null>(null);
  const [submittedOtp, setSubmittedOtp] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpSuccessMsg, setOtpSuccessMsg] = useState<string | null>(null);

  // Filter active in-flight order vs open opportunities
  const activeOrder = orders.find(
    (o) =>
      o.volunteerId === volunteerUserId &&
      ["accepted", "at_pickup", "collected", "at_receiver"].includes(o.status)
  );

  const availableOpportunities = orders.filter(
    (o) => o.status === "pending" && !o.volunteerId
  );

  const isActionBusy =
    isAccepting ||
    isDeclining ||
    isTransitioning ||
    isVerifyingPickup ||
    isVerifyingDelivery;

  const handleAcceptAssignment = async (orderId: string) => {
    setErrorMsg(null);
    try {
      await acceptOrder(orderId);
      if (onRefreshStats) onRefreshStats();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Error accepting assignment");
    }
  };

  const handleDeclineAssignment = async (orderId: string) => {
    if (!confirm("Are you sure you want to decline and release this rescue assignment?")) return;
    setErrorMsg(null);
    try {
      await declineOrder({ orderId, reason: "Volunteer declined from console" });
      if (onRefreshStats) onRefreshStats();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Error declining assignment");
    }
  };

  const handleSimpleTransition = async (orderId: string, targetStatus: OrderStatus) => {
    setErrorMsg(null);
    try {
      await transitionOrder({ orderId, status: targetStatus });
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Error transitioning order");
    }
  };

  const openOtpModal = (orderId: string, status: "collected" | "delivered") => {
    setOtpTargetOrderId(orderId);
    setOtpTargetStatus(status);
    setSubmittedOtp("");
    setOtpError(null);
    setOtpSuccessMsg(null);
    setOtpModalOpen(true);
  };

  const handleSubmitOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpTargetOrderId) return;

    setOtpError(null);

    try {
      if (otpTargetStatus === "collected") {
        await verifyPickup({
          orderId: otpTargetOrderId,
          otp: submittedOtp.trim(),
        });
        setOtpSuccessMsg("Food pickup verified! Please transport carefully to receiver.");
      } else {
        await verifyDelivery({
          orderId: otpTargetOrderId,
          otp: submittedOtp.trim(),
        });
        setOtpSuccessMsg("Delivery completed! 50 Rescue Credits awarded to your account.");
      }

      setTimeout(() => {
        setOtpModalOpen(false);
        if (onRefreshStats) onRefreshStats();
      }, 1500);
    } catch (err: unknown) {
      setOtpError(err instanceof Error ? err.message : "Error validating handoff OTP");
    }
  };

  const steps = [
    { id: "accepted", label: "Accepted" },
    { id: "at_pickup", label: "At Pickup" },
    { id: "collected", label: "Collected" },
    { id: "at_receiver", label: "At Receiver" },
    { id: "delivered", label: "Delivered" },
  ];

  const getStepIndex = (status: OrderStatus) => {
    return steps.findIndex((s) => s.id === status);
  };

  return (
    <div className="space-y-6">
      {/* Live Polling Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-3 shadow-xs">
        <div className="flex items-center gap-2">
          <Truck className="size-4 text-primary" />
          <span className="text-xs font-semibold text-foreground">
            Rescue Missions &amp; Opportunity Dispatch
          </span>
        </div>

        <LiveStatusIndicator
          lastUpdated={lastUpdated}
          timeAgoText={timeAgoText}
          isStale={isStale}
          isError={isError}
          isLoading={isLoading}
          onRefresh={() => refetch()}
          label="Live Dispatch"
        />
      </div>

      {errorMsg && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
          {errorMsg}
        </div>
      )}

      {/* 1. Active Delivery in Progress (if any) */}
      {activeOrder && (
        <div className="rounded-xl border-2 border-primary/40 bg-card p-6 shadow-sm space-y-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary uppercase">
                <Truck className="size-3.5" />
                <span>Active Rescue Mission</span>
              </div>
              <h2 className="mt-1 text-lg font-bold text-foreground">
                {activeOrder.listingTitle} ({activeOrder.allocatedPortions} Portions)
              </h2>
              <p className="text-xs text-muted-foreground">
                Donor: <strong>{activeOrder.donorOrganisation}</strong> &rarr; Receiver: <strong>{activeOrder.receiverOrganisation}</strong>
              </p>
            </div>

            <button
              onClick={() => handleDeclineAssignment(activeOrder.id)}
              disabled={isActionBusy || activeOrder.status === "collected" || activeOrder.status === "at_receiver"}
              className="text-xs text-muted-foreground hover:text-destructive underline disabled:opacity-40"
            >
              Release / Decline
            </button>
          </div>

          {/* Stepper Progress */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              {steps.map((st, idx) => {
                const currentIdx = getStepIndex(activeOrder.status);
                const isCompleted = idx <= currentIdx;
                const isCurrent = idx === currentIdx;

                return (
                  <div key={st.id} className="flex flex-col items-center text-center flex-1">
                    <div
                      className={`size-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isCurrent
                          ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                          : isCompleted
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <span
                      className={`text-[10px] mt-1 font-medium ${
                        isCurrent ? "text-primary font-bold" : "text-muted-foreground"
                      }`}
                    >
                      {st.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Route details */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 rounded-lg border border-border bg-muted/20 p-4 text-xs text-muted-foreground">
            <div>
              <div className="font-semibold text-foreground flex items-center gap-1">
                <MapPin className="size-3.5 text-primary" />
                Pickup Location:
              </div>
              <p className="mt-0.5">{activeOrder.donorLocation}</p>
            </div>
            <div>
              <div className="font-semibold text-foreground flex items-center gap-1">
                <Navigation className="size-3.5 text-secondary-foreground" />
                Drop-off Destination:
              </div>
              <p className="mt-0.5">{activeOrder.receiverOrganisation}</p>
            </div>
          </div>

          {/* Action buttons based on status */}
          <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
            {activeOrder.status === "accepted" && (
              <button
                type="button"
                disabled={isActionBusy}
                onClick={() => handleSimpleTransition(activeOrder.id, "at_pickup")}
                className={`${buttonVariants({ size: "default" })} gap-1.5`}
              >
                {isTransitioning ? (
                  <Spinner className="size-4" />
                ) : (
                  <MapPin className="size-4" />
                )}
                <span>Arrived at Donor Facility</span>
              </button>
            )}

            {activeOrder.status === "at_pickup" && (
              <button
                type="button"
                disabled={isActionBusy}
                onClick={() => openOtpModal(activeOrder.id, "collected")}
                className={`${buttonVariants({ size: "default" })} gap-1.5`}
              >
                <KeyRound className="size-4" />
                <span>Verify &amp; Collect Food (Enter Pickup OTP)</span>
              </button>
            )}

            {activeOrder.status === "collected" && (
              <button
                type="button"
                disabled={isActionBusy}
                onClick={() => handleSimpleTransition(activeOrder.id, "at_receiver")}
                className={`${buttonVariants({ size: "default" })} gap-1.5`}
              >
                {isTransitioning ? (
                  <Spinner className="size-4" />
                ) : (
                  <Truck className="size-4" />
                )}
                <span>Arrived at Receiver Destination</span>
              </button>
            )}

            {activeOrder.status === "at_receiver" && (
              <button
                type="button"
                disabled={isActionBusy}
                onClick={() => openOtpModal(activeOrder.id, "delivered")}
                className={`${buttonVariants({ size: "default" })} gap-1.5`}
              >
                <CheckCircle2 className="size-4" />
                <span>Complete Delivery (Enter Delivery OTP)</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 2. Available Rescue Opportunities */}
      <div className="rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border p-4">
          <div>
            <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
              <span>Available Rescue Opportunities</span>
              <span className="rounded-full bg-secondary/30 px-2 py-0.5 text-xs font-bold text-secondary-foreground">
                {availableOpportunities.length} Available
              </span>
            </h3>
            <p className="text-xs text-muted-foreground">
              Surplus orders ready for transport to nearby shelters and community kitchens.
            </p>
          </div>

          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="flex items-center gap-1 rounded-md border border-border bg-card px-2.5 py-1 text-xs text-foreground hover:bg-muted/30"
          >
            <RefreshCw className={`size-3 ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>

        {isLoading && orders.length === 0 ? (
          <div className="flex min-h-[140px] items-center justify-center gap-2 text-xs text-muted-foreground">
            <Spinner className="size-4 text-primary" />
            <span>Checking nearby opportunities&hellip;</span>
          </div>
        ) : availableOpportunities.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground">
            No open rescue assignments right now. New surplus postings match automatically.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {availableOpportunities.map((op) => (
              <div
                key={op.id}
                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between hover:bg-muted/10 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground text-sm">
                      {op.listingTitle}
                    </span>
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                      {op.allocatedPortions} Portions
                    </span>
                    <span className="rounded-sm bg-muted px-1.5 py-0.5 text-[10px] capitalize text-muted-foreground">
                      {op.dietType}
                    </span>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    From: <strong>{op.donorOrganisation}</strong> &bull; To: <strong>{op.receiverOrganisation}</strong>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground pt-0.5">
                    <span className="flex items-center gap-1">
                      <MapPin className="size-3 text-primary" />
                      {op.donorLocation}
                    </span>
                    <span className="flex items-center gap-1">
                      <Award className="size-3 text-accent-foreground" />
                      +50 Rescue Credits
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isActionBusy || !!activeOrder}
                  onClick={() => handleAcceptAssignment(op.id)}
                  className={`${buttonVariants({ size: "sm" })} gap-1 self-end sm:self-auto`}
                >
                  {isAccepting ? (
                    <Spinner className="size-3.5" />
                  ) : (
                    <Truck className="size-3.5" />
                  )}
                  <span>Accept Rescue</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* OTP Entry Dialog Modal */}
      <Dialog open={otpModalOpen} onOpenChange={setOtpModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-primary/10 p-1.5 text-primary">
                <KeyRound className="size-5" />
              </span>
              <div>
                <DialogTitle className="text-lg font-bold text-foreground">
                  {otpTargetStatus === "collected"
                    ? "Enter Pickup Handoff OTP"
                    : "Enter Delivery Confirmation OTP"}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  {otpTargetStatus === "collected"
                    ? "Ask the food donor representative for their 4-digit pickup code."
                    : "Ask the receiver shelter representative for their 4-digit delivery confirmation code."}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {otpError && (
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
              {otpError}
            </div>
          )}

          {otpSuccessMsg && (
            <div className="flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/10 p-3 text-xs font-semibold text-primary">
              <CheckCircle2 className="size-4 shrink-0" />
              <span>{otpSuccessMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmitOtp} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                4-Digit Handoff Code *
              </label>
              <input
                type="text"
                maxLength={6}
                required
                autoFocus
                value={submittedOtp}
                onChange={(e) => setSubmittedOtp(e.target.value)}
                placeholder="e.g. 8492"
                className="w-full text-center font-mono text-2xl tracking-widest rounded-md border border-input bg-card py-2 text-foreground focus:border-primary focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setOtpModalOpen(false)}
                className="rounded-md border border-border px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-muted/30"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isActionBusy || !!otpSuccessMsg}
                className={`${buttonVariants({ size: "default" })} gap-1.5`}
              >
                {isVerifyingPickup || isVerifyingDelivery ? (
                  <Spinner className="size-4" />
                ) : (
                  <CheckCircle2 className="size-4" />
                )}
                <span>Verify Code</span>
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
