import React, { Suspense } from "react"

import ProductActions from "@modules/products/components/product-actions"
import ProductTabs from "@modules/products/components/product-tabs"
import RelatedProducts from "@modules/products/components/related-products"
import ProductInfo from "@modules/products/templates/product-info"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import { notFound } from "next/navigation"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { FaHome } from "react-icons/fa"

import ProductActionsWrapper from "./product-actions-wrapper"
import ProductImageCarousel from "@modules/products/components/image-gallery/product-image"
import ProductInfoActions from "@modules/products/components/product-info-actions"
import TrackProductView from "@modules/products/components/track-product-view"
import ProductReviews from "@modules/products/components/product-reviews"
import { Brand } from "@lib/data/brands"
import { ReviewsResponse } from "@lib/data/reviews"
import { ProductAvailabilityResponse } from "@lib/data/products"
import ProductOptions from "@modules/products/components/product-options"

type ProductTemplateProps = {
  productOptions: HttpTypes.StoreProduct[]
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
  images: HttpTypes.StoreProductImage[]
  brand: Brand | null
  reviewSummary: ReviewsResponse | null
  availability: ProductAvailabilityResponse | null
}

const ProductTemplate: React.FC<ProductTemplateProps> = ({
  productOptions,
  product,
  region,
  countryCode,
  images,
  brand,
  reviewSummary,
  availability,
}) => {
  if (!product || !product.id) {
    return notFound()
  }

  return (
    <>
      <TrackProductView
        product={{
          id: product.id,
          handle: product.handle,
          thumbnail: product.thumbnail,
          title: product.title,
        }}  
      />
      <div className="content-container-- px-5 md:px-5">
        {/* Breadcrumb */}
        <nav
          className="flex items-center gap-2 py-4 text-sm"
          aria-label="Breadcrumb"
        >
          <LocalizedClientLink
            href="/"
            className="text-gray-900 hover:text-gray-700 transition-colors"
            aria-label="Home"
          >
            <FaHome className="w-4 h-4" />
          </LocalizedClientLink>
          
          {/* Category breadcrumbs */}
          {product.categories && product.categories.length > 0 && (
            <>
              {product.categories.map((category, index) => (
                <React.Fragment key={category.id}>
                  <span className="text-gray-400" aria-hidden="true">/</span>
                  <LocalizedClientLink
                    href={`/categories/${category.handle}`}
                    className="text-blue-600 hover:text-blue-800 hover:underline transition-colors font-medium hidden md:inline-block"
                  >
                    {category.name}
                  </LocalizedClientLink>
                </React.Fragment>
              ))}
            </>
          )}
          
          <span className="text-gray-400" aria-hidden="true">/</span>
          <span className="text-gray-900 font-semibold hidden md:inline-block" title={product.title}>
            {product.title}
          </span>
          {/* Mobile: Show truncated version */}
          <span className="text-gray-900 font-semibold md:hidden truncate max-w-[200px]" title={product.title}>
            {product.title}
          </span>
        </nav>
        <div className="flex flex-col md:flex-row gap-5">
          {/* left side  */}
          <div className="w-full md:w-3/5 md:self-start md:sticky md:top-24 md:z-10">
            <ProductImageCarousel
              images={(images ?? []).map((image) => image.url)}
              productTitle={product.title}
              productHandle={product.handle}
              ean={product.metadata?.ean as string | undefined}
            />
          </div>
          {/* right side  */}
          <div className="w-full md:w-2/5 ">
            <ProductInfo
              product={product}
              brand={brand}
              reviewSummary={reviewSummary}
              availability={availability}
              region={region}
              countryCode={countryCode}
            />
  
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

             {/* @ts-ignore */}
            <ProductOptions options={productOptions} activeProductId={product.id} />

            <ProductTabs
              product={product}
              countryCode={countryCode}
              region={region}
              brand={brand}
              visibleFields={[
                "brand",
                "model",
                "color_code",
                "gender",
                "rim_style",
                "shape",
                "frame_material",
                "size",
                "lens_width",
                "lens_bridge",
                "arm_length",
                "department",
              ]}
            />
            <ProductInfoActions productId={product.id} product={product} />
          </div>
        </div>
      </div>
      <div
        className="px-5 md:px-5"
        data-testid="product-reviews-container"
      >
        <ProductReviews productId={product.id} />
      </div>
      <div
        className="px-5 md:px-5"
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
