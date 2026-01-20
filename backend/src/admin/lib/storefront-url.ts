/**
 * Get the storefront URL from various sources
 * Priority: window config > environment variables > default
 */
export function getStorefrontUrl(): string {
  // Try to get from window (injected by Medusa admin)
  if (typeof window !== "undefined") {
    const windowUrl = (window as any).__MEDUSA_STOREFRONT_URL__;
    if (windowUrl) return windowUrl;
  }

  // Try environment variables
  const envUrl =
    import.meta.env.VITE_MEDUSA_STOREFRONT_URL ||
    import.meta.env.VITE_STOREFRONT_URL;
  if (envUrl) return envUrl;

  // Default fallback
  return "http://localhost:8000";
}

/**
 * Get default country code for frontend URLs
 */
export function getDefaultCountryCode(): string {
  return "us"; // You can make this configurable
}
