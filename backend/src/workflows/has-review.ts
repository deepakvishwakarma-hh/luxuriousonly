import {
    createWorkflow,
    WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { hasReviewStep } from "./steps/has-review"

type HasReviewInput = {
    customer_id: string
    product_id: string
}

export const hasReviewWorkflow = createWorkflow(
    "has-review",
    (input: HasReviewInput) => {
        const reviews = hasReviewStep(input)
        // @ts-ignore
        return new WorkflowResponse({
            reviews: reviews,
        })
    }
)
