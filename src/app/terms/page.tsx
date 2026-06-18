import { ContentPage } from "@/components/content-page";

export default function TermsPage() {
  return (
    <ContentPage
      title="Terms of Service"
      description="Terms governing use of the THREADZ website and purchases."
    >
      <p>
        By using threadz.studio and placing an order, you agree to these terms. Product
        images and colours may vary slightly due to screen settings.
      </p>
      <p>
        Prices and availability are subject to change. Orders are confirmed once payment
        is successfully processed.
      </p>
      <p>
        THREADZ is not liable for indirect or consequential damages arising from use of
        the site or products, to the extent permitted by applicable law.
      </p>
      <p>
        For questions about these terms, contact{" "}
        <a href="mailto:hello@threadz.studio" className="underline underline-offset-4">
          hello@threadz.studio
        </a>
        .
      </p>
    </ContentPage>
  );
}
