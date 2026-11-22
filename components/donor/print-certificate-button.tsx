"use client";

import { Printer } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export function PrintCertificateButton() {
  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <button
      type="button"
      onClick={handlePrint}
      className={`${buttonVariants({ variant: "outline", size: "sm" })} gap-1.5 text-xs print:hidden`}
    >
      <Printer className="size-3.5" />
      <span>Print / Save ESG Certificate (PDF)</span>
    </button>
  );
}
