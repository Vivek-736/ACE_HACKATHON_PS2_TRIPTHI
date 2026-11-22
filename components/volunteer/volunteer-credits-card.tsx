"use client";

import { useEffect, useState } from "react";
import {
  Award,
  CheckCircle2,
  Clock,
  History,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import type { VolunteerTierInfo } from "@/lib/credits/service";
import type { RescueCreditTransaction } from "@/db/schema/credits";

interface CreditStatementData {
  totalCredits: number;
  tier: VolunteerTierInfo;
  totalDeliveries: number;
  onTimeRate: string;
  transactions: RescueCreditTransaction[];
}

function formatTxDescription(desc: string): string {
  // Replace long 36-character raw UUIDs with a concise mission ID for compact display
  return desc.replace(
    /rescue mission ([0-9a-f]{8})-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
    "rescue mission #$1"
  );
}

export function VolunteerCreditsCard() {
  const [data, setData] = useState<CreditStatementData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCredits = async () => {
    try {
      const res = await fetch("/api/volunteers/credits");
      const json = await res.json();
      if (res.ok && json.data) {
        setData(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch volunteer credits:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCredits();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[160px] items-center justify-center gap-2 rounded-2xl border border-border bg-card text-xs text-muted-foreground">
        <Spinner className="size-4 text-primary" />
        <span>Loading Rescue Credits &amp; Tier Statement&hellip;</span>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-5">
      {/* Top Banner: Credits & Current Tier */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-600">
            <Award className="size-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-foreground">
                Rescue Credits Ledger
              </h3>
              <span
                className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${data.tier.badgeColorClass}`}
              >
                {data.tier.tierName}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Earned recognition points for verified on-time surplus rescues.
            </p>
          </div>
        </div>

        <div className="text-left sm:text-right">
          <div className="text-2xl font-extrabold text-foreground">
            {data.totalCredits.toLocaleString()}{" "}
            <span className="text-xs font-semibold text-muted-foreground">
              Credits
            </span>
          </div>
          <div className="text-[11px] text-muted-foreground flex items-center gap-1 sm:justify-end">
            <ShieldCheck className="size-3.5 text-primary" />
            <span>{data.onTimeRate}% Verified On-Time</span>
          </div>
        </div>
      </div>

      {/* Tier Progress Bar */}
      {data.tier.nextTierCredits !== null && (
        <div className="space-y-1.5 rounded-xl border border-border/80 bg-muted/20 p-3 text-xs">
          <div className="flex justify-between items-center text-muted-foreground">
            <span>
              Progress to next tier (<strong>{data.tier.nextTierCredits} Credits</strong>)
            </span>
            <span className="font-bold text-foreground">
              {data.tier.progressPercent}%
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-amber-500 transition-all duration-500"
              style={{ width: `${data.tier.progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Itemized Transactions Table */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-foreground">
          <span className="flex items-center gap-1.5">
            <History className="size-3.5 text-primary" />
            <span>Recent Credit Ledger Transactions</span>
          </span>
          <span className="text-muted-foreground text-[11px]">
            {data.transactions.length} entries
          </span>
        </div>

        {data.transactions.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
            Complete your first verified delivery to earn +50 Rescue Credits.
          </div>
        ) : (
          <div className="divide-y divide-border rounded-xl border overflow-hidden">
            {data.transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-start sm:items-center justify-between gap-3 p-3 text-xs hover:bg-muted/10 transition-colors"
              >
                <div className="min-w-0 space-y-0.5">
                  <div className="font-semibold text-foreground text-xs sm:text-sm leading-snug wrap-break-word">
                    {formatTxDescription(tx.description)}
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-muted-foreground flex items-center gap-1.5 flex-wrap">
                    <span className="capitalize">{tx.type.replace(/_/g, " ")}</span>
                    <span>&bull;</span>
                    <span>
                      {new Date(tx.createdAt).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`font-mono font-bold text-xs sm:text-sm ${
                      tx.amount >= 0 ? "text-primary" : "text-destructive"
                    }`}
                  >
                    {tx.amount >= 0 ? `+${tx.amount}` : tx.amount}
                  </span>
                  <div className="text-[10px] sm:text-[11px] text-muted-foreground">
                    Bal: {tx.balanceAfter}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Non-cash recognition disclaimer */}
      <div className="rounded-xl border border-border bg-muted/20 p-3 text-[11px] text-muted-foreground">
        <span>
          * Rescue Credits are non-cash community recognition points that elevate dispatch priority.
          Delivery compensation and fuel allowances are funded separately by donors and CSR sponsors.
        </span>
      </div>
    </div>
  );
}