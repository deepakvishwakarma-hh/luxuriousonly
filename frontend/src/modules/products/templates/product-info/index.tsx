import { Heading } from "@medusajs/ui"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type ProductInfoProps = {
  product: HttpTypes.StoreProduct
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

const ProductInfo = ({ product }: ProductInfoProps) => {
  // Check if product has any variant in stock
  const isInStock = (() => {
    if (!product.variants || product.variants.length === 0) {
      return false
    }

    // If at least one variant is in stock, the product is in stock
    return product.variants.some((variant) => isVariantInStock(variant))
  })()

  const productBrandName = product.title.split(" ")[0] || "n/a"

  return (
    <div id="product-info">
      <div className="flex flex-col gap-y-3">
        {product.collection && (
          <LocalizedClientLink
            href={`/collections/${product.collection.handle}`}
            className="text-medium text-ui-fg-muted hover:text-ui-fg-subtle"
          >
            {product.collection.title}
          </LocalizedClientLink>
        )}
        <p className="text-sm font-medium text-ui-fg-muted uppercase tracking-wide">
          <b>Brand: </b> {productBrandName}
        </p>
        <Heading
          level="h2"
          className="text-2xl font-semibold leading-8 text-ui-fg-base pr-5"
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
      </div>
    </div>
  )
}

export default ProductInfo
