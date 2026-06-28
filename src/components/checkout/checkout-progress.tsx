"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { cn } from "@/components/ui/utils";

const STEPS = [
  { id: "cart", label: "Cart", href: "/cart" },
  { id: "shipping", label: "Shipping", href: "/checkout/shipping" },
  { id: "payment", label: "Payment", href: "/checkout/payment" },
  { id: "success", label: "Done", href: "/checkout/success" },
] as const;

export type CheckoutStep = (typeof STEPS)[number]["id"];

type CheckoutProgressProps = {
  current: CheckoutStep;
};

export function CheckoutProgress({ current }: CheckoutProgressProps) {
  const currentIndex = STEPS.findIndex((step) => step.id === current);

  return (
    <nav aria-label="Checkout progress" className="mb-6 md:mb-8 -mx-1 px-1 overflow-x-auto">
      <ol className="flex items-center justify-start sm:justify-center gap-1 sm:gap-2 md:gap-4 min-w-max sm:min-w-0 mx-auto w-full sm:w-auto px-1">
        {STEPS.map((step, index) => {
          const isComplete = index < currentIndex;
          const isCurrent = step.id === current;
          const isClickable = isComplete && step.id !== "success";

          return (
            <li key={step.id} className="flex items-center gap-1 sm:gap-2 md:gap-4 shrink-0">
              <div className="flex flex-col items-center gap-1 min-w-[3.25rem] sm:min-w-[4.5rem]">
                {isClickable ? (
                  <Link
                    href={step.href}
                    className={cn(
                      "flex h-9 w-9 sm:h-8 sm:w-8 items-center justify-center rounded-full border text-xs font-medium transition-colors",
                      "border-foreground bg-foreground text-background hover:opacity-80",
                    )}
                  >
                    <Check className="h-4 w-4" />
                  </Link>
                ) : (
                  <div
                    className={cn(
                      "flex h-9 w-9 sm:h-8 sm:w-8 items-center justify-center rounded-full border text-xs font-medium transition-colors",
                      isCurrent && "border-foreground bg-foreground text-background",
                      isComplete && "border-foreground bg-foreground text-background",
                      !isCurrent && !isComplete && "border-neutral-300 bg-white text-neutral-500",
                    )}
                  >
                    {isComplete ? <Check className="h-4 w-4" /> : index + 1}
                  </div>
                )}
                <span
                  className={cn(
                    "text-[9px] sm:text-xs uppercase tracking-wider text-center leading-tight",
                    isCurrent ? "text-foreground font-medium" : "text-muted-foreground",
                  )}
                >
                  {step.label}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={cn(
                    "hidden sm:block h-px w-6 md:w-16 mb-5 transition-colors shrink-0",
                    index < currentIndex ? "bg-foreground" : "bg-neutral-300",
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
