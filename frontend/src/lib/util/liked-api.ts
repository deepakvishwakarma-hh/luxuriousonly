"use client"

/**
 * Client-side utility for managing liked products via API
 */

import { mutate } from "swr"
import { sdk } from "@lib/config"

// SWR key for liked products - shared across components
export const LIKED_PRODUCTS_SWR_KEY = "/liked-products"

const GUEST_CUSTOMER_ID_COOKIE = "_medusa_guest_customer_id"

/**
 * Get or create a guest customer ID for non-logged in users (client-side)
 */
function getOrCreateGuestCustomerId(): string {
  if (typeof document === "undefined") {
    return ""
  }

  const cookies = document.cookie.split(";")
  const guestIdCookie = cookies.find((cookie) =>
    cookie.trim().startsWith(`${GUEST_CUSTOMER_ID_COOKIE}=`)
  )

  if (guestIdCookie) {
    try {
      return guestIdCookie.split("=")[1]
    } catch {
      // Continue to create new one
    }
  }

  // Generate a unique guest customer ID
  const guestCustomerId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
  const maxAge = 60 * 60 * 24 * 365 // 1 year
  document.cookie = `${GUEST_CUSTOMER_ID_COOKIE}=${guestCustomerId}; max-age=${maxAge}; path=/; SameSite=Strict`

  return guestCustomerId
}

/**
 * Get customer ID - returns logged in customer ID or guest customer ID
 */
async function getCustomerId(): Promise<string | null> {
  try {
    // Try to get customer info if logged in
    const authHeaders = getAuthHeaders()

    console.log("authHeaders", authHeaders)

    if (authHeaders && Object.keys(authHeaders).length > 0) {
      try {
        const response = await sdk.client.fetch<{ customer: { id: string } }>(
          `/store/customers/me`,
          {
            method: "GET",
            headers: authHeaders,
          }
        )
        if (response?.customer?.id) {
          return response.customer.id
        }
      } catch (error) {
        console.error("Error fetching customer:", error)
        // Not logged in or error, continue to guest
      }
    }

    // For guests, use guest customer ID
    return getOrCreateGuestCustomerId()
  } catch (error) {
    console.error("Error getting customer ID:", error)
    // Fallback to guest ID
    return getOrCreateGuestCustomerId()
  }
}

/**
 * Get authorization headers from cookies
 */
function getAuthHeaders(): { authorization: string } | {} {
  if (typeof document === "undefined") {
    return {}
  }

  const cookies = document.cookie.split(";")
  const tokenCookie = cookies.find((cookie) =>
    cookie.trim().startsWith("_medusa_jwt=")
  )

  if (!tokenCookie) {
    return {}
  }

  try {
    const token = tokenCookie.split("=")[1]
    return { authorization: `Bearer ${token}` }
  } catch (error) {
    return {}
  }
}

/**
 * Check if user is logged in
 */
export function isLoggedIn(): boolean {
  const authHeaders = getAuthHeaders()
  return authHeaders && Object.keys(authHeaders).length > 0
}

/**
 * Add a product to liked products (API call)
 */
export async function addToLikedAPI(productId: string): Promise<boolean> {
  try {
    const customerId = await getCustomerId()

    if (!customerId) {
      console.error("Unable to get customer ID")
      return false
    }

    const response = await sdk.client.fetch(
      `/store/liked-products?customer_id=${encodeURIComponent(customerId)}`,
      {
        method: "POST",
        body: { product_id: productId },
      }
    )

    // Dispatch event to update other components
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("likedUpdated"))
    }

    // Revalidate SWR cache
    await mutate(LIKED_PRODUCTS_SWR_KEY)

    return true
  } catch (error: any) {
    console.error("Error adding product to liked:", error)
    // Log more details for debugging
    if (error?.response) {
      console.error("API Error Response:", {
        status: error.response.status,
        data: error.response.data,
      })
    }
    return false
  }
}

/**
 * Remove a product from liked products (API call)
 */
export async function removeFromLikedAPI(productId: string): Promise<boolean> {
  try {
    const customerId = await getCustomerId()

    if (!customerId) {
      console.error("Unable to get customer ID")
      return false
    }

    const response = await sdk.client.fetch<{ success: boolean; message?: string }>(
      `/store/liked-products?customer_id=${encodeURIComponent(customerId)}&product_id=${encodeURIComponent(productId)}`,
      {
        method: "DELETE",
      }
    )

    if (!response.success) {
      console.error("Failed to remove liked product:", response.message || "Unknown error")
      return false
    }

    // Dispatch event to update other components
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("likedUpdated"))
    }

    // Revalidate SWR cache
    await mutate(LIKED_PRODUCTS_SWR_KEY)

    return true
  } catch (error: any) {
    console.error("Error removing product from liked:", error)
    // Log more details for debugging
    if (error?.response) {
      console.error("API Error Response:", {
        status: error.response.status,
        data: error.response.data,
      })
    }
    return false
  }
}

/**
 * Get liked product IDs from API
 */
export async function getLikedProductIdsFromAPI(): Promise<string[]> {
  try {
    const customerId = await getCustomerId()

    if (!customerId) {
      return []
    }

    const data = await sdk.client.fetch<{ product_ids: string[]; count: number }>(
      `/store/liked-products?customer_id=${encodeURIComponent(customerId)}`,
      {
        method: "GET",
      }
    )

    if (!data.product_ids || data.product_ids.length === 0) {
      return []
    }

    return data.product_ids
  } catch (error) {
    console.error("Error fetching liked products from API:", error)
    return []
  }
}

