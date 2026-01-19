import {
  createStep,
  StepResponse,
} from "@medusajs/framework/workflows-sdk"
import { PRODUCT_QUERY_MODULE } from "../../modules/product_query"
import ProductQueryModuleService from "../../modules/product_query/service"

export type CreateProductQueryStepInput = {
  type?: "question" | "custom_delivery" | "customize_product" | null
  product_id?: string | null
  customer_name?: string | null
  customer_email?: string | null
  customer_mobile?: string | null
  subject?: string | null
  message?: string | null
  address?: {
    address_1?: string | null
    address_2?: string | null
    city?: string | null
    state?: string | null
    postal_code?: string | null
    country?: string | null
    country_code?: string | null
  } | null
  status?: "new" | "read" | "responded"
}

export const createProductQueryStep = createStep(
  "create-product-query",
  async (input: CreateProductQueryStepInput, { container }) => {
    const productQueryModuleService: ProductQueryModuleService = container.resolve(
      PRODUCT_QUERY_MODULE
    )

    const productQuery = await productQueryModuleService.createProductQueries(input)

    return new StepResponse(productQuery, productQuery.id)
  },
  async (productQueryId, { container }) => {
    if (!productQueryId) {
      return
    }

    const productQueryModuleService: ProductQueryModuleService = container.resolve(
      PRODUCT_QUERY_MODULE
    )

    await productQueryModuleService.deleteProductQueries(productQueryId)
  }
)

