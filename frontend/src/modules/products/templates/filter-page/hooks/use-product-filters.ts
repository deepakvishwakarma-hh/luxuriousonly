"use client"

import { useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import useSWR from "swr"
import { FilterProductsResponse } from "@lib/data/products"

const fetcher = async (url: string): Promise<FilterProductsResponse> => {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY && {
        "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
      }),
    },
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch products: ${response.statusText}`)
  }

  return response.json()
}

type FilterParams = {
  search: string
  brand: string[]
  category: string[]
  rimStyle: string[]
  gender: string[]
  shapes: string[]
  size: string[]
  frameMaterial: string[]
  shapeFilter: string[]
  shape: string[]
  minPrice?: string | null
  maxPrice?: string | null
  order: string
  orderDirection: string
  page: number
}

export function useProductFilters(
  filters: FilterParams,
  initialData?: FilterProductsResponse
) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Build API URL
  const apiUrl = useMemo(() => {
    const queryParams = new URLSearchParams()
    if (filters.search) queryParams.set("search", filters.search)
    filters.brand.forEach((v) => queryParams.append("brand_slug", v))
    filters.category.forEach((v) => queryParams.append("category_name", v))
    filters.rimStyle.forEach((v) => queryParams.append("rim_style", v))
    filters.gender.forEach((v) => queryParams.append("gender", v))
    filters.shapes.forEach((v) => queryParams.append("shapes", v))
    filters.size.forEach((v) => queryParams.append("size", v))
    filters.frameMaterial.forEach((v) => queryParams.append("frame_material", v))
    filters.shapeFilter.forEach((v) => queryParams.append("shape_filter", v))
    filters.shape.forEach((v) => queryParams.append("shape", v))
    if (filters.minPrice) queryParams.set("min_price", filters.minPrice)
    if (filters.maxPrice) queryParams.set("max_price", filters.maxPrice)
    queryParams.set("order", filters.order)
    queryParams.set("order_direction", filters.orderDirection)
    queryParams.set("limit", "20")
    queryParams.set("offset", String((filters.page - 1) * 20))
    queryParams.set("include_filter_options", "true")

    const backendUrl = process.env.MEDUSA_BACKEND_URL
    if (!backendUrl) {
      return null
    }

    return `${backendUrl}/store/products/filter?${queryParams.toString()}`
  }, [filters])

  // Use SWR to fetch data
  const { data, error, isLoading, mutate } = useSWR<FilterProductsResponse>(
    apiUrl,
    fetcher,
    {
      fallbackData: initialData,
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 2000,
    }
  )

  // Update URL with filters
  const updateFilters = (updates: Record<string, string | string[] | null>) => {
    const params = new URLSearchParams(searchParams.toString())

    // Reset to first page when filters change (except when updating page itself)
    if (!updates.page) {
      params.delete("page")
    }

    Object.entries(updates).forEach(([key, value]) => {
      if (
        value === null ||
        value === "" ||
        (Array.isArray(value) && value.length === 0)
      ) {
        params.delete(key)
      } else if (Array.isArray(value)) {
        params.delete(key)
        value.forEach((v) => params.append(key, v))
      } else {
        params.set(key, value)
      }
    })

    router.push(`?${params.toString()}`)
  }

  const handleFilterChange = (key: string, value: string, isMulti = false) => {
    if (isMulti) {
      const current = searchParams.getAll(key)
      const newValue = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value]
      updateFilters({ [key]: newValue })
    } else {
      updateFilters({ [key]: value || null })
    }
  }

  const handleSortChange = (order: string, direction: string) => {
    updateFilters({ order, order_direction: direction })
  }

  const clearFilters = () => {
    router.push("?")
  }

  return {
    data,
    error,
    isLoading,
    mutate,
    updateFilters,
    handleFilterChange,
    handleSortChange,
    clearFilters,
  }
}

