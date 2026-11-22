"use client";

import { useState } from "react";
import {
  Check,
  CheckCircle2,
  CreditCard,
  Crown,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
  Zap,
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
import { MONETIZATION_PLANS, PlanTier } from "@/lib/payments/service";

interface SponsorshipCheckoutModalProps {
  triggerButtonText?: string;
  defaultPlanId?: string;
  className?: string;
}

export function SponsorshipCheckoutModal({
  triggerButtonText = "Sponsor or Upgrade",
  defaultPlanId = "donor_subscription_pro",
  className,
}: SponsorshipCheckoutModalProps) {
  const [open, setOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState(defaultPlanId);
  const [processing, setProcessing] = useState(false);
  const [successReceipt, setSuccessReceipt] = useState<{
    planName: string;
    amountDisplay: string;
    receiptId: string;
  } | null>(null);

  const selectedPlan =
    MONETIZATION_PLANS.find((p) => p.id === selectedPlanId) ||
    MONETIZATION_PLANS[0];

  const handleCheckout = async () => {
    setProcessing(true);
    try {
      // 1. Create checkout order
      const checkoutRes = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          purpose: selectedPlan.id,
        }),
      });

      const checkoutJson = await checkoutRes.json();
      if (!checkoutRes.ok) {
        throw new Error(checkoutJson?.error?.message || "Checkout failed");
      }

      const { paymentRecordId, planName, amount, razorpayOrderId } = checkoutJson.data;

      // 2. Simulate or execute payment verification
      const verifyRes = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentRecordId,
          razorpayPaymentId: `pay_sim_${Date.now()}`,
          razorpaySignature: "simulated_valid_signature",
        }),
      });

      if (!verifyRes.ok) {
        throw new Error("Payment verification failed");
      }

      setSuccessReceipt({
        planName,
        amountDisplay: selectedPlan.priceDisplay,
        receiptId: razorpayOrderId,
      });
    } catch (err) {
      console.error("Payment error:", err);
      alert(err instanceof Error ? err.message : "Payment error occurred");
    } finally {
      setProcessing(false);
    }
  };

  const handleReset = () => {
    setSuccessReceipt(null);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className={
          className ||
          `${buttonVariants({ variant: "outline", size: "sm" })} gap-1.5 text-xs`
        }
      >
        <Sparkles className="size-3.5 text-amber-500" />
        <span>{triggerButtonText}</span>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-primary/10 p-1.5 text-primary">
              <HeartHandshake className="size-5" />
            </span>
            <div>
              <DialogTitle className="text-lg font-bold text-foreground">
                Tripti Commercial Monetization &amp; CSR Sponsorship
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Always 100% free for NGOs and community receivers. Supported by B2B ESG subscriptions and CSR logistics funds.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {successReceipt ? (
          <div className="space-y-4 rounded-xl border border-primary/40 bg-primary/5 p-6 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/15 text-primary">
              <CheckCircle2 className="size-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-foreground">
                Payment Successfully Confirmed!
              </h3>
              <p className="text-xs text-muted-foreground">
                Thank you for powering sustainable food rescue operations.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card p-4 text-xs space-y-2 text-left">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Plan / Purpose:</span>
                <span className="font-semibold text-foreground">
                  {successReceipt.planName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-semibold text-foreground">
                  {successReceipt.amountDisplay}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reference ID:</span>
                <span className="font-mono text-muted-foreground text-[11px]">
                  {successReceipt.receiptId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mode:</span>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                  Test / Simulated Mode Verified
                </span>
              </div>
            </div>

            <button
              onClick={handleReset}
              className={`${buttonVariants({ size: "default" })} w-full`}
            >
              Done &amp; Return to Dashboard
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Plan selection grid */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {MONETIZATION_PLANS.map((plan) => {
                const isSelected = plan.id === selectedPlanId;
                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlanId(plan.id)}
                    className={`cursor-pointer rounded-xl border p-4 transition-all ${
                      isSelected
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "border-border bg-card hover:border-primary/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground">
                        {plan.name}
                      </span>
                      {plan.popular && (
                        <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary">
                          Popular
                        </span>
                      )}
                    </div>

                    <div className="mt-2">
                      <span className="text-xl font-extrabold text-foreground">
                        {plan.priceDisplay}
                      </span>
                      <span className="text-[11px] text-muted-foreground ml-1">
                        /{plan.billingPeriod}
                      </span>
                    </div>

                    <p className="mt-1 text-[11px] text-muted-foreground line-clamp-2">
                      {plan.tagline}
                    </p>

                    <div className="mt-3 space-y-1 border-t border-border/60 pt-2 text-[11px] text-muted-foreground">
                      {plan.features.slice(0, 3).map((f, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                          <Check className="size-3 text-primary shrink-0" />
                          <span className="truncate">{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Simulated Mode Banner */}
            <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
              <ShieldCheck className="size-4 text-primary shrink-0" />
              <span>
                <strong>Test Mode Active:</strong> Razorpay test simulation enables instant checkout demonstration without real financial debit.
              </span>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md border border-border px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-muted/30"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={processing}
                onClick={handleCheckout}
                className={`${buttonVariants({ size: "default" })} gap-1.5`}
              >
                {processing ? (
                  <Spinner className="size-4" />
                ) : (
                  <CreditCard className="size-4" />
                )}
                <span>
                  Confirm {selectedPlan.priceDisplay} ({selectedPlan.name})
                </span>
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
