import {
    createStep,
    StepResponse,
} from "@medusajs/framework/workflows-sdk"
import { PRODUCT_REVIEW_MODULE } from "../../modules/review"
import ProductReviewModuleService from "../../modules/review/service"

export type HasReviewStepInput = {
    customer_id: string,
    product_id: string
}

export const hasReviewStep = createStep(
    "has-review",
    async (input: HasReviewStepInput, { container }) => {
        const reviewModuleService: ProductReviewModuleService = container.resolve(
            PRODUCT_REVIEW_MODULE
        )

        const reviews = await reviewModuleService.listReviews({
            customer_id: input.customer_id,
            product_id: input.product_id,
        })

        return new StepResponse(reviews)
    },
)
