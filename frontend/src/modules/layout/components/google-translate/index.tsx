"use client"

import { useEffect, useRef } from "react"

/**
 * Google Translate Widget Component
 * 
 * This component integrates Google Translate widget into the Next.js app.
 * The widget allows users to translate the page using Google Translate.
 * 
 * Note: Google Translate manipulates the DOM directly, which can conflict with React.
 * We use a ref and key to prevent React from trying to reconcile nodes that
 * Google Translate has modified.
 * 
 * Reference: https://stackoverflow.com/questions/79500999/integrating-google-translate-widget-in-next-js-application
 */
export default function GoogleTranslate() {
  const translateElementRef = useRef<HTMLDivElement>(null)
  const scriptLoadedRef = useRef(false)

  useEffect(() => {
    // Prevent multiple script loads
    if (scriptLoadedRef.current) {
      // If script already loaded, just initialize
      setTimeout(() => initializeTranslate(), 100)
      return
    }

    // Check if script is already loaded (from previous navigation)
    if (window.google?.translate) {
      scriptLoadedRef.current = true
      setTimeout(() => initializeTranslate(), 100)
      return
    }

    // Check if script element already exists
    const existingScript = document.getElementById("google-translate-script")
    if (existingScript) {
      scriptLoadedRef.current = true
      // Wait for script to be ready
      const checkInterval = setInterval(() => {
        if (window.google?.translate) {
          clearInterval(checkInterval)
          initializeTranslate()
        }
      }, 100)
      return () => clearInterval(checkInterval)
    }

    // Load the Google Translate script
    const script = document.createElement("script")
    script.src =
      "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
    script.async = true
    script.id = "google-translate-script"

    // Define the callback function before appending script
    window.googleTranslateElementInit = () => {
      scriptLoadedRef.current = true
      setTimeout(() => initializeTranslate(), 100)
    }

    // Append script to body
    document.body.appendChild(script)

    // Cleanup function - don't remove script to persist across navigation
    return () => {
      // Script persists across navigation to avoid DOM conflicts
    }
  }, [])

  const initializeTranslate = () => {
    if (!translateElementRef.current || !window.google?.translate) {
      return
    }

    // Clear any existing translate element
    if (translateElementRef.current.firstChild) {
      translateElementRef.current.innerHTML = ""
    }

    try {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: "en,es,fr,de,it,pt,zh,ja,ko,ar,ru,hi",
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false,
        },
        translateElementRef.current
      )
    } catch (error) {
      console.error("Error initializing Google Translate:", error)
    }
  }

  return (
    <div
      key="google-translate-element"
      ref={translateElementRef}
      id="google_translate_element"
      className="google-translate-wrapper"
    />
  )
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    googleTranslateElementInit?: () => void
    google?: {
      translate: {
        TranslateElement: new (
          options: {
            pageLanguage: string
            includedLanguages?: string
            layout?: number
            autoDisplay?: boolean
          },
          element: HTMLElement
        ) => void
        TranslateElement: {
          InlineLayout: {
            SIMPLE: number
            HORIZONTAL: number
            VERTICAL: number
          }
        }
      }
    }
  }
}
