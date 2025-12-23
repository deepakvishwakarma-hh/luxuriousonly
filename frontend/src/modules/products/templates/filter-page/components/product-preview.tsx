"use client"

import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "@modules/products/components/thumbnail"
import PreviewPrice from "@modules/products/components/product-preview/price"
import AddToCartButton from "@modules/products/components/product-preview/add-to-cart-button"
import HoverActions from "@modules/products/components/product-preview/hover-actions"

type ProductPreviewProps = {
  product: any
  region: HttpTypes.StoreRegion
  countryCode: string
}

export default function ProductPreview({
  product,
  region,
  countryCode,
}: ProductPreviewProps) {
  // Convert filter API product format to match expected format
  const formattedProduct: HttpTypes.StoreProduct = {
    ...product,
    variants: product.variants?.map((v: any) => ({
      ...v,
      calculated_price: v.price
        ? {
            calculated_amount: v.price,
            currency_code: product.currency_code || "USD",
            original_amount: v.price,
            calculated_price: {
              price_list_type: "sale",
            },
          }
        : undefined,
    })),
  }

  // Get price for display
  let cheapestPrice: any = null
  if (product.price !== null && product.price !== undefined) {
    const priceAmount = product.price / 100 // Convert from cents
    cheapestPrice = {
      calculated_price_number: priceAmount,
      calculated_price: product.price_formatted || `$${priceAmount.toFixed(2)}`,
      original_price_number: priceAmount,
      original_price: product.price_formatted || `$${priceAmount.toFixed(2)}`,
      currency_code: product.currency_code || "USD",
      price_type: "default",
      percentage_diff: null,
    }
  }

  return (
    <LocalizedClientLink href={`/products/${product.handle}`} className="group">
      <div
        data-testid="product-wrapper"
        className="shadow-elevation-card-rest rounded-large group-hover:shadow-elevation-card-hover transition-shadow ease-in-out duration-150 overflow-hidden relative"
      >
        {cheapestPrice &&
          cheapestPrice.price_type === "sale" &&
          cheapestPrice.percentage_diff && (
            <div className="absolute top-2 left-2 z-10 bg-black text-white px-2 py-1 rounded-full text-[11px] font-semibold">
              -{cheapestPrice.percentage_diff}%
            </div>
          )}
        <HoverActions product={formattedProduct} />
        <Thumbnail
          thumbnail={product.thumbnail}
          images={product.images}
          size="full"
        />
        <div className="flex flex-col txt-compact-medium mt-4 justify-between px-4 pb-4">
          <p
            className="text-ui-fg-subtle text-center"
            data-testid="product-title"
          >
            {product.title}
          </p>
          {product.brand && (
            <p className="text-ui-fg-subtle text-center font-bold">
              {product.brand.name}
            </p>
          )}
          <div className="flex items-center justify-center gap-x-2">
            {cheapestPrice && <PreviewPrice price={cheapestPrice} />}
          </div>
          <AddToCartButton
            product={formattedProduct}
            countryCode={countryCode}
          />
        </div>
      </div>
    </LocalizedClientLink>
  )
}

