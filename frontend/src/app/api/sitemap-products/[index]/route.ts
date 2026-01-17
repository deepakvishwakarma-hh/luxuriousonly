import { NextResponse } from "next/server"
import { listRegions } from "@lib/data/regions"
import { listProducts } from "@lib/data/products"
import { getBaseURL } from "@lib/util/env"

export const dynamic = "force-dynamic"
export const revalidate = 3600

const PRODUCTS_PER_SITEMAP = 2000

export async function GET(
  request: Request,
  { params }: { params: Promise<{ index: string }> }
) {
  const { index } = await params
  const sitemapIndex = parseInt(index, 10)

  if (isNaN(sitemapIndex) || sitemapIndex < 0) {
    return new NextResponse("Invalid sitemap index", { status: 400 })
  }

  const baseURL = getBaseURL()
  // Index 0 is handled by sitemap-products.ts, so index 1 starts at 2000
  const startIndex = sitemapIndex * PRODUCTS_PER_SITEMAP
  const endIndex = startIndex + PRODUCTS_PER_SITEMAP

  try {
    // Get all regions/countries
    const regions = await listRegions()
    const countryCodes =
      regions
        ?.map((r) => r.countries?.map((c) => c.iso_2))
        .flat()
        .filter(Boolean) || []

    if (countryCodes.length === 0) {
      return new NextResponse("No countries found", { status: 404 })
    }

    // Collect all products across all countries (same logic as sitemap-products.ts)
    // This includes the same product in multiple countries as separate URLs
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

    // Get the slice of products for this sitemap index
    const productsSlice = allProducts.slice(startIndex, endIndex)

    if (productsSlice.length === 0) {
      console.warn(
        `No products found for sitemap index ${sitemapIndex}. Total products: ${allProducts.length}, Start index: ${startIndex}, End index: ${endIndex}`
      )
      return new NextResponse(
        `No products found for this index. Total products: ${allProducts.length}, Requested range: ${startIndex}-${endIndex}`,
        { status: 404 }
      )
    }

    // Generate XML sitemap
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${productsSlice
        .map(
          (product) => `  <url>
    <loc>${product.url}</loc>
    <lastmod>${product.lastModified.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
        )
        .join("\n")}
</urlset>`

    return new NextResponse(xml, {
      headers: {
        "Content-Type": "application/xml",
      },
    })
  } catch (error) {
    console.error(
      "Error generating products sitemap:",
      error instanceof Error ? error.message : "Unknown error"
    )
    return new NextResponse("Error generating sitemap", { status: 500 })
  }
}
