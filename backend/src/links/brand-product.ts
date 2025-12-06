import { defineLink } from "@medusajs/framework/utils"
import BrandModule from "../modules/brand"
import ProductModule from "@medusajs/medusa/product"

export default defineLink(
    BrandModule.linkable.brand,
    ProductModule.linkable.product,
    {
        readOnly: true
    }
)

