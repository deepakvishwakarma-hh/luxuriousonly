"use client"

/**
 * Client-side utility for managing compare product IDs in cookies
 */

const COMPARE_COOKIE_NAME = "_medusa_compare_ids"

/**
 * Get compare product IDs from cookies
 */
export function getCompareProductIds(): string[] {
    if (typeof document === "undefined") {
        return []
    }

    const cookies = document.cookie.split(";")
    const compareCookie = cookies.find((cookie) =>
        cookie.trim().startsWith(`${COMPARE_COOKIE_NAME}=`)
    )

    if (!compareCookie) {
        return []
    }

    try {
        const value = compareCookie.split("=")[1]
        const decoded = decodeURIComponent(value)
        const ids = JSON.parse(decoded)
        return Array.isArray(ids) ? ids : []
    } catch (error) {
        console.error("Error parsing compare cookie:", error)
        return []
    }
}

/**
 * Set compare product IDs in cookies
 */
export function setCompareProductIds(ids: string[]): void {
    if (typeof document === "undefined") {
        return
    }

    try {
        const encoded = encodeURIComponent(JSON.stringify(ids))
        const maxAge = 60 * 60 * 24 * 7 // 7 days
        document.cookie = `${COMPARE_COOKIE_NAME}=${encoded}; max-age=${maxAge}; path=/; SameSite=Strict`

        // Dispatch custom event for other components to listen
        window.dispatchEvent(new CustomEvent("compareUpdated", { detail: { count: ids.length } }))
    } catch (error) {
        console.error("Error setting compare cookie:", error)
    }
}

/**
 * Add a product ID to compare
 */
export function addToCompare(productId: string): void {
    const currentIds = getCompareProductIds()
    if (!currentIds.includes(productId)) {
        setCompareProductIds([...currentIds, productId])
    }
}

/**
 * Remove a product ID from compare
 */
export function removeFromCompare(productId: string): void {
    const currentIds = getCompareProductIds()
    setCompareProductIds(currentIds.filter((id) => id !== productId))
}

/**
 * Check if a product is in compare
 */
export function isInCompare(productId: string): boolean {
    const currentIds = getCompareProductIds()
    return currentIds.includes(productId)
}

/**
 * Get count of products in compare
 */
export function getCompareCount(): number {
    return getCompareProductIds().length
}

