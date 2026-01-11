import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { updateProductsWorkflow } from "@medusajs/medusa/core-flows"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { z } from "zod"

// Schema for price update request - exported for middleware
export const UpdateVariantPricesSchema = z.object({
  prices: z.array(
    z.object({
      amount: z.number().int().positive(),
      currency_code: z.string().min(2).max(3),
    })
  ),
})

export async function PUT(
  req: MedusaRequest<z.infer<typeof UpdateVariantPricesSchema>>,
  res: MedusaResponse
) {
  try {
    const { variantId } = req.params
    const { prices } = req.validatedBody

    if (!variantId) {
      return res.status(400).json({
        message: "Variant ID is required",
      })
    }

    if (!prices || prices.length === 0) {
      return res.status(400).json({
        message: "At least one price is required",
      })
    }

    console.log(`Updating prices for variant ${variantId}`)
    console.log(`Prices to update:`, prices)

    // First, query the variant to get its product ID
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
    const { data: variants } = await query.graph({
      entity: "product_variant",
      fields: [
        "id",
        "product_id",
        "sku",
        "title",
      ],
      filters: {
        id: variantId,
      },
    })

    if (!variants || variants.length === 0) {
      return res.status(404).json({
        message: "Variant not found",
      })
    }

    const variant = variants[0] as any
    const productId = variant.product_id

    if (!productId) {
      return res.status(404).json({
        message: "Product ID not found for this variant",
      })
    }

    // Update variant prices using updateProductsWorkflow
    const result = await updateProductsWorkflow(req.scope).run({
      input: {
        products: [
          {
            id: productId,
            variants: [
              {
                id: variantId,
                prices: prices, // [{ amount, currency_code }]
              },
            ],
          },
        ],
      },
    })

    console.log(`Successfully updated prices for variant ${variantId}`)

    // Query the updated variant to return current prices
    const { data: updatedVariants } = await query.graph({
      entity: "product_variant",
      fields: [
        "id",
        "sku",
        "title",
        "price_set.prices.amount",
        "price_set.prices.currency_code",
      ],
      filters: {
        id: variantId,
      },
    })

    if (!updatedVariants || updatedVariants.length === 0) {
      return res.status(404).json({
        message: "Variant not found after update",
      })
    }

    const updatedVariant = updatedVariants[0] as any
    const updatedPrices = updatedVariant.price_set?.prices || []

    return res.status(200).json({
      success: true,
      message: `Successfully updated prices for variant ${variantId}`,
      variant: {
        id: updatedVariant.id,
        sku: updatedVariant.sku,
        title: updatedVariant.title,
        prices: updatedPrices.map((p: any) => ({
          amount: p.amount,
          currency_code: p.currency_code,
          formatted: `${(p.amount / 100).toFixed(2)} ${p.currency_code.toUpperCase()}`,
        })),
      },
    })
  } catch (error) {
    console.error("Error updating variant prices:", error)
    const statusCode = error instanceof Error && error.message.includes("not found") ? 404 : 500
    return res.status(statusCode).json({
      message: error instanceof Error ? error.message : "An error occurred while updating variant prices",
      error: process.env.NODE_ENV === "development" ? String(error) : undefined,
    })
  }
}

// GET endpoint to retrieve current prices for a variant
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  try {
    const { variantId } = req.params

    if (!variantId) {
      return res.status(400).json({
        message: "Variant ID is required",
      })
    }

    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
    const { data: variants } = await query.graph({
      entity: "product_variant",
      fields: [
        "id",
        "sku",
        "title",
        "price_set.prices.amount",
        "price_set.prices.currency_code",
      ],
      filters: {
        id: variantId,
      },
    })

    if (!variants || variants.length === 0) {
      return res.status(404).json({
        message: "Variant not found",
      })
    }

    const variant = variants[0] as any
    const prices = variant.price_set?.prices || []

    return res.status(200).json({
      variant: {
        id: variant.id,
        sku: variant.sku,
        title: variant.title,
        prices: prices.map((p: any) => ({
          amount: p.amount,
          currency_code: p.currency_code,
          formatted: `${(p.amount / 100).toFixed(2)} ${p.currency_code.toUpperCase()}`,
        })),
      },
    })
  } catch (error) {
    console.error("Error fetching variant prices:", error)
    return res.status(500).json({
      message: error instanceof Error ? error.message : "An error occurred while fetching variant prices",
    })
  }
}
