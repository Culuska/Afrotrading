import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "MCR Finance & Operations", template: "%s · MCR" },
  description: "Mogadishu Constructions & Rehabilitation — finance and operations",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
