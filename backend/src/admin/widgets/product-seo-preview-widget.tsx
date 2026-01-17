import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { AdminProduct, DetailWidgetProps } from "@medusajs/types";
import { seoPreviewConfig } from "./seo-preview-config";
import { SEOPreviewComponent } from "./seo-preview-component";

// The widget
const ProductSEOPreviewWidget = ({ data }: DetailWidgetProps<AdminProduct>) => {
  // Get SEO fields from metadata
  const metadata = data.metadata || {};
  const seoTitle =
    (typeof metadata.seo_title === "string" ? metadata.seo_title : null) ||
    data.title ||
    "";
  const metaDescription =
    (typeof metadata.meta_description === "string"
      ? metadata.meta_description
      : null) ||
    data.description?.substring(0, 160) ||
    "";
  const slug = data.handle || "";

  // Use config values
  const baseUrl =
    seoPreviewConfig.baseUrl || `https://${seoPreviewConfig.domain}`;
  const productUrl = slug ? `${baseUrl}/products/${slug}` : "";

  return (
    <SEOPreviewComponent
      seoTitle={seoTitle}
      metaDescription={metaDescription}
      slug={slug}
      url={productUrl}
      entityType="product"
      defaultTitle="Product Title"
      defaultDescription="Product description will appear here..."
    />
  );
};

// The widget's configurations
export const config = defineWidgetConfig({
  zone: "product.details.after",
});

export default ProductSEOPreviewWidget;
