"use client"

import { addToCart } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import { Button } from "@medusajs/ui"
import { useState } from "react"

type AddToCartButtonProps = {
  product: HttpTypes.StoreProduct
  countryCode: string
}

export default function AddToCartButton({
  product,
  countryCode,
}: AddToCartButtonProps) {
  const [isAdding, setIsAdding] = useState(false)

  // Get the first available variant
  const firstVariant = product.variants?.[0]

  // Check if variant is in stock
  const inStock = (() => {
    if (!firstVariant) return false
    // If we don't manage inventory, we can always add to cart
    if (!firstVariant.manage_inventory) return true
    // If we allow back orders, we can add to cart
    if (firstVariant.allow_backorder) return true
    // If there is inventory available, we can add to cart
    if ((firstVariant.inventory_quantity || 0) > 0) return true
    return false
  })()

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!firstVariant?.id || !inStock) return

    setIsAdding(true)

    try {
      await addToCart({
        variantId: firstVariant.id,
        quantity: 1,
        countryCode,
      })
    } catch (error) {
      console.error("Failed to add to cart:", error)
    } finally {
      setIsAdding(false)
    }
  }

  if (!firstVariant) {
    return null
  }

  return (
    <div className="flex justify-center mt-2">
      <Button
        onClick={handleAddToCart}
        disabled={!inStock || isAdding}
        variant="secondary"
        size="small"
        className="bg-black text-white hover:bg-black/90 disabled:bg-gray-400 disabled:text-gray-200"
        isLoading={isAdding}
        data-testid="add-to-cart-button"
      >
        {!inStock ? "Out of stock" : "Add to cart"}
      </Button>
    </div>
  )
}

