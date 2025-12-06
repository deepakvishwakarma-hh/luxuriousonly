import {
    createWorkflow,
    WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { getBrandsStep } from "./steps/get-brands"

type GetBrandsInput = {
    queryConfig?: any
}

export const getBrandsWorkflow = createWorkflow(
    "get-brands",
    (input: GetBrandsInput) => {
        const result = getBrandsStep(input)

        return new WorkflowResponse({
            brands: result.brands,
            count: result.count,
            limit: result.limit,
            offset: result.offset,
        })
    }
)

