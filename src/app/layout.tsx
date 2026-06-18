import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Providers } from "@/components/providers";
import { SiteLayout } from "@/components/site-layout";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://threadz.studio"),
  title: {
    default: "THREADZ — Premium Cotton T-Shirts",
    template: "%s | THREADZ",
  },
  description:
    "Premium cotton t-shirts in plain and oversized fits, with rich colours and durable GSM fabrics.",
  keywords: ["plain t-shirts", "oversized t-shirts", "heavy jersey", "interlock", "THREADZ"],
  authors: [{ name: "THREADZ" }],
  openGraph: {
    title: "THREADZ — Premium Cotton T-Shirts",
    description:
      "Premium cotton t-shirts in plain and oversized fits, with rich colours and durable GSM fabrics.",
    type: "website",
    siteName: "THREADZ",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "THREADZ custom apparel",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "THREADZ — Premium Cotton T-Shirts",
    description:
      "Premium cotton t-shirts in plain and oversized fits, with rich colours and durable GSM fabrics.",
    images: ["/og-image.svg"],
  },
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased`}>
        <Providers>
          <SiteLayout>{children}</SiteLayout>
        </Providers>
      </body>
    </html>
  );
}
