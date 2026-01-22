import {
  authenticate,
  defineMiddlewares,
  validateAndTransformBody,
  validateAndTransformQuery,
} from "@medusajs/framework/http";
import { PostStoreReviewSchema } from "./store/reviews/route";
import { GetAdminReviewsSchema } from "./admin/reviews/route";
import { PostAdminUpdateReviewsStatusSchema } from "./admin/reviews/status/route";
import { GetStoreReviewsSchema } from "./store/products/[id]/reviews/route";
import { GetStoreBrandsSchema } from "./store/brands/route";
import { GetStoreCarouselsSchema } from "./store/carousels/route";
import { CreateBrandSchema } from "./admin/brands/route";
import { UpdateBrandSchema } from "./admin/brands/[id]/route";
import { LinkBrandProductsSchema } from "./admin/brands/[id]/products/route";
import { LinkProductBrandsSchema } from "./admin/products/[id]/brands/route";
import { GetAdminCarouselsSchema, CreateCarouselSchema } from "./admin/carousels/route";
import { UpdateCarouselSchema } from "./admin/carousels/[id]/route";
import { CreateLikedProductSchema, GetAdminLikedProductsSchema } from "./admin/liked-products/route";
import { CreateLikedProductSchema as StoreCreateLikedProductSchema } from "./store/liked-products/route";
import { PostStoreProductQuerySchema } from "./store/product-queries/route";
import { GetAdminProductQueriesSchema } from "./admin/product-queries/route";
import { UpdateProductQueryStatusSchema } from "./admin/product-queries/[id]/route";
import { UpdateVariantPricesSchema } from "./admin/variants/[variantId]/prices/route";
import { GetProductsListSchema } from "./admin/products-list/route";
// import { GetAdminBrandsSchema } from "./admin/brands/route";
import { createFindParams } from "@medusajs/medusa/api/utils/validators"

export const GetBrandsSchema = createFindParams();

export default defineMiddlewares({
  routes: [
    {
      matcher: "/store/slide",
      method: "POST",
    },
    {
      matcher: "/store/slide",
      method: "GET",
    },

    {
      method: ["POST"],
      matcher: "/store/reviews",
      middlewares: [
        authenticate("customer", ["session", "bearer"]),
        // @ts-ignore
        validateAndTransformBody(PostStoreReviewSchema),
      ],
    },
    {
      matcher: "/store/reviews",
      method: ["GET"],
      middlewares: [
        authenticate("customer", ["session", "bearer"]),

      ],
    },
    {
      matcher: "/admin/reviews",
      method: ["GET"],
      middlewares: [
        validateAndTransformQuery(GetAdminReviewsSchema, {
          isList: true,
          defaults: [
            "id",
            "title",
            "content",
            "rating",
            "product_id",
            "customer_id",
            "status",
            "created_at",
            "updated_at",
            "product.*",
          ],
        }),
      ],
    },

    {
      matcher: "/admin/reviews/status",
      method: ["POST"],
      middlewares: [
        // @ts-ignore
        validateAndTransformBody(PostAdminUpdateReviewsStatusSchema),
      ],
    },
    {
      matcher: "/store/products/:id/reviews",
      method: ["GET"],
      middlewares: [
        validateAndTransformQuery(GetStoreReviewsSchema, {
          isList: true,
          defaults: [
            "id",
            "rating",
            "title",
            "first_name",
            "last_name",
            "content",
            "created_at",
          ],
        }),
      ],
    },
    {
      matcher: "/store/brands",
      method: ["GET"],
      middlewares: [
        validateAndTransformQuery(GetStoreBrandsSchema, {
          isList: true,
          defaults: [
            "id",
            "name",
            "slug",
            "description",
            "meta_title",
            "meta_desc",
            "image_url",
            "products.*", // include linked products by default
          ],
        }),
      ],
    },
    {
      matcher: "/admin/brands",
      method: ["POST"],
      middlewares: [
        // @ts-ignore
        validateAndTransformBody(CreateBrandSchema),
      ],
    },
    {
      matcher: "/admin/brands",
      method: ["GET"],
      middlewares: [
        validateAndTransformQuery(GetBrandsSchema, {
          defaults: [
            "id",
            "name",
            "slug",
            "description",
            "meta_title",
            "meta_desc",
            "image_url",
            "products.*", // include linked products by default
          ],
          isList: true,
        }),
      ],

    },
    {
      matcher: "/admin/brands/:id",
      method: ["PUT"],
      middlewares: [
        // @ts-ignore
        validateAndTransformBody(UpdateBrandSchema),
      ],
    },
    {
      matcher: "/admin/brands/:id/products",
      method: ["POST"],
      middlewares: [
        // @ts-ignore
        validateAndTransformBody(LinkBrandProductsSchema),
      ],
    },
    {
      matcher: "/admin/upload",
      method: ["POST"],
      // No body validation for file uploads - handled in route
    },
    {
      matcher: "/store/carousels",
      method: ["GET"],
      // No middleware validation - handled in route to avoid 'order' field validation conflict
      // The 'order' field name conflicts with query sorting parameter
    },
    {
      matcher: "/admin/carousels",
      method: ["POST"],
      middlewares: [
        // @ts-ignore
        validateAndTransformBody(CreateCarouselSchema),
      ],
    },
    {
      matcher: "/admin/carousels",
      method: ["GET"],
      middlewares: [
        validateAndTransformQuery(GetAdminCarouselsSchema, {
          defaults: [
            "id",
            "image_url1",
            "image_url2",
            "link",
            "order",
            "created_at",
            "updated_at",
          ],
          isList: true,
        }),
      ],
    },
    {
      matcher: "/admin/carousels/:id",
      method: ["PUT"],
      middlewares: [
        // @ts-ignore
        validateAndTransformBody(UpdateCarouselSchema),
      ],
    },
    {
      matcher: "/admin/liked-products",
      method: ["GET"],
      middlewares: [
        validateAndTransformQuery(GetAdminLikedProductsSchema, {
          isList: true,
          defaults: [
            "id",
            "customer_id",
            "product_id",
            "created_at",
            "updated_at",
          ],
        }),
      ],
    },
    {
      matcher: "/admin/liked-products",
      method: ["POST"],
      middlewares: [
        // @ts-ignore
        validateAndTransformBody(CreateLikedProductSchema),
      ],
    },
    {
      matcher: "/store/liked-products",
      method: ["POST"],
      middlewares: [
        // @ts-ignore
        validateAndTransformBody(StoreCreateLikedProductSchema),
      ],
    },
    {
      matcher: "/store/liked-products",
      method: ["GET"],
    },
    {
      matcher: "/store/liked-products",
      method: ["DELETE"],
    },
    {
      matcher: "/admin/products/:id/brands",
      method: ["GET"],
    },
    {
      matcher: "/admin/products/:id/brands",
      method: ["POST"],
      middlewares: [
        // @ts-ignore
        validateAndTransformBody(LinkProductBrandsSchema),
      ],
    },
    {
      matcher: "/admin/products/:id/brands",
      method: ["DELETE"],
    },
    {
      matcher: "/store/products/:id/brands",
      method: ["GET"],
    },
    {
      matcher: "/store/product-queries",
      method: ["POST"],
      middlewares: [
        // @ts-ignore
        validateAndTransformBody(PostStoreProductQuerySchema),
      ],
    },
    {
      matcher: "/admin/product-queries",
      method: ["GET"],
      middlewares: [
        validateAndTransformQuery(GetAdminProductQueriesSchema, {
          isList: true,
          defaults: [
            "id",
            "type",
            "product_id",
            "customer_name",
            "customer_email",
            "customer_mobile",
            "subject",
            "message",
            "address",
            "status",
            "created_at",
            "updated_at",
          ],
        }),
      ],
    },
    {
      matcher: "/admin/product-queries/:id",
      method: ["PATCH"],
      middlewares: [
        // @ts-ignore
        validateAndTransformBody(UpdateProductQueryStatusSchema),
      ],
    },
    {
      matcher: "/admin/variants/:variantId/prices",
      method: ["PUT"],
      middlewares: [
        // @ts-ignore
        validateAndTransformBody(UpdateVariantPricesSchema),
      ],
    },
    {
      matcher: "/admin/variants/:variantId/prices",
      method: ["GET"],
      // No body validation needed for GET requests
    },
    {
      matcher: "/admin/products-list",
      method: ["GET"],
      middlewares: [
        validateAndTransformQuery(GetProductsListSchema, {
          isList: true,
          defaults: [
            "id",
            "title",
            "thumbnail",
            "images.*",
            "variants.id",
            "variants.price_set.prices.*",
          ],
        }),
      ],
    },


  ],
});
