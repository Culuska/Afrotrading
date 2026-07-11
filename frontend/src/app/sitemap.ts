import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://afrotrading.com";

const ROUTES = [
  "",
  "/signals",
  "/signals/history",
  "/education",
  "/market-analysis",
  "/pricing",
  "/about",
  "/contact",
  "/login",
  "/register",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" || route === "/signals" ? "hourly" : "weekly",
    priority: route === "" ? 1 : 0.7,
  }));
}
