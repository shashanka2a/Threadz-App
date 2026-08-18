"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { MyOrders } from "@/components/customer/my-orders";

import MyOrdersLoading from "./loading";

export default function MyOrdersPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login?next=/my-orders");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return <MyOrdersLoading />;
  }


  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
      <Button
        variant="ghost"
        asChild
        className="rounded-none mb-4 -ml-2 w-fit"
      >
        <Link href="/profile">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to profile
        </Link>
      </Button>

      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-serif mb-1 flex items-center gap-2">
          <Package className="h-6 w-6" />
          My orders
        </h1>
        <p className="text-sm text-neutral-600">
          Track shipments and manage your deliveries.
        </p>
      </div>

      <MyOrders />
    </div>
  );
}
