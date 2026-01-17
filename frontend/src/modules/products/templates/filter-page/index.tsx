"use client"

import { useState, useEffect } from "react"
import { HttpTypes } from "@medusajs/types"
import { FilterProductsResponse } from "@lib/data/products"
import LoadingOverlay from "./components/loading-overlay"
import SearchQueryIndicator from "./components/search-query-indicator"
import FilterSidebar from "./components/filter-sidebar"
import SortControls from "./components/sort-controls"
import ProductGrid from "./components/product-grid"
import InfiniteScroll from "./components/infinite-scroll"
import { useFilterParams } from "./hooks/use-filter-params"
import { useProductFilters } from "./hooks/use-product-filters"
import { usePriceRange } from "./hooks/use-price-range"

type FilterPageProps = {
  countryCode: string
  region: HttpTypes.StoreRegion
  initialData?: FilterProductsResponse
}

export default function FilterPage({
  countryCode,
  region,
  initialData,
}: FilterPageProps) {
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const filters = useFilterParams()
  const [viewMode, setViewMode] = useState<'list' | 'grid-2' | 'grid-3' | 'grid-4'>('grid-3')
  const [isSmallScreen, setIsSmallScreen] = useState(false)

  // Detect small screens (mobile). On small screens we force 2-column grid and hide grid options
  useEffect(() => {
    if (typeof window === "undefined") return
    const onResize = () => setIsSmallScreen(window.innerWidth < 640)
    onResize()
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [])

  useEffect(() => {
    if (isSmallScreen && viewMode !== 'grid-2') {
      setViewMode('grid-2')
    }
  }, [isSmallScreen])

  const {
    data,
    error,
    isLoading,
    mutate,
    updateFilters,
    handleFilterChange,
    handleSortChange,
    clearFilters,
  } = useProductFilters(filters, initialData)

  const products = data?.products || []
  const count = data?.count || 0
  
  // Get filter options from API response or generate from products
  const generateFilterOptions = () => {
    if (data?.filter_options && Object.values(data.filter_options).some(v => v && (Array.isArray(v) ? v.length > 0 : true))) {
      return data.filter_options
    }
    
    // Fallback: Generate from products
    const brands = new Map<string, { id: string; name: string; slug: string }>()
    const categories = new Map<string, { id: string; name: string; handle: string }>()
    const genders = new Set<string>()
    const rim_styles = new Set<string>()
    const sizes = new Set<string>()
    const frame_materials = new Set<string>()
    const shapes = new Set<string>()
    
    products.forEach((product: any) => {
      if (product.brand) {
        brands.set(product.brand.slug, {
          id: product.brand.id,
          name: product.brand.name,
          slug: product.brand.slug,
        })
      }
      if (product.category) {
        categories.set(product.category.handle, {
          id: product.category.id,
          name: product.category.name,
          handle: product.category.handle,
        })
      }
      if (product.gender) genders.add(product.gender)
      if (product.rim_style) rim_styles.add(product.rim_style)
      if (product.size) sizes.add(product.size)
      if (product.frame_material) frame_materials.add(product.frame_material)
      if (product.shape) shapes.add(product.shape)
    })
    
    return {
      brands: Array.from(brands.values()),
      categories: Array.from(categories.values()),
      genders: Array.from(genders),
      rim_styles: Array.from(rim_styles),
      sizes: Array.from(sizes),
      frame_materials: Array.from(frame_materials),
      shapes: Array.from(shapes),
      shape_filters: [],
      shape_values: [],
    }
  }
  
  const filterOptions = generateFilterOptions()

  const { priceRange, priceValues, handlePriceChange } = usePriceRange({
    products,
    minPriceFilter: filters.minPrice,
    maxPriceFilter: filters.maxPrice,
    onPriceChange: (minCents, maxCents) => {
      updateFilters({
        min_price: String(minCents),
        max_price: String(maxCents),
      })
    },
  })

  const handlePageChange = () => {
    const nextPage = filters.page + 1
    updateFilters({ page: String(nextPage) })
  }

  const totalPages = Math.ceil(count / 20)
  const hasMore = filters.page < totalPages

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

  return (
    <div className="relative" style={{ zIndex: 0 }}>
      <LoadingOverlay isLoading={isLoading} />
      <SearchQueryIndicator searchQuery={filters.search} />
      <div className="content-container py-4 sm:py-6 md:py-8">
        {/* Mobile hamburger moved into SortControls for proper placement with sorting */}

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
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-base font-bold">Filters</h2>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  aria-label="Close filters"
                  className="p-2 rounded-md text-gray-700 hover:bg-gray-100"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="h-full overflow-auto">
                <FilterSidebar
                  filters={{
                    brand: filters.brand,
                    category: filters.category,
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
                  onClearFilters={() => {
                    clearFilters()
                    setShowMobileFilters(false)
                  }}
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 md:gap-8 lg:gap-10">
          {/* Sidebar - Hidden on mobile by default */}
          <div className="hidden lg:block lg:w-72 flex-shrink-0 self-start lg:sticky lg:top-20" style={{ zIndex: 20 }}>
            <FilterSidebar
              filters={{
                brand: filters.brand,
                category: filters.category,
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
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <SortControls
              count={count}
              isLoading={isLoading}
              order={filters.order}
              orderDirection={filters.orderDirection}
              viewMode={viewMode}
              onSortChange={handleSortChange}
              onViewModeChange={setViewMode}
              onOpenFilters={() => setShowMobileFilters(true)}
              showViewSelector={!isSmallScreen}
            />
            <InfiniteScroll
              onLoadMore={handlePageChange}
              isLoading={isLoading}
              hasMore={hasMore}
            >
              <ProductGrid
                products={products}
                region={region}
                countryCode={countryCode}
                isLoading={isLoading}
                error={error}
                viewMode={viewMode}
                onRetry={() => mutate()}
              />
            </InfiniteScroll>
          </div>
        </div>
      </div>
    </div>
  )
}
