"use server"

import { sdk } from "@lib/config"
import { sortProducts } from "@lib/util/sort-products"
import { HttpTypes } from "@medusajs/types"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { getAuthHeaders, getCacheOptions } from "./cookies"
import { getRegion, retrieveRegion } from "./regions"

export const listProducts = async ({
  pageParam = 1,
  queryParams,
  countryCode,
  regionId,
}: {
  pageParam?: number
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductListParams
  countryCode?: string
  regionId?: string
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductListParams
}> => {
  if (!countryCode && !regionId) {
    throw new Error("Country code or region ID is required")
  }

  const limit = queryParams?.limit || 12
  const _pageParam = Math.max(pageParam, 1)
  const offset = _pageParam === 1 ? 0 : (_pageParam - 1) * limit

  let region: HttpTypes.StoreRegion | undefined | null

  if (countryCode) {
    region = await getRegion(countryCode)
  } else {
    region = await retrieveRegion(regionId!)
  }

  if (!region) {
    return {
      response: { products: [], count: 0 },
      nextPage: null,
    }
  }

  const authHeaders = await getAuthHeaders()
  const headers: Record<string, string> = {
    ...authHeaders,
  }

  // Ensure publishable API key is included if SDK doesn't add it automatically
  if (process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY && !headers['x-publishable-api-key']) {
    headers['x-publishable-api-key'] = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
  }

  const next = {
    ...(await getCacheOptions("products")),
  }

  try {
    const response = await sdk.client.fetch<{ products: HttpTypes.StoreProduct[]; count: number }>(
      `/store/products`,
      {
        method: "GET",
        query: {
          limit,
          offset,
          region_id: region?.id,
          fields:
            "*variants.calculated_price,+variants.inventory_quantity,*variants.images,+metadata,+tags",
          ...queryParams,
        },
        headers,
        next,
        cache: "force-cache",
      }
    )

    const products = response?.products || []
    const count = response?.count || 0

    const nextPage = count > offset + limit ? pageParam + 1 : null

    return {
      response: {
        products,
        count,
      },
      nextPage: nextPage,
      queryParams,
    }
  } catch (error: any) {
    console.error("[listProducts] API Error:", {
      message: error?.message,
      status: error?.status,
      regionId: region?.id,
      countryCode,
      error: error,
    })

    // Return empty response on error
    return {
      response: { products: [], count: 0 },
      nextPage: null,
      queryParams,
    }
  }
}

/**
 * This will fetch 100 products to the Next.js cache and sort them based on the sortBy parameter.
 * It will then return the paginated products based on the page and limit parameters.
 */
export const listProductsWithSort = async ({
  page = 1,
  queryParams,
  sortBy = "created_at",
  countryCode,
}: {
  page?: number
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
  sortBy?: SortOptions
  countryCode: string
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
}> => {
  const limit = queryParams?.limit || 12

  const {
    response: { products, count },
  } = await listProducts({
    pageParam: 1,
    queryParams: {
      ...queryParams,
      limit: 100,
    },
    countryCode,
  })

  const sortedProducts = sortProducts(products, sortBy)

  const pageParam = Math.max((page - 1) * limit, 0)

  const nextPage = count > pageParam + limit ? pageParam + limit : null

  const paginatedProducts = sortedProducts.slice(pageParam, pageParam + limit)

  return {
    response: {
      products: paginatedProducts,
      count,
    },
    nextPage,
    queryParams,
  }
}

export type FilterProductsParams = {
  search?: string
  brand_id?: string
  brand_slug?: string
  category_id?: string | string[]
  category_name?: string | string[]
  rim_style?: string | string[]
  gender?: string | string[]
  shapes?: string | string[]
  size?: string | string[]
  frame_material?: string | string[]
  shape_filter?: string | string[]
  shape?: string | string[]
  min_price?: number
  max_price?: number
  currency_code?: string
  order?: "created_at" | "updated_at" | "title" | "price"
  order_direction?: "asc" | "desc"
  limit?: number
  offset?: number
  include_filter_options?: boolean
}

export type FilterProductsResponse = {
  products: any[]
  count: number
  limit: number
  offset: number
  has_more: boolean
  filter_options?: {
    brands: Array<{ id: string; name: string; slug: string }>
    categories: Array<{ id: string; name: string; handle: string }>
    rim_styles: string[]
    genders: string[]
    shapes: string[]
    sizes: string[]
    frame_materials?: string[]
    shape_filters?: string[]
    shape_values?: string[]
  }
}

export const filterProducts = async ({
  countryCode,
  regionId,
  ...filterParams
}: FilterProductsParams & {
  countryCode?: string
  regionId?: string
}): Promise<FilterProductsResponse> => {
  if (!countryCode && !regionId) {
    throw new Error("Country code or region ID is required")
  }

  let region: HttpTypes.StoreRegion | undefined | null

  if (countryCode) {
    region = await getRegion(countryCode)
  } else {
    region = await retrieveRegion(regionId!)
  }

  if (!region) {
    return {
      products: [],
      count: 0,
      limit: filterParams.limit || 20,
      offset: filterParams.offset || 0,
      has_more: false,
    }
  }

  const authHeaders = await getAuthHeaders()
  const headers: Record<string, string> = {
    ...authHeaders,
  }

  // Ensure publishable API key is included if SDK doesn't add it automatically
  if (process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY && !headers['x-publishable-api-key']) {
    headers['x-publishable-api-key'] = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
  }

  try {
    // Build query parameters
    const query: Record<string, any> = {
      currency_code: filterParams.currency_code || "USD",
      limit: filterParams.limit || 20,
      offset: filterParams.offset || 0,
      include_filter_options: filterParams.include_filter_options || false,
    }

    if (filterParams.search) {
      query.search = filterParams.search
    }
    if (filterParams.brand_id) {
      query.brand_id = filterParams.brand_id
    }
    if (filterParams.brand_slug) {
      query.brand_slug = Array.isArray(filterParams.brand_slug)
        ? filterParams.brand_slug.join(",")
        : filterParams.brand_slug
    }
    if (filterParams.category_id) {
      query.category_id = Array.isArray(filterParams.category_id)
        ? filterParams.category_id.join(",")
        : filterParams.category_id
    }
    if (filterParams.category_name) {
      query.category_name = Array.isArray(filterParams.category_name)
        ? filterParams.category_name.join(",")
        : filterParams.category_name
    }
    if (filterParams.rim_style) {
      query.rim_style = Array.isArray(filterParams.rim_style)
        ? filterParams.rim_style.join(",")
        : filterParams.rim_style
    }
    if (filterParams.gender) {
      query.gender = Array.isArray(filterParams.gender)
        ? filterParams.gender.join(",")
        : filterParams.gender
    }
    if (filterParams.shapes) {
      query.shapes = Array.isArray(filterParams.shapes)
        ? filterParams.shapes.join(",")
        : filterParams.shapes
    }
    if (filterParams.size) {
      query.size = Array.isArray(filterParams.size)
        ? filterParams.size.join(",")
        : filterParams.size
    }
    if (filterParams.frame_material) {
      query.frame_material = Array.isArray(filterParams.frame_material)
        ? filterParams.frame_material.join(",")
        : filterParams.frame_material
    }
    if (filterParams.shape_filter) {
      query.shape_filter = Array.isArray(filterParams.shape_filter)
        ? filterParams.shape_filter.join(",")
        : filterParams.shape_filter
    }
    if (filterParams.shape) {
      query.shape = Array.isArray(filterParams.shape)
        ? filterParams.shape.join(",")
        : filterParams.shape
    }
    if (filterParams.min_price !== undefined) {
      query.min_price = filterParams.min_price
    }
    if (filterParams.max_price !== undefined) {
      query.max_price = filterParams.max_price
    }
    if (filterParams.order) {
      query.order = filterParams.order
    }
    if (filterParams.order_direction) {
      query.order_direction = filterParams.order_direction
    }

    const response = await sdk.client.fetch<FilterProductsResponse>(
      `/store/products/filter`,
      {
        method: "GET",
        query,
        headers,
        cache: "no-store",
      }
    )

    return response || {
      products: [],
      count: 0,
      limit: filterParams.limit || 20,
      offset: filterParams.offset || 0,
      has_more: false,
    }
  } catch (error: any) {
    console.error("[filterProducts] API Error:", {
      message: error?.message,
      status: error?.status,
      regionId: region?.id,
      countryCode,
      error: error,
    })

    return {
      products: [],
      count: 0,
      limit: filterParams.limit || 20,
      offset: filterParams.offset || 0,
      has_more: false,
    }
  }
}

export type ProductAvailabilityResponse = {
  region_available: boolean
  eta: string | null
  product_id: string
  product_title: string
  handle: string
  region: string
  error?: string
  message?: string
}

/**
 * Check product availability in a specific region
 */
export const getProductAvailability = async ({
  handle,
  countryCode,
}: {
  handle: string
  countryCode: string
}): Promise<ProductAvailabilityResponse | null> => {
  try {
    // Convert country code to region code
    // GB -> uk, others -> lowercase
    let regionCode = countryCode.toLowerCase()
    if (countryCode.toUpperCase() === "GB") {
      regionCode = "uk"
    }

    const authHeaders = await getAuthHeaders()
    const headers: Record<string, string> = {
      ...authHeaders,
    }

    // Ensure publishable API key is included
    if (process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY && !headers['x-publishable-api-key']) {
      headers['x-publishable-api-key'] = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
    }

    const next = {
      ...(await getCacheOptions("product-availability")),
    }

    const response = await sdk.client.fetch<ProductAvailabilityResponse>(
      `/store/products/availability`,
      {
        method: "GET",
        query: {
          handle,
          region: regionCode,
        },
        headers,
        next,
        cache: "force-cache",
      }
    )

    return response
  } catch (error: any) {
    console.error("[getProductAvailability] API Error:", {
      message: error?.message,
      status: error?.status,
      handle,
      countryCode,
      error: error,
    })

    return null
  }
}

/**
 * Fetch products by their IDs (optimized for recently viewed products)
 */
export const getProductsByIds = async ({
  productIds,
  countryCode,
  regionId,
}: {
  productIds: string[]
  countryCode?: string
  regionId?: string
}): Promise<HttpTypes.StoreProduct[]> => {
  if (!productIds || productIds.length === 0) {
    return []
  }

  if (!countryCode && !regionId) {
    throw new Error("Country code or region ID is required")
  }

  let region: HttpTypes.StoreRegion | undefined | null

  if (countryCode) {
    region = await getRegion(countryCode)
  } else {
    region = await retrieveRegion(regionId!)
  }

  if (!region) {
    return []
  }

  const authHeaders = await getAuthHeaders()
  const headers: Record<string, string> = {
    ...authHeaders,
  }

  // Ensure publishable API key is included
  if (process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY && !headers['x-publishable-api-key']) {
    headers['x-publishable-api-key'] = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
  }

  const next = {
    ...(await getCacheOptions("products")),
  }

  try {
    const response = await sdk.client.fetch<{ products: HttpTypes.StoreProduct[] }>(
      `/store/products`,
      {
        method: "GET",
        query: {
          id: productIds,
          limit: productIds.length,
          region_id: region.id,
          fields: "id,title,handle,thumbnail,images",
        },
        headers,
        next,
        cache: "force-cache",
      }
    )

    return response?.products || []
  } catch (error: any) {
    console.error("[getProductsByIds] API Error:", {
      message: error?.message,
      status: error?.status,
      productIds,
      regionId: region?.id,
      countryCode,
      error: error,
    })

    return []
  }
}