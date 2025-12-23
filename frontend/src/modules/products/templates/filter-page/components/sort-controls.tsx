"use client"

type SortControlsProps = {
  count: number
  isLoading: boolean
  order: string
  orderDirection: string
  onSortChange: (order: string, direction: string) => void
}

export default function SortControls({
  count,
  isLoading,
  order,
  orderDirection,
  onSortChange,
}: SortControlsProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <p className="text-sm text-ui-fg-subtle">
          {isLoading ? "Loading..." : `${count} products found`}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">Sort by:</label>
        <select
          value={`${order}_${orderDirection}`}
          onChange={(e) => {
            const [newOrder, newDirection] = e.target.value.split("_")
            onSortChange(newOrder, newDirection)
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
  )
}

