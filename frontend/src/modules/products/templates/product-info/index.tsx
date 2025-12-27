import { Heading } from "@medusajs/ui"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Brand } from "@lib/data/brands"
import Image from "next/image"

type ProductInfoProps = {
  product: HttpTypes.StoreProduct
  brand: Brand | null
}

// Helper function to check if a variant is in stock
const isVariantInStock = (variant: HttpTypes.StoreProductVariant): boolean => {
  // If we don't manage inventory, we can always add to cart
  if (!variant.manage_inventory) {
    return true
  }

  // If we allow back orders on the variant, we can add to cart
  if (variant.allow_backorder) {
    return true
  }

  // If there is inventory available, we can add to cart
  if (variant.manage_inventory && (variant.inventory_quantity || 0) > 0) {
    return true
  }

  // Otherwise, it's out of stock
  return false
}

const ProductInfo = ({ product, brand }: ProductInfoProps) => {
  // Check if product has any variant in stock
  const isInStock = (() => {
    if (!product.variants || product.variants.length === 0) {
      return false
    }

    // If at least one variant is in stock, the product is in stock
    return product.variants.some((variant) => isVariantInStock(variant))
  })()

  return (
    <div id="product-info">
      {/* Brand Details JSON Display */}
      {brand && brand.image_url && (
        <LocalizedClientLink
          href={`/brands/${brand.slug}`}
          className="flex items-center justify-start gap-2"
        >
          <p className="text-sm font-bold ">Brand :</p>
          <Image
            src={brand.image_url ?? ""}
            alt={brand.name}
            width={30}
            height={30}
          />
        </LocalizedClientLink>
      )}

      <div className="flex flex-col gap-y-3">
        <Heading
          level="h2"
          className="text-3xl  font-bold leading-10 text-ui-fg-base pr-5 font-urbanist"
          data-testid="product-title"
        >
          {product.title}
        </Heading>
        {/* Stock Status Indicator */}
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${
              isInStock ? "bg-green-500" : "bg-red-500"
            }`}
            aria-hidden="true"
          />
          <p
            className={`text-sm font-medium ${
              isInStock ? "text-green-700" : "text-red-700"
            }`}
            data-testid="product-stock-status"
          >
            {isInStock ? "In Stock" : "Out of Stock"}
          </p>
        </div>

        <p className="text-sm font-medium">
          Item No : {(product?.metadata?.item_no as string) ?? "N/A"}
        </p>
      </div>
    </div>
  )
}

export default ProductInfo
