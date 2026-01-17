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
  toast,
} from "@medusajs/ui";
import { sdk } from "../../../lib/config";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { HttpTypes } from "@medusajs/framework/types";
import { SEOPreviewComponent } from "../../../widgets/seo-preview-component";
import { seoPreviewConfig } from "../../../widgets/seo-preview-config";

type Brand = {
  id: string;
  name: string;
  slug?: string | null;
  description?: string | null;
  meta_title?: string | null;
  meta_desc?: string | null;
  image_url?: string | null;
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
  image_url?: string;
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
    image_url: "",
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

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
          fields: "*,products.*",
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
          fields: "id,title",
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
        image_url: brand.image_url || "",
      });
      setImagePreview(brand.image_url || null);
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
      toast.success("Brand updated successfully");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update brand");
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
      toast.success("Products linked successfully");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to link products");
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
      toast.success("Product unlinked successfully");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to unlink product");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // If image_url is a data URL, you might want to upload it first
    // For now, we'll send it as-is (data URLs work but are not ideal for production)
    const submitData = {
      ...formData,
      image_url: formData.image_url || undefined,
    };
    await updateMutation.mutateAsync(submitData);
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
    <Container className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="secondary"
            size="small"
            onClick={() => (window.location.href = "/app/brand")}
          >
            ← Back to Brands
          </Button>
          <Heading level="h1">Edit Brand</Heading>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <Heading level="h2" className="text-lg font-semibold mb-4">
                Basic Information
              </Heading>
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="name">
                    Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    required
                    placeholder="Enter brand name"
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
                  <Text className="text-xs text-gray-500">
                    URL-friendly identifier for the brand
                  </Text>
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={5}
                    placeholder="Enter brand description"
                  />
                </div>
              </div>
            </div>

            {/* SEO Settings */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <Heading level="h2" className="text-lg font-semibold mb-4">
                SEO Settings
              </Heading>
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="meta_title">Meta Title</Label>
                    <Text className="text-xs text-gray-500">
                      {formData.meta_title?.length || 0} / 60 characters
                    </Text>
                  </div>
                  <Input
                    id="meta_title"
                    value={formData.meta_title}
                    onChange={(e) =>
                      setFormData({ ...formData, meta_title: e.target.value })
                    }
                    placeholder="SEO title for search engines"
                    maxLength={60}
                  />
                  <Text className="text-xs text-gray-500">
                    Recommended: 50-60 characters
                  </Text>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="meta_desc">Meta Description</Label>
                    <Text className="text-xs text-gray-500">
                      {formData.meta_desc?.length || 0} / 160 characters
                    </Text>
                  </div>
                  <Textarea
                    id="meta_desc"
                    value={formData.meta_desc}
                    onChange={(e) =>
                      setFormData({ ...formData, meta_desc: e.target.value })
                    }
                    rows={3}
                    placeholder="SEO description for search engines"
                    maxLength={160}
                  />
                  <Text className="text-xs text-gray-500">
                    Recommended: 150-160 characters
                  </Text>
                </div>
              </div>
            </div>

            {/* Brand Image */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <Heading level="h2" className="text-lg font-semibold mb-4">
                Brand Image
              </Heading>
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="image_url">Image URL</Label>
                  <Input
                    id="image_url"
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => {
                      const url = e.target.value;
                      setFormData({ ...formData, image_url: url });
                      setImagePreview(url || null);
                    }}
                    placeholder="https://example.com/brand-image.jpg"
                  />
                </div>

                {imagePreview && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-start gap-4">
                      <img
                        src={imagePreview}
                        alt="Brand preview"
                        className="w-32 h-32 object-contain border rounded bg-white"
                        onError={() => setImagePreview(null)}
                      />
                      <div className="flex-1">
                        <Text className="text-sm font-medium mb-2">
                          Image Preview
                        </Text>
                        <Button
                          type="button"
                          variant="secondary"
                          size="small"
                          onClick={() => {
                            setFormData({ ...formData, image_url: "" });
                            setImagePreview(null);
                          }}
                        >
                          Remove Image
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <Label htmlFor="image_file">Upload Image</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="small"
                      onClick={(e) => {
                        e.preventDefault();
                        document.getElementById("image_file")?.click();
                      }}
                      disabled={updateMutation.isPending}
                    >
                      {imagePreview ? "Change Image" : "Choose File"}
                    </Button>
                    <Text className="text-xs text-gray-500">
                      Upload an image file or paste an image URL above
                    </Text>
                  </div>
                  <input
                    id="image_file"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;

                      // Show preview immediately
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setImagePreview(reader.result as string);
                      };
                      reader.readAsDataURL(file);

                      // Upload file to get URL
                      try {
                        const uploadFormData = new FormData();
                        uploadFormData.append("file", file);

                        const baseUrl = import.meta.env.VITE_BACKEND_URL || "/";
                        const response = await fetch(
                          `${baseUrl}/admin/upload`,
                          {
                            method: "POST",
                            body: uploadFormData,
                            credentials: "include",
                          }
                        );

                        if (!response.ok) {
                          throw new Error(
                            `Upload failed: ${response.statusText}`
                          );
                        }

                        const data = (await response.json()) as {
                          url?: string;
                          file?: any;
                        };

                        if (data.url) {
                          setFormData((prev) => ({
                            ...prev,
                            image_url: data.url,
                          }));
                          setImagePreview(data.url);
                          toast.success("Image uploaded successfully");
                        } else {
                          throw new Error("No URL returned from upload");
                        }
                      } catch (error: any) {
                        console.error("Error uploading image:", error);
                        setImagePreview(formData.image_url || null);
                        toast.error(error?.message || "Failed to upload image");
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Products Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <Heading level="h2" className="text-lg font-semibold mb-1">
                    Associated Products
                  </Heading>
                  <Text className="text-sm text-gray-500">
                    {selectedProducts.size} product
                    {selectedProducts.size !== 1 ? "s" : ""} selected
                  </Text>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="small"
                    onClick={async () => {
                      const allProductIds = filteredProducts.map((p) => p.id);
                      const unselectedIds = allProductIds.filter(
                        (id) => !selectedProducts.has(id)
                      );
                      if (unselectedIds.length > 0) {
                        await linkProductsMutation.mutateAsync(unselectedIds);
                        setSelectedProducts(
                          (prev) => new Set([...prev, ...unselectedIds])
                        );
                      }
                    }}
                    disabled={
                      linkProductsMutation.isPending ||
                      unlinkProductMutation.isPending ||
                      filteredProducts.length === 0
                    }
                  >
                    Select All
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="small"
                    onClick={async () => {
                      const selectedInFiltered = filteredProducts
                        .map((p) => p.id)
                        .filter((id) => selectedProducts.has(id));
                      if (selectedInFiltered.length > 0) {
                        await Promise.all(
                          selectedInFiltered.map((id) =>
                            unlinkProductMutation.mutateAsync(id)
                          )
                        );
                        setSelectedProducts((prev) => {
                          const newSet = new Set(prev);
                          selectedInFiltered.forEach((id) => newSet.delete(id));
                          return newSet;
                        });
                      }
                    }}
                    disabled={
                      linkProductsMutation.isPending ||
                      unlinkProductMutation.isPending ||
                      filteredProducts.filter((p) => selectedProducts.has(p.id))
                        .length === 0
                    }
                  >
                    Deselect All
                  </Button>
                </div>
              </div>

              <div className="mb-4">
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {isLoadingProducts ? (
                <div className="py-8 text-center">
                  <Text className="text-gray-500">Loading products...</Text>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-2">
                  {filteredProducts.length === 0 ? (
                    <div className="py-8 text-center">
                      <Text className="text-gray-500">No products found</Text>
                    </div>
                  ) : (
                    filteredProducts.map((product) => {
                      const isSelected = selectedProducts.has(product.id);
                      return (
                        <div
                          key={product.id}
                          className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) =>
                              handleProductToggle(
                                product.id,
                                checked as boolean
                              )
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
          </div>

          {/* Right Column - SEO Preview */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <SEOPreviewComponent
                seoTitle={formData.meta_title || formData.name || ""}
                metaDescription={
                  formData.meta_desc ||
                  formData.description?.substring(0, 160) ||
                  ""
                }
                slug={formData.slug || ""}
                url={
                  formData.slug
                    ? `${
                        seoPreviewConfig.baseUrl ||
                        `https://${seoPreviewConfig.domain}`
                      }/brands/${formData.slug}`
                    : ""
                }
                entityType="brand"
                defaultTitle="Brand Name"
                defaultDescription="Brand description will appear here..."
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => (window.location.href = "/app/brand")}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={updateMutation.isPending}>
              Save Changes
            </Button>
          </div>
        </div>
      </form>

      <Toaster />
    </Container>
  );
};

export const config = defineRouteConfig({
  label: "Edit Brand",
  icon: Tag,
});

export default BrandEditPage;
