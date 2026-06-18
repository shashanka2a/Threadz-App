import { ContentPage } from "@/components/content-page";

export default function ContactPage() {
  return (
    <ContentPage
      title="Contact Us"
      description="We're here to help with orders, sizing, and product questions."
    >
      <p>
        Reach the THREADZ team for support with orders, exchanges, or product questions.
      </p>
      <p>
        <strong>Email:</strong>{" "}
        <a href="mailto:hello@threadz.studio" className="underline underline-offset-4">
          hello@threadz.studio
        </a>
      </p>
      <p>
        <strong>Hours:</strong> Monday–Saturday, 10:00 AM – 6:00 PM IST
      </p>
      <p>We aim to respond within one business day.</p>
    </ContentPage>
  );
}
