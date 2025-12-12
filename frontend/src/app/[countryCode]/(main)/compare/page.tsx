import { notFound } from "next/navigation"
import { getRegion } from "@lib/data/regions"
import { listProducts } from "@lib/data/products"
import { getCompareProductIds } from "@lib/data/compare"
import CompareProducts from "@modules/products/components/compare-products"

type Props = {
  params: Promise<{ countryCode: string }>
}

export default async function ComparePage(props: Props) {
  const params = await props.params
  const { countryCode } = params

  const region = await getRegion(countryCode)

  if (!region) {
    notFound()
  }

  // Get product IDs from cookies
  const productIds = await getCompareProductIds()

  // If no products to compare, show empty state
  if (!productIds || productIds.length === 0) {
    return (
      <div className="content-container py-16">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <h1 className="text-3xl font-bold mb-4">Compare Products</h1>
          <p className="text-ui-fg-subtle text-lg">
            No products selected for comparison.
          </p>
          <p className="text-ui-fg-muted mt-2">
            Click the compare button on products to add them here.
          </p>
        </div>
      </div>
    )
  }

  // Fetch products by IDs
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

  // Filter to only include products that were found (in case some IDs are invalid)
  const validProducts = products.filter((product) =>
    productIds.includes(product.id)
  )

  return (
    <div className="content-container py-16">
      <h1 className="text-3xl font-bold mb-8">Compare Products</h1>
      <CompareProducts products={validProducts} />
    </div>
  )
}

