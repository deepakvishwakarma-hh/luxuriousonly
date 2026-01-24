"use client"

import React, { useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"

interface ProductOption {
    id: string
    size: string
    color: string
    handle: string
    thumbnail: string
}

interface ProductOptionsProps {
    options: ProductOption[]
    activeProductId: string
}

const ProductOptions = ({ options, activeProductId }: ProductOptionsProps) => {
    const params = useParams()
    const countryCode = params.countryCode as string

    // Get active product info by id
    const activeProduct = useMemo(() => {
        const found = options.find((o) => o.id === activeProductId)
        return found || options[0]
    }, [activeProductId, options])

    // Unique sizes, preserve order
    const sizes = useMemo(() => {
        const seen = new Set<string>()
        return options
            .map((opt) => opt.size)
            .filter((size) => {
                if (!seen.has(size)) {
                    seen.add(size)
                    return true
                }
                return false
            })
    }, [options])

    // Colors available for active product's size
    const colorsForActiveSize = useMemo(() => {
        if (!activeProduct) return []
        return options.filter((opt) => opt.size === activeProduct.size)
    }, [options, activeProduct])

    // Get href for size - try to find product with same color as active, otherwise use first available
    const getSizeHref = (size: string) => {
        if (size === activeProduct.size) return null // Already on this size

        // Try to find product with same color as active product
        const sameColorProduct = options.find(
            (opt) => opt.size === size && opt.color === activeProduct.color
        )

        // If found, use it; otherwise use first product with that size
        const targetProduct = sameColorProduct || options.find((opt) => opt.size === size)

        return targetProduct ? `/${countryCode}/products/${targetProduct.handle}` : null
    }

    // Get href for color - navigate to product with active size and selected color
    const getColorHref = (color: string) => {
        if (color === activeProduct.color) return null // Already on this color

        const targetProduct = options.find(
            (opt) => opt.size === activeProduct.size && opt.color === color
        )

        return targetProduct ? `/${countryCode}/products/${targetProduct.handle}` : null
    }

    if (!activeProduct || sizes.length === 0) {
        return null
    }

    return (
        <div className="space-y-6 py-4 border-t border-gray-200">

            {/* Color Selection */}
            {colorsForActiveSize.length > 0 && (
                <div className="flex flex-col gap-y-3">
                    <span className="text-sm font-medium text-gray-500 uppercase">
                        Select Colors
                    </span>
                    <div className="flex flex-wrap gap-3">
                        {colorsForActiveSize.map((opt) => {
                            const isActive = opt.color === activeProduct.color
                            const href = getColorHref(opt.color)
                            const className = `relative group transition-all rounded-lg overflow-hidden ${isActive
                                ? "ring-2 ring-black ring-offset-2"
                                : "border border-gray-300 hover:border-gray-400 hover:shadow-md"
                                }`

                            const content = (
                                <>
                                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-md overflow-hidden bg-gray-50">
                                        <Image
                                            src={opt.thumbnail}
                                            alt={opt.color}
                                            fill
                                            className="object-contain"
                                            sizes="(max-width: 640px) 64px, 80px"
                                        />
                                    </div>
                                </>
                            )

                            if (isActive || !href) {
                                return (
                                    <div
                                        key={opt.color}
                                        className={className}
                                        title={opt.color}
                                    >
                                        {content}
                                    </div>
                                )
                            }

                            return (
                                <Link
                                    key={opt.color}
                                    href={href}
                                    className={className}
                                    title={opt.color}
                                >
                                    {content}
                                </Link>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Size Selection */}
            <div className="flex flex-col gap-y-3">
                <span className="text-sm font-medium text-gray-500 uppercase">
                    Select Size
                </span>
                <div className="flex flex-wrap gap-2">
                    {sizes.map((size) => {
                        const isActive = size === activeProduct.size
                        const href = getSizeHref(size)
                        const className = `border text-sm font-medium h-10 rounded-full px-5 transition-all flex items-center justify-center ${isActive
                            ? "border-black bg-white text-black shadow-sm"
                            : "border-gray-300 bg-gray-50 text-gray-700 hover:border-gray-400 hover:bg-gray-100 hover:shadow-sm"
                            }`

                        if (isActive || !href) {
                            return (
                                <span
                                    key={size}
                                    className={className}
                                >
                                    {size}
                                </span>
                            )
                        }

                        return (
                            <Link
                                key={size}
                                href={href}
                                className={className}
                            >
                                {size}
                            </Link>
                        )
                    })}
                </div>
            </div>

        </div>
    )
}

export default ProductOptions