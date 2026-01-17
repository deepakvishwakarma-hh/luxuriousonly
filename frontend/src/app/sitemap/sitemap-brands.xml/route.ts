import { NextResponse } from "next/server"
import { listRegions } from "@lib/data/regions"
import { listBrands } from "@lib/data/brands"
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

    // Add brand pages
    try {
      const { brands } = await listBrands({ limit: 1000 })

      if (brands) {
        for (const countryCode of countryCodes) {
          brands.forEach((brand) => {
            if (brand.slug) {
              sitemapEntries.push({
                url: `${baseURL}/${countryCode}/brands/${brand.slug}`,
                lastModified: brand.updated_at
                  ? new Date(brand.updated_at)
                  : new Date(),
                changeFrequency: "weekly",
                priority: 0.6,
              })
            }
          })
        }
      }
    } catch (error) {
      console.error(
        "Error fetching brands:",
        error instanceof Error ? error.message : "Unknown error"
      )
    }
  } catch (error) {
    console.error(
      "Error generating brands sitemap:",
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
