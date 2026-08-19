"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, MapPin, CheckCircle2, XCircle, Truck, Clock } from "lucide-react";
import type { PincodeServiceability } from "@/types/shipment";

type PincodeCheckerProps = {
  compact?: boolean;
  defaultPin?: string;
  onResult?: (result: PincodeServiceability | null) => void;
};

const fieldClass =
  "h-10 rounded-none border-border bg-background text-sm text-foreground focus-visible:border-foreground focus-visible:ring-foreground/20";

export function PincodeChecker({
  compact = false,
  defaultPin = "",
  onResult,
}: PincodeCheckerProps) {
  const [pin, setPin] = useState(defaultPin);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PincodeServiceability | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPin(defaultPin);
    if (!defaultPin) {
      setResult(null);
      setError(null);
    }
  }, [defaultPin]);

  const check = async (e?: FormEvent) => {
    e?.preventDefault();
    const normalized = pin.replace(/\D/g, "").slice(0, 6);
    if (normalized.length !== 6) {
      setError("Enter a valid 6-digit pincode");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/shipping/pincode?pin=${encodeURIComponent(normalized)}`
      );
      const data = (await res.json()) as PincodeServiceability;
      setResult(data);
      onResult?.(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not check pincode");
      setResult(null);
      onResult?.(null);
    } finally {
      setLoading(false);
    }
  };

  const content = (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      {!compact && (
        <div className="flex items-center gap-2">
          <Truck className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
          <Label htmlFor="pincode-check" className="text-sm font-medium text-foreground">
            Check delivery to your pincode
          </Label>
        </div>
      )}

      <form onSubmit={check} className="flex items-center gap-2">
        <div className="relative flex-1 min-w-0">
          <MapPin
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="pincode-check"
            value={pin}
            onChange={(e) => {
              setPin(e.target.value.replace(/\D/g, "").slice(0, 6));
              setResult(null);
              setError(null);
            }}
            placeholder="Enter 6-digit pincode"
            className={`${fieldClass} pl-10 pr-3`}
            maxLength={6}
            inputMode="numeric"
            autoComplete="postal-code"
            aria-describedby={error ? "pincode-error" : result ? "pincode-result" : undefined}
          />
        </div>
        <Button
          type="submit"
          disabled={loading || pin.length !== 6}
          className="h-10 rounded-none shrink-0 px-5 bg-foreground text-background hover:bg-foreground/90 disabled:opacity-50 transition-transform active:scale-95"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              <span className="ml-1.5">Checking</span>
            </>
          ) : (
            "Check"
          )}
        </Button>
      </form>

      {error && (
        <p id="pincode-error" className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      {result && (
        <div
          id="pincode-result"
          role="status"
          aria-live="polite"
          className={`text-sm border p-3 rounded-none transition-all ${
            result.serviceable
              ? "border-green-500/30 bg-green-50/70 text-green-950 dark:bg-green-950/30 dark:text-green-200"
              : "border-destructive/30 bg-red-50/70 text-red-950 dark:bg-red-950/30 dark:text-red-200"
          }`}
        >
          <div className="flex items-start gap-2.5">
            {result.serviceable ? (
              <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-green-600 dark:text-green-400" aria-hidden="true" />
            ) : (
              <XCircle className="h-4 w-4 mt-0.5 shrink-0 text-destructive" aria-hidden="true" />
            )}
            <div className="min-w-0 space-y-1">
              <p className="font-medium leading-snug">
                {result.serviceable
                  ? `Delivery available to ${result.pincode}`
                  : `Delivery not available for ${result.pincode}`}
              </p>
              {result.city && (
                <p className="text-xs text-muted-foreground">
                  {result.city}
                  {result.state ? `, ${result.state}` : ""}
                </p>
              )}
              {result.serviceable && (result.estimatedDeliveryDate || result.estimatedDays) && (
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300 pt-0.5">
                  <Clock className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />
                  <span>
                    Estimated delivery: {result.estimatedDeliveryDate ? `${result.estimatedDeliveryDate} (${result.estimatedDays})` : result.estimatedDays}
                  </span>
                </div>
              )}
              <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                <span>Prepaid: {result.prepaid ? "Yes" : "No"}</span>
                <span>COD: {result.cod ? "Yes" : "No"}</span>
              </div>
              {result.message && (
                <p className="text-xs text-muted-foreground pt-0.5">{result.message}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (compact) return content;

  return (
    <div className="border border-border bg-card p-4 sm:p-5">{content}</div>
  );
}

