import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { Container, Button, Text } from "@medusajs/ui";
import { AdminProductCategory, DetailWidgetProps } from "@medusajs/types";
import { getStorefrontUrl, getDefaultCountryCode } from "../lib/storefront-url";

// Simple external link icon component
const ExternalLinkIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
    />
  </svg>
);

// Widget to show "View on Frontend" button for categories
const ViewCategoryFrontendWidget = ({
  data,
}: DetailWidgetProps<AdminProductCategory>) => {
  const storefrontUrl = getStorefrontUrl();
  const defaultCountryCode = getDefaultCountryCode();

  // Build frontend URL: /{countryCode}/categories/{handle}
  // Categories can be nested, so we use the handle
  const frontendUrl = data.handle
    ? `${storefrontUrl}/${defaultCountryCode}/categories/${data.handle}`
    : null;

  const handleViewFrontend = () => {
    if (frontendUrl) {
      window.open(frontendUrl, "_blank");
    }
  };

  if (!data.handle || !frontendUrl) {
    return null; // Don't show button if category doesn't have a handle
  }

  return (
    <Container className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm mb-4">
      <div className="flex items-center justify-between">
        <div>
          <Text className="text-sm font-medium text-gray-900">
            View on Frontend
          </Text>
          <Text className="text-xs text-gray-500 mt-1">
            Open this category in a new tab
          </Text>
        </div>
        <Button
          variant="secondary"
          size="small"
          onClick={handleViewFrontend}
          className="flex items-center gap-2"
        >
          <ExternalLinkIcon className="w-4 h-4" />
          View Category
        </Button>
      </div>
    </Container>
  );
};

export const config = defineWidgetConfig({
  zone: "product_category.details.before",
});

export default ViewCategoryFrontendWidget;
