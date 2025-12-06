import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getBrandProductsBySlug } from "@lib/data/brands"
import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import ProductPreview from "@modules/products/components/product-preview"

type Props = {
  params: Promise<{ countryCode: string; slug: string }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const brandData = await getBrandProductsBySlug(params.slug)

  if (!brandData?.brand) {
    return {
      title: "Brand not found",
    }
  }

  const title = `${brandData.brand.name} | Medusa Store`
  const description =
    brandData.brand.description || `${brandData.brand.name} products`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: brandData.brand.image_url ? [brandData.brand.image_url] : [],
    },
  }
}

export default async function BrandProductsPage(props: Props) {
  const params = await props.params
  const { countryCode, slug } = params

  const region = await getRegion(countryCode)

  if (!region) {
    notFound()
  }

  // Get brand and its product IDs
  const brandData = await getBrandProductsBySlug(slug)

  if (!brandData?.brand) {
    notFound()
  }

  const { brand, products: brandProducts } = brandData

  // If no products linked, show empty state
  if (!brandProducts || brandProducts.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          {brand.image_url && (
            <img
              src={brand.image_url}
              alt={brand.name}
              className="w-32 h-32 object-contain mb-4"
            />
          )}
          <h1 className="text-3xl font-bold mb-2">{brand.name}</h1>
          {brand.description && (
            <p className="text-gray-600">{brand.description}</p>
          )}
        </div>
        <div className="text-center py-12">
          <p className="text-gray-500">No products available for this brand.</p>
        </div>
      </div>
    )
  }

  // Get product IDs from brand products
  const productIds = brandProducts.map((p) => p.id)

  // Fetch full product details with pricing
  const { response } = await listProducts({
    countryCode,
    queryParams: {
      id: productIds,
      limit: 100,
      fields:
        "*variants.calculated_price,+variants.inventory_quantity,*variants.images,+metadata,+tags,",
    },
  })

  const products = response.products

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Brand Header */}
      <div className="mb-8 pb-8 border-b">
        <div className="flex items-start gap-6">
          {brand.image_url && (
            <img
              src={brand.image_url}
              alt={brand.name}
              className="w-32 h-32 object-contain rounded-lg border"
            />
          )}
          <div>
            <h1 className="text-3xl font-bold mb-2">{brand.name}</h1>
            {brand.description && (
              <p className="text-gray-600 mb-4">{brand.description}</p>
            )}
            <p className="text-sm text-gray-500">
              {products.length} {products.length === 1 ? "product" : "products"}
            </p>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {products.length > 0 ? (
        <ul
          className="grid grid-cols-2 w-full small:grid-cols-3 medium:grid-cols-4 gap-x-6 gap-y-8"
          data-testid="brand-products-list"
        >
          {products.map((product) => (
            <li key={product.id}>
              <ProductPreview product={product} region={region} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">No products available for this brand.</p>
        </div>
      )}

      {/* JSON Data (for debugging) */}
      <div className="mt-12 bg-gray-100 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">
          Brand & Products Data (JSON)
        </h2>
        <pre className="bg-white p-4 rounded border overflow-auto text-sm max-h-96">
          {JSON.stringify({ brand, products }, null, 2)}
        </pre>
      </div>
    </div>
  )
}
