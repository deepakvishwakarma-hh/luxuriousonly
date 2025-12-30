"use client"

import Image from "next/image"
import { useState, useRef } from "react"
import { Swiper, SwiperSlide } from "swiper/react"
import type { Swiper as SwiperType } from "swiper"
import { Navigation, Pagination } from "swiper/modules"
import Lightbox from "yet-another-react-lightbox"
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen"
import Slideshow from "yet-another-react-lightbox/plugins/slideshow"
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails"
import Captions from "yet-another-react-lightbox/plugins/captions"
import Zoom from "yet-another-react-lightbox/plugins/zoom"
import "yet-another-react-lightbox/styles.css"

import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"
import { BsArrowsFullscreen } from "react-icons/bs"
import styles from "./product-image.module.css"

interface ProductImageCarouselProps {
  images: string[]
  productTitle: string
}

const ProductImageCarousel = ({
  images,
  productTitle,
}: ProductImageCarouselProps) => {
  const [activeImage, setActiveImage] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const swiperRef = useRef<SwiperType | null>(null)

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-full">
        <div className="relative aspect-square w-full rounded bg-white">
          <Image
            src="/placeholder.svg"
            alt={`${productTitle} - No image available`}
            fill
            className="object-contain w-full h-full"
            priority
          />
        </div>
      </div>
    )
  }

  // Prepare slides for Lightbox
  const lightboxSlides = images.map((img, idx) => ({
    src: img,
    alt: `${productTitle} - View ${idx + 1}`,
  }))

  return (
    <div className="w-full">
      {/* Main Image (carousel) */}
      <div className="relative aspect-square w-full rounded bg-white">
        <Swiper
          spaceBetween={0}
          modules={[Navigation, Pagination]}
          navigation
          pagination={{ clickable: true }}
          className={`h-full ${styles.productImageCarousel}`}
          onSlideChange={(swiper) => setActiveImage(swiper.activeIndex)}
          onSwiper={(swiper) => (swiperRef.current = swiper)}
        >
          {images.map((image, index) => (
            <SwiperSlide key={index}>
              <div className="relative w-full h-full">
                <Image
                  src={image}
                  alt={`${productTitle} - View ${index + 1}`}
                  fill
                  className="object-contain"
                  priority={index === 0}
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Enlarge Button */}
        <button
          className="
          absolute top-2 left-2 z-30
          w-9 h-9 md:w-10 md:h-10
          flex items-center justify-center
          rounded-full border-2 border-black
          bg-white/80 backdrop-blur
        "
          onClick={() => setLightboxOpen(true)}
          aria-label="Enlarge image"
        >
          <BsArrowsFullscreen />
        </button>
      </div>

      {/* Lightbox */}
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={lightboxSlides}
        index={activeImage}
        plugins={[Fullscreen, Slideshow, Thumbnails, Zoom, Captions]}
        on={{ view: ({ index }) => setActiveImage(index) }}
      />
    </div>
  )
}

export default ProductImageCarousel
