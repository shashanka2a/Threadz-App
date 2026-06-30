"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, MapPin, CheckCircle2, XCircle } from "lucide-react";
import type { PincodeServiceability } from "@/types/shipment";

type PincodeCheckerProps = {
  compact?: boolean;
  defaultPin?: string;
  onResult?: (result: PincodeServiceability | null) => void;
};

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

  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      <form onSubmit={check} className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1">
          {!compact && (
            <Label className="text-sm mb-1.5 block">Check delivery to your pincode</Label>
          )}
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <Input
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="Enter 6-digit pincode"
              className="pl-10 rounded-none border-neutral-300"
              maxLength={6}
              inputMode="numeric"
            />
          </div>
        </div>
        <Button
          type="submit"
          disabled={loading || pin.length !== 6}
          className="rounded-none bg-black text-white hover:bg-neutral-800 sm:min-w-[120px]"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Checking
            </>
          ) : (
            "Check"
          )}
        </Button>
      </form>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {result && (
        <div
          className={`text-sm border p-3 rounded-none ${
            result.serviceable
              ? "border-green-200 bg-green-50 text-green-900"
              : "border-red-200 bg-red-50 text-red-900"
          }`}
        >
          <div className="flex items-start gap-2">
            {result.serviceable ? (
              <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
            ) : (
              <XCircle className="h-4 w-4 mt-0.5 shrink-0" />
            )}
            <div>
              <p className="font-medium">
                {result.serviceable
                  ? `Delivery available to ${result.pincode}`
                  : `Not serviceable: ${result.pincode}`}
              </p>
              {result.city && (
                <p className="text-xs mt-1 opacity-80">
                  {result.city}
                  {result.state ? `, ${result.state}` : ""}
                </p>
              )}
              <p className="text-xs mt-1 opacity-80">
                Prepaid: {result.prepaid ? "Yes" : "No"} · COD:{" "}
                {result.cod ? "Yes" : "No"}
              </p>
              {result.message && (
                <p className="text-xs mt-1 opacity-70">{result.message}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
