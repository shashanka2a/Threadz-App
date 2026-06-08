"use client";

import { Loader2 } from "lucide-react";

type CheckoutLoadingOverlayProps = {
  message?: string;
};

export function CheckoutLoadingOverlay({
  message = "Please wait...",
}: CheckoutLoadingOverlayProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/85 backdrop-blur-sm animate-in fade-in duration-200"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex flex-col items-center gap-4 rounded-none border border-border bg-card px-10 py-8 shadow-lg">
        <Loader2 className="h-10 w-10 animate-spin text-foreground" />
        <p className="text-sm font-medium text-foreground">{message}</p>
        <p className="text-xs text-muted-foreground">This will only take a moment</p>
      </div>
    </div>
  );
}
