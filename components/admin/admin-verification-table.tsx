"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle,
  FileCheck,
  RefreshCw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { buttonVariants } from "@/components/ui/button";

interface OrganisationUser {
  id: string;
  email: string | null;
  displayName: string | null;
  organisationName: string | null;
  role: string;
  verificationStatus: "unverified" | "pending" | "verified" | "rejected";
  createdAt: string;
}

export function AdminVerificationTable() {
  const [organisations, setOrganisations] = useState<OrganisationUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrganisations = async () => {
    try {
      const res = await fetch("/api/admin/organisations");
      const json = await res.json();
      if (res.ok && json.data) {
        setOrganisations(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch organisations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganisations();
  }, []);

  const handleUpdateStatus = async (
    id: string,
    nextStatus: "verified" | "rejected" | "pending"
  ) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/organisations/${id}/verification`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (res.ok) {
        setOrganisations((prev) =>
          prev.map((org) =>
            org.id === id ? { ...org, verificationStatus: nextStatus } : org
          )
        );
      }
    } catch (err) {
      console.error("Failed to update verification status:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[140px] items-center justify-center gap-2 rounded-xl border border-border bg-card p-6 text-xs text-muted-foreground">
        <Spinner className="size-4 text-primary" />
        <span>Loading organisations verification queue&hellip;</span>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
      <div className="flex items-center justify-between border-b border-border p-4">
        <div>
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <FileCheck className="size-4 text-primary" />
            <span>Organisation Verification Desk</span>
          </h3>
          <p className="text-xs text-muted-foreground">
            Approve or reject commercial food donors and community NGOs
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setLoading(true);
            fetchOrganisations();
          }}
          className="rounded-md border border-border bg-card p-1.5 text-muted-foreground hover:bg-muted/30"
        >
          <RefreshCw className="size-3.5" />
        </button>
      </div>

      {organisations.length === 0 ? (
        <div className="p-8 text-center text-xs text-muted-foreground">
          No donor or receiver organisations currently registered.
        </div>
      ) : (
        <div className="divide-y divide-border">
          {organisations.map((org) => {
            const isBusy = updatingId === org.id;
            return (
              <div
                key={org.id}
                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between hover:bg-muted/10 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground text-xs sm:text-sm">
                      {org.organisationName || org.displayName || "Registered Entity"}
                    </span>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold capitalize text-muted-foreground">
                      {org.role}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        org.verificationStatus === "verified"
                          ? "bg-primary/15 text-primary"
                          : org.verificationStatus === "rejected"
                          ? "bg-destructive/15 text-destructive"
                          : "bg-amber-500/15 text-amber-600"
                      }`}
                    >
                      {org.verificationStatus}
                    </span>
                  </div>

                  <div className="text-[11px] text-muted-foreground">
                    Email: <strong>{org.email || "Pending sync"}</strong> &bull; Registered:{" "}
                    {new Date(org.createdAt).toLocaleDateString([], {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {org.verificationStatus !== "verified" && (
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => handleUpdateStatus(org.id, "verified")}
                      className={`${buttonVariants({ size: "sm" })} gap-1 h-7 text-xs`}
                    >
                      {isBusy ? (
                        <Spinner className="size-3" />
                      ) : (
                        <CheckCircle className="size-3" />
                      )}
                      <span>Approve</span>
                    </button>
                  )}

                  {org.verificationStatus !== "rejected" && (
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => handleUpdateStatus(org.id, "rejected")}
                      className={`${buttonVariants({
                        variant: "outline",
                        size: "sm",
                      })} gap-1 h-7 text-xs text-destructive hover:bg-destructive/10`}
                    >
                      <XCircle className="size-3" />
                      <span>Reject</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
