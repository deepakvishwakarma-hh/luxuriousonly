import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Modules } from "@medusajs/framework/utils";
import { createFindParams } from "@medusajs/medusa/api/utils/validators";

export const GetProductsListSchema = createFindParams();

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  try {
    const query = req.scope.resolve("query");

    // Use queryConfig from middleware (populated by createFindParams)
    // Fallback to manual parsing if not available
    const limit = req.queryConfig?.take || (req.query.limit ? parseInt(req.query.limit as string) : 50);
    const offset = req.queryConfig?.skip || (req.query.offset ? parseInt(req.query.offset as string) : 0);

    // Query products with images and variants
    const queryConfig: any = {
      entity: "product",
      fields: [
        "id",
        "title",
        "thumbnail",
        "images.*",
        "variants.id",
        "variants.price_set.prices.*",
      ],
      take: limit,
      skip: offset,
      ...req.queryConfig, // Spread to allow field overrides and other config
    };

    const {
      data: products,
      metadata: { count, take, skip } = {},
    } = await query.graph(queryConfig);

    console.log(`[products-list] Found ${products?.length || 0} products, total count: ${count || 0}`);

    // Handle case where no products are found
    if (!products || products.length === 0) {
      return res.json({
        products: [],
        count: count || 0,
        limit: take || limit,
        offset: skip || offset,
      });
    }

    // Get USD currency code
    const currencyModule = req.scope.resolve(Modules.CURRENCY);
    let usdCode = "usd";
    try {
      const currencies = await currencyModule.listCurrencies({
        code: "usd",
      });
      const usdCurrency = currencies?.[0];
      usdCode = usdCurrency?.code || "usd";
    } catch (currencyError) {
      console.warn("Failed to fetch USD currency, using default 'usd':", currencyError);
    }

    // Transform products to include first image, title, stock, and USD price
    const transformedProducts = await Promise.all(
      products.map(async (product: any) => {
        // Get first image
        const firstImage = product.images?.[0]?.url || product.thumbnail || null;

        // Calculate total stock across all variants
        let totalStock = 0;
        if (product.variants && product.variants.length > 0) {
          for (const variant of product.variants) {
            try {
              // Query inventory item link
              const { data: variantLinks } = await query.graph({
                entity: "link_product_variant_inventory_item",
                fields: ["inventory_item_id"],
                filters: {
                  variant_id: variant.id,
                },
              });

              if (variantLinks && variantLinks.length > 0) {
                const inventoryItemId = (variantLinks[0] as any).inventory_item_id;

                // Query inventory levels for this item
                const { data: inventoryLevels } = await query.graph({
                  entity: "inventory_level",
                  fields: ["stocked_quantity", "available_quantity"],
                  filters: {
                    inventory_item_id: inventoryItemId,
                  },
                });

                if (inventoryLevels && inventoryLevels.length > 0) {
                  inventoryLevels.forEach((level: any) => {
                    totalStock += level.available_quantity || level.stocked_quantity || 0;
                  });
                }
              }
            } catch (inventoryError) {
              // If inventory query fails, continue with 0 stock
              console.warn(`Failed to query inventory for variant ${variant.id}:`, inventoryError);
            }
          }
        }

        // Get USD price from first variant
        let usdPrice: number | null = null;
        let usdPriceFormatted: string | null = null;

        if (product.variants?.[0]?.price_set?.prices) {
          const usdPriceObj = product.variants[0].price_set.prices.find(
            (p: any) => p.currency_code?.toLowerCase() === usdCode.toLowerCase()
          );

          if (usdPriceObj) {
            usdPrice = usdPriceObj.amount;
            // Format price (amount is in smallest currency unit, e.g., cents)
            usdPriceFormatted = new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(usdPrice);
          }
        }

        return {
          id: product.id,
          title: product.title,
          image: firstImage,
          stock: totalStock,
          price: usdPrice,
          price_formatted: usdPriceFormatted,
        };
      })
    );

    res.json({
      products: transformedProducts || [],
      count: count || 0,
      limit: take || limit,
      offset: skip || offset,
    });
  } catch (error) {
    console.error("Error fetching products list:", error);
    res.status(500).json({
      message: error instanceof Error ? error.message : "An error occurred while fetching products",
    });
  }
}

export async function DELETE(
  req: MedusaRequest,
  res: MedusaResponse
) {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        message: "Product IDs array is required",
      });
    }

    const productModuleService = req.scope.resolve(Modules.PRODUCT);

    // Delete products one by one (Medusa may not support batch delete)
    const deletePromises = ids.map((id: string) =>
      productModuleService.deleteProducts(id).catch((error: any) => {
        console.error(`Failed to delete product ${id}:`, error);
        return { id, error: error.message };
      })
    );

    const results = await Promise.all(deletePromises);
    const failed = results.filter((r: any) => r?.error);
    const succeeded = results.filter((r: any) => !r?.error);

    if (failed.length > 0) {
      return res.status(207).json({
        success: true,
        deleted: succeeded.length,
        failed: failed.length,
        failed_ids: failed.map((f: any) => f.id),
        ids,
      });
    }

    res.json({
      success: true,
      deleted: ids.length,
      ids,
    });
  } catch (error) {
    console.error("Error deleting products:", error);
    res.status(500).json({
      message: error instanceof Error ? error.message : "An error occurred while deleting products",
    });
  }
}
