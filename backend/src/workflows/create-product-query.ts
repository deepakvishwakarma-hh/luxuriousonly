import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { createProductQueryStep, CreateProductQueryStepInput } from "./steps/create-product-query"
import { useQueryGraphStep } from "@medusajs/medusa/core-flows"

type CreateProductQueryInput = {
  type?: "question" | "custom_delivery" | "customize_product"
  product_id?: string
  customer_name?: string
  customer_email?: string
  customer_mobile?: string
  subject?: string | null
  message?: string
  address?: {
    address_1?: string
    address_2?: string | null
    city?: string
    state?: string | null
    postal_code?: string
    country?: string
    country_code?: string | null
  } | null
  status?: "new" | "read" | "responded"
}

export const createProductQueryWorkflow = createWorkflow(
  "create-product-query",
  (input: CreateProductQueryInput) => {
    // Check product exists if product_id is provided
    if (input.product_id) {
      // @ts-ignore
      useQueryGraphStep({
        entity: "product",
        fields: ["id"],
        filters: {
          id: input.product_id,
        },
        options: {
          throwIfKeyNotFound: true,
        },
      })
    }

    // All fields are now nullable, so we can pass them as-is
    const stepInput: CreateProductQueryStepInput = {
      type: input.type ?? null,
      product_id: input.product_id ?? null,
      customer_name: input.customer_name ?? null,
      customer_email: input.customer_email ?? null,
      customer_mobile: input.customer_mobile ?? null,
      subject: input.subject ?? null,
      message: input.message ?? null,
      address: input.address ?? null,
      status: input.status ?? "new",
    }

    // Create the product query
    const productQuery = createProductQueryStep(stepInput)

    // @ts-ignore
    return new WorkflowResponse({
      product_query: productQuery,
    })
  }
)

