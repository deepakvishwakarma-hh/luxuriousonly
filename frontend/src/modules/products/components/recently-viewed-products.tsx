"use client"

import { useState, useEffect } from "react"
import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation } from "swiper/modules"
import {
  getRecentlyViewedProductsExcluding,
  type RecentlyViewedProduct,
} from "@lib/util/recently-viewed-cookies"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "./thumbnail"

import "swiper/css"
import "swiper/css/navigation"

type RecentlyViewedProductsProps = {
  currentProductId: string
  countryCode: string
}

export default function RecentlyViewedProducts({
  currentProductId,
  countryCode,
}: RecentlyViewedProductsProps) {
  // Use state to track products to avoid hydration issues
  const [products, setProducts] = useState<RecentlyViewedProduct[]>([])

  // Get recently viewed products on client side only
  useEffect(() => {
    const viewedProducts = getRecentlyViewedProductsExcluding(
      currentProductId
    ).slice(0, 10)
    setProducts(viewedProducts)
  }, [currentProductId])

  // Don't render if no products
  if (products.length === 0) {
    return (
      <div className="text-sm text-gray-700 py-8 text-center">
        <p>No recently viewed products.</p>
      </div>
    )
  }

  return (
    <div className="py-4 relative">
      <style jsx global>{`
        .recently-viewed-carousel :global(.swiper-button-next),
        .recently-viewed-carousel :global(.swiper-button-prev) {
          display: none !important;
        }
      `}</style>
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
        navigation={false}
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
                    images={null}
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
