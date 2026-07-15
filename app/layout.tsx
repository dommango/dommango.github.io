import type { Metadata } from "next";
import Script from "next/script";
import {
  Geist,
  Geist_Mono,
  Archivo_Black,
  Space_Grotesk,
  JetBrains_Mono,
} from "next/font/google";
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

// Brutalist-oxblood display/body/mono stack (Google Fonts substitutes).
const archivoBlack = Archivo_Black({
  variable: "--font-archivo-black",
  weight: "400",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  weight: ["400", "500", "700"],
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  weight: ["400", "500", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Dom Mangonon",
    template: "%s | Dom Mangonon",
  },
  description:
    "Dom Mangonon builds software with AI — SousIQ, Bracketeer, the Claude Code Placemat, and more. Projects, writing, and a travel map.",
  openGraph: {
    title: "Dom Mangonon",
    description:
      "Building software with AI. Projects, writing, and a travel map.",
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
              description: "Builds software with AI.",
              sameAs: [
                "https://linkedin.com/in/dommangonon",
                "https://x.com/collapsecontext",
                "https://dommangonon.substack.com",
                "https://github.com/dommango",
              ],
            }),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${archivoBlack.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} antialiased`}
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
