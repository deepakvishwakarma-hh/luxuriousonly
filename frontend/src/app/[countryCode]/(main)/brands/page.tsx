import { Metadata } from "next"
import Link from "next/link"
import { listBrands } from "@lib/data/brands"

type Props = {
  params: Promise<{ countryCode: string }>
}

export const metadata: Metadata = {
  title: "Brands | Medusa Store",
  description: "Browse all available brands",
}

export default async function BrandsPage(props: Props) {
  const params = await props.params
  const { countryCode } = params
  const { brands, count } = await listBrands()

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Brands</h1>
      <p className="text-gray-600 mb-4">Total brands: {count}</p>

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

      {/* JSON Data (for debugging) */}
      <div className="bg-gray-100 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Brands Data (JSON)</h2>
        <pre className="bg-white p-4 rounded border overflow-auto text-sm max-h-96">
          {JSON.stringify({ brands, count }, null, 2)}
        </pre>
      </div>
    </div>
  )
}
