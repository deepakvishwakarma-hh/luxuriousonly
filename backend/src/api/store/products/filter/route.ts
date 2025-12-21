/**
 * Advanced Product Filter API
 * 
 * GET /store/products/filter
 * 
 * Filter products by brand, category, metadata fields, attributes, and price range.
 * 
 * Query Parameters:
 * - brand_id: Filter by brand ID (string)
 * - brand_slug: Filter by brand slug (string)
 * - category_id: Filter by category ID(s) - comma-separated or array (string | string[])
 * - category_name: Filter by category name(s) - comma-separated or array (string | string[])
 * - search: Search text in product title (string) - also supports 'q' parameter
 * - min_price: Minimum price filter (number)
 * - max_price: Maximum price filter (number)
 * - currency_code: Currency code for price filtering (default: "USD")
 * - metadata: Metadata filters as JSON string or object
 *   Examples:
 *     - JSON string: ?metadata={"gender":"male","size":"large"}
 *     - Query params: ?metadata_gender=male&metadata_size=large
 * - rim_style: Filter by rim style - comma-separated or array (string | string[])
 * - gender: Filter by gender - comma-separated or array (string | string[])
 * - shapes: Filter by shapes - comma-separated or array (string | string[])
 * - size: Filter by size - comma-separated or array (string | string[])
 * - limit: Number of results per page (1-100, default: 20)
 * - offset: Pagination offset (default: 0)
 * - order: Sort field - "created_at" | "updated_at" | "title" | "price" (default: "created_at")
 * - order_direction: Sort direction - "asc" | "desc" (default: "desc")
 * - status: Filter by product status - "draft" | "published" | "proposed" | "rejected"
 * - include_filter_options: Include available filter options in response (boolean, default: false)
 * 
 * Examples:
 * - Filter by brand: /store/products/filter?brand_slug=nike
 * - Filter by category: /store/products/filter?category_name=Shirts
 * - Search by title: /store/products/filter?search=nike
 * - Filter by price: /store/products/filter?min_price=10&max_price=100
 * - Filter by attributes: /store/products/filter?gender=Male&rim_style=Full Rim
 * - Sort by price: /store/products/filter?order=price&order_direction=asc
 * - Get filter options: /store/products/filter?include_filter_options=true
 * - Combined filters: /store/products/filter?brand_slug=nike&min_price=50&max_price=200&category_name=Shirts&gender=Male&rim_style=Full Rim
 */

import type {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { z } from "zod"

// Helper function to parse comma-separated strings
function parseCommaSeparated(value: string | string[] | undefined): string[] | undefined {
  if (!value) return undefined
  if (Array.isArray(value)) return value
  return value.split(',').map(v => v.trim()).filter(Boolean)
}

// Helper function to format price for display
// Medusa stores prices in the smallest currency unit (cents for USD)
function formatPrice(amount: number | null, currencyCode: string): string | null {
  if (amount === null) return null

  // Convert from smallest currency unit (cents) to base unit
  // For example: 1000 cents = 10.00 USD
  const baseAmount = amount / 100

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
  }).format(baseAmount)
}

// Query parameter schema for validation
const ProductFilterSchema = z.object({
  // Brand filters
  brand_id: z.string().optional(),
  brand_slug: z.string().optional(),

  // Category filters - supports comma-separated values
  category_id: z.union([
    z.string().transform((val) => parseCommaSeparated(val)),
    z.array(z.string()),
  ]).optional(),
  category_name: z.union([
    z.string().transform((val) => parseCommaSeparated(val)),
    z.array(z.string()),
  ]).optional(),

  // Text search - searches in product title
  search: z.string().optional(),
  q: z.string().optional(), // Alternative query parameter name

  // Price filters
  min_price: z.coerce.number().min(0).optional(),
  max_price: z.coerce.number().min(0).optional(),
  currency_code: z.string().default("USD"),

  // Metadata filters - accepts JSON string, query string format, or object
  // Format examples:
  // - JSON: {"gender":"male","size":"large"}
  // - Query string: gender=male&size=large (will be parsed from req.query)
  metadata: z.union([
    z.string(), // JSON string
    z.record(z.any()), // Object
  ]).optional(),

  // Pagination
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),

  // Sorting
  order: z.enum(["created_at", "updated_at", "title", "price"]).default("created_at"),
  order_direction: z.enum(["asc", "desc"]).default("desc"),

  // Status filter
  status: z.enum(["draft", "published", "proposed", "rejected"]).optional(),

  // Direct attribute filters (also supported via metadata)
  rim_style: z.union([
    z.string().transform((val) => parseCommaSeparated(val)),
    z.array(z.string()),
  ]).optional(),
  gender: z.union([
    z.string().transform((val) => parseCommaSeparated(val)),
    z.array(z.string()),
  ]).optional(),
  shapes: z.union([
    z.string().transform((val) => parseCommaSeparated(val)),
    z.array(z.string()),
  ]).optional(),
  size: z.union([
    z.string().transform((val) => parseCommaSeparated(val)),
    z.array(z.string()),
  ]).optional(),

  // Include filter options in response
  include_filter_options: z.coerce.boolean().default(false),
})

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  try {
    const query = req.scope.resolve("query")

    // Extract metadata from query params if provided as individual params
    // This allows both ?metadata={"key":"value"} and ?metadata_key=value formats
    const queryParams = { ...req.query }
    const metadataParams: Record<string, any> = {}

    // Check for metadata_* prefixed parameters
    Object.keys(queryParams).forEach((key) => {
      if (key.startsWith('metadata_')) {
        const metadataKey = key.replace('metadata_', '')
        const value = queryParams[key]
        // Handle array values (e.g., metadata_tags=tag1,tag2)
        if (typeof value === 'string' && value.includes(',')) {
          metadataParams[metadataKey] = value.split(',').map(v => v.trim()).filter(Boolean)
        } else {
          metadataParams[metadataKey] = value
        }
        delete queryParams[key]
      }
    })

    // If metadata params found and no explicit metadata param, merge them
    // If both exist, prefer the explicit metadata param
    if (Object.keys(metadataParams).length > 0 && !queryParams.metadata) {
      queryParams.metadata = metadataParams
    }

    // Handle search parameter - support both 'search' and 'q'
    if (queryParams.q && !queryParams.search) {
      queryParams.search = queryParams.q
    }

    // Parse and validate query parameters
    const parsedQuery = ProductFilterSchema.parse(queryParams)

    // Get search term (from either 'search' or 'q' parameter)
    const searchTerm = parsedQuery.search || parsedQuery.q

    // Build base query config
    // Use wildcards to avoid field path issues - Medusa will handle the expansion
    const queryConfig: any = {
      entity: "product",
      fields: [
        "id",
        "title",
        "description",
        "handle",
        "status",
        "subtitle",
        "thumbnail",
        "metadata",
        "created_at",
        "updated_at",
        "discountable",
        "is_giftcard",
        "images.*",
        "categories.*",
        "variants.*",
        "variants.price_set.prices.*",
        "brand.*",
      ],
      filters: {} as any,
    }

    // Apply brand filter
    let brandIdToFilter: string | undefined
    if (parsedQuery.brand_id) {
      brandIdToFilter = parsedQuery.brand_id
    } else if (parsedQuery.brand_slug) {
      // First, get brand ID from slug
      const { data: brands } = await query.graph({
        entity: "brand",
        fields: ["id", "slug"],
        filters: {
          slug: parsedQuery.brand_slug,
        },
      })

      if (brands && brands.length > 0) {
        brandIdToFilter = brands[0].id
      } else {
        // Brand not found, return empty result
        return res.json({
          products: [],
          count: 0,
          limit: parsedQuery.limit,
          offset: parsedQuery.offset,
        })
      }
    }

    // Apply category filter
    let categoryIdsToFilter: string[] | undefined
    if (parsedQuery.category_id) {
      categoryIdsToFilter = Array.isArray(parsedQuery.category_id)
        ? parsedQuery.category_id
        : [parsedQuery.category_id]
    } else if (parsedQuery.category_name) {
      const categoryNames = Array.isArray(parsedQuery.category_name)
        ? parsedQuery.category_name
        : [parsedQuery.category_name]

      // First, get category IDs from names
      const { data: categories } = await query.graph({
        entity: "product_category",
        fields: ["id", "name"],
        filters: {
          name: categoryNames.length === 1 ? categoryNames[0] : categoryNames,
        },
      })

      if (categories && categories.length > 0) {
        categoryIdsToFilter = categories.map((c: any) => c.id)
      } else {
        // Categories not found, return empty result
        return res.json({
          products: [],
          count: 0,
          limit: parsedQuery.limit,
          offset: parsedQuery.offset,
        })
      }
    }

    // Apply status filter
    if (parsedQuery.status) {
      queryConfig.filters.status = parsedQuery.status
    }

    // Extract direct attribute filters
    const rimStyleFilters = parsedQuery.rim_style ? (Array.isArray(parsedQuery.rim_style) ? parsedQuery.rim_style : [parsedQuery.rim_style]) : undefined
    const genderFilters = parsedQuery.gender ? (Array.isArray(parsedQuery.gender) ? parsedQuery.gender : [parsedQuery.gender]) : undefined
    const shapesFilters = parsedQuery.shapes ? (Array.isArray(parsedQuery.shapes) ? parsedQuery.shapes : [parsedQuery.shapes]) : undefined
    const sizeFilters = parsedQuery.size ? (Array.isArray(parsedQuery.size) ? parsedQuery.size : [parsedQuery.size]) : undefined

    // Determine if we need post-filtering (metadata, price, brand, category, search, or attribute filters)
    const needsPostFiltering = parsedQuery.metadata !== undefined ||
      parsedQuery.min_price !== undefined ||
      parsedQuery.max_price !== undefined ||
      categoryIdsToFilter !== undefined ||
      brandIdToFilter !== undefined ||
      searchTerm !== undefined ||
      rimStyleFilters !== undefined ||
      genderFilters !== undefined ||
      shapesFilters !== undefined ||
      sizeFilters !== undefined

    // If we need post-filtering, fetch more products to account for filtering
    // Otherwise, use normal pagination
    if (needsPostFiltering) {
      // Fetch a larger batch to account for filtering
      queryConfig.take = Math.min(parsedQuery.limit * 10, 1000) // Fetch up to 10x limit or 1000, whichever is smaller
      queryConfig.skip = 0 // Start from beginning
    } else {
      queryConfig.take = parsedQuery.limit
      queryConfig.skip = parsedQuery.offset
    }

    // Execute initial query
    const {
      data: products,
      metadata: { count } = {},
    } = await query.graph(queryConfig)

    // Post-process results for metadata, price, brand, category, and search filtering
    let filteredProducts = products || []

    // Filter by search term (searches in title)
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase().trim()
      filteredProducts = filteredProducts.filter((product: any) => {
        const title = (product.title || "").toLowerCase()
        return title.includes(searchLower)
      })
    }

    // Filter by brand if provided (post-filtering for better flexibility)
    if (brandIdToFilter) {
      filteredProducts = filteredProducts.filter((product: any) => {
        return product.brand && product.brand.id === brandIdToFilter
      })
    }

    // Filter by category if provided (post-filtering for better flexibility)
    if (categoryIdsToFilter && categoryIdsToFilter.length > 0) {
      filteredProducts = filteredProducts.filter((product: any) => {
        if (!product.categories || !Array.isArray(product.categories)) {
          return false
        }

        // Check if product has any of the specified categories
        return product.categories.some((category: any) =>
          category && categoryIdsToFilter.includes(category.id)
        )
      })
    }

    // Filter by direct attribute filters (rim_style, gender, shapes, size)
    if (rimStyleFilters && rimStyleFilters.length > 0) {
      filteredProducts = filteredProducts.filter((product: any) => {
        const productRimStyle = product.metadata?.["rim style"] || product.metadata?.rim_style
        if (!productRimStyle) return false
        const productRimStyleStr = String(productRimStyle).toLowerCase()
        return rimStyleFilters.some((filter: string) =>
          productRimStyleStr === filter.toLowerCase()
        )
      })
    }

    if (genderFilters && genderFilters.length > 0) {
      filteredProducts = filteredProducts.filter((product: any) => {
        const productGender = product.metadata?.gender
        if (!productGender) return false
        const productGenderStr = String(productGender).toLowerCase()
        return genderFilters.some((filter: string) =>
          productGenderStr === filter.toLowerCase()
        )
      })
    }

    if (shapesFilters && shapesFilters.length > 0) {
      filteredProducts = filteredProducts.filter((product: any) => {
        const productShapes = product.metadata?.shapes
        if (!productShapes) return false
        const productShapesStr = String(productShapes).toLowerCase()
        return shapesFilters.some((filter: string) =>
          productShapesStr === filter.toLowerCase()
        )
      })
    }

    if (sizeFilters && sizeFilters.length > 0) {
      filteredProducts = filteredProducts.filter((product: any) => {
        const productSize = product.metadata?.size
        if (!productSize) return false
        const productSizeStr = String(productSize).toLowerCase()
        return sizeFilters.some((filter: string) =>
          productSizeStr === filter.toLowerCase()
        )
      })
    }

    // Filter by metadata if provided
    if (parsedQuery.metadata) {
      let metadataFilters: Record<string, any> = {}

      // Parse metadata if it's a string
      if (typeof parsedQuery.metadata === "string") {
        try {
          // Try parsing as JSON first
          metadataFilters = JSON.parse(parsedQuery.metadata)
        } catch (e) {
          // If not JSON, try URL decoding and parsing again
          try {
            const decoded = decodeURIComponent(parsedQuery.metadata)
            metadataFilters = JSON.parse(decoded)
          } catch (e2) {
            return res.status(400).json({
              message: "Invalid metadata format. Expected JSON string or object.",
            })
          }
        }
      } else {
        metadataFilters = parsedQuery.metadata
      }

      // Filter products by metadata
      filteredProducts = filteredProducts.filter((product: any) => {
        if (!product.metadata || typeof product.metadata !== "object") {
          return false
        }

        // Check if all metadata filters match
        return Object.keys(metadataFilters).every((key) => {
          const filterValue = metadataFilters[key]
          const productValue = product.metadata[key]

          // Handle array filters (e.g., ["value1", "value2"])
          if (Array.isArray(filterValue)) {
            return filterValue.some((val) => {
              if (Array.isArray(productValue)) {
                return productValue.includes(val)
              }
              return String(productValue).toLowerCase() === String(val).toLowerCase()
            })
          }

          // Handle exact match
          if (Array.isArray(productValue)) {
            return productValue.includes(filterValue)
          }

          // Case-insensitive string comparison
          return String(productValue).toLowerCase() === String(filterValue).toLowerCase()
        })
      })
    }

    // Filter by price range
    if (parsedQuery.min_price !== undefined || parsedQuery.max_price !== undefined) {
      filteredProducts = filteredProducts.filter((product: any) => {
        if (!product.variants || product.variants.length === 0) {
          return false
        }

        // Get all prices for all variants
        const prices: number[] = []

        for (const variant of product.variants) {
          if (variant.price_set?.prices) {
            for (const price of variant.price_set.prices) {
              if (price.currency_code === parsedQuery.currency_code) {
                prices.push(price.amount)
              }
            }
          }
        }

        if (prices.length === 0) {
          return false
        }

        // Use minimum price from all variants
        const minProductPrice = Math.min(...prices)
        const maxProductPrice = Math.max(...prices)

        // Check if price range matches
        if (parsedQuery.min_price !== undefined && maxProductPrice < parsedQuery.min_price) {
          return false
        }

        if (parsedQuery.max_price !== undefined && minProductPrice > parsedQuery.max_price) {
          return false
        }

        return true
      })
    }

    // Sort products
    filteredProducts.sort((a: any, b: any) => {
      let aValue: any
      let bValue: any

      switch (parsedQuery.order) {
        case "price":
          // Get minimum price for each product
          const aPrices: number[] = []
          const bPrices: number[] = []

          if (a.variants && Array.isArray(a.variants)) {
            a.variants.forEach((variant: any) => {
              if (variant.price_set?.prices) {
                variant.price_set.prices.forEach((price: any) => {
                  if (price.currency_code === parsedQuery.currency_code) {
                    aPrices.push(price.amount)
                  }
                })
              }
            })
          }

          if (b.variants && Array.isArray(b.variants)) {
            b.variants.forEach((variant: any) => {
              if (variant.price_set?.prices) {
                variant.price_set.prices.forEach((price: any) => {
                  if (price.currency_code === parsedQuery.currency_code) {
                    bPrices.push(price.amount)
                  }
                })
              }
            })
          }

          aValue = aPrices.length > 0 ? Math.min(...aPrices) : Infinity
          bValue = bPrices.length > 0 ? Math.min(...bPrices) : Infinity
          break
        case "created_at":
          aValue = new Date(a.created_at).getTime()
          bValue = new Date(b.created_at).getTime()
          break
        case "updated_at":
          aValue = new Date(a.updated_at).getTime()
          bValue = new Date(b.updated_at).getTime()
          break
        case "title":
          aValue = (a.title || "").toLowerCase()
          bValue = (b.title || "").toLowerCase()
          break
        default:
          aValue = new Date(a.created_at).getTime()
          bValue = new Date(b.created_at).getTime()
      }

      if (parsedQuery.order_direction === "asc") {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0
      }
    })

    // Calculate final count after filtering
    const finalCount = filteredProducts.length

    // Apply pagination to filtered results
    const paginatedProducts = filteredProducts.slice(
      parsedQuery.offset,
      parsedQuery.offset + parsedQuery.limit
    )

    // Transform products to UI-friendly format
    const formattedProducts = paginatedProducts.map((product: any) => {
      // Extract prices from variants
      const prices: number[] = []
      const formattedPrices: Array<{ amount: number; currency_code: string }> = []

      if (product.variants && Array.isArray(product.variants)) {
        product.variants.forEach((variant: any) => {
          if (variant.price_set?.prices && Array.isArray(variant.price_set.prices)) {
            variant.price_set.prices.forEach((price: any) => {
              if (price.currency_code === parsedQuery.currency_code) {
                prices.push(price.amount)
                formattedPrices.push({
                  amount: price.amount,
                  currency_code: price.currency_code,
                })
              }
            })
          }
        })
      }

      // Calculate min and max prices
      const minPrice = prices.length > 0 ? Math.min(...prices) : null
      const maxPrice = prices.length > 0 ? Math.max(...prices) : null
      const hasPriceRange = minPrice !== null && maxPrice !== null && minPrice !== maxPrice

      // Format prices for display
      const priceFormatted = formatPrice(minPrice, parsedQuery.currency_code)
      const minPriceFormatted = formatPrice(minPrice, parsedQuery.currency_code)
      const maxPriceFormatted = formatPrice(maxPrice, parsedQuery.currency_code)

      // Format images
      const images = (product.images || []).map((img: any) => ({
        id: img.id,
        url: img.url,
        created_at: img.created_at,
        updated_at: img.updated_at,
      }))

      // Format categories
      const categories = (product.categories || []).map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        handle: cat.handle,
        description: cat.description,
      }))

      // Format variants with prices
      const variants = (product.variants || []).map((variant: any) => {
        const variantPrices = variant.price_set?.prices || []
        const variantPricesForCurrency = variantPrices.filter(
          (p: any) => p.currency_code === parsedQuery.currency_code
        )

        const variantPrice = variantPricesForCurrency.length > 0 ? variantPricesForCurrency[0].amount : null

        return {
          id: variant.id,
          title: variant.title,
          sku: variant.sku,
          barcode: variant.barcode,
          ean: variant.ean,
          upc: variant.upc,
          prices: variantPricesForCurrency.map((p: any) => ({
            amount: p.amount,
            currency_code: p.currency_code,
            formatted: formatPrice(p.amount, p.currency_code),
          })),
          price: variantPrice,
          price_formatted: formatPrice(variantPrice, parsedQuery.currency_code),
          inventory_quantity: 0, // Inventory data not queried for performance - can be added if needed
          manage_inventory: variant.manage_inventory,
          allow_backorder: variant.allow_backorder,
          requires_shipping: variant.requires_shipping,
          weight: variant.weight,
          length: variant.length,
          height: variant.height,
          width: variant.width,
          metadata: variant.metadata || {},
          created_at: variant.created_at,
          updated_at: variant.updated_at,
        }
      })

      // Format brand
      const brand = product.brand ? {
        id: product.brand.id,
        name: product.brand.name,
        slug: product.brand.slug,
        description: product.brand.description,
        logo: product.brand.logo,
        created_at: product.brand.created_at,
        updated_at: product.brand.updated_at,
      } : null

      return {
        id: product.id,
        title: product.title,
        handle: product.handle,
        description: product.description,
        subtitle: product.subtitle,
        status: product.status,
        thumbnail: product.thumbnail,
        images,
        categories,
        variants,
        brand,
        metadata: product.metadata || {},
        // Price information for easy UI rendering
        price: minPrice,
        price_formatted: priceFormatted,
        min_price: minPrice,
        min_price_formatted: minPriceFormatted,
        max_price: maxPrice,
        max_price_formatted: maxPriceFormatted,
        price_range: hasPriceRange ? {
          min: minPrice,
          max: maxPrice,
          min_formatted: minPriceFormatted,
          max_formatted: maxPriceFormatted,
        } : null,
        currency_code: parsedQuery.currency_code,
        // Additional fields
        created_at: product.created_at,
        updated_at: product.updated_at,
        discountable: product.discountable,
        is_giftcard: product.is_giftcard,
      }
    })

    // Extract filter options from all fetched products (before pagination)
    let filterOptions: any = null
    if (parsedQuery.include_filter_options) {
      const allBrands = new Map<string, { id: string; name: string; slug: string }>()
      const allCategories = new Map<string, { id: string; name: string; handle: string }>()
      const rimStyles = new Set<string>()
      const genders = new Set<string>()
      const shapes = new Set<string>()
      const sizes = new Set<string>()

      filteredProducts.forEach((product: any) => {
        // Collect brands
        if (product.brand) {
          if (!allBrands.has(product.brand.id)) {
            allBrands.set(product.brand.id, {
              id: product.brand.id,
              name: product.brand.name,
              slug: product.brand.slug,
            })
          }
        }

        // Collect categories
        if (product.categories && Array.isArray(product.categories)) {
          product.categories.forEach((cat: any) => {
            if (cat && !allCategories.has(cat.id)) {
              allCategories.set(cat.id, {
                id: cat.id,
                name: cat.name,
                handle: cat.handle,
              })
            }
          })
        }

        // Collect metadata attributes
        if (product.metadata) {
          const rimStyle = product.metadata["rim style"] || product.metadata.rim_style
          if (rimStyle) {
            rimStyles.add(String(rimStyle))
          }

          const gender = product.metadata.gender
          if (gender) {
            genders.add(String(gender))
          }

          const shape = product.metadata.shapes
          if (shape) {
            shapes.add(String(shape))
          }

          const size = product.metadata.size
          if (size) {
            sizes.add(String(size))
          }
        }
      })

      filterOptions = {
        brands: Array.from(allBrands.values()).sort((a, b) => a.name.localeCompare(b.name)),
        categories: Array.from(allCategories.values()).sort((a, b) => a.name.localeCompare(b.name)),
        rim_styles: Array.from(rimStyles).sort(),
        genders: Array.from(genders).sort(),
        shapes: Array.from(shapes).sort(),
        sizes: Array.from(sizes).sort(),
      }
    }

    const response: any = {
      products: formattedProducts,
      count: finalCount,
      limit: parsedQuery.limit,
      offset: parsedQuery.offset,
      has_more: parsedQuery.offset + parsedQuery.limit < finalCount,
    }

    if (filterOptions) {
      response.filter_options = filterOptions
    }

    return res.json(response)
  } catch (error) {
    console.error("Error filtering products:", error)

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Invalid query parameters",
        errors: error.errors,
      })
    }

    return res.status(500).json({
      message: error instanceof Error ? error.message : "An error occurred while filtering products",
    })
  }
}
