"use client"

import { useEffect } from "react"
import { addToRecentlyViewed, type RecentlyViewedProduct } from "@lib/util/recently-viewed-cookies"

type TrackProductViewProps = {
  product: {
    id: string
    handle: string
    thumbnail: string | null
    title: string
  }
}

/**
 * Client component to track when a product page is viewed
 * Stores product data (id, handle, thumbnail, title) in cookies for instant display
 */
export default function TrackProductView({ product }: TrackProductViewProps) {
  useEffect(() => {
    if (product?.id && product?.handle && product?.title) {
      const productData: RecentlyViewedProduct = {
        id: product.id,
        handle: product.handle,
        thumbnail: product.thumbnail || null,
        title: product.title,
      }
      addToRecentlyViewed(productData)
    }
  }, [product])

  return null // This component doesn't render anything
}

