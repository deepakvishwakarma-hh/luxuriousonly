import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getRegion } from "@lib/data/regions"
import { listProducts } from "@lib/data/products"
import { getAllLikedProductIds } from "@lib/data/liked"
import { getBaseURL } from "@lib/util/env"
import { websiteConfig } from "@lib/website.config"
import PaginatedProducts from "@modules/store/templates/paginated-products"
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
  const likedUrl = `${baseURL}/${countryCode}/liked`

  const title = `Liked Products | ${companyName}`
  const description = `View your liked products and wishlist at ${companyName}. Save your favorite items for later.`

  return {
    title,
    description,
    robots: {
      index: false,
      follow: true,
    },
    alternates: {
      canonical: likedUrl,
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: likedUrl,
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

export default async function LikedPage(props: Props) {
  const params = await props.params
  const { countryCode } = params

  const region = await getRegion(countryCode)

  if (!region) {
    notFound()
  }

  // Get product IDs from API (if logged in) or cookies (if not logged in)
  const productIds = await getAllLikedProductIds()

  // If no products liked, show empty state
  if (!productIds || productIds.length === 0) {
    return (
      <div>
        <div className="w-full bg-black py-8 mb-8">
          <div className="content-container text-center text-white">
            <h1 className="text-3xl font-bold">Liked Products</h1>
            <div className="mt-1">
              <Breadcrumbs
                items={[
                  { label: "Home", href: `/${countryCode}` },
                  { label: "Liked Products" },
                ]}
              />
            </div>
          </div>
        </div>

        <div className="content-container py-16">
          <div className="py-48 px-2 flex flex-col justify-center items-center min-h-[500px]">
            <div className="flex flex-col items-center gap-y-6 max-w-[500px] text-center">
              <div className="bg-gray-100 rounded-full p-6 mb-2">
                <WoodMartIcon
                  iconContent="f106"
                  size={48}
                  className="text-gray-400"
                />
              </div>
              <Heading level="h1" className="text-3xl-regular font-bold">
                Liked Products
              </Heading>
              <p className="text-base-regular text-ui-fg-subtle mt-2">
                You haven&apos;t liked any products yet. Start building your
                wishlist by clicking the heart icon on any product you love.
              </p>
              <div className="mt-6">
                <InteractiveLink href={`/${countryCode}`}>Explore products</InteractiveLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="w-full bg-black py-8 mb-8">
        <div className="content-container text-center text-white">
          <h1 className="text-3xl font-bold">Liked Products</h1>
          <div className="mt-1">
            <Breadcrumbs
              items={[
                { label: "Home", href: `/${countryCode}` },
                { label: "Liked Products" },
              ]}
            />
          </div>
        </div>
      </div>

      <div className="content-container py-16">
        <PaginatedProducts
          sortBy="created_at"
          page={1}
          productsIds={productIds}
          countryCode={countryCode}
        />
      </div>
    </div>
  )
}
