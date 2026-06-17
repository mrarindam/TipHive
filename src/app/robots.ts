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
          "/visual-toolkit",
          "/mysubsriptions",
        ],
        disallow: [
          "/dashboard",
          "/dashboard/*",
          "/sentsupport",
          "/earninganalysis",
          "/activityfeed",
          "/posts",
          "/subscriptions",
          "/tipcircle",
          "/createposts",
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
