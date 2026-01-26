import { NextResponse } from "next/server"
import { getBaseURL } from "@lib/util/env"

export const dynamic = "force-dynamic"
export const revalidate = 3600 // Revalidate every hour

export async function GET() {
  const baseURL = getBaseURL()
  const sitemapIndexEntries = [
    {
      loc: `${baseURL}/sitemap/sitemap-pages.xml`,
      lastmod: new Date().toISOString(),
    },
    {
      loc: `${baseURL}/sitemap/sitemap-brands.xml`,
      lastmod: new Date().toISOString(),
    },
    {
      loc: `${baseURL}/sitemap/sitemap-categories.xml`,
      lastmod: new Date().toISOString(),
    },
    {
      loc: `${baseURL}/sitemap/sitemap-products.xml`,
      lastmod: new Date().toISOString(),
    },
  ]

  // Note: Additional product sitemaps (if > 2000 products) will be generated
  // via API routes at /api/sitemap-products/[index] when needed
  // They can be added here manually or discovered dynamically if needed

  // Generate XML sitemap index
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapIndexEntries
    .map(
      (entry) => `  <sitemap>
    <loc>${entry.loc}</loc>
    <lastmod>${entry.lastmod}</lastmod>
  </sitemap>`
    )
    .join("\n")}
</sitemapindex>`

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
    },
  })
}
