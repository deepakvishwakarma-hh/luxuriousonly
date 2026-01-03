"use client"

import { resetPassword } from "@lib/data/customer"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useActionState } from "react"
import { useSearchParams, useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"

const ResetPasswordForm = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const params = useParams()
  const countryCode = params?.countryCode as string | undefined
  const [message, formAction] = useActionState(resetPassword, null)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    const tokenParam = searchParams.get("token")
    const emailParam = searchParams.get("email")

    if (tokenParam && emailParam) {
      setToken(tokenParam)
      setEmail(emailParam)
    }
  }, [searchParams])

  // Redirect to login on success
  useEffect(() => {
    if (hasSubmitted && !message) {
      // Wait a moment to show success message, then redirect
      const timer = setTimeout(() => {
        const accountPath = countryCode ? `/${countryCode}/account` : "/account"
        router.push(accountPath)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [hasSubmitted, message, router, countryCode])

  if (!token || !email) {
    return (
      <div
        className="max-w-sm w-full flex flex-col items-center"
        data-testid="reset-password-error"
      >
        <h1 className="text-large-semi uppercase mb-6">Invalid Reset Link</h1>
        <p className="text-center text-base-regular text-ui-fg-base mb-8">
          The password reset link is invalid or has expired. Please request a
          new password reset.
        </p>
        <LocalizedClientLink
          href="/forget-password"
          className="text-small-regular text-ui-fg-subtle hover:text-ui-fg-base underline"
          data-testid="request-reset-link"
        >
          Request new reset link
        </LocalizedClientLink>
      </div>
    )
  }

  if (hasSubmitted && !message) {
    return (
      <div
        className="max-w-sm w-full flex flex-col items-center"
        data-testid="reset-password-success"
      >
        <h1 className="text-large-semi uppercase mb-6">Password Reset</h1>
        <p className="text-center text-base-regular text-ui-fg-base mb-8">
          Your password has been successfully reset. Redirecting to sign in...
        </p>
        <LocalizedClientLink
          href="/account"
          className="text-small-regular text-ui-fg-subtle hover:text-ui-fg-base underline"
          data-testid="back-to-login-link"
        >
          Go to sign in
        </LocalizedClientLink>
      </div>
    )
  }

  return (
    <div
      className="max-w-sm w-full flex flex-col items-center"
      data-testid="reset-password-form-page"
    >
      <h1 className="text-large-semi uppercase mb-6">Reset password</h1>
      <p className="text-center text-base-regular text-ui-fg-base mb-8">
        Enter your new password below.
      </p>
      <form
        className="w-full"
        action={formAction}
        onSubmit={() => setHasSubmitted(true)}
      >
        <input type="hidden" name="token" value={token} />
        <input type="hidden" name="email" value={email} />
        <div className="flex flex-col w-full gap-y-2">
          <Input
            label="New Password"
            name="password"
            type="password"
            title="Enter a new password (minimum 8 characters)."
            autoComplete="new-password"
            required
            minLength={8}
            data-testid="password-input"
          />
          <Input
            label="Confirm Password"
            name="confirm_password"
            type="password"
            title="Confirm your new password."
            autoComplete="new-password"
            required
            minLength={8}
            data-testid="confirm-password-input"
          />
        </div>
        <ErrorMessage
          error={message}
          data-testid="reset-password-error-message"
        />
        <SubmitButton
          data-testid="reset-password-button"
          className="w-full mt-6"
        >
          Reset password
        </SubmitButton>
      </form>
      <span className="text-center text-ui-fg-base text-small-regular mt-6">
        Remember your password?{" "}
        <LocalizedClientLink
          href="/account"
          className="underline"
          data-testid="back-to-login-link"
        >
          Sign in
        </LocalizedClientLink>
        .
      </span>
    </div>
  )
}

export default ResetPasswordForm

