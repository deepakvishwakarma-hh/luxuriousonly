"use client"

import useSWR from "swr"
import { HttpTypes } from "@medusajs/types"

/**
 * Get authorization headers from cookies (client-side)
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
 * Get backend URL for client-side requests
 */
function getBackendUrl(): string {
  // Use environment variable if available (preferred)
  if (process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL) {
    return process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
  }
  
  if (typeof window !== "undefined") {
    // Client-side: determine backend URL from current origin
    if (window.location.origin.includes("localhost")) {
      return "http://localhost:9000"
    }
    // For production/staging, replace port with backend port
    return window.location.origin.replace(/:\d+$/, ":9000")
  }
  // Fallback for SSR (shouldn't happen in this hook)
  return "http://localhost:9000"
}

/**
 * Fetcher function for SWR to fetch customer data
 */
const customerFetcher = async (): Promise<HttpTypes.StoreCustomer | null> => {
  const authHeaders = getAuthHeaders()

  // If no auth token, return null (not logged in)
  if (!authHeaders || Object.keys(authHeaders).length === 0) {
    return null
  }

  try {
    const backendUrl = getBackendUrl()
    const response = await fetch(`${backendUrl}/store/customers/me?fields=*orders`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders,
        ...(process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY && {
          "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
        }),
      },
      credentials: "include",
      cache: "no-store",
    })

    if (!response.ok) {
      // If 401 or other error, user is not authenticated
      return null
    }

    const data = await response.json()
    return data?.customer || null
  } catch (error) {
    // If error, user is not authenticated
    return null
  }
}

/**
 * Check if auth token exists (client-side only)
 */
function hasAuthToken(): boolean {
  if (typeof document === "undefined") {
    return false
  }

  const cookies = document.cookie.split(";")
  return cookies.some((cookie) => cookie.trim().startsWith("_medusa_jwt="))
}

/**
 * Custom hook to fetch customer details using SWR
 * @returns {Object} SWR response with customer data, loading state, and error
 */
export function useCustomer() {
  // Only fetch if there's potentially an auth token
  // The fetcher will return null if token is invalid
  const shouldFetch = typeof window !== "undefined" ? hasAuthToken() : false
  const swrKey = shouldFetch ? "/store/customers/me" : null

  const { data, error, isLoading, mutate } = useSWR<HttpTypes.StoreCustomer | null>(
    swrKey,
    customerFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
      shouldRetryOnError: false,
    }
  )

  // isLoading is true when:
  // 1. We should fetch AND data is undefined (initial load or revalidating)
  // 2. We should fetch AND isLoading is true from SWR
  const isActuallyLoading = shouldFetch && (isLoading || data === undefined)

  return {
    customer: data ?? null,
    isLoading: isActuallyLoading,
    isError: error,
    mutate,
  }
}

