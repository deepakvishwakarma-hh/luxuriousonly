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
import { CreateBrandSchema } from "./admin/brands/route";
import { UpdateBrandSchema } from "./admin/brands/[id]/route";
import { LinkBrandProductsSchema } from "./admin/brands/[id]/products/route";
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


  ],
});
