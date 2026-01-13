"use client"

import { useMemo } from "react"
import useSWR from "swr"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import WoodMartIcon from "@modules/common/icons/woodmart-icon"
import {
  getLikedProductIdsFromAPI,
  LIKED_PRODUCTS_SWR_KEY,
} from "@lib/util/liked-api"

// SWR fetcher function
const likedProductsFetcher = async (): Promise<string[]> => {
  try {
    return await getLikedProductIdsFromAPI()
  } catch (error) {
    console.error("Error fetching liked products:", error)
    return []
  }
}

type LikedButtonProps = {
  labelOnly?: boolean
  label?: string
  asMenuItem?: boolean
}

export default function LikedButton({ labelOnly = false, label = "Wishlist", asMenuItem = false }: LikedButtonProps) {
  // Use SWR to fetch and cache liked products
  const { data: likedIds } = useSWR<string[]>(
    LIKED_PRODUCTS_SWR_KEY,
    likedProductsFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 5000,
      shouldRetryOnError: false,
      fallbackData: [],
    }
  )

  const count = useMemo(() => likedIds?.length || 0, [likedIds])

  if (asMenuItem) {
    return (
      <LocalizedClientLink
        href="/liked"
        className="py-4 border-b border-gray-200 flex items-center justify-between"
        data-testid="nav-liked-link"
      >
        <div className="flex items-center gap-3">
          <WoodMartIcon iconContent="f106" size={20} />
          <span className="text-sm font-semibold">{label}</span>
        </div>
        {count > 0 && (
          <span className="inline-flex items-center justify-center bg-black text-white text-xs rounded-full px-2 py-0.5">
            {count}
          </span>
        )}
      </LocalizedClientLink>
    )
  }

  if (labelOnly) {
    return (
      <LocalizedClientLink
        href="/liked"
        className="hover:text-ui-fg-base flex items-center gap-2"
        data-testid="nav-liked-link"
      >
        <span className="text-sm">{label}</span>
        {count > 0 && (
          <span className="ml-2 inline-flex items-center justify-center bg-black text-white text-xs rounded-full px-2 py-0.5">
            {count}
          </span>
        )}
      </LocalizedClientLink>
    )
  }

  return (
    <LocalizedClientLink
      href="/liked"
      className="hover:text-ui-fg-base flex items-center relative"
      data-testid="nav-liked-link"
    >
      <WoodMartIcon iconContent="f106" size={20} badge={count} />
    </LocalizedClientLink>
  )
}
