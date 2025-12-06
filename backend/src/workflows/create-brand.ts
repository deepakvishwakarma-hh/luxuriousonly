import {
    createWorkflow,
    WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { createBrandStep } from "./steps/create-brand"

type CreateBrandInput = {
    name: string
    slug?: string
    description?: string
    meta_title?: string
    meta_desc?: string
}

export const createBrandWorkflow = createWorkflow(
    "create-brand",
    (input: CreateBrandInput) => {
        // Create the brand
        const brand = createBrandStep(input)

        return new WorkflowResponse({
            brand,
        })
    }
)

