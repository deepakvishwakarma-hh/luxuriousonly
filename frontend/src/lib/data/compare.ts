import "server-only"
import { cookies as nextCookies } from "next/headers"

const COMPARE_COOKIE_NAME = "_medusa_compare_ids"

/**
 * Get compare product IDs from cookies (server-side)
 */
export async function getCompareProductIds(): Promise<string[]> {
  try {
    const cookies = await nextCookies()
    const compareCookie = cookies.get(COMPARE_COOKIE_NAME)?.value

    if (!compareCookie) {
      return []
    }

    try {
      const decoded = decodeURIComponent(compareCookie)
      const ids = JSON.parse(decoded)
      return Array.isArray(ids) ? ids : []
    } catch (error) {
      console.error("Error parsing compare cookie:", error)
      return []
    }
  } catch (error) {
    console.error("Error reading compare cookie:", error)
    return []
  }
}

