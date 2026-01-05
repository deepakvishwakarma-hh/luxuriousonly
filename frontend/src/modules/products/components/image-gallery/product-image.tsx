"use client"

import Image from "next/image"
import { useState, useRef, useEffect, type MouseEvent } from "react"
import { Swiper, SwiperSlide } from "swiper/react"
import { Pagination } from "swiper/modules"
import Lightbox from "yet-another-react-lightbox"
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen"
import Zoom from "yet-another-react-lightbox/plugins/zoom"

import "swiper/css"
import "swiper/css/pagination"
import "yet-another-react-lightbox/styles.css"

import { BsArrowsFullscreen } from "react-icons/bs"

interface ProductImageCarouselProps {
  images: string[]
  productTitle: string
}

export default function ProductImageCarousel({
  images,
  productTitle,
}: ProductImageCarouselProps) {
  const [activeImage, setActiveImage] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const containerRef = useRef<HTMLDivElement | null>(null)
  const [isZoomed, setIsZoomed] = useState(false)
  const [origin, setOrigin] = useState({ x: 50, y: 50 })
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  const onMouseMove = (e: MouseEvent) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => {
      setOrigin({ x, y })
    })
  }

  useEffect(() => {
    // reset zoom when active image changes
    setIsZoomed(false)
  }, [activeImage])

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square w-full bg-white rounded" />
    )
  }

  const lightboxSlides = images.map((img) => ({ src: img }))

  return (
    <div className="w-full">
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
                  alt={`${productTitle} ${i}`}
                  fill
                  className="object-contain"
                  priority={i === 0}
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        <button
          className="absolute top-2 left-2 z-20 w-9 h-9 rounded-full border-2 border-black bg-white flex items-center justify-center"
          onClick={() => setLightboxOpen(true)}
        >
          <BsArrowsFullscreen />
        </button>
      </div>

      {/* ================= DESKTOP VIEW ================= */}
      <div className="hidden md:grid grid-cols-[80px_1fr] gap-6">
        {/* Thumbnails */}
        <div className="flex flex-col gap-4">
          {images.map((img, index) => (
            <button
              key={index}
              onClick={() => setActiveImage(index)}
              className={`relative aspect-square border rounded-md overflow-hidden ${
                activeImage === index
                  ? "border-black"
                  : "border-gray-200"
              }`}
            >
              <Image
                src={img}
                alt={`Thumbnail ${index}`}
                fill
                className="object-contain"
              />
            </button>
          ))}
        </div>

        {/* Main Image */}
        <div
          className={`relative aspect-square bg-white rounded overflow-hidden ${isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
          ref={containerRef}
          onMouseMove={onMouseMove}
          onMouseEnter={() => setIsZoomed(true)}
          onMouseLeave={() => setIsZoomed(false)}
        >
          
          <Image
            src={images[activeImage]}
            alt={productTitle}
            fill
            className="object-contain"
            priority
          />

          {/* zoom overlay */}
          <div
            className={`absolute inset-0 pointer-events-none hidden md:block transition-opacity duration-150 ${isZoomed ? "opacity-100" : "opacity-0"}`}
            aria-hidden
          >
            <div
              className="absolute inset-0"
              style={{
                transformOrigin: `${origin.x}% ${origin.y}%`,
                transform: isZoomed ? "scale(2)" : "scale(1)",
                transition: isZoomed ? "transform 0s" : "transform 150ms",
                willChange: "transform",
              }}
            >
              <Image
                src={images[activeImage]}
                alt={productTitle}
                fill
                className="object-cover"
                priority={isZoomed}
              />
            </div>
          </div>

          <button
            className="absolute top-3 left-3 z-20 w-10 h-10 rounded-full border-2 border-black bg-white flex items-center justify-center"
            onClick={() => setLightboxOpen(true)}
          >
            <BsArrowsFullscreen />
          </button>
        </div>
      </div>

      {/* ================= LIGHTBOX ================= */}
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={lightboxSlides}
        index={activeImage}
        plugins={[Fullscreen, Zoom]}
        on={{ view: ({ index }) => setActiveImage(index) }}
      />
    </div>
  )
}
