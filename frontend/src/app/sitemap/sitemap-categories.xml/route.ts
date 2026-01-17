import { NextResponse } from "next/server"
import { listRegions } from "@lib/data/regions"
import { listCategories } from "@lib/data/categories"
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

    // Add category pages
    try {
      const categories = await listCategories({ limit: 1000 })

      if (categories) {
        for (const countryCode of countryCodes) {
          categories.forEach((category) => {
            if (category.handle) {
              sitemapEntries.push({
                url: `${baseURL}/${countryCode}/categories/${category.handle}`,
                lastModified: category.updated_at
                  ? new Date(category.updated_at)
                  : new Date(),
                changeFrequency: "weekly",
                priority: 0.7,
              })
            }
          })
        }
      }
    } catch (error) {
      console.error(
        "Error fetching categories:",
        error instanceof Error ? error.message : "Unknown error"
      )
    }
  } catch (error) {
    console.error(
      "Error generating categories sitemap:",
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
