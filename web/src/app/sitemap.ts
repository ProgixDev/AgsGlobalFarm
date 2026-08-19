import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

const routes = [
  { path: "/", priority: 1 },
  { path: "/a-propos", priority: 0.8 },
  { path: "/boutique", priority: 0.9 },
  { path: "/formation", priority: 0.9 },
  { path: "/contact", priority: 0.7 },
  { path: "/politique-de-confidentialite", priority: 0.5 },
  { path: "/login", priority: 0.3 },
  { path: "/register", priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return routes.map(({ path, priority }) => ({
    url: `${siteUrl}${path}`,
    lastModified,
    changeFrequency: "weekly",
    priority,
  }));
}
