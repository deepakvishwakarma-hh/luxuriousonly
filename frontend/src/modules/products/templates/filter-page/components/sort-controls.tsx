"use client"

type SortControlsProps = {
  count: number
  isLoading: boolean
  order: string
  orderDirection: string
  onSortChange: (order: string, direction: string) => void
  onOpenFilters?: () => void
}

export default function SortControls({
  count,
  isLoading,
  order,
  orderDirection,
  onSortChange,
  onOpenFilters,
}: SortControlsProps) {
  return (
    <div className="flex flex-col gap-3 sm:gap-4 mb-6 sm:mb-8 pb-4 border-b border-gray-200">
      <div>
        <p className="text-xs sm:text-sm font-medium text-gray-700">
          {isLoading ? (
            <span className="text-gray-500">Loading...</span>
          ) : (
            <span>
              Showing <span className="font-semibold text-gray-900">{count}</span> products
            </span>
          )}
        </p>
      </div>
      <div className="flex items-center gap-3 w-full">
        {/* Mobile filters button - appears inline with sort controls */}
        {onOpenFilters && (
          <button
            onClick={onOpenFilters}
            className="lg:hidden p-2 bg-white rounded-md shadow text-gray-900"
            aria-label="Open filters"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}

        <label className="text-xs sm:text-sm font-semibold text-gray-900 whitespace-nowrap">Sort by:</label>

        <select
          value={`${order}_${orderDirection}`}
          onChange={(e) => {
            const [newOrder, newDirection] = e.target.value.split("_")
            onSortChange(newOrder, newDirection)
          }}
          className="flex-1 min-w-0 px-3 sm:px-4 py-2.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent cursor-pointer"
        >
          <option value="created_at_desc">Newest First</option>
          <option value="title_asc">Name A-Z</option>
          <option value="title_desc">Name Z-A</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>
    </div>
  )
}

