import { Metadata } from "next"
import { notFound } from "next/navigation"
import { listProducts, getProductAvailability } from "@lib/data/products"
import { getRegion, listRegions } from "@lib/data/regions"
import { getBrandsByProductId } from "@lib/data/brands"
import { getProductReviews } from "@lib/data/reviews"
import ProductTemplate from "@modules/products/templates"
import { HttpTypes } from "@medusajs/types"
import { getBaseURL } from "@lib/util/env"
import { getProductPrice } from "@lib/util/get-product-price"
import { websiteConfig } from "@lib/website.config"

type Props = {
  params: Promise<{ countryCode: string; handle: string }>
  searchParams: Promise<{ v_id?: string }>
}

export async function generateStaticParams() {
  try {
    const countryCodes = await listRegions().then((regions) =>
      regions?.map((r) => r.countries?.map((c) => c.iso_2)).flat()
    )

    if (!countryCodes) {
      return []
    }

    const promises = countryCodes.map(async (country) => {
      const { response } = await listProducts({
        countryCode: country,
        queryParams: { limit: 100, fields: "handle" },
      })

      return {
        country,
        products: response.products,
      }
    })

    const countryProducts = await Promise.all(promises)

    return countryProducts
      .flatMap((countryData) =>
        countryData.products.map((product) => ({
          countryCode: countryData.country,
          handle: product.handle,
        }))
      )
      .filter((param) => param.handle)
  } catch (error) {
    console.error(
      `Failed to generate static paths for product pages: ${
        error instanceof Error ? error.message : "Unknown error"
      }.`
    )
    return []
  }
}

function getImagesForVariant(
  product: HttpTypes.StoreProduct,
  selectedVariantId?: string
) {
  if (!selectedVariantId || !product.variants) {
    return product?.images ?? []
  }

  const variant = product.variants!.find((v) => v.id === selectedVariantId)
  if (!variant || !variant.images?.length) {
    return product?.images ?? []
  }

  const imageIdsMap = new Map(variant.images!.map((i) => [i.id, true]))
  return product?.images!.filter((i) => imageIdsMap.has(i.id)) ?? []
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const { handle, countryCode } = params
  const region = await getRegion(countryCode)

  if (!region) {
    notFound()
  }

  const product = await listProducts({
    countryCode,
    queryParams: { handle },
  }).then(({ response }) => response.products[0])

  if (!product) {
    notFound()
  }

  const baseURL = getBaseURL()
  const productUrl = `${baseURL}/${countryCode}/products/${handle}`

  // Get product price for metadata
  const { cheapestPrice } = getProductPrice({ product })
  const price = cheapestPrice?.calculated_price_number
    ? `${cheapestPrice.calculated_price_number / 100} ${
        cheapestPrice.currency_code
      }`
    : undefined

  // Build description from product data
  const description = product.description
    ? product.description.substring(0, 160).replace(/\n/g, " ")
    : product.subtitle
    ? `${product.subtitle} - ${product.title}`
    : `Shop ${product.title} at ${websiteConfig.shortName}. Premium luxury products with free shipping.`

  // Build keywords from product data
  const keywords: string[] = [
    product.title,
    ...(product.subtitle ? [product.subtitle] : []),
    ...(product.categories?.map((c) => c.name) || []),
    ...(product.tags?.map((t) => t.value) || []),
    "luxury products",
    "premium goods",
    countryCode.toUpperCase(),
  ]

  // Get first product image for Open Graph (prioritize first image for better SEO)
  const firstImage = product.images && product.images.length > 0 
    ? product.images[0] 
    : null
  
  const ogImages = firstImage
    ? [
        {
          url: firstImage.url,
          width: 1200,
          height: 1200,
          alt: product.title,
        },
      ]
    : product.thumbnail
    ? [
        {
          url: product.thumbnail,
          width: 1200,
          height: 1200,
          alt: product.title,
        },
      ]
    : []

  const siteName = websiteConfig.shortName
  const companyName = websiteConfig.name || websiteConfig.displayName
  const title = `${product.title}${
    product.subtitle ? ` - ${product.subtitle}` : ""
  } | ${companyName}`

  return {
    title,
    description,
    keywords: keywords.filter(Boolean),
    authors: [{ name: siteName }],
    creator: siteName,
    publisher: siteName,
    alternates: {
      canonical: productUrl,
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: productUrl,
      siteName,
      title,
      description,
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
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
    other: {
      ...(price && { "product:price:amount": price }),
      ...(product.thumbnail && { "og:image:secure_url": product.thumbnail }),
    },
  }
}

export default async function ProductPage(props: Props) {
  const params = await props.params
  const region = await getRegion(params.countryCode)
  const searchParams = await props.searchParams

  const selectedVariantId = searchParams.v_id

  if (!region) {
    notFound()
  }

  const pricedProduct = await listProducts({
    countryCode: params.countryCode,
    queryParams: { handle: params.handle },
  }).then(({ response }) => response.products[0])

  const images = getImagesForVariant(pricedProduct, selectedVariantId)

  if (!pricedProduct) {
    notFound()
  }

  // Fetch brands, reviews, and availability optimistically (in parallel with product)
  const [brand, reviewSummary, availability] = await Promise.all([
    getBrandsByProductId(pricedProduct.id),
    getProductReviews(pricedProduct.id, { limit: 1, offset: 0 }).catch(
      () => null
    ),
    getProductAvailability({
      handle: params.handle,
      countryCode: params.countryCode,
    }).catch(() => null),
  ])

  // Get product price for structured data
  const { cheapestPrice } = getProductPrice({ product: pricedProduct })

  // Build structured data for SEO (JSON-LD)
  const baseURL = getBaseURL()
  const productUrl = `${baseURL}/${params.countryCode}/products/${params.handle}`

  // Build structured data for SEO (JSON-LD) - remove undefined fields
  const productStructuredData: any = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: pricedProduct.title,
    description:
      pricedProduct.description ||
      pricedProduct.subtitle ||
      pricedProduct.title,
    image:
      pricedProduct.images?.map((img) => img.url) ||
      (pricedProduct.thumbnail ? [pricedProduct.thumbnail] : []),
  }

  // Add optional fields only if they exist
  if (pricedProduct.variants?.[0]?.sku) {
    productStructuredData.sku = pricedProduct.variants[0].sku
    productStructuredData.mpn = pricedProduct.variants[0].sku
  }

  if (brand) {
    productStructuredData.brand = {
      "@type": "Brand",
      name: brand.name,
    }
  }

  if (cheapestPrice) {
    productStructuredData.offers = {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: cheapestPrice.currency_code,
      price: (cheapestPrice.calculated_price_number / 100).toString(),
      priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      availability: pricedProduct.variants?.some(
        (v) => v.inventory_quantity && v.inventory_quantity > 0
      )
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: websiteConfig.shortName,
      },
    }
  }

  if (pricedProduct.categories?.[0]?.name) {
    productStructuredData.category = pricedProduct.categories[0].name
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
        item: `${baseURL}/${params.countryCode}`,
      },
      ...(pricedProduct.categories?.map((category, index) => ({
        "@type": "ListItem",
        position: index + 2,
        name: category.name,
        item: `${baseURL}/${params.countryCode}/categories/${category.handle}`,
      })) || []),
      {
        "@type": "ListItem",
        position: (pricedProduct.categories?.length || 0) + 2,
        name: pricedProduct.title,
        item: productUrl,
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productStructuredData),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbStructuredData),
        }}
      />
      {/* {JSON.stringify(availability)} */}
      <ProductTemplate
        product={pricedProduct}
        region={region}
        countryCode={params.countryCode}
        images={images ?? []}
        brand={brand}
        reviewSummary={reviewSummary}
        availability={availability}
      />
    </>
  )
}
