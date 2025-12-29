"use client"

import { useMemo } from "react"
import useSWR from "swr"
import { HttpTypes } from "@medusajs/types"
import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation } from "swiper/modules"
import { getRecentlyViewedProductIdsExcluding } from "@lib/util/recently-viewed-cookies"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "./thumbnail"

import "swiper/css"
import "swiper/css/navigation"

type RecentlyViewedProductsProps = {
  currentProductId: string
  countryCode: string
  region: HttpTypes.StoreRegion
}

/**
 * Get backend URL for client-side requests
 */
function getBackendUrl(): string {
  if (typeof window !== "undefined") {
    if (window.location.origin.includes("localhost")) {
      return "http://localhost:9000"
    }
    return window.location.origin.replace(/:\d+$/, ":9000")
  }
  return process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
}

/**
 * Fetcher function for SWR to fetch products by IDs
 */
const productsFetcher = async (
  url: string
): Promise<HttpTypes.StoreProduct[]> => {
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY && {
          "x-publishable-api-key":
            process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
        }),
      },
      credentials: "include",
      cache: "no-store",
    })

    if (!response.ok) {
      return []
    }

    const data = await response.json()
    return data?.products || []
  } catch (error) {
    console.error("Error fetching recently viewed products:", error)
    return []
  }
}

export default function RecentlyViewedProducts({
  currentProductId,
  countryCode,
  region,
}: RecentlyViewedProductsProps) {
  // Get recently viewed product IDs (excluding current product)
  const productIds = useMemo(() => {
    if (typeof window === "undefined") return []
    return getRecentlyViewedProductIdsExcluding(currentProductId).slice(0, 10) // Limit to 10
  }, [currentProductId])

  // Build API URL
  const apiUrl = useMemo(() => {
    if (productIds.length === 0) return null

    const backendUrl = getBackendUrl()
    const queryParams = new URLSearchParams()
    // Append each ID as a separate parameter (API expects array format)
    productIds.forEach((id) => {
      queryParams.append("id", id)
    })
    queryParams.set("limit", "10")
    queryParams.set("region_id", region.id)
    queryParams.set("fields", "id,title,handle,thumbnail,images")

    return `${backendUrl}/store/products?${queryParams.toString()}`
  }, [productIds, region.id])

  // Use SWR to fetch products
  const {
    data: products,
    isLoading,
    error,
  } = useSWR<HttpTypes.StoreProduct[]>(apiUrl, productsFetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 5000,
    shouldRetryOnError: false,
  })

  // Don't render if no product IDs
  if (productIds.length === 0) {
    return (
      <div className="text-sm text-gray-700 py-8 text-center">
        <p>No recently viewed products.</p>
      </div>
    )
  }

  // Show loading state with skeleton
  if (isLoading) {
    return (
      <div className="py-4 relative">
        <Swiper
          modules={[Navigation]}
          spaceBetween={16}
          slidesPerView={2}
          breakpoints={{
            640: {
              slidesPerView: 3,
              spaceBetween: 16,
            },
            768: {
              slidesPerView: 4,
              spaceBetween: 20,
            },
          }}
          navigation={true}
          className="recently-viewed-carousel"
        >
          {Array.from({ length: 8 }).map((_, index) => (
            <SwiperSlide key={index}>
              <div className="relative w-full aspect-square rounded-md overflow-hidden bg-gray-200 animate-pulse" />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    )
  }

  // Show error state
  if (error || !products) {
    return (
      <div className="text-sm text-gray-700 py-8 text-center">
        <p>Failed to load recently viewed products.</p>
      </div>
    )
  }

  // Show empty state if no products found
  if (products.length === 0) {
    return (
      <div className="text-sm text-gray-700 py-8 text-center">
        <p>No recently viewed products found.</p>
      </div>
    )
  }

  return (
    <div className="py-4 relative">
      <Swiper
        modules={[Navigation]}
        spaceBetween={16}
        slidesPerView={2}
        breakpoints={{
          640: {
            slidesPerView: 3,
            spaceBetween: 16,
          },
          768: {
            slidesPerView: 4,
            spaceBetween: 20,
          },
        }}
        navigation={true}
        className="recently-viewed-carousel"
      >
        {products.map((product) => {
          return (
            <SwiperSlide key={product.id}>
              <LocalizedClientLink
                href={`/products/${product.handle}`}
                className="group block"
              >
                <div
                  data-testid="product-wrapper"
                  className="relative w-full aspect-square rounded-md overflow-hidden bg-gray-100 hover:opacity-80 transition-opacity"
                >
                  <Thumbnail
                    thumbnail={product.thumbnail}
                    images={product.images}
                    size="full"
                  />
                </div>
              </LocalizedClientLink>
            </SwiperSlide>
          )
        })}
      </Swiper>
    </div>
  )
}
