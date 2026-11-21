"use client";

import { useEffect, useState } from "react";
import { CheckCircle, Clock, Heart, MapPin, RefreshCw, XCircle } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import type { FoodRequest } from "@/db/schema/requests";

interface ReceiverRequestsTableProps {
  receiverId?: string;
}

export function ReceiverRequestsTable({ receiverId }: ReceiverRequestsTableProps) {
  const [requests, setRequests] = useState<FoodRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRequests = async () => {
    try {
      const url = receiverId
        ? `/api/food-requests?receiverId=${receiverId}&status=all&onlyActive=false`
        : `/api/food-requests?status=all&onlyActive=false`;
      const res = await fetch(url);
      const json = await res.json();
      if (res.ok && json.data) {
        setRequests(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch food requests:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [receiverId]);

  const handleCancelRequest = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this food request?")) return;
    try {
      await fetch(`/api/food-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });
      fetchRequests();
    } catch (err) {
      console.error("Failed to cancel request:", err);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border p-4">
        <div>
          <h3 className="font-semibold text-foreground text-sm">
            Active Community Needs
          </h3>
          <p className="text-xs text-muted-foreground">
            Surplus food requests posted to alert nearby food donors.
          </p>
        </div>

        <button
          onClick={() => {
            setRefreshing(true);
            fetchRequests();
          }}
          disabled={refreshing}
          className="flex items-center gap-1 rounded-md border border-border bg-card px-2.5 py-1 text-xs text-foreground hover:bg-muted/30"
        >
          <RefreshCw
            className={`size-3 ${refreshing ? "animate-spin" : ""}`}
          />
          <span>Refresh</span>
        </button>
      </div>

      {loading ? (
        <div className="flex min-h-[120px] items-center justify-center gap-2 text-xs text-muted-foreground">
          <Spinner className="size-4 text-primary" />
          <span>Loading requests&hellip;</span>
        </div>
      ) : requests.length === 0 ? (
        <div className="p-6 text-center text-xs text-muted-foreground">
          No food requests created yet. Use &ldquo;Post Food Need&rdquo; to notify donors.
        </div>
      ) : (
        <div className="divide-y divide-border">
          {requests.map((req) => (
            <div
              key={req.id}
              className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground text-sm">
                    {req.title}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                      req.status === "active"
                        ? "bg-primary/10 text-primary"
                        : req.status === "matched"
                        ? "bg-secondary/30 text-secondary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {req.status.toUpperCase()}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  <strong>{req.requestedPortions} portions</strong> &bull;{" "}
                  Preferences: {req.foodPreferences}
                  {req.dietaryConstraints ? ` (${req.dietaryConstraints})` : ""}
                </div>
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <MapPin className="size-3 text-primary" />
                  <span>{req.locationName}</span>
                </div>
              </div>

              {req.status === "active" && (
                <button
                  type="button"
                  onClick={() => handleCancelRequest(req.id)}
                  className="rounded border border-destructive/30 px-2 py-1 text-xs font-medium text-destructive hover:bg-destructive/10 self-end sm:self-auto"
                >
                  Cancel
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
