import { MetadataRoute } from "next"
import { listRegions } from "@lib/data/regions"
import { listProducts } from "@lib/data/products"
import { listCollections } from "@lib/data/collections"
import { listCategories } from "@lib/data/categories"
import { listBrands } from "@lib/data/brands"
import { getBaseURL } from "@lib/util/env"

export const dynamic = "force-dynamic"
export const revalidate = 3600 // Revalidate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseURL = getBaseURL()
  const sitemapEntries: MetadataRoute.Sitemap = []

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

    // Add product pages
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
                sitemapEntries.push({
                  url: `${baseURL}/${countryCode}/products/${product.handle}`,
                  lastModified: product.updated_at
                    ? new Date(product.updated_at)
                    : new Date(),
                  changeFrequency: "weekly",
                  priority: 0.8,
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

    // Add collection pages
    try {
      const { collections } = await listCollections({
        fields: "handle",
        limit: "1000",
      })

      if (collections) {
        for (const countryCode of countryCodes) {
          collections.forEach((collection) => {
            if (collection.handle) {
              sitemapEntries.push({
                url: `${baseURL}/${countryCode}/collections/${collection.handle}`,
                lastModified: new Date(),
                changeFrequency: "weekly",
                priority: 0.7,
              })
            }
          })
        }
      }
    } catch (error) {
      console.error(
        "Error fetching collections:",
        error instanceof Error ? error.message : "Unknown error"
      )
    }

    // Add category pages
    try {
      const categories = await listCategories({ limit: 1000 })

      if (categories) {
        for (const countryCode of countryCodes) {
          categories.forEach((category) => {
            if (category.handle) {
              sitemapEntries.push({
                url: `${baseURL}/${countryCode}/categories/${category.handle}`,
                lastModified: new Date(),
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

    // Add static pages
    const staticPages = [
      { path: "store", priority: 0.9 },
      { path: "filter", priority: 0.8 },
      { path: "brands", priority: 0.8 },
    ]

    for (const countryCode of countryCodes) {
      staticPages.forEach((page) => {
        sitemapEntries.push({
          url: `${baseURL}/${countryCode}/${page.path}`,
          lastModified: new Date(),
          changeFrequency: "weekly",
          priority: page.priority,
        })
      })
    }
  } catch (error) {
    console.error(
      "Error generating sitemap:",
      error instanceof Error ? error.message : "Unknown error"
    )
  }

  return sitemapEntries
}

