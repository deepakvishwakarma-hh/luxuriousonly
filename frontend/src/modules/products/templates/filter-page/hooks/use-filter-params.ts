"use client"

import { useMemo } from "react"
import { useSearchParams } from "next/navigation"

export function useFilterParams() {
  const searchParams = useSearchParams()

  return useMemo(() => {
    const pageParam = searchParams.get("page")
    const page = pageParam ? parseInt(pageParam) : 1

    return {
      search: searchParams.get("search") || "",
      brand: searchParams.getAll("brand"),
      category: searchParams.getAll("category"),
      rimStyle: searchParams.getAll("rim_style"),
      gender: searchParams.getAll("gender"),
      shapes: searchParams.getAll("shapes"),
      size: searchParams.getAll("size"),
      frameMaterial: searchParams.getAll("frame_material"),
      shapeFilter: searchParams.getAll("shape_filter"),
      shape: searchParams.getAll("shape"),
      minPrice: searchParams.get("min_price"),
      maxPrice: searchParams.get("max_price"),
      order: searchParams.get("order") || "created_at",
      orderDirection: searchParams.get("order_direction") || "desc",
      page,
    }
  }, [searchParams])
}

