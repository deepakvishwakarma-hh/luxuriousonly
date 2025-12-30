"use client"

import { useState, useEffect } from "react"
import { HttpTypes } from "@medusajs/types"
import { FilterProductsResponse } from "@lib/data/products"
import LoadingOverlay from "./components/loading-overlay"
import SearchQueryIndicator from "./components/search-query-indicator"
import FilterSidebar from "./components/filter-sidebar"
import SortControls from "./components/sort-controls"
import ProductGrid from "./components/product-grid"
import Pagination from "./components/pagination"
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
  const filterOptions = data?.filter_options

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

  const handlePageChange = (page: number) => {
    updateFilters({ page: String(page) })
  }

  const totalPages = Math.ceil(count / 20)

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
    <div className="relative">
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
            className="fixed inset-0 z-60 lg:hidden"
          >
            <div
              className="fixed inset-0 bg-black bg-opacity-40"
              onClick={() => setShowMobileFilters(false)}
            />

            <div className={`fixed top-0 left-0 h-full w-80 max-w-[85%] z-70 bg-white shadow-xl transform transition-transform`}>
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
          <div className="hidden lg:block lg:w-72 flex-shrink-0">
            <FilterSidebar
              filters={{
                brand: filters.brand,
                category: filters.category,
                rimStyle: filters.rimStyle,
                gender: filters.gender,
                shapes: filters.shapes,
                size: filters.size,
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
              onSortChange={handleSortChange}
              onOpenFilters={() => setShowMobileFilters(true)}
            />
            <ProductGrid
              products={products}
              region={region}
              countryCode={countryCode}
              isLoading={isLoading}
              error={error}
              onRetry={() => mutate()}
            />
            <Pagination
              currentPage={filters.page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
