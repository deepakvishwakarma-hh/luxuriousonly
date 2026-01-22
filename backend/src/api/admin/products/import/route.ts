import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { batchProductsWorkflow, createInventoryLevelsWorkflow, updateProductsWorkflow } from "@medusajs/medusa/core-flows"
import { Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { BRAND_MODULE } from "../../../../modules/brand"
import * as path from "path"

type ImportRequestBody = {
  csv?: string
  file?: string
  filename?: string
  exchangeRates?: Record<string, number>
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
  "region_availability",
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

    // Skip fields that are handled directly (name, sku, brand, etc.)
    // Note: purchase_cost and model will be stored in metadata
    const skipFields = ["name", "title", "sku", "brand", "categories", "images", "description", "subtitle", "images_alt", "thumbnail_alt", "thumbnail"]
    if (skipFields.includes(normalizedHeader)) return

    // Handle model - store in metadata
    if (normalizedHeader === "model") {
      metadata[header.trim()] = value
      return
    }

    // Handle purchase_cost - store in metadata
    if (normalizedHeader === "purchase_cost") {
      metadata[header.trim()] = value
      return
    }

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
        // Store as string (including region_availability)
        metadata[header.trim()] = value
      }
    }
  })

  return metadata
}

// Fallback currency exchange rates (USD as base)
// Used when live rates cannot be fetched
const FALLBACK_EXCHANGE_RATES: Record<string, number> = {
  USD: 1.0,      // Base currency
  EUR: 0.92,     // 1 USD = 0.92 EUR
  GBP: 0.79,     // 1 USD = 0.79 GBP
  INR: 83.0,     // 1 USD = 83.0 INR
  // Add more currencies as needed
}

// Cache for live exchange rates
let cachedExchangeRates: Record<string, number> | null = null
let cacheTimestamp: number = 0
const CACHE_DURATION = 60 * 60 * 1000 // 1 hour in milliseconds

// Fetch live exchange rates optimistically
// Falls back to hardcoded rates if fetch fails
async function fetchLiveExchangeRates(): Promise<Record<string, number>> {
  // Return cached rates if still valid
  const now = Date.now()
  if (cachedExchangeRates && (now - cacheTimestamp) < CACHE_DURATION) {
    console.log('Using cached exchange rates')
    return cachedExchangeRates
  }

  try {
    // Use exchangerate-api.com free tier (no API key required for basic usage)
    // Alternative: You can use other free APIs like fixer.io, exchangerate.host, etc.
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD', {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      },
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`Exchange rate API returned ${response.status}`)
    }

    const data = await response.json()

    if (data && data.rates && typeof data.rates === 'object') {
      // Convert rates to our format (USD as base = 1.0)
      const rates: Record<string, number> = {
        USD: 1.0, // Base currency
      }

      // Add all rates from API response
      for (const [currency, rate] of Object.entries(data.rates)) {
        if (typeof rate === 'number' && rate > 0) {
          rates[currency.toUpperCase()] = rate
        }
      }

      // Cache the rates
      cachedExchangeRates = rates
      cacheTimestamp = now

      console.log(`Successfully fetched live exchange rates for ${Object.keys(rates).length} currencies`)
      return rates
    } else {
      throw new Error('Invalid exchange rate API response format')
    }
  } catch (error: any) {
    // Optimistic fallback: log warning but continue with fallback rates
    if (error.name === 'AbortError') {
      console.warn('Exchange rate API timeout, using fallback rates')
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      console.warn(`Exchange rate API network error: ${error.message}, using fallback rates`)
    } else {
      console.warn(`Failed to fetch live exchange rates: ${error.message || error}, using fallback rates`)
    }

    // Return fallback rates
    return FALLBACK_EXCHANGE_RATES
  }
}

// Get exchange rates (live or fallback)
// This function never throws - always returns rates
async function getExchangeRates(): Promise<Record<string, number>> {
  try {
    return await fetchLiveExchangeRates()
  } catch (error: any) {
    // Extra safety: if fetchLiveExchangeRates somehow throws, use fallback
    console.warn('Error in getExchangeRates, using fallback rates:', error.message || error)
    return FALLBACK_EXCHANGE_RATES
  }
}

// Convert USD price to target currency
// Uses live rates if available, falls back to hardcoded rates
async function convertCurrency(usdAmount: number, targetCurrency: string, exchangeRates?: Record<string, number>): Promise<number> {
  const rates = exchangeRates || FALLBACK_EXCHANGE_RATES
  const rate = rates[targetCurrency.toUpperCase()] || 1.0
  return usdAmount * rate
}

// Download image from URL and save locally using File module service
// This function never throws - always returns a URL (original or downloaded)
async function downloadAndSaveImage(
  imageUrl: string,
  fileModuleService: any,
  backendUrl?: string
): Promise<string> {
  // Validate inputs
  if (!imageUrl || typeof imageUrl !== 'string' || imageUrl.trim() === '') {
    console.warn('Invalid image URL provided, skipping download')
    return imageUrl || ''
  }

  if (!fileModuleService) {
    console.warn('File module service not available, skipping download')
    return imageUrl
  }

  try {
    // Skip if URL is already a local URL (starts with http://localhost or backend URL)
    if (backendUrl && imageUrl.startsWith(backendUrl)) {
      return imageUrl
    }
    if (imageUrl.startsWith('http://localhost') || imageUrl.startsWith('https://localhost')) {
      return imageUrl
    }
    // Skip if URL is already a relative path (starts with /)
    if (imageUrl.startsWith('/')) {
      return imageUrl
    }

    // Validate URL format
    try {
      new URL(imageUrl)
    } catch {
      console.warn(`Invalid image URL format: ${imageUrl}`)
      return imageUrl
    }

    // Download the image with timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      console.warn(`Failed to download image from ${imageUrl}: ${response.status} ${response.statusText}`)
      return imageUrl // Return original URL if download fails
    }

    // Get the image buffer - wrap in try-catch for extra safety
    let imageBuffer: Buffer
    try {
      imageBuffer = Buffer.from(await response.arrayBuffer())
    } catch (bufferError: any) {
      console.warn(`Failed to read image buffer from ${imageUrl}:`, bufferError.message || bufferError)
      return imageUrl
    }

    // Validate buffer size (prevent extremely large files)
    const maxSize = 50 * 1024 * 1024 // 50MB max
    if (imageBuffer.length > maxSize) {
      console.warn(`Image ${imageUrl} is too large (${(imageBuffer.length / 1024 / 1024).toFixed(2)}MB), skipping download`)
      return imageUrl
    }

    if (imageBuffer.length === 0) {
      console.warn(`Image ${imageUrl} is empty, skipping download`)
      return imageUrl
    }

    // Determine file extension from URL or content type
    let fileExtension = '.jpg' // default
    const contentType = response.headers.get('content-type')
    if (contentType) {
      if (contentType.includes('png')) fileExtension = '.png'
      else if (contentType.includes('gif')) fileExtension = '.gif'
      else if (contentType.includes('webp')) fileExtension = '.webp'
      else if (contentType.includes('jpeg') || contentType.includes('jpg')) fileExtension = '.jpg'
    } else {
      // Try to get extension from URL
      const urlPath = new URL(imageUrl).pathname
      const ext = path.extname(urlPath).toLowerCase()
      if (ext && ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
        fileExtension = ext
      }
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomSuffix = Math.random().toString(36).substring(2, 8)
    const filename = `product-${timestamp}-${randomSuffix}${fileExtension}`

    // Determine MIME type
    let mimeType = 'image/jpeg'
    if (fileExtension === '.png') mimeType = 'image/png'
    else if (fileExtension === '.gif') mimeType = 'image/gif'
    else if (fileExtension === '.webp') mimeType = 'image/webp'

    // Save file using File module service - wrap in try-catch for extra safety
    let uploadedFiles: any[]
    try {
      // @ts-ignore
      uploadedFiles = await fileModuleService.createFiles([{
        filename,
        mimeType,
        content: imageBuffer,
      }])
    } catch (saveError: any) {
      console.warn(`Failed to save image ${imageUrl} locally:`, saveError.message || saveError)
      return imageUrl // Return original URL if save fails
    }

    if (!uploadedFiles || uploadedFiles.length === 0) {
      console.warn(`Failed to save image ${imageUrl} locally - no files returned`)
      return imageUrl // Return original URL if save fails
    }

    const uploadedFile = uploadedFiles[0]
    let fileUrl = uploadedFile.url

    // Fix URL if it contains localhost or is a relative path
    if (backendUrl) {
      const normalizedBackendUrl = backendUrl.replace(/\/$/, '')

      // If URL contains localhost or 127.0.0.1, replace it with backend URL
      if (fileUrl.includes('localhost') || fileUrl.includes('127.0.0.1')) {
        try {
          const url = new URL(fileUrl)
          const backendUrlObj = new URL(normalizedBackendUrl)
          fileUrl = fileUrl.replace(url.origin, backendUrlObj.origin)
        } catch (e) {
          fileUrl = fileUrl.replace(/https?:\/\/[^/]+/, normalizedBackendUrl)
        }
      }
      // If URL is a relative path, prepend backend URL
      else if (fileUrl.startsWith('/')) {
        fileUrl = `${normalizedBackendUrl}${fileUrl}`
      }
      // If URL doesn't start with http/https, prepend backend URL
      else if (!fileUrl.startsWith('http://') && !fileUrl.startsWith('https://')) {
        fileUrl = `${normalizedBackendUrl}${fileUrl.startsWith('/') ? '' : '/'}${fileUrl}`
      }
    }

    console.log(`Downloaded and saved image: ${imageUrl} -> ${fileUrl}`)
    return fileUrl
  } catch (error: any) {
    // Handle timeout and other errors gracefully - never throw, always return a URL
    if (error.name === 'AbortError') {
      console.warn(`Timeout downloading image from ${imageUrl} (30s timeout), using original URL`)
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      console.warn(`Network error downloading image from ${imageUrl}: ${error.message}, using original URL`)
    } else if (error.name === 'TypeError' && error.message?.includes('fetch')) {
      console.warn(`Fetch error downloading image from ${imageUrl}: ${error.message}, using original URL`)
    } else {
      console.warn(`Error downloading image from ${imageUrl}: ${error.message || error}, using original URL`)
    }
    // Always return original URL on any error - never throw
    return imageUrl || ''
  }
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
// Each row creates an independent product with a single variant
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
  variantRows: any[] = [],
  supportedCurrencies: string[] = ["USD"],
  fileModuleService?: any,
  backendUrl?: string,
  exchangeRates?: Record<string, number>
): Promise<{ productData: any; locationStock: { locationId: string; stock: number; sku?: string }; brandId?: string } | null> {
  const { sku, name } = rowData

  // Extract metadata
  const metadata = extractMetadata(headers, row)

  // Extract color_code from third word of title (name)
  const nameWords = name.trim().split(/\s+/)
  if (nameWords.length >= 3) {
    metadata.color_code = nameWords[2]
  }

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
  // Wrap in try-catch to ensure image processing errors don't break product import
  let images: Array<{ url: string }> = []
  let thumbnail: string | undefined = undefined
  try {
    if (imagesIndex !== -1) {
      const imagesValue = row[imagesIndex]?.trim()
      if (imagesValue) {
        try {
          // Try to parse as JSON first
          const parsed = JSON.parse(imagesValue)
          if (Array.isArray(parsed)) {
            images = parsed.map((img: any) => {
              const url = typeof img === "string" ? img : (img.url || img)
              return { url }
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

        // Download images and save locally if fileModuleService is available
        // Use Promise.allSettled to handle failures optimistically - continue even if some downloads fail
        if (fileModuleService && images.length > 0) {
          try {
            const downloadResults = await Promise.allSettled(
              images.map(async (img) => {
                try {
                  const localUrl = await downloadAndSaveImage(img.url, fileModuleService, backendUrl)
                  return { url: localUrl }
                } catch (error: any) {
                  // Extra safety: if downloadAndSaveImage somehow throws, catch it here
                  console.warn(`Failed to download image ${img.url}, using original URL:`, error.message || error)
                  return { url: img.url } // Return original URL on any error
                }
              })
            )
            // Extract successful results or use original URL on failure
            images = downloadResults.map((result, index) => {
              if (result.status === 'fulfilled') {
                return result.value
              } else {
                // If promise was rejected, use original URL
                console.warn(`Image download promise rejected for ${images[index].url}, using original URL`)
                return { url: images[index].url }
              }
            })
          } catch (downloadError: any) {
            // If entire download process fails, just use original URLs
            console.warn(`Error during image download process, using original URLs:`, downloadError.message || downloadError)
            // images already contains original URLs, so we can continue
          }
        }

        // Use first image as thumbnail
        if (images.length > 0) {
          thumbnail = images[0].url
        }
      }
    }
  } catch (imageProcessingError: any) {
    // If anything goes wrong with image processing, log and continue with empty images
    console.warn(`Error processing images for product, continuing without images:`, imageProcessingError.message || imageProcessingError)
    images = []
    thumbnail = undefined
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

  // Get prices from CSV - prices in CSV are in dollars (e.g., 70 = $70.00)
  // Store prices in dollars (do NOT convert to cents)
  const salePriceRaw = salePriceIndex !== -1 ? row[salePriceIndex]?.trim() || "0" : "0"
  const regularPriceRaw = regularPriceIndex !== -1 ? row[regularPriceIndex]?.trim() || "0" : salePriceRaw

  // Parse prices - ensure we're treating them as dollars, not cents
  let salePrice = parseFloat(salePriceRaw) || 0
  let regularPrice = parseFloat(regularPriceRaw) || salePrice || 0

  // Safety check: if price seems too large (likely already in cents), divide by 100
  // This handles cases where CSV might have prices in cents instead of dollars
  // Threshold: if price > 10000, it's likely already in cents (e.g., 70000 = $700.00)
  // But we also check if it's divisible by 100 to avoid false positives
  if (salePrice > 10000 && salePrice % 100 === 0) {
    console.warn(`Warning: sales_price (${salePrice}) seems too large and is divisible by 100. Treating as cents and converting to dollars: ${salePrice / 100}`)
    salePrice = salePrice / 100
  }
  if (regularPrice > 10000 && regularPrice % 100 === 0 && regularPrice !== salePrice) {
    console.warn(`Warning: regular_price (${regularPrice}) seems too large and is divisible by 100. Treating as cents and converting to dollars: ${regularPrice / 100}`)
    regularPrice = regularPrice / 100
  }

  const usdPrice = salePrice > 0 ? salePrice : regularPrice

  console.log(`Price parsing - sales_price raw: "${salePriceRaw}", parsed: ${salePrice}, regular_price raw: "${regularPriceRaw}", parsed: ${regularPrice}, final USD price: ${usdPrice}`)

  // Build prices array for all supported currencies with automatic conversion
  const prices: Array<{ amount: number; currency_code: string }> = []

  if (usdPrice > 0) {
    for (const currencyCode of supportedCurrencies) {
      // Convert USD price to target currency using exchange rates
      const convertedPrice = await convertCurrency(usdPrice, currencyCode, exchangeRates)
      // Store price directly in dollars (do NOT multiply by 100)
      // usdPrice is in dollars (e.g., 70), store as 70 (not 7000)
      const priceAmount = Math.round(convertedPrice * 100) / 100 // Round to 2 decimal places

      console.log(`  Converting ${usdPrice} USD to ${currencyCode}: ${convertedPrice} -> ${priceAmount} (stored as dollars, not cents)`)

      if (priceAmount > 0) {
        prices.push({
          amount: priceAmount,
          currency_code: currencyCode,
        })
      }
    }
    console.log(`Final prices for variant:`, JSON.stringify(prices, null, 2))
  }

  // Build main variant for the product
  const mainVariant: any = {
    title: `${name} - ${size}`,
    sku: sku || undefined,
    options: {
      Size: size || "Default",
    },
    prices: prices,
    metadata: { ...metadata },
  }

  // Build variants array
  const variants: any[] = [mainVariant]

  // Add variants from other rows with same name but different sizes
  for (const variantRowData of variantRows) {
    const variantRow = variantRowData.row
    const variantSku = skuIndex !== -1 ? variantRow[skuIndex]?.trim() : undefined
    const variantSize = sizeIndex !== -1 ? variantRow[sizeIndex]?.trim() : "Default"
    // Parse variant prices - same logic as main variant
    const variantSalePriceRaw = salePriceIndex !== -1 ? variantRow[salePriceIndex]?.trim() || "0" : "0"
    const variantRegularPriceRaw = regularPriceIndex !== -1 ? variantRow[regularPriceIndex]?.trim() || "0" : variantSalePriceRaw
    let variantSalePrice = parseFloat(variantSalePriceRaw) || 0
    let variantRegularPrice = parseFloat(variantRegularPriceRaw) || variantSalePrice || 0

    // Safety check: if price seems too large (likely already in cents), divide by 100
    // Threshold: if price > 10000 and divisible by 100, it's likely already in cents
    if (variantSalePrice > 10000 && variantSalePrice % 100 === 0) {
      console.warn(`Warning: variant sales_price (${variantSalePrice}) seems too large and is divisible by 100. Treating as cents and converting to dollars: ${variantSalePrice / 100}`)
      variantSalePrice = variantSalePrice / 100
    }
    if (variantRegularPrice > 10000 && variantRegularPrice % 100 === 0 && variantRegularPrice !== variantSalePrice) {
      console.warn(`Warning: variant regular_price (${variantRegularPrice}) seems too large and is divisible by 100. Treating as cents and converting to dollars: ${variantRegularPrice / 100}`)
      variantRegularPrice = variantRegularPrice / 100
    }

    const variantUsdPrice = variantSalePrice > 0 ? variantSalePrice : variantRegularPrice

    // Build prices array for variant with automatic currency conversion
    const variantPrices: Array<{ amount: number; currency_code: string }> = []

    if (variantUsdPrice > 0) {
      for (const currencyCode of supportedCurrencies) {
        // Convert USD price to target currency using exchange rates
        const convertedPrice = await convertCurrency(variantUsdPrice, currencyCode, exchangeRates)
        // Store price directly in dollars (do NOT multiply by 100)
        const variantPriceAmount = Math.round(convertedPrice * 100) / 100 // Round to 2 decimal places

        if (variantPriceAmount > 0) {
          variantPrices.push({
            amount: variantPriceAmount,
            currency_code: currencyCode,
          })
        }
      }
    }

    const variantMetadata = extractMetadata(headers, variantRow)

    // Extract color_code from third word of title for variant
    const variantNameWords = name.trim().split(/\s+/)
    if (variantNameWords.length >= 3) {
      variantMetadata.color_code = variantNameWords[2]
    }

    // Parse variant images from CSV
    // Wrap in try-catch to ensure variant image processing errors don't break product import
    let variantImages: Array<{ url: string }> = []
    try {
      if (imagesIndex !== -1) {
        const variantImagesValue = variantRow[imagesIndex]?.trim()
        if (variantImagesValue) {
          try {
            const parsed = JSON.parse(variantImagesValue)
            if (Array.isArray(parsed)) {
              variantImages = parsed.map((img: any) => {
                const url = typeof img === "string" ? img : (img.url || img)
                return { url }
              })
            } else {
              variantImages = [{ url: parsed }]
            }
          } catch {
            const separator = variantImagesValue.includes("|") ? "|" : ","
            const urls = variantImagesValue.split(separator).map((url) => url.trim()).filter(Boolean)
            variantImages = urls.map((url) => ({ url }))
          }

          // Download variant images and save locally if fileModuleService is available
          // Use Promise.allSettled to handle failures optimistically - continue even if some downloads fail
          if (fileModuleService && variantImages.length > 0) {
            try {
              const downloadResults = await Promise.allSettled(
                variantImages.map(async (img) => {
                  try {
                    const localUrl = await downloadAndSaveImage(img.url, fileModuleService, backendUrl)
                    return { url: localUrl }
                  } catch (error: any) {
                    // Extra safety: if downloadAndSaveImage somehow throws, catch it here
                    console.warn(`Failed to download variant image ${img.url}, using original URL:`, error.message || error)
                    return { url: img.url } // Return original URL on any error
                  }
                })
              )
              // Extract successful results or use original URL on failure
              variantImages = downloadResults.map((result, index) => {
                if (result.status === 'fulfilled') {
                  return result.value
                } else {
                  // If promise was rejected, use original URL
                  console.warn(`Variant image download promise rejected for ${variantImages[index].url}, using original URL`)
                  return { url: variantImages[index].url }
                }
              })
            } catch (downloadError: any) {
              // If entire download process fails, just use original URLs
              console.warn(`Error during variant image download process, using original URLs:`, downloadError.message || downloadError)
              // variantImages already contains original URLs, so we can continue
            }
          }
        }
      }
    } catch (variantImageProcessingError: any) {
      // If anything goes wrong with variant image processing, log and continue with empty images
      console.warn(`Error processing variant images, continuing without variant images:`, variantImageProcessingError.message || variantImageProcessingError)
      variantImages = []
    }

    // Add variant images to product images if they're not already there
    if (variantImages.length > 0) {
      for (const variantImage of variantImages) {
        const imageUrl = variantImage.url
        if (!images.some((img) => img.url === imageUrl)) {
          images.push(variantImage)
        }
      }
      // Update thumbnail if not set yet
      if (!thumbnail && variantImages.length > 0) {
        thumbnail = variantImages[0].url
      }
    }

    const variant: any = {
      title: `${name} - ${variantSize}`,
      sku: variantSku || undefined,
      options: {
        Size: variantSize || "Default",
      },
      prices: variantPrices,
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
    thumbnail: thumbnail || "",
    images: images.length > 0 ? images : undefined,
    category_ids: categoryIds.length > 0 ? categoryIds : undefined,
    metadata: {
      ...metadata,
    },
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
    const salePriceIndex = normalizedHeaders.findIndex((h) => h === "sales_price")
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

    // Resolve query service for later use
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

    // Query store to get supported currencies
    const storeModuleService = req.scope.resolve(Modules.STORE)
    const stores = await storeModuleService.listStores({})
    const store = stores && stores.length > 0 ? stores[0] : null

    // Get supported currencies from store
    const supportedCurrencies = new Set<string>()
    if (store && store.supported_currencies && Array.isArray(store.supported_currencies)) {
      store.supported_currencies.forEach((currency: any) => {
        if (currency && currency.currency_code) {
          supportedCurrencies.add(currency.currency_code.toUpperCase())
        }
      })
    }

    // If no store currencies found, query regions as fallback
    if (supportedCurrencies.size === 0) {
      const { data: allRegions } = await query.graph({
        entity: "region",
        fields: ["currency_code"],
      })

      if (allRegions && allRegions.length > 0) {
        allRegions.forEach((region: any) => {
          if (region.currency_code) {
            supportedCurrencies.add(region.currency_code.toUpperCase())
          }
        })
      }
    }

    // Always include USD as fallback if no currencies found
    if (supportedCurrencies.size === 0) {
      supportedCurrencies.add("USD")
    } else {
      // Ensure USD is always included if other currencies exist
      supportedCurrencies.add("USD")
    }

    const currencyList = Array.from(supportedCurrencies)
    console.log(`Store supported currencies for import: ${currencyList.join(", ")}`)

    // Query all categories for name-based lookup
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

    // Process rows independently - each row becomes a separate product
    const BATCH_SIZE = 200
    const productsToCreate: any[] = []
    const productLocationStockMap: Array<{ locationId: string; stock: number; sku?: string }> = []
    const skuToLocationStockMap = new Map<string, { locationId: string; stock: number }>()

    // Use exchange rates from request if provided, otherwise fetch them optimistically
    let exchangeRates: Record<string, number>
    if (body.exchangeRates && typeof body.exchangeRates === 'object') {
      // Use rates provided from frontend (user-edited rates)
      exchangeRates = body.exchangeRates
      // Ensure USD is always 1.0
      exchangeRates.USD = 1.0
      console.log(`Using exchange rates from request for ${Object.keys(exchangeRates).length} currencies`)
    } else {
      // Fetch exchange rates optimistically (falls back to hardcoded rates if fetch fails)
      try {
        exchangeRates = await getExchangeRates()
        console.log(`Fetched exchange rates for ${Object.keys(exchangeRates).length} currencies`)
      } catch (error: any) {
        // Extra safety: if getExchangeRates somehow throws, use fallback
        console.warn('Error fetching exchange rates, using fallback rates:', error.message || error)
        exchangeRates = FALLBACK_EXCHANGE_RATES
      }
    }

    // Process each row independently as a separate product
    const processingErrors: Array<{ rowIndex: number; productName: string; error: string }> = []

    // Resolve File module service for image downloads (once for all rows)
    const fileModuleService = req.scope.resolve(Modules.FILE)
    const backendUrl = process.env.BACKEND_URL

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

      // Process each row as an independent product (no variants from other rows)
      let productProcessed: any = null
      try {
        productProcessed = await processProductRow(
          row,
          headers,
          normalizedHeaders,
          rowIndex,
          rowData,
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
          [], // No variant rows - each product is independent
          currencyList, // supported currencies
          fileModuleService, // File module service for image downloads
          backendUrl, // Backend URL for fixing local URLs
          exchangeRates // Exchange rates for currency conversion
        )
      } catch (rowError: any) {
        const errorMessage = rowError instanceof Error ? rowError.message : String(rowError)
        processingErrors.push({
          rowIndex: rowIndex + 1, // +1 because rowIndex is 0-based but users see 1-based
          productName: name || "Unknown",
          error: errorMessage,
        })
        console.error(`Error processing product at row ${rowIndex + 1} (${name}):`, rowError)
        continue // Skip this product and continue with the next
      }

      if (productProcessed) {
        const { productData, locationStock, brandId } = productProcessed

        // Store location/stock for this product
        productLocationStockMap.push(locationStock)
        if (sku) {
          skuToLocationStockMap.set(sku, { locationId: locationStock.locationId, stock: locationStock.stock })
        }

        // Store price information for the variant to update after creation
        const variantPricesMap = new Map<string, Array<{ amount: number; currency_code: string }>>()

        // Store prices for the variant (only one variant per product now)
        if (productData.variants && productData.variants.length > 0) {
          productData.variants.forEach((variant: any) => {
            if (variant.sku && variant.prices && variant.prices.length > 0) {
              variantPricesMap.set(variant.sku, variant.prices)
            }
          })
        }

        productsToCreate.push({ productData, brandId, variantPricesMap })
      }
    }

    // If there were processing errors, include them in the response (but don't fail the entire import)
    if (processingErrors.length > 0) {
      console.warn(`Failed to process ${processingErrors.length} product(s):`, processingErrors)
    }

    // Process creates in batches
    let totalCreated = 0
    const link = req.scope.resolve(ContainerRegistrationKeys.LINK)

    for (let i = 0; i < productsToCreate.length; i += BATCH_SIZE) {
      const batch = productsToCreate.slice(i, i + BATCH_SIZE)
      const batchLocationStock = productLocationStockMap.slice(i, i + BATCH_SIZE)

      // Extract product data and brand IDs separately
      // Remove prices from variants during creation - we'll set them separately after creation (same as test API)
      const batchProductData = batch.map((item) => {
        const productData = { ...item.productData }
        // Remove prices from variants to avoid conflicts - we'll set them in update step
        if (productData.variants) {
          productData.variants = productData.variants.map((variant: any) => {
            const { prices, ...variantWithoutPrices } = variant
            return variantWithoutPrices
          })
        }
        return productData
      })
      const batchBrandIds = batch.map((item) => item.brandId)
      const batchVariantPricesMaps = batch.map((item) => item.variantPricesMap || new Map())

      let result: any
      try {
        const workflowResult = await batchProductsWorkflow(req.scope).run({
          input: {
            create: batchProductData,
            update: [],
          },
        })
        result = workflowResult.result
      } catch (workflowError: any) {
        console.error("Error in batchProductsWorkflow:", workflowError)

        // Extract detailed workflow error information
        let workflowErrorMessage = "Failed to create products in workflow"
        const workflowErrorDetails: any = {
          batchIndex: i,
          batchSize: batch.length,
        }

        if (workflowError instanceof Error) {
          workflowErrorMessage = workflowError.message
          workflowErrorDetails.message = workflowError.message
          workflowErrorDetails.name = workflowError.name
        }

        // Check for workflow-specific error details
        if (workflowError?.errors) {
          workflowErrorDetails.errors = workflowError.errors
        }

        if (workflowError?.action) {
          workflowErrorDetails.action = workflowError.action
        }

        // Throw a more descriptive error
        throw new Error(
          `Workflow error at batch ${Math.floor(i / BATCH_SIZE) + 1}: ${workflowErrorMessage}. ` +
          `Details: ${JSON.stringify(workflowErrorDetails)}`
        )
      }

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
                        //@ts-ignore
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

        // Update variant prices AFTER inventory is created (separate step for better reliability)
        // Wait a bit more to ensure all data is fully persisted
        await new Promise((resolve) => setTimeout(resolve, 1500))

        console.log("Starting price updates for created products...")
        console.log(`Total products in batch: ${result.created.length}`)
        for (let j = 0; j < result.created.length; j++) {
          const createdProduct = result.created[j]
          const variantPricesMap = batchVariantPricesMaps[j] || new Map()

          console.log(`Processing product ${j + 1}/${result.created.length}: ${createdProduct.id}`)
          console.log(`Variant prices map size: ${variantPricesMap.size}`)
          if (variantPricesMap.size > 0) {
            console.log(`Variant prices map contents:`, Array.from(variantPricesMap.entries()).map(([sku, prices]) => `${sku}: ${JSON.stringify(prices)}`))
          }

          if (variantPricesMap.size === 0) {
            console.log(`No prices to update for product ${createdProduct.id}`)
            continue // No prices to update for this product
          }

          // Get product ID from result
          const productId = createdProduct.id
          if (!productId) continue

          // Query variants for this product to update prices
          const { data: productVariants } = await query.graph({
            entity: "product",
            fields: [
              "id",
              "variants.id",
              "variants.sku",
            ],
            filters: {
              id: productId,
            },
          })

          if (!productVariants || productVariants.length === 0) {
            console.warn(`Product ${productId} not found for price update`)
            continue
          }

          const product = productVariants[0]
          if (!product.variants || product.variants.length === 0) {
            continue
          }

          // Collect all variants with prices to update for this product
          const variantsToUpdate: Array<{ id: string; sku: string; prices: Array<{ amount: number; currency_code: string }> }> = []

          for (const variant of product.variants) {
            if (variant.sku && variantPricesMap.has(variant.sku)) {
              const prices = variantPricesMap.get(variant.sku)!

              // Ensure prices array is properly formatted (same as test API)
              // Prices are stored in dollars (not cents), so use them directly
              // DO NOT multiply by 100 - prices are in dollars!
              const formattedPrices = prices.map((p: any) => {
                // Prices are in dollars (e.g., 70 for $70.00), so use directly
                let amount = typeof p.amount === 'number' ? p.amount : parseFloat(String(p.amount))

                console.log(`  Price for ${p.currency_code}: original amount = ${p.amount}, using amount = ${amount} (dollars, not cents)`)

                return {
                  amount: amount, // In dollars, not cents!
                  currency_code: typeof p.currency_code === 'string' ? p.currency_code.toLowerCase() : p.currency_code,
                }
              })

              console.log(`Formatted prices for variant ${variant.sku}:`, JSON.stringify(formattedPrices, null, 2))

              variantsToUpdate.push({
                id: variant.id,
                sku: variant.sku,
                prices: formattedPrices,
              })
            }
          }

          if (variantsToUpdate.length === 0) {
            continue
          }

          // Update all variants for this product in one workflow call (more efficient)
          try {
            console.log(`Updating prices for ${variantsToUpdate.length} variant(s) of product ${productId}`)

            // Update variant prices using updateProductsWorkflow (same logic as working test API)
            const updateResult = await updateProductsWorkflow(req.scope).run({
              input: {
                products: [
                  {
                    id: productId,
                    variants: variantsToUpdate.map(v => ({
                      id: v.id,
                      prices: v.prices, // [{ amount, currency_code }]
                    })),
                  },
                ],
              },
            })

            console.log(`✓ Successfully updated prices for ${variantsToUpdate.length} variant(s) of product ${productId}`)

            // Verify the updates worked
            await new Promise((resolve) => setTimeout(resolve, 500))
            for (const variantUpdate of variantsToUpdate) {
              const { data: verifyData } = await query.graph({
                entity: "product_variant",
                fields: [
                  "id",
                  "sku",
                  "price_set.prices.amount",
                  "price_set.prices.currency_code",
                ],
                filters: {
                  id: variantUpdate.id,
                },
              })

              if (verifyData && verifyData.length > 0) {
                const verifiedVariant = verifyData[0] as any
                const verifiedPrices = verifiedVariant.price_set?.prices || []
                console.log(`✓ Verified: Variant ${variantUpdate.sku} now has ${verifiedPrices.length} price(s):`, verifiedPrices.map((p: any) => `${p.currency_code}:${p.amount} ${p.currency_code.toUpperCase()}`).join(", "))

                // Double-check: log what we sent vs what was stored
                const sentPrices = variantUpdate.prices
                console.log(`  DEBUG - Sent prices:`, JSON.stringify(sentPrices, null, 2))
                console.log(`  DEBUG - Stored prices:`, JSON.stringify(verifiedPrices, null, 2))

                // Check for any mismatch
                for (const sentPrice of sentPrices) {
                  const storedPrice = verifiedPrices.find((p: any) => p.currency_code.toLowerCase() === sentPrice.currency_code.toLowerCase())
                  if (storedPrice) {
                    if (storedPrice.amount !== sentPrice.amount) {
                      console.warn(`  WARNING: Price mismatch for ${sentPrice.currency_code}: sent ${sentPrice.amount}, stored ${storedPrice.amount}`)
                    } else {
                      console.log(`  ✓ Price match for ${sentPrice.currency_code}: ${sentPrice.amount} ${sentPrice.currency_code.toUpperCase()}`)
                    }
                  }
                }
              }
            }
          } catch (priceUpdateError: any) {
            console.error(`✗ Error updating prices for product ${productId}:`, priceUpdateError)
            console.error(`Error details:`, {
              message: priceUpdateError?.message,
              stack: priceUpdateError?.stack,
              name: priceUpdateError?.name,
            })
            // Try updating variants one at a time as fallback
            console.log("Attempting to update variants one at a time as fallback...")
            for (const variantUpdate of variantsToUpdate) {
              try {
                await new Promise((resolve) => setTimeout(resolve, 300))
                await updateProductsWorkflow(req.scope).run({
                  input: {
                    products: [
                      {
                        id: productId,
                        variants: [
                          {
                            id: variantUpdate.id,
                            prices: variantUpdate.prices,
                          },
                        ],
                      },
                    ],
                  },
                })
                console.log(`✓ Fallback: Successfully updated prices for variant ${variantUpdate.sku}`)
              } catch (fallbackError: any) {
                console.error(`✗ Fallback failed for variant ${variantUpdate.sku}:`, fallbackError?.message)
              }
            }
          }
        }
        console.log("Completed price updates for created products")
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
      ...(processingErrors.length > 0 && {
        warnings: {
          failedProducts: processingErrors,
          message: `${processingErrors.length} product(s) failed to process. Check warnings for details.`,
        },
      }),
    })
  } catch (error) {
    console.error("Error importing products:", error)

    // Extract detailed error information
    let errorMessage = "An error occurred while importing products"
    let errorDetails: any = null

    if (error instanceof Error) {
      errorMessage = error.message || errorMessage
      errorDetails = {
        name: error.name,
        message: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      }

      // Check if it's a workflow error with more details
      if ((error as any).action || (error as any).step) {
        errorDetails.workflow = {
          action: (error as any).action,
          step: (error as any).step,
        }
      }

      // Check for validation errors
      if ((error as any).errors) {
        errorDetails.errors = (error as any).errors
      }
    } else if (typeof error === "object" && error !== null) {
      errorDetails = error
      if ("message" in error) {
        errorMessage = String(error.message)
      }
    }

    return res.status(500).json({
      message: errorMessage,
      success: false,
      error: errorDetails,
      ...(errorDetails?.errors && { errors: errorDetails.errors }),
    })
  }
}
