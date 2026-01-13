"use client"

import { Swiper, SwiperSlide } from "swiper/react"
import { Autoplay, Pagination, Navigation } from "swiper/modules"
import Image from "next/image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import type { Carousel } from "@lib/data/carousels"

import "swiper/css"
import "swiper/css/pagination"
import "swiper/css/navigation"

type HeroCarouselProps = {
  carousels: Carousel[]
}

export default function HeroCarousel({ carousels }: HeroCarouselProps) {
  // Add a static slide (public/sample/slide1.webp) as the first slide
  const slides: Carousel[] = [
    {
      id: "slide1",
      image_url1: "/sample/slide1.webp",
      image_url2: "/sample/slide1.webp",
      link: null,
      order: -1,
    },
    ...(carousels || []),
  ]

  return (
    <div className="w-full relative">
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        spaceBetween={0}
        slidesPerView={1}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
          dynamicBullets: true,
        }}
        navigation={true}
        loop={slides.slice(0, 2).length > 1}
        className="hero-carousel"
      >
        {slides.slice(0, 2).map((carousel) => {
          // Use image_url1 for desktop, image_url2 for mobile
          const desktopImageUrl = carousel.image_url1 || carousel.image_url2
          const mobileImageUrl = carousel.image_url2 || carousel.image_url1

          if (!desktopImageUrl && !mobileImageUrl) return null

          const slideContent = (
            <div className="relative w-full h-[200px] md:h-[600px] group overflow-hidden">
              {/* Desktop image - visible on md and larger screens */}
              {desktopImageUrl && (
                <Image
                  quality={100}
                  src={desktopImageUrl}
                  alt="Carousel slide"
                  fill
                  priority
                  className="object-cover transition-transform duration-500 group-hover:scale-105 hidden md:block"
                  sizes="100vw"
                />
              )}
              {/* Mobile image - visible on small screens */}
              {mobileImageUrl && (
                <Image
                  quality={100}
                  src={mobileImageUrl}
                  alt="Carousel slide"
                  fill
                  priority
                  className="object-cover transition-transform duration-500 group-hover:scale-105 block md:hidden"
                  sizes="100vw"
                />
              )}
            </div>
          )

          return (
            <SwiperSlide key={carousel.id}>
              {carousel.link ? (
                <LocalizedClientLink
                  href={carousel.link}
                  className="block w-full"
                >
                  {slideContent}
                </LocalizedClientLink>
              ) : (
                slideContent
              )}
            </SwiperSlide>
          )
        })}
      </Swiper>
    </div>
  )
}
