import { defineRouteConfig } from "@medusajs/admin-sdk";
import { Photo } from "@medusajs/icons";
import {
  Container,
  Heading,
  Toaster,
  Text,
  Button,
  Input,
  Label,
} from "@medusajs/ui";
import { sdk } from "../../../lib/config";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";

type Carousel = {
  id: string;
  image_url1?: string | null;
  image_url2?: string | null;
  link?: string | null;
  order: number;
  created_at?: Date;
  updated_at?: Date;
};

type CarouselFormData = {
  image_url1?: string;
  image_url2?: string;
  link?: string;
  order?: number;
};

const CarouselEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<CarouselFormData>({
    image_url1: "",
    image_url2: "",
    link: "",
    order: 0,
  });
  const [imagePreview1, setImagePreview1] = useState<string | null>(null);
  const [imagePreview2, setImagePreview2] = useState<string | null>(null);

  // Fetch carousel data
  const { data: carouselData, isLoading: isLoadingCarousel } = useQuery<{
    carousel: Carousel;
  }>({
    queryKey: ["carousel", id],
    queryFn: () =>
      sdk.client.fetch(`/admin/carousels/${id}`, {
        query: {
          fields: "*",
        },
      }),
    enabled: !!id,
  });

  // Update form data when carousel loads
  useEffect(() => {
    if (carouselData?.carousel) {
      const carousel = carouselData.carousel;
      setFormData({
        image_url1: carousel.image_url1 || "",
        image_url2: carousel.image_url2 || "",
        link: carousel.link || "",
        order: carousel.order || 0,
      });
      setImagePreview1(carousel.image_url1 || null);
      setImagePreview2(carousel.image_url2 || null);
    }
  }, [carouselData]);

  const updateMutation = useMutation({
    mutationFn: async (data: CarouselFormData) => {
      return sdk.client.fetch(`/admin/carousels/${id}`, {
        method: "PUT",
        body: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["carousel", id] });
      queryClient.invalidateQueries({ queryKey: ["carousels"] });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      image_url1: formData.image_url1 || undefined,
      image_url2: formData.image_url2 || undefined,
      link: formData.link || undefined,
      order: formData.order || 0,
    };
    await updateMutation.mutateAsync(submitData);
  };

  if (isLoadingCarousel) {
    return (
      <Container>
        <Text>Loading...</Text>
      </Container>
    );
  }

  if (!carouselData?.carousel) {
    return (
      <Container>
        <div className="mb-6">
          <Button
            variant="secondary"
            onClick={() => (window.location.href = "/app/carousel")}
          >
            ← Back to Carousels
          </Button>
        </div>
        <Text>Carousel not found</Text>
      </Container>
    );
  }

  return (
    <Container>
      <div className="mb-6">
        <Button
          variant="secondary"
          onClick={() => (window.location.href = "/app/carousel")}
        >
          ← Back to Carousels
        </Button>
      </div>

      <Heading className="mb-6">Edit Carousel</Heading>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="order">Order *</Label>
            <Input
              id="order"
              type="number"
              value={formData.order || 0}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  order: parseInt(e.target.value) || 0,
                })
              }
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="link">Link</Label>
            <Input
              id="link"
              type="text"
              value={formData.link}
              onChange={(e) =>
                setFormData({ ...formData, link: e.target.value })
              }
              placeholder="https://example.com"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="image_url1">Desktop Image URL</Label>
            <Input
              id="image_url1"
              type="url"
              value={formData.image_url1}
              onChange={(e) => {
                const url = e.target.value;
                setFormData({ ...formData, image_url1: url });
                setImagePreview1(url || null);
              }}
              placeholder="https://example.com/desktop-image.jpg"
            />
            {imagePreview1 && (
              <div className="mt-2">
                <img
                  src={imagePreview1}
                  alt="Desktop Preview"
                  className="max-w-xs max-h-48 object-contain border rounded"
                  onError={() => setImagePreview1(null)}
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="small"
                  className="mt-2"
                  onClick={() => {
                    setFormData({ ...formData, image_url1: "" });
                    setImagePreview1(null);
                  }}
                >
                  Remove Image
                </Button>
              </div>
            )}
            <div className="mt-2">
              <Label htmlFor="image_file1" className="cursor-pointer">
                <Button
                  type="button"
                  variant="secondary"
                  size="small"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById("image_file1")?.click();
                  }}
                  disabled={updateMutation.isPending}
                >
                  {imagePreview1
                    ? "Change Desktop Image"
                    : "Upload Desktop Image"}
                </Button>
              </Label>
              <input
                id="image_file1"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setImagePreview1(reader.result as string);
                  };
                  reader.readAsDataURL(file);

                  try {
                    const uploadFormData = new FormData();
                    uploadFormData.append("file", file);

                    const baseUrl = import.meta.env.VITE_BACKEND_URL || "/";
                    const response = await fetch(`${baseUrl}/admin/upload`, {
                      method: "POST",
                      body: uploadFormData,
                      credentials: "include",
                    });

                    if (!response.ok) {
                      throw new Error(`Upload failed: ${response.statusText}`);
                    }

                    const data = (await response.json()) as {
                      url?: string;
                      file?: any;
                    };

                    if (data.url) {
                      setFormData((prev) => ({
                        ...prev,
                        image_url1: data.url,
                      }));
                      setImagePreview1(data.url);
                    } else {
                      throw new Error("No URL returned from upload");
                    }
                  } catch (error) {
                    console.error("Error uploading image:", error);
                    setImagePreview1(formData.image_url1 || null);
                    alert("Failed to upload image. Please try again.");
                  }
                }}
              />
              <Text className="text-ui-fg-subtle text-xs mt-1">
                Upload an image file or paste an image URL
              </Text>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="image_url2">Mobile Image URL</Label>
            <Input
              id="image_url2"
              type="url"
              value={formData.image_url2}
              onChange={(e) => {
                const url = e.target.value;
                setFormData({ ...formData, image_url2: url });
                setImagePreview2(url || null);
              }}
              placeholder="https://example.com/mobile-image.jpg"
            />
            {imagePreview2 && (
              <div className="mt-2">
                <img
                  src={imagePreview2}
                  alt="Mobile Preview"
                  className="max-w-xs max-h-48 object-contain border rounded"
                  onError={() => setImagePreview2(null)}
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="small"
                  className="mt-2"
                  onClick={() => {
                    setFormData({ ...formData, image_url2: "" });
                    setImagePreview2(null);
                  }}
                >
                  Remove Image
                </Button>
              </div>
            )}
            <div className="mt-2">
              <Label htmlFor="image_file2" className="cursor-pointer">
                <Button
                  type="button"
                  variant="secondary"
                  size="small"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById("image_file2")?.click();
                  }}
                  disabled={updateMutation.isPending}
                >
                  {imagePreview2
                    ? "Change Mobile Image"
                    : "Upload Mobile Image"}
                </Button>
              </Label>
              <input
                id="image_file2"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setImagePreview2(reader.result as string);
                  };
                  reader.readAsDataURL(file);

                  try {
                    const uploadFormData = new FormData();
                    uploadFormData.append("file", file);

                    const baseUrl = import.meta.env.VITE_BACKEND_URL || "/";
                    const response = await fetch(`${baseUrl}/admin/upload`, {
                      method: "POST",
                      body: uploadFormData,
                      credentials: "include",
                    });

                    if (!response.ok) {
                      throw new Error(`Upload failed: ${response.statusText}`);
                    }

                    const data = (await response.json()) as {
                      url?: string;
                      file?: any;
                    };

                    if (data.url) {
                      setFormData((prev) => ({
                        ...prev,
                        image_url2: data.url,
                      }));
                      setImagePreview2(data.url);
                    } else {
                      throw new Error("No URL returned from upload");
                    }
                  } catch (error) {
                    console.error("Error uploading image:", error);
                    setImagePreview2(formData.image_url2 || null);
                    alert("Failed to upload image. Please try again.");
                  }
                }}
              />
              <Text className="text-ui-fg-subtle text-xs mt-1">
                Upload an image file or paste an image URL
              </Text>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="secondary"
              onClick={() => (window.location.href = "/app/carousel")}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={updateMutation.isPending}>
              Update Carousel
            </Button>
          </div>
        </div>
      </form>

      <Toaster />
    </Container>
  );
};

export const config = defineRouteConfig({
  label: "Edit Carousel",
  icon: Photo,
});

export default CarouselEditPage;
