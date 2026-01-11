"use client"

import {
  useRouter,
  useSearchParams,
  usePathname,
  useParams,
} from "next/navigation"
import { useState, FormEvent, useEffect, useRef, useCallback } from "react"
import useSWR from "swr"
import WoodMartIcon from "@modules/common/icons/woodmart-icon"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { sdk } from "@lib/config"

type SearchProduct = {
  id: string
  title: string
  handle: string
  thumbnail: string | null
  price_formatted: string | null
}

type SearchResponse = {
  products: SearchProduct[]
  count: number
}

type SearchQuery = {
  search: string
  limit: number
  offset: number
}

// Fetcher for search suggestions using Medusa SDK
const searchFetcher = async (
  query: SearchQuery | null
): Promise<SearchResponse> => {
  if (!query) {
    return { products: [], count: 0 }
  }

  try {
    const response = await sdk.client.fetch<{
      products: any[]
      count: number
    }>(`/store/products/filter`, {
      method: "GET",
      query: {
        search: query.search,
        limit: query.limit,
        offset: query.offset,
      },
      cache: "no-store",
    })

    // Ensure response matches expected format
    if (!response || typeof response !== "object") {
      console.error("[NavSearch] Invalid response format:", response)
      return { products: [], count: 0 }
    }

    // Map products to expected format
    const products: SearchProduct[] = (response.products || []).map(
      (product: any) => ({
        id: product.id || "",
        title: product.title || "",
        handle: product.handle || "",
        thumbnail: product.thumbnail || null,
        price_formatted: product.price_formatted || null,
      })
    )

    return {
      products,
      count: response.count || products.length,
    }
  } catch (error) {
    console.error("[NavSearch] Search fetcher error:", error)
    throw error
  }
}

export default function NavSearch() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const { countryCode } = useParams() as { countryCode: string }
  const [query, setQuery] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Build search query object
  const searchQuery: SearchQuery | null =
    query.trim().length >= 2
      ? {
          search: query.trim(),
          limit: 4,
          offset: 0,
        }
      : null

  // Fetch search suggestions with debouncing using Medusa SDK
  const {
    data: searchData,
    isLoading: isSearching,
    error: searchError,
  } = useSWR<SearchResponse>(searchQuery, searchFetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 500,
  })

  // Debug logging
  useEffect(() => {
    if (searchQuery) {
      console.log("[NavSearch] Searching with query:", searchQuery)
    }
    if (searchError) {
      console.error("[NavSearch] Search error:", searchError)
    }
    if (searchData) {
      console.log("[NavSearch] Search results:", searchData)
    }
  }, [searchQuery, searchError, searchData])

  // Initialize query from URL on mount or when pathname changes (but not when user is typing)
  useEffect(() => {
    if (!isTyping) {
      const searchParam = searchParams.get("search") || ""
      setQuery(searchParam)
    }
  }, [searchParams, pathname, isTyping])

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsTyping(false)
    setShowSuggestions(false)
    if (query.trim()) {
      router.push(
        `/${countryCode}/filter?search=${encodeURIComponent(query.trim())}`
      )
    } else {
      router.push(`/${countryCode}/filter`)
    }
  }

  const handleClear = () => {
    setQuery("")
    setIsTyping(false)
    setShowSuggestions(false)
    router.push(`/${countryCode}/filter`)
  }

  const handleProductClick = (handle: string) => {
    setShowSuggestions(false)
    setIsTyping(false)
    router.push(`/${countryCode}/products/${handle}`)
  }

  const handleSeeAll = () => {
    setShowSuggestions(false)
    setIsTyping(false)
    if (query.trim()) {
      router.push(
        `/${countryCode}/filter?search=${encodeURIComponent(query.trim())}`
      )
    } else {
      router.push(`/${countryCode}/filter`)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setIsTyping(true)
    setQuery(value)

    // Show suggestions if query is at least 2 characters
    if (value.trim().length >= 2) {
      setShowSuggestions(true)
    } else {
      setShowSuggestions(false)
    }
  }

  const handleInputFocus = () => {
    setIsTyping(true)
    if (query.trim().length >= 2) {
      setShowSuggestions(true)
    }
  }

  const handleInputBlur = () => {
    // Delay to allow click events on suggestions to fire
    setTimeout(() => {
      setIsTyping(false)
      setShowSuggestions(false)
    }, 200)
  }

  const searchResults = searchData?.products || []
  const hasMoreResults = (searchData?.count || 0) > 4

  return (
    <form onSubmit={handleSubmit} className="flex-1 w-full relative">
      <div className="relative">
        <input
          ref={searchInputRef}
          type="search"
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder="Search for products"
          className="w-full h-[46px] pl-4 pr-20 bg-gray-100 border border-[#8d8d8d] rounded-md text-[#8d8d8d] placeholder:text-[#8d8d8d] focus:outline-none focus:ring-1 focus:ring-[#8d8d8d] focus:border-[#8d8d8d] text-sm bg-[#f1f1f180]"
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-4">
          {query && (
            <>
              <button
                type="button"
                onClick={handleClear}
                className="pointer-events-auto cursor-pointer hover:opacity-70 transition-opacity"
                aria-label="Clear search"
              >
                <WoodMartIcon
                  iconContent="f112"
                  size={14}
                  className="text-gray-400"
                />
              </button>
              <div className="h-4 w-px bg-gray-400"></div>
            </>
          )}
          <div className="pointer-events-none">
            <WoodMartIcon
              iconContent="f130"
              size={18}
              className="text-gray-400"
            />
          </div>
        </div>
      </div>

      {/* Search Suggestions Dropdown */}
      {showSuggestions && query.trim().length >= 2 && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-[400px] overflow-y-auto px-2"
        >
          {isSearching ? (
            <div className="p-4 text-center text-sm text-gray-500">
              Searching...
            </div>
          ) : searchResults.length > 0 ? (
            <>
              <div className="py-2 grid grid-cols-1 lg:grid-cols-2 gap-2">
                {searchResults.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => handleProductClick(product.handle)}
                    className="w-full px-4 py-3 hover:bg-gray-50 flex items-center gap-3 text-left transition-colors border border-gray-200 rounded"
                  >
                    {product.thumbnail && (
                      <img
                        src={product.thumbnail}
                        alt={product.title}
                        className="w-12 h-12 object-cover rounded flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {product.title}
                      </p>
                      {product.price_formatted && (
                        <p className="text-xs text-gray-500 mt-1">
                          {product.price_formatted}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
              {hasMoreResults && (
                <div className="border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleSeeAll}
                    className="w-full px-4 py-3 text-sm font-medium text-blue-600 hover:bg-gray-50 text-center transition-colors"
                  >
                    See all results ({searchData?.count || 0})
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="p-4 text-center text-sm text-gray-500">
              No products found
            </div>
          )}
        </div>
      )}
    </form>
  )
}
