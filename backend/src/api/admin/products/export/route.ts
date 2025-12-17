import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

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
        "created_at",
        "updated_at",
        "images.*",
        "variants.*",
        "variants.inventory_items.inventory_item.location_levels.location_id",
        "variants.inventory_items.inventory_item.location_levels.stocked_quantity",
        "sales_channels_link.sales_channel_id",
        "sales_channels.id",
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

    // CSV Headers - Base fields + SKU + Images + All extra fields + Sales Channel ID + Location ID + Stock (no variant fields)
    const headers = [
      "product_id",
      "Title",
      "Description",
      "Handle",
      "SKU",
      "Status",
      "Subtitle",
      "Thumbnail",
      "Images",
      "sales_channel_id",
      "location_id",
      "stock",
      ...ALL_EXTRA_FIELDS,
      "Created At",
      "Updated At",
    ]

    // Build CSV content
    const csvRows = [headers.join(",")]

    // Add product rows (one row per product, not per variant)
    for (const product of products || []) {
      const metadata = product.metadata || {}

      // Extract sales channel ID
      let salesChannelId = ""
      if ((product as any).sales_channels_link?.[0]?.sales_channel_id) {
        salesChannelId = (product as any).sales_channels_link[0].sales_channel_id
      } else if ((product as any).sales_channels?.[0]?.id) {
        salesChannelId = (product as any).sales_channels[0].id
      }

      // Extract SKU from first variant
      let sku = ""
      let locationId = ""
      let stock = ""
      if (product.variants && product.variants.length > 0) {
        const firstVariant = product.variants[0]
        sku = firstVariant.sku || ""

        // Extract location_id and stock from first variant's inventory
        if ((firstVariant as any).inventory_items?.[0]?.inventory_item?.location_levels?.[0]) {
          const locationLevel = (firstVariant as any).inventory_items[0].inventory_item.location_levels[0]
          locationId = locationLevel.location_id || ""
          stock = locationLevel.stocked_quantity?.toString() || "0"
        }
      }

      // Extract images (comma-separated URLs)
      let imagesValue = ""
      if (product.images && Array.isArray(product.images) && product.images.length > 0) {
        imagesValue = product.images.map((img: any) => img.url || "").filter(Boolean).join(",")
      }

      // Create one row per product (variants are handled automatically)
      const row = [
        product.id || "",
        product.title || "",
        product.description || "",
        product.handle || "",
        sku,
        product.status || "",
        product.subtitle || "",
        product.thumbnail || "",
        imagesValue,
        salesChannelId,
        locationId,
        stock,
        // Add all extra fields from metadata
        ...ALL_EXTRA_FIELDS.map((field) => {
          const value = getMetadataValue(metadata, field)
          // Handle arrays and objects
          if (Array.isArray(value) || (typeof value === "object" && value !== null)) {
            return JSON.stringify(value)
          }
          return value
        }),
        product.created_at || "",
        product.updated_at || "",
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
