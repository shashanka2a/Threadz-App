import { ContentPage } from "@/components/content-page";

export default function ShippingPage() {
  return (
    <ContentPage
      title="Shipping Info"
      description="Delivery timelines and shipping coverage across India."
    >
      <p>
        Orders are packed within 1–2 business days. Standard delivery typically takes
        3–7 business days depending on your location.
      </p>
      <p>
        Shipping charges are calculated at checkout based on your delivery address and
        order value. Free shipping may apply on qualifying orders.
      </p>
      <p>
        You will receive tracking details by email once your order has been dispatched.
      </p>
    </ContentPage>
  );
}
