import { Suspense } from "react";
import SuccessClient from "./success-client";

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={<div className="container mx-auto px-4 py-16 text-center">Loading...</div>}
    >
      <SuccessClient />
    </Suspense>
  );
}

