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
    title: "MEN",
    href: "/store?gender=man",
    imageSrc: "/images/Men.png",
    imageAlt: "Men category",
  },
  {
    title: "WOMEN",
    href: "/store?gender=women",
    imageSrc: "/images/Women.png",
    imageAlt: "Women category",
  },
]

const TopCatalog = () => {
  return (
    <div className="w-full content-container py-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {catalogItems.map((item, index) => (
          <div
            key={index}
            className="relative group overflow-hidden w-full aspect-square"
          >
            {/* Background Image */}
            <Image
              src={item.imageSrc}
              alt={item.imageAlt}
              fill
              quality={100}
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (min-width: 768px) 50vw"
              priority={index === 0} // keep priority on first image
            />

            {/* Button Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-3 flex justify-center">
              <LocalizedClientLink
                href={item.href}
                className="bg-black text-white px-8 py-3 text-sm md:text-base font-semibold uppercase tracking-wider hover:bg-opacity-95 transition-all duration-300 flex items-center gap-3 rounded-md shadow-md hover:shadow-lg transform hover:-translate-y-1 group/button"
              >
                <span className="tracking-wider">{item.title}</span>
                <span className="inline-flex items-center justify-center bg-white text-black rounded-sm w-6 h-6 text-xs font-bold transition-transform duration-300 group-hover/button:translate-x-1 ml-2">
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
