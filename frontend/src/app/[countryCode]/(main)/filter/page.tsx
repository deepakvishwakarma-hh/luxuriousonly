import { Metadata } from "next"
import { getRegion } from "@lib/data/regions"
import FilterPage from "@modules/products/templates/filter-page"
import { filterProducts } from "@lib/data/products"

export const metadata: Metadata = {
  title: "Filter Products",
  description: "Filter and search products by various attributes.",
}

type Props = {
  params: Promise<{ countryCode: string }>
  searchParams: Promise<{
    search?: string
    brand?: string | string[]
    category?: string | string[]
    rim_style?: string | string[]
    gender?: string | string[]
    shapes?: string | string[]
    size?: string | string[]
    frame_material?: string | string[]
    shape_filter?: string | string[]
    shape?: string | string[]
    min_price?: string
    max_price?: string
    order?: string
    order_direction?: string
    page?: string
  }>
}

export default async function FilterProductsPage(props: Props) {
  const params = await props.params
  const searchParams = await props.searchParams

  const region = await getRegion(params.countryCode)

  if (!region) {
    return <div>Region not found</div>
  }

  // Get filters from search params
  const search = searchParams.search
  const brand = searchParams.brand
    ? Array.isArray(searchParams.brand)
      ? searchParams.brand
      : [searchParams.brand]
    : undefined
  const category = searchParams.category
    ? Array.isArray(searchParams.category)
      ? searchParams.category
      : [searchParams.category]
    : undefined
  const rimStyle = searchParams.rim_style
    ? Array.isArray(searchParams.rim_style)
      ? searchParams.rim_style
      : [searchParams.rim_style]
    : undefined
  const gender = searchParams.gender
    ? Array.isArray(searchParams.gender)
      ? searchParams.gender
      : [searchParams.gender]
    : undefined
  const shapes = searchParams.shapes
    ? Array.isArray(searchParams.shapes)
      ? searchParams.shapes
      : [searchParams.shapes]
    : undefined
  const size = searchParams.size
    ? Array.isArray(searchParams.size)
      ? searchParams.size
      : [searchParams.size]
    : undefined
  const frameMaterial = searchParams.frame_material
    ? Array.isArray(searchParams.frame_material)
      ? searchParams.frame_material
      : [searchParams.frame_material]
    : undefined
  const shapeFilter = searchParams.shape_filter
    ? Array.isArray(searchParams.shape_filter)
      ? searchParams.shape_filter
      : [searchParams.shape_filter]
    : undefined
  const shape = searchParams.shape
    ? Array.isArray(searchParams.shape)
      ? searchParams.shape
      : [searchParams.shape]
    : undefined
  const minPrice = searchParams.min_price
    ? parseFloat(searchParams.min_price)
    : undefined
  const maxPrice = searchParams.max_price
    ? parseFloat(searchParams.max_price)
    : undefined
  const order = (searchParams.order as any) || "created_at"
  const orderDirection = (searchParams.order_direction as any) || "desc"
  const page = parseInt(searchParams.page || "1")
  const limit = 20
  const offset = (page - 1) * limit

  // Fetch initial data
  const initialData = await filterProducts({
    countryCode: params.countryCode,
    search,
    brand_slug: brand,
    category_name: category,
    rim_style: rimStyle,
    gender,
    shapes,
    size,
    frame_material: frameMaterial,
    shape_filter: shapeFilter,
    shape,
    min_price: minPrice,
    max_price: maxPrice,
    order,
    order_direction: orderDirection,
    limit,
    offset,
    include_filter_options: true,
  })

  return (
    <FilterPage
      countryCode={params.countryCode}
      region={region}
      initialData={initialData}
    />
  )
}
