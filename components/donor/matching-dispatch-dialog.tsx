"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Clock,
  Compass,
  Flame,
  Info,
  MapPin,
  Send,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Truck,
  Users,
  XCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { buttonVariants } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import type { RankedMatch } from "@/lib/matching/types";

interface MatchingDispatchDialogProps {
  listingId: string;
  listingTitle: string;
  remainingPortions: number;
  onDispatchSuccess?: () => void;
}

export function MatchingDispatchDialog({
  listingId,
  listingTitle,
  remainingPortions,
  onDispatchSuccess,
}: MatchingDispatchDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<RankedMatch[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [dispatchingId, setDispatchingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchMatches = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/matching/listings/${listingId}/run`, {
        method: "POST",
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error?.message || "Failed to run matching engine");
      }
      setMatches(json.data.matches || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error executing matching");
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      fetchMatches();
    }
  };

  const handleCreateOrder = async (match: RankedMatch) => {
    setDispatchingId(match.receiver.id);
    setError(null);
    try {
      const portionsToAllocate = Math.min(
        remainingPortions,
        match.receiver.currentCapacity
      );

      const res = await fetch("/api/rescue-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId,
          receiverId: match.receiver.id,
          volunteerId: match.volunteer ? match.volunteer.id : null,
          allocatedPortions: portionsToAllocate,
          notes: `Matched via deterministic engine (Score: ${match.scores.totalScore}/100)`,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error?.message || "Failed to create rescue order");
      }

      setSuccessMsg(
        `Rescue order created! Pickup OTP: ${json.data.pickupOtp}. Assigned to ${match.receiver.organisationName}.`
      );
      setTimeout(() => {
        setOpen(false);
        setSuccessMsg(null);
        if (onDispatchSuccess) onDispatchSuccess();
      }, 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error dispatching order");
    } finally {
      setDispatchingId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger
        className={`${buttonVariants({
          size: "sm",
          variant: "outline",
        })} gap-1.5`}
      >
        <Sparkles className="size-3.5 text-primary" />
        <span>Match &amp; Dispatch</span>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-primary/10 p-1.5 text-primary">
              <Compass className="size-5" />
            </span>
            <div>
              <DialogTitle className="text-xl font-bold text-foreground">
                Intelligent Matching &amp; Dispatch
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Ranked receivers and rescue volunteers for &ldquo;{listingTitle}&rdquo;
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {error && (
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/10 p-3 text-xs font-semibold text-primary">
            <CheckCircle2 className="size-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {loading ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center gap-2 text-xs text-muted-foreground">
            <Spinner className="size-5 text-primary" />
            <p>Evaluating distance, urgency, reliability, and receiver capacity&hellip;</p>
          </div>
        ) : matches.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground">
            No registered receivers currently available in this rescue radius.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-muted/20 p-3 text-xs text-muted-foreground">
              <div className="font-semibold text-foreground mb-1">
                Deterministic Ranking Formula:
              </div>
              <div>
                Score = 35% Distance + 25% Urgency + 20% Volunteer Reliability + 20% Need Fit (+ small Rescue Credit tie-breaker).
              </div>
            </div>

            <div className="space-y-3">
              {matches.map((m, idx) => (
                <div
                  key={m.receiver.id}
                  className={`rounded-xl border p-4 transition-all ${
                    m.isEligible
                      ? "border-border bg-card hover:border-primary/50"
                      : "border-border/50 bg-muted/10 opacity-70"
                  }`}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-foreground">
                          #{idx + 1} {m.receiver.organisationName}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                            m.scores.totalScore >= 80
                              ? "bg-primary/10 text-primary"
                              : m.scores.totalScore >= 60
                              ? "bg-secondary/30 text-secondary-foreground"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {m.scores.totalScore} / 100
                        </span>
                        {!m.isEligible && (
                          <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold text-destructive">
                            Disqualified
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 gap-x-4 gap-y-1 text-xs text-muted-foreground sm:grid-cols-2">
                        <div className="flex items-center gap-1">
                          <MapPin className="size-3 text-primary shrink-0" />
                          <span>{m.receiver.locationName} (~{m.receiver.distanceFromDonorKm} km)</span>
                        </div>
                        <div>
                          <strong>Receiver Capacity:</strong> {m.receiver.currentCapacity} portions
                        </div>
                        {m.volunteer && (
                          <div className="flex items-center gap-1 sm:col-span-2">
                            <Truck className="size-3 text-secondary-foreground shrink-0" />
                            <span>
                              Volunteer: <strong>{m.volunteer.displayName}</strong> ({m.volunteer.transportMode}) &bull; {m.volunteer.distanceFromDonorKm} km away &bull; {m.volunteer.onTimeRate}% on-time
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Explanation bullets */}
                      <div className="mt-2 space-y-0.5 border-t border-border/60 pt-2 text-[11px] text-muted-foreground">
                        {m.scores.explanations.map((exp, eIdx) => (
                          <div key={eIdx} className="flex items-center gap-1">
                            <span className="text-primary">&bull;</span>
                            <span>{exp}</span>
                          </div>
                        ))}
                        {!m.isEligible && (
                          <div className="text-destructive font-medium mt-1">
                            Disqualification: {m.disqualificationReasons.join("; ")}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="self-end sm:self-start shrink-0">
                      <button
                        type="button"
                        disabled={!m.isEligible || dispatchingId === m.receiver.id}
                        onClick={() => handleCreateOrder(m)}
                        className={`${buttonVariants({
                          size: "sm",
                        })} gap-1.5`}
                      >
                        {dispatchingId === m.receiver.id ? (
                          <Spinner className="size-3.5" />
                        ) : (
                          <Send className="size-3.5" />
                        )}
                        <span>Dispatch Rescue</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
