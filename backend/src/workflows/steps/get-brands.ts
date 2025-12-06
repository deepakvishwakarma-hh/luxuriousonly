import {
    createStep,
    StepResponse,
} from "@medusajs/framework/workflows-sdk"

export type GetBrandsStepInput = {
    queryConfig?: any
}

export const getBrandsStep = createStep(
    "get-brands",
    async (input: GetBrandsStepInput, { container }) => {
        const query = container.resolve("query")

        // Normalize queryConfig - handle fields array properly
        let normalizedConfig = { ...input.queryConfig }

        // If fields is an object (from query string like fields[0]=*), convert to array
        if (normalizedConfig.fields && typeof normalizedConfig.fields === 'object' && !Array.isArray(normalizedConfig.fields)) {
            normalizedConfig.fields = Object.values(normalizedConfig.fields).filter(f => f !== null && f !== undefined)
        }

        // Ensure fields is an array if it exists
        if (normalizedConfig.fields && !Array.isArray(normalizedConfig.fields)) {
            normalizedConfig.fields = [normalizedConfig.fields]
        }

        // Filter out products.* from fields if present, as it's a link and needs special handling
        // Products can be queried separately via the link API endpoint
        if (normalizedConfig.fields && Array.isArray(normalizedConfig.fields)) {
            normalizedConfig.fields = normalizedConfig.fields.filter(
                (field: string) => !field.startsWith('products.')
            )
        }

        try {
            const result = await query.graph({
                entity: "brand",
                ...normalizedConfig,
            })

            const brands = result.data || []
            const metadata = result.metadata || {}
            // Use brands.length as fallback if count is 0 or not provided
            const metadataCount = (metadata as any).count
            const count = metadataCount != null && metadataCount > 0 ? metadataCount : brands.length
            const take = (metadata as any).take ?? 20
            const skip = (metadata as any).skip ?? 0

            return new StepResponse({
                brands,
                count,
                limit: take,
                offset: skip,
            })
        } catch (error) {
            // If error is about products property, retry without products fields
            if (error instanceof Error && error.message.includes("does not have property 'products'")) {
                // Remove any products-related fields and retry
                const retryConfig = { ...normalizedConfig }
                if (retryConfig.fields && Array.isArray(retryConfig.fields)) {
                    retryConfig.fields = retryConfig.fields.filter(
                        (field: string) => !field.includes('products')
                    )
                }

                const retryResult = await query.graph({
                    entity: "brand",
                    ...retryConfig,
                })

                const retryBrands = retryResult.data || []
                const retryMetadata = retryResult.metadata || {}
                // Use retryBrands.length as fallback if count is 0 or not provided
                const retryMetadataCount = (retryMetadata as any).count
                const retryCount = retryMetadataCount != null && retryMetadataCount > 0 ? retryMetadataCount : retryBrands.length
                const retryTake = (retryMetadata as any).take ?? 20
                const retrySkip = (retryMetadata as any).skip ?? 0

                return new StepResponse({
                    brands: retryBrands,
                    count: retryCount,
                    limit: retryTake,
                    offset: retrySkip,
                })
            }
            throw error
        }
    }
)

