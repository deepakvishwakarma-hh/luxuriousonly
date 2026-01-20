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
                        console.error("File upload failed: No files returned from fileModuleService")
                        return res.status(500).json({
                            message: "Failed to upload file"
                        })
                    }

                    // Return the URL of the uploaded file
                    const uploadedFile = uploadedFiles[0]
                    let fileUrl = uploadedFile.url

                    console.log("File uploaded successfully. Original URL:", fileUrl)
                    console.log("Uploaded file data:", JSON.stringify(uploadedFile, null, 2))

                    // Fix URL if it contains localhost or is a relative path
                    const backendUrl = process.env.BACKEND_URL
                    if (backendUrl) {
                        const normalizedBackendUrl = backendUrl.replace(/\/$/, '')

                        // If URL contains localhost or 127.0.0.1, replace it with backend URL
                        if (fileUrl.includes('localhost') || fileUrl.includes('127.0.0.1')) {
                            try {
                                const url = new URL(fileUrl)
                                const backendUrlObj = new URL(normalizedBackendUrl)
                                // Replace the origin (protocol + hostname + port) with backend URL origin
                                fileUrl = fileUrl.replace(url.origin, backendUrlObj.origin)
                            } catch (e) {
                                // If URL parsing fails, try regex replacement
                                fileUrl = fileUrl.replace(/https?:\/\/[^/]+/, normalizedBackendUrl)
                            }
                        }
                        // If URL is a relative path, prepend backend URL
                        else if (fileUrl.startsWith('/')) {
                            fileUrl = `${normalizedBackendUrl}${fileUrl}`
                        }
                        // If URL doesn't start with http/https, it might be malformed
                        else if (!fileUrl.startsWith('http://') && !fileUrl.startsWith('https://')) {
                            // If it looks like a path, prepend backend URL
                            if (fileUrl.startsWith('/') || !fileUrl.includes('://')) {
                                fileUrl = `${normalizedBackendUrl}${fileUrl.startsWith('/') ? '' : '/'}${fileUrl}`
                            }
                        }
                    }

                    console.log("Final file URL:", fileUrl)

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

