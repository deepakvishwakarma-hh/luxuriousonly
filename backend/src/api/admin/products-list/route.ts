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
    const limit = req.queryConfig?.pagination?.take || (req.query.limit ? parseInt(req.query.limit as string) : 50);
    const offset = req.queryConfig?.pagination?.skip || (req.query.offset ? parseInt(req.query.offset as string) : 0);

    // Query products with images and variants
    const queryConfig: any = {
      entity: "product",
      ...req.queryConfig, // Spread first to allow field overrides
      fields: req.queryConfig?.fields || [
        "id",
        "title",
        "thumbnail",
        "images.*",
        "variants.id",
        "variants.price_set.prices.*",
      ],
      take: limit,
      skip: offset,
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
        code: ["usd"],
      });
      const usdCurrency = currencies?.[0];
      usdCode = usdCurrency?.code || "usd";
    } catch (currencyError) {
      console.warn("Failed to fetch USD currency, using default 'usd':", currencyError);
    }

    // Get all variant IDs to query inventory in batch
    const allVariantIds: string[] = [];
    products.forEach((product: any) => {
      if (product.variants && product.variants.length > 0) {
        product.variants.forEach((variant: any) => {
          if (variant.id) {
            allVariantIds.push(variant.id);
          }
        });
      }
    });

    // Batch query inventory item links for all variants
    const variantToInventoryItemMap = new Map<string, string>();
    if (allVariantIds.length > 0) {
      try {
        const { data: variantLinks } = await query.graph({
          entity: "link_product_variant_inventory_item",
          fields: ["variant_id", "inventory_item_id"],
          filters: {
            variant_id: allVariantIds,
          },
        });

        if (variantLinks && variantLinks.length > 0) {
          variantLinks.forEach((link: any) => {
            if (link.variant_id && link.inventory_item_id) {
              variantToInventoryItemMap.set(link.variant_id, link.inventory_item_id);
            }
          });
        }
      } catch (error) {
        console.warn("[products-list] Failed to query variant links:", error);
      }
    }

    // Get all unique inventory item IDs
    const inventoryItemIds = Array.from(new Set(variantToInventoryItemMap.values()));

    // Batch query all inventory levels
    const inventoryItemStockMap = new Map<string, number>();
    if (inventoryItemIds.length > 0) {
      try {
        const { data: inventoryLevels } = await query.graph({
          entity: "inventory_level",
          fields: ["inventory_item_id", "stocked_quantity", "available_quantity"],
          filters: {
            inventory_item_id: inventoryItemIds,
          },
        });

        if (inventoryLevels && inventoryLevels.length > 0) {
          // Sum stock for each inventory item across all locations
          inventoryLevels.forEach((level: any) => {
            if (level.inventory_item_id) {
              const currentStock = inventoryItemStockMap.get(level.inventory_item_id) || 0;
              const quantity = level.available_quantity !== undefined && level.available_quantity !== null
                ? level.available_quantity 
                : (level.stocked_quantity !== undefined && level.stocked_quantity !== null ? level.stocked_quantity : 0);
              inventoryItemStockMap.set(level.inventory_item_id, currentStock + quantity);
            }
          });
        }
      } catch (error) {
        console.warn("[products-list] Failed to query inventory levels:", error);
      }
    }

    // Transform products to include first image, title, and USD price
    const transformedProducts = products.map((product: any) => {
      // Get first image
      const firstImage = product.images?.[0]?.url || product.thumbnail || null;

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
          if (usdPrice !== null && usdPrice !== undefined) {
            usdPriceFormatted = new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(usdPrice);
          }
        }
      }

      return {
        id: product.id,
        title: product.title,
        image: firstImage,
        price: usdPrice,
        price_formatted: usdPriceFormatted,
      };
    });

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

type DeleteProductsBody = {
  ids: string[];
};

export async function DELETE(
  req: MedusaRequest<DeleteProductsBody>,
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

    // Delete products - deleteProducts accepts an array of IDs
    const deletePromises = ids.map((id: string) =>
      productModuleService.deleteProducts([id]).catch((error: any) => {
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
