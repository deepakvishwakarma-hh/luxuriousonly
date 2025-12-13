import { Metadata } from "next"

import ResetPassword from "@modules/account/components/reset-password"

export const metadata: Metadata = {
  title: "Reset password",
  description: "Reset your password for your Medusa Store account.",
}

export default function ForgetPasswordPage() {
  return (
    <div className="w-full flex items-center justify-center px-8 py-8">
      <ResetPassword />
    </div>
  )
}
