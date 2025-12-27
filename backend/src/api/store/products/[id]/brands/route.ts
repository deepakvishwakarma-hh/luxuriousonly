import type {
    MedusaRequest,
    MedusaResponse,
} from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { BRAND_MODULE } from "../../../../../modules/brand"

export async function GET(
    req: MedusaRequest,
    res: MedusaResponse
) {
    try {
        const { id } = req.params
        const query = req.scope.resolve("query")

        if (!id) {
            return res.status(400).json({ message: "Product ID is required" })
        }

        // Try to query links directly using query.graph
        let brandIds: string[] = []
        
        try {
            // The link entity name is typically the combination of the two modules
            const linkEntityName = `${Modules.PRODUCT}_${BRAND_MODULE}`.replace(/[^a-zA-Z0-9_]/g, "_")
            
            try {
                const { data: links } = await query.graph({
                    entity: linkEntityName,
                    fields: ["*"],
                    filters: {
                        [`${Modules.PRODUCT}_product_id`]: id,
                    },
                })
                
                if (links && Array.isArray(links)) {
                    brandIds = links
                        .map((linkItem: any) => linkItem[`${BRAND_MODULE}_brand_id`] || linkItem.brand_id)
                        .filter(Boolean)
                }
            } catch (linkQueryError) {
                // If direct link query doesn't work, use alternative method
                // Query all brands with their products, then filter
                const { data: allBrands } = await query.graph({
                    entity: "brand",
                    fields: ["*", "products.*"],
                })
                
                if (allBrands && allBrands.length > 0) {
                    // Filter brands that have this product in their products array
                    const linkedBrandsData = allBrands.filter((brand: any) => {
                        return brand.products && Array.isArray(brand.products) && 
                               brand.products.some((p: any) => p.id === id)
                    })
                    
                    brandIds = linkedBrandsData.map((brand: any) => brand.id)
                }
            }
        } catch (error) {
            console.error("Error querying links:", error)
        }

        // Fetch brand details for linked brands
        let linkedBrands: any[] = []
        if (brandIds.length > 0) {
            const { data: brands } = await query.graph({
                entity: "brand",
                fields: ["*"],
                filters: {
                    id: brandIds,
                },
            })
            linkedBrands = brands || []
        }

        return res.json({
            product_id: id,
            brands: linkedBrands,
        })
    } catch (error) {
        console.error("Error fetching product brands:", error)
        return res.status(500).json({
            message: error instanceof Error ? error.message : "An error occurred while fetching product brands",
        })
    }
}

