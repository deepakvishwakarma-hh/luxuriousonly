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
};

const limit = 15;

const BrandsPage = () => {
  const columnHelper = createDataTableColumnHelper<Brand>();

  const handleOpenEdit = (brand: Brand) => {
    window.location.href = `/app/brand/${brand.id}`;
  };

  const columns = [
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
    columnHelper.accessor("products", {
      header: "Products",
      cell: ({ row }) => {
        const productCount = row.original.products?.length || 0;
        return (
          <Text className="text-ui-fg-subtle">{productCount} products</Text>
        );
      },
    }),
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
  });

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
          fields: ["*", "products.*"],
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

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      description: "",
      meta_title: "",
      meta_desc: "",
    });
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
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
