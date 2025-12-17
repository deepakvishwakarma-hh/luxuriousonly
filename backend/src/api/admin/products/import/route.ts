import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { batchProductsWorkflow, createInventoryLevelsWorkflow } from "@medusajs/medusa/core-flows"
import { Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils"

type ImportRequestBody = {
  csv?: string
  file?: string
  filename?: string
}

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

// Parse CSV string into rows
function parseCSV(csvContent: string): { headers: string[]; rows: string[][] } {
  const lines = csvContent.split("\n").filter((line) => line.trim())
  if (lines.length === 0) {
    return { headers: [], rows: [] }
  }

  // Parse headers
  const headers = parseCSVLine(lines[0])

  // Parse rows
  const rows = lines.slice(1).map((line) => parseCSVLine(line))

  return { headers, rows }
}

// Parse a single CSV line handling quoted fields
function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    const nextChar = line[i + 1]

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"'
        i++ // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes
      }
    } else if (char === "," && !inQuotes) {
      // Field separator
      result.push(current.trim())
      current = ""
    } else {
      current += char
    }
  }
  result.push(current.trim()) // Add last field

  return result
}

// Extract metadata from row data
function extractMetadata(headers: string[], row: string[]): Record<string, any> {
  const metadata: Record<string, any> = {}

  headers.forEach((header, index) => {
    const value = row[index]?.trim()
    if (!value) return

    const normalizedHeader = header.trim().toLowerCase()

    // Check if this is an extra field
    if (ALL_EXTRA_FIELDS.some((field) => normalizedHeader === field.toLowerCase())) {
      // Handle array fields
      if (
        normalizedHeader.includes("synonyms") ||
        normalizedHeader.includes("keyphrases") ||
        normalizedHeader === "robots_advanced" ||
        normalizedHeader === "faq_schema"
      ) {
        try {
          metadata[header.trim()] = JSON.parse(value)
        } catch {
          // If not valid JSON, treat as comma-separated
          metadata[header.trim()] = value.split(",").map((v) => v.trim()).filter(Boolean)
        }
      } else if (normalizedHeader === "product_schema") {
        // Handle JSON object fields
        try {
          metadata[header.trim()] = JSON.parse(value)
        } catch {
          metadata[header.trim()] = value
        }
      } else {
        metadata[header.trim()] = value
      }
    }
  })

  return metadata
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    // Accept CSV as string in body or as file upload
    const body = (req.body as unknown) as ImportRequestBody
    let csvContent: string

    if (body?.csv) {
      // Direct CSV string in body
      csvContent = body.csv
    } else if (body?.file) {
      // File content (already parsed)
      csvContent = body.file
    } else {
      return res.status(400).json({
        message: "CSV content is required. Send { csv: '...' } or upload a file.",
      })
    }

    if (!csvContent || typeof csvContent !== "string") {
      return res.status(400).json({
        message: "Invalid CSV content. Expected a string.",
      })
    }

    // Parse CSV
    const { headers, rows } = parseCSV(csvContent)

    if (headers.length === 0) {
      return res.status(400).json({
        message: "CSV file is empty or invalid.",
      })
    }

    // Normalize headers (case-insensitive matching)
    const normalizedHeaders = headers.map((h) => h.trim().toLowerCase())

    // Find required field indices
    const titleIndex = normalizedHeaders.findIndex((h) => h === "title")
    const handleIndex = normalizedHeaders.findIndex((h) => h === "handle")
    const skuIndex = normalizedHeaders.findIndex((h) => h === "sku")
    const salesChannelIdIndex = normalizedHeaders.findIndex((h) => h === "sales_channel_id" || h === "sales channel id")
    const locationIdIndex = normalizedHeaders.findIndex((h) => h === "location_id" || h === "location id")
    const stockIndex = normalizedHeaders.findIndex((h) => h === "stock")

    if (titleIndex === -1) {
      return res.status(400).json({
        message: "CSV must include a 'Title' column.",
      })
    }

    // Get first available sales channel if needed
    const salesChannelModuleService = req.scope.resolve(Modules.SALES_CHANNEL)
    const allSalesChannels = await salesChannelModuleService.listSalesChannels({})
    const defaultSalesChannelId = allSalesChannels.length > 0 ? allSalesChannels[0].id : null

    if (!defaultSalesChannelId) {
      return res.status(400).json({
        message: "No sales channels found. Please create at least one sales channel before importing products.",
      })
    }

    // Get first available stock location if needed
    const stockLocationModuleService = req.scope.resolve(Modules.STOCK_LOCATION)
    const allStockLocations = await stockLocationModuleService.listStockLocations({})
    const defaultLocationId = allStockLocations.length > 0 ? allStockLocations[0].id : null

    if (!defaultLocationId) {
      return res.status(400).json({
        message: "No stock locations found. Please create at least one stock location before importing products.",
      })
    }

    // Process rows and separate into create/update based on SKU
    const BATCH_SIZE = 200
    const productsToCreate: any[] = []
    const productsToUpdate: any[] = []
    const productLocationStockMap: Array<{ locationId: string; stock: number; sku?: string }> = []
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

    // First pass: collect all SKUs and query existing products
    const skusToCheck: string[] = []
    const rowDataMap: Map<number, any> = new Map()

    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      const row = rows[rowIndex]
      if (row.length < headers.length) {
        // Pad row if needed
        while (row.length < headers.length) {
          row.push("")
        }
      }

      const title = row[titleIndex]?.trim()
      if (!title) continue // Skip empty rows

      // Get SKU if available
      const sku = skuIndex !== -1 ? row[skuIndex]?.trim() : undefined
      if (sku) {
        skusToCheck.push(sku)
      }

      // Store row data for later processing
      rowDataMap.set(rowIndex, { row, sku, title })
    }

    // Query existing products by SKU
    const existingProductsMap = new Map<string, { productId: string; variantId: string }>()
    if (skusToCheck.length > 0) {
      const { data: existingVariants } = await query.graph({
        entity: "product_variant",
        fields: ["id", "sku", "product_id"],
        filters: {
          sku: skusToCheck,
        },
      })

      if (existingVariants && existingVariants.length > 0) {
        for (const variant of existingVariants) {
          if (variant.sku) {
            existingProductsMap.set(variant.sku, {
              productId: variant.product_id || "",
              variantId: variant.id,
            })
          }
        }
      }
    }

    // Second pass: build create/update arrays
    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      const rowData = rowDataMap.get(rowIndex)
      if (!rowData) continue

      const { row, sku, title } = rowData

      // Extract metadata
      const metadata = extractMetadata(headers, row)

      // Get sales channel ID from CSV or use default
      let salesChannelId = defaultSalesChannelId
      if (salesChannelIdIndex !== -1) {
        const csvSalesChannelId = row[salesChannelIdIndex]?.trim()
        if (csvSalesChannelId) {
          // Verify sales channel exists
          const salesChannelExists = allSalesChannels.some((sc) => sc.id === csvSalesChannelId)
          if (salesChannelExists) {
            salesChannelId = csvSalesChannelId
          }
        }
      }

      // Get location ID from CSV or use default
      let locationId = defaultLocationId
      if (locationIdIndex !== -1) {
        const csvLocationId = row[locationIdIndex]?.trim()
        if (csvLocationId) {
          // Verify location exists
          const locationExists = allStockLocations.some((loc) => loc.id === csvLocationId)
          if (locationExists) {
            locationId = csvLocationId
          }
        }
      }

      // Get stock quantity from CSV or default to 0
      let stock = 0
      if (stockIndex !== -1) {
        const csvStock = row[stockIndex]?.trim()
        if (csvStock) {
          stock = parseInt(csvStock) || 0
        }
      }

      // Store location and stock for later inventory level creation
      productLocationStockMap.push({ locationId, stock, sku })

      // Build product data
      const productData: any = {
        title,
        description: row[normalizedHeaders.findIndex((h) => h === "description")] || "",
        handle: handleIndex !== -1 ? row[handleIndex]?.trim() : undefined,
        status: row[normalizedHeaders.findIndex((h) => h === "status")] || "draft",
        subtitle: row[normalizedHeaders.findIndex((h) => h === "subtitle")] || "",
        thumbnail: row[normalizedHeaders.findIndex((h) => h === "thumbnail")] || "",
        metadata,
        sales_channels: salesChannelId ? [{ id: salesChannelId }] : [],
        options: [
          {
            title: "Default",
            values: ["Default"],
          },
        ],
        // Automatically create a variant with product title as variant title
        variants: [
          {
            title: title, // Use product title as variant title
            sku: sku || undefined,
            options: {
              Default: "Default",
            },
            prices: [
              {
                amount: 0,
                currency_code: "USD",
              },
            ],
          },
        ],
      }

      // Check if product exists by SKU
      if (sku && existingProductsMap.has(sku)) {
        const existing = existingProductsMap.get(sku)!
        // Add to update array with product ID
        productsToUpdate.push({
          id: existing.productId,
          ...productData,
          variants: [
            {
              id: existing.variantId,
              ...productData.variants[0],
            },
          ],
        })
      } else {
        // Add to create array
        productsToCreate.push(productData)
      }
    }

    // Process creates in batches
    let totalCreated = 0
    let totalUpdated = 0

    // Track which products were created/updated for inventory level mapping
    // Map row index to location/stock info
    const rowIndexToLocationStock = new Map<number, { locationId: string; stock: number }>()
    let createIndex = 0
    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      const rowData = rowDataMap.get(rowIndex)
      if (!rowData) continue

      const { sku } = rowData
      // Check if this row goes to create or update
      if (!sku || !existingProductsMap.has(sku)) {
        // This is a create
        const { locationId, stock } = productLocationStockMap[rowIndex]
        rowIndexToLocationStock.set(createIndex, { locationId, stock })
        createIndex++
      }
    }

    // Process creates in batches
    let createBatchStartIndex = 0
    for (let i = 0; i < productsToCreate.length; i += BATCH_SIZE) {
      const batch = productsToCreate.slice(i, i + BATCH_SIZE)
      const batchLocationStock = []
      for (let j = 0; j < batch.length; j++) {
        const locationStock = rowIndexToLocationStock.get(createBatchStartIndex + j) || { locationId: defaultLocationId, stock: 0 }
        // @ts-ignore
        batchLocationStock.push(locationStock)
      }
      createBatchStartIndex += batch.length

      const { result } = await batchProductsWorkflow(req.scope).run({
        input: {
          create: batch,
          update: [],
        },
      })

      totalCreated += result.created?.length || 0

      // Create inventory levels for created products
      if (result.created && result.created.length > 0) {
        // Wait a bit for inventory items to be created and linked
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const inventoryLevels: any[] = []
        const seenCombinations = new Set<string>() // Track location_id + inventory_item_id to avoid duplicates

        for (let j = 0; j < result.created.length; j++) {
          const createdProduct = result.created[j]
          const { locationId, stock } = batchLocationStock[j] || { locationId: defaultLocationId, stock: 0 }

          // Get product ID from result
          const productId = createdProduct.id
          if (!productId) continue

          // Query the created product to get variants with inventory items
          const { data: createdProducts } = await query.graph({
            entity: "product",
            fields: [
              "id",
              "variants.id",
              "variants.sku",
              "variants.inventory_items.inventory_item_id",
            ],
            filters: {
              id: productId,
            },
          })

          if (createdProducts && createdProducts.length > 0) {
            const product = createdProducts[0]
            if (product.variants && product.variants.length > 0) {
              // Only process the first variant (we create one variant per product)
              const variant = product.variants[0]

              // Get inventory item ID from variant link
              let inventoryItemId: string | null = null

              // First try to get from inventory_items link
              if ((variant as any).inventory_items?.[0]?.inventory_item_id) {
                inventoryItemId = (variant as any).inventory_items[0].inventory_item_id
              } else {
                // Try to find by variant link
                const { data: variantLinks } = await query.graph({
                  entity: "link_product_variant_inventory_item",
                  fields: ["inventory_item_id"],
                  filters: {
                    variant_id: variant.id,
                  },
                })

                if (variantLinks && variantLinks.length > 0) {
                  inventoryItemId = (variantLinks[0] as any).inventory_item_id
                } else if (variant.sku) {
                  // Last resort: try to find inventory item by SKU
                  const { data: inventoryItems } = await query.graph({
                    entity: "inventory_item",
                    fields: ["id"],
                    filters: {
                      sku: variant.sku,
                    },
                  })

                  if (inventoryItems && inventoryItems.length > 0) {
                    inventoryItemId = inventoryItems[0].id
                  }
                }
              }

              // Only add if we found an inventory item and this combination doesn't exist
              if (inventoryItemId) {
                const combinationKey = `${locationId}:${inventoryItemId}`

                // Check if inventory level already exists
                const { data: existingLevels } = await query.graph({
                  entity: "inventory_level",
                  fields: ["id"],
                  filters: {
                    location_id: locationId,
                    inventory_item_id: inventoryItemId,
                  },
                })

                // Only create if it doesn't exist and we haven't already queued it
                if (!existingLevels || existingLevels.length === 0) {
                  if (!seenCombinations.has(combinationKey)) {
                    seenCombinations.add(combinationKey)
                    inventoryLevels.push({
                      location_id: locationId,
                      inventory_item_id: inventoryItemId,
                      stocked_quantity: stock,
                    })
                  }
                }
              }
            }
          }
        }

        // Create inventory levels if any (deduplicated and checked for existing)
        if (inventoryLevels.length > 0) {
          try {
            await createInventoryLevelsWorkflow(req.scope).run({
              input: {
                inventory_levels: inventoryLevels,
              },
            })
          } catch (inventoryError) {
            console.error("Error creating inventory levels:", inventoryError)
            // Continue even if inventory level creation fails
          }
        }
      }
    }

    // Process updates in batches
    // Map update products to their location/stock by SKU
    const updateSkuMap = new Map<string, { locationId: string; stock: number }>()
    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      const rowData = rowDataMap.get(rowIndex)
      if (!rowData) continue

      const { sku } = rowData
      if (sku && existingProductsMap.has(sku)) {
        const { locationId, stock } = productLocationStockMap[rowIndex]
        updateSkuMap.set(sku, { locationId, stock })
      }
    }

    for (let i = 0; i < productsToUpdate.length; i += BATCH_SIZE) {
      const batch = productsToUpdate.slice(i, i + BATCH_SIZE)

      const { result } = await batchProductsWorkflow(req.scope).run({
        input: {
          create: [],
          update: batch,
        },
      })

      totalUpdated += result.updated?.length || 0

      // Update inventory levels for updated products
      if (result.updated && result.updated.length > 0) {
        // Wait a bit for inventory items to be updated
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const inventoryLevels: any[] = []
        const seenCombinations = new Set<string>()

        for (let j = 0; j < result.updated.length; j++) {
          const updatedProduct = result.updated[j]
          // Get SKU from updated product variant to find location/stock
          const productSku = batch[j]?.variants?.[0]?.sku
          const { locationId, stock } = productSku && updateSkuMap.has(productSku)
            ? updateSkuMap.get(productSku)!
            : { locationId: defaultLocationId, stock: 0 }

          // Get product ID from result
          const productId = updatedProduct.id
          if (!productId) continue

          // Query the updated product to get variants with inventory items
          const { data: updatedProducts } = await query.graph({
            entity: "product",
            fields: [
              "id",
              "variants.id",
              "variants.sku",
              "variants.inventory_items.inventory_item_id",
            ],
            filters: {
              id: productId,
            },
          })

          if (updatedProducts && updatedProducts.length > 0) {
            const product = updatedProducts[0]
            if (product.variants && product.variants.length > 0) {
              // Only process the first variant (we create one variant per product)
              const variant = product.variants[0]

              // Get inventory item ID from variant link
              let inventoryItemId: string | null = null

              // First try to get from inventory_items link
              if ((variant as any).inventory_items?.[0]?.inventory_item_id) {
                inventoryItemId = (variant as any).inventory_items[0].inventory_item_id
              } else {
                // Try to find by variant link
                const { data: variantLinks } = await query.graph({
                  entity: "link_product_variant_inventory_item",
                  fields: ["inventory_item_id"],
                  filters: {
                    variant_id: variant.id,
                  },
                })

                if (variantLinks && variantLinks.length > 0) {
                  inventoryItemId = (variantLinks[0] as any).inventory_item_id
                } else if (variant.sku) {
                  // Last resort: try to find inventory item by SKU
                  const { data: inventoryItems } = await query.graph({
                    entity: "inventory_item",
                    fields: ["id"],
                    filters: {
                      sku: variant.sku,
                    },
                  })

                  if (inventoryItems && inventoryItems.length > 0) {
                    inventoryItemId = inventoryItems[0].id
                  }
                }
              }

              // Only add if we found an inventory item and this combination doesn't exist
              if (inventoryItemId) {
                const combinationKey = `${locationId}:${inventoryItemId}`

                // Check if inventory level already exists
                const { data: existingLevels } = await query.graph({
                  entity: "inventory_level",
                  fields: ["id"],
                  filters: {
                    location_id: locationId,
                    inventory_item_id: inventoryItemId,
                  },
                })

                // Update or create inventory level
                if (existingLevels && existingLevels.length > 0) {
                  // Update existing inventory level (use updateInventoryLevelsWorkflow if available)
                  // For now, we'll create a new one which should update if workflow handles it
                  if (!seenCombinations.has(combinationKey)) {
                    seenCombinations.add(combinationKey)
                    inventoryLevels.push({
                      location_id: locationId,
                      inventory_item_id: inventoryItemId,
                      stocked_quantity: stock,
                    })
                  }
                } else {
                  // Create new inventory level
                  if (!seenCombinations.has(combinationKey)) {
                    seenCombinations.add(combinationKey)
                    inventoryLevels.push({
                      location_id: locationId,
                      inventory_item_id: inventoryItemId,
                      stocked_quantity: stock,
                    })
                  }
                }
              }
            }
          }
        }

        // Create/update inventory levels if any
        if (inventoryLevels.length > 0) {
          try {
            await createInventoryLevelsWorkflow(req.scope).run({
              input: {
                inventory_levels: inventoryLevels,
              },
            })
          } catch (inventoryError) {
            console.error("Error updating inventory levels:", inventoryError)
            // Continue even if inventory level update fails
          }
        }
      }
    }

    return res.status(200).json({
      success: true,
      summary: {
        stats: {
          created: totalCreated,
          updated: totalUpdated,
        },
      },
    })
  } catch (error) {
    console.error("Error importing products:", error)
    return res.status(500).json({
      message: error instanceof Error ? error.message : "An error occurred while importing products",
      success: false,
    })
  }
}
