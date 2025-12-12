"use client"

import { useState, useEffect } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import WoodMartIcon from "@modules/common/icons/woodmart-icon"
import { getCompareCount } from "@lib/util/compare-cookies"

export default function CompareButton() {
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
