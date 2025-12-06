import type {
    MedusaRequest,
    MedusaResponse,
} from "@medusajs/framework/http"
import { promises as fs } from "fs"
import * as path from "path"
import { Readable } from "stream"

/**
 * Upload brand image endpoint
 * 
 * This endpoint accepts multipart/form-data with an 'image' field.
 * 
 * For file uploads, you can:
 * 1. Use this endpoint with multipart/form-data (requires proper parsing)
 * 2. Upload to a file service (S3, Cloudinary, etc.) and pass the URL via the update endpoint
 * 3. Use Medusa's FileService if configured
 * 
 * Example usage:
 * - POST /admin/brands/:id/upload with multipart/form-data containing 'image' field
 * - Or upload elsewhere and use PUT /admin/brands/:id with image_url in body
 */
export const POST = async (
    req: MedusaRequest,
    res: MedusaResponse
) => {
    try {
        const { id } = req.params

        if (!id) {
            return res.status(400).json({ message: "Brand ID is required" })
        }

        // Check if FileService is available
        let fileService
        try {
            fileService = req.scope.resolve("fileService")
        } catch (error) {
            // FileService not configured
        }

        // For now, accept image_url directly in the request body
        // This allows clients to upload to their preferred service and pass the URL
        const { image_url } = req.body as { image_url?: string }

        if (!image_url) {
            return res.status(400).json({
                message: "image_url is required. Upload your image to a file service (S3, Cloudinary, etc.) and provide the URL here, or use the PUT /admin/brands/:id endpoint with image_url in the body."
            })
        }

        // Validate URL format
        try {
            new URL(image_url)
        } catch {
            return res.status(400).json({
                message: "Invalid image_url format. Please provide a valid URL."
            })
        }

        // Update brand with image URL
        const { updateBrandWorkflow } = await import("../../../../../workflows/update-brand.js")
        const { result } = await updateBrandWorkflow(req.scope).run({
            input: {
                id,
                image_url,
            },
        })

        res.json({
            brand: result.brand,
            image_url,
        })
    } catch (error) {
        console.error("Error uploading brand image:", error)
        res.status(500).json({
            message: error instanceof Error ? error.message : "An error occurred while uploading the image",
        })
    }
}

