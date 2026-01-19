import type {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { createProductQueryWorkflow } from "../../../workflows/create-product-query"
import { z } from "zod"

export const PostStoreProductQuerySchema = z.object({
  type: z.enum(["question", "custom_delivery", "customize_product"]).optional(),
  product_id: z.string().optional(),
  customer_name: z.string().optional(),
  customer_email: z.string().email().optional(),
  customer_mobile: z.string().optional(),
  subject: z.string().nullable().optional(),
  message: z.string().optional(),
  address: z.object({
    address_1: z.string().optional(),
    address_2: z.string().nullable().optional(),
    city: z.string().optional(),
    state: z.string().nullable().optional(),
    postal_code: z.string().optional(),
    country: z.string().optional(),
    country_code: z.string().nullable().optional(),
  }).nullable().optional(),
})

type PostStoreProductQueryReq = z.infer<typeof PostStoreProductQuerySchema>

export const POST = async (
  req: MedusaRequest<PostStoreProductQueryReq>,
  res: MedusaResponse
) => {
  try {
    const input = req.validatedBody

    const { result } = await createProductQueryWorkflow(req.scope)
      .run({
        input: {
          ...input,
          status: "new",
        },
      })

    res.json(result)
  } catch (error) {
    console.error("Error creating product query:", error)
    res.status(500).json({
      message: error instanceof Error ? error.message : "An error occurred while creating the product query",
    })
  }
}

