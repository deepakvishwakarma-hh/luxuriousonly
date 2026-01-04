import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getBrandProductsBySlug } from "@lib/data/brands"
import { getRegion } from "@lib/data/regions"
import { filterProducts } from "@lib/data/products"
import { getBaseURL } from "@lib/util/env"
import { websiteConfig } from "@lib/website.config"
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
  const { countryCode, slug } = params
  const region = await getRegion(countryCode)
  const brandData = await getBrandProductsBySlug(slug)

  if (!brandData?.brand) {
    return {
      title: "Brand not found",
    }
  }

  const brand = brandData.brand
  const baseURL = getBaseURL()
  const brandUrl = `${baseURL}/${countryCode}/brands/${slug}`
  const siteName = websiteConfig.shortName
  const companyName = websiteConfig.name || websiteConfig.displayName

  const countryName =
    region?.countries?.find((c) => c.iso_2 === countryCode)?.display_name ||
    countryCode.toUpperCase()

  // Build title and description
  // Use meta_title if available, but ensure it uses company name instead of "Medusa Store"
  const title = brand.meta_title
    ? brand.meta_title.replace(/Medusa Store/gi, companyName)
    : `${brand.name} | ${companyName}`
  const description =
    brand.meta_desc ||
    brand.description ||
    `Shop ${brand.name} products at ${siteName}. Discover premium luxury ${brand.name} items delivered to ${countryName}.`

  // Build keywords
  const keywords: string[] = [
    brand.name,
    `${brand.name} products`,
    `${brand.name} collection`,
    "luxury products",
    "premium goods",
    "designer brands",
    countryName,
    ...(brand.description
      ? brand.description
          .split(" ")
          .filter((word) => word.length > 4)
          .slice(0, 5)
      : []),
  ]

  // Build Open Graph images
  const ogImages = brand.image_url
    ? [
        {
          url: brand.image_url,
          width: 1200,
          height: 630,
          alt: `${brand.name} - ${siteName}`,
        },
      ]
    : []

  return {
    title,
    description: description.substring(0, 160),
    keywords: keywords.filter(Boolean),
    authors: [{ name: siteName }],
    creator: siteName,
    publisher: siteName,
    alternates: {
      canonical: brandUrl,
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: brandUrl,
      siteName,
      title,
      description: description.substring(0, 160),
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: description.substring(0, 160),
      images: ogImages.length > 0 ? [ogImages[0].url] : [],
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

  // Build structured data for SEO (JSON-LD)
  const baseURL = getBaseURL()
  const brandUrl = `${baseURL}/${countryCode}/brands/${slug}`

  // Brand structured data
  const brandStructuredData: any = {
    "@context": "https://schema.org",
    "@type": "Brand",
    name: brand.name,
    url: brandUrl,
    ...(brand.description && { description: brand.description }),
    ...(brand.image_url && {
      logo: brand.image_url,
      image: brand.image_url,
    }),
  }

  // CollectionPage structured data (since this is a collection of products)
  const collectionPageStructuredData: any = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${brand.name} Products`,
    description:
      brand.description ||
      `Shop ${brand.name} products at ${websiteConfig.shortName}`,
    url: brandUrl,
    ...(brand.image_url && { image: brand.image_url }),
    mainEntity: {
      "@type": "ItemList",
      name: `${brand.name} Products`,
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
      {
        "@type": "ListItem",
        position: 2,
        name: "Brands",
        item: `${baseURL}/${countryCode}/brands`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: brand.name,
        item: brandUrl,
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(brandStructuredData),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(collectionPageStructuredData),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbStructuredData),
        }}
      />
      <BrandPage
        countryCode={countryCode}
        region={region}
        brandSlug={slug}
        brandName={brand.name}
        brandImage={brand.image_url || undefined}
        brandDescription={brand.description || undefined}
        initialData={initialData}
      />
    </>
  )
}
