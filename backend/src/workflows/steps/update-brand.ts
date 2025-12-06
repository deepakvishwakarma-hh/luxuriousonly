import {
    createStep,
    StepResponse,
} from "@medusajs/framework/workflows-sdk"
import { BRAND_MODULE } from "../../modules/brand"
import BrandModuleService from "../../modules/brand/service"

export type UpdateBrandStepInput = {
    id: string
    name?: string
    slug?: string | null
    description?: string | null
    meta_title?: string | null
    meta_desc?: string | null
    image_url?: string | null
}

export const updateBrandStep = createStep(
    "update-brand-step",
    async (input: UpdateBrandStepInput, { container }) => {
        const brandModuleService: BrandModuleService = container.resolve(
            BRAND_MODULE
        )

        // Get original brand before update
        const originalBrands = await brandModuleService.listBrands({
            id: [input.id],
        })

        const brand = await brandModuleService.updateBrands(input)

        return new StepResponse(brand, originalBrands[0])
    },
    async (originalData, { container }) => {
        if (!originalData) {
            return
        }

        const brandModuleService: BrandModuleService = container.resolve(
            BRAND_MODULE
        )

        // Restore original brand data
        await brandModuleService.updateBrands({
            id: originalData.id,
            name: originalData.name,
            slug: originalData.slug,
            description: originalData.description,
            meta_title: originalData.meta_title,
            meta_desc: originalData.meta_desc,
            image_url: originalData.image_url,
        })
    }
)

