"use client"

import { forgotPassword } from "@lib/data/customer"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useActionState } from "react"
import { useState } from "react"

const ResetPassword = () => {
  const [message, formAction] = useActionState(forgotPassword, null)
  const [hasSubmitted, setHasSubmitted] = useState(false)

  if (hasSubmitted && !message) {
    return (
      <div
        className="max-w-sm w-full flex flex-col items-center"
        data-testid="reset-password-success"
      >
        <h1 className="text-large-semi uppercase mb-6">Check your email</h1>
        <p className="text-center text-base-regular text-ui-fg-base mb-8">
          We've sent a password reset link to your email address. Please check
          your inbox and follow the instructions to reset your password.
        </p>
        <LocalizedClientLink
          href="/account"
          className="text-small-regular text-ui-fg-subtle hover:text-ui-fg-base underline"
          data-testid="back-to-login-link"
        >
          Back to sign in
        </LocalizedClientLink>
      </div>
    )
  }

  return (
    <div
      className="max-w-sm w-full flex flex-col items-center"
      data-testid="reset-password-page"
    >
      <h1 className="text-large-semi uppercase mb-6">Reset password</h1>
      <p className="text-center text-base-regular text-ui-fg-base mb-8">
        Enter your email address and we'll send you a link to reset your
        password.
      </p>
      <form
        className="w-full"
        action={formAction}
        onSubmit={() => setHasSubmitted(true)}
      >
        <div className="flex flex-col w-full gap-y-2">
          <Input
            label="Email"
            name="email"
            type="email"
            title="Enter a valid email address."
            autoComplete="email"
            required
            data-testid="email-input"
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
          Send reset link
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

export default ResetPassword
