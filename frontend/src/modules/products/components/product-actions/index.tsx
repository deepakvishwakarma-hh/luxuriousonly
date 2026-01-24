"use client"

import { addToCart } from "@lib/data/cart"
import { useIntersection } from "@lib/hooks/use-in-view"
import { HttpTypes } from "@medusajs/types"
import { Button } from "@medusajs/ui"
import Divider from "@modules/common/components/divider"
import OptionSelect from "@modules/products/components/product-actions/option-select"
import { isEqual } from "lodash"
import { useParams, usePathname, useSearchParams } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import ProductPrice from "../product-price"
import MobileActions from "./mobile-actions"
import { useRouter } from "next/navigation"
import Heart from "@modules/common/icons/heart"
import {
  addToLikedAPI,
  removeFromLikedAPI,
  getLikedProductIdsFromAPI,
} from "@lib/util/liked-api"
import ProductOptions from "../product-options"

type ProductActionsProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  productOptions: any[]
  activeProductId: string
  disabled?: boolean
}

const optionsAsKeymap = (
  variantOptions: HttpTypes.StoreProductVariant["options"]
) => {
  return variantOptions?.reduce((acc: Record<string, string>, varopt: any) => {
    acc[varopt.option_id] = varopt.value
    return acc
  }, {})
}

export default function ProductActions({
  product,
  disabled,
  productOptions,
  activeProductId,
}: ProductActionsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [options, setOptions] = useState<Record<string, string | undefined>>({})
  const [isAdding, setIsAdding] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [isLiked, setIsLiked] = useState(false)
  const [isCheckingLiked, setIsCheckingLiked] = useState(true)
  const [isTogglingLiked, setIsTogglingLiked] = useState(false)
  const countryCode = useParams().countryCode as string

  // Reset initialization flag when product changes
  useEffect(() => {
    hasInitializedVariant.current = false
  }, [product.id])

  // Automatically select the first variant optimistically
  useEffect(() => {
    if (
      product.variants &&
      product.variants.length > 0 &&
      !hasInitializedVariant.current
    ) {
      // Check if there's a variant ID in URL params
      const variantIdFromUrl = searchParams.get("v_id")

      // If URL has a variant ID, find and select that variant
      if (variantIdFromUrl) {
        const variantFromUrl = product.variants.find(
          (v) => v.id === variantIdFromUrl
        )
        if (variantFromUrl) {
          const variantOptions = optionsAsKeymap(variantFromUrl.options)
          setOptions(variantOptions ?? {})
          hasInitializedVariant.current = true
          return
        }
      }

      // Auto-select the first variant optimistically
      const firstVariant = product.variants[0]
      const variantOptions = optionsAsKeymap(firstVariant.options)
      setOptions(variantOptions ?? {})
      hasInitializedVariant.current = true
    }
  }, [product.variants, product.id, searchParams])

  // Check if product is liked
  useEffect(() => {
    const checkLikedStatus = async () => {
      setIsCheckingLiked(true)
      try {
        const likedIds = await getLikedProductIdsFromAPI()
        setIsLiked(likedIds.includes(product.id))
      } catch (error) {
        console.error("Error checking liked status:", error)
        setIsLiked(false)
      } finally {
        setIsCheckingLiked(false)
      }
    }

    checkLikedStatus()

    // Listen for liked updates from other components
    const handleLikedUpdate = () => {
      checkLikedStatus()
    }

    window.addEventListener("likedUpdated", handleLikedUpdate)

    return () => {
      window.removeEventListener("likedUpdated", handleLikedUpdate)
    }
  }, [product.id])

  const selectedVariant = useMemo(() => {
    if (!product.variants || product.variants.length === 0) {
      return
    }

    return product.variants.find((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

  // update the options when a variant is selected
  const setOptionValue = (optionId: string, value: string) => {
    setOptions((prev) => ({
      ...prev,
      [optionId]: value,
    }))
  }

  //check if the selected options produce a valid variant
  const isValidVariant = useMemo(() => {
    return product.variants?.some((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    const value = isValidVariant ? selectedVariant?.id : null

    if (params.get("v_id") === value) {
      return
    }

    if (value) {
      params.set("v_id", value)
    } else {
      params.delete("v_id")
    }

    router.replace(pathname + "?" + params.toString())
  }, [selectedVariant, isValidVariant])

  // check if the selected variant is in stock
  const inStock = useMemo(() => {
    // If we don't manage inventory, we can always add to cart
    if (selectedVariant && !selectedVariant.manage_inventory) {
      return true
    }

    // If we allow back orders on the variant, we can add to cart
    if (selectedVariant?.allow_backorder) {
      return true
    }

    // If there is inventory available, we can add to cart
    if (
      selectedVariant?.manage_inventory &&
      (selectedVariant?.inventory_quantity || 0) > 0
    ) {
      return true
    }

    // Otherwise, we can't add to cart
    return false
  }, [selectedVariant])

  const actionsRef = useRef<HTMLDivElement>(null)
  const hasInitializedVariant = useRef(false)

  const inView = useIntersection(actionsRef, "0px")

  // add the selected variant to the cart
  const handleAddToCart = async () => {
    if (!selectedVariant?.id) return null

    setIsAdding(true)

    await addToCart({
      variantId: selectedVariant.id,
      quantity: quantity,
      countryCode,
    })

    setIsAdding(false)
  }

  // handle quantity changes
  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity)
    }
  }

  const incrementQuantity = () => {
    if (quantity < 10) {
      setQuantity(quantity + 1)
    }
  }

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  // Handle wishlist toggle
  const handleToggleWishlist = async () => {
    if (isTogglingLiked || isCheckingLiked) return

    setIsTogglingLiked(true)
    const previousLikedState = isLiked
    setIsLiked(!previousLikedState)

    try {
      let success = false
      if (previousLikedState) {
        success = await removeFromLikedAPI(product.id)
      } else {
        success = await addToLikedAPI(product.id)
      }

      if (!success) {
        setIsLiked(previousLikedState)
      } else {
        const likedIds = await getLikedProductIdsFromAPI()
        setIsLiked(likedIds.includes(product.id))
        // Notify other components (header count, buttons) that liked products changed
        try {
          window.dispatchEvent(new Event("likedUpdated"))
        } catch (e) {
          // ignore if window is not available for any reason
        }
      }
    } catch (error) {
      console.error("Failed to toggle wishlist:", error)
      setIsLiked(previousLikedState)
    } finally {
      setIsTogglingLiked(false)
    }
  }

  return (
    <>
      <div className="flex flex-col gap-y-2 mt-2" ref={actionsRef}>
        <ProductPrice product={product} variant={selectedVariant} />
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide">
            Condition:
          </span>
          <span className="text-sm sm:text-base font-semibold text-gray-900 font-urbanist">
            {(product?.metadata?.condition as string) ?? "N/A"}
          </span>
        </div>
        <div>
          {/* @ts-ignore */}
          <ProductOptions options={productOptions} activeProductId={activeProductId} />
        </div>
        <div>
          {(product.variants?.length ?? 0) > 1 && (
            <div className="flex flex-col gap-y-4">
              {(product.options || []).map((option) => {
                return (
                  <div key={option.id}>
                    <OptionSelect
                      option={option}
                      current={options[option.id]}
                      updateOption={setOptionValue}
                      title={option.title ?? ""}
                      data-testid="product-options"
                      disabled={!!disabled || isAdding}
                    />
                  </div>
                )
              })}
              <Divider />
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Quantity Selector */}
          <div className="flex items-center border border-gray-300 rounded-full overflow-hidden">
            <button
              type="button"
              onClick={decrementQuantity}
              disabled={quantity <= 1 || !!disabled || isAdding}
              className="px-3 py-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <input
              type="number"
              min="1"
              max="10"
              value={quantity}
              onChange={(e) => {
                const value = parseInt(e.target.value, 10)
                if (!isNaN(value)) {
                  handleQuantityChange(value)
                }
              }}
              disabled={!!disabled || isAdding}
              className="w-12 text-center border-0 focus:ring-0 focus:outline-none disabled:bg-white disabled:opacity-50"
              aria-label="Quantity"
            />
            <button
              type="button"
              onClick={incrementQuantity}
              disabled={quantity >= 10 || !!disabled || isAdding}
              className="px-3 py-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          {/* Add to Cart Button */}
          <Button
            onClick={handleAddToCart}
            disabled={
              !inStock ||
              !selectedVariant ||
              !!disabled ||
              isAdding ||
              !isValidVariant
            }
            variant="primary"
            className="flex-1 h-10 rounded-full"
            isLoading={isAdding}
            data-testid="add-product-button"
          >
            {!selectedVariant && !options
              ? "Select variant"
              : !inStock || !isValidVariant
                ? "Out of stock"
                : "Add to cart"}
          </Button>
        </div>

        {/* Add to Wish List Button */}
        <div className="flex items-center justify-center gap-2 py-1">
          <button
            onClick={handleToggleWishlist}
            disabled={isTogglingLiked || isCheckingLiked}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors self-start"
            aria-label={isLiked ? "Remove from wish list" : "Add to wish list"}
            data-testid="wishlist-button"
          >
            <span className={isLiked ? "text-red-500" : ""}>
              <Heart size="16" color={isLiked ? "#ef4444" : "currentColor"} />
            </span>
            <span className="underline">
              {isLiked ? "Remove from Wish List" : "Add to Wish List"}
            </span>
          </button>
        </div>
        <MobileActions
          product={product}
          variant={selectedVariant}
          options={options}
          updateOptions={setOptionValue}
          inStock={inStock}
          handleAddToCart={handleAddToCart}
          isAdding={isAdding}
          show={!inView}
          optionsDisabled={!!disabled || isAdding}
          quantity={quantity}
          onQuantityChange={handleQuantityChange}
          onIncrement={incrementQuantity}
          onDecrement={decrementQuantity}
          quantityDisabled={!!disabled || isAdding}
        />
      </div>
    </>
  )
}
