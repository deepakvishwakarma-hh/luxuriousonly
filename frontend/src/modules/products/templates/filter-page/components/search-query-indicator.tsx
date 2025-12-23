"use client"

type SearchQueryIndicatorProps = {
  searchQuery: string
}

export default function SearchQueryIndicator({
  searchQuery,
}: SearchQueryIndicatorProps) {
  if (!searchQuery) return null

  return (
    <div className="bg-black text-white flex items-center justify-center p-5 font">
      <p className="text-xl font-bold text-center">
        Search Results for - "{searchQuery.toUpperCase()}"
      </p>
    </div>
  )
}

