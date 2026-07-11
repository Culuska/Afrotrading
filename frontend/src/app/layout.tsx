import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";

import { AuthProvider } from "@/context/auth-context";
import { QueryProvider } from "@/context/query-provider";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { FloatingActions } from "@/components/layout/floating-actions";
import { Toaster } from "sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://afrotrading.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "AfroTrading — Premium Gold (XAUUSD) Trading Signals",
    template: "%s | AfroTrading",
  },
  description:
    "Professional gold trading signals, real-time XAUUSD market analysis, and trading education. Join our VIP Telegram community for daily gold signals with proven results.",
  keywords: ["gold signals", "XAUUSD", "forex signals", "trading signals", "gold trading", "AfroTrading"],
  openGraph: {
    title: "AfroTrading — Premium Gold (XAUUSD) Trading Signals",
    description: "Professional gold trading signals, market analysis, and trading education.",
    url: SITE_URL,
    siteName: "AfroTrading",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AfroTrading — Premium Gold (XAUUSD) Trading Signals",
    description: "Professional gold trading signals, market analysis, and trading education.",
    images: ["/og-image.png"],
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "AfroTrading",
  url: SITE_URL,
  logo: `${SITE_URL}/icon-512.png`,
  description: "Premium gold (XAUUSD) trading signal provider offering real-time signals, market analysis, and trading education.",
  sameAs: ["https://t.me/afrotrading_community"],
};

export const viewport = {
  themeColor: "#050810",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${sora.variable} h-full antialiased dark`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <QueryProvider>
          <AuthProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <FloatingActions />
            <Toaster theme="dark" position="top-right" richColors />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
