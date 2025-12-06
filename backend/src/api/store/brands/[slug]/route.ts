import type {
    MedusaRequest,
    MedusaResponse,
} from "@medusajs/framework/http"

export const GET = async (
    req: MedusaRequest,
    res: MedusaResponse
) => {
    try {
        const { slug } = req.params
        const query = req.scope.resolve("query")

        if (!slug) {
            return res.status(400).json({ message: "Brand slug is required" })
        }

        // Get brand by slug with products
        const { data: brands } = await query.graph({
            entity: "brand",
            fields: ["*", "products.*"],
            filters: {
                slug,
            },
        })

        if (!brands || brands.length === 0) {
            return res.status(404).json({ message: "Brand not found" })
        }

        const brand = brands[0]

        return res.json({
            brand,
            products: brand.products || [],
        })
    } catch (error) {
        console.error("Error fetching brand products:", error)
        res.status(500).json({
            message: error instanceof Error ? error.message : "An error occurred while fetching brand products",
        })
    }
}

