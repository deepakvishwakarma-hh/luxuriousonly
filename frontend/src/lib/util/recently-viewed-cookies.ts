"use client"

/**
 * Client-side utility for managing recently viewed products in cookies
 * Stores product data (id, handle, thumbnail, title) for instant display
 */

export type RecentlyViewedProduct = {
  id: string
  handle: string
  thumbnail: string | null
  title: string
}

const RECENTLY_VIEWED_COOKIE_NAME = "_medusa_recently_viewed_products"
const MAX_RECENT_PRODUCTS = 8 // Maximum number of recently viewed products to store

// Cache for cookie values to avoid repeated parsing
let cookieCache: { value: RecentlyViewedProduct[]; timestamp: number } | null = null
const CACHE_TTL = 1000 // 1 second cache to avoid excessive parsing

/**
 * Get recently viewed products from cookies (with caching)
 */
export function getRecentlyViewedProducts(): RecentlyViewedProduct[] {
    if (typeof document === "undefined") {
        return []
    }

    // Return cached value if still valid
    if (cookieCache && Date.now() - cookieCache.timestamp < CACHE_TTL) {
        return cookieCache.value
    }

    // Parse cookie string more efficiently
    const cookieString = document.cookie
    const name = `${RECENTLY_VIEWED_COOKIE_NAME}=`
    const startIndex = cookieString.indexOf(name)
    
    if (startIndex === -1) {
        cookieCache = { value: [], timestamp: Date.now() }
        return []
    }

    const valueStart = startIndex + name.length
    const valueEnd = cookieString.indexOf(";", valueStart)
    const cookieValue = valueEnd === -1 
        ? cookieString.substring(valueStart)
        : cookieString.substring(valueStart, valueEnd)

    if (!cookieValue) {
        cookieCache = { value: [], timestamp: Date.now() }
        return []
    }

    try {
        const decoded = decodeURIComponent(cookieValue)
        const products = JSON.parse(decoded)
        const result = Array.isArray(products) ? products : []
        cookieCache = { value: result, timestamp: Date.now() }
        return result
    } catch (error) {
        console.error("Error parsing recently viewed cookie:", error)
        cookieCache = { value: [], timestamp: Date.now() }
        return []
    }
}

/**
 * Set recently viewed products in cookies
 */
export function setRecentlyViewedProducts(products: RecentlyViewedProduct[]): void {
    if (typeof document === "undefined") {
        return
    }

    try {
        // Limit to max products and remove duplicates (keep most recent)
        const seen = new Set<string>()
        const uniqueProducts = products
            .filter((product) => {
                if (seen.has(product.id)) {
                    return false
                }
                seen.add(product.id)
                return true
            })
            .slice(0, MAX_RECENT_PRODUCTS)
        
        const encoded = encodeURIComponent(JSON.stringify(uniqueProducts))
        const maxAge = 60 * 60 * 24 * 30 // 30 days
        document.cookie = `${RECENTLY_VIEWED_COOKIE_NAME}=${encoded}; max-age=${maxAge}; path=/; SameSite=Strict; Secure`
        
        // Invalidate cache when setting new value
        cookieCache = null
    } catch (error) {
        console.error("Error setting recently viewed cookie:", error)
    }
}

/**
 * Add a product to recently viewed (moves to front if already exists)
 */
export function addToRecentlyViewed(product: RecentlyViewedProduct): void {
    const currentProducts = getRecentlyViewedProducts()

    // Remove if already exists (to avoid duplicates)
    const filteredProducts = currentProducts.filter((p) => p.id !== product.id)

    // Add to front (most recent first)
    const updatedProducts = [product, ...filteredProducts]

    setRecentlyViewedProducts(updatedProducts)
}

/**
 * Get recently viewed products excluding current product
 */
export function getRecentlyViewedProductsExcluding(currentProductId: string): RecentlyViewedProduct[] {
    const allProducts = getRecentlyViewedProducts()
    return allProducts.filter((product) => product.id !== currentProductId)
}

// Legacy functions for backward compatibility (if needed)
/**
 * @deprecated Use getRecentlyViewedProducts() instead
 */
export function getRecentlyViewedProductIds(): string[] {
    return getRecentlyViewedProducts().map((p) => p.id)
}

/**
 * @deprecated Use getRecentlyViewedProductsExcluding() instead
 */
export function getRecentlyViewedProductIdsExcluding(currentProductId: string): string[] {
    return getRecentlyViewedProductsExcluding(currentProductId).map((p) => p.id)
}

