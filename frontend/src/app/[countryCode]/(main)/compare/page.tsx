import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getRegion } from "@lib/data/regions"
import { listProducts } from "@lib/data/products"
import { getCompareProductIds } from "@lib/data/compare"
import { getBaseURL } from "@lib/util/env"
import { websiteConfig } from "@lib/website.config"
import CompareProducts from "@modules/products/components/compare-products"
import { Heading } from "@medusajs/ui"
import InteractiveLink from "@modules/common/components/interactive-link"
import WoodMartIcon from "@modules/common/icons/woodmart-icon"
import Breadcrumbs from "@modules/common/components/breadcrumbs"


type Props = {
  params: Promise<{ countryCode: string }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const { countryCode } = params
  const companyName = websiteConfig.name || websiteConfig.displayName
  const baseURL = getBaseURL()
  const compareUrl = `${baseURL}/${countryCode}/compare`

  const title = `Compare Products | ${companyName}`
  const description = `Compare products side-by-side at ${companyName}. Evaluate features, prices, and specifications to make the best choice.`

  return {
    title,
    description,
    robots: {
      index: false,
      follow: true,
    },
    alternates: {
      canonical: compareUrl,
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: compareUrl,
      siteName: companyName,
      title,
      description,
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  }
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
      <div>
        <div className="w-full bg-black py-8 mb-8">
          <div className="content-container text-center text-white">
            <h1 className="text-3xl font-bold">Comp</h1>
            <div className="mt-1">
              <Breadcrumbs
                items={[
                  { label: "Home", href: `/${countryCode}` },
                  { label: "Compare" },
                ]}
              />
            </div>
          </div>
        </div>

        <div className="content-container py-16">
          <div className="py-48 px-2 flex flex-col justify-center items-center min-h-[500px]">
            <div className="flex flex-col items-center gap-y-6 max-w-[500px] text-center">
              <div className="bg-gray-100 rounded-full p-6 mb-2">
                <WoodMartIcon iconContent="f128" size={48} className="text-gray-400" />
              </div>
              <p className="text-base-regular text-ui-fg-subtle mt-2">
                No products selected for comparison yet. Start comparing products by clicking the compare button on any product card.
              </p>
              <div className="mt-6">
                <InteractiveLink href={`/${countryCode}`}>
                  Browse products
                </InteractiveLink>
              </div>
            </div>
          </div>
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
        "thumbnail,*variants.calculated_price,+variants.inventory_quantity,*variants.images,+metadata,+tags",
    },
  })

  const products = response.products

  // Filter to only include products that were found (in case some IDs are invalid)
  const validProducts = products.filter((product) =>
    productIds.includes(product.id)
  )

  return (
    <div>
      <div className="w-full bg-black py-8 mb-8">
        <div className="content-container text-center text-white">
          <h1 className="text-3xl font-bold">Compare</h1>
          <div className="mt-1">
            <Breadcrumbs
              items={[
                { label: "Home", href: `/${countryCode}` },
                { label: "Compare" },
              ]}
            />
          </div>
        </div>
      </div>

      <div className="content-container py-16">
        <CompareProducts products={validProducts} countryCode={countryCode} />
      </div>
    </div>
  )
}

