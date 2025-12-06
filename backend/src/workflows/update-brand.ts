import {
    createWorkflow,
    WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { updateBrandStep } from "./steps/update-brand"

export type UpdateBrandInput = {
    id: string
    name?: string
    slug?: string | null
    description?: string | null
    meta_title?: string | null
    meta_desc?: string | null
    image_url?: string | null
}

export const updateBrandWorkflow = createWorkflow(
    "update-brand",
    (input: UpdateBrandInput) => {
        const brand = updateBrandStep(input)

        return new WorkflowResponse({
            brand,
        })
    }
)

