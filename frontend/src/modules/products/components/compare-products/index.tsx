"use client"

import { HttpTypes } from "@medusajs/types"
import Image from "next/image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { getProductPrice } from "@lib/util/get-product-price"
import { removeFromCompare } from "@lib/util/compare-cookies"
import { useRouter } from "next/navigation"
import WoodMartIcon from "@modules/common/icons/woodmart-icon"

type CompareProductsProps = {
  products: HttpTypes.StoreProduct[]
}

export default function CompareProducts({ products }: CompareProductsProps) {
  const router = useRouter()

  const handleRemove = (productId: string) => {
    removeFromCompare(productId)
    router.refresh()
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <p className="text-ui-fg-subtle text-lg">No products to compare.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border border-gray-200">
        <thead>
          <tr className="bg-gray-50">
            <th className="border border-gray-200 p-4 text-left font-semibold">
              Product
            </th>
            {products.map((product) => (
              <th
                key={product.id}
                className="border border-gray-200 p-4 min-w-[250px] relative"
              >
                <button
                  onClick={() => handleRemove(product.id)}
                  className="absolute top-2 right-2 p-1 hover:bg-gray-200 rounded z-10"
                  aria-label="Remove from compare"
                >
                  <WoodMartIcon iconContent="f112" size={16} />
                </button>
                <LocalizedClientLink
                  href={`/products/${product.handle}`}
                  className="block hover:opacity-80 transition-opacity"
                >
                  {product.thumbnail ? (
                    <div className="relative w-full aspect-square mb-4">
                      <Image
                        src={product.thumbnail}
                        alt={product.title || "Product image"}
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 100vw, 250px"
                      />
                    </div>
                  ) : (
                    <div className="w-full aspect-square bg-gray-100 flex items-center justify-center mb-4">
                      <span className="text-ui-fg-subtle">No image</span>
                    </div>
                  )}
                </LocalizedClientLink>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* Title Row */}
          <tr>
            <td className="border border-gray-200 p-4 font-semibold bg-gray-50">
              Title
            </td>
            {products.map((product) => (
              <td key={product.id} className="border border-gray-200 p-4">
                <LocalizedClientLink
                  href={`/products/${product.handle}`}
                  className="text-ui-fg-base hover:text-ui-fg-interactive font-medium"
                >
                  {product.title}
                </LocalizedClientLink>
              </td>
            ))}
          </tr>

          {/* Price Row */}
          <tr>
            <td className="border border-gray-200 p-4 font-semibold bg-gray-50">
              Price
            </td>
            {products.map((product) => {
              const { cheapestPrice } = getProductPrice({ product })
              return (
                <td key={product.id} className="border border-gray-200 p-4">
                  {cheapestPrice ? (
                    <div className="flex flex-col">
                      <span
                        className={
                          cheapestPrice.price_type === "sale"
                            ? "text-ui-fg-interactive font-semibold text-lg"
                            : "text-ui-fg-base font-semibold text-lg"
                        }
                      >
                        {cheapestPrice.calculated_price}
                      </span>
                      {cheapestPrice.price_type === "sale" && (
                        <>
                          <span className="text-ui-fg-subtle line-through text-sm">
                            {cheapestPrice.original_price}
                          </span>
                          <span className="text-ui-fg-interactive text-sm">
                            Save {cheapestPrice.percentage_diff}%
                          </span>
                        </>
                      )}
                    </div>
                  ) : (
                    <span className="text-ui-fg-subtle">N/A</span>
                  )}
                </td>
              )
            })}
          </tr>
        </tbody>
      </table>
    </div>
  )
}
