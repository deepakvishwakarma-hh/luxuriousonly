"use server"

import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { getCacheOptions } from "./cookies"

export type Brand = {
    id: string
    name: string
    slug?: string | null
    description?: string | null
    meta_title?: string | null
    meta_desc?: string | null
    image_url?: string | null
    products?: HttpTypes.StoreProduct[]
    created_at?: Date
    updated_at?: Date
}

export const listBrands = async (query?: Record<string, any>) => {
    const next = {
        ...(await getCacheOptions("brands")),
    }

    const limit = query?.limit || 100
    const offset = query?.offset || 0

    return sdk.client
        .fetch<{ brands: Brand[]; count: number; limit: number; offset: number }>(
            "/store/brands",
            {
                query: {
                    fields: "*products",
                    limit,
                    offset,
                    ...query,
                },
                next,
                cache: "force-cache",
            }
        )
        .then(({ brands, count }) => ({
            brands: brands || [],
            count: count || 0,
        }))
}

export const getBrandBySlug = async (slug: string) => {
    const next = {
        ...(await getCacheOptions("brands")),
    }

    return sdk.client
        .fetch<{ brands: Brand[] }>("/store/brands", {
            query: {
                fields: "*products",
                filters: {
                    slug,
                },
            },
            next,
            cache: "force-cache",
        })
        .then(({ brands }) => brands?.[0] || null)
}

export const getBrandById = async (id: string) => {
    const next = {
        ...(await getCacheOptions("brands")),
    }

    return sdk.client
        .fetch<{ brands: Brand[] }>("/store/brands", {
            query: {
                fields: "*products",
                filters: {
                    id,
                },
            },
            next,
            cache: "force-cache",
        })
        .then(({ brands }) => brands?.[0] || null)
}

export const getBrandProductsBySlug = async (slug: string) => {
    const next = {
        ...(await getCacheOptions("brands")),
    }

    return sdk.client
        .fetch<{ brand: Brand; products: HttpTypes.StoreProduct[] }>(
            `/store/brands/${slug}`,
            {
                next,
                cache: "force-cache",
            }
        )
        .then(({ brand, products }) => ({
            brand,
            products: products || [],
        }))
}

