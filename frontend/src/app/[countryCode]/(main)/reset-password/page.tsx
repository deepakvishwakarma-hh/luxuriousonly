import { Metadata } from "next"

import ResetPasswordForm from "@modules/account/components/reset-password-form"

export const metadata: Metadata = {
  title: "Reset password",
  description: "Reset your password for your Medusa Store account.",
}

export default function ResetPasswordPage() {
  return (
    <div className="w-full flex items-center justify-center px-8 py-8">
      <ResetPasswordForm />
    </div>
  )
}

