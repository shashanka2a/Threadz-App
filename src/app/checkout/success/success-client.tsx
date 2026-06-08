"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

export default function SuccessClient() {
  const params = useSearchParams();
  const orderId = params.get("orderId") ?? "TZ-ORDER";
  const placedAt = useMemo(() => new Date().toLocaleString(), []);

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <Card className="border-neutral-200 rounded-none">
          <CardContent className="p-10 text-center">
            <CheckCircle2 className="h-14 w-14 mx-auto mb-4 text-green-600" />
            <h1 className="text-4xl font-serif mb-2">Order confirmed</h1>
            <p className="text-neutral-600 mb-8">
              Thanks for your order. We’ll send tracking details once it ships.
            </p>

            <div className="border border-neutral-200 bg-neutral-50 p-5 text-left mb-8">
              <p className="text-sm text-neutral-600">Order ID</p>
              <p className="text-lg font-medium">{orderId}</p>
              <p className="text-xs text-neutral-500 mt-2">Placed at: {placedAt}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild className="rounded-none bg-black text-white hover:bg-neutral-800">
                <Link href="/shop">Continue shopping</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-none">
                <Link href="/">Back to home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

