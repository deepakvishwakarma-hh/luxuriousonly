import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { AdminProductCategory, DetailWidgetProps } from "@medusajs/types";
import { seoPreviewConfig } from "./seo-preview-config";
import { SEOPreviewComponent } from "./seo-preview-component";

// The widget
const CategorySEOPreviewWidget = ({
  data,
}: DetailWidgetProps<AdminProductCategory>) => {
  // Get SEO fields from metadata
  const metadata = data.metadata || {};
  const seoTitle = metadata.seo_title || data.name || "";
  const metaDescription =
    metadata.meta_description || data.description?.substring(0, 160) || "";
  const slug = data.handle || "";

  // Use config values
  const baseUrl = seoPreviewConfig.baseUrl || `https://${seoPreviewConfig.domain}`;
  const categoryUrl = slug ? `${baseUrl}/categories/${slug}` : "";

  return (
    <SEOPreviewComponent
      seoTitle={seoTitle}
      metaDescription={metaDescription}
      slug={slug}
      url={categoryUrl}
      entityType="category"
      defaultTitle="Category Name"
      defaultDescription="Category description will appear here..."
    />
  );
};

// The widget's configurations
export const config = defineWidgetConfig({
  zone: "product_category.details.after",
});

export default CategorySEOPreviewWidget;
