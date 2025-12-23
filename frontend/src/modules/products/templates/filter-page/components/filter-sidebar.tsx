"use client"

import PriceFilter from "./price-filter"
import CheckboxFilter from "./checkbox-filter"

type FilterSidebarProps = {
  filters: {
    brand: string[]
    category: string[]
    rimStyle: string[]
    gender: string[]
    shapes: string[]
    size: string[]
    minPrice?: string | null
    maxPrice?: string | null
  }
  filterOptions?: {
    brands?: Array<{ id: string; name: string; slug: string }>
    categories?: Array<{ id: string; name: string; handle: string }>
    rim_styles?: string[]
    genders?: string[]
    shapes?: string[]
    sizes?: string[]
  }
  priceRange: { min: number; max: number }
  priceValues: number[]
  onPriceChange: (min: number, max: number) => void
  onFilterChange: (key: string, value: string, isMulti?: boolean) => void
  onClearFilters: () => void
}

export default function FilterSidebar({
  filters,
  filterOptions,
  priceRange,
  priceValues,
  onPriceChange,
  onFilterChange,
  onClearFilters,
}: FilterSidebarProps) {
  return (
    <aside className="w-full md:w-64 flex-shrink-0">
      <div className="sticky top-4 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-md font-semibold uppercase">Filters</h2>
          <button
            onClick={onClearFilters}
            className="text-sm text-ui-fg-subtle hover:text-ui-fg-base"
          >
            Clear All
          </button>
        </div>

        <PriceFilter
          priceRange={priceRange}
          priceValues={priceValues}
          onPriceChange={onPriceChange}
        />

        {filterOptions?.brands && (
          <CheckboxFilter
            label="Brand"
            options={filterOptions.brands}
            selectedValues={filters.brand}
            onChange={(value) => onFilterChange("brand", value, true)}
            getValue={(option) => (option as { slug: string }).slug}
            getLabel={(option) => (option as { name: string }).name}
          />
        )}

        {filterOptions?.categories && (
          <CheckboxFilter
            label="Category"
            options={filterOptions.categories}
            selectedValues={filters.category}
            onChange={(value) => onFilterChange("category", value, true)}
            getValue={(option) => (option as { name: string }).name}
            getLabel={(option) => (option as { name: string }).name}
          />
        )}

        {filterOptions?.genders && (
          <CheckboxFilter
            label="Gender"
            options={filterOptions.genders}
            selectedValues={filters.gender}
            onChange={(value) => onFilterChange("gender", value, true)}
            getValue={(option) => option as string}
            getLabel={(option) => option as string}
          />
        )}

        {filterOptions?.rim_styles && (
          <CheckboxFilter
            label="Rim Style"
            options={filterOptions.rim_styles}
            selectedValues={filters.rimStyle}
            onChange={(value) => onFilterChange("rim_style", value, true)}
            getValue={(option) => option as string}
            getLabel={(option) => option as string}
          />
        )}

        {filterOptions?.shapes && (
          <CheckboxFilter
            label="Shapes"
            options={filterOptions.shapes}
            selectedValues={filters.shapes}
            onChange={(value) => onFilterChange("shapes", value, true)}
            getValue={(option) => option as string}
            getLabel={(option) => option as string}
          />
        )}

        {filterOptions?.sizes && (
          <CheckboxFilter
            label="Size"
            options={filterOptions.sizes}
            selectedValues={filters.size}
            onChange={(value) => onFilterChange("size", value, true)}
            getValue={(option) => option as string}
            getLabel={(option) => option as string}
          />
        )}
      </div>
    </aside>
  )
}

