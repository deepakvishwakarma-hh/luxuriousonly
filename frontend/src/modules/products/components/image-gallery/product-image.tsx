"use client"

import Image from "next/image"
import { useState, useEffect } from "react"
import { Swiper, SwiperSlide } from "swiper/react"
import { Pagination } from "swiper/modules"
import { IoChevronBack, IoChevronForward } from "react-icons/io5"

import "swiper/css"
import "swiper/css/pagination"

interface ProductImageCarouselProps {
  images: string[]
  productTitle: string
  productHandle?: string
  ean?: string
}

export default function ProductImageCarousel({
  images,
  productTitle,
  productHandle,
  ean,
}: ProductImageCarouselProps) {
  const [activeImage, setActiveImage] = useState(0)

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && activeImage > 0) {
        setActiveImage(activeImage - 1)
      } else if (e.key === "ArrowRight" && activeImage < images.length - 1) {
        setActiveImage(activeImage + 1)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [activeImage, images.length])

  const handlePrevious = () => {
    if (activeImage > 0) {
      setActiveImage(activeImage - 1)
    }
  }

  const handleNext = () => {
    if (activeImage < images.length - 1) {
      setActiveImage(activeImage + 1)
    }
  }

  const hasPrevious = activeImage > 0
  const hasNext = activeImage < images.length - 1

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square w-full bg-white rounded" />
    )
  }

  // Generate SEO-optimized alt text
  const getImageAlt = (index: number): string => {
    if (index === 0) {
      // First image: use product slug (handle)
      return productHandle || productTitle
    } else {
      // Subsequent images: use EAN with image number
      const imageNumber = index + 1
      return ean ? `${ean} image #${imageNumber}` : `${productTitle} image #${imageNumber}`
    }
  }

  // Generate aria-describedby ID for each image
  const getImageDescribedBy = (index: number): string => {
    return `product-image-desc-${index}`
  }

  return (
    <div className="w-full">
      {/* Hidden description elements for aria-describedby */}
      <div className="sr-only">
        {images.map((_, index) => (
          <div key={index} id={getImageDescribedBy(index)}>
            {getImageAlt(index)}
          </div>
        ))}
      </div>
      {/* ================= MOBILE SLIDER ================= */}
      <div className="block md:hidden relative aspect-square bg-white rounded">
        <Swiper
          modules={[Pagination]}
          pagination={{ clickable: true }}
          onSlideChange={(s) => setActiveImage(s.activeIndex)}
        >
          {images.map((img, i) => (
            <SwiperSlide key={i}>
              <div className="relative aspect-square">
                <Image
                  src={img}
                  alt={getImageAlt(i)}
                  fill
                  className="object-contain"
                  priority={i === 0}
                  aria-describedby={getImageDescribedBy(i)}
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* ================= DESKTOP VIEW ================= */}
      <div className="hidden md:grid grid-cols-[80px_1fr] gap-6">
        {/* Thumbnails */}
        <div className="flex flex-col gap-4">
          {images.map((img, index) => (
            <button
              key={index}
              type="button"
              onMouseEnter={() => setActiveImage(index)}
              onFocus={() => setActiveImage(index)}
              className={`relative aspect-square border rounded-md overflow-hidden ${activeImage === index ? "border-black" : "border-gray-200"
                }`}
            >
              <Image
                src={img}
                alt={getImageAlt(index)}
                fill
                className="object-contain"
                aria-describedby={getImageDescribedBy(index)}
              />
            </button>
          ))}
        </div>


        {/* Main Image */}
        <div className="relative aspect-square bg-white rounded overflow-hidden border border-gray-500">
          <Image
            src={images[activeImage]}
            alt={getImageAlt(activeImage)}
            fill
            className="object-contain"
            priority
            aria-describedby={getImageDescribedBy(activeImage)}
          />

          {/* Navigation Buttons */}
          {hasPrevious && (
            <button
              type="button"
              onClick={handlePrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white border border-gray-300 rounded-full flex items-center justify-center shadow-lg transition-all z-10"
              aria-label="Previous image"
            >
              <IoChevronBack className="w-5 h-5 text-gray-800" />
            </button>
          )}

          {hasNext && (
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white border border-gray-300 rounded-full flex items-center justify-center shadow-lg transition-all z-10"
              aria-label="Next image"
            >
              <IoChevronForward className="w-5 h-5 text-gray-800" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
