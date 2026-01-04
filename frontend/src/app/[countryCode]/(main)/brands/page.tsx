import { Metadata } from "next"
import Link from "next/link"
import { listBrands } from "@lib/data/brands"
import { getRegion } from "@lib/data/regions"
import { getBaseURL } from "@lib/util/env"
import { websiteConfig } from "@lib/website.config"

type Props = {
  params: Promise<{ countryCode: string }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const { countryCode } = params
  const region = await getRegion(countryCode)

  const countryName =
    region?.countries?.find((c) => c.iso_2 === countryCode)?.display_name ||
    countryCode.toUpperCase()

  const siteName = websiteConfig.shortName
  const companyName = websiteConfig.name || websiteConfig.displayName
  const baseURL = getBaseURL()
  const brandsUrl = `${baseURL}/${countryCode}/brands`

  const title = `Brands | ${companyName}`
  const description = `Discover all premium luxury brands at ${siteName}. Browse our curated collection of designer brands and shop exclusive products delivered to ${countryName}.`

  const keywords: string[] = [
    "brands",
    "designer brands",
    "luxury brands",
    "premium brands",
    "brand directory",
    "luxury products",
    "premium goods",
    countryName,
  ]

  return {
    title,
    description: description.substring(0, 160),
    keywords: keywords.filter(Boolean),
    authors: [{ name: siteName }],
    creator: siteName,
    publisher: siteName,
    alternates: {
      canonical: brandsUrl,
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: brandsUrl,
      siteName,
      title,
      description: description.substring(0, 160),
      images: [
        {
          url: `${baseURL}/opengraph-image.jpg`,
          width: 1200,
          height: 630,
          alt: `${title} - ${siteName}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: description.substring(0, 160),
      images: [`${baseURL}/twitter-image.jpg`],
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

export default async function BrandsPage(props: Props) {
  const params = await props.params
  const { countryCode } = params
  const { brands, count } = await listBrands()

  // Build structured data for SEO (JSON-LD)
  const baseURL = getBaseURL()
  const brandsUrl = `${baseURL}/${countryCode}/brands`

  // ItemList structured data for brands collection
  const itemListStructuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Brands",
    description: `Browse all premium luxury brands at ${websiteConfig.shortName}`,
    url: brandsUrl,
    numberOfItems: count,
    itemListElement:
      brands.slice(0, 20).map((brand, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Brand",
          name: brand.name,
          url: `${baseURL}/${countryCode}/brands/${brand.slug || brand.id}`,
          ...(brand.description && { description: brand.description }),
          ...(brand.image_url && { logo: brand.image_url }),
        },
      })) || [],
  }

  // CollectionPage structured data
  const collectionPageStructuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Brands",
    description: `Discover all premium luxury brands at ${websiteConfig.shortName}`,
    url: brandsUrl,
    mainEntity: itemListStructuredData,
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
        item: brandsUrl,
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(itemListStructuredData),
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
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Brands</h1>

        {/* Brands Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {brands.map((brand) => (
            <Link
              key={brand.id}
              href={`/${countryCode}/brands/${brand.slug || brand.id}`}
              className="bg-white border rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              {brand.image_url && (
                <img
                  src={brand.image_url}
                  alt={brand.name}
                  className="w-full h-48 object-contain mb-4 rounded"
                />
              )}
              <h3 className="text-xl font-semibold mb-2">{brand.name}</h3>
              {brand.description && (
                <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                  {brand.description}
                </p>
              )}
              {brand.products && brand.products.length > 0 && (
                <p className="text-sm text-gray-500">
                  {brand.products.length}{" "}
                  {brand.products.length === 1 ? "product" : "products"}
                </p>
              )}
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}
