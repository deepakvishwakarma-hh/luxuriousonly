import { NextRequest, NextResponse } from "next/server"
import { sdk } from "@lib/config"
import { setAuthToken, getCacheTag } from "@lib/data/cookies"
import { revalidateTag } from "next/cache"
import { transferCart } from "@lib/data/customer"

// Dynamic import to avoid type issues
let OAuth2Client: any
let client: any = null

if (process.env.GOOGLE_CLIENT_ID) {
    try {
        const googleAuth = require("google-auth-library")
        OAuth2Client = googleAuth.OAuth2Client
        client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
    } catch (error) {
        console.error("Failed to load google-auth-library:", error)
    }
}

export async function POST(request: NextRequest) {
    try {
        const { credential } = await request.json()

        if (!credential) {
            return NextResponse.json(
                { error: "No credential provided" },
                { status: 400 }
            )
        }

        if (!process.env.GOOGLE_CLIENT_ID || !client) {
            return NextResponse.json(
                { error: "Google OAuth not configured. Please set GOOGLE_CLIENT_ID environment variable." },
                { status: 500 }
            )
        }

        // Verify the Google ID token
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        })

        const payload = ticket.getPayload()

        if (!payload) {
            return NextResponse.json(
                { error: "Invalid token payload" },
                { status: 400 }
            )
        }

        const { email, given_name, family_name, sub: googleId } = payload

        if (!email) {
            return NextResponse.json(
                { error: "Email not provided by Google" },
                { status: 400 }
            )
        }

        let token: string | null = null
        let customer

        // Generate a secure random password for Google-authenticated users
        // This password is stored but users won't need to use it since they login via Google
        const googlePassword = `google_${googleId}_${Buffer.from(email).toString('base64').slice(0, 16)}`

        // Helper function to check if error is "user already exists"
        const isUserExistsError = (error: any): boolean => {
            const errorMessage = error?.message || error?.toString() || ""
            const errorString = errorMessage.toLowerCase()
            return (
                errorString.includes("already exists") ||
                errorString.includes("already registered") ||
                errorString.includes("duplicate") ||
                errorString.includes("email already") ||
                (error?.response?.status === 400 && errorString.includes("email"))
            )
        }

        try {
            // Step 1: Try to register (create auth account)
            let registrationSuccess = false
            try {
                await sdk.auth.register("customer", "emailpass", {
                    email,
                    password: googlePassword,
                })
                registrationSuccess = true
            } catch (regError: any) {
                // Check if it's actually a "user exists" error
                if (isUserExistsError(regError)) {
                    // User exists - try to login with Google password
                    // This will work if they previously logged in with Google
                    try {
                        const loginResult: any = await sdk.auth.login("customer", "emailpass", {
                            email,
                            password: googlePassword,
                        })
                        const loginToken = typeof loginResult === 'string'
                            ? loginResult
                            : loginResult?.token || String(loginResult)

                        if (!loginToken || typeof loginToken !== 'string') {
                            throw new Error("Failed to get authentication token")
                        }

                        // Successfully logged in with Google password
                        token = loginToken
                        await setAuthToken(token)

                        // Get customer info
                        const { getAuthHeaders } = await import("@lib/data/cookies")
                        const headers = await getAuthHeaders()

                        try {
                            const { retrieveCustomer } = await import("@lib/data/customer")
                            customer = await retrieveCustomer()
                        } catch (err) {
                            // Customer might not have profile yet, that's okay
                            console.log("Could not retrieve customer profile:", err)
                        }

                        // Revalidate cache and transfer cart
                        const customerCacheTag = await getCacheTag("customers")
                        revalidateTag(customerCacheTag)
                        await transferCart()

                        return NextResponse.json({
                            success: true,
                            customer: customer || null
                        })
                    } catch (loginError: any) {
                        console.error("Login error:", loginError)
                        // Login failed - user exists but registered with email/password
                        // They need to use their original password
                        return NextResponse.json(
                            {
                                error: "An account with this email already exists. Please login with your email and password instead.",
                                requiresEmailPassword: true
                            },
                            { status: 400 }
                        )
                    }
                } else {
                    // Registration failed for other reasons (validation, network, etc.)
                    console.error("Registration error (not user exists):", regError)
                    throw regError
                }
            }

            // Step 2: Registration was successful, now login to get token
            if (registrationSuccess) {
                const registerTokenResult: any = await sdk.auth.login("customer", "emailpass", {
                    email,
                    password: googlePassword,
                })

                const registerToken = typeof registerTokenResult === 'string'
                    ? registerTokenResult
                    : registerTokenResult?.token || String(registerTokenResult)

                if (!registerToken || typeof registerToken !== 'string') {
                    throw new Error("Failed to get authentication token")
                }

                token = registerToken
                await setAuthToken(token)

                // Step 3: Create customer profile
                const { getAuthHeaders } = await import("@lib/data/cookies")
                const headers = await getAuthHeaders()

                try {
                    const { customer: newCustomer } = await sdk.store.customer.create(
                        {
                            email,
                            first_name: given_name || "",
                            last_name: family_name || "",
                        },
                        {},
                        headers
                    )
                    customer = newCustomer
                } catch (createError: any) {
                    // Customer creation might fail if profile already exists
                    // Try to retrieve existing customer instead
                    if (isUserExistsError(createError)) {
                        try {
                            const { retrieveCustomer } = await import("@lib/data/customer")
                            customer = await retrieveCustomer()
                        } catch (retrieveError) {
                            console.error("Could not retrieve customer:", retrieveError)
                            // Continue anyway - auth is successful
                        }
                    } else {
                        // Other error creating customer - log but continue
                        console.error("Error creating customer profile:", createError)
                        // Auth is successful, so we continue
                    }
                }
            }

            if (!token) {
                throw new Error("Authentication token is missing")
            }

            // Token is already set above, just revalidate cache and transfer cart
            // Revalidate customer cache
            const customerCacheTag = await getCacheTag("customers")
            revalidateTag(customerCacheTag)

            // Transfer cart
            await transferCart()

            return NextResponse.json({
                success: true,
                customer: customer || null
            })
        } catch (error: any) {
            console.error("Google OAuth error:", error)
            console.error("Error details:", {
                message: error?.message,
                response: error?.response?.data,
                status: error?.response?.status,
                stack: error?.stack
            })

            // Provide more helpful error messages
            const errorMessage = error?.message || error?.toString() || "Authentication failed"
            const isNetworkError = errorMessage.includes("fetch") || errorMessage.includes("network")

            return NextResponse.json(
                {
                    error: isNetworkError
                        ? "Network error. Please check your connection and try again."
                        : errorMessage
                },
                { status: 500 }
            )
        }
    } catch (error: any) {
        console.error("Google OAuth error:", error)
        return NextResponse.json(
            { error: error.message || "Authentication failed" },
            { status: 500 }
        )
    }
}

