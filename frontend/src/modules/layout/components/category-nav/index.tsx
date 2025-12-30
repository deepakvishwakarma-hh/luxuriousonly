"use client"

import { useState } from "react"
import { Transition } from "@headlessui/react"
import { Fragment } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ChevronDown from "@modules/common/icons/chevron-down"
import { HttpTypes } from "@medusajs/types"

type CategoryNavProps = {
  categories?: HttpTypes.StoreProductCategory[]
  brands?: Array<{ id: string; name: string; slug?: string | null }>
}

const frameShapes = [
  { name: "Aviator", href: "/store?frame_shape=aviator" },
  { name: "Butterfly", href: "/store?frame_shape=butterfly" },
  { name: "Cat Eye", href: "/store?frame_shape=cat-eye" },
  { name: "Oval", href: "/store?frame_shape=oval" },
  { name: "Rectangular", href: "/store?frame_shape=rectangular" },
  { name: "Round", href: "/store?frame_shape=round" },
  { name: "Square", href: "/store?frame_shape=square" },
]

export default function CategoryNav({
  categories,
  brands = [],
}: CategoryNavProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  // Split brands into two columns
  const brandsPerColumn = Math.ceil(brands.length / 2)
  const brandsColumn1 = brands.slice(0, brandsPerColumn)
  const brandsColumn2 = brands.slice(brandsPerColumn)

  const navItems = [
    {
      label: "SUNGLASSES",
      href: "/store?category=sunglasses",
      dropdown: true,
      content: {
        collections: [
          {
            name: "Man Sunglasses",
            href: "/store?category=sunglasses&gender=man",
          },
          {
            name: "Women Sunglasses",
            href: "/store?category=sunglasses&gender=women",
          },
        ],
        brands: brands,
        frameShapes: frameShapes,
      },
    },
    {
      label: "EYEGLASSES",
      href: "/store?category=eyeglasses",
      dropdown: true,
      content: {
        collections: [
          {
            name: "Man Eyeglasses",
            href: "/store?category=eyeglasses&gender=man",
          },
          {
            name: "Women Eyeglasses",
            href: "/store?category=eyeglasses&gender=women",
          },
        ],
        brands: brands,
        frameShapes: frameShapes,
      },
    },
    {
      label: "SHOP BY BRAND",
      href: "/brands",
      dropdown: false,
    },
  ]

  return (
    <>
<nav className="bg-[#e5e5e5] relative">
  <div className="px-2 sm:px-6 md:px-10">
    <div className="flex items-center justify-center h-12 overflow-x-auto">
      {navItems.map((item) => (
        <div key={item.label} className="relative flex-shrink-0">
          <button
            className="
              flex items-center gap-1
              text-[10px] sm:text-[11px] md:text-[13px] lg:text-sm
              font-bold uppercase
              text-gray-700 hover:text-gray-900
              focus:outline-none
              border-r border-gray-300 last:border-r-0
              px-2 sm:px-3 md:px-4
              whitespace-nowrap
            "
          >
            {item.label}

            <ChevronDown className="w-3 h-3 md:w-4 md:h-4" />
          </button>
        </div>
      ))}
    </div>
  </div>
</nav>

      {/* Full-width dropdown overlay */}
      {openDropdown && (
        <Transition
          show={!!openDropdown}
          as={Fragment}
          enter="transition ease-out duration-200"
          enterFrom="opacity-0 translate-y-1"
          enterTo="opacity-100 translate-y-0"
          leave="transition ease-in duration-150"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 translate-y-1"
        >
          <div className="absolute left-0 md:left-[60px]-- right-0 top-[128px] bg-white border-b border-gray-200 shadow-lg z-40 overflow-x-hidden ">
            <div className="p-6 grid grid-cols-3 gap-8 max-w-3xl mx-auto">
              {(() => {
                const item = navItems.find((i) => i.label === openDropdown)
                if (!item || !item.dropdown) {
                  // SHOP BY BRAND dropdown
                  return (
                    <>
                      <div className="flex flex-col gap-4">
                        <div>
                          <h3 className="text-xs font-bold text-gray-700 uppercase mb-3">
                            FEATURED BRANDS
                          </h3>
                          <ul className="space-y-1.5">
                            {brandsColumn1.map((brand) => (
                              <li key={brand.id}>
                                <LocalizedClientLink
                                  href={`/brands/${brand.slug || brand.id}`}
                                  className="text-sm text-gray-500 hover:text-gray-900"
                                >
                                  {brand.name}
                                </LocalizedClientLink>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <div className="flex flex-col gap-4">
                        <div className="pt-8">
                          <ul className="space-y-1.5">
                            {brandsColumn2.map((brand) => (
                              <li key={brand.id}>
                                <LocalizedClientLink
                                  href={`/brands/${brand.slug || brand.id}`}
                                  className="text-sm text-gray-500 hover:text-gray-900"
                                >
                                  {brand.name}
                                </LocalizedClientLink>
                              </li>
                            ))}
                          </ul>
                          {brands.length > 0 && (
                            <LocalizedClientLink
                              href="/brands"
                              className="text-sm font-semibold text-gray-700 hover:text-gray-900 mt-4 inline-block"
                            >
                              View All Brands
                            </LocalizedClientLink>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-4"></div>
                    </>
                  )
                }
                // SUNGLASSES/EYEGLASSES dropdown
                return (
                  <>
                    <div className="flex flex-col gap-4">
                      <div>
                        <h3 className="text-xs font-bold text-gray-700 uppercase mb-3">
                          COLLECTIONS
                        </h3>
                        <ul className="space-y-2">
                          {item.content?.collections.map((collection) => (
                            <li key={collection.name}>
                              <LocalizedClientLink
                                href={collection.href}
                                className="text-sm font-semibold text-gray-700 hover:text-gray-900"
                              >
                                {collection.name}
                              </LocalizedClientLink>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-gray-700 uppercase mb-3">
                          FEATURED BRANDS
                        </h3>
                        <ul className="space-y-1.5">
                          {brandsColumn1.map((brand) => (
                            <li key={brand.id}>
                              <LocalizedClientLink
                                href={`/brands/${brand.slug || brand.id}`}
                                className="text-sm text-gray-500 hover:text-gray-900"
                              >
                                {brand.name}
                              </LocalizedClientLink>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className="flex flex-col gap-4">
                      <div className="pt-8">
                        <ul className="space-y-1.5">
                          {brandsColumn2.map((brand) => (
                            <li key={brand.id}>
                              <LocalizedClientLink
                                href={`/brands/${brand.slug || brand.id}`}
                                className="text-sm text-gray-500 hover:text-gray-900"
                              >
                                {brand.name}
                              </LocalizedClientLink>
                            </li>
                          ))}
                        </ul>
                        {brands.length > 0 && (
                          <LocalizedClientLink
                            href="/brands"
                            className="text-sm font-semibold text-gray-700 hover:text-gray-900 mt-4 inline-block"
                          >
                            View All Brands
                          </LocalizedClientLink>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-4">
                      <div>
                        <h3 className="text-xs font-bold text-gray-700 uppercase mb-3">
                          FRAME SHAPE
                        </h3>
                        <ul className="space-y-1.5">
                          {item.content?.frameShapes.map((shape) => (
                            <li key={shape.name}>
                              <LocalizedClientLink
                                href={shape.href}
                                className="text-sm text-gray-500 hover:text-gray-900"
                              >
                                {shape.name}
                              </LocalizedClientLink>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </>
                )
              })()}
            </div>
          </div>
        </Transition>
      )}
    </>
  )
}
