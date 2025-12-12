import { Text } from "@medusajs/ui"
import { listProducts } from "@lib/data/products"
import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "../thumbnail"
import PreviewPrice from "./price"
import AddToCartButton from "./add-to-cart-button"

export default async function ProductPreview({
  product,
  isFeatured,
  region,
  countryCode,
}: {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  region: HttpTypes.StoreRegion
  countryCode: string
}) {
  // const pricedProduct = await listProducts({
  //   regionId: region.id,
  //   queryParams: { id: [product.id!] },
  // }).then(({ response }) => response.products[0])

  // if (!pricedProduct) {
  //   return null
  // }

  const { cheapestPrice } = getProductPrice({
    product,
  })

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
        <Thumbnail
          thumbnail={product.thumbnail}
          images={product.images}
          size="full"
          isFeatured={isFeatured}
        />
        <div className="flex flex-col txt-compact-medium mt-4 justify-between px-4 pb-4">
          <p
            className="text-ui-fg-subtle text-center"
            data-testid="product-title"
          >
            {product.title}
          </p>
          <p className="text-ui-fg-subtle text-center font-bold">Gucci</p>
          <div className="flex items-center justify-center gap-x-2">
            {cheapestPrice && <PreviewPrice price={cheapestPrice} />}
          </div>
          <AddToCartButton product={product} countryCode={countryCode} />
        </div>
      </div>
    </LocalizedClientLink>
  )
}
