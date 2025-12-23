"use client"

import Image from "next/image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type CatalogItem = {
  title: string
  href: string
  imageSrc: string
  imageAlt: string
}

const catalogItems: CatalogItem[] = [
  {
    title: "SUNGLASSES",
    href: "/sunglasses",
    imageSrc: "/sample/top-cat1.webp",
    imageAlt: "Woman wearing sunglasses",
  },
  {
    title: "EYEGLASSES",
    href: "/eyeglasses",
    imageSrc: "/sample/top-cat1.webp",
    imageAlt: "Woman wearing eyeglasses",
  },
  {
    title: "SKI GOGGLES",
    href: "/ski-goggles",
    imageSrc: "/sample/top-cat1.webp",
    imageAlt: "Woman wearing ski goggles",
  },
]

const TopCatalog = () => {
  return (
    <div className="w-full content-container py-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {catalogItems.map((item, index) => (
          <div
            key={index}
            className="relative group overflow-hidden w-full aspect-[3/5]"
          >
            {/* Background Image */}
            <Image
              src={item.imageSrc}
              alt={item.imageAlt}
              fill
              quality={100}
              className="object-contain transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 33vw"
              priority={index === 0}
            />

            {/* Button Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 flex justify-center">
              <LocalizedClientLink
                href={item.href}
                className="bg-black text-white px-8 py-4 text-sm font-semibold uppercase tracking-wider hover:bg-opacity-90 transition-all duration-300 flex items-center gap-2 group/button"
              >
                {item.title}
                <span className="transition-transform duration-300 group-hover/button:translate-x-1">
                  →
                </span>
              </LocalizedClientLink>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TopCatalog
