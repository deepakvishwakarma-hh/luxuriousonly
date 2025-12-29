"use client"

import { useEffect } from "react"
import { addToRecentlyViewed } from "@lib/util/recently-viewed-cookies"

type TrackProductViewProps = {
  productId: string
}

/**
 * Client component to track when a product page is viewed
 * Adds the product ID to recently viewed cookies
 */
export default function TrackProductView({ productId }: TrackProductViewProps) {
  useEffect(() => {
    if (productId) {
      addToRecentlyViewed(productId)
    }
  }, [productId])

  return null // This component doesn't render anything
}

