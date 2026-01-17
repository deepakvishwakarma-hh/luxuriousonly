import { MetadataRoute } from "next"
import { getBaseURL } from "@lib/util/env"

export const dynamic = "force-dynamic"
export const revalidate = 3600 // Revalidate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseURL = getBaseURL()
  const sitemaps: MetadataRoute.Sitemap = [
    {
      url: `${baseURL}/sitemap/sitemap-pages.xml`,
      lastModified: new Date(),
    },
    {
      url: `${baseURL}/sitemap/sitemap-brands.xml`,
      lastModified: new Date(),
    },
    {
      url: `${baseURL}/sitemap/sitemap-categories.xml`,
      lastModified: new Date(),
    },
  ]

  // Add main products sitemap
  sitemaps.push({
    url: `${baseURL}/sitemap/sitemap-products.xml`,
    lastModified: new Date(),
  })

  // Note: Additional product sitemaps (if > 2000 products) will be generated
  // via API routes at /api/sitemap-products/[index] when needed
  // They can be added here manually or discovered dynamically if needed

  return sitemaps
}
