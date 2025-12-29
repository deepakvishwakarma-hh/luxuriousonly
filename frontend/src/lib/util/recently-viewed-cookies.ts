"use client"

/**
 * Client-side utility for managing recently viewed product IDs in cookies
 */

const RECENTLY_VIEWED_COOKIE_NAME = "_medusa_recently_viewed_ids"
const MAX_RECENT_PRODUCTS = 8 // Maximum number of recently viewed products to store

/**
 * Get recently viewed product IDs from cookies
 */
export function getRecentlyViewedProductIds(): string[] {
    if (typeof document === "undefined") {
        return []
    }

    const cookies = document.cookie.split(";")
    const recentlyViewedCookie = cookies.find((cookie) =>
        cookie.trim().startsWith(`${RECENTLY_VIEWED_COOKIE_NAME}=`)
    )

    if (!recentlyViewedCookie) {
        return []
    }

    try {
        const value = recentlyViewedCookie.split("=")[1]
        const decoded = decodeURIComponent(value)
        const ids = JSON.parse(decoded)
        return Array.isArray(ids) ? ids : []
    } catch (error) {
        console.error("Error parsing recently viewed cookie:", error)
        return []
    }
}

/**
 * Set recently viewed product IDs in cookies
 */
export function setRecentlyViewedProductIds(ids: string[]): void {
    if (typeof document === "undefined") {
        return
    }

    try {
        // Limit to max products and remove duplicates (keep most recent)
        const uniqueIds = Array.from(new Set(ids)).slice(0, MAX_RECENT_PRODUCTS)
        const encoded = encodeURIComponent(JSON.stringify(uniqueIds))
        const maxAge = 60 * 60 * 24 * 30 // 30 days
        document.cookie = `${RECENTLY_VIEWED_COOKIE_NAME}=${encoded}; max-age=${maxAge}; path=/; SameSite=Strict; Secure`
    } catch (error) {
        console.error("Error setting recently viewed cookie:", error)
    }
}

/**
 * Add a product ID to recently viewed (moves to front if already exists)
 */
export function addToRecentlyViewed(productId: string): void {
    const currentIds = getRecentlyViewedProductIds()

    // Remove if already exists (to avoid duplicates)
    const filteredIds = currentIds.filter((id) => id !== productId)

    // Add to front (most recent first)
    const updatedIds = [productId, ...filteredIds]

    setRecentlyViewedProductIds(updatedIds)
}

/**
 * Get recently viewed product IDs excluding current product
 */
export function getRecentlyViewedProductIdsExcluding(currentProductId: string): string[] {
    const allIds = getRecentlyViewedProductIds()
    return allIds.filter((id) => id !== currentProductId)
}

