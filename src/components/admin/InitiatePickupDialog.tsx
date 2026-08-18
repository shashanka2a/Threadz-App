"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Truck, Calendar, MapPin, PackageCheck } from "lucide-react";
import { toast } from "sonner";
import type { AdminOrder } from "@/lib/db/admin-orders";

type InitiatePickupDialogProps = {
  order: AdminOrder;
  onSuccess?: () => void;
  triggerButton?: React.ReactNode;
};

export function InitiatePickupDialog({
  order,
  onSuccess,
  triggerButton,
}: InitiatePickupDialogProps) {
  const [open, setOpen] = useState(false);
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  const [pickupDate, setPickupDate] = useState(tomorrow);
  const [pickupTime, setPickupTime] = useState("14:00:00");
  const [packageCount, setPackageCount] = useState("1");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/orders/${encodeURIComponent(order.id)}/return/pickup`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pickupDate,
            pickupTime,
            expectedPackageCount: parseInt(packageCount, 10) || 1,
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to schedule pickup");
      }

      toast.success(
        data.message ??
          `Delhivery reverse pickup scheduled successfully (ID: ${data.pickupId})`
      );
      setOpen(false);
      onSuccess?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Pickup scheduling failed");
    } finally {
      setLoading(false);
    }
  };

  const addressString = [
    order.addressLine1,
    order.addressLine2,
    `${order.city}, ${order.state} ${order.postalCode}`,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton ?? (
          <Button
            variant="outline"
            size="sm"
            className="rounded-none border-amber-300 text-amber-800 hover:bg-amber-50 hover:text-amber-900 text-xs gap-1.5"
          >
            <Truck className="h-3.5 w-3.5 text-amber-700" />
            Initiate Pickup
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="rounded-none max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <div className="flex items-center gap-2 text-amber-800 font-serif text-xl">
              <Truck className="h-5 w-5 shrink-0" />
              <DialogTitle className="font-serif">Schedule Delhivery Pickup</DialogTitle>
            </div>
            <DialogDescription className="text-xs text-neutral-600 pt-1">
              Dispatch a Delhivery executive to collect the return package from the customer&apos;s address.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4 text-sm">
            <div className="bg-neutral-50 p-3 border border-neutral-200 rounded-none space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-neutral-500">Order ID:</span>
                <span className="font-mono font-medium">{order.id}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-neutral-500">Customer:</span>
                <span className="font-medium">{order.fullName} ({order.phone})</span>
              </div>
              <div className="flex items-start gap-1.5 pt-1 text-xs border-t border-neutral-200">
                <MapPin className="h-3.5 w-3.5 text-neutral-500 shrink-0 mt-0.5" />
                <span className="text-neutral-700 break-words">{addressString}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="pickup-date" className="text-xs font-medium flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" /> Pickup Date
                </Label>
                <Input
                  id="pickup-date"
                  type="date"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  required
                  className="rounded-none font-mono text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="pickup-time" className="text-xs font-medium">
                  Pickup Slot
                </Label>
                <Select value={pickupTime} onValueChange={setPickupTime}>
                  <SelectTrigger id="pickup-time" className="rounded-none text-xs">
                    <SelectValue placeholder="Select Slot" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10:00:00">Morning (10:00 - 13:00)</SelectItem>
                    <SelectItem value="14:00:00">Afternoon (14:00 - 17:00)</SelectItem>
                    <SelectItem value="18:00:00">Evening (18:00 - 20:00)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="pkg-count" className="text-xs font-medium">
                Expected Package Count
              </Label>
              <Input
                id="pkg-count"
                type="number"
                min="1"
                max="10"
                value={packageCount}
                onChange={(e) => setPackageCount(e.target.value)}
                className="rounded-none font-mono text-xs"
              />
            </div>

            <div className="flex items-center gap-2 p-2.5 bg-amber-50 border border-amber-200 text-amber-900 text-xs">
              <PackageCheck className="h-4 w-4 shrink-0 text-amber-700" />
              <span>
                Delhivery will assign a local courier agent to pick up and inspect the returned item(s).
              </span>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              className="rounded-none"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="rounded-none bg-amber-600 hover:bg-amber-700 text-white gap-1.5"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Scheduling Delhivery...
                </>
              ) : (
                <>
                  <Truck className="h-4 w-4" />
                  Schedule Pickup
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
