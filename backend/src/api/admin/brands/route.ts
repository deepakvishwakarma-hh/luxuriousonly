import {
    MedusaRequest,
    MedusaResponse,
} from "@medusajs/framework/http"
import { createFindParams } from "@medusajs/medusa/api/utils/validators"
import { createBrandWorkflow } from "../../../workflows/create-brand"
import { getBrandsWorkflow } from "../../../workflows/get-brands"
import { z } from "zod"

export const GetAdminBrandsSchema = createFindParams()

export const CreateBrandSchema = z.object({
    name: z.string().min(1),
    slug: z.string().optional(),
    description: z.string().optional(),
    meta_title: z.string().optional(),
    meta_desc: z.string().optional(),
    image_url: z.string().optional(),
})

export const GET = async (
    req: MedusaRequest,
    res: MedusaResponse
) => {
    try {
        // Use queryConfig if available, otherwise use raw query parameters
        const queryConfig = req.queryConfig || req.query || {}


        // const { result } = await getBrandsWorkflow(req.scope).run({
        //     input: {
        //         queryConfig,
        //     },
        // })
        const query = req.scope.resolve("query")

        const {
            data: brands,
            metadata: { count, take, skip } = {},
        } = await query.graph({
            entity: "brand",
            // This will return brand data and its linked products
            ...req.queryConfig, // allows pagination & field overrides
            // If you want to force fields explicitly instead of using req.queryConfig:

        })


        return res.json({
            brands: brands,
            count,
            limit: take,
            offset: skip,
        })
    } catch (error) {
        res.status(500).json({
            message: error instanceof Error ? error.message : "An error occurred while fetching brands",
        })
    }
}

export const POST = async (
    req: MedusaRequest<z.infer<typeof CreateBrandSchema>>,
    res: MedusaResponse
) => {
    try {
        const { name, slug, description, meta_title, meta_desc, image_url } = req.validatedBody

        const { result } = await createBrandWorkflow(req.scope).run({
            input: {
                name,
                slug,
                description,
                meta_title,
                meta_desc,
                image_url,
            },
        })

        res.json(result)
    } catch (error) {
        const statusCode = error instanceof Error && error.message.includes("not found") ? 404 : 400
        res.status(statusCode).json({
            message: error instanceof Error ? error.message : "An error occurred while creating the brand",
        })
    }
}

