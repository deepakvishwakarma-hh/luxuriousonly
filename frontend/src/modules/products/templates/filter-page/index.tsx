"use client"

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

  return (
    <div className="relative">
      <LoadingOverlay isLoading={isLoading} />
      <SearchQueryIndicator searchQuery={filters.search} />
      <div className="content-container py-8">
        <div className="flex flex-col md:flex-row gap-8">
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

          <div className="flex-1">
            <SortControls
              count={count}
              isLoading={isLoading}
              order={filters.order}
              orderDirection={filters.orderDirection}
              onSortChange={handleSortChange}
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
