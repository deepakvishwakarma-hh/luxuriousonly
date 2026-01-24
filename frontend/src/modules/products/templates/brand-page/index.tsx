"use client"

import React, { useMemo, useState, useEffect } from "react"
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
import FilterSidebar from "../filter-page/components/filter-sidebar"
import { usePriceRange } from "../filter-page/hooks/use-price-range"

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
        className="shadow-elevation-card-rest rounded-large group-hover:shadow-elevation-card-hover transition-shadow ease-in-out duration-150 overflow-hidden relative h-full flex flex-col"
      >
        {cheapestPrice &&
          cheapestPrice.price_type === "sale" &&
          cheapestPrice.percentage_diff && (
            <div className="absolute top-2 left-2 z-10 bg-black text-white px-2 py-1 rounded-full text-[11px] font-semibold">
              -{cheapestPrice.percentage_diff}%
            </div>
          )}
        <HoverActions product={formattedProduct} />
        <div className="flex-shrink-0">
          <Thumbnail
            thumbnail={product.thumbnail}
            images={product.images}
            size="full"
          />
        </div>

        <div className="flex-1 flex flex-col justify-between txt-compact-medium mt-3 px-4 pb-4">
          <div className="space-y-1">
            {product.brand && (
              <p className="text-ui-fg-subtle text-center font-semibold text-xs uppercase tracking-wide font-urbanist">
                {product.brand.name}
              </p>
            )}
            <p
              className="text-gray-900 text-center text-sm font-medium leading-tight max-h-12 overflow-hidden font-urbanist"
              data-testid="product-title"
            >
              {product.title}
            </p>
          </div>
          <div className="flex items-center justify-center gap-x-2 mt-2">
            {cheapestPrice && <PreviewPrice price={cheapestPrice} />}
          </div>
          <div className="mt-3">
            <AddToCartButton
              product={formattedProduct}
              countryCode={countryCode}
            />
          </div>
        </div>
      </div>
    </LocalizedClientLink>
  )
}

type BrandPageProps = {
  brandTitle?: string
  countryCode: string
  region: HttpTypes.StoreRegion
  brandSlug: string
  brandName?: string
  brandMetaTitle?: string
  brandMetaDesc?: string
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
  brandMetaTitle,
  brandMetaDesc,
  brandImage,
  brandDescription,
  initialData,
  brandTitle,
}: BrandPageProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showMobileFilters, setShowMobileFilters] = useState(false)

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
      frameMaterial: searchParams.getAll("frame_material"),
      shapeFilter: searchParams.getAll("shape_filter"),
      shape: searchParams.getAll("shape"),
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
    filters.frameMaterial.forEach((v) => queryParams.append("frame_material", v))
    filters.shapeFilter.forEach((v) => queryParams.append("shape_filter", v))
    filters.shape.forEach((v) => queryParams.append("shape", v))
    if (filters.minPrice) queryParams.set("min_price", filters.minPrice)
    if (filters.maxPrice) queryParams.set("max_price", filters.maxPrice)
    queryParams.set("order", filters.order)
    queryParams.set("order_direction", filters.orderDirection)
    queryParams.set("limit", "20")
    queryParams.set("offset", String((filters.page - 1) * 20))
    queryParams.set("include_filter_options", "true")

    const backendUrl = process.env.MEDUSA_BACKEND_URL
    if (!backendUrl) {
      return null
    }

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

  const { priceRange, priceValues, handlePriceChange } = usePriceRange({
    products,
    minPriceFilter: filters.minPrice,
    maxPriceFilter: filters.maxPrice,
    onPriceChange: (minCents, maxCents) => {
      updateFilters({ min_price: String(minCents), max_price: String(maxCents) })
    },
  })

  useEffect(() => {
    if (typeof document === "undefined") return
    if (showMobileFilters) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }

    return () => {
      document.body.style.overflow = ""
    }
  }, [showMobileFilters])

  // Update URL with filters
  const updateFilters = (updates: Record<string, string | string[] | null>) => {
    const params = new URLSearchParams(searchParams.toString())

    // Reset to first page when filters change (except when updating page itself)
    if (!updates.page) {
      params.delete("page")
    }

    Object.entries(updates).forEach(([key, value]) => {
      if (
        value === null ||
        value === "" ||
        (Array.isArray(value) && value.length === 0)
      ) {
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

  const BrandFilterSidebar = () => (
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
      {filterOptions?.categories &&
        filterOptions.categories.length > 0 && (
          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select
              value={filters.category}
              onChange={(e) =>
                updateFilters({ category: e.target.value || null })
              }
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

      {/* Frame Material Filter */}
      {filterOptions?.frame_materials && filterOptions.frame_materials.length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-2">Frame Material</label>
          <div className="space-y-2">
            {filterOptions.frame_materials.map((material) => (
              <label key={material} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.frameMaterial.includes(material)}
                  onChange={() => handleFilterChange("frame_material", material, true)}
                  className="mr-2"
                />
                <span className="text-sm">{material}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Shape Filter */}
      {filterOptions?.shape_filters && filterOptions.shape_filters.length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-2">Shape Filter</label>
          <div className="space-y-2">
            {filterOptions.shape_filters.map((shapeFilter) => (
              <label key={shapeFilter} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.shapeFilter.includes(shapeFilter)}
                  onChange={() => handleFilterChange("shape_filter", shapeFilter, true)}
                  className="mr-2"
                />
                <span className="text-sm">{shapeFilter}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Shape Filter */}
      {filterOptions?.shape_values && filterOptions.shape_values.length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-2">Shape</label>
          <div className="space-y-2">
            {filterOptions.shape_values.map((shape) => (
              <label key={shape} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.shape.includes(shape)}
                  onChange={() => handleFilterChange("shape", shape, true)}
                  className="mr-2"
                />
                <span className="text-sm">{shape}</span>
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
  )

  return (
    <div className="px-5 pb-8">
      {/* Brand Header */}
      {(brandName || brandMetaTitle || brandImage || brandMetaDesc || brandDescription) && (
        <div className="mb-12 pb-8 border-b border-gray-200 bg-gray-100 pt-8">
          <div className="flex flex-col items-center gap-6">            
            {/* {brandImage && (
              <div className="mb-4">
                <img 
                  src={brandImage} 
                  alt={brandName || "Brand"} 
                  className="h-24 w-auto object-contain"
                />
              </div>
            )} */}
            <div className="text-center space-y-4 max-w-3xl mx-auto">
              {(brandName || brandTitle) && (
                <h1 className="text-3xl sm:text-4xl md:text-4xl font-bold leading-tight text-gray-900 font-urbanist">
                  {brandTitle || brandName}
                </h1>
              )}

              {(brandMetaDesc || brandDescription) && (
                <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
                  {brandMetaDesc || brandDescription}
                </p>
              )}

              <div className="pt-2">
                <p className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider font-urbanist">
                  {count} {count === 1 ? "product" : "products"} available
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-8">
        {/* Mobile Drawer */}
        {showMobileFilters && (
          <div
            id="mobile-filter-drawer"
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 lg:hidden"
            style={{ zIndex: 9998 }}
          >
            <div
              className="fixed inset-0 bg-black bg-opacity-40"
              onClick={() => setShowMobileFilters(false)}
              style={{ zIndex: 9998 }}
            />

            <div className={`fixed top-0 left-0 h-full w-80 max-w-[85%] bg-white shadow-xl transform transition-transform`} style={{ zIndex: 9999 }}>
              <div className="flex items-center justify-between p-5 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900 font-urbanist">Filters</h2>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  aria-label="Close filters"
                  className="p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="h-full overflow-auto p-4">
                <FilterSidebar
                  filters={{
                    brand: [],
                    category: filters.category ? [filters.category] : [],
                    rimStyle: filters.rimStyle,
                    gender: filters.gender,
                    shapes: filters.shapes,
                    size: filters.size,
                    frameMaterial: filters.frameMaterial,
                    shapeFilter: filters.shapeFilter,
                    shape: filters.shape,
                    minPrice: filters.minPrice || undefined,
                    maxPrice: filters.maxPrice || undefined,
                  }}
                  filterOptions={filterOptions}
                  priceRange={priceRange}
                  priceValues={priceValues}
                  onPriceChange={handlePriceChange}
                  onFilterChange={handleFilterChange}
                  onClearFilters={() => { clearFilters(); setShowMobileFilters(false) }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Sidebar Filters - visible on lg and up */}
        <aside className="hidden lg:block lg:w-72 flex-shrink-0 self-start lg:sticky lg:top-20" style={{ zIndex: 20 }}>
          <FilterSidebar
            filters={{
              brand: [],
              category: filters.category ? [filters.category] : [],
              rimStyle: filters.rimStyle,
              gender: filters.gender,
              shapes: filters.shapes,
              size: filters.size,
              frameMaterial: filters.frameMaterial,
              shapeFilter: filters.shapeFilter,
              shape: filters.shape,
              minPrice: filters.minPrice || undefined,
              maxPrice: filters.maxPrice || undefined,
            }}
            filterOptions={filterOptions}
            priceRange={priceRange}
            priceValues={priceValues}
            onPriceChange={handlePriceChange}
            onFilterChange={handleFilterChange}
            onClearFilters={clearFilters}
          />
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          {/* Sort and Results Count */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <p className="text-sm sm:text-base font-medium text-gray-700 text-center sm:text-left font-urbanist">
                {loading ? (
                  <span className="text-gray-500">Loading...</span>
                ) : (
                  <span>
                    <span className="font-semibold text-gray-900">{count}</span>{" "}
                    {count === 1 ? "product" : "products"} found
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-3 flex-wrap w-full sm:w-auto">
              <button
                onClick={() => setShowMobileFilters(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors lg:hidden flex-shrink-0 font-medium text-sm font-urbanist"
                aria-label="Open filters"
                aria-haspopup="dialog"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <span>Filters</span>
              </button>
              <label className="text-sm font-medium text-gray-700 hidden sm:inline font-urbanist">
                Sort by:
              </label>
              <select
                value={`${filters.order}_${filters.orderDirection}`}
                onChange={(e) => {
                  const [order, direction] = e.target.value.split("_")
                  handleSortChange(order, direction)
                }}
                className="px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 w-full sm:w-auto flex-1 sm:flex-none min-w-[180px] text-sm font-medium font-urbanist"
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
            <div className="text-center py-16">
              <p className="text-red-600 font-medium mb-4 font-urbanist">
                Error loading products. Please try again.
              </p>
              <button
                onClick={() => mutate()}
                className="px-6 py-2.5 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors font-medium text-sm font-urbanist"
              >
                Retry
              </button>
            </div>
          ) : loading ? (
            <div className="text-center py-16">
              <p className="text-gray-500 font-medium font-urbanist">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 font-medium text-lg font-urbanist">No products found</p>
              <p className="text-gray-400 text-sm mt-2">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
            <div className="flex justify-center items-center gap-3 mt-12 pt-8 border-t border-gray-200">
              <button
                onClick={() =>
                  updateFilters({ page: String(Math.max(1, filters.page - 1)) })
                }
                disabled={filters.page === 1}
                className="px-5 py-2.5 border border-gray-300 rounded-md bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors font-medium text-sm font-urbanist"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm font-medium text-gray-700 font-urbanist">
                Page <span className="font-semibold">{filters.page}</span> of{" "}
                <span className="font-semibold">{Math.ceil(count / 20)}</span>
              </span>
              <button
                onClick={() =>
                  updateFilters({ page: String(filters.page + 1) })
                }
                disabled={filters.page >= Math.ceil(count / 20)}
                className="px-5 py-2.5 border border-gray-300 rounded-md bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors font-medium text-sm font-urbanist"
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
