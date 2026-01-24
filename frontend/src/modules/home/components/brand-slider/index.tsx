"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation, Autoplay } from "swiper/modules"
import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/autoplay"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { IoChevronBack, IoChevronForward } from "react-icons/io5"

const brands = [
  { name: "Juicy Couture", href: "/brands/juicy-couture", img: "/images/brands/juicy.png" },
  { name: "Jimmy Choo", href: "/brands/jimmy-choo", img: "/images/brands/jimmy-choo.png" },
  { name: "Love Moschino", href: "/brands/love-moschino", img: "/images/brands/love-moschino.png" },
  { name: "Fossil", href: "/brands/fossil", img: "/images/brands/fossil.png" },
  { name: "Missoni", href: "/brands/missoni", img: "/images/brands/missoni.png" },
  { name: "Prada", href: "/brands/prada", img: "/images/brands/prada.png" },
]

export default function BrandSlider() {
  const [autoplayEnabled, setAutoplayEnabled] = useState(false)

  useEffect(() => {
    const check = () => setAutoplayEnabled(typeof window !== 'undefined' && window.innerWidth < 640)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  return (
    <div className="w-full max-w-8xl mx-auto px-5 py-4">
      <div className="relative">
        {/* Navigation buttons */}
        <button
          aria-label="Previous brands"
          className="brand-prev hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black text-white shadow-md hover:bg-gray-800 focus:outline-none"
        >
          <IoChevronBack className="w-5 h-5" />
        </button>

        <Swiper
          modules={[Navigation, Autoplay]}
          loop={true}
          spaceBetween={12}
          slidesPerView={3}
          speed={autoplayEnabled ? 6000 : 800} /* continuous feel on mobile */
          autoplay={autoplayEnabled ? { delay: 1, disableOnInteraction: false, pauseOnMouseEnter: false, reverseDirection: true } : false}
          breakpoints={{
            320: { slidesPerView: 2, spaceBetween: 10 },
            420: { slidesPerView: 3, spaceBetween: 12 },
            640: { slidesPerView: 4, spaceBetween: 16 },
            1024: { slidesPerView: 6, spaceBetween: 24 },
          }}
          navigation={{ prevEl: ".brand-prev", nextEl: ".brand-next" }}
          className="brand-slider"
        >
          {brands.map((b) => (
            <SwiperSlide key={b.name}>
              <LocalizedClientLink
                href={b.href}
                className="flex items-center justify-center bg-white shadow-sm hover:opacity-95 transition-opacity h-28 sm:h-36 md:h-44 px-4 py-3 rounded-md"
              >
                <div className="w-full h-full flex items-center justify-center overflow-hidden">
                  <Image
                    src={b.img}
                    alt={b.name}
                    width={800}
                    height={300}
                    className="object-contain w-full h-full bg-white"
                  />
                </div>
              </LocalizedClientLink>
            </SwiperSlide>
          ))}
        </Swiper>

        <button
          aria-label="Next brands"
          className="brand-next hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black text-white shadow-md hover:bg-gray-800 focus:outline-none"
        >
          <IoChevronForward className="w-5 h-5" />
        </button>

        <style jsx global>{`
          .brand-slider :global(.swiper-slide) {
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: visible;
          }

          .brand-slider :global(.swiper-wrapper) {
            align-items: center;
          }

          /* Force white background for images to cover transparent PNGs */
          .brand-slider :global(.swiper-slide img) {
            background: #ffffff !important;
          }

          /* Make logo tiles white and full width inside slide */
          .brand-slider :global(.swiper-slide) > a {
            background: #ffffff;
          }

          /* Nav buttons sizing */
          .brand-prev, .brand-next {
            width: 40px;
            height: 40px;
          }

          /* Small mobile paddings so multiple logos fit nicely */
          @media (max-width: 639px) {
            .brand-slider :global(.swiper-slide) {
              padding-left: 6px;
              padding-right: 6px;
            }
          }

          /* If images are missing, center brand name */
          .brand-text {
            font-weight: 600;
            color: #4b5563;
          }
        `}</style>
      </div>
    </div>
  )
}
