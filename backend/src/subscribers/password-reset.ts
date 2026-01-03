import type {
  SubscriberArgs,
  SubscriberConfig,
} from "@medusajs/framework"

export default async function passwordResetHandler({
  event: { data },
  container,
}: SubscriberArgs<{
  entity_id: string
  token: string
  actor_type: string
}>) {
  const { entity_id: email, token, actor_type } = data

  console.log(`[Password Reset] Event received for actor_type: ${actor_type}, email: ${email}`)

  // Only handle customer password resets
  if (actor_type !== "customer") {
    console.log(`[Password Reset] Skipping non-customer reset (actor_type: ${actor_type})`)
    return
  }

  try {
    // Get storefront URL from environment variables
    const storefrontUrl =
      process.env.STOREFRONT_URL ||
      process.env.NEXT_PUBLIC_BASE_URL ||
      "http://localhost:8000"

    // Construct the reset password URL
    const resetUrl = `${storefrontUrl}/reset-password?token=${encodeURIComponent(
      token
    )}&email=${encodeURIComponent(email)}`

    console.log(`[Password Reset] Reset URL generated: ${resetUrl}`)

    // Log the reset link to console
    console.log("\n" + "=".repeat(80))
    console.log("[Password Reset] 🔐 PASSWORD RESET LINK")
    console.log("=".repeat(80))
    console.log(`[Password Reset] Email: ${email}`)
    console.log(`[Password Reset] Token: ${token}`)
    console.log(`[Password Reset] Reset URL: ${resetUrl}`)
    console.log("=".repeat(80) + "\n")
  } catch (error: any) {
    console.error(`[Password Reset] ❌ Error in password reset handler: ${error.message}`)
    console.error(`[Password Reset]    Stack: ${error.stack}`)
    // Don't throw - we don't want to break the password reset flow if email sending fails
  }
}

export const config: SubscriberConfig = {
  event: "auth.password_reset",
}

