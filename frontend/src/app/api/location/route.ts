import { NextRequest, NextResponse } from "next/server"

/**
 * Location detection API using geojs.io
 * 
 * Note: geojs.io is completely free with:
 * - No API key required
 * - No rate limits
 * - Provides country, city, latitude, longitude, and timezone data
 * 
 * API endpoint: https://get.geojs.io/v1/ip/geo.json
 */
export async function GET(request: NextRequest) {
    try {
        // Fetch location data from geojs.io (completely free, no API key needed)
        const response = await fetch("https://get.geojs.io/v1/ip/geo.json", {
            headers: {
                Accept: "application/json",
            },
            next: {
                revalidate: 3600, // Cache for 1 hour
            },
        })

        if (!response.ok) {
            throw new Error(`Failed to fetch location: ${response.statusText}`)
        }

        const geoData = await response.json()

        // Map geojs.io response format to a more standard format
        // geojs.io returns: { country, city, latitude, longitude, timezone, ip }
        // We'll return it in a format similar to ipinfo.io for compatibility
        const locationData = {
            ip: geoData.ip,
            country: geoData.country,
            city: geoData.city,
            region: geoData.region || "",
            loc: geoData.latitude && geoData.longitude
                ? `${geoData.latitude},${geoData.longitude}`
                : "",
            latitude: geoData.latitude,
            longitude: geoData.longitude,
            timezone: geoData.timezone || "",
        }

        return NextResponse.json(locationData, {
            status: 200,
            headers: {
                "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
            },
        })
    } catch (error) {
        console.error("Error fetching location:", error)
        return NextResponse.json(
            {
                error: "Failed to fetch location data",
                message: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        )
    }
}
