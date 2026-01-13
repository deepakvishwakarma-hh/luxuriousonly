"use client"

import { useState, useEffect } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import WoodMartIcon from "@modules/common/icons/woodmart-icon"
import { getCompareCount } from "@lib/util/compare-cookies"

type CompareButtonProps = {
  labelOnly?: boolean
  label?: string
  asMenuItem?: boolean
}

export default function CompareButton({ labelOnly = false, label = "Compare", asMenuItem = false }: CompareButtonProps) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    // Get initial count from cookies
    setCount(getCompareCount())

    // Listen for custom compareUpdated event
    const handleCompareUpdate = () => {
      setCount(getCompareCount())
    }

    window.addEventListener("compareUpdated", handleCompareUpdate)

    // Also poll periodically as fallback (in case event doesn't fire)
    const interval = setInterval(() => {
      const newCount = getCompareCount()
      setCount((prevCount) => {
        if (newCount !== prevCount) {
          return newCount
        }
        return prevCount
      })
    }, 1000)

    return () => {
      window.removeEventListener("compareUpdated", handleCompareUpdate)
      clearInterval(interval)
    }
  }, [])

  if (asMenuItem) {
    return (
      <LocalizedClientLink
        href="/compare"
        className="py-4 border-b border-gray-200 flex items-center justify-between"
        data-testid="nav-compare-link"
      >
        <div className="flex items-center gap-3">
          <WoodMartIcon iconContent="f128" size={20} />
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
        href="/compare"
        className="hover:text-ui-fg-base flex items-center gap-2"
        data-testid="nav-compare-link"
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
      href="/compare"

      className="hover:text-ui-fg-base flex items-center relative"
      data-testid="nav-compare-link"
    >
      <WoodMartIcon iconContent="f128" size={20} badge={count} />
    </LocalizedClientLink>
  )
}
