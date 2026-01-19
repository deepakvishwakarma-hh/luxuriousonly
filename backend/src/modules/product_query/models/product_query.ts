import { model } from "@medusajs/framework/utils"

const ProductQuery = model.define("product_query", {
    id: model.id().primaryKey(),
    type: model.enum(["question", "custom_delivery", "customize_product"]).nullable(),
    product_id: model.text().index("IDX_PRODUCT_QUERY_PRODUCT_ID").nullable(),
    customer_name: model.text().nullable(),
    customer_email: model.text().index("IDX_PRODUCT_QUERY_CUSTOMER_EMAIL").nullable(),
    customer_mobile: model.text().nullable(),
    subject: model.text().nullable(),
    message: model.text().nullable(),
    address: model.json().nullable(),
    status: model.enum(["new", "read", "responded"]).default("new"),
})

export default ProductQuery

