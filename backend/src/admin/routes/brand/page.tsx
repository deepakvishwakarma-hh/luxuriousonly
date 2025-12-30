import { defineRouteConfig } from "@medusajs/admin-sdk";
import { Tag } from "@medusajs/icons";
import {
  createDataTableColumnHelper,
  Container,
  DataTable,
  useDataTable,
  Heading,
  Toaster,
  DataTablePaginationState,
  Text,
  Button,
  Input,
  Textarea,
  Label,
  DropdownMenu,
} from "@medusajs/ui";
import { sdk } from "../../lib/config";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { HttpTypes } from "@medusajs/framework/types";

type Brand = {
  id: string;
  name: string;
  slug?: string | null;
  description?: string | null;
  meta_title?: string | null;
  meta_desc?: string | null;
  image_url?: string | null;
  created_at: Date;
  updated_at: Date;
  products?: HttpTypes.AdminProduct[];
};

type BrandFormData = {
  name: string;
  slug?: string;
  description?: string;
  meta_title?: string;
  meta_desc?: string;
  image_url?: string;
};

const limit = 15;

const BrandsPage = () => {
  const columnHelper = createDataTableColumnHelper<Brand>();

  const handleOpenEdit = (brand: Brand) => {
    window.location.href = `/app/brand/${brand.id}`;
  };

  const columns = [
    columnHelper.accessor("image_url", {
      header: "Image",
      cell: ({ row }) => {
        const imageUrl = row.original.image_url;
        if (!imageUrl) {
          return <Text className="text-ui-fg-subtle">-</Text>;
        }
        return (
          <div className="w-16 h-16">
            <img
              src={imageUrl}
              alt={row.original.name}
              className="w-full h-full object-cover rounded border"
              onError={(e) => {
                (e.
                  as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        );
      },
    }),
    columnHelper.accessor("name", {
      header: "Name",
    }),
    columnHelper.accessor("description", {
      header: "Description",
      cell: ({ row }) => {
        return (
          <Text className="text-ui-fg-subtle max-w-md truncate">
            {row.original.description || "-"}
          </Text>
        );
      },
    }),
    // columnHelper.accessor("products", {
    //   header: "Products",
    //   cell: ({ row }) => {
    //     const productCount = row.original.products?.length || 0;
    //     return (
    //       <Text className="text-ui-fg-subtle">{productCount} products</Text>
    //     );
    //   },
    // }),
    columnHelper.display({
      id: "actions",
      header: "",
      cell: ({ row }) => {
        return (
          <DropdownMenu>
            <DropdownMenu.Trigger asChild>
              <Button variant="transparent" size="small">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M8 9C8.55228 9 9 8.55228 9 8C9 7.44772 8.55228 7 8 7C7.44772 7 7 7.44772 7 8C7 8.55228 7.44772 9 8 9Z"
                    fill="currentColor"
                  />
                  <path
                    d="M8 4C8.55228 4 9 3.55228 9 3C9 2.44772 8.55228 2 8 2C7.44772 2 7 2.44772 7 3C7 3.55228 7.44772 4 8 4Z"
                    fill="currentColor"
                  />
                  <path
                    d="M8 14C8.55228 14 9 13.5523 9 13C9 12.4477 8.55228 12 8 12C7.44772 12 7 12.4477 7 13C7 13.5523 7.44772 14 8 14Z"
                    fill="currentColor"
                  />
                </svg>
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
              <DropdownMenu.Item
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenEdit(row.original);
                }}
              >
                Edit
              </DropdownMenu.Item>
              <DropdownMenu.Separator />
              <DropdownMenu.Item
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(row.original);
                }}
                className="text-ui-fg-destructive"
              >
                Delete
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu>
        );
      },
    }),
  ];
  const [pagination, setPagination] = useState<DataTablePaginationState>({
    pageSize: limit,
    pageIndex: 0,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<BrandFormData>({
    name: "",
    slug: "",
    description: "",
    meta_title: "",
    meta_desc: "",
    image_url: "",
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<{
    brands: Brand[];
    count: number;
    limit: number;
    offset: number;
  }>({
    queryKey: ["brands", pagination.pageIndex, pagination.pageSize],
    queryFn: () =>
      sdk.client.fetch("/admin/brands", {
        query: {
          offset: pagination.pageIndex * pagination.pageSize,
          limit: pagination.pageSize,
          order: "-created_at",
          // fields: ["*", "products.*"],
        },
      }),
  });

  const createMutation = useMutation({
    mutationFn: async (data: BrandFormData) => {
      return sdk.client.fetch("/admin/brands", {
        method: "POST",
        body: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      setIsModalOpen(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return sdk.client.fetch(`/admin/brands/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
    },
  });

  const handleDelete = (brand: Brand) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${brand.name}"? This action cannot be undone.`
      )
    ) {
      deleteMutation.mutate(brand.id);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      description: "",
      meta_title: "",
      meta_desc: "",
      image_url: "",
    });
    setImagePreview(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // If image_url is a data URL, you might want to upload it first
    // For now, we'll send it as-is (data URLs work but are not ideal for production)
    const submitData = {
      ...formData,
      image_url: formData.image_url || undefined,
    };
    createMutation.mutate(submitData);
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

  const table = useDataTable({
    columns,
    data: data?.brands || [],
    rowCount: data?.count || 0,
    isLoading,
    pagination: {
      state: pagination,
      onPaginationChange: setPagination,
    },
    getRowId: (row) => row.id,
  });

  const hasBrands = !isLoading && (data?.count ?? 0) > 0;

  return (
    <Container>
      <DataTable instance={table}>
        <DataTable.Toolbar className="flex flex-col items-start justify-between gap-2 md:flex-row md:items-center">
          <Heading>Brands</Heading>
          <Button onClick={handleOpenCreate}>Create Brand</Button>
        </DataTable.Toolbar>
        {hasBrands ? (
          <>
            <DataTable.Table />
            <DataTable.Pagination />
          </>
        ) : (
          !isLoading && (
            <div className="py-12 flex justify-center">
              <Text className="text-ui-fg-subtle">No brands found</Text>
            </div>
          )
        )}
      </DataTable>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
            <div className="p-6 border-b">
              <Heading>Create Brand</Heading>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="p-6 flex flex-col gap-4">
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
                  {imagePreview && (
                    <div className="mt-2">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="max-w-xs max-h-48 object-contain border rounded"
                        onError={() => setImagePreview(null)}
                      />
                    </div>
                  )}
                  <div className="mt-2">
                    <Label htmlFor="image_file" className="cursor-pointer">
                      <Button
                        type="button"
                        variant="secondary"
                        size="small"
                        onClick={(e) => {
                          e.preventDefault();
                          document.getElementById("image_file")?.click();
                        }}
                        disabled={createMutation.isPending}
                      >
                        Upload Image
                      </Button>
                    </Label>
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

                          // Use native fetch for file uploads
                          const baseUrl =
                            import.meta.env.VITE_BACKEND_URL || "/";
                          const response = await fetch(
                            `${baseUrl}/admin/upload`,
                            {
                              method: "POST",
                              body: uploadFormData,
                              credentials: "include", // Include cookies for auth
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
                          } else {
                            throw new Error("No URL returned from upload");
                          }
                        } catch (error) {
                          console.error("Error uploading image:", error);
                          setImagePreview(null);
                          alert("Failed to upload image. Please try again.");
                        }
                      }}
                    />
                    <Text className="text-ui-fg-subtle text-xs mt-1">
                      Upload an image file or paste an image URL
                    </Text>
                  </div>
                </div>
              </div>
              <div className="p-6 border-t flex justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" isLoading={createMutation.isPending}>
                  Create
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Toaster />
    </Container>
  );
};

export const config = defineRouteConfig({
  label: "Brands",
  icon: Tag,
});

export default BrandsPage;
