import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { BRAND_MODULE } from "../../../../modules/brand"

// Define all extra fields from EXTRA FEILDS.md
const ESTIMATED_DELIVERY_FIELDS = [
  "days_of_deliery",
  "max_days_of_delivery",
  "days_of_delivery_out_of_stock",
  "max_days_of_delivery_out_of_stock",
  "days_of_delivery_backorders",
  "delivery_note",
  "disebled_days",
]

const SEO_FIELDS = [
  "seo_title",
  "meta_description",
  "slug",
  "focus_keyphrase",
  "keyphrase_synonyms",
  "related_keyphrases",
  "canonical_url",
  "robots_index",
  "robots_follow",
  "robots_advanced",
  "breadcrumb_title",
  "schema_type",
  "schema_subtype",
  "article_type",
  "product_schema",
  "faq_schema",
  "og_title",
  "og_description",
  "og_image",
  "twitter_title",
  "twitter_description",
  "twitter_image",
  "cornerstone",
  "seo_score",
  "readability_score",
]

const EXTRA_FIELDS = [
  "item_no",
  "condition",
  "lens width",
  "lens bridge",
  "arm length",
  "model",
  "color_code",
  "EAN",
  "gender",
  "rim style",
  "shapes",
  "frame_material",
  "size",
  "lens_weight",
  "lens_bridge",
  "arm_length",
  "department",
]

const MARKETPLACE_FIELDS = [
  "gtin",
  "mpn",
  "brand",
  "condition",
  "gender",
  "size",
  "size_system",
  "size_type",
  "color",
  "material",
  "pattern",
  "age_group",
  "multipack",
  "is_bundle",
  "availablity_date",
  "adult_content",
  "region_availability",
]

const ALL_EXTRA_FIELDS = [
  ...ESTIMATED_DELIVERY_FIELDS,
  ...SEO_FIELDS,
  ...EXTRA_FIELDS,
  ...MARKETPLACE_FIELDS,
]

// Helper function to escape CSV fields
function escapeCsvField(field: any): string {
  if (field === null || field === undefined) {
    return ""
  }

  // Handle arrays and objects
  if (Array.isArray(field)) {
    return escapeCsvField(JSON.stringify(field))
  }
  if (typeof field === "object") {
    return escapeCsvField(JSON.stringify(field))
  }

  const str = String(field)
  // If field contains comma, quote, or newline, wrap in quotes and escape quotes
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

// Get metadata value by key (case-insensitive)
function getMetadataValue(metadata: any, key: string): string {
  if (!metadata || typeof metadata !== "object") {
    return ""
  }

  // Try exact match first
  if (metadata[key] !== undefined) {
    return metadata[key]
  }

  // Try case-insensitive match
  const lowerKey = key.toLowerCase()
  for (const metaKey in metadata) {
    if (metaKey.toLowerCase() === lowerKey) {
      return metadata[metaKey]
    }
  }

  return ""
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const query = req.scope.resolve("query")

    // Parse query parameters
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 1000
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0

    // Query products with variants and prices
    // Build query config with pagination
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
        "images.*",
        "categories.*",
        "variants.id",
        "variants.sku",
        "variants.price_set.prices.amount",
        "variants.price_set.prices.currency_code",
      ],
    }

    // Add pagination
    if (limit < 10000) {
      queryConfig.take = limit
      queryConfig.skip = offset
    }

    const {
      data: products,
      metadata: { count } = {},
    } = await query.graph(queryConfig)

    // Query all brands to create a product_id to brand_name map
    const productIdToBrandNameMap = new Map<string, string>()
    try {
      // Query all brands with their products
      const { data: allBrands } = await query.graph({
        entity: "brand",
        fields: ["id", "name", "products.id"],
      })

      if (allBrands && Array.isArray(allBrands)) {
        for (const brand of allBrands) {
          if (brand.products && Array.isArray(brand.products)) {
            for (const product of brand.products) {
              if (product && product.id && brand.name) {
                productIdToBrandNameMap.set(product.id, brand.name)
              }
            }
          }
        }
      }
    } catch (brandError) {
      console.warn("Failed to query brands, continuing without brand names:", brandError)
    }

    // CSV Headers - Match REQUIRED_FIELDS from import exactly
    // Required fields from import route
    const REQUIRED_FIELDS = [
      "id",
      "product_id",
      "type",
      "sku",
      "name",
      "subtitle",
      "description",
      "stock",
      "sales_price",
      "regular_price",
      "categories",
      "images",
      "brand",
      "model",
      "gender",
      "rim_style",
      "shape",
      "frame_material",
      "size",
      "lens_width",
      "leng_bridge",
      "arm_length",
      "condition",
      "keywords",
      "age_group",
      "region_availability",
      "published",
    ]

    const headers = REQUIRED_FIELDS

    // Build CSV content
    const csvRows = [headers.join(",")]

    // Add product rows (one row per product, not per variant)
    for (const product of products || []) {
      const metadata = product.metadata || {}

      // Extract SKU, prices, and stock from first variant
      let sku = ""
      let stock = ""
      let salesPrice = ""
      let regularPrice = ""
      
      if (product.variants && product.variants.length > 0) {
        const firstVariant = product.variants[0]
        sku = firstVariant.sku || ""

        // Extract prices from variant (prices are stored in cents, convert to dollars)
        if (firstVariant.price_set?.prices && Array.isArray(firstVariant.price_set.prices)) {
          const prices = firstVariant.price_set.prices
          // Find USD price (or first price if USD not found)
          const usdPrice = prices.find((p: any) => p.currency_code?.toLowerCase() === "usd") || prices[0]
          if (usdPrice) {
            // Convert from cents to dollars
            const priceInDollars = usdPrice.amount / 100
            // For now, use the same price for both sales_price and regular_price
            // In a real scenario, you might have separate sale/regular prices
            regularPrice = priceInDollars.toString()
            salesPrice = priceInDollars.toString()
          }
        }

        // Query inventory levels separately for the first variant
        if (firstVariant.id) {
          try {
            // Query inventory item link
            const { data: variantLinks } = await query.graph({
              entity: "link_product_variant_inventory_item",
              fields: ["inventory_item_id"],
              filters: {
                variant_id: firstVariant.id,
              },
            })

            if (variantLinks && variantLinks.length > 0) {
              const inventoryItemId = (variantLinks[0] as any).inventory_item_id

              // Query inventory levels for this item
              const { data: inventoryLevels } = await query.graph({
                entity: "inventory_level",
                fields: ["location_id", "stocked_quantity"],
                filters: {
                  inventory_item_id: inventoryItemId,
                },
              })

              if (inventoryLevels && inventoryLevels.length > 0) {
                const firstLevel = inventoryLevels[0] as any
                stock = firstLevel.stocked_quantity?.toString() || "0"
              }
            }
          } catch (inventoryError) {
            // If inventory query fails, just continue with empty values
            console.warn(`Failed to query inventory for variant ${firstVariant.id}:`, inventoryError)
          }
        }
      }

      // Extract images (comma-separated URLs)
      let imagesValue = ""
      if (product.images && Array.isArray(product.images) && product.images.length > 0) {
        imagesValue = product.images.map((img: any) => img.url || "").filter(Boolean).join(",")
      }

      // Extract categories (comma-separated names)
      let categoriesValue = ""
      if (product.categories && Array.isArray(product.categories) && product.categories.length > 0) {
        categoriesValue = product.categories.map((cat: any) => cat.name || "").filter(Boolean).join(",")
      }

      // Extract required fields from metadata or product data
      const type = getMetadataValue(metadata, "type") || ""
      // Get brand name from brand relationship, fallback to metadata
      let brand = productIdToBrandNameMap.get(product.id) || ""
      if (!brand) {
        brand = getMetadataValue(metadata, "brand") || ""
      }
      const model = getMetadataValue(metadata, "model") || ""
      const gender = getMetadataValue(metadata, "gender") || ""
      const rimStyle = getMetadataValue(metadata, "rim_style") || ""
      const shape = getMetadataValue(metadata, "shape") || ""
      const frameMaterial = getMetadataValue(metadata, "frame_material") || ""
      const size = getMetadataValue(metadata, "size") || ""
      const lensWidth = getMetadataValue(metadata, "lens_width") || ""
      const lengBridge = getMetadataValue(metadata, "leng_bridge") || ""
      const armLength = getMetadataValue(metadata, "arm_length") || ""
      const condition = getMetadataValue(metadata, "condition") || ""
      const keywords = getMetadataValue(metadata, "keywords") || ""
      const ageGroup = getMetadataValue(metadata, "age_group") || ""
      const regionAvailability = getMetadataValue(metadata, "region_availability") || ""
      const published = product.status === "published" ? "true" : "false"

      // Handle region_availability as comma-separated string if it's an array
      let regionAvailabilityValue = regionAvailability
      if (typeof regionAvailability === "string" && regionAvailability.startsWith("[")) {
        try {
          const parsed = JSON.parse(regionAvailability)
          if (Array.isArray(parsed)) {
            regionAvailabilityValue = parsed.join(",")
          }
        } catch (e) {
          // If parsing fails, use as is
        }
      }

      // Create row matching REQUIRED_FIELDS order exactly
      const row = [
        product.id || "", // id
        product.id || "", // product_id (same as id)
        type, // type
        sku, // sku
        product.title || "", // name
        product.subtitle || "", // subtitle
        product.description || "", // description
        stock, // stock
        salesPrice, // sales_price
        regularPrice, // regular_price
        categoriesValue, // categories
        imagesValue, // images
        brand, // brand
        model, // model
        gender, // gender
        rimStyle, // rim_style
        shape, // shape
        frameMaterial, // frame_material
        size, // size
        lensWidth, // lens_width
        lengBridge, // leng_bridge
        armLength, // arm_length
        condition, // condition
        keywords, // keywords
        ageGroup, // age_group
        regionAvailabilityValue, // region_availability
        published, // published
      ]
      csvRows.push(row.map(escapeCsvField).join(","))
    }

    const csvContent = csvRows.join("\n")

    // Set headers for CSV download
    res.setHeader("Content-Type", "text/csv; charset=utf-8")
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="products-export-${new Date().toISOString().split("T")[0]}.csv"`
    )

    return res.send(csvContent)
  } catch (error) {
    console.error("Error exporting products:", error)
    return res.status(500).json({
      message: error instanceof Error ? error.message : "An error occurred while exporting products",
    })
  }
}
