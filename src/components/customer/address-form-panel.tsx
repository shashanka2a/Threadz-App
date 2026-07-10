"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useIsMobile } from "@/components/ui/use-mobile";

export type AddressFormValues = {
  label: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
};

type AddressFormPanelProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  initialValues: AddressFormValues;
  saving: boolean;
  onSubmit: (values: AddressFormValues) => void | Promise<void>;
};

const inputClass =
  "rounded-none mt-1.5 border-neutral-300 text-base leading-normal min-h-11";

function AddressFormFields({
  form,
  setField,
}: {
  form: AddressFormValues;
  setField: <K extends keyof AddressFormValues>(key: K, value: AddressFormValues[K]) => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="address-label">Label</Label>
        <Input
          id="address-label"
          value={form.label}
          onChange={(e) => setField("label", e.target.value)}
          className={inputClass}
          placeholder="Home, Office..."
          autoComplete="address-level4"
          required
        />
      </div>
      <div>
        <Label htmlFor="address-full-name">Full name</Label>
        <Input
          id="address-full-name"
          value={form.fullName}
          onChange={(e) => setField("fullName", e.target.value)}
          className={inputClass}
          autoComplete="name"
          required
        />
      </div>
      <div>
        <Label htmlFor="address-phone">Phone</Label>
        <Input
          id="address-phone"
          type="tel"
          inputMode="tel"
          value={form.phone}
          onChange={(e) => setField("phone", e.target.value)}
          className={inputClass}
          autoComplete="tel"
          required
        />
      </div>
      <div className="md:col-span-2">
        <Label htmlFor="address-line-1">Address line 1</Label>
        <Input
          id="address-line-1"
          value={form.addressLine1}
          onChange={(e) => setField("addressLine1", e.target.value)}
          className={inputClass}
          autoComplete="address-line1"
          required
        />
      </div>
      <div className="md:col-span-2">
        <Label htmlFor="address-line-2">Address line 2</Label>
        <Input
          id="address-line-2"
          value={form.addressLine2}
          onChange={(e) => setField("addressLine2", e.target.value)}
          className={inputClass}
          autoComplete="address-line2"
        />
      </div>
      <div>
        <Label htmlFor="address-city">City</Label>
        <Input
          id="address-city"
          value={form.city}
          onChange={(e) => setField("city", e.target.value)}
          className={inputClass}
          autoComplete="address-level2"
          required
        />
      </div>
      <div>
        <Label htmlFor="address-state">State</Label>
        <Input
          id="address-state"
          value={form.state}
          onChange={(e) => setField("state", e.target.value)}
          className={inputClass}
          autoComplete="address-level1"
          required
        />
      </div>
      <div>
        <Label htmlFor="address-postal-code">Postal code</Label>
        <Input
          id="address-postal-code"
          inputMode="numeric"
          value={form.postalCode}
          onChange={(e) => setField("postalCode", e.target.value)}
          className={inputClass}
          autoComplete="postal-code"
          required
        />
      </div>
      <div>
        <Label htmlFor="address-country">Country</Label>
        <Input
          id="address-country"
          value={form.country}
          onChange={(e) => setField("country", e.target.value)}
          className={inputClass}
          autoComplete="country-name"
          required
        />
      </div>
      <label className="md:col-span-2 flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.isDefault}
          onChange={(e) => setField("isDefault", e.target.checked)}
        />
        Set as default address
      </label>
    </div>
  );
}

export function AddressFormPanel({
  open,
  onOpenChange,
  title,
  initialValues,
  saving,
  onSubmit,
}: AddressFormPanelProps) {
  const isMobile = useIsMobile();
  const [form, setForm] = useState(initialValues);

  useEffect(() => {
    if (open) {
      setForm(initialValues);
    }
  }, [open, initialValues]);

  const setField = <K extends keyof AddressFormValues>(
    key: K,
    value: AddressFormValues[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await onSubmit(form);
  };

  const footer = (
    <>
      <Button
        type="button"
        variant="outline"
        className="rounded-none w-full sm:w-auto"
        onClick={() => onOpenChange(false)}
      >
        Cancel
      </Button>
      <Button
        type="submit"
        form="address-form-panel"
        className="rounded-none bg-black text-white hover:bg-neutral-800 w-full sm:w-auto"
        disabled={saving}
      >
        {saving ? "Saving..." : "Save address"}
      </Button>
    </>
  );

  const body = (
    <form
      id="address-form-panel"
      onSubmit={handleSubmit}
      className="space-y-4 scroll-smooth"
    >
      <AddressFormFields form={form} setField={setField} />
    </form>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          className="rounded-none max-h-[92dvh] overflow-y-auto overscroll-contain px-4 pb-6 pt-4 scroll-smooth"
        >
          <SheetHeader className="text-left pb-2">
            <SheetTitle>{title}</SheetTitle>
          </SheetHeader>
          {body}
          <SheetFooter className="pt-2">{footer}</SheetFooter>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-none max-h-[90vh] overflow-y-auto overscroll-contain scroll-smooth">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {body}
        <DialogFooter>{footer}</DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
