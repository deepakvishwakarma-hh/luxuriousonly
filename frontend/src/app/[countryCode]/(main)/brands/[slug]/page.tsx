import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getBrandProductsBySlug } from "@lib/data/brands"
import { getRegion } from "@lib/data/regions"
import { filterProducts } from "@lib/data/products"
import BrandPage from "@modules/products/templates/brand-page"

type Props = {
  params: Promise<{ countryCode: string; slug: string }>
  searchParams: Promise<{
    category?: string
    rim_style?: string | string[]
    gender?: string | string[]
    shapes?: string | string[]
    size?: string | string[]
    min_price?: string
    max_price?: string
    order?: string
    order_direction?: string
    page?: string
  }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const brandData = await getBrandProductsBySlug(params.slug)

  if (!brandData?.brand) {
    return {
      title: "Brand not found",
    }
  }

  const brand = brandData.brand
  const title = brand.meta_title || `${brand.name} | Medusa Store`
  const description = brand.meta_desc || brand.description || `${brand.name} products`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: brand.image_url ? [brand.image_url] : [],
    },
  }
}

export default async function BrandProductsPage(props: Props) {
  const params = await props.params
  const searchParams = await props.searchParams
  const { countryCode, slug } = params

  const region = await getRegion(countryCode)

  if (!region) {
    notFound()
  }

  // Get brand data
  const brandData = await getBrandProductsBySlug(slug)

  if (!brandData?.brand) {
    notFound()
  }

  const { brand } = brandData

  // Get filters from search params
  const category = searchParams.category
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
  const minPrice = searchParams.min_price ? parseFloat(searchParams.min_price) : undefined
  const maxPrice = searchParams.max_price ? parseFloat(searchParams.max_price) : undefined
  const order = (searchParams.order as any) || "created_at"
  const orderDirection = (searchParams.order_direction as any) || "desc"
  const page = parseInt(searchParams.page || "1")
  const limit = 20
  const offset = (page - 1) * limit

  // Fetch initial data filtered by brand
  const initialData = await filterProducts({
    countryCode,
    brand_slug: slug, // Filter by brand slug
    category_name: category,
    rim_style: rimStyle,
    gender,
    shapes,
    size,
    min_price: minPrice,
    max_price: maxPrice,
    order,
    order_direction: orderDirection,
    limit,
    offset,
    include_filter_options: true,
  })

  return (
    <BrandPage
      countryCode={countryCode}
      region={region}
      brandSlug={slug}
      brandName={brand.name}
      brandImage={brand.image_url || undefined}
      brandDescription={brand.description || undefined}
      initialData={initialData}
    />
  )
}
