import type {
    MedusaRequest,
    MedusaResponse,
} from "@medusajs/framework/http"
import { createFindParams } from "@medusajs/medusa/api/utils/validators"

export const GetStoreBrandsSchema = createFindParams()

export const GET = async (
    req: MedusaRequest,
    res: MedusaResponse
) => {
    try {
        const query = req.scope.resolve("query")

        const queryConfig = {
            entity: "brand",
            ...req.queryConfig, // includes fields, pagination, etc. from middleware
        }

        const {
            data: brands,
            metadata: { count, take, skip } = {},
        } = await query.graph(queryConfig)

        return res.json({
            brands: brands || [],
            count: count || 0,
            limit: take,
            offset: skip,
        })
    } catch (error) {
        console.error("Error fetching brands:", error)
        res.status(500).json({
            message: error instanceof Error ? error.message : "An error occurred while fetching brands",
        })
    }
}

