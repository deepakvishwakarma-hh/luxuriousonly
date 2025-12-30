import { MetadataRoute } from "next"
import { getBaseURL } from "@lib/util/env"

export default function robots(): MetadataRoute.Robots {
  const baseURL = getBaseURL()

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/checkout/",
          "/account/",
          "/api/",
          "/order/",
          "/test/",
          "/forget-password/",
        ],
      },
    ],
    sitemap: `${baseURL}/sitemap.xml`,
  }
}

