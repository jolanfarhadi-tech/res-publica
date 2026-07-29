import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/de/profile",
        "/en/profile",
        "/fa/profile",
        "/de/dashboard",
        "/en/dashboard",
        "/fa/dashboard",
      ],
    },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
