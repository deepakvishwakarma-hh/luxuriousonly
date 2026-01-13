import Medusa from "@medusajs/js-sdk"

// Defaults to standard port for Medusa server
// Check NEXT_PUBLIC_MEDUSA_BACKEND_URL first (for client-side), then MEDUSA_BACKEND_URL (for server-side)
let MEDUSA_BACKEND_URL = 
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 
  process.env.MEDUSA_BACKEND_URL || 
  "http://localhost:9000"

export const sdk = new Medusa({
  baseUrl: MEDUSA_BACKEND_URL,
  debug: process.env.NODE_ENV === "development",
  publishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
})
