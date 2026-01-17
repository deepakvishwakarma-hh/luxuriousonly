import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { Container, Heading, Text } from "@medusajs/ui";
import { useState } from "react";
import { seoPreviewConfig } from "./seo-preview-config";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { sdk } from "../lib/config";

type Brand = {
  id: string;
  name: string;
  slug?: string | null;
  description?: string | null;
  meta_title?: string | null;
  meta_desc?: string | null;
};

// The widget
const BrandSEOPreviewWidget = () => {
  const { id } = useParams<{ id: string }>();
  const [previewMode, setPreviewMode] = useState<"mobile" | "desktop">(
    "mobile"
  );
  const [faviconError, setFaviconError] = useState(false);

  // Fetch brand data
  const { data: brandData, isLoading } = useQuery<{
    brand: Brand;
  }>({
    queryKey: ["brand", id],
    queryFn: () =>
      sdk.client.fetch(`/admin/brands/${id}`, {
        query: {
          fields: "id,name,slug,description,meta_title,meta_desc",
        },
      }),
    enabled: !!id,
  });

  if (isLoading || !brandData?.brand) {
    return null;
  }

  const brand = brandData.brand;

  // Get SEO fields
  const seoTitle = brand.meta_title || brand.name || "";
  const metaDescription =
    brand.meta_desc || brand.description?.substring(0, 160) || "";
  const slug = brand.slug || "";

  // Use config values
  const domain = seoPreviewConfig.domain;
  const faviconUrl = seoPreviewConfig.faviconUrl;
  const baseUrl = seoPreviewConfig.baseUrl || `https://${domain}`;
  const brandUrl = slug ? `${baseUrl}/brands/${slug}` : "";

  // Truncate title and description for preview
  const displayTitle =
    seoTitle.length > 60 ? `${seoTitle.substring(0, 60)}...` : seoTitle;
  const displayDescription =
    metaDescription.length > 160
      ? `${metaDescription.substring(0, 160)}...`
      : metaDescription;

  return (
    <Container className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Header Section */}
      <div className="mb-6 pb-4 border-b border-gray-200">
        <Heading
          level="h2"
          className="text-xl font-semibold text-gray-900 mb-2"
        >
          SEO Preview
        </Heading>
        <Text className="text-sm text-gray-500">
          Preview how your brand will appear in search results
        </Text>
      </div>

      {/* Preview Mode Toggle */}
      <div className="mb-4 flex items-center gap-4">
        <Text className="text-sm font-medium text-gray-700">Preview as:</Text>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="preview-mode-brand"
              value="mobile"
              checked={previewMode === "mobile"}
              onChange={() => setPreviewMode("mobile")}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500"
            />
            <Text className="text-sm text-gray-700">Mobile result</Text>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="preview-mode-brand"
              value="desktop"
              checked={previewMode === "desktop"}
              onChange={() => setPreviewMode("desktop")}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500"
            />
            <Text className="text-sm text-gray-700">Desktop result</Text>
          </label>
        </div>
      </div>

      {/* Slug Display */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <Text className="text-xs font-medium text-gray-600 mb-1">Slug:</Text>
        <Text className="text-sm text-gray-900 font-mono">
          {slug || <span className="text-gray-400 italic">No slug set</span>}
        </Text>
        {brandUrl && (
          <Text className="text-xs text-gray-500 mt-1 font-mono">
            {brandUrl}
          </Text>
        )}
      </div>

      {/* Preview Section */}
      <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
        {previewMode === "mobile" ? (
          // Mobile Preview
          <div className="p-4 bg-gray-50">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 max-w-md">
              {/* Website Info */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {!faviconError ? (
                    <img
                      src={faviconUrl}
                      alt="Favicon"
                      className="w-4 h-4 rounded"
                      onError={() => setFaviconError(true)}
                    />
                  ) : (
                    <div className="w-4 h-4 bg-gray-300 rounded flex items-center justify-center">
                      <svg
                        className="w-3 h-3 text-gray-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0A7 7 0 013 18z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                  <div>
                    <Text className="text-xs font-medium text-gray-900">
                      {domain}
                    </Text>
                    <Text className="text-xs text-gray-500 line-clamp-1">
                      {domain} {"›"} brands {"›"} {slug}
                    </Text>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>
              </div>

              {/* Title */}
              <Text
                className="text-base font-normal text-blue-600 leading-6 mb-1"
                style={{
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {displayTitle || "Brand Name"}
              </Text>

              {/* Description */}
              <Text
                className="text-sm text-gray-600 leading-5"
                style={{
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {displayDescription || "Brand description will appear here..."}
              </Text>
            </div>
          </div>
        ) : (
          // Desktop Preview
          <div className="p-6 bg-white">
            <div className="max-w-2xl">
              {/* Favicon and URL */}
              <div className="flex items-center gap-2 mb-1">
                {!faviconError ? (
                  <img
                    src={faviconUrl}
                    alt="Favicon"
                    className="w-4 h-4 rounded"
                    onError={() => setFaviconError(true)}
                  />
                ) : (
                  <div className="w-4 h-4 bg-gray-300 rounded flex items-center justify-center">
                    <svg
                      className="w-3 h-3 text-gray-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0A7 7 0 013 18z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
                <Text className="text-sm text-gray-700">{domain}</Text>
                {slug && (
                  <>
                    <span className="text-gray-400">›</span>
                    <Text className="text-sm text-gray-500 truncate">
                      brands ›{" "}
                      {slug.length > 30 ? `${slug.substring(0, 30)}...` : slug}
                    </Text>
                  </>
                )}
                <button className="ml-auto text-gray-400 hover:text-gray-600">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>
              </div>

              {/* Title with Arrow */}
              <div className="flex items-start gap-2 mb-1">
                <svg
                  className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <Text className="text-xl font-normal text-blue-600 leading-7 hover:underline">
                  {displayTitle || "Brand Name"}
                </Text>
              </div>

              {/* Description */}
              <Text className="text-sm text-gray-600 leading-6">
                {displayDescription || "Brand description will appear here..."}
              </Text>
            </div>
          </div>
        )}
      </div>

      {/* SEO Info */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <Text className="text-xs font-medium text-blue-900 mb-2">
          SEO Information:
        </Text>
        <div className="space-y-1 text-xs text-blue-800">
          <div>
            <span className="font-medium">Title:</span>{" "}
            {seoTitle ? (
              <span>
                {seoTitle.length} / 60 characters
                {seoTitle.length > 60 && (
                  <span className="text-orange-600 ml-1">(too long)</span>
                )}
              </span>
            ) : (
              <span className="text-gray-500 italic">Not set</span>
            )}
          </div>
          <div>
            <span className="font-medium">Description:</span>{" "}
            {metaDescription ? (
              <span>
                {metaDescription.length} / 160 characters
                {metaDescription.length > 160 && (
                  <span className="text-orange-600 ml-1">(too long)</span>
                )}
              </span>
            ) : (
              <span className="text-gray-500 italic">Not set</span>
            )}
          </div>
        </div>
      </div>
    </Container>
  );
};

// The widget's configurations
// Note: Since brands use custom routes, this widget may need to be added directly to the brand edit page
// If widget zones don't work for custom routes, we'll add it to the page component instead
export const config = defineWidgetConfig({
  zone: "product.details.after", // This is a placeholder - may need adjustment
});

export default BrandSEOPreviewWidget;
