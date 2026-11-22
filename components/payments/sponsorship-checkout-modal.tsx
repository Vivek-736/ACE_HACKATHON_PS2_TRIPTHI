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
import { MONETIZATION_PLANS, PlanTier } from "@/lib/payments/plans";

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

      <DialogContent
        style={{ maxWidth: "1180px", width: "95vw" }}
        className="p-6 sm:p-8 overflow-hidden rounded-2xl bg-card border border-border shadow-2xl"
      >
        <DialogHeader className="mb-3">
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-primary/10 p-2.5 text-primary shrink-0 ring-1 ring-primary/20">
              <HeartHandshake className="size-5" />
            </span>
            <div>
              <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
                Tripti Commercial Monetization &amp; CSR Sponsorship
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Always 100% free for NGOs and community receivers. Subsidized by B2B ESG analytics and corporate CSR logistics funds.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {successReceipt ? (
          <div className="space-y-4 rounded-xl border border-primary/40 bg-primary/5 p-6 text-center max-w-lg mx-auto">
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
            {/* Plan selection 4-column spacious grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {MONETIZATION_PLANS.map((plan) => {
                const isSelected = plan.id === selectedPlanId;
                const categoryBadge =
                  plan.category === "csr_sponsorship"
                    ? "CSR Fund"
                    : plan.category === "priority_fee"
                    ? "On-Demand"
                    : "B2B SaaS";

                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlanId(plan.id)}
                    className={`flex flex-col justify-between cursor-pointer rounded-xl border p-4.5 transition-all relative ${
                      isSelected
                        ? "border-primary bg-primary/5 ring-2 ring-primary/30 shadow-sm"
                        : "border-border bg-card hover:border-primary/40 hover:bg-muted/15"
                    }`}
                  >
                    <div>
                      {/* Badge row */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground tracking-wide">
                          {categoryBadge}
                        </span>
                        {plan.popular ? (
                          <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary">
                            Popular
                          </span>
                        ) : (
                          <div
                            className={`size-4 rounded-full border flex items-center justify-center ${
                              isSelected
                                ? "border-primary"
                                : "border-muted-foreground/30"
                            }`}
                          >
                            {isSelected && (
                              <div className="size-2 rounded-full bg-primary" />
                            )}
                          </div>
                        )}
                      </div>

                      {/* Plan title */}
                      <h4 className="text-sm font-bold text-foreground leading-tight">
                        {plan.name}
                      </h4>

                      {/* Price */}
                      <div className="mt-2.5 flex items-baseline gap-1">
                        <span className="text-2xl font-extrabold text-foreground tracking-tight">
                          {plan.priceDisplay}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          /{plan.billingPeriod}
                        </span>
                      </div>

                      {/* Tagline */}
                      <p className="mt-2 text-xs text-muted-foreground leading-relaxed min-h-[38px]">
                        {plan.tagline}
                      </p>
                    </div>

                    {/* Features list */}
                    <div className="mt-3.5 space-y-2 border-t border-border/60 pt-3 text-xs text-muted-foreground">
                      {plan.features.slice(0, 3).map((f, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <Check className="size-3.5 text-primary shrink-0 mt-0.5" />
                          <span className="leading-snug">{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Controls Row: Test mode note + Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-border/60">
              <div className="flex items-center gap-2 rounded-lg bg-muted/40 px-3.5 py-2 text-xs text-muted-foreground">
                <ShieldCheck className="size-4 text-primary shrink-0" />
                <span>
                  <strong>Test Mode Active:</strong> Razorpay simulation enabled without real card debit.
                </span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-md border border-border px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-muted/30 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={processing}
                  onClick={handleCheckout}
                  className={`${buttonVariants({ size: "default" })} gap-1.5 text-xs px-5`}
                >
                  {processing ? (
                    <Spinner className="size-4" />
                  ) : (
                    <CreditCard className="size-4" />
                  )}
                  <span>
                    Confirm {selectedPlan.priceDisplay} &bull; {selectedPlan.name}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
