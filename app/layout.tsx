import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import { ChatBot } from "@/components/chat/ChatBot";
import "./globals.css";

const GOATCOUNTER_SITE = process.env.NEXT_PUBLIC_GOATCOUNTER_SITE;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dom Mangonon",
  description: "Personal website of Dom Mangonon",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
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
