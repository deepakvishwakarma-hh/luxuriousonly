"use client"

import React, { useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import useSWR from "swr"
import { FilterProductsResponse } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "@modules/products/components/thumbnail"
import PreviewPrice from "@modules/products/components/product-preview/price"
import AddToCartButton from "@modules/products/components/product-preview/add-to-cart-button"
import HoverActions from "@modules/products/components/product-preview/hover-actions"
import { getProductPrice } from "@lib/util/get-product-price"

// Client-side product preview component
function ProductPreviewClient({
  product,
  region,
  countryCode,
}: {
  product: any
  region: HttpTypes.StoreRegion
  countryCode: string
}) {
  // Convert filter API product format to match expected format
  const formattedProduct: HttpTypes.StoreProduct = {
    ...product,
    variants: product.variants?.map((v: any) => ({
      ...v,
      calculated_price: v.price
        ? {
            calculated_amount: v.price,
            currency_code: product.currency_code || "USD",
            original_amount: v.price,
            calculated_price: {
              price_list_type: "sale",
            },
          }
        : undefined,
    })),
  }

  // Get price for display
  let cheapestPrice: any = null
  if (product.price !== null && product.price !== undefined) {
    const priceAmount = product.price / 100 // Convert from cents
    cheapestPrice = {
      calculated_price_number: priceAmount,
      calculated_price: product.price_formatted || `$${priceAmount.toFixed(2)}`,
      original_price_number: priceAmount,
      original_price: product.price_formatted || `$${priceAmount.toFixed(2)}`,
      currency_code: product.currency_code || "USD",
      price_type: "default",
      percentage_diff: null,
    }
  }

  return (
    <LocalizedClientLink href={`/products/${product.handle}`} className="group">
      <div
        data-testid="product-wrapper"
        className="shadow-elevation-card-rest rounded-large group-hover:shadow-elevation-card-hover transition-shadow ease-in-out duration-150 overflow-hidden relative"
      >
        {cheapestPrice &&
          cheapestPrice.price_type === "sale" &&
          cheapestPrice.percentage_diff && (
            <div className="absolute top-2 left-2 z-10 bg-black text-white px-2 py-1 rounded-full text-[11px] font-semibold">
              -{cheapestPrice.percentage_diff}%
            </div>
          )}
        <HoverActions product={formattedProduct} />
        <Thumbnail
          thumbnail={product.thumbnail}
          images={product.images}
          size="full"
        />
        <div className="flex flex-col txt-compact-medium mt-4 justify-between px-4 pb-4">
          <p
            className="text-ui-fg-subtle text-center"
            data-testid="product-title"
          >
            {product.title}
          </p>
          {product.brand && (
            <p className="text-ui-fg-subtle text-center font-bold">
              {product.brand.name}
            </p>
          )}
          <div className="flex items-center justify-center gap-x-2">
            {cheapestPrice && <PreviewPrice price={cheapestPrice} />}
          </div>
          <AddToCartButton product={formattedProduct} countryCode={countryCode} />
        </div>
      </div>
    </LocalizedClientLink>
  )
}

type BrandPageProps = {
  countryCode: string
  region: HttpTypes.StoreRegion
  brandSlug: string
  brandName?: string
  brandImage?: string
  brandDescription?: string
  initialData?: FilterProductsResponse
}

// Fetcher function for useSWR
const fetcher = async (url: string): Promise<FilterProductsResponse> => {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY && {
        "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
      }),
    },
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch products: ${response.statusText}`)
  }

  return response.json()
}

export default function BrandPage({
  countryCode,
  region,
  brandSlug,
  brandName,
  brandImage,
  brandDescription,
  initialData,
}: BrandPageProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Memoize filter values to prevent unnecessary re-renders
  const filters = useMemo(() => {
    const pageParam = searchParams.get("page")
    const page = pageParam ? parseInt(pageParam) : 1
    
    return {
      category: searchParams.get("category") || "",
      rimStyle: searchParams.getAll("rim_style"),
      gender: searchParams.getAll("gender"),
      shapes: searchParams.getAll("shapes"),
      size: searchParams.getAll("size"),
      minPrice: searchParams.get("min_price"),
      maxPrice: searchParams.get("max_price"),
      order: searchParams.get("order") || "created_at",
      orderDirection: searchParams.get("order_direction") || "desc",
      page,
    }
  }, [searchParams])

  // Build API URL - always filter by brand_slug
  const apiUrl = useMemo(() => {
    const queryParams = new URLSearchParams()
    queryParams.set("brand_slug", brandSlug) // Always filter by brand
    if (filters.category) queryParams.set("category_name", filters.category)
    filters.rimStyle.forEach((v) => queryParams.append("rim_style", v))
    filters.gender.forEach((v) => queryParams.append("gender", v))
    filters.shapes.forEach((v) => queryParams.append("shapes", v))
    filters.size.forEach((v) => queryParams.append("size", v))
    if (filters.minPrice) queryParams.set("min_price", filters.minPrice)
    if (filters.maxPrice) queryParams.set("max_price", filters.maxPrice)
    queryParams.set("order", filters.order)
    queryParams.set("order_direction", filters.orderDirection)
    queryParams.set("limit", "20")
    queryParams.set("offset", String((filters.page - 1) * 20))
    queryParams.set("include_filter_options", "true")

    const backendUrl = typeof window !== "undefined" 
      ? (window.location.origin.includes("localhost") 
          ? "http://localhost:9000" 
          : window.location.origin.replace(/:\d+$/, ":9000"))
      : process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"
    
    return `${backendUrl}/store/products/filter?${queryParams.toString()}`
  }, [filters, brandSlug])

  // Use SWR to fetch data
  const { data, error, isLoading, mutate } = useSWR<FilterProductsResponse>(
    apiUrl,
    fetcher,
    {
      fallbackData: initialData,
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 2000,
    }
  )

  const products = data?.products || []
  const count = data?.count || 0
  const filterOptions = data?.filter_options
  const loading = isLoading

  // Update URL with filters
  const updateFilters = (updates: Record<string, string | string[] | null>) => {
    const params = new URLSearchParams(searchParams.toString())
    
    // Reset to first page when filters change (except when updating page itself)
    if (!updates.page) {
      params.delete("page")
    }

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "" || (Array.isArray(value) && value.length === 0)) {
        params.delete(key)
      } else if (Array.isArray(value)) {
        params.delete(key)
        value.forEach((v) => params.append(key, v))
      } else {
        params.set(key, value)
      }
    })

    router.push(`?${params.toString()}`)
  }

  const handleFilterChange = (key: string, value: string, isMulti = false) => {
    if (isMulti) {
      const current = searchParams.getAll(key)
      const newValue = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value]
      updateFilters({ [key]: newValue })
    } else {
      updateFilters({ [key]: value || null })
    }
  }

  const handleSortChange = (order: string, direction: string) => {
    updateFilters({ order, order_direction: direction })
  }

  const clearFilters = () => {
    router.push("?")
  }

  return (
    <div className="content-container py-8">
      {/* Brand Header */}
     {(brandName || brandImage || brandDescription) && (
  <div className="mb-8 pb-8 border-b">
    <div className="flex flex-col items-center gap-6">
      
      {/* Brand Image (optional) */}
      {/* {brandImage && (
        <img
          src={brandImage}
          alt={brandName || "Brand"}
          className="w-24 h-24 md:w-32 md:h-32 object-contain rounded-lg border"
        />
      )} */}

      <div className="text-center">
        {brandName && (
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            {brandName}
          </h1>
        )}

        {brandDescription && (
          <p className="text-gray-600 mb-4 max-w-2xl mx-auto">
            {brandDescription}
          </p>
        )}

        <p className="text-sm text-gray-500">
          {count} {count === 1 ? "product" : "products"}
        </p>
      </div>

    </div>
  </div>
)}


      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="sticky top-4 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Filters</h2>
              <button
                onClick={clearFilters}
                className="text-sm text-ui-fg-subtle hover:text-ui-fg-base"
              >
                Clear All
              </button>
            </div>

            {/* Category Filter */}
            {filterOptions?.categories && filterOptions.categories.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => updateFilters({ category: e.target.value || null })}
                  className="w-full px-3 py-2 border border-ui-border-base rounded-md focus:outline-none focus:ring-2 focus:ring-ui-fg-interactive"
                >
                  <option value="">All Categories</option>
                  {filterOptions.categories.map((category) => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Gender Filter */}
            {filterOptions?.genders && filterOptions.genders.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-2">Gender</label>
                <div className="space-y-2">
                  {filterOptions.genders.map((gender) => (
                    <label key={gender} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.gender.includes(gender)}
                        onChange={() => handleFilterChange("gender", gender, true)}
                        className="mr-2"
                      />
                      <span className="text-sm">{gender}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Rim Style Filter */}
            {filterOptions?.rim_styles && filterOptions.rim_styles.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-2">Rim Style</label>
                <div className="space-y-2">
                  {filterOptions.rim_styles.map((style) => (
                    <label key={style} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.rimStyle.includes(style)}
                        onChange={() => handleFilterChange("rim_style", style, true)}
                        className="mr-2"
                      />
                      <span className="text-sm">{style}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Shapes Filter */}
            {filterOptions?.shapes && filterOptions.shapes.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-2">Shapes</label>
                <div className="space-y-2">
                  {filterOptions.shapes.map((shape) => (
                    <label key={shape} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.shapes.includes(shape)}
                        onChange={() => handleFilterChange("shapes", shape, true)}
                        className="mr-2"
                      />
                      <span className="text-sm">{shape}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Size Filter */}
            {filterOptions?.sizes && filterOptions.sizes.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-2">Size</label>
                <div className="space-y-2">
                  {filterOptions.sizes.map((size) => (
                    <label key={size} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.size.includes(size)}
                        onChange={() => handleFilterChange("size", size, true)}
                        className="mr-2"
                      />
                      <span className="text-sm">{size}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium mb-2">Price Range</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={filters.minPrice || ""}
                  onChange={(e) => updateFilters({ min_price: e.target.value || null })}
                  placeholder="Min"
                  className="w-full px-3 py-2 border border-ui-border-base rounded-md focus:outline-none focus:ring-2 focus:ring-ui-fg-interactive"
                />
                <input
                  type="number"
                  value={filters.maxPrice || ""}
                  onChange={(e) => updateFilters({ max_price: e.target.value || null })}
                  placeholder="Max"
                  className="w-full px-3 py-2 border border-ui-border-base rounded-md focus:outline-none focus:ring-2 focus:ring-ui-fg-interactive"
                />
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          {/* Sort and Results Count */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm text-ui-fg-subtle">
                {loading ? "Loading..." : `${count} products found`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Sort by:</label>
              <select
                value={`${filters.order}_${filters.orderDirection}`}
                onChange={(e) => {
                  const [order, direction] = e.target.value.split("_")
                  handleSortChange(order, direction)
                }}
                className="px-3 py-2 border border-ui-border-base rounded-md focus:outline-none focus:ring-2 focus:ring-ui-fg-interactive"
              >
                <option value="created_at_desc">Newest First</option>
                <option value="created_at_asc">Oldest First</option>
                <option value="title_asc">Name A-Z</option>
                <option value="title_desc">Name Z-A</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Products Grid */}
          {error ? (
            <div className="text-center py-12">
              <p className="text-ui-fg-destructive">Error loading products. Please try again.</p>
              <button
                onClick={() => mutate()}
                className="mt-4 px-4 py-2 bg-ui-bg-interactive text-ui-fg-on-interactive rounded-md hover:bg-ui-bg-interactive-hover"
              >
                Retry
              </button>
            </div>
          ) : loading ? (
            <div className="text-center py-12">
              <p className="text-ui-fg-subtle">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-ui-fg-subtle">No products found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.map((product: any) => (
                <ProductPreviewClient
                  key={product.id}
                  product={product}
                  region={region}
                  countryCode={countryCode}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {count > 20 && (
            <div className="flex justify-center gap-2 mt-8">
              <button
                onClick={() => updateFilters({ page: String(Math.max(1, filters.page - 1)) })}
                disabled={filters.page === 1}
                className="px-4 py-2 border border-ui-border-base rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-ui-bg-subtle-hover"
              >
                Previous
              </button>
              <span className="px-4 py-2">
                Page {filters.page} of {Math.ceil(count / 20)}
              </span>
              <button
                onClick={() => updateFilters({ page: String(filters.page + 1) })}
                disabled={filters.page >= Math.ceil(count / 20)}
                className="px-4 py-2 border border-ui-border-base rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-ui-bg-subtle-hover"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

