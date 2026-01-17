import { NextResponse } from "next/server"
import { listRegions } from "@lib/data/regions"
import { listProducts } from "@lib/data/products"
import { getBaseURL } from "@lib/util/env"

export const dynamic = "force-dynamic"
export const revalidate = 3600 // Revalidate every hour

const PRODUCTS_PER_SITEMAP = 2000

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

    // Collect all products across all countries
    const allProducts: Array<{
      url: string
      lastModified: Date
    }> = []

    for (const countryCode of countryCodes) {
      try {
        let pageParam = 1
        const limit = 100
        let hasMore = true

        while (hasMore) {
          const { response, nextPage } = await listProducts({
            pageParam,
            countryCode,
            queryParams: {
              limit,
              fields: "handle,updated_at",
            },
          })

          if (response.products && response.products.length > 0) {
            response.products.forEach((product) => {
              if (product.handle) {
                allProducts.push({
                  url: `${baseURL}/${countryCode}/products/${product.handle}`,
                  lastModified: product.updated_at
                    ? new Date(product.updated_at)
                    : new Date(),
                })
              }
            })

            hasMore = nextPage !== null
            pageParam = nextPage || pageParam + 1
          } else {
            hasMore = false
          }
        }
      } catch (error) {
        console.error(
          `Error fetching products for ${countryCode}:`,
          error instanceof Error ? error.message : "Unknown error"
        )
      }
    }

    // Add first 2000 products to this sitemap
    const productsToInclude = allProducts.slice(0, PRODUCTS_PER_SITEMAP)
    
    productsToInclude.forEach((product) => {
      sitemapEntries.push({
        url: product.url,
        lastModified: product.lastModified,
        changeFrequency: "weekly",
        priority: 0.8,
      })
    })
  } catch (error) {
    console.error(
      "Error generating products sitemap:",
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
