import "server-only"
import { cookies as nextCookies } from "next/headers"

const RECENTLY_VIEWED_COOKIE_NAME = "_medusa_recently_viewed_ids"

/**
 * Get recently viewed product IDs from cookies (server-side)
 */
export async function getRecentlyViewedProductIds(): Promise<string[]> {
  try {
    const cookies = await nextCookies()
    const recentlyViewedCookie = cookies.get(RECENTLY_VIEWED_COOKIE_NAME)?.value

    if (!recentlyViewedCookie) {
      return []
    }

    try {
      const decoded = decodeURIComponent(recentlyViewedCookie)
      const ids = JSON.parse(decoded)
      return Array.isArray(ids) ? ids : []
    } catch (error) {
      console.error("Error parsing recently viewed cookie:", error)
      return []
    }
  } catch (error) {
    console.error("Error reading recently viewed cookie:", error)
    return []
  }
}

/**
 * Get recently viewed product IDs excluding current product (server-side)
 */
export async function getRecentlyViewedProductIdsExcluding(
  currentProductId: string
): Promise<string[]> {
  const allIds = await getRecentlyViewedProductIds()
  return allIds.filter((id) => id !== currentProductId)
}

