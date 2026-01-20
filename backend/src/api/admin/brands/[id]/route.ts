import type {
    MedusaRequest,
    MedusaResponse,
} from "@medusajs/framework/http"
import { updateBrandWorkflow } from "../../../../workflows/update-brand"
import { deleteBrandWorkflow } from "../../../../workflows/delete-brand"

import { z } from "zod"

export const UpdateBrandSchema = z.object({
    name: z.string().min(1).optional(),
    slug: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    meta_title: z.string().nullable().optional(),
    meta_desc: z.string().nullable().optional(),
    image_url: z.string().nullable().optional(),
})

export async function GET(
    req: MedusaRequest,
    res: MedusaResponse
) {
    try {
        const query = req.scope.resolve("query")
        const { id } = req.params

        console.log("params", req.params)

        // Query brand without products first to avoid link errors
        const { data: brands } = await query.graph({
            entity: "brand",
            fields: ["*", "products.*"],
            filters: {
                id,
            },
        })

        if (!brands || brands.length === 0) {
            return res.status(404).json({ message: "Brand not found" })
        }

        res.json({ brand: brands[0] })
    } catch (error) {
        res.status(500).json({
            message: error instanceof Error ? error.message : "An error occurred while fetching the brand",
        })
    }
}

export async function PUT(
    req: MedusaRequest<z.infer<typeof UpdateBrandSchema>>,
    res: MedusaResponse
) {
    try {
        const { id } = req.params
        const { name, slug, description, meta_title, meta_desc, image_url } = req.validatedBody

        console.log("Brand update request:", {
            id,
            name,
            slug,
            description,
            meta_title,
            meta_desc,
            image_url,
        })

        const { result } = await updateBrandWorkflow(req.scope).run({
            input: {
                id,
                name,
                slug,
                description,
                meta_title,
                meta_desc,
                image_url,
            },
        })

        console.log("Brand update result:", JSON.stringify(result, null, 2))
        
        // Ensure we return the updated brand with image_url
        const updatedBrand = result?.brand
        if (updatedBrand) {
            console.log("Updated brand image_url:", updatedBrand.image_url)
        }

        res.json(result)
    } catch (error) {
        console.error("Error updating brand:", error)
        const statusCode = error instanceof Error && error.message.includes("not found") ? 404 : 400
        res.status(statusCode).json({
            message: error instanceof Error ? error.message : "An error occurred while updating the brand",
        })
    }
}

export async function DELETE(
    req: MedusaRequest,
    res: MedusaResponse
) {
    try {
        const { id } = req.params

        await deleteBrandWorkflow(req.scope).run({
            input: {
                id,
            },
        })

        res.status(200).json({ success: true })
    } catch (error) {
        const statusCode = error instanceof Error && error.message.includes("not found") ? 404 : 400
        res.status(statusCode).json({
            message: error instanceof Error ? error.message : "An error occurred while deleting the brand",
        })
    }
}

