import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { batchProductsWorkflow, createInventoryLevelsWorkflow } from "@medusajs/medusa/core-flows"
import { Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { BRAND_MODULE } from "../../../../modules/brand"

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

// Required fields from required-from-admin.md
const REQUIRED_FIELDS = [
  "id",
  "product_id",
  "type",
  "sku",
  "gtin",
  "name",
  "subtitle",
  "description",
  "stock",
  "weight",
  "length",
  "width",
  "height",
  "sale_price",
  "regular_price",
  "categories",
  "tags",
  "thumbnail",
  "images",
  "brand",
  "model",
  "color_code",
  "gender",
  "rim_style",
  "shape",
  "frame_material",
  "size",
  "lens_width",
  "lens_height",
  "leng_bridge",
  "arm_length",
  "department",
  "condition",
  "days_of_delivery",
  "max_days_of_delivery",
  "days_of_delivery_out_of_stock",
  "max_days_of_delivery_out_of_stock",
  "delivery_note",
  "disabled_days",
  "keywords",
  "pattern",
  "age_group",
  "multipack",
  "is_bundle",
  "availablity_date",
  "adult_content",
  "published",
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

    // Check if this is an extra field or required field that should go to metadata
    const isExtraField = ALL_EXTRA_FIELDS.some((field) => normalizedHeader === field.toLowerCase())
    const isRequiredField = REQUIRED_FIELDS.some((field) => normalizedHeader === field.toLowerCase())

    // Skip fields that are handled directly (name, sku, brand, model, etc.)
    // Note: tags is NOT skipped - it will be stored in metadata instead of creating tag relations
    const skipFields = ["name", "title", "sku", "brand", "model", "categories", "images", "thumbnail", "description", "subtitle"]
    if (skipFields.includes(normalizedHeader)) return

    if (isExtraField || (isRequiredField && !skipFields.includes(normalizedHeader))) {
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

// Group products by name (same name = same product, different sizes = variants)
function groupProductsByName(
  products: Array<{ name: string; rowIndex: number; data: any }>
): Map<string, Array<{ rowIndex: number; data: any }>> {
  const groups = new Map<string, Array<{ rowIndex: number; data: any }>>()

  for (const product of products) {
    const groupKey = product.name.toLowerCase().trim()

    if (!groups.has(groupKey)) {
      groups.set(groupKey, [])
    }

    groups.get(groupKey)!.push({
      rowIndex: product.rowIndex,
      data: product.data,
    })
  }

  return groups
}

// Process a single product row and return product data
// Can create variants for products with same name but different sizes
async function processProductRow(
  row: string[],
  headers: string[],
  normalizedHeaders: string[],
  rowIndex: number,
  rowData: any,
  categoryNameToIdMap: Map<string, string>,
  brandNameToIdMap: Map<string, string>,
  allSalesChannels: any[],
  allStockLocations: any[],
  defaultSalesChannelId: string,
  defaultLocationId: string,
  productNameIndex: number,
  handleIndex: number,
  skuIndex: number,
  imagesIndex: number,
  categoriesIndex: number,
  brandIndex: number,
  salesChannelIdIndex: number,
  locationIdIndex: number,
  stockIndex: number,
  salePriceIndex: number,
  regularPriceIndex: number,
  publishedIndex: number,
  sizeIndex: number,
  variantRows: any[] = []
): Promise<{ productData: any; locationStock: { locationId: string; stock: number; sku?: string }; brandId?: string } | null> {
  const { sku, name } = rowData

  // Extract metadata
  const metadata = extractMetadata(headers, row)

  // Get sales channel ID from CSV or use default
  let salesChannelId = defaultSalesChannelId
  if (salesChannelIdIndex !== -1) {
    const csvSalesChannelId = row[salesChannelIdIndex]?.trim()
    if (csvSalesChannelId) {
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

  // Parse images from CSV (can be pipe-separated URLs or JSON array)
  let images: Array<{ url: string }> = []
  if (imagesIndex !== -1) {
    const imagesValue = row[imagesIndex]?.trim()
    if (imagesValue) {
      try {
        // Try to parse as JSON first
        const parsed = JSON.parse(imagesValue)
        if (Array.isArray(parsed)) {
          images = parsed.map((img: any) => {
            if (typeof img === "string") {
              return { url: img }
            }
            return { url: img.url || img }
          })
        } else {
          images = [{ url: parsed }]
        }
      } catch {
        // If not JSON, treat as pipe-separated URLs (or comma-separated)
        const separator = imagesValue.includes("|") ? "|" : ","
        const urls = imagesValue.split(separator).map((url) => url.trim()).filter(Boolean)
        images = urls.map((url) => ({ url }))
      }
    }
  }

  // Parse categories from CSV (comma-separated category names)
  const categoryIds: string[] = []
  if (categoriesIndex !== -1) {
    const categoriesValue = row[categoriesIndex]?.trim()
    if (categoriesValue) {
      const categoryNames = categoriesValue.split(",").map((name) => name.trim()).filter(Boolean)
      for (const categoryName of categoryNames) {
        const categoryId = categoryNameToIdMap.get(categoryName.toLowerCase())
        if (categoryId) {
          categoryIds.push(categoryId)
        }
      }
    }
  }

  // Get size from CSV
  const size = sizeIndex !== -1 ? row[sizeIndex]?.trim() : "Default"

  // Get prices (convert to cents)
  const salePrice = salePriceIndex !== -1 ? parseFloat(row[salePriceIndex]?.trim() || "0") : 0
  const regularPrice = regularPriceIndex !== -1 ? parseFloat(row[regularPriceIndex]?.trim() || "0") : salePrice || 0
  const priceAmount = salePrice > 0 ? Math.round(salePrice * 100) : Math.round(regularPrice * 100)

  // Build main variant for the product
  const mainVariant: any = {
    title: `${name} - ${size}`,
    sku: sku || undefined,
    options: {
      Size: size || "Default",
    },
    prices: [
      {
        amount: priceAmount,
        currency_code: "USD",
      },
    ],
    weight: row[normalizedHeaders.findIndex((h) => h === "weight")] ? parseFloat(row[normalizedHeaders.findIndex((h) => h === "weight")] || "0") : undefined,
    length: row[normalizedHeaders.findIndex((h) => h === "length")] ? parseFloat(row[normalizedHeaders.findIndex((h) => h === "length")] || "0") : undefined,
    width: row[normalizedHeaders.findIndex((h) => h === "width")] ? parseFloat(row[normalizedHeaders.findIndex((h) => h === "width")] || "0") : undefined,
    height: row[normalizedHeaders.findIndex((h) => h === "height")] ? parseFloat(row[normalizedHeaders.findIndex((h) => h === "height")] || "0") : undefined,
    metadata: { ...metadata },
  }

  // Build variants array
  const variants: any[] = [mainVariant]

  // Add variants from other rows with same name but different sizes
  for (const variantRowData of variantRows) {
    const variantRow = variantRowData.row
    const variantSku = skuIndex !== -1 ? variantRow[skuIndex]?.trim() : undefined
    const variantSize = sizeIndex !== -1 ? variantRow[sizeIndex]?.trim() : "Default"
    const variantSalePrice = salePriceIndex !== -1 ? parseFloat(variantRow[salePriceIndex]?.trim() || "0") : 0
    const variantRegularPrice = regularPriceIndex !== -1 ? parseFloat(variantRow[regularPriceIndex]?.trim() || "0") : variantSalePrice || 0
    const variantPriceAmount = variantSalePrice > 0 ? Math.round(variantSalePrice * 100) : Math.round(variantRegularPrice * 100)

    const variantMetadata = extractMetadata(headers, variantRow)

    // Parse variant images from CSV
    let variantImages: Array<{ url: string }> = []
    if (imagesIndex !== -1) {
      const variantImagesValue = variantRow[imagesIndex]?.trim()
      if (variantImagesValue) {
        try {
          const parsed = JSON.parse(variantImagesValue)
          if (Array.isArray(parsed)) {
            variantImages = parsed.map((img: any) => {
              if (typeof img === "string") {
                return { url: img }
              }
              return { url: img.url || img }
            })
          } else {
            variantImages = [{ url: parsed }]
          }
        } catch {
          const separator = variantImagesValue.includes("|") ? "|" : ","
          const urls = variantImagesValue.split(separator).map((url) => url.trim()).filter(Boolean)
          variantImages = urls.map((url) => ({ url }))
        }
      }
    }

    // Add variant images to product images if they're not already there
    if (variantImages.length > 0) {
      for (const variantImage of variantImages) {
        const imageUrl = variantImage.url
        if (!images.some((img) => img.url === imageUrl)) {
          images.push(variantImage)
        }
      }
    }

    const variant: any = {
      title: `${name} - ${variantSize}`,
      sku: variantSku || undefined,
      options: {
        Size: variantSize || "Default",
      },
      prices: [
        {
          amount: variantPriceAmount,
          currency_code: "USD",
        },
      ],
      weight: variantRow[normalizedHeaders.findIndex((h) => h === "weight")] ? parseFloat(variantRow[normalizedHeaders.findIndex((h) => h === "weight")] || "0") : undefined,
      length: variantRow[normalizedHeaders.findIndex((h) => h === "length")] ? parseFloat(variantRow[normalizedHeaders.findIndex((h) => h === "length")] || "0") : undefined,
      width: variantRow[normalizedHeaders.findIndex((h) => h === "width")] ? parseFloat(variantRow[normalizedHeaders.findIndex((h) => h === "width")] || "0") : undefined,
      height: variantRow[normalizedHeaders.findIndex((h) => h === "height")] ? parseFloat(variantRow[normalizedHeaders.findIndex((h) => h === "height")] || "0") : undefined,
      metadata: { ...variantMetadata },
    }

    variants.push(variant)
  }

  // Determine product status based on published field (0 = draft, 1 = published)
  // Also support legacy "status" field for backward compatibility
  let productStatus = "draft"
  if (publishedIndex !== -1) {
    const publishedValue = row[publishedIndex]?.trim()
    if (publishedValue === "1") {
      productStatus = "published"
    } else {
      productStatus = "draft"
    }
  } else {
    // Fallback to status field if published field is not present
    const statusIndex = normalizedHeaders.findIndex((h) => h === "status")
    if (statusIndex !== -1) {
      productStatus = row[statusIndex]?.trim() || "draft"
    }
  }

  // Get brand ID from CSV
  let brandId: string | undefined = undefined
  if (brandIndex !== -1) {
    const brandValue = row[brandIndex]?.trim()
    if (brandValue) {
      const foundBrandId = brandNameToIdMap.get(brandValue.toLowerCase().trim())
      if (foundBrandId) {
        brandId = foundBrandId
      }
    }
  }

  // Build product data
  const productData: any = {
    title: name,
    description: row[normalizedHeaders.findIndex((h) => h === "description")] || "",
    handle: handleIndex !== -1 ? row[handleIndex]?.trim() : undefined,
    status: productStatus,
    subtitle: row[normalizedHeaders.findIndex((h) => h === "subtitle")] || "",
    thumbnail: row[normalizedHeaders.findIndex((h) => h === "thumbnail")] || "",
    images: images.length > 0 ? images : undefined,
    category_ids: categoryIds.length > 0 ? categoryIds : undefined,
    metadata,
    sales_channels: salesChannelId ? [{ id: salesChannelId }] : [],
    options: [
      {
        title: "Size",
        values: variants.map((v) => v.options.Size || "Default"),
      },
    ],
    variants,
  }

  return {
    productData,
    locationStock: { locationId, stock, sku },
    brandId,
  }
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

    // Find required field indices (support both "name" and "title" for backward compatibility)
    const nameIndex = normalizedHeaders.findIndex((h) => h === "name")
    const titleIndex = normalizedHeaders.findIndex((h) => h === "title")
    const productNameIndex = nameIndex !== -1 ? nameIndex : titleIndex

    const handleIndex = normalizedHeaders.findIndex((h) => h === "handle")
    const skuIndex = normalizedHeaders.findIndex((h) => h === "sku")
    const imagesIndex = normalizedHeaders.findIndex((h) => h === "images" || h === "image")
    const categoriesIndex = normalizedHeaders.findIndex((h) => h === "categories" || h === "category")
    const salesChannelIdIndex = normalizedHeaders.findIndex((h) => h === "sales_channel_id" || h === "sales channel id")
    const locationIdIndex = normalizedHeaders.findIndex((h) => h === "location_id" || h === "location id")
    const stockIndex = normalizedHeaders.findIndex((h) => h === "stock")
    const salePriceIndex = normalizedHeaders.findIndex((h) => h === "sale_price")
    const regularPriceIndex = normalizedHeaders.findIndex((h) => h === "regular_price")
    const publishedIndex = normalizedHeaders.findIndex((h) => h === "published")
    const sizeIndex = normalizedHeaders.findIndex((h) => h === "size")

    if (productNameIndex === -1) {
      return res.status(400).json({
        message: "CSV must include a 'name' or 'title' column.",
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

    // Query all categories for name-based lookup
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
    const { data: allCategories } = await query.graph({
      entity: "product_category",
      fields: ["id", "name"],
    })
    const categoryNameToIdMap = new Map<string, string>()
    if (allCategories && allCategories.length > 0) {
      for (const category of allCategories) {
        if (category.name) {
          categoryNameToIdMap.set(category.name.toLowerCase().trim(), category.id)
        }
      }
    }

    // Query all brands for name-based lookup
    const brandIndex = normalizedHeaders.findIndex((h) => h === "brand")
    const { data: allBrands } = await query.graph({
      entity: "brand",
      fields: ["id", "name"],
    })
    const brandNameToIdMap = new Map<string, string>()
    if (allBrands && allBrands.length > 0) {
      for (const brand of allBrands) {
        if (brand.name) {
          brandNameToIdMap.set(brand.name.toLowerCase().trim(), brand.id)
        }
      }
    }

    // Validation: Collect all unique categories and brands from CSV before processing
    const categoriesInCsv = new Map<string, string>() // lowercase -> original case
    const brandsInCsv = new Map<string, string>() // lowercase -> original case

    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      const row = rows[rowIndex]
      if (row.length < headers.length) {
        while (row.length < headers.length) {
          row.push("")
        }
      }

      // Collect categories
      if (categoriesIndex !== -1) {
        const categoriesValue = row[categoriesIndex]?.trim()
        if (categoriesValue) {
          const categoryNames = categoriesValue.split(",").map((name) => name.trim()).filter(Boolean)
          for (const categoryName of categoryNames) {
            const normalized = categoryName.toLowerCase().trim()
            if (!categoriesInCsv.has(normalized)) {
              categoriesInCsv.set(normalized, categoryName)
            }
          }
        }
      }

      // Collect brands
      if (brandIndex !== -1) {
        const brandValue = row[brandIndex]?.trim()
        if (brandValue) {
          const normalized = brandValue.toLowerCase().trim()
          if (!brandsInCsv.has(normalized)) {
            brandsInCsv.set(normalized, brandValue)
          }
        }
      }
    }

    // Validate categories exist
    const missingCategories: string[] = []
    for (const [normalizedCategory, originalCategory] of categoriesInCsv.entries()) {
      if (!categoryNameToIdMap.has(normalizedCategory)) {
        missingCategories.push(originalCategory)
      }
    }

    // Validate brands exist
    const missingBrands: string[] = []
    for (const [normalizedBrand, originalBrand] of brandsInCsv.entries()) {
      if (!brandNameToIdMap.has(normalizedBrand)) {
        missingBrands.push(originalBrand)
      }
    }

    // Return error if any categories or brands are missing
    if (missingCategories.length > 0 || missingBrands.length > 0) {
      const errors: string[] = []
      if (missingCategories.length > 0) {
        errors.push(`The following categories are not available in the database: ${missingCategories.join(", ")}`)
      }
      if (missingBrands.length > 0) {
        errors.push(`The following brands are not available in the database: ${missingBrands.join(", ")}`)
      }
      return res.status(400).json({
        message: "Validation failed",
        errors,
        missingCategories: missingCategories.length > 0 ? missingCategories : undefined,
        missingBrands: missingBrands.length > 0 ? missingBrands : undefined,
      })
    }

    // Process rows and group by product name (same name = same product, different sizes = variants)
    const BATCH_SIZE = 200
    const productsToCreate: any[] = []
    const productLocationStockMap: Array<{ locationId: string; stock: number; sku?: string }> = []
    const skuToLocationStockMap = new Map<string, { locationId: string; stock: number }>()

    // First pass: collect all products for grouping
    const productsForGrouping: Array<{ name: string; rowIndex: number; data: any }> = []

    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      const row = rows[rowIndex]
      if (row.length < headers.length) {
        // Pad row if needed
        while (row.length < headers.length) {
          row.push("")
        }
      }

      const name = row[productNameIndex]?.trim()
      if (!name) continue // Skip empty rows

      // Get SKU if available
      const sku = skuIndex !== -1 ? row[skuIndex]?.trim() : undefined

      // Store row data for processing
      const rowData = { row, sku, name }

      // Add to grouping array
      productsForGrouping.push({
        name,
        rowIndex,
        data: rowData,
      })
    }

    // Group products by name
    const productGroups = groupProductsByName(productsForGrouping)

    // Second pass: build create arrays (grouped by name, variants based on size)
    for (const [groupKey, groupProducts] of productGroups.entries()) {
      if (groupProducts.length === 0) continue

      // First product in group becomes the main product
      const mainProductData = groupProducts[0]
      const { rowIndex: mainRowIndex, data: mainRowData } = mainProductData
      const { row: mainRow, sku: mainSku, name: mainName } = mainRowData

      // Remaining products become variants (if they have different sizes)
      const variantProducts = groupProducts.slice(1)

      // Process main product with variants
      const mainProductProcessed = await processProductRow(
        mainRow,
        headers,
        normalizedHeaders,
        mainRowIndex,
        mainRowData,
        categoryNameToIdMap,
        brandNameToIdMap,
        allSalesChannels,
        allStockLocations,
        defaultSalesChannelId,
        defaultLocationId,
        productNameIndex,
        handleIndex,
        skuIndex,
        imagesIndex,
        categoriesIndex,
        brandIndex,
        salesChannelIdIndex,
        locationIdIndex,
        stockIndex,
        salePriceIndex,
        regularPriceIndex,
        publishedIndex,
        sizeIndex,
        variantProducts.map((vp) => vp.data) // variant data
      )

      if (mainProductProcessed) {
        const { productData, locationStock, brandId } = mainProductProcessed

        // Store location/stock for all variants (main + grouped variants)
        productLocationStockMap.push(locationStock) // Main product
        if (mainSku) {
          skuToLocationStockMap.set(mainSku, { locationId: locationStock.locationId, stock: locationStock.stock })
        }

        // Add variant stocks
        for (const variantProduct of variantProducts) {
          const { data: variantRowData } = variantProduct
          const variantRow = variantRowData.row
          const variantSku = skuIndex !== -1 ? variantRow[skuIndex]?.trim() : undefined

          // Get variant location and stock
          let variantLocationId = defaultLocationId
          if (locationIdIndex !== -1) {
            const csvLocationId = variantRow[locationIdIndex]?.trim()
            if (csvLocationId) {
              const locationExists = allStockLocations.some((loc) => loc.id === csvLocationId)
              if (locationExists) {
                variantLocationId = csvLocationId
              }
            }
          }

          let variantStock = 0
          if (stockIndex !== -1) {
            const csvStock = variantRow[stockIndex]?.trim()
            if (csvStock) {
              variantStock = parseInt(csvStock) || 0
            }
          }

          productLocationStockMap.push({ locationId: variantLocationId, stock: variantStock, sku: variantSku })
          if (variantSku) {
            skuToLocationStockMap.set(variantSku, { locationId: variantLocationId, stock: variantStock })
          }
        }

        productsToCreate.push({ productData, brandId })
      }
    }

    // Process creates in batches
    let totalCreated = 0
    const link = req.scope.resolve(ContainerRegistrationKeys.LINK)

    for (let i = 0; i < productsToCreate.length; i += BATCH_SIZE) {
      const batch = productsToCreate.slice(i, i + BATCH_SIZE)
      const batchLocationStock = productLocationStockMap.slice(i, i + BATCH_SIZE)

      // Extract product data and brand IDs separately
      const batchProductData = batch.map((item) => item.productData)
      const batchBrandIds = batch.map((item) => item.brandId)

      const { result } = await batchProductsWorkflow(req.scope).run({
        input: {
          create: batchProductData,
          update: [],
        },
      })

      console.log("Batch create result:", JSON.stringify(result, null, 2))

      totalCreated += result.created?.length || 0

      // Link brands to products
      if (result.created && result.created.length > 0) {
        const brandLinks: any[] = []
        for (let j = 0; j < result.created.length; j++) {
          const createdProduct = result.created[j]
          const brandId = batch[j]?.brandId

          if (createdProduct.id && brandId) {
            brandLinks.push({
              [Modules.PRODUCT]: {
                product_id: createdProduct.id,
              },
              [BRAND_MODULE]: {
                brand_id: brandId,
              },
            })
          }
        }

        if (brandLinks.length > 0) {
          try {
            await link.create(brandLinks)
            console.log(`Linked ${brandLinks.length} brand(s) to products`)
          } catch (brandLinkError) {
            console.error("Error linking brands to products:", brandLinkError)
            // Continue even if brand linking fails
          }
        }
      }

      // Create inventory levels for created products
      if (result.created && result.created.length > 0) {
        // Wait a bit for inventory items to be created and linked
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const inventoryLevels: any[] = []
        const seenCombinations = new Set<string>() // Track location_id + inventory_item_id to avoid duplicates
        const inventoryModuleService = req.scope.resolve(Modules.INVENTORY)

        for (let j = 0; j < result.created.length; j++) {
          const createdProduct = result.created[j]
          const locationStock = batchLocationStock[j] || { locationId: defaultLocationId, stock: 0 }

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
              // Process all variants (main product + size variants)
              for (const variant of product.variants) {
                // Find matching stock info by SKU
                const variantStockInfo = skuToLocationStockMap.get(variant.sku || "") || locationStock
                const { locationId, stock } = variantStockInfo

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

                // Only add if we found an inventory item
                if (inventoryItemId) {
                  const combinationKey = `${locationId}:${inventoryItemId}`

                  // Check if inventory level already exists
                  const { data: existingLevels } = await query.graph({
                    entity: "inventory_level",
                    fields: ["id", "stocked_quantity"],
                    filters: {
                      location_id: locationId,
                      inventory_item_id: inventoryItemId,
                    },
                  })

                  if (existingLevels && existingLevels.length > 0) {
                    // Update existing inventory level
                    const existingLevel = existingLevels[0] as any
                    if (existingLevel.stocked_quantity !== stock) {
                      try {
                        await inventoryModuleService.updateInventoryLevels({
                          id: existingLevel.id,
                          stocked_quantity: stock,
                        })
                        console.log(`Updated inventory level ${existingLevel.id} to stock ${stock}`)
                      } catch (updateError) {
                        console.error(`Error updating inventory level ${existingLevel.id}:`, updateError)
                      }
                    }
                  } else {
                    // Create new inventory level if it doesn't exist and we haven't already queued it
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

    return res.status(200).json({
      success: true,
      summary: {
        stats: {
          created: totalCreated,
          updated: 0,
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
