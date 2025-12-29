import React, { Suspense } from "react"

import ProductActions from "@modules/products/components/product-actions"
import ProductTabs from "@modules/products/components/product-tabs"
import RelatedProducts from "@modules/products/components/related-products"
import ProductInfo from "@modules/products/templates/product-info"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import { notFound } from "next/navigation"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

import ProductActionsWrapper from "./product-actions-wrapper"
import ProductImageCarousel from "@modules/products/components/image-gallery/product-image"
import ProductInfoActions from "@modules/products/components/product-info-actions"
import TrackProductView from "@modules/products/components/track-product-view"
import { Brand } from "@lib/data/brands"

type ProductTemplateProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
  images: HttpTypes.StoreProductImage[]
  brand: Brand | null
}

const ProductTemplate: React.FC<ProductTemplateProps> = ({
  product,
  region,
  countryCode,
  images,
  brand,
}) => {
  if (!product || !product.id) {
    return notFound()
  }

  return (
    <>
      <TrackProductView productId={product.id} />
      <div className="content-container">
        {/* Breadcrumb */}
        <nav
          className="flex items-center gap-2 py-4 text-sm text-ui-fg-subtle"
          aria-label="Breadcrumb"
        >
          <LocalizedClientLink
            href="/"
            className="hover:text-ui-fg-base transition-colors"
          >
            Home
          </LocalizedClientLink>
          {product.collection && (
            <>
              <span>/</span>
              <LocalizedClientLink
                href={`/collections/${product.collection.handle}`}
                className="hover:text-ui-fg-base transition-colors"
              >
                {product.collection.title}
              </LocalizedClientLink>
            </>
          )}
          <span>/</span>
          <span className="text-ui-fg-base">{product.title}</span>
        </nav>
        <div className="flex flex-col md:flex-row gap-10">
          {/* left side  */}
          <div className="w-full md:w-1/2 ">
            <ProductImageCarousel
              images={(images ?? []).map((image) => image.url)}
              productTitle={product.title}
            />
          </div>
          {/* right side  */}
          <div className="w-full md:w-1/2 ">
            <ProductInfo product={product} brand={brand} />
            <Suspense
              fallback={
                <ProductActions
                  disabled={true}
                  product={product}
                  region={region}
                />
              }
            >
              <ProductActionsWrapper id={product.id} region={region} />
            </Suspense>

            <ProductTabs
              product={product}
              countryCode={countryCode}
              region={region}
            />
            <ProductInfoActions />
          </div>
        </div>
      </div>
      <div
        className="content-container "
        data-testid="related-products-container"
      >
        <Suspense fallback={<SkeletonRelatedProducts />}>
          <RelatedProducts product={product} countryCode={countryCode} />
        </Suspense>
      </div>
    </>
  )
}

export default ProductTemplate
