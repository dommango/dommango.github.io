import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import { ChatBot } from "@/components/chat/ChatBot";
import "./globals.css";

const GOATCOUNTER_SITE = process.env.NEXT_PUBLIC_GOATCOUNTER_SITE;
const SITE_URL = "https://dommango.github.io";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Dom Mangonon",
    template: "%s | Dom Mangonon",
  },
  description:
    "Personal website of Dom Mangonon — technology leader specializing in enterprise transformation, AI strategy, and financial services.",
  openGraph: {
    title: "Dom Mangonon",
    description:
      "Technology leader specializing in enterprise transformation, AI strategy, and financial services.",
    url: SITE_URL,
    siteName: "Dom Mangonon",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    creator: "@CollapseContext",
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              name: "Dom Mangonon",
              url: SITE_URL,
              jobTitle: "SVP, Transformation Senior Lead",
              worksFor: {
                "@type": "Organization",
                name: "Citi",
              },
              sameAs: [
                "https://linkedin.com/in/dommangonon",
                "https://x.com/collapsecontext",
                "https://dommangonon.substack.com",
              ],
            }),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <ChatBot />
        {GOATCOUNTER_SITE && (
          <Script
            data-goatcounter={`https://${GOATCOUNTER_SITE}.goatcounter.com/count`}
            src="//gc.zgo.at/count.js"
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}
