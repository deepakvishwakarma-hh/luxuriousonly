import { Metadata } from "next"
import { notFound } from "next/navigation"

import { getCategoryByHandle, listCategories } from "@lib/data/categories"
import { listRegions } from "@lib/data/regions"
import { getRegion } from "@lib/data/regions"
import { filterProducts } from "@lib/data/products"
import { getBaseURL } from "@lib/util/env"
import { websiteConfig } from "@lib/website.config"
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
  try {
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

    return staticParams || []
  } catch (error) {
    // During Docker build, backend may not be available
    // Return empty array to allow build to succeed
    // Pages will be generated dynamically at runtime
    console.warn("Failed to generate static params during build:", error)
    return []
  }
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const { countryCode, category } = params
  const region = await getRegion(countryCode)
  const companyName = websiteConfig.name || websiteConfig.displayName
  const baseURL = getBaseURL()

  try {
    const productCategory = await getCategoryByHandle(category)
    const categoryUrl = `${baseURL}/${countryCode}/categories/${category.join(
      "/"
    )}`

    const countryName =
      region?.countries?.find((c) => c.iso_2 === countryCode)?.display_name ||
      countryCode.toUpperCase()

    const title = `${productCategory.name} | ${companyName}`
    const description =
      productCategory.description ||
      `Shop ${productCategory.name} products at ${companyName}. Discover premium luxury ${productCategory.name} items delivered to ${countryName}.`

    const keywords: string[] = [
      productCategory.name,
      `${productCategory.name} products`,
      `${productCategory.name} category`,
      "luxury products",
      "premium goods",
      countryName,
    ]

    return {
      title,
      description: description.substring(0, 160),
      keywords: keywords.filter(Boolean),
      authors: [{ name: companyName }],
      creator: companyName,
      publisher: companyName,
      alternates: {
        canonical: categoryUrl,
      },
      openGraph: {
        type: "website",
        locale: "en_US",
        url: categoryUrl,
        siteName: companyName,
        title,
        description: description.substring(0, 160),
      },
      twitter: {
        card: "summary_large_image",
        title,
        description: description.substring(0, 160),
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-video-preview": -1,
          "max-image-preview": "large",
          "max-snippet": -1,
        },
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

  // Build structured data for SEO (JSON-LD)
  const baseURL = getBaseURL()
  const categoryUrl = `${baseURL}/${countryCode}/categories/${category.join(
    "/"
  )}`

  // Breadcrumb structured data
  const breadcrumbStructuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${baseURL}/${countryCode}`,
      },
      ...parentCategories.map((parent, index) => ({
        "@type": "ListItem",
        position: index + 2,
        name: parent.name,
        item: `${baseURL}/${countryCode}/categories/${parent.handle}`,
      })),
      {
        "@type": "ListItem",
        position: parentCategories.length + 2,
        name: productCategory.name,
        item: categoryUrl,
      },
    ],
  }

  // CollectionPage structured data
  const collectionPageStructuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${productCategory.name} Products`,
    description:
      productCategory.description ||
      `Shop ${productCategory.name} products at ${websiteConfig.name}`,
    url: categoryUrl,
    mainEntity: {
      "@type": "ItemList",
      name: `${productCategory.name} Products`,
      itemListElement:
        initialData.products?.slice(0, 10).map((product, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "Product",
            name: product.title,
            url: `${baseURL}/${countryCode}/products/${product.handle}`,
            ...(product.thumbnail && { image: product.thumbnail }),
          },
        })) || [],
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbStructuredData),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(collectionPageStructuredData),
        }}
      />
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
    </>
  )
}
