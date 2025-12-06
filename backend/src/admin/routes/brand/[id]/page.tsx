import { defineRouteConfig } from "@medusajs/admin-sdk";
import { Tag } from "@medusajs/icons";
import {
  Container,
  Heading,
  Toaster,
  Text,
  Button,
  Input,
  Textarea,
  Label,
  Checkbox,
} from "@medusajs/ui";
import { sdk } from "../../../lib/config";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { HttpTypes } from "@medusajs/framework/types";

type Brand = {
  id: string;
  name: string;
  slug?: string | null;
  description?: string | null;
  meta_title?: string | null;
  meta_desc?: string | null;
  products?: HttpTypes.AdminProduct[];
};

type Product = {
  id: string;
  title: string;
};

type BrandFormData = {
  name: string;
  slug?: string;
  description?: string;
  meta_title?: string;
  meta_desc?: string;
};

const BrandEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<BrandFormData>({
    name: "",
    slug: "",
    description: "",
    meta_title: "",
    meta_desc: "",
  });

  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(
    new Set()
  );
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch brand data
  const { data: brandData, isLoading: isLoadingBrand } = useQuery<{
    brand: Brand;
  }>({
    queryKey: ["brand", id],
    queryFn: () =>
      sdk.client.fetch(`/admin/brands/${id}`, {
        query: {
          fields: ["*"],
        },
      }),
    enabled: !!id,
  });

  // Fetch all products for selection
  const { data: productsData, isLoading: isLoadingProducts } = useQuery<{
    products: Product[];
    count: number;
  }>({
    queryKey: ["products", searchQuery],
    queryFn: () =>
      sdk.client.fetch("/admin/products", {
        query: {
          limit: 100,
          offset: 0,
          q: searchQuery || undefined,
          fields: ["id", "title"],
        },
      }),
  });

  // Update form data when brand loads
  useEffect(() => {
    if (brandData?.brand) {
      const brand = brandData.brand;
      setFormData({
        name: brand.name,
        slug: brand.slug || "",
        description: brand.description || "",
        meta_title: brand.meta_title || "",
        meta_desc: brand.meta_desc || "",
      });
      // Set selected products
      if (brand.products) {
        setSelectedProducts(new Set(brand.products.map((p) => p.id)));
      }
    }
  }, [brandData]);

  const updateMutation = useMutation({
    mutationFn: async (data: BrandFormData) => {
      return sdk.client.fetch(`/admin/brands/${id}`, {
        method: "PUT",
        body: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brand", id] });
      queryClient.invalidateQueries({ queryKey: ["brands"] });
    },
  });

  const linkProductsMutation = useMutation({
    mutationFn: async (productIds: string[]) => {
      return sdk.client.fetch(`/admin/brands/${id}/products`, {
        method: "POST",
        body: { product_ids: productIds },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brand", id] });
      queryClient.invalidateQueries({ queryKey: ["brands"] });
    },
  });

  const unlinkProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      return sdk.client.fetch(
        `/admin/brands/${id}/products?product_id=${productId}`,
        {
          method: "DELETE",
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brand", id] });
      queryClient.invalidateQueries({ queryKey: ["brands"] });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateMutation.mutateAsync(formData);
  };

  const handleProductToggle = async (
    productId: string,
    isSelected: boolean
  ) => {
    if (isSelected) {
      // Link product
      await linkProductsMutation.mutateAsync([productId]);
      setSelectedProducts((prev) => new Set([...prev, productId]));
    } else {
      // Unlink product
      await unlinkProductMutation.mutateAsync(productId);
      setSelectedProducts((prev) => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleNameChange = (name: string) => {
    setFormData({ ...formData, name });
    // Auto-generate slug if empty
    if (!formData.slug) {
      setFormData((prev) => ({ ...prev, name, slug: generateSlug(name) }));
    }
  };

  if (isLoadingBrand) {
    return (
      <Container>
        <Text>Loading...</Text>
      </Container>
    );
  }

  if (!brandData?.brand) {
    return (
      <Container>
        <div className="mb-6">
          <Button
            variant="secondary"
            onClick={() => (window.location.href = "/app/brand")}
          >
            ← Back to Brands
          </Button>
        </div>
        <Text>Brand not found</Text>
      </Container>
    );
  }

  const filteredProducts =
    productsData?.products?.filter((product) =>
      product.title.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  return (
    <Container>
      <div className="mb-6">
        <Button
          variant="secondary"
          onClick={() => (window.location.href = "/app/brand")}
        >
          ← Back to Brands
        </Button>
      </div>

      <Heading className="mb-6">Edit Brand</Heading>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) =>
                setFormData({ ...formData, slug: e.target.value })
              }
              placeholder="Auto-generated from name"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={4}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="meta_title">Meta Title</Label>
            <Input
              id="meta_title"
              value={formData.meta_title}
              onChange={(e) =>
                setFormData({ ...formData, meta_title: e.target.value })
              }
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="meta_desc">Meta Description</Label>
            <Textarea
              id="meta_desc"
              value={formData.meta_desc}
              onChange={(e) =>
                setFormData({ ...formData, meta_desc: e.target.value })
              }
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="secondary"
              onClick={() => (window.location.href = "/app/brand")}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={updateMutation.isPending}>
              Update Brand
            </Button>
          </div>
        </div>
      </form>

      {/* Product Selection */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <Heading className="mb-4">Products</Heading>
        <Text className="text-ui-fg-subtle mb-4">
          Select products to associate with this brand
        </Text>

        <div className="mb-4">
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {isLoadingProducts ? (
          <Text>Loading products...</Text>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredProducts.length === 0 ? (
              <Text className="text-ui-fg-subtle">No products found</Text>
            ) : (
              filteredProducts.map((product) => {
                const isSelected = selectedProducts.has(product.id);
                return (
                  <div
                    key={product.id}
                    className="flex items-center gap-3 p-2 hover:bg-ui-bg-base-hover rounded"
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) =>
                        handleProductToggle(product.id, checked as boolean)
                      }
                      disabled={
                        linkProductsMutation.isPending ||
                        unlinkProductMutation.isPending
                      }
                    />
                    <Label
                      htmlFor={`product-${product.id}`}
                      className="flex-1 cursor-pointer"
                    >
                      {product.title}
                    </Label>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      <Toaster />
    </Container>
  );
};

export const config = defineRouteConfig({
  label: "Edit Brand",
  icon: Tag,
});

export default BrandEditPage;
