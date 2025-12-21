import { Metadata } from "next"
import { notFound } from "next/navigation"

import { getCategoryByHandle, listCategories } from "@lib/data/categories"
import { listRegions } from "@lib/data/regions"
import { getRegion } from "@lib/data/regions"
import { filterProducts } from "@lib/data/products"
import { StoreRegion } from "@medusajs/types"
import CategoryPage from "@modules/products/templates/category-page"

type Props = {
  params: Promise<{ category: string[]; countryCode: string }>
  searchParams: Promise<{
    brand?: string
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

export async function generateStaticParams() {
  const product_categories = await listCategories()

  if (!product_categories) {
    return []
  }

  const countryCodes = await listRegions().then((regions: StoreRegion[]) =>
    regions?.map((r) => r.countries?.map((c) => c.iso_2)).flat()
  )

  const categoryHandles = product_categories.map(
    (category: any) => category.handle
  )

  const staticParams = countryCodes
    ?.map((countryCode: string | undefined) =>
      categoryHandles.map((handle: any) => ({
        countryCode,
        category: [handle],
      }))
    )
    .flat()

  return staticParams
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  try {
    const productCategory = await getCategoryByHandle(params.category)

    const title = productCategory.name + " | Medusa Store"

    const description = productCategory.description ?? `${title} category.`

    return {
      title: `${title} | Medusa Store`,
      description,
      alternates: {
        canonical: `${params.category.join("/")}`,
      },
    }
  } catch (error) {
    notFound()
  }
}

export default async function Category(props: Props) {
  const searchParams = await props.searchParams
  const params = await props.params
  const { countryCode, category } = params

  const region = await getRegion(countryCode)

  if (!region) {
    notFound()
  }

  const productCategory = await getCategoryByHandle(category)

  if (!productCategory) {
    notFound()
  }

  // Get filters from search params
  const brand = searchParams.brand
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

  // Build parent categories array for breadcrumbs
  const parentCategories: Array<{ name: string; handle: string }> = []
  let currentParent = productCategory.parent_category
  while (currentParent) {
    parentCategories.unshift({
      name: currentParent.name,
      handle: currentParent.handle || "",
    })
    currentParent = (currentParent as any).parent_category
  }

  // Fetch initial data filtered by category
  const initialData = await filterProducts({
    countryCode,
    category_name: productCategory.name, // Filter by category name
    brand_slug: brand,
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
    <CategoryPage
      countryCode={countryCode}
      region={region}
      categoryName={productCategory.name}
      categoryDescription={productCategory.description || undefined}
      parentCategories={
        parentCategories.length > 0 ? parentCategories : undefined
      }
      categoryChildren={productCategory.category_children?.map((c) => ({
        id: c.id,
        name: c.name,
        handle: c.handle || "",
      }))}
      initialData={initialData}
    />
  )
}
