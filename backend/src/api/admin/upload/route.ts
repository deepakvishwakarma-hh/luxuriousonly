import type {
    MedusaRequest,
    MedusaResponse,
} from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import busboy from "busboy"

export const POST = async (
    req: MedusaRequest,
    res: MedusaResponse
) => {
    try {
        // Resolve the File module service
        const fileModuleService = req.scope.resolve(Modules.FILE)

        const contentType = req.headers["content-type"] || ""

        if (!contentType.includes("multipart/form-data")) {
            return res.status(400).json({
                message: "Content-Type must be multipart/form-data"
            })
        }

        // Parse multipart form data using busboy
        const bb = busboy({ headers: req.headers as any })

        let fileBuffer: Buffer | null = null
        let filename = `file-${Date.now()}`
        let mimeType = "application/octet-stream"

        return new Promise<void>((resolve, reject) => {
            bb.on("file", (name, file, info) => {
                const { filename: originalFilename, encoding, mimeType: fileMimeType } = info

                filename = originalFilename || filename
                mimeType = fileMimeType || mimeType

                const chunks: Buffer[] = []

                file.on("data", (chunk: Buffer) => {
                    chunks.push(chunk)
                })

                file.on("end", () => {
                    fileBuffer = Buffer.concat(chunks)
                })
            })

            bb.on("finish", async () => {
                try {
                    if (!fileBuffer) {
                        return res.status(400).json({
                            message: "No file provided. Please upload a file using multipart/form-data with 'file' field."
                        })
                    }

                    // Prepare file data for upload
                    const fileData = {
                        filename,
                        mimeType,
                        content: fileBuffer,
                    }

                    // Upload the file using the File module
                    // @ts-ignore
                    const uploadedFiles = await fileModuleService.createFiles([fileData])

                    if (!uploadedFiles || uploadedFiles.length === 0) {
                        return res.status(500).json({
                            message: "Failed to upload file"
                        })
                    }

                    // Return the URL of the uploaded file
                    const uploadedFile = uploadedFiles[0]
                    const fileUrl = uploadedFile.url

                    res.json({
                        url: fileUrl,
                        file: uploadedFile,
                    })
                    resolve()
                } catch (error) {
                    console.error("Error uploading file:", error)
                    res.status(500).json({
                        message: error instanceof Error ? error.message : "An error occurred while uploading the file",
                    })
                    resolve()
                }
            })

            bb.on("error", (error) => {
                console.error("Busboy error:", error)
                res.status(400).json({
                    message: "Error parsing multipart form data",
                })
                resolve()
            })

            // Access the underlying Node.js request object
            // Medusa wraps the request, so we need to get the raw stream
            const nodeReq = (req as any).raw || (req as any).req || (req as any).node || req

            // Check if it's a readable stream
            if (nodeReq && typeof nodeReq.pipe === 'function') {
                nodeReq.pipe(bb)
            } else if (nodeReq && nodeReq.readable) {
                // Try as readable stream
                nodeReq.pipe(bb)
            } else {
                // Last resort: try to access the request directly
                try {
                    (req as any).pipe(bb)
                } catch (pipeError) {
                    console.error("Cannot pipe request:", pipeError)
                    res.status(400).json({
                        message: "Unable to read request stream. Please ensure Content-Type is multipart/form-data."
                    })
                    resolve()
                }
            }
        })
    } catch (error) {
        console.error("Error in upload handler:", error)
        res.status(500).json({
            message: error instanceof Error ? error.message : "An error occurred while uploading the file",
        })
    }
}

