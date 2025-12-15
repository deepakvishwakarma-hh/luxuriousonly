"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string
            callback: (response: { credential: string }) => void
          }) => void
          renderButton: (
            element: HTMLElement,
            config: {
              type: string
              theme: string
              size: string
              text: string
              width?: string
            }
          ) => void
          prompt: () => void
        }
      }
    }
  }
}

type Props = {
  countryCode?: string
}

const GoogleLoginButton = ({ countryCode }: Props) => {
  const buttonRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

    if (!clientId) {
      console.error(
        "Google Client ID not configured. Please set NEXT_PUBLIC_GOOGLE_CLIENT_ID in your environment variables."
      )
      console.error("Current env check:", {
        hasClientId: !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        nodeEnv: process.env.NODE_ENV,
      })
      return
    }

    // Validate Client ID format (should end with .apps.googleusercontent.com)
    if (
      !clientId.includes(".apps.googleusercontent.com") &&
      !clientId.match(/^\d+-[a-zA-Z0-9]+\.apps\.googleusercontent\.com$/)
    ) {
      console.warn(
        "Google Client ID format looks incorrect. It should be in format: XXXX-XXXX.apps.googleusercontent.com"
      )
      console.warn("Current Client ID:", clientId.substring(0, 20) + "...")
    }

    // Load Google Identity Services script
    const script = document.createElement("script")
    script.src = "https://accounts.google.com/gsi/client"
    script.async = true
    script.defer = true
    script.onload = () => {
      if (window.google && buttonRef.current) {
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleCredentialResponse,
          })

          window.google.accounts.id.renderButton(buttonRef.current, {
            type: "standard",
            theme: "outline",
            size: "large",
            text: "signin_with",
            width: "100%",
          })
        } catch (error) {
          console.error("Error initializing Google Sign-In:", error)
        }
      }
    }
    script.onerror = () => {
      console.error("Failed to load Google Identity Services script")
    }
    document.body.appendChild(script)

    return () => {
      // Cleanup script if component unmounts
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [])

  const handleCredentialResponse = async (response: { credential: string }) => {
    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ credential: response.credential }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.requiresEmailPassword) {
          alert(
            "An account with this email already exists. Please login with your email and password first."
          )
        } else {
          console.error("Google OAuth API error:", data)
          alert(
            data.error || "Authentication failed. Check console for details."
          )
        }
        return
      }

      // Success - redirect to account page
      if (countryCode) {
        router.push(`/${countryCode}/account`)
      } else {
        router.push("/account")
      }
      router.refresh()
    } catch (error) {
      console.error("Google login error:", error)
      alert("An error occurred during authentication. Please try again.")
    }
  }

  if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
    if (process.env.NODE_ENV === "development") {
      return (
        <div className="w-full p-4 border border-yellow-500 rounded bg-yellow-50">
          <p className="text-sm text-yellow-800">
            ⚠️ Google OAuth not configured. Please set{" "}
            <code className="bg-yellow-100 px-1 rounded">
              NEXT_PUBLIC_GOOGLE_CLIENT_ID
            </code>{" "}
            in your{" "}
            <code className="bg-yellow-100 px-1 rounded">.env.local</code> file.
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="w-full">
      <div ref={buttonRef} className="w-full" />
    </div>
  )
}

export default GoogleLoginButton
