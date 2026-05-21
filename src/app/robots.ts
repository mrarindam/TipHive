import type { MetadataRoute } from "next";

const BASE_URL = "https://tiphive.xyz";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/about",
          "/contact",
          "/docs",
          "/docs/*",
          "/explore",
          "/mezo-toolkit",
          "/privacy",
          "/terms",
          "/cookies",
        ],
        disallow: [
          "/dashboard",
          "/dashboard/*",
          "/settings",
          "/settings/*",
          "/editprofile",
          "/editprofile/*",
          "/onboarding",
          "/onboarding/*",
          "/embed/*",
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
