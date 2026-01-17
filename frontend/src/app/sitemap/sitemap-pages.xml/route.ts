import { NextResponse } from "next/server"
import { listRegions } from "@lib/data/regions"
import { getBaseURL } from "@lib/util/env"

export const dynamic = "force-dynamic"
export const revalidate = 3600 // Revalidate every hour

export async function GET() {
  const baseURL = getBaseURL()
  const sitemapEntries: Array<{
    url: string
    lastModified: Date
    changeFrequency?: string
    priority?: number
  }> = []

  try {
    // Get all regions/countries
    const regions = await listRegions()
    const countryCodes =
      regions
        ?.map((r) => r.countries?.map((c) => c.iso_2))
        .flat()
        .filter(Boolean) || []

    // Add home pages for each country
    for (const countryCode of countryCodes) {
      sitemapEntries.push({
        url: `${baseURL}/${countryCode}`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 1.0,
      })
    }

    // Add static pages
    const staticPages = [
      { path: "store", priority: 0.9, changeFrequency: "daily" },
      { path: "filter", priority: 0.8, changeFrequency: "daily" },
      { path: "brands", priority: 0.8, changeFrequency: "weekly" },
      { path: "about-us", priority: 0.7, changeFrequency: "monthly" },
      { path: "contact-us", priority: 0.7, changeFrequency: "monthly" },
      { path: "delivery-shipping", priority: 0.6, changeFrequency: "monthly" },
      { path: "privacy-policy", priority: 0.5, changeFrequency: "yearly" },
      { path: "return-refund-policy", priority: 0.5, changeFrequency: "yearly" },
      { path: "terms-conditions", priority: 0.5, changeFrequency: "yearly" },
    ]

    for (const countryCode of countryCodes) {
      staticPages.forEach((page) => {
        sitemapEntries.push({
          url: `${baseURL}/${countryCode}/${page.path}`,
          lastModified: new Date(),
          changeFrequency: page.changeFrequency || "weekly",
          priority: page.priority,
        })
      })
    }
  } catch (error) {
    console.error(
      "Error generating pages sitemap:",
      error instanceof Error ? error.message : "Unknown error"
    )
  }

  // Generate XML sitemap
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries
    .map(
      (entry) => `  <url>
    <loc>${entry.url}</loc>
    <lastmod>${entry.lastModified.toISOString()}</lastmod>
    ${entry.changeFrequency ? `<changefreq>${entry.changeFrequency}</changefreq>` : ""}
    ${entry.priority !== undefined ? `<priority>${entry.priority}</priority>` : ""}
  </url>`
    )
    .join("\n")}
</urlset>`

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
    },
  })
}
