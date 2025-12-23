"use client"

import { useMemo, useState, useEffect } from "react"

type PriceRange = {
  min: number
  max: number
}

type UsePriceRangeProps = {
  products: any[]
  minPriceFilter?: string | null
  maxPriceFilter?: string | null
  onPriceChange: (min: number, max: number) => void
}

export function usePriceRange({
  products,
  minPriceFilter,
  maxPriceFilter,
  onPriceChange,
}: UsePriceRangeProps) {
  // Calculate price range from products (prices are in cents, convert to dollars)
  const priceRange = useMemo<PriceRange>(() => {
    const prices = products
      .map((p: any) => p.price)
      .filter((p: number | null | undefined) => p != null && p !== undefined)
      .map((p: number) => p / 100) // Convert from cents to dollars

    if (prices.length === 0) {
      return { min: 0, max: 1000 } // Default range if no products
    }

    const min = Math.floor(Math.min(...prices))
    const max = Math.ceil(Math.max(...prices))

    // Ensure we have a reasonable range
    const rangeMin = Math.max(0, min)
    const rangeMax = Math.max(rangeMin + 10, max)

    return { min: rangeMin, max: rangeMax }
  }, [products])

  // Initialize price range state
  // Note: URL params store prices in cents, but UI slider uses dollars
  const [priceValues, setPriceValues] = useState<number[]>(() => {
    const min = minPriceFilter
      ? parseFloat(minPriceFilter) / 100
      : priceRange.min
    const max = maxPriceFilter
      ? parseFloat(maxPriceFilter) / 100
      : priceRange.max
    return [min, max]
  })

  // Update price values when filters or price range changes
  useEffect(() => {
    // Convert from cents (URL) to dollars (UI)
    let min = minPriceFilter
      ? parseFloat(minPriceFilter) / 100
      : priceRange.min
    let max = maxPriceFilter
      ? parseFloat(maxPriceFilter) / 100
      : priceRange.max

    // Clamp values to valid range
    min = Math.max(priceRange.min, Math.min(priceRange.max, min))
    max = Math.max(priceRange.min, Math.min(priceRange.max, max))

    // Ensure min <= max
    if (min > max) {
      min = priceRange.min
      max = priceRange.max
    }

    setPriceValues((prevValues) => {
      // Only update if values have actually changed to avoid unnecessary re-renders
      if (prevValues[0] !== min || prevValues[1] !== max) {
        return [min, max]
      }
      return prevValues
    })
  }, [minPriceFilter, maxPriceFilter, priceRange.min, priceRange.max])

  const handlePriceChange = (min: number, max: number) => {
    setPriceValues([min, max])
    // Convert dollars to cents (backend expects prices in cents)
    onPriceChange(Math.round(min * 100), Math.round(max * 100))
  }

  return {
    priceRange,
    priceValues,
    handlePriceChange,
  }
}

