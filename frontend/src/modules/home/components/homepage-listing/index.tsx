import { getCollectionByHandle } from "@lib/data/collections"
import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import ProductPreview from "@modules/products/components/product-preview"
import { Pagination } from "@modules/store/components/pagination"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

const PRODUCT_LIMIT = 12

type HomepageListingParams = {
  limit: number
  collection_id?: string[]
  category_id?: string[]
  id?: string[]
  order?: string
}

type HomepageListingProps = {
  sortBy?: SortOptions
  page: number
  countryCode: string
}

export default async function HomepageListing({
  sortBy,
  page,
  countryCode,
}: HomepageListingProps) {
  // Get the homepage collection by handle
  const homepageCollection = await getCollectionByHandle("homepage")

  // Verify the collection exists and has the correct title
  if (
    !homepageCollection ||
    homepageCollection.title?.toLowerCase() !== "homepage"
  ) {
    return null
  }

  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  // Build query parameters to filter by collection
  const queryParams: HomepageListingParams = {
    limit: PRODUCT_LIMIT,
    collection_id: [homepageCollection.id],
  }

  if (sortBy === "created_at") {
    queryParams["order"] = "created_at"
  }

  // Fetch products from the homepage collection
  let {
    response: { products, count },
  } = await listProducts({
    pageParam: page,
    queryParams,
    countryCode,
    regionId: region.id,
  })

  const totalPages = Math.ceil(count / PRODUCT_LIMIT)

  // If no products, return null
  if (products.length === 0) {
    return null
  }

  return (
    <>
      <ul
        className="grid grid-cols-2 w-full small:grid-cols-3 medium:grid-cols-4 gap-x-6 gap-y-8"
        data-testid="homepage-products-list"
      >
        {products.map((p) => {
          return (
            <li key={p.id}>
              <ProductPreview
                product={p}
                region={region}
                countryCode={countryCode}
              />
            </li>
          )
        })}
      </ul>
      {totalPages > 1 && (
        <Pagination
          data-testid="homepage-product-pagination"
          page={page}
          totalPages={totalPages}
        />
      )}
    </>
  )
}
