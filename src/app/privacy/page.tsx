import { ContentPage } from "@/components/content-page";

export default function PrivacyPage() {
  return (
    <ContentPage
      title="Privacy Policy"
      description="How THREADZ collects, uses, and protects your information."
    >
      <p>
        We collect information you provide when creating an account, placing an order, or
        contacting support — such as your name, email, phone number, and shipping address.
      </p>
      <p>
        This information is used to process orders, provide customer support, and improve
        our services. We do not sell your personal data to third parties.
      </p>
      <p>
        Payment processing is handled by secure third-party providers. You may request
        access to or deletion of your account data by emailing{" "}
        <a href="mailto:support.threadzstudio@gmail.com" className="underline underline-offset-4">
          support.threadzstudio@gmail.com
        </a>
        .
      </p>
    </ContentPage>
  );
}
