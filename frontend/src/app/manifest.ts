import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AfroTrading — Premium Gold Trading Signals",
    short_name: "AfroTrading",
    description: "Premium XAUUSD gold trading signals, market analysis, and trading education.",
    start_url: "/",
    display: "standalone",
    background_color: "#050810",
    theme_color: "#050810",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
