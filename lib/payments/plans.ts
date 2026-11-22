import type { PaymentPurpose } from "@/db/schema/payments";

export interface PlanTier {
  id: PaymentPurpose;
  name: string;
  category: "donor_saas" | "csr_sponsorship" | "priority_fee";
  pricePaise: number;
  priceDisplay: string;
  billingPeriod: string;
  tagline: string;
  features: string[];
  popular?: boolean;
}

export const MONETIZATION_PLANS: PlanTier[] = [
  {
    id: "donor_subscription_pro",
    name: "Pro Waste Analytics",
    category: "donor_saas",
    pricePaise: 49900, // ₹499.00
    priceDisplay: "₹499",
    billingPeriod: "per month",
    tagline: "For restaurants and caterers looking to optimize food preparation",
    popular: true,
    features: [
      "Kitchen overproduction trends by day of week",
      "Prep volume insights to cut food waste at source",
      "Scope 3 environmental diversion metrics",
      "Priority matching for active surplus postings",
      "Standard email & in-app rescue alerts",
    ],
  },
  {
    id: "donor_subscription_enterprise",
    name: "Enterprise ESG Suite",
    category: "donor_saas",
    pricePaise: 149900, // ₹1,499.00
    priceDisplay: "₹1,499",
    billingPeriod: "per month",
    tagline: "For hotels, supermarket chains and multi-location canteens",
    features: [
      "Everything in Pro Analytics",
      "Audit-grade ESG & CSR report exports (PDF & CSV)",
      "Multi-facility surplus dashboard",
      "Dedicated CSR impact footprint certificate",
      "Custom carbon emissions avoided audit trail",
    ],
  },
  {
    id: "csr_sponsorship",
    name: "CSR Rescue Batch (500 Meals)",
    category: "csr_sponsorship",
    pricePaise: 500000, // ₹5,000.00
    priceDisplay: "₹5,000",
    billingPeriod: "per batch sponsorship",
    tagline: "Corporate sponsors funding volunteer fuel, transport & packing",
    features: [
      "Directly funds logistics for 500 rescued meals",
      "Subsidizes volunteer travel allowances",
      "Co-branded impact plaque on receiver acknowledgements",
      "Tax-ready CSR expenditure certification",
      "Transparent audit of receiver shelters supported",
    ],
  },
  {
    id: "priority_clearance_fee",
    name: "Priority 30-Min Clearance",
    category: "priority_fee",
    pricePaise: 29900, // ₹299.00
    priceDisplay: "₹299",
    billingPeriod: "one-time per event",
    tagline: "For weddings and banquets with strict venue handover deadlines",
    features: [
      "Instant priority push to top-rated nearby couriers",
      "Guaranteed courier dispatch within 30 minutes",
      "Dedicated rescue monitor oversight",
      "Fast-track receiver shelter handoff",
    ],
  },
];