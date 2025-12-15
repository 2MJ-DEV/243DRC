import { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://243drc.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/explorer-les-projets",
    "/sign-in",
    "/sign-up",
  ];

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : 0.8,
  }));
}

